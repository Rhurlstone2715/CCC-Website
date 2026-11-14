# Company logos on rewards badges

Researched and implemented 14 November 2026. The saved business/government directory
covers 275 company and department entries, including Paragon Builders. Official
company websites were checked for 161 distinct domains; matching published company
profiles and the Cayman Contractors Association membership directory supplied
additional clearly identified artwork. All 145 retained logo images were visually
reviewed. Partner logos, social icons, loading indicators, generic directory marks
and photographs were removed. The source URL and original image URL for each logo
are in [the manifest](../public/assets/company-logos/manifest.json).

[Coverage CSV](../public/company-logo-coverage.csv): 259 directory entries use their
own or shared official brand, four departments use their government parent brand,
and 12 businesses use initials because a logo could not be verified. This is the
researched directory, not a claim that every future customer-registered business
has a verifiable public logo. Single-email businesses without a registered work
domain use initials until an admin uploads their logo. No consumer mailbox logo is
substituted for a business logo.

The unresolved businesses are Cayman Mechanical Company Ltd., Clan Construction
Ltd., GMC General Contractors Ltd., Handymen Can, MAC Plumbing and Maintenance
Services Ltd., Mr. Power Guy, Parsons Air Conditioning, United Contracting,
Splash Inc., London House Condominiums, The Reef Beach Resort Grand Cayman and
The Westin Grand Cayman Seven Mile Beach Resort & Spa. Their websites and available
company listings were checked; no unrelated or generic logo was assigned.

Only verified company membership determines the rewards brand. Typing a company
name or retaining a stale/unrelated company ID does not confer its branding or
rewards. Department logos take priority over the parent company logo, and
separately pooled government rewards remain separate. No points, tiers, booking
history or company eligibility rules are changed.

Admin → Companies provides image uploads for each company and department. Only
admins can upload; images must be <= 1 MB and are decoded/rasterized to WebP before
being served. Admin overrides are retained rather than overwritten by automatic
refreshes. Public brand artwork is served locally; customer browsers do not load
tracking/logo services or third-party website images.

A background lookup checks new/missing registered work domains for clear official
header/brand logos. It checks public HTTPS destinations, pins validated public DNS
addresses, rechecks redirects, caps response/pixel sizes and stores only rasterized
artwork. Failed lookups retain the initials/parent fallback and retry after a week;
successful cached images refresh after 30 days. The offline research command can
use the execution environment's HTTPS proxy; production lookups use pinned public
connections. Profile rendering never waits on external website requests.

Validation: PostgreSQL integration tests cover company membership isolation,
unverified accounts, shared staff badges, department overrides, points preservation,
admin-only uploads and safe image serving. Network/parser tests reject private and
metadata destinations and exclude partner artwork/photos. Desktop and mobile
browser checks verify actual Paragon and RCIPS images, points, fallback initials,
outsider isolation and layout without horizontal overflow.
