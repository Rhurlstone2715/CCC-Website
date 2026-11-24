# Crane selector chart review — 23 November 2026

This is a preliminary customer planning aid, never a lift plan or operating chart. Scope: stationary lifts, main boom only, fully extended outriggers, level supporting surface, 360° chart unless the specified stabilizer requirements cannot be met. Jibs, partial outriggers, on-rubber/pick-and-carry, tandem/personnel lifts and uncertain conditions require direct CCC review.

## Sources and transcription

Reviewed all pages of the six PDFs linked by the current fleet catalog, including capacity tables, deductions, reeving, range diagrams and notes. Used vector text extraction for Grove/National cells and visual transcription of the scanned Terex/Altec/P&H tables. Only populated positive-angle main-boom cells are included. Exact source SHA-256 hashes, chart codes, PDF page numbers and setup notes accompany the 556 cells in `data/crane-selector-charts.json`. PDF page numbers are one-based, not printed page labels.

| Fleet model | PDF pages reviewed | Capacity page used | Required setup | Cells |
| --- | --- | --- | --- | --- |
| Grove RT890E | 24 | 10 | Mode B, 22,000 lb counterweight, 24 ft full outrigger spread, 360° | 123 |
| Terex RT175 | 14 | 8 | Four-section boom, 15,200 lb counterweight, full outriggers, LMI 04, 360° | 114 |
| Grove RT635C | 22 | 7 | 5,787 lb counterweight, 100% outriggers, 360° | 103 |
| National 1400H | 12 | 8 | Series 14127H, 127 ft boom, 24 ft 6 in full span; forward lifts require front stabilizer | 68 |
| Altec AC25-95B | 4 | 3 | 95 ft boom, 18 ft 6 in main/auxiliary outrigger span; 360° requires front bumper outrigger | 74 |
| P&H Omega 40 (existing rt40 ID) | 5 | 5 | Full 22 ft outriggers, 360° main boom, powered sections extended equally | 74 |

Files are under `public/assets/load-charts/`. The selector also checks the catalog model name and chart path. Changed/unmatched/missing PDFs fail closed. Source hashes are verified once per process startup; publish updated data and restart when replacing a PDF. No nominal-capacity fallback exists.

## Deductions

- P&H Omega 40: owner confirmed the listing previously named Terex RT40 is this machine. Uploaded P&H brochure replaces the mismatched Voltas PDF. Use only page 5 main-boom **360°** capacities (not higher front-only values); omit lattice extension, jib and on-rubber tables. Main-boom columns 32.5–81.5 ft have manual section retracted; 106 ft has manual section extended. The 32.5 ft setting requires telescope cylinders fully retracted against stops. The 800 lb rigging allowance includes the 730 lb four-sheave block on page 4, not a second deduction of that same block. Actual additional accessories/unused hooks require CCC review. Preserve product ID, rates, inventory and historical booking/document snapshots; redirect the former chart URL to the uploaded PDF.
- RT890E: conservatively deduct 133 lb auxiliary nose weight. The 800 lb planning allowance is added separately; actual block, slings, rope and accessories require CCC verification. Erected jibs excluded.
- RT175: chart notes say other deductions are included; the fixed 800 lb handling allowance still counts. Do not take optional 150 lb auxiliary-head removal add-back. Erected-extension setups excluded.
- RT635C: use larger 641 lb stowed telescopic-jib deduction plus 143 lb auxiliary nose = 784 lb. This is conservative versus the 421 lb fixed-jib deduction. The 58 ft column has the specified inner-mid extended / outer-mid and fly retracted configuration.
- National: retain published stowed-jib ratings; do not use the no-jib add-backs.
- Altec: stowed-jib deductions by 30/43/56/69/82/95 ft column are 825/550/425/350/300/250 lb. Use 95 ft maximum from the chart, regardless of conflicting catalog prose.

These assumptions must be checked against each actual unit, including counterweight, attachments, blocks, line parts, hoist rating and stabilizers. The brochures themselves defer to the unit's operating chart. A preliminary match is not confirmation that CCC's unit currently has the assumed configuration.

## Algorithm and limits

The customer enters item weight, approximate lifting height and required horizontal radius. Server allowances are fixed at 800 lb for RT cranes and 500 lb for boom trucks; per-machine total suspended weight is item weight plus that allowance. They are planning assumptions: CCC must verify actual handling gear before approving a lift. Handling allowances and setup scope remain fixed on the server.

