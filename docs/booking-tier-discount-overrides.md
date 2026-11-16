# Admin booking-only rewards tier discounts

In Admin → Bookings → Add customer booking or Edit booking, use **Booking-only rewards discount**. Choose Member (0%), Silver (5%), Gold (10%) or Platinum (15%), regardless of the customer/company's earned tier. Explicit tier choices require an internal reason. Existing bookings default to keeping their booked discount; **Use the customer/company's earned tier** restores the account's actual current entitlement. New bookings default to the earned tier.

These choices affect only the booking's rewardTier and discountPercent. User/company points, reward credit and future checkout eligibility are not changed. Arbitrary percentages are rejected and public checkout cannot submit a tier override. Changing a price/discount without changing reservation dates or item quantities/durations preserves an existing confirmed multi-day schedule.

The existing financial rules apply: equipment-only discounts, whole-KYD rounding once, no discount on operator service, delivery or collection. Revised estimates retain the discount as the last line and are emailed through the existing workflow. Previous PDFs are archived; administrator, reason and before/after values are recorded in BookingRevision. Confirmed paid amounts remain explicit; an invoice discount does not silently record a refund or alter actual payment.

Example: KYD $985 equipment with a Silver booking discount gets KYD $49 off. Operator and transport fees remain unchanged. A Member customer stays a Member with the same earned points and receives only the authorized discount on this booking.
