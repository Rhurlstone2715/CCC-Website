import assert from 'node:assert/strict';import{test}from'node:test';
import{rentalReminderEmail,rentalReminderSendAt,type RentalReminderInput}from'./rental-reminder-email.js';
const sample:RentalReminderInput={bookingId:1234,customerName:'Alex Morgan',confirmedEndDate:'2026-12-04',kind:'day-before',collectionIncluded:true,location:'17 Palm Road, Grand Cayman',baseUrl:'https://www.caymancrane.com',items:[{id:'diesel-mixer-9-cu-ft',name:'9 cu ft Towable Cement Mixer',quantity:2,term:'weekly',rates:{daily:40,weekly:175,monthly:600}}]};
test('two reminder dates use Cayman calendar days, including month/year boundaries',()=>{
 assert.equal(rentalReminderSendAt('2026-12-04','day-before').toISOString(),'2026-12-03T14:00:00.000Z');
 assert.equal(rentalReminderSendAt('2026-12-04','final-day').toISOString(),'2026-12-04T13:00:00.000Z');
 assert.equal(rentalReminderSendAt('2027-01-01','day-before').toISOString(),'2026-12-31T14:00:00.000Z');
 assert.equal(rentalReminderSendAt('2028-03-01','day-before').toISOString(),'2028-02-29T14:00:00.000Z');
 assert.throws(()=>rentalReminderSendAt('2026-02-30','final-day'));
});
test('collection wording differs by reminder and is never promised for customer return',()=>{
 assert.match(rentalReminderEmail(sample).text,/by end of day on Friday, 4 December 2026/);
 assert.match(rentalReminderEmail({...sample,kind:'final-day'}).text,/arrive by 4:00 pm today/);
 for(const kind of['day-before','final-day']as const){const e=rentalReminderEmail({...sample,kind,collectionIncluded:false});assert.match(e.text,/return the item/);assert.doesNotMatch(e.text,/CCC staff|4:00 pm|Collection location:/);}
});
test('extension quotes multiply by units, offer only available rates and never confirm an extension',()=>{
 const e=rentalReminderEmail(sample);assert.match(e.html,/KYD \$80\.00/);assert.match(e.html,/KYD \$350\.00/);assert.match(e.html,/KYD \$1,200\.00/);
 for(const term of['daily','weekly','monthly'])assert.ok(e.html.includes(`data-extension="${term}"`));
 assert.match(e.text,/remain unchanged until confirmed/);assert.match(e.html,/account\/profile#booking-1234/);
 const limited=rentalReminderEmail({...sample,items:[{...sample.items[0],rates:{daily:40}}]});assert.doesNotMatch(limited.html,/data-extension="weekly"|data-extension="monthly"|NaN/);
});
test('email escapes customer/item/location content and handles monthly rentals',()=>{
 const e=rentalReminderEmail({...sample,customerName:'<script>bad</script>',location:'<img onerror=x>',items:[{...sample.items[0],name:'<script>item</script>',term:'monthly'}]});assert.doesNotMatch(e.html,/<script>|<img onerror/);assert.match(e.html,/Monthly rental/);
 assert.throws(()=>rentalReminderEmail({...sample,items:[{...sample.items[0],quantity:0}]}));
});
