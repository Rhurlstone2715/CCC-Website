-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "addOns" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "needsPower" BOOLEAN NOT NULL DEFAULT false;

-- Start existing catalogs with the add-ons the rentals page offered before
-- this became editable. A fresh database gets the same from catalog-seed.json.
UPDATE "Product" SET "addOns" = ARRAY['bin','liftingbeams','spreaderbars','spreaderbeams','concrete-bottom','concrete-side','blockforks']
  WHERE "id" IN ('rt890e','rt175','rt40','rt635c','altec2595');
UPDATE "Product" SET "addOns" = ARRAY['national-manbasket','bin','liftingbeams','spreaderbars','spreaderbeams','concrete-bottom','concrete-side','blockforks']
  WHERE "id" = 'national1400';
UPDATE "Product" SET "addOns" = ARRAY['jib','bucket','manbasket','telehandler-blockfork']
  WHERE "id" IN ('gth1056','gth844','gth636');
UPDATE "Product" SET "addOns" = ARRAY['wyco-8914','wyco-8920','wyco-750d','wyco-750eh'] WHERE "id" = 'wyco-995';
UPDATE "Product" SET "addOns" = ARRAY['impactgun'] WHERE "id" = 'compressor';

-- Electric equipment; generators are only suggested at checkout alongside these.
UPDATE "Product" SET "needsPower" = true
  WHERE "id" IN ('mini-welder','mini-plasma','handheld-rebar','fs600','fr800c','wyco-995');
