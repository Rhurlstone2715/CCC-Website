import type { FC } from "hono/jsx";
import type { SessionUser } from "../auth.js";
import { COMPANY_EMAIL } from "../email.js";
import { Layout, PHONE_DISPLAY, PHONE_LINK } from "./layout.js";

// Update this date whenever the notice changes.
const LAST_UPDATED = "8 October 2026";

export const PrivacyPage: FC<{ user: SessionUser | null }> = ({ user }) => (
  <Layout title="Privacy notice" area="account" user={user}>
    <article class="prose">
      <div class="page-head">
        <p class="eyebrow">Cayman Crane Company</p>
        <h1>Privacy notice</h1>
        <p class="lede">
          What personal information this website collects, why we collect it, who it's shared with, and your rights under the Cayman Islands Data
          Protection Act (2021 Revision).
        </p>
        <p class="muted">Last updated {LAST_UPDATED}</p>
      </div>

      <section>
        <h2>Who we are</h2>
        <p>
          Cayman Crane Company Ltd. runs this website and is responsible for the personal information collected through it. Contact us about
          anything in this notice at <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a> or <a href={PHONE_LINK}>{PHONE_DISPLAY}</a>.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <b>Account details.</b> If you create an account: your name, email address and password, and your phone number and company if you give
            them. Passwords are stored only in a scrambled (hashed) form that can't be turned back into the password.
          </li>
          <li>
            <b>Booking requests.</b> Your name, company, email, phone number, requested start date and time, job site area and address, job
            details, the equipment you ask for, the rental terms shown to you, and the name and initials you type to sign them.
          </li>
          <li>
            <b>Rewards.</b> The amounts paid on bookings you made while logged in, and the points and tier they add up to.
          </li>
          <li>
            <b>Technical information.</b> A cookie that keeps you logged in, and your IP address, which we use briefly to block repeated failed
            log-ins and spam. Our hosting provider also keeps short-term logs of requests to the site, which include IP addresses.
          </li>
        </ul>
        <p>
          Your cart is saved in your own browser and isn't sent to us until you submit a booking request. We don't use advertising or analytics
          cookies, and this website doesn't collect card or bank details.
        </p>
      </section>

      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To review and reply to your booking requests, prepare your rental agreement and carry out the rental.</li>
          <li>To run your account and work out your rewards tier and discount.</li>
          <li>To keep records of bookings and payments for our business, accounting and legal obligations.</li>
          <li>To keep the website secure and stop misuse.</li>
        </ul>
        <p>We don't sell your personal information, and we don't use it for marketing without asking you first.</p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>We share personal information only with the service providers that run parts of this website, and only for that purpose:</p>
        <ul>
          <li>
            <b>Railway</b> (railway.com) hosts the website and its database.
          </li>
          <li>
            <b>Resend</b> (resend.com) delivers the website's emails, such as booking alerts, approved booking contracts and password reset links.
          </li>
        </ul>
        <p>
          Both store data on servers in the United States, so your information is transferred outside the Cayman Islands. Otherwise we only
          disclose personal information when the law requires us to.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          Your account stays until you ask us to delete it. Booking and payment records are kept for as long as we need them for the rental and
          for our business, accounting and legal record-keeping. If you ask us to delete your account, we delete your login and profile, and keep
          past booking records only where we still need them for those reasons. Server logs are kept for a short time by our hosting provider.
        </p>
      </section>

      <section>
        <h2>How we protect it</h2>
        <p>
          The website is served over an encrypted (HTTPS) connection. Passwords are hashed, log-in attempts are limited, and only Cayman Crane
          staff with admin accounts can see booking and customer records.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>Under the Data Protection Act you can:</p>
        <ul>
          <li>ask for a copy of the personal information we hold about you, which we'll provide within 30 days;</li>
          <li>ask us to correct information that's wrong;</li>
          <li>ask us to stop, or limit, how we use your information;</li>
          <li>tell us to stop using your information for direct marketing.</li>
        </ul>
        <p>
          You can also ask us to delete your account. If you have an account, you can update your details and change your password yourself on
          your <a href="/account/profile">account page</a>.
        </p>
        <p>
          To make a request, email <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a> or call <a href={PHONE_LINK}>{PHONE_DISPLAY}</a>. If
          you're unhappy with how we've handled your information, you can complain to the Office of the Ombudsman, which oversees data protection
          in the Cayman Islands, at{" "}
          <a href="https://ombudsman.ky" target="_blank" rel="noopener">
            ombudsman.ky
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Changes to this notice</h2>
        <p>If we change how we use personal information, we'll update this notice and the date at the top.</p>
      </section>
    </article>
  </Layout>
);
