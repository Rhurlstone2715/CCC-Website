import { Hono, type Context } from "hono";
import type { FC } from "hono/jsx";
import {
  type AppEnv,
  type SessionUser,
  EMAIL_PATTERN,
  PASSWORD_MIN,
  createResetLink,
  currentUser,
  endAllSessions,
  endSession,
  findValidReset,
  hashPassword,
  normalizeEmail,
  passwordProblem,
  requireCustomer,
  safeNext,
  startSession,
  verifyAgainstDummy,
  verifyPassword,
} from "../auth.js";
import { bookingRef } from "../bookings.js";
import { prisma } from "../db.js";
import { customerEmailsEnabled, sendEmail } from "../email.js";
import { clientIp, createLimiter } from "../ratelimit.js";
import { TIERS, rewardsForUser, type Rewards } from "../rewards.js";
import { Field, Layout, Notice, PHONE_DISPLAY, PHONE_LINK, StatusBadge, WHATSAPP_LINK, caymanDate, money } from "../views/layout.js";

export const account = new Hono<AppEnv>();

const loginByIp = createLimiter(20, 15 * 60_000);
const loginByEmail = createLimiter(10, 15 * 60_000);
const signupByIp = createLimiter(10, 60 * 60_000);
const forgotByIp = createLimiter(5, 15 * 60_000);

export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Shared by the customer and admin login forms.
export async function attemptLogin(c: Context<AppEnv>, emailInput: string, password: string): Promise<{ user: SessionUser } | { error: string }> {
  const email = normalizeEmail(emailInput);
  if (loginByIp(clientIp(c)) || loginByEmail(email)) {
    return { error: "Too many login attempts. Wait 15 minutes and try again." };
  }
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!user) {
    await verifyAgainstDummy(password);
    return { error: "That email and password don't match an account." };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password don't match an account." };
  }
  await startSession(c, user.id);
  return { user };
}

type ProfileInput = { name: string; email: string; phone: string | null; company: string | null };

export function parseProfile(body: Record<string, unknown>): ProfileInput | { error: string; values: ProfileInput } {
  const values = {
    name: text(body.name),
    email: normalizeEmail(text(body.email)),
    phone: text(body.phone) || null,
    company: text(body.company) || null,
  };
  if (!values.name || values.name.length > 120) return { error: "Enter your name.", values };
  if (!EMAIL_PATTERN.test(values.email) || values.email.length > 254) return { error: "Enter a valid email address.", values };
  if ((values.phone?.length ?? 0) > 40) return { error: "That phone number is too long.", values };
  if ((values.company?.length ?? 0) > 120) return { error: "That company name is too long.", values };
  return values;
}

const NOTICES: Record<string, { tone: "success" | "info"; text: string }> = {
  welcome: { tone: "success", text: "Your account is ready. Book while you're logged in and every paid rental counts toward your rewards." },
  saved: { tone: "success", text: "Your details are saved." },
  "password-changed": { tone: "success", text: "Your password has been changed." },
  "password-reset": { tone: "success", text: "Your password has been reset and you're logged in." },
};

// ---------- Log in / sign up ----------

type AuthState = {
  next: string;
  loginEmail?: string;
  loginError?: string;
  signup?: Partial<ProfileInput>;
  signupError?: string;
};

const AuthPage: FC<AuthState> = ({ next, loginEmail, loginError, signup, signupError }) => (
  <Layout title="Log in or create an account" area="account">
    <div class="page-head">
      <p class="eyebrow">Cayman Crane Rewards</p>
      <h1>Your account</h1>
      <p class="lede">
        Log in to see your rewards tier and booking history. Your discount is applied to equipment at checkout automatically.
      </p>
    </div>
    <div class="grid-2">
      <section class="card" aria-labelledby="login-title">
        <h2 id="login-title">Log in</h2>
        <form class="form" method="post" action="/account/login">
          {loginError ? <Notice tone="error">{loginError}</Notice> : null}
          <input type="hidden" name="next" value={next} />
          <Field label="Email" name="email" type="email" value={loginEmail} required autocomplete="email" />
          <Field label="Password" name="password" type="password" required autocomplete="current-password" />
          <div class="form-actions">
            <button class="button primary" type="submit">
              Log in
            </button>
            <a class="text-link" href="/account/forgot">
              Forgot your password?
            </a>
          </div>
        </form>
      </section>
      <section class="card" aria-labelledby="signup-title">
        <h2 id="signup-title">Create an account</h2>
        <p class="muted">Earn one point for every CI$1 of paid rentals. Silver unlocks 5% off at CI$5,000.</p>
        <form class="form" method="post" action="/account/signup">
          {signupError ? <Notice tone="error">{signupError}</Notice> : null}
          <input type="hidden" name="next" value={next} />
          <Field label="Full name" name="name" value={signup?.name} required autocomplete="name" maxlength={120} />
          <Field label="Email" name="email" type="email" value={signup?.email} required autocomplete="email" maxlength={254} />
          <Field label="Phone" name="phone" type="tel" value={signup?.phone} autocomplete="tel" maxlength={40} />
          <Field label="Company" name="company" value={signup?.company} autocomplete="organization" maxlength={120} />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            autocomplete="new-password"
            minlength={PASSWORD_MIN}
            hint={`At least ${PASSWORD_MIN} characters.`}
          />
          <div class="form-actions">
            <button class="button primary" type="submit">
              Create account
            </button>
          </div>
        </form>
      </section>
    </div>
  </Layout>
);

