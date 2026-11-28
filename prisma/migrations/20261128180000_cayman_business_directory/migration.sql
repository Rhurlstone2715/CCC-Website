-- Publicly evidenced Cayman business listings; no customer accounts or messages.
-- Preserve every existing company ID, ownership rule, archive and rewards balance.
-- Evidence and trading-name aliases: data/cayman-business-directory-2026.json
BEGIN;
ALTER TABLE "Company" DROP CONSTRAINT "Company_membership_type_check";
ALTER TABLE "Company" ADD CONSTRAINT "Company_membership_type_check" CHECK ("domain" IS NULL OR "ownerEmail" IS NULL);
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT '1503 PROPERTY GROUP LTD','1503propertygroup','1503propertygroup.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('1503propertygroup') OR "domain" = '1503propertygroup.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = '1503propertygroup.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT '360 Holdings','360holdings','360holdingsltd.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('360holdings') OR "domain" = '360holdingsltd.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = '360holdingsltd.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT '3d Kyube Architects','3dkyubearchitects',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('3dkyubearchitects'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT '5 Star Building & Construction','5starbuildingconstruction','5star.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('5starbuildingconstruction') OR "domain" = '5star.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = '5star.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'A & S Property Maintenance','aspropertymaintenance',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('aspropertymaintenance'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'A.L. Thompson Construction Ltd.','althompsonconstruction','althompson.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('althompsonconstruction','althompsons') OR "domain" = 'althompson.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'althompson.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'AAA Advanced AC & Appliance','aaaadvancedacappliance',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('aaaadvancedacappliance'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Abernethy & Associates Ltd.','abernethyassociates','survey.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('abernethyassociates') OR "domain" = 'survey.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'survey.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Abode Property Management','abodepropertymanagement','abodecayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('abodepropertymanagement') OR "domain" = 'abodecayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'abodecayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Advance Fire & Plumbing Ltd.','advancefireplumbing','advancefireltd.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('advancefireplumbing') OR "domain" = 'advancefireltd.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'advancefireltd.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Affordable Solar','affordablesolar','affordablesolar.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('affordablesolar') OR "domain" = 'affordablesolar.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'affordablesolar.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'AIR SUPPLY CAYMAN','airsupplycayman','airsupply.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('airsupplycayman') OR "domain" = 'airsupply.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'airsupply.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Alive Design','alivedesign','alivedesign.net',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('alivedesign') OR "domain" = 'alivedesign.net') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'alivedesign.net')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'All Inclusive Construction','allinclusiveconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('allinclusiveconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'All Things Electrical','allthingselectrical',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('allthingselectrical'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Alpha Construction & Development','alphaconstructiondevelopment','alpha.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('alphaconstructiondevelopment') OR "domain" = 'alpha.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'alpha.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'AMB Construction Ltd.','ambconstruction','ambltd.org',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ambconstruction') OR "domain" = 'ambltd.org') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ambltd.org')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'AMR Consulting Engineers','amrconsultingengineers','amr.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('amrconsultingengineers') OR "domain" = 'amr.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'amr.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Androgroup Ltd.','androgroup','andro.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('androgroup') OR "domain" = 'andro.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'andro.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Apex Perimeter Protection Ltd','apexperimeterprotection','apexgroup.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('apexperimeterprotection') OR "domain" = 'apexgroup.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'apexgroup.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Appliance Pros','appliancepros','appliancepros.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('appliancepros') OR "domain" = 'appliancepros.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'appliancepros.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Aqua Bay Club','aquabayclub','aquabayclub.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('aquabayclub') OR "domain" = 'aquabayclub.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'aquabayclub.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Aqua Dynamics','aquadynamics','aquadynamics.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('aquadynamics') OR "domain" = 'aquadynamics.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'aquadynamics.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Arcadia (Landscape Design and Consulting)','arcadialandscapedesignandconsulting','arcadia.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('arcadialandscapedesignandconsulting') OR "domain" = 'arcadia.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'arcadia.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Arch and Godfrey (Cayman) Ltd.','archandgodfreycayman','arch-godfrey.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('archandgodfreycayman') OR "domain" = 'arch-godfrey.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'arch-godfrey.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Arch Glass & Aluminum Ltd','archglassaluminum','archglasscayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('archglassaluminum') OR "domain" = 'archglasscayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'archglasscayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Artic Air Conditioning','articairconditioning',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('articairconditioning'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Artisan Metal Works','artisanmetalworks','amw.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('artisanmetalworks') OR "domain" = 'amw.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'amw.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'ASHMORE ALEXANDER','ashmorealexander','ashmorealexander.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ashmorealexander') OR "domain" = 'ashmorealexander.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ashmorealexander.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'ASL Shipping & Logistics','aslshippinglogistics','aslcourier.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('aslshippinglogistics') OR "domain" = 'aslcourier.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'aslcourier.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Avata Property Services Ltd.','avatapropertyservices','avatapsl.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('avatapropertyservices') OR "domain" = 'avatapsl.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'avatapsl.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'AZURE REALTY LTD','azurerealty','azurerealtycayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('azurerealty') OR "domain" = 'azurerealtycayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'azurerealtycayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Backyard Gardeners','backyardgardeners','byg.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('backyardgardeners') OR "domain" = 'byg.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'byg.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'BCQS International','bcqsinternational','bcqs.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('bcqsinternational') OR "domain" = 'bcqs.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'bcqs.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'BCQS Property Management Ltd.','bcqspropertymanagement','bcqspropertymanagement.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('bcqspropertymanagement') OR "domain" = 'bcqspropertymanagement.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'bcqspropertymanagement.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'BDCL Architects','bdclarchitects','bdcl.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('bdclarchitects') OR "domain" = 'bdcl.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'bdcl.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Bedside Manor','bedsidemanor','bedsidemanor.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('bedsidemanor') OR "domain" = 'bedsidemanor.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'bedsidemanor.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'BERKSHIRE HATHAWAY HOMESERVICES CAYMAN ISLANDS','berkshirehathawayhomeservicescaymanislands','bhhscaymanislands.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('berkshirehathawayhomeservicescaymanislands') OR "domain" = 'bhhscaymanislands.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'bhhscaymanislands.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'BETTER PROPERTIES INT''L','betterpropertiesintl',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('betterpropertiesintl'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Bettle electrical ltd','bettleelectrical',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('bettleelectrical'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Blue Eagle Company Ltd','blueeagle',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('blueeagle'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Bodden Pools & Spas Ltd','boddenpoolsspas',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('boddenpoolsspas'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'BrandSource Home Gallery','brandsourcehomegallery','brandsourcecayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('brandsourcehomegallery','customclosets') OR "domain" = 'brandsourcecayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'brandsourcecayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'BrittHay Electric Ltd.','britthayelectric','britthay.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('britthayelectric') OR "domain" = 'britthay.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'britthay.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Bryan Construction','bryanconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('bryanconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Build (Cayman) Ltd.','buildcayman','buildcayman.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('buildcayman') OR "domain" = 'buildcayman.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'buildcayman.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'C & D Shutters and Screens','cdshuttersandscreens','cdshuttersandscreens.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cdshuttersandscreens') OR "domain" = 'cdshuttersandscreens.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cdshuttersandscreens.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'C&W Electrical & Renovations Ltd','cwelectricalrenovations','candwltd.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cwelectricalrenovations') OR "domain" = 'candwltd.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'candwltd.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Caribbean Club','caribbeanclub','caribclub.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caribbeanclub') OR "domain" = 'caribclub.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caribclub.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Caribbean Doors & Window Repairs Ltd','caribbeandoorswindowrepairs',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caribbeandoorswindowrepairs'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Caribbean Impact Windows & Doors','caribbeanimpactwindowsdoors','ciwindows.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caribbeanimpactwindowsdoors') OR "domain" = 'ciwindows.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ciwindows.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Catalyst','catalyst','catalyst.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('catalyst') OR "domain" = 'catalyst.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'catalyst.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Catt Construction 2018 Ltd','cattconstruction2018',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cattconstruction2018'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CAY Cargo Ltd.','caycargo','caycargo.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caycargo') OR "domain" = 'caycargo.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caycargo.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cay Construction','cayconstruction','cayconstruction.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cayconstruction') OR "domain" = 'cayconstruction.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cayconstruction.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Climate Controls','caymanclimatecontrols','ccc.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanclimatecontrols') OR "domain" = 'ccc.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ccc.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Coating Industries Ltd','caymancoatingindustries',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymancoatingindustries'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Epoxy Solutions','caymanepoxysolutions','caymanepoxy.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanepoxysolutions') OR "domain" = 'caymanepoxy.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caymanepoxy.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Freight Shipping Services Ltd. / Seaboard Marine','caymanfreightshippingservicesseaboardmarine','seaboardcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanfreightshippingservicesseaboardmarine') OR "domain" = 'seaboardcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'seaboardcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman General Contractors','caymangeneralcontractors','caymangeneral.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymangeneralcontractors','caymangeneralcontractor') OR "domain" = 'caymangeneral.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caymangeneral.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Growers','caymangrowers','caymangrowers.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymangrowers') OR "domain" = 'caymangrowers.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caymangrowers.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CAYMAN ISLANDS PROPERTIES','caymanislandsproperties','cip.realestate',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanislandsproperties') OR "domain" = 'cip.realestate') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cip.realestate')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Islands Roofing','caymanislandsroofing',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanislandsroofing'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Islands Sheet Metal Ltd.','caymanislandssheetmetal','cisheetmetal.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanislandssheetmetal') OR "domain" = 'cisheetmetal.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cisheetmetal.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CAYMAN ISLANDS SOTHEBY''S INT''L REALTY','caymanislandssothebysintlrealty','sothebysrealty.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanislandssothebysintlrealty') OR "domain" = 'sothebysrealty.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'sothebysrealty.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Mechanical Company Ltd.','caymanmechanical','caymanmechanical.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanmechanical') OR "domain" = 'caymanmechanical.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caymanmechanical.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Property Consulting','caymanpropertyconsulting','caymanpropertyconsulting.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanpropertyconsulting') OR "domain" = 'caymanpropertyconsulting.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caymanpropertyconsulting.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Property Maintenance/Bill Perigo','caymanpropertymaintenancebillperigo',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanpropertymaintenancebillperigo'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CAYMAN REALTY SPECIALISTS','caymanrealtyspecialists',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanrealtyspecialists'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Repairs','caymanrepairs','caymanrepairs.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanrepairs') OR "domain" = 'caymanrepairs.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caymanrepairs.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Routes Island Tours','caymanroutesislandtours','caymanroutes.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanroutesislandtours') OR "domain" = 'caymanroutes.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caymanroutes.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Structural Group','caymanstructuralgroup',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanstructuralgroup'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cayman Villas','caymanvillas','caymanvillas.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caymanvillas') OR "domain" = 'caymanvillas.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caymanvillas.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Caytech Air Conditioning','caytechairconditioning','caytechac.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('caytechairconditioning') OR "domain" = 'caytechac.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'caytechac.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CEL Cooling Supply','celcoolingsupply','cel.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('celcoolingsupply') OR "domain" = 'cel.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cel.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CENTURY 21 THOMPSON REALTY','century21thompsonrealty','c21cayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('century21thompsonrealty') OR "domain" = 'c21cayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'c21cayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Chalmers Gibbs Architects','chalmersgibbsarchitects','chalmersgibbs.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('chalmersgibbsarchitects') OR "domain" = 'chalmersgibbs.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'chalmersgibbs.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Charterland Ltd.','charterland','charterland.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('charterland') OR "domain" = 'charterland.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'charterland.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Christina Noel Interiors','christinanoelinteriors',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('christinanoelinteriors'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Christopher Columbus Condos','christophercolumbuscondos','christophercolumbuscondos.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('christophercolumbuscondos') OR "domain" = 'christophercolumbuscondos.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'christophercolumbuscondos.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Clan Construction Ltd.','clanconstruction','clan.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('clanconstruction') OR "domain" = 'clan.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'clan.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Clean Cayman','cleancayman','cleancayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cleancayman') OR "domain" = 'cleancayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cleancayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Clean Gas','cleangas',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cleangas'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CMEC Ltd.','cmec','cmec.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cmec') OR "domain" = 'cmec.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cmec.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Coastal Realty Ltd.','coastalrealty','coastalrealty.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('coastalrealty') OR "domain" = 'coastalrealty.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'coastalrealty.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Compass Point Dive Resort','compasspointdiveresort','compasspoint.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('compasspointdiveresort') OR "domain" = 'compasspoint.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'compasspoint.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Complete Construction','completeconstruction','completeconstruction.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('completeconstruction') OR "domain" = 'completeconstruction.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'completeconstruction.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'COOLING CAYMAN Air Conditioning','coolingcaymanairconditioning',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('coolingcaymanairconditioning'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cooling Pros','coolingpros','coolingpros.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('coolingpros') OR "domain" = 'coolingpros.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'coolingpros.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Coral Stone Club','coralstoneclub','coralstoneclub.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('coralstoneclub') OR "domain" = 'coralstoneclub.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'coralstoneclub.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CORCORAN CAYMAN ISLANDS','corcorancaymanislands','corcorancayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('corcorancaymanislands') OR "domain" = 'corcorancayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'corcorancayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Core Construction','coreconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('coreconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cornerstone Group','cornerstonegroup','cornerstonegroup.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cornerstonegroup') OR "domain" = 'cornerstonegroup.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cornerstonegroup.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Corporate Electric Ltd.','corporateelectric','corporate-electric.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('corporateelectric') OR "domain" = 'corporate-electric.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'corporate-electric.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cox Lumber Ltd.','coxlumber',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('coxlumber'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'CRIGHTON PROPERTIES','crightonproperties','crightonproperties.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('crightonproperties') OR "domain" = 'crightonproperties.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'crightonproperties.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Cynthia Tranel Studio','cynthiatranelstudio','cynthiatranel.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('cynthiatranelstudio','labelcdesigns') OR "domain" = 'cynthiatranel.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'cynthiatranel.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Dart','dart','dart.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('dart') OR "domain" = 'dart.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'dart.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Davenport Development Ltd.','davenportdevelopment','davenport.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('davenportdevelopment') OR "domain" = 'davenport.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'davenport.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Davenport Property Management & Services Ltd.','davenportpropertymanagementservices','dpms.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('davenportpropertymanagementservices') OR "domain" = 'dpms.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'dpms.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'DBM Construction Ltd.','dbmconstruction','dbmconstruction.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('dbmconstruction') OR "domain" = 'dbmconstruction.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'dbmconstruction.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'DDL Studio Ltd.','ddlstudio','ddlstudio.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ddlstudio') OR "domain" = 'ddlstudio.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ddlstudio.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'DECCO Ltd.','decco','deccoltd.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('decco') OR "domain" = 'deccoltd.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'deccoltd.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Decra Roofing','decraroofing',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('decraroofing'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Design Cayman','designcayman','design-cayman.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('designcayman','designcaymanarchitects') OR "domain" = 'design-cayman.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'design-cayman.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Design Studio','designstudio','designstudio.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('designstudio') OR "domain" = 'designstudio.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'designstudio.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Dew Point Air Conditioning & Refrigeration Ltd.','dewpointairconditioningrefrigeration','dewpointair.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('dewpointairconditioningrefrigeration') OR "domain" = 'dewpointair.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'dewpointair.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Discovery Point Club (Strata 81)','discoverypointclubstrata81','discoverypointclub.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('discoverypointclubstrata81') OR "domain" = 'discoverypointclub.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'discoverypointclub.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'DoorTek','doortek','doortek.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('doortek') OR "domain" = 'doortek.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'doortek.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Dream Maker Air Condition Cooling Systems Ltd.','dreammakerairconditioncoolingsystems',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('dreammakerairconditioncoolingsystems'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'DREAMSCAPE DESIGN','dreamscapedesign','dreamscapedesign.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('dreamscapedesign') OR "domain" = 'dreamscapedesign.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'dreamscapedesign.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'ECO Air Conditioning','ecoairconditioning',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ecoairconditioning'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Eco House Cayman','ecohousecayman','ecohousecayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ecohousecayman') OR "domain" = 'ecohousecayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ecohousecayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Eco Pools Ltd','ecopools',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ecopools'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'EcoSmart Cooling Ltd.','ecosmartcooling','ecosmart.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ecosmartcooling') OR "domain" = 'ecosmart.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ecosmart.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Edgewater Development Ltd.','edgewaterdevelopment','edgewater.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('edgewaterdevelopment','edgewaterproperties') OR "domain" = 'edgewater.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'edgewater.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Edie''s Decor','ediesdecor','ediesdecor.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ediesdecor') OR "domain" = 'ediesdecor.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ediesdecor.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'EFCON Construction','efconconstruction','efcon.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('efconconstruction') OR "domain" = 'efcon.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'efcon.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Eighty One West: Botanic Emporium','eightyonewestbotanicemporium','81west.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('eightyonewestbotanicemporium') OR "domain" = '81west.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = '81west.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Electra-Tech Services Ltd.','electratechservices','electratech.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('electratechservices') OR "domain" = 'electratech.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'electratech.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Electrical Systems & Innovation','electricalsystemsinnovation',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('electricalsystemsinnovation'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Elevar','elevar','elevar.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('elevar') OR "domain" = 'elevar.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'elevar.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Encompass Ltd.','encompass','encompasscayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('encompass') OR "domain" = 'encompasscayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'encompasscayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'ENGEL & VOLKERS','engelvolkers',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('engelvolkers'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Entech Ltd.','entech','entechky.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('entech') OR "domain" = 'entechky.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'entechky.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Epic Drywall Finishers Ltd.','epicdrywallfinishers',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('epicdrywallfinishers'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'ERA CAYMAN ISLANDS','eracaymanislands','eracayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('eracaymanislands') OR "domain" = 'eracayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'eracayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Estate Management Services Ltd.','estatemanagementservices','emscayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('estatemanagementservices') OR "domain" = 'emscayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'emscayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Everest Cool Air','everestcoolair',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('everestcoolair'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Every Blooming Thing','everybloomingthing','ebt.com.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('everybloomingthing') OR "domain" = 'ebt.com.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ebt.com.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Evolving Island','evolvingisland','evolvingisland.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('evolvingisland') OR "domain" = 'evolvingisland.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'evolvingisland.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'F.G. Construction','fgconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('fgconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Fairway Structural Group','fairwaystructuralgroup','fsgroup.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('fairwaystructuralgroup') OR "domain" = 'fsgroup.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'fsgroup.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'FEDA Maintenance Services','fedamaintenanceservices','fedaservices.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('fedamaintenanceservices') OR "domain" = 'fedaservices.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'fedaservices.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'First Impression','firstimpression','firstimpression.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('firstimpression') OR "domain" = 'firstimpression.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'firstimpression.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Flowers Block (Flowers Group)','flowersblockflowersgroup','flowersgroup.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('flowersblockflowersgroup') OR "domain" = 'flowersgroup.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'flowersgroup.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Forged Construction','forgedconstruction','forged-construction.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('forgedconstruction') OR "domain" = 'forged-construction.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'forged-construction.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'FRASER PROPERTIES CAYMAN LTD','fraserpropertiescayman','frasercayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('fraserpropertiescayman') OR "domain" = 'frasercayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'frasercayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Frederick McRae Ltd','frederickmcrae','frederickmcrae.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('frederickmcrae') OR "domain" = 'frederickmcrae.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'frederickmcrae.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Freight Pros Cayman','freightproscayman','freightproscayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('freightproscayman') OR "domain" = 'freightproscayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'freightproscayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'G E Home Repairs','gehomerepairs',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('gehomerepairs'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Garden of Eden','gardenofeden',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('gardenofeden'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Garrison Industries','garrisonindustries',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('garrisonindustries'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'GMC Electric Ltd','gmcelectric',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('gmcelectric'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'GMC General Contractors Ltd.','gmcgeneralcontractors','gmcgeneralcontractors.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('gmcgeneralcontractors') OR "domain" = 'gmcgeneralcontractors.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'gmcgeneralcontractors.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Go Gas Ltd','gogas',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('gogas'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'GPE Services','gpeservices','gpepro.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('gpeservices') OR "domain" = 'gpepro.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'gpepro.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Grace Repairs & Maintenance Services','gracerepairsmaintenanceservices','gracerms.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('gracerepairsmaintenanceservices') OR "domain" = 'gracerms.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'gracerms.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Grand Cayman Property Services','grandcaymanpropertyservices','grandcaymanpropertyservices.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('grandcaymanpropertyservices') OR "domain" = 'grandcaymanpropertyservices.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'grandcaymanpropertyservices.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Grand Cayman Villas & Condos','grandcaymanvillascondos','grandcaymanvillas.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('grandcaymanvillascondos') OR "domain" = 'grandcaymanvillas.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'grandcaymanvillas.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Grand Caymanian Resort & Suites / Holiday Inn Resort Grand Cayman','grandcaymanianresortsuitesholidayinnresortgrandcayman','grandcaymanian.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('grandcaymanianresortsuitesholidayinnresortgrandcayman') OR "domain" = 'grandcaymanian.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'grandcaymanian.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Granite Express Cayman','graniteexpresscayman','graniteexpresscayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('graniteexpresscayman') OR "domain" = 'graniteexpresscayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'graniteexpresscayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Green Tech Cayman','greentechcayman','greentech.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('greentechcayman','greentechsolar') OR "domain" = 'greentech.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'greentech.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'GreenCut Landscaping','greencutlandscaping',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('greencutlandscaping'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'GrimeX','grimex','grimexltd.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('grimex') OR "domain" = 'grimexltd.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'grimexltd.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Grow With The Flow','growwiththeflow','growwiththeflow.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('growwiththeflow') OR "domain" = 'growwiththeflow.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'growwiththeflow.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Growing Beauty Nursery','growingbeautynursery',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('growingbeautynursery','growingbeauty'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'GumTree Cayman Ltd.','gumtreecayman',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('gumtreecayman'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'HandyDandy','handydandy','handydandy.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('handydandy') OR "domain" = 'handydandy.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'handydandy.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'HandyHome','handyhome','handyhome.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('handyhome') OR "domain" = 'handyhome.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'handyhome.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Handymen Can','handymencan','handymencan.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('handymencan') OR "domain" = 'handymencan.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'handymencan.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Harbour Heights Condominiums','harbourheightscondominiums','harbourheightscayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('harbourheightscondominiums') OR "domain" = 'harbourheightscayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'harbourheightscayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Harold''s Building And Maintenance','haroldsbuildingandmaintenance',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('haroldsbuildingandmaintenance'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'HERITAGE & HINTON REAL ESTATE LTD','heritagehintonrealestate','heritageandhinton.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('heritagehintonrealestate') OR "domain" = 'heritageandhinton.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'heritageandhinton.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Heritage Holdings','heritageholdings','heritageholdings.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('heritageholdings') OR "domain" = 'heritageholdings.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'heritageholdings.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Hislop Windows & Doors','hislopwindowsdoors','hislopcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('hislopwindowsdoors') OR "domain" = 'hislopcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'hislopcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Home & Outdoor','homeoutdoor','homeandoutdoor.net',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('homeoutdoor') OR "domain" = 'homeandoutdoor.net') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'homeandoutdoor.net')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Home Gas Ltd.','homegas','homegas.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('homegas') OR "domain" = 'homegas.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'homegas.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Home Tailor','hometailor','hometailor.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('hometailor') OR "domain" = 'hometailor.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'hometailor.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Howells Trucking Services','howellstruckingservices',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('howellstruckingservices'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'HUIS','huis','huiscayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('huis') OR "domain" = 'huiscayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'huiscayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Hunters Removal and Moving Service','huntersremovalandmovingservice',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('huntersremovalandmovingservice'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Hydes & Sons','hydessons','hydessons.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('hydessons') OR "domain" = 'hydessons.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'hydessons.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'iDesign Interior Design','idesigninteriordesign','idesignltd.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('idesigninteriordesign') OR "domain" = 'idesignltd.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'idesignltd.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'IMA De Fleurs Landscaping','imadefleurslandscaping',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('imadefleurslandscaping'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Institute of Cayman Islands Architects','instituteofcaymanislandsarchitects','icia.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('instituteofcaymanislandsarchitects') OR "domain" = 'icia.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'icia.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'INTER ISLAND REALTY','interislandrealty',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('interislandrealty'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Interior Concepts','interiorconcepts','interiorconcepts.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('interiorconcepts') OR "domain" = 'interiorconcepts.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'interiorconcepts.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Interior Design Group (IDG)','interiordesigngroupidg','idgcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('interiordesigngroupidg') OR "domain" = 'idgcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'idgcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'International glass cayman ltd','internationalglasscayman',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('internationalglasscayman'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'International Realty Group (IRG)','internationalrealtygroupirg','irg.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('internationalrealtygroupirg','internationalrealtygroup') OR "domain" = 'irg.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'irg.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Ironshore Contracting','ironshorecontracting','ironshore.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ironshorecontracting') OR "domain" = 'ironshore.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ironshore.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Ishmeal Shutters','ishmealshutters','ishmealshutters.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ishmealshutters') OR "domain" = 'ishmealshutters.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ishmealshutters.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Island Aggregate Supply','islandaggregatesupply',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('islandaggregatesupply'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Island Air Conditioning and Mechanical Ltd.','islandairconditioningandmechanical','islandac.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('islandairconditioningandmechanical') OR "domain" = 'islandac.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'islandac.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Island Breeze Services Ltd','islandbreezeservices',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('islandbreezeservices'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Island Interiors Ltd','islandinteriors','islandinteriors.com.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('islandinteriors') OR "domain" = 'islandinteriors.com.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'islandinteriors.com.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Island Painting','islandpainting','islandpainting.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('islandpainting') OR "domain" = 'islandpainting.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'islandpainting.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Island Tools Sales And Rental','islandtoolssalesandrental',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('islandtoolssalesandrental'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Island Waste Carriers','islandwastecarriers','iwc.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('islandwastecarriers') OR "domain" = 'iwc.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'iwc.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'ITC Tile','itctile','itctile.net',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('itctile') OR "domain" = 'itctile.net') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'itctile.net')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'J&R Construction Ltd.','jrconstruction','jrconstructionltd.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('jrconstruction') OR "domain" = 'jrconstructionltd.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'jrconstructionltd.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Jairam Building Contractor','jairambuildingcontractor',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('jairambuildingcontractor'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'JDK SERVICES COMPANY LTD.','jdkservices',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('jdkservices'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'JEC Property Consultants Ltd.','jecpropertyconsultants','jec.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('jecpropertyconsultants') OR "domain" = 'jec.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'jec.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'JNM Equipment','jnmequipment',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('jnmequipment'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'John Doak Architecture','johndoakarchitecture','johndoak.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('johndoakarchitecture') OR "domain" = 'johndoak.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'johndoak.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Johnson Design + Architecture','johnsondesignarchitecture','rjda.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('johnsondesignarchitecture') OR "domain" = 'rjda.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'rjda.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'JP Trades Electrical','jptradeselectrical',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('jptradeselectrical'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'K-Tech Electrical Ltd.','ktechelectrical',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ktechelectrical'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'K.L.E Electrical Services','kleelectricalservices',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('kleelectricalservices'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'KELLER WILLIAMS','kellerwilliams','kellerwilliams.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('kellerwilliams') OR "domain" = 'kellerwilliams.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'kellerwilliams.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Kensington','kensington','kensington.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('kensington') OR "domain" = 'kensington.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'kensington.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Kerby''s Electrical','kerbyselectrical',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('kerbyselectrical'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Kimpton Seafire Resort + Spa','kimptonseafireresortspa','seafireresortandspa.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('kimptonseafireresortspa') OR "domain" = 'seafireresortandspa.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'seafireresortandspa.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Kirk Concrete','kirkconcrete','kirkconcrete.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('kirkconcrete') OR "domain" = 'kirkconcrete.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'kirkconcrete.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Kuavo Cayman','kuavocayman','kuavo.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('kuavocayman','kuavo') OR "domain" = 'kuavo.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'kuavo.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'KWWOODWORK LTD.','kwwoodwork','kwwoodwork.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('kwwoodwork') OR "domain" = 'kwwoodwork.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'kwwoodwork.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Lawn Secure','lawnsecure',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('lawnsecure'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Le Habitat Ltd.','lehabitat','lehabitat.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('lehabitat','lehabitatcaymanislands') OR "domain" = 'lehabitat.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'lehabitat.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Le Soleil d’Or','lesoleildor','lesoleildor.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('lesoleildor') OR "domain" = 'lesoleildor.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'lesoleildor.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Ledger & Looms','ledgerlooms','ledgerandlooms.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ledgerlooms') OR "domain" = 'ledgerandlooms.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ledgerandlooms.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Let''s Go Building and Maintenance','letsgobuildingandmaintenance',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('letsgobuildingandmaintenance'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'LG Contracting Ltd.','lgcontracting',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('lgcontracting'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Liberty Designs','libertydesigns','libertydesigns.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('libertydesigns') OR "domain" = 'libertydesigns.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'libertydesigns.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Lightbox','lightbox','lightbox.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('lightbox') OR "domain" = 'lightbox.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'lightbox.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Little Cayman Beach Resort','littlecaymanbeachresort','littlecayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('littlecaymanbeachresort') OR "domain" = 'littlecayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'littlecayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'LIVING.KY','livingky','living.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('livingky') OR "domain" = 'living.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'living.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Logistics Cayman Limited','logisticscayman','logisticscaymanlimited.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('logisticscayman') OR "domain" = 'logisticscaymanlimited.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'logisticscaymanlimited.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'London House Condominiums','londonhousecondominiums','londonhouse.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('londonhousecondominiums') OR "domain" = 'londonhouse.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'londonhouse.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'MAC Plumbing and Maintenance Services Ltd.','macplumbingandmaintenanceservices','macplumbing.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('macplumbingandmaintenanceservices') OR "domain" = 'macplumbing.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'macplumbing.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Mail Boxes Etc. Cayman','mailboxesetccayman','mbe.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mailboxesetccayman') OR "domain" = 'mbe.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'mbe.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Marathon Movers','marathonmovers',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('marathonmovers'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Marksons Furniture and Windows','marksonsfurnitureandwindows','marksons.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('marksonsfurnitureandwindows') OR "domain" = 'marksons.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'marksons.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'MBE Janitorial M.S.','mbejanitorialms',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mbejanitorialms'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'McAlpine Ltd.','mcalpine','mcalpineky.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mcalpine') OR "domain" = 'mcalpineky.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'mcalpineky.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'McRuss','mcruss','mcruss.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mcruss') OR "domain" = 'mcruss.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'mcruss.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Milano furniture','milanofurniture','milanofurniture.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('milanofurniture') OR "domain" = 'milanofurniture.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'milanofurniture.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'MILESTONE PROPERTIES CAYMAN','milestonepropertiescayman','milestone.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('milestonepropertiescayman') OR "domain" = 'milestone.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'milestone.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Miller''s Plumbing','millersplumbing',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('millersplumbing'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'MJM Design Studio','mjmdesignstudio','mjmdesignstudio.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mjmdesignstudio') OR "domain" = 'mjmdesignstudio.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'mjmdesignstudio.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'MJS plumbing','mjsplumbing',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mjsplumbing'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Mosquito Solutions','mosquitosolutions',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mosquitosolutions'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Mr Electric','mrelectric',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mrelectric'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Mr. Power Guy','mrpowerguy','mrpowerguy.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mrpowerguy') OR "domain" = 'mrpowerguy.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'mrpowerguy.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Munroe Electrical Company','munroeelectrical',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('munroeelectrical'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Must Cool AC','mustcoolac','mustcoolac.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mustcoolac') OR "domain" = 'mustcoolac.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'mustcoolac.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'MW Property Management Limited','mwpropertymanagement','mwproperty.management',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('mwpropertymanagement') OR "domain" = 'mwproperty.management') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'mwproperty.management')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Nathan General Maintenance & Construction','nathangeneralmaintenanceconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('nathangeneralmaintenanceconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'National Concrete','nationalconcrete','nationalconcrete.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('nationalconcrete') OR "domain" = 'nationalconcrete.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'nationalconcrete.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'National Logistics','nationallogistics','nationallogistics.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('nationallogistics') OR "domain" = 'nationallogistics.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'nationallogistics.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Nationwide Air Conditioning Ltd','nationwideairconditioning',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('nationwideairconditioning'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Nautic Property Consultants Ltd.','nauticpropertyconsultants','nautic.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('nauticpropertyconsultants') OR "domain" = 'nautic.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'nautic.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'NCB Group','ncbgroup','ncbgroup.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ncbgroup') OR "domain" = 'ncbgroup.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ncbgroup.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'NCI Freight & Logistics Ltd.','ncifreightlogistics','ncifreight.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ncifreightlogistics') OR "domain" = 'ncifreight.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ncifreight.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'New Age Plumbing & Maintenance','newageplumbingmaintenance',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('newageplumbingmaintenance'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'NU DEVELOPMENTS','nudevelopments','nudevelopments.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('nudevelopments') OR "domain" = 'nudevelopments.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'nudevelopments.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'NU Energy Ltd.','nuenergy','nuenergy.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('nuenergy') OR "domain" = 'nuenergy.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'nuenergy.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'OAD Architects','oadarchitects','oadarchitects.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('oadarchitects') OR "domain" = 'oadarchitects.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'oadarchitects.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Oasis Pool & Spa','oasispoolspa','oasis.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('oasispoolspa') OR "domain" = 'oasis.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'oasis.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'OBMI Cayman','obmicayman',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('obmicayman'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Ocean Club Strata','oceanclubstrata','oceanclubcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('oceanclubstrata') OR "domain" = 'oceanclubcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'oceanclubcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'OCEANFRONT REALTY LTD','oceanfrontrealty','oceanfrontrealty.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('oceanfrontrealty') OR "domain" = 'oceanfrontrealty.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'oceanfrontrealty.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Optimum Engineering Ltd.','optimumengineering','optimumengineering.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('optimumengineering') OR "domain" = 'optimumengineering.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'optimumengineering.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'OTISAIR','otisair','otisair.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('otisair') OR "domain" = 'otisair.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'otisair.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Paint Pros Ltd.','paintpros','paintpros.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('paintpros') OR "domain" = 'paintpros.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'paintpros.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Palm Heights','palmheights','palmheights.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('palmheights') OR "domain" = 'palmheights.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'palmheights.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Paradise Landscaping','paradiselandscaping','paradise.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('paradiselandscaping') OR "domain" = 'paradise.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'paradise.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'PARADISE PROPERTIES CAYMAN','paradisepropertiescayman','paradisepropertiescayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('paradisepropertiescayman') OR "domain" = 'paradisepropertiescayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'paradisepropertiescayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Paragon Builders','paragonbuilders','paragon.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('paragonbuilders') OR "domain" = 'paragon.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'paragon.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Paramount','paramount','paramountcarpets.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('paramount') OR "domain" = 'paramountcarpets.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'paramountcarpets.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Parsons Air Conditioning','parsonsairconditioning','parsonsac.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('parsonsairconditioning') OR "domain" = 'parsonsac.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'parsonsac.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Passion Cleaning Services','passioncleaningservices',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('passioncleaningservices'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Perry''s Backhoe Service','perrysbackhoeservice',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('perrysbackhoeservice'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pestkil','pestkil','pestkil.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('pestkil') OR "domain" = 'pestkil.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'pestkil.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Phillips Electrical Supply','phillipselectricalsupply',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('phillipselectricalsupply'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Phoenix Construction','phoenixconstruction','phoenix.com.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('phoenixconstruction') OR "domain" = 'phoenix.com.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'phoenix.com.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'PJ Construction','pjconstruction','pjconstruction.org',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('pjconstruction') OR "domain" = 'pjconstruction.org') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'pjconstruction.org')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Plantana Condominiums','plantanacondominiums','plantanacayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('plantanacondominiums') OR "domain" = 'plantanacayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'plantanacayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Platinum Pool Care Ltd.','platinumpoolcare','platinumpools.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('platinumpoolcare') OR "domain" = 'platinumpools.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'platinumpools.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'PLATINUM PROPERTY GROUP CAYMAN ISLANDS','platinumpropertygroupcaymanislands',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('platinumpropertygroupcaymanislands'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Polar Bear Air Conditioning Ltd.','polarbearairconditioning','polarbear.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('polarbearairconditioning') OR "domain" = 'polarbear.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'polarbear.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pool Patrol','poolpatrol','poolpatrol.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('poolpatrol') OR "domain" = 'poolpatrol.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'poolpatrol.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pooley Cabinets','pooleycabinets',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('pooleycabinets','pooleycabinetsdesignstudio'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pools by Us Cayman','poolsbyuscayman',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('poolsbyuscayman'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pools Cayman','poolscayman','poolscayman.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('poolscayman') OR "domain" = 'poolscayman.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'poolscayman.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pools in Paradise','poolsinparadise',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('poolsinparadise'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Power Flower','powerflower','powerflower.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('powerflower') OR "domain" = 'powerflower.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'powerflower.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Powerys Garage Doors','powerysgaragedoors',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('powerysgaragedoors'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Premier Plumbing Services','premierplumbingservices','premierplumbing.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('premierplumbingservices') OR "domain" = 'premierplumbing.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'premierplumbing.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Premium One Plus Construction','premiumoneplusconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('premiumoneplusconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Premium Trucking Services','premiumtruckingservices',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('premiumtruckingservices'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pro Clean','proclean',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('proclean'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pro Plus Garden Centre','proplusgardencentre','propluscayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('proplusgardencentre') OR "domain" = 'propluscayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'propluscayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Progreen Landscaping and Maintenance services','progreenlandscapingandmaintenanceservices',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('progreenlandscapingandmaintenanceservices'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'PROPERTY CAYMAN LTD','propertycayman','propertycayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('propertycayman') OR "domain" = 'propertycayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'propertycayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Property Management Cayman Ltd.','propertymanagementcayman','propertymanagementcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('propertymanagementcayman') OR "domain" = 'propertymanagementcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'propertymanagementcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'PROPERTY PALS, LTD','propertypals','propertypals.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('propertypals') OR "domain" = 'propertypals.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'propertypals.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'ProStars Construction Ltd.','prostarsconstruction','prostarsconstruction.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('prostarsconstruction') OR "domain" = 'prostarsconstruction.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'prostarsconstruction.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Protective Metal Products & Fabrication','protectivemetalproductsfabrication',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('protectivemetalproductsfabrication'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'PROVENANCE PROPERTIES OF CAYMAN LTD','provenancepropertiesofcayman','provenanceproperties.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('provenancepropertiesofcayman') OR "domain" = 'provenanceproperties.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'provenanceproperties.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Pyramid Construction Ltd.','pyramidconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('pyramidconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Quality Electric','qualityelectric',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('qualityelectric'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Rainbow Development Ltd.','rainbowdevelopment','rainbow.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('rainbowdevelopment','rainbowrealty') OR "domain" = 'rainbow.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'rainbow.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Rakeem Plumbing','rakeemplumbing',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('rakeemplumbing'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'RAM Electrical Supply Ltd.','ramelectricalsupply','ramelectricalsupply.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ramelectricalsupply') OR "domain" = 'ramelectricalsupply.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ramelectricalsupply.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Ramdin Construction & Roofing Company','ramdinconstructionroofing',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ramdinconstructionroofing'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Rankin Group LTD','rankingroup',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('rankingroup'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'RE/MAX CAYMAN ISLANDS','remaxcaymanislands','remax.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('remaxcaymanislands') OR "domain" = 'remax.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'remax.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Real Wood Cabinets','realwoodcabinets',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('realwoodcabinets'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Reed Consulting Engineers','reedconsultingengineers','reedconsultingengineers.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('reedconsultingengineers') OR "domain" = 'reedconsultingengineers.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'reedconsultingengineers.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Regal Beach Club','regalbeachclub','regalbeach.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('regalbeachclub') OR "domain" = 'regalbeach.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'regalbeach.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Reliable electrical contractors','reliableelectricalcontractors',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('reliableelectricalcontractors'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Reliable Industries','reliableindustries','reliable.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('reliableindustries') OR "domain" = 'reliable.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'reliable.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'REM Services Ltd.','remservices','remservices.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('remservices') OR "domain" = 'remservices.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'remservices.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'RHULENS','rhulens','rhulens.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('rhulens') OR "domain" = 'rhulens.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'rhulens.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Ritch Realty Ltd.','ritchrealty','ritchrealty.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('ritchrealty') OR "domain" = 'ritchrealty.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ritchrealty.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'RMS Air Conditioning','rmsairconditioning','rmsairconditioning.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('rmsairconditioning') OR "domain" = 'rmsairconditioning.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'rmsairconditioning.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Robert Towell Architect Ltd.','roberttowellarchitect','roberttowell.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('roberttowellarchitect') OR "domain" = 'roberttowell.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'roberttowell.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Robson Construction Ltd.','robsonconstruction','robson.construction',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('robsonconstruction') OR "domain" = 'robson.construction') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'robson.construction')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Royal Limo','royallimo','royallimocayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('royallimo') OR "domain" = 'royallimocayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'royallimocayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Senergy Solar Cayman, Ltd.','senergysolarcayman','senergysolar.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('senergysolarcayman') OR "domain" = 'senergysolar.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'senergysolar.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Shamoo Electric','shamooelectric',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('shamooelectric'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'SHORELINE PROPERTIES CAYMAN ISLANDS','shorelinepropertiescaymanislands','shoreline.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('shorelinepropertiescaymanislands') OR "domain" = 'shoreline.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'shoreline.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Solid Cayman','solidcayman',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('solidcayman'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Soman Services Ltd','somanservices','somanservicesltd.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('somanservices') OR "domain" = 'somanservicesltd.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'somanservicesltd.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Source Electrical','sourceelectrical',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('sourceelectrical'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'SOVEREIGN REALTY','sovereignrealty','srcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('sovereignrealty') OR "domain" = 'srcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'srcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Spartan Fencing','spartanfencing','spartanfencingky.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('spartanfencing') OR "domain" = 'spartanfencingky.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'spartanfencingky.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Splash Inc.','splash','splashinc.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('splash') OR "domain" = 'splashinc.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'splashinc.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Sprint Express Services','sprintexpressservices','sprint.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('sprintexpressservices') OR "domain" = 'sprint.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'sprint.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'SSH Cayman','sshcayman','sshcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('sshcayman') OR "domain" = 'sshcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'sshcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Stafford Flooring','staffordflooring','staffordflooring.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('staffordflooring') OR "domain" = 'staffordflooring.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'staffordflooring.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'STORAGE SOLUTIONS','storagesolutions',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('storagesolutions'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Sublime Rentals & Services','sublimerentalsservices',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('sublimerentalsservices'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Superior Drywall Ltd','superiordrywall','superiordrywallcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('superiordrywall') OR "domain" = 'superiordrywallcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'superiordrywallcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Supermix','supermix','supermix.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('supermix') OR "domain" = 'supermix.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'supermix.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Supreme Power Wash','supremepowerwash',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('supremepowerwash'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'SureBuilt Construction Ltd.','surebuiltconstruction','surebuilt.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('surebuiltconstruction') OR "domain" = 'surebuilt.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'surebuilt.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Synergy Cayman','synergycayman','synergycayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('synergycayman') OR "domain" = 'synergycayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'synergycayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'T.H.E. Merren Design','themerrendesign',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('themerrendesign'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'TEN SAILS PROPERTY GROUP LTD','tensailspropertygroup','tensails.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('tensailspropertygroup') OR "domain" = 'tensails.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'tensails.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Agency Cayman Islands','theagencycaymanislands',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('theagencycaymanislands','agencycaymanislands','theagencyrealestate','agencyrealestate'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Appliance Guru','theapplianceguru','theguru.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('theapplianceguru','applianceguru') OR "domain" = 'theguru.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'theguru.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Avalon Condominiums','theavaloncondominiums','avaloncayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('theavaloncondominiums','avaloncondominiums') OR "domain" = 'avaloncayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'avaloncayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Beachcomber Grand Cayman','thebeachcombergrandcayman','beachcombergrandcayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thebeachcombergrandcayman','beachcombergrandcayman') OR "domain" = 'beachcombergrandcayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'beachcombergrandcayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The craftsman & the draftsman','thecraftsmanthedraftsman',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thecraftsmanthedraftsman','craftsmanthedraftsman'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Final Touch','thefinaltouch',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thefinaltouch','finaltouch'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Grandview Condos (Strata 205)','thegrandviewcondosstrata205','grandviewcondos.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thegrandviewcondosstrata205','grandviewcondosstrata205') OR "domain" = 'grandviewcondos.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'grandviewcondos.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Locale Hotel Grand Cayman','thelocalehotelgrandcayman','staylocale.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thelocalehotelgrandcayman','localehotelgrandcayman') OR "domain" = 'staylocale.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'staylocale.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Pool Store Limited','thepoolstore','thepoolstoreltd.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thepoolstore','poolstore') OR "domain" = 'thepoolstoreltd.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'thepoolstoreltd.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Real Estate Company','therealestate',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('therealestate','realestate'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Reef Beach Resort Grand Cayman','thereefbeachresortgrandcayman','thereef.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thereefbeachresortgrandcayman','reefbeachresortgrandcayman') OR "domain" = 'thereef.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'thereef.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Security Centre Ltd.','thesecuritycentre','security.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thesecuritycentre','securitycentre','caymansecuritycentre') OR "domain" = 'security.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'security.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'The Westin Grand Cayman Seven Mile Beach Resort & Spa','thewestingrandcaymansevenmilebeachresortspa','westin-cayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thewestingrandcaymansevenmilebeachresortspa','westingrandcaymansevenmilebeachresortspa') OR "domain" = 'westin-cayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'westin-cayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Therma Shield','thermashield','thermashield.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thermashield') OR "domain" = 'thermashield.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'thermashield.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Thompson Quality Homes','thompsonqualityhomes','tqh.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thompsonqualityhomes') OR "domain" = 'tqh.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'tqh.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Thompson Shipping Company Ltd.','thompsonshipping','thompsonshipping.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thompsonshipping') OR "domain" = 'thompsonshipping.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'thompsonshipping.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'THPM Real Estate','thpmrealestate','thpm.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('thpmrealestate') OR "domain" = 'thpm.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'thpm.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Tibbetts Logistics Ltd.','tibbettslogistics','tibbettslogisticsci.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('tibbettslogistics') OR "domain" = 'tibbettslogisticsci.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'tibbettslogisticsci.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Top Choice Roofing','topchoiceroofing',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('topchoiceroofing'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Total Window Fashions Ltd.','totalwindowfashions',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('totalwindowfashions'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'TRIDENT PROPERTIES (CAYMAN ISLANDS) LTD','tridentpropertiescaymanislands','tridentproperties.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('tridentpropertiescaymanislands') OR "domain" = 'tridentproperties.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'tridentproperties.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Trio Architecture','trioarchitecture','trioarchitects.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('trioarchitecture') OR "domain" = 'trioarchitects.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'trioarchitects.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Tropical Architectural & Development Group (TAG Ltd.)','tropicalarchitecturaldevelopmentgrouptag','tag.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('tropicalarchitecturaldevelopmentgrouptag','tropicalarchitecturalgroup') OR "domain" = 'tag.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'tag.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'TROPICAL REAL ESTATE','tropicalrealestate',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('tropicalrealestate'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Tryden Roofing and Waterproofing','trydenroofingandwaterproofing',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('trydenroofingandwaterproofing'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Turtle Nest Inn & Condos','turtlenestinncondos','turtlenestinn.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('turtlenestinncondos') OR "domain" = 'turtlenestinn.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'turtlenestinn.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Tyson Construction','tysonconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('tysonconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'UNIQUE Construction & Maintenance','uniqueconstructionmaintenance',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('uniqueconstructionmaintenance'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'United Contracting','unitedcontracting','ucltd.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('unitedcontracting') OR "domain" = 'ucltd.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'ucltd.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'United Equipment Ltd','unitedequipment',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('unitedequipment'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'UNITS Ltd','units','units.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('units') OR "domain" = 'units.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'units.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Vigoro Nursery Ltd.','vigoronursery','vigoro.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('vigoronursery','vigoroagricoladrive','vigorowalkersroad') OR "domain" = 'vigoro.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'vigoro.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Villas of the Galleon','villasofthegalleon','villasofthegalleon.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('villasofthegalleon') OR "domain" = 'villasofthegalleon.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'villasofthegalleon.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Watler & Hislop Services','watlerhislopservices','equipmentservices.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('watlerhislopservices') OR "domain" = 'equipmentservices.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'equipmentservices.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Watler''s Metal Products','watlersmetalproducts','watlersmetalproducts.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('watlersmetalproducts') OR "domain" = 'watlersmetalproducts.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'watlersmetalproducts.ky')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Weldun Construction','weldunconstruction',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('weldunconstruction'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Well Done Aluminum Products','welldonealuminumproducts',NULL,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('welldonealuminumproducts'))
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'WEST INDIES BROKERS','westindiesbrokers','westindiesbrokers.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('westindiesbrokers') OR "domain" = 'westindiesbrokers.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'westindiesbrokers.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'WestPoint Construction Group Ltd.','westpointconstructiongroup','westpoint-cayman.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('westpointconstructiongroup') OR "domain" = 'westpoint-cayman.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'westpoint-cayman.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'WestPoint Inspections','westpointinspections','westpoint-inspections.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('westpointinspections') OR "domain" = 'westpoint-inspections.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'westpoint-inspections.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'WILLIAMS2 REAL ESTATE','williams2realestate','williams2realestate.com',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('williams2realestate') OR "domain" = 'williams2realestate.com') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'williams2realestate.com')
ON CONFLICT DO NOTHING;
INSERT INTO "Company" ("name","nameKey","domain","createdAt")
SELECT 'Wizard Cayman','wizardcayman','wizardscreen.ky',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Company" WHERE "nameKey" IN ('wizardcayman') OR "domain" = 'wizardscreen.ky') AND NOT EXISTS (SELECT 1 FROM "SubCompany" WHERE "domain" = 'wizardscreen.ky')
ON CONFLICT DO NOTHING;
COMMIT;