Compare integer hundredths of a pound against `(published cell capacity − listed deduction) × 50`, avoiding rounding a load down into eligibility. No percentage override. Evaluate every populated chart cell and return the **largest documented radius** passing both the capacity and height screens for each machine. At equal radius, choose the shorter qualifying boom column. Never interpolate or extrapolate beyond reviewed cells. Rank eligible machines by the suitability policy below, independently of hourly prices; this does not establish availability.

Height is only a geometry pre-screen: `floor((boom length × sin(published loaded angle) − 10 ft) / 5) × 5`. Positive boom-pin elevation is omitted, 10 ft is reserved and height rounded down to 5 ft. Require the entered approximate lifting height below that screen. **This formula is an implementation planning approximation, not manufacturer working-range validation or a clearance guarantee.** The customer no longer enters hook/rigging headroom. Actual headroom, deflection, obstacles and rigging must be confirmed by CCC. Scope remains main-boom stationary lifts on fully extended outriggers; removing the checkboxes does not approve other setups.

## Verification

Unit tests cover exact file hashes, all cell counts, unique coordinates, reference cells, fixed rigging allowances for each machine type, 50% cent boundaries, maximum qualifying radius, height constraints and invalid inputs. API integration verifies public read-only calculation, no-store, input/body validation, fail-closed catalog changes and no booking/email creation. Browser QA covers two-field desktop/mobile entry, chart angle rendering and no-match results.

## Animated vector

`public/crane-selector-vector.js` draws an articulated vector recreation of the user-supplied references: the existing flatbed boom-truck geometry for Altec AC25-95B and National 1400H (RT models use the layered image renderer described below), with the selected model name. Its boom transform is exactly the negative of the selected cell's published loaded angle (SVG y points down). Main boom length and chart radius are labelled; horizontal and angle-arc guides show the reference. The one-time extension/rotation animation settles to this transform. Reduced-motion preferences suppress animation. Accessible SVG name and visible caption explain that this is a schematic, not a scale lift drawing. No angle is inferred from the customer's height/radius triangle or from nominal tonnage.

## Boom-truck single-part hook-ball restriction

Both boom trucks are restricted to one part of line with a hook ball. Retain the 500 lb total handling allowance including the ball (180 lb in both brochures); do not add that ball weight twice. National 1400H PDF page 7 gives 9,000 lb low-speed and 4,400 lb high-speed single-line ratings: use the lower 4,400 lb. Altec PDF page 3 gives 4,620 lb high-speed, 9,880 lb third-layer low-speed, 8,390 lb full-drum winch pull and 7,400 lb rotation-resistant single-line limit: use the lowest 4,620 lb. These conservative defaults avoid depending on an unconfirmed low-speed setting or drum layer.

Effective rated capacity is the lesser of the adjusted boom-chart cell and this single-line limit. Apply the 50% planning limit to that lesser rating. Total item plus 500 lb handling must fit it without rounding down. Thus the upper item-weight ceiling is 2,140 lb for National and 2,272 lb for Altec before any tighter radius/chart constraint. Missing single-line metadata fails closed for boom trucks. RT calculations are unchanged. Results show the single-line limit and a link to its source page; truck animations depict one line with a round hook ball. Actual rope, ball rating, condition, wraps and configuration still require operator confirmation.

## RT crane artwork layers

All four RT models use the same existing 1254 × 1254 RGBA transparent crane artwork. Grove RT890E and RT635C use its yellow pixels; Terex RT175 and P&H Omega 40 use a deterministic grey/white paint conversion. `scripts/build-rt-selector-layers.py` verifies the source hash, replaces only yellow/orange paint, asserts unchanged alpha and non-paint RGB, and clips body, base boom, sliding upper boom, hydraulic cylinder and hook PNG layers. No generation, tracing, inpainting or new replacement artwork is used. Fully transparent RGB is zeroed in clipped layers to reduce downloads without altering visible pixels.

`public/crane-selector-rt-image.js` places the source image's 45° boom axis at the selected chart angle. The chassis stays fixed while the upper boom layer slides outward for 1.4 seconds; the original hook pixels translate to follow the moving tip while remaining vertical. The original cylinder pixels are transformed between their chassis and boom pins. Geometry is fitted into the available viewport; it is a schematic, not a scale lift plan. Extension starts when the SVG enters view; there are no replay controls. Reduced-motion preferences show the final extended position immediately. Machine name, angle, chart boom length and radius remain labelled. Load calculations and source charts are unchanged. The full grey/white PNG is retained alongside its clipped layers for download.