account.get("/", async c => {
  const next = safeNext(c.req.query("next"), "/account/profile");
  if (await currentUser(c)) return c.redirect(next);
  return c.html(<AuthPage next={next} />);
});

account.post("/login", async c => {
  const body = await c.req.parseBody();
  const next = safeNext(body.next, "/account/profile");
  const email = text(body.email);
  const result = await attemptLogin(c, email, typeof body.password === "string" ? body.password : "");
  if ("error" in result) return c.html(<AuthPage next={next} loginEmail={email} loginError={result.error} />, 401);
  return c.redirect(next);
});

account.post("/signup", async c => {
  const body = await c.req.parseBody();
  const next = safeNext(body.next, "/account/profile");
  const profile = parseProfile(body);
  const password = typeof body.password === "string" ? body.password : "";
  const fail = (error: string, values: Partial<ProfileInput>, status: 400 | 409 | 429 = 400) =>
    c.html(<AuthPage next={next} signup={values} signupError={error} />, status);

  if (signupByIp(clientIp(c))) return fail("Too many new accounts from this connection. Try again later.", { name: text(body.name), email: text(body.email) }, 429);
  if ("error" in profile) return fail(profile.error, profile.values);
  const problem = passwordProblem(password);
  if (problem) return fail(problem, profile);
  if (await prisma.user.findUnique({ where: { email: profile.email } })) {
    return fail("There's already an account with that email. Log in, or reset your password if you've forgotten it.", profile, 409);
  }

  const user = await prisma.user.create({ data: { ...profile, passwordHash: await hashPassword(password) } });
  await startSession(c, user.id);
  return c.redirect(next === "/account/profile" ? "/account/profile?notice=welcome" : next);
});

account.post("/logout", async c => {
  const body = await c.req.parseBody();
  await endSession(c);
  return c.redirect(safeNext(body.next, "/rentals"));
});

// ---------- Profile ----------

const RewardsCard: FC<{ rewards: Rewards }> = ({ rewards }) => (
  <section class="card rewards-card" aria-labelledby="rewards-title">
    <p class="eyebrow" id="rewards-title">
      Rewards tier
    </p>
    <div class={`tier-name tier-${rewards.tier.toLowerCase()}`}>{rewards.tier}</div>
    <p class="progress-label">
      {rewards.discountPercent ? `${rewards.discountPercent}% off equipment rentals at checkout` : "Your discount starts at Silver"}
    </p>
    <div class="rewards-stats">
      <div>
        <b>{rewards.points.toLocaleString("en-US")}</b>
        <small>points</small>
      </div>
      <div>
        <b>{money(rewards.spendCents)}</b>
        <small>paid rentals</small>
      </div>
    </div>
    {rewards.nextTier ? (
      <>
        <div class="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={rewards.progressPercent} aria-label={`Progress to ${rewards.nextTier}`}>
          <span style={`width:${rewards.progressPercent}%`}></span>
        </div>
        <p class="progress-label">
          {money(rewards.amountToNextCents)} more to {rewards.nextTier}
        </p>
      </>
    ) : (
      <p class="progress-label">You've reached the highest tier.</p>
    )}
    <ol class="tier-ladder">
      {TIERS.map(t => (
        <li aria-current={t.name === rewards.tier ? "true" : undefined}>
          <b>{t.name}</b>
          {t.discountPercent ? `${t.discountPercent}% off · ${money(t.minCents)}` : "Starting tier"}
        </li>
      ))}
    </ol>
  </section>
);

type ProfileState = {
  notice?: string;
  detailsError?: string;
  detailsValues?: Partial<ProfileInput>;
  passwordError?: string;
};

