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

The customer enters only item weight and approximate lifting height. Server allowances are fixed at 800 lb for RT cranes and 500 lb for boom trucks; per-machine total suspended weight is item weight plus that allowance. They are planning assumptions: CCC must verify actual handling gear before approving a lift. User-supplied handling weights, radii, headroom or setup flags are not calculation inputs.

Compare integer hundredths of a pound against `(published cell capacity − listed deduction) × 60`, avoiding rounding a load down into eligibility. No percentage override. Evaluate every populated chart cell and return the **largest documented radius** passing both the capacity and height screens for each machine. At equal radius, choose the shorter qualifying boom column. Never interpolate or extrapolate beyond reviewed cells. Sort machines by current published hourly rate, not total job cost or availability.

Height is only a geometry pre-screen: `floor((boom length × sin(published loaded angle) − 10 ft) / 5) × 5`. Positive boom-pin elevation is omitted, 10 ft is reserved and height rounded down to 5 ft. Require the entered approximate lifting height below that screen. **This formula is an implementation planning approximation, not manufacturer working-range validation or a clearance guarantee.** The customer no longer enters hook/rigging headroom. Actual headroom, deflection, obstacles and rigging must be confirmed by CCC. Scope remains main-boom stationary lifts on fully extended outriggers; removing the checkboxes does not approve other setups.

## Verification

Unit tests cover exact file hashes, all cell counts, unique coordinates, reference cells, fixed rigging allowances for each machine type, 60% cent boundaries, maximum qualifying radius, height constraints and invalid inputs. API integration verifies public read-only calculation, no-store, input/body validation, fail-closed catalog changes and no booking/email creation. Browser QA covers two-field desktop/mobile entry, chart angle rendering and no-match results.

## Animated vector

`public/crane-selector-vector.js` draws an articulated vector recreation of the user-supplied references: a black RT crane silhouette for RT models and a red flatbed boom truck for Altec AC25-95B and National 1400H, with the selected model name. Its boom transform is exactly the negative of the selected cell's published loaded angle (SVG y points down). Main boom length and chart radius are labelled; horizontal and angle-arc guides show the reference. The one-time extension/rotation animation settles to this transform. Reduced-motion preferences suppress animation. Accessible SVG name and visible caption explain that this is a schematic, not a scale lift drawing. No angle is inferred from the customer's height/radius triangle or from nominal tonnage.
