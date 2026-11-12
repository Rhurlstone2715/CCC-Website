# Company directory expansion for review

Prepared 12 November 2026. These changes are on `feature/government-companies`; they have not been published to the live website.

## Government hierarchy

The original 67 requested departments remain. The expansion adds 84 accounts, for 151 sub-companies under Cayman Islands Government. Each department keeps its own loyalty points and credits. Existing account IDs, bookings and reward balances are preserved.

All 143 unique names retrieved from every page of the [official government directory](https://gov.ky/directory) have a corresponding account or documented alias in [the coverage audit](../data/government-directory-coverage.csv). The [government public-authorities list](https://gov.ky/documents/35692/0/3%2BUpdated%2Blisting%2BMarch%2B2026%2B-%2Bfinal%2Brev.pdf/3d41516f-1293-cc37-4185-6f3d58bb1185?t=1774036974999) was also checked, adding the courts, Parliament, Ombudsman and commissions absent from the directory. Boards, committees and individual school sites remain within their responsible authority; this does not assert that every possible public body has its own account.

RCIPS uses `@rcips.ky`, confirmed against its [published employee privacy notice](https://www.rcips.ky/employee-privacy-policy). Its Office of the Commissioner of Police listing maps to the same RCIPS account. The Shipping Registry maps to MACI; the renamed Joy Marie Tibbetts Adult Training Centre maps to the existing Cayman Brac Adult Training Centre account. The three overseas government offices retain the combined account requested originally.

[Government email-domain audit](../data/government-company-domains.csv) lists each account, eligible domain, published email, source and any evidence limitations. Government units without a separately published email use only the verified parent `@gov.ky` domain. The Governor's Office publishes a shared UK FCDO address; the whole UK FCDO domain is deliberately not granted automatic Cayman membership.

## Cayman businesses

Added 20 local business listings: 6 pool contractors/service companies, 11 shipping/logistics businesses and 3 additional transport businesses. Several shipping companies also provide transport. Each has published evidence of Cayman operations and a company-specific email domain. These are publicly documented local businesses; their current legal registration and trade-licence status were not independently certified.

[Business names and domains](../data/cayman-pool-logistics-transport-companies.csv) include the published email, Cayman location and source. The [research data](../data/cayman-pool-logistics-transport-companies.json) also records exclusions. Personal/shared-provider addresses and unverified domains were not enabled. The similarly named Cayman Pool Construction & Service website belongs to a Florida business and was excluded.

Importing these listings creates company choices, not customer logins, email subscriptions or marketing consent. Existing companies with a matching domain or name are preserved rather than overwritten. Email verification remains required before company membership and loyalty access.

## Validation

All 87 tests passed against a fresh local PostgreSQL database, including the new migration. Desktop and mobile browser checks passed.

The integration tests cover company/domain recommendations across the researched government domains and all 20 businesses, RCIPS signup, rejection of personal/unrelated/spoofed domains, idempotent imports, preservation of existing company balances, and departmental loyalty isolation. Browser checks cover desktop and mobile signup recommendations and admin editing.