## Boom-truck model colours

Only SVG paint attributes change: Altec AC25-95B has a red truck with white boom sections; National 1400H has a white truck with light-grey boom sections. Subtle outlines keep the light paint visible against the page. All existing paths, coordinates, wheel and cab geometry, hook-ball rigging, labels and animation timing/transforms are preserved. No image generation or redrawing is used. Browser comparison against the previous renderer confirmed identical non-paint geometry/animation attributes for both models; mobile and desktop rendering were checked.

## Single, simplified recommendation — 24 November 2026

The engine evaluates all six reviewed fleet models. The public endpoint returns one suitability-ranked recommendation, independently of hourly prices. Hidden models or changed source charts fail closed before selection. This is a preliminary suggestion for the entered weight and height, not an availability or site-radius approval.

Customer results show three key values: maximum qualifying chart radius for the entered load; approximate maximum lifting height from the existing conservative pre-screen for that selected setup; and maximum item load at the 50% limit after including the fixed handling allowance. `allowedItemLb = (effectiveRatedLb × 50 − riggingLb × 100) / 100`, using integer hundredths of pounds. The lower adjusted-chart/single-line rating continues to govern. Manufacturer full ratings remain labelled as before-margin values inside collapsed calculation details.

The shared `crane-selector-measures.js` adds red radius/height dimension lines and a separate circular top-view radius illustration to both RT and boom-truck diagrams. Height is marked approximate and refers only to this boom setup; it is not a newly verified manufacturer maximum or a clearance guarantee. Diagrams are schematic, not to scale. No replay button is rendered; extension starts automatically on entry into view. The user provides weight, approximate lifting height and required radius. CCC must confirm actual site geometry.

## Suitability ranking — 24 November 2026

Screen every model against the exact load-chart cells, required horizontal radius, height screen, 50% margin, handling allowance and applicable single-part line limit first. Radius must be positive and at most 125 ft (the largest reviewed radius). The API requires radius; the UI supplies a synchronised range bar and numeric field. Between chart radii, only cells at or beyond the requested radius qualify; capacity is never interpolated.

Rank passing candidates by appropriate equipment type (qualifying boom truck for light work), then ascending rated class. Ties prefer greater allowable item capacity, greater reach and stable ID. All eligibility comes first from actual chart cells at the requested radius/height and the hard 50% ceiling. Rental price is never a ranking input. This supersedes the earlier largest-class preference that repeatedly selected RT890E. Weights above 5,000 lb remain restricted to RT cranes. Every fleet model can be selected for genuine weight/height/radius inputs; no match goes to manual review without relaxing the ceiling.

The result retains the maximum qualifying chart-radius setup for the load/height, and now shows the requested site radius separately. The diagram illustrates that maximum setup, not an exact site plan. Changing inputs clears old results; an in-flight response for changed inputs is discarded.

## Customer wording — 24 November 2026

The customer selector does not display the numerical planning percentage in its introduction, diagrams, result labels, calculation details, no-match text or prefilled lift-review email. Labels say recommended item-weight / suspended-load limit. The server still enforces the exact same 50% limit on the lower adjusted-chart/single-line rating with rigging included; rating data, ranking and returned numerical limits are unchanged. This is a presentation-only change, not permission to use manufacturer full capacity in recommendations.

## Re-review and 50% limit — 24 November 2026

Reopened all six current source PDFs, extracted their text, visually rechecked all six selected main-boom capacity tables, and inspected the National page 7 single-part reeving/winch table and Altec page 3 single-part table. Existing 556 cell values, deductions and source file hashes are preserved. Both truck profiles explicitly use single-part hook-ball configurations only. The conservative high-speed limits remain National 4,400 lb and Altec 4,620 lb; no low-speed or multi-part increase is applied automatically. The 50% ceiling applies to the lower of adjusted boom-chart rating and single-line limit, with 500 lb rigging included. Thus absolute planning item maxima for these line limits are 1,700 lb National and 1,810 lb Altec, and radius/height may reduce these further. RT allowances remain 800 lb.

Regression tests exercise each of the six models as the selected recommendation, exact 50% cent boundaries, radius/height rejection, line-limit boundaries, price independence and changed-chart exclusion. Customer-facing text continues to omit the numerical planning percentage as previously requested; the calculation enforces 50% server-side.
