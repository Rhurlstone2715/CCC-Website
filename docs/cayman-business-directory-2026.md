# Cayman business directory expansion — 28 November 2026

The research list covers **374 Cayman Islands businesses**, including the existing 122-entry researched business directory and 252 additional candidates (some candidates, including Paragon and J&R, may already have customer-created company accounts). The import adds only missing entries. This is a broad public-source directory, not an exhaustive legal company register or certification of current trade licensing.

Coverage includes construction, renovation, electrical, mechanical/HVAC, plumbing, landscaping, architecture, interior design, brokerage, property/strata management, engineering, surveying, roofing, building supplies, pools, security, cleaning, flooring, windows and related services. Government accounts and their departmental rewards remain intact.

## Sources and downloadable list

- [RenuSpace local trades directory](https://www.renuspace.ky/): checked all 55 linked trade categories, yielding 185 unique business profiles. Platform/developer promotional entries were excluded.
- [CIREBA office directory](https://www.cireba.com/find-cayman-real-estate-company): all 40 listed brokerage offices were checked. Firms already represented by the same name/domain remain one account.
- [Cayman Contractors Association regular members](https://www.cca.ky/members-directory/regular-members) and [associate members](https://www.cca.ky/members-directory/associate-members).
- [Cayman Resident building professionals](https://caymanresident.com/housing/building-a-home/building-professionals/architects), trades, gardening and property management listings.
- [CASE engineering directory](https://www.casecayman.org/engineering) and published company websites/contact pages.

Each record retains its sources and observed trading-name aliases in [the research data](../data/cayman-business-directory-2026.json). The [CSV](../public/cayman-business-directory-2026.csv) contains company names, @domains, registration rules, categories, logo URLs and sources. The [searchable preview](../public/downloads/cayman-company-directory-2026.html) displays the logos.

## Domains and single-email accounts

264 researched listings have a published company-specific email domain; two also have an additional verified trading-name domain. Website domains alone are not used as proof of email ownership. Consumer mailboxes, shared Cayman ISP domains (`candw.ky`, `telecayman.ky`, `easyconnect.ky`) and global franchise domains that cannot establish a specific Cayman office were not assigned as shared membership domains.

110 listings have no verified work domain. They import with no owner email and no customer login. The first customer to verify their signup email can claim such a listing; a conditional database update allows only one winning email, including simultaneous verification attempts. Their email domain is not automatically promoted to shared staff access. Later unrelated emails cannot join. Existing owner logins, company IDs and rewards remain intact. Verified work domains can be added separately without replacing a legacy owner email. This resolved the older GreenTech and J&R account settings and also supports the verified Label C and Trio alternative domains. Other personal email addresses still cannot join. Admins can add or revoke these extra verified staff domains; revocation unlinks affected memberships while preserving historical bookings and the existing owner.

Trading-name aliases (for example Label C/Cynthia Tranel, Vigoro branches and company suffix variations) are reconciled before import. Alias-aware validation also prevents creating another signup/admin entry under a researched alternative name. Public signup search returns eligible names/domains only and never reveals a company's single allowed email address.

## Logos

**307 businesses have verified artwork delivered as transparent WebP cutouts.** Original lettering and colours are preserved; no generated/reinvented brand marks are used. Native alpha is retained, and flat edge-connected mattes are removed without erasing enclosed white brand details. White wordmarks receive a contrasting display tile. Company/admin-uploaded overrides retain priority. Domainless listings can use a verified logo by their canonical name; an unrelated work-domain company cannot obtain another company's branding merely by sharing its name.

**67 entries have no verified transparent artwork available**. They retain any prior verified artwork or the existing initials fallback; unrelated icons or fabricated logos are not substituted. The complete unresolved list is in [the coverage audit](../data/cayman-business-logo-audit-2026.json). Admins can upload an authentic logo later. External images are cached locally rather than hotlinked to customer browsers.

## Preservation and validation

The migration is additive and idempotent. It checks normalized names, researched aliases, company domains and government sub-company domains, preserving existing IDs, users, archives, booking links, reward balances and ownership restrictions. It creates no customer accounts, email subscriptions, bookings or messages.

255 automated tests passed, including simultaneous domainless claims, owner/work-domain restrictions, alias/import idempotence, rewards preservation, private email isolation and logo processing. The directory read-back audit mapped all 374 research entries without missing or duplicate company matches in the local verification database. The same read-only audit runs at application startup for deployment verification. Mobile and desktop browser checks cover admin search, the preview and signup suggestions.