async function renderProfile(c: Context<AppEnv>, user: SessionUser, state: ProfileState, status: 200 | 400 | 401 | 409 = 200) {
  const [rewards, bookings] = await Promise.all([
    rewardsForUser(user.id),
    prisma.booking.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const notice = state.notice ? NOTICES[state.notice] : undefined;
  const details = state.detailsValues ?? user;
  const firstName = user.name.split(/\s+/)[0];

  return c.html(
    <Layout title="Your account" area="account" user={user}>
      {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      <div class="page-head">
        <p class="eyebrow">Your account</p>
        <h1>Hi, {firstName}</h1>
        <p class="lede">Book while you're logged in so every paid rental counts toward your next tier.</p>
      </div>
      <div class="grid-2">
        <div class="stack">
          <RewardsCard rewards={rewards} />
          <a class="button primary" href="/rentals#catalog">
            Browse equipment
          </a>
        </div>
        <section class="card" aria-labelledby="bookings-title">
          <div class="card-head">
            <h2 id="bookings-title">Your bookings</h2>
            <span class="muted">{bookings.length ? `${bookings.length} total` : null}</span>
          </div>
          {bookings.length ? (
            <ul class="booking-list">
              {bookings.map(b => (
                <li>
                  <div class="booking-row">
                    <div>
                      <b>{bookingRef(b.id)}</b> <span class="muted">· {caymanDate(b.createdAt, false)}</span>
                    </div>
                    <StatusBadge status={b.status} audience="customer" />
                  </div>
                  {b.discountPercent || b.amountPaidCents ? (
                    <p class="booking-meta">
                      {b.discountPercent ? `${b.rewardTier} discount (${b.discountPercent}%)` : null}
                      {b.discountPercent && b.amountPaidCents ? " · " : null}
                      {b.amountPaidCents ? `Paid ${money(b.amountPaidCents)}` : null}
                    </p>
                  ) : null}
                  <details>
                    <summary>View request</summary>
                    <pre class="request">{b.requestText}</pre>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <div class="empty">
              <p>No bookings yet. Requests you send while logged in will show up here.</p>
              <a class="text-link" href="/rentals#catalog">
                Browse equipment
              </a>
            </div>
          )}
        </section>
      </div>
      <div class="grid-2 mt-4">
        <section class="card" aria-labelledby="details-title">
          <h2 id="details-title">Your details</h2>
          <p class="muted">We use these to fill in your booking requests.</p>
          <form class="form" method="post" action="/account/profile">
            {state.detailsError ? <Notice tone="error">{state.detailsError}</Notice> : null}
            <Field label="Full name" name="name" value={details.name} required autocomplete="name" maxlength={120} />
            <Field label="Email" name="email" type="email" value={details.email} required autocomplete="email" maxlength={254} />
            <Field label="Phone" name="phone" type="tel" value={details.phone} autocomplete="tel" maxlength={40} />
            <Field label="Company" name="company" value={details.company} autocomplete="organization" maxlength={120} />
            <div class="form-actions">
              <button class="button secondary" type="submit">
                Save details
              </button>
            </div>
          </form>
        </section>
        <section class="card" aria-labelledby="password-title">
          <h2 id="password-title">Change password</h2>
          <form class="form" method="post" action="/account/password">
            {state.passwordError ? <Notice tone="error">{state.passwordError}</Notice> : null}
            <Field label="Current password" name="current" type="password" required autocomplete="current-password" />
            <Field
              label="New password"
              name="password"
              type="password"
              required
              autocomplete="new-password"
              minlength={PASSWORD_MIN}
              hint={`At least ${PASSWORD_MIN} characters. Changing it logs you out on other devices.`}
            />
            <div class="form-actions">
              <button class="button secondary" type="submit">
                Change password
              </button>
            </div>
          </form>
        </section>
      </div>
    </Layout>,
    status,
  );
}

account.get("/profile", requireCustomer, async c => {
  return renderProfile(c, (await currentUser(c))!, { notice: c.req.query("notice") });
});

account.post("/profile", requireCustomer, async c => {
  const user = (await currentUser(c))!;
  const profile = parseProfile(await c.req.parseBody());
  if ("error" in profile) return renderProfile(c, user, { detailsError: profile.error, detailsValues: profile.values }, 400);
  if (profile.email !== user.email && (await prisma.user.findUnique({ where: { email: profile.email } }))) {
    return renderProfile(c, user, { detailsError: "Another account already uses that email.", detailsValues: profile }, 409);
  }
  await prisma.user.update({ where: { id: user.id }, data: profile });
  return c.redirect("/account/profile?notice=saved");
});

account.post("/password", requireCustomer, async c => {
  const user = (await currentUser(c))!;
  const body = await c.req.parseBody();
  const current = typeof body.current === "string" ? body.current : "";
  const password = typeof body.password === "string" ? body.password : "";
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(current, record.passwordHash))) {
    return renderProfile(c, user, { passwordError: "Your current password isn't right." }, 401);
  }
  const problem = passwordProblem(password);
  if (problem) return renderProfile(c, user, { passwordError: problem }, 400);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  await endAllSessions(user.id);
  await startSession(c, user.id);
  return c.redirect("/account/profile?notice=password-changed");
});

// ---------- Password reset ----------

const ContactForReset: FC = () => (
  <p>
    Call <a href={PHONE_LINK}>{PHONE_DISPLAY}</a> or{" "}
    <a href={WHATSAPP_LINK} target="_blank" rel="noopener">
      message us on WhatsApp
    </a>{" "}
    and we'll send you a link to reset your password.
  </p>
);

const ForgotPage: FC<{ sent?: boolean; error?: string }> = ({ sent, error }) => (
  <Layout title="Reset your password" area="account">
    <div class="narrow">
      <div class="page-head">
        <p class="eyebrow">Your account</p>
        <h1>Reset your password</h1>
      </div>
      <section class="card">
        {!customerEmailsEnabled() ? (
          <>
            <h2>We'll reset it for you</h2>
            <div class="muted">
              <ContactForReset />
            </div>
          </>
        ) : sent ? (
          <Notice tone="success">
            <p>If there's an account for that email, we've sent it a reset link. The link works for one hour.</p>
            <p>Nothing arrived? Check your spam folder, or call {PHONE_DISPLAY}.</p>
          </Notice>
        ) : (
          <form class="form flush" method="post" action="/account/forgot">
            {error ? <Notice tone="error">{error}</Notice> : null}
            <p class="muted flush">Enter the email on your account and we'll send you a link to choose a new password.</p>
            <Field label="Email" name="email" type="email" required autocomplete="email" />
            <div class="form-actions">
              <button class="button primary" type="submit">
                Send reset link
              </button>
              <a class="text-link" href="/account">
                Back to log in
              </a>
            </div>
          </form>
        )}
      </section>
    </div>
  </Layout>
);

account.get("/forgot", c => c.html(<ForgotPage />));

account.post("/forgot", async c => {
  if (!customerEmailsEnabled()) return c.html(<ForgotPage />);
  if (forgotByIp(clientIp(c))) return c.html(<ForgotPage error="Too many requests. Wait 15 minutes and try again." />, 429);
  const email = normalizeEmail(text((await c.req.parseBody()).email));
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (user) {
    const link = await createResetLink(c, user.id, 1);
    await sendEmail({
      to: user.email,
      subject: "Reset your Cayman Crane password",
      text: [
        `Hi ${user.name.split(/\s+/)[0]},`,
        "",
        "Use this link to choose a new password for your Cayman Crane account. It works for one hour.",
        "",
        link,
        "",
        "If you didn't ask for this, you can ignore this email and your password stays the same.",
        "",
        "Cayman Crane Company",
      ].join("\n"),
    });
  }
  // Same response either way, so this page can't be used to check who has an account.
  return c.html(<ForgotPage sent />);
});

const ResetPage: FC<{ token?: string; error?: string; invalid?: boolean }> = ({ token, error, invalid }) => (
  <Layout title="Choose a new password" area="account">
    <div class="narrow">
      <div class="page-head">
        <p class="eyebrow">Your account</p>
        <h1>Choose a new password</h1>
      </div>
      <section class="card">
        {invalid ? (
          <>
            <Notice tone="error">This reset link has expired or has already been used.</Notice>
            <a class="text-link" href="/account/forgot">
              Get a new link
            </a>
          </>
        ) : (
          <form class="form flush" method="post" action="/account/reset">
            {error ? <Notice tone="error">{error}</Notice> : null}
            <input type="hidden" name="token" value={token} />
            <Field
              label="New password"
              name="password"
              type="password"
              required
              autocomplete="new-password"
              minlength={PASSWORD_MIN}
              hint={`At least ${PASSWORD_MIN} characters.`}
            />
            <div class="form-actions">
              <button class="button primary" type="submit">
                Save new password
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  </Layout>
);

account.get("/reset", async c => {
  const token = c.req.query("token") ?? "";
  if (!(await findValidReset(token))) return c.html(<ResetPage invalid />, 400);
  return c.html(<ResetPage token={token} />);
});

account.post("/reset", async c => {
  const body = await c.req.parseBody();
  const token = text(body.token);
  const password = typeof body.password === "string" ? body.password : "";
  const reset = await findValidReset(token);
  if (!reset) return c.html(<ResetPage invalid />, 400);
  const problem = passwordProblem(password);
  if (problem) return c.html(<ResetPage token={token} error={problem} />, 400);

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await hashPassword(password) } }),
    prisma.passwordReset.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: reset.userId } }),
  ]);
  await startSession(c, reset.userId);
  return c.redirect("/account/profile?notice=password-reset");
});
