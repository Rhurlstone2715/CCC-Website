# Crane selector chart review — 23 November 2026

This is a preliminary customer planning aid, never a lift plan or operating chart. Scope: stationary lifts, main boom only, fully extended outriggers, level supporting surface, 360° chart unless the specified stabilizer requirements cannot be met. Jibs, partial outriggers, on-rubber/pick-and-carry, tandem/personnel lifts and uncertain conditions require direct CCC review.

## Sources and transcription

Reviewed all pages of the six PDFs linked by the current fleet catalog, including capacity tables, deductions, reeving, range diagrams and notes. Used vector text extraction for Grove/National cells and visual transcription of the scanned Terex/Altec tables. Only populated positive-angle main-boom cells are included. Exact source SHA-256 hashes, chart codes, PDF page numbers and setup notes accompany the 482 cells in `data/crane-selector-charts.json`. PDF page numbers are one-based, not printed page labels.

| Fleet model | PDF pages reviewed | Capacity page used | Required setup | Cells |
| --- | --- | --- | --- | --- |
| Grove RT890E | 24 | 10 | Mode B, 22,000 lb counterweight, 24 ft full outrigger spread, 360° | 123 |
| Terex RT175 | 14 | 8 | Four-section boom, 15,200 lb counterweight, full outriggers, LMI 04, 360° | 114 |
| Grove RT635C | 22 | 7 | 5,787 lb counterweight, 100% outriggers, 360° | 103 |
| National 1400H | 12 | 8 | Series 14127H, 127 ft boom, 24 ft 6 in full span; forward lifts require front stabilizer | 68 |
| Altec AC25-95B | 4 | 3 | 95 ft boom, 18 ft 6 in main/auxiliary outrigger span; 360° requires front bumper outrigger | 74 |
| Catalog Terex RT40 | 8 | Excluded | Linked file identifies Voltas VRT40; a model-matched, unit-confirmed chart is required | 0 |

Files are under `public/assets/load-charts/`. The selector also checks the catalog model name and chart path. Changed/unmatched/missing PDFs fail closed. Source hashes are verified once per process startup; publish updated data and restart when replacing a PDF. No nominal-capacity fallback exists.

## Deductions

- RT890E: conservatively deduct 133 lb auxiliary nose weight. Customer separately enters actual block, slings, extra suspended rope and lifting accessories. Erected jibs excluded.
- RT175: chart notes say other deductions are included; hook/handling weight still counts. Do not take optional 150 lb auxiliary-head removal add-back. Erected-extension setups excluded.
- RT635C: use larger 641 lb stowed telescopic-jib deduction plus 143 lb auxiliary nose = 784 lb. This is conservative versus the 421 lb fixed-jib deduction. The 58 ft column has the specified inner-mid extended / outer-mid and fly retracted configuration.
- National: retain published stowed-jib ratings; do not use the no-jib add-backs.
- Altec: stowed-jib deductions by 30/43/56/69/82/95 ft column are 825/550/425/350/300/250 lb. Use 95 ft maximum from the chart, regardless of conflicting catalog prose.

These assumptions must be checked against each actual unit, including counterweight, attachments, blocks, line parts, hoist rating and stabilizers. The brochures themselves defer to the unit's operating chart. A preliminary match is not confirmation that CCC's unit currently has the assumed configuration.

## Algorithm and limits

Total suspended load = entered item + all hook/block/rigging/accessory weight. Unknown or zero handling weight, unconfirmed full-outrigger space or special conditions produce manual review only. Compare integer hundredths of a pound against `(published cell capacity − listed deduction) × 60`, avoiding rounding a load down into eligibility. No percentage override.

Within each exact documented boom-length column, use the next larger radius. Never extrapolate beyond that column, interpolate capacities, fill blank cells or use nominal tonnage. Reject radii below the column's smallest documented radius as well. Choose the shortest surviving documented boom column per model. Sort models by current published hourly rate; this is not a total-job-cost optimization or an availability check.

Height is only a geometry pre-screen: `floor((boom length × sin(published loaded angle) − 10 ft) / 5) × 5`. Positive boom-pin elevation is omitted, 10 ft is reserved and height rounded down to 5 ft. Require entered lift attachment height plus hook/rigging headroom below that screen. **This formula is an implementation planning approximation, not a manufacturer working-range validation or a proven clearance guarantee.** Approximate loaded angles, boom deflection, obstacle geometry and actual hook clearance require CCC review. No lift can be approved or automatically booked by this tool.

Example: 10,000 lb item + 2,000 lb handling, 50 ft radius, 50 ft attachment height + 10 ft headroom yields RT890E preliminary match at the 89.8 ft column: 20,550 − 133 = 20,417 lb adjusted chart capacity; 60% = 12,250.20 lb, greater than 12,000 lb gross. The RT635C does not qualify at this radius despite its nominal tonnage. These are test inputs, not an approved lift.

## Verification

Unit tests cover exact file hashes, all cell counts and unique coordinates, reference cells, 60% cent-boundaries, outer-radius lookup, no extrapolation, missing weights, impossible reach and excluded setups. API integration verifies public read-only calculation, no-store, input/body validation, fail-closed catalog changes and no booking/email creation. Browser QA covers desktop/mobile, form submission and manual-review flow.

## Animated vector

`public/crane-selector-vector.js` draws an inline red crane or boom truck with the selected model name. Its boom transform is exactly the negative of the selected cell's published loaded angle (SVG y points down). Main boom length and chart radius are labelled; horizontal and angle-arc guides show the reference. The one-time extension/rotation animation settles to this transform. Reduced-motion preferences suppress animation. Accessible SVG name and visible caption explain that this is a schematic, not a scale lift drawing. No angle is inferred from the customer's height/radius triangle or from nominal tonnage.
