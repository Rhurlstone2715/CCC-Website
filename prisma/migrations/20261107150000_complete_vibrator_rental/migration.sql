-- Retain component prices and inventory records, presenting the set as one rental.
UPDATE "Product"
SET "image" = 'assets/catalog/wyco-complete-rental.png',
    "name" = 'Wyco Concrete Vibrator — Complete Rental',
    "spec" = 'Motor + shaft + head • 14′ or 20′ shaft • 13/16″ or 1″ head',
    "description" = 'All-in-one concrete vibrator rental includes the motor, one shaft and one head. Choose a 14′ or 20′ shaft and a 13/16″ or 1″ head.'
WHERE "id" = 'wyco-995';
