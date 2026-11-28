-- Verified work domains supplement existing ownership without transferring accounts.
CREATE TABLE "CompanyEmailDomain" ("domain" TEXT PRIMARY KEY,"companyId" INTEGER NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,"sourceUrl" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "CompanyEmailDomain_companyId_idx" ON "CompanyEmailDomain"("companyId");
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT '1503propertygroup.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/1503-property-group-ltd' FROM "Company" co WHERE (co."nameKey" IN ('1503propertygroup') OR co."domain"='1503propertygroup.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='1503propertygroup.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='1503propertygroup.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT '360holdingsltd.com',"id",'https://www.renuspace.ky/business-profile/360-holdings' FROM "Company" co WHERE (co."nameKey" IN ('360holdings') OR co."domain"='360holdingsltd.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='360holdingsltd.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='360holdingsltd.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT '5star.ky',"id",'https://5star.ky/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('5starbuildingconstruction') OR co."domain"='5star.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='5star.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='5star.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'althompson.com',"id",'https://www.cca.ky/al-thompson-construction-ltd' FROM "Company" co WHERE (co."nameKey" IN ('althompsonconstruction','althompsons') OR co."domain"='althompson.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='althompson.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='althompson.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'survey.ky',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/land-surveyors' FROM "Company" co WHERE (co."nameKey" IN ('abernethyassociates') OR co."domain"='survey.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='survey.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='survey.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'abodecayman.com',"id",'https://abodecayman.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('abodepropertymanagement') OR co."domain"='abodecayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='abodecayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='abodecayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'advancefireltd.com',"id",'https://www.renuspace.ky/business-profile/advance-fire-plumbing-ltd' FROM "Company" co WHERE (co."nameKey" IN ('advancefireplumbing') OR co."domain"='advancefireltd.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='advancefireltd.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='advancefireltd.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'affordablesolar.ky',"id",'https://www.renuspace.ky/business-profile/affordable-solar' FROM "Company" co WHERE (co."nameKey" IN ('affordablesolar') OR co."domain"='affordablesolar.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='affordablesolar.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='affordablesolar.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'airsupply.ky',"id",'https://www.renuspace.ky/business-profile/air-supply-cayman' FROM "Company" co WHERE (co."nameKey" IN ('airsupplycayman') OR co."domain"='airsupply.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='airsupply.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='airsupply.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'alivedesign.net',"id",'https://www.renuspace.ky/business-profile/alive-design' FROM "Company" co WHERE (co."nameKey" IN ('alivedesign') OR co."domain"='alivedesign.net') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='alivedesign.net') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='alivedesign.net')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'alpha.ky',"id",'https://www.alpha.ky/contact' FROM "Company" co WHERE (co."nameKey" IN ('alphaconstructiondevelopment') OR co."domain"='alpha.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='alpha.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='alpha.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ambltd.org',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/general-contractors' FROM "Company" co WHERE (co."nameKey" IN ('ambconstruction') OR co."domain"='ambltd.org') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ambltd.org') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ambltd.org')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'amr.ky',"id",'https://www.amr.ky/' FROM "Company" co WHERE (co."nameKey" IN ('amrconsultingengineers') OR co."domain"='amr.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='amr.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='amr.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'andro.ky',"id",'https://andro.ky/contact' FROM "Company" co WHERE (co."nameKey" IN ('androgroup') OR co."domain"='andro.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='andro.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='andro.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'apexgroup.ky',"id",'https://www.renuspace.ky/business-profile/apex-perimeter-protection-ltd' FROM "Company" co WHERE (co."nameKey" IN ('apexperimeterprotection') OR co."domain"='apexgroup.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='apexgroup.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='apexgroup.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'appliancepros.ky',"id",'https://caymanresident.com/housing/home-improvements/general-maintenance-repairs' FROM "Company" co WHERE (co."nameKey" IN ('appliancepros') OR co."domain"='appliancepros.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='appliancepros.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='appliancepros.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'aquabayclub.com',"id",'https://www.aquabayclub.com/wp-content/uploads/2024/08/Aqua-Bay-Club-Welcome-Package.pdf' FROM "Company" co WHERE (co."nameKey" IN ('aquabayclub') OR co."domain"='aquabayclub.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='aquabayclub.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='aquabayclub.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'aquadynamics.ky',"id",'https://www.aquadynamics.ky/' FROM "Company" co WHERE (co."nameKey" IN ('aquadynamics') OR co."domain"='aquadynamics.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='aquadynamics.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='aquadynamics.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'arcadia.ky',"id",'https://www.renuspace.ky/business-profile/arcadia-landscape-design-and-consulting' FROM "Company" co WHERE (co."nameKey" IN ('arcadialandscapedesignandconsulting') OR co."domain"='arcadia.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='arcadia.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='arcadia.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'arch-godfrey.com',"id",'https://arch-godfrey.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('archandgodfreycayman') OR co."domain"='arch-godfrey.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='arch-godfrey.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='arch-godfrey.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'archglasscayman.com',"id",'https://www.renuspace.ky/business-profile/arch-glass-aluminum-ltd' FROM "Company" co WHERE (co."nameKey" IN ('archglassaluminum') OR co."domain"='archglasscayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='archglasscayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='archglasscayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'amw.ky',"id",'https://www.cca.ky/artisan-metal-works' FROM "Company" co WHERE (co."nameKey" IN ('artisanmetalworks') OR co."domain"='amw.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='amw.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='amw.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ashmorealexander.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/ashmore-alexander' FROM "Company" co WHERE (co."nameKey" IN ('ashmorealexander') OR co."domain"='ashmorealexander.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ashmorealexander.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ashmorealexander.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'aslcourier.com',"id",'https://aslcourier.com/' FROM "Company" co WHERE (co."nameKey" IN ('aslshippinglogistics') OR co."domain"='aslcourier.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='aslcourier.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='aslcourier.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'avatapsl.com',"id",'https://www.avatapsl.com/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('avatapropertyservices') OR co."domain"='avatapsl.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='avatapsl.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='avatapsl.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'azurerealtycayman.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/azure-realty-ltd' FROM "Company" co WHERE (co."nameKey" IN ('azurerealty') OR co."domain"='azurerealtycayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='azurerealtycayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='azurerealtycayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'byg.ky',"id",'https://www.renuspace.ky/business-profile/backyard-gardeners' FROM "Company" co WHERE (co."nameKey" IN ('backyardgardeners') OR co."domain"='byg.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='byg.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='byg.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'bcqs.com',"id",'https://www.careers.ky/jobs/W6Y4J4' FROM "Company" co WHERE (co."nameKey" IN ('bcqsinternational') OR co."domain"='bcqs.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='bcqs.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='bcqs.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'bcqspropertymanagement.com',"id",'https://www.bcqspropertymanagement.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('bcqspropertymanagement') OR co."domain"='bcqspropertymanagement.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='bcqspropertymanagement.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='bcqspropertymanagement.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'bdcl.ky',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('bdclarchitects') OR co."domain"='bdcl.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='bdcl.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='bdcl.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'bedsidemanor.ky',"id",'https://www.renuspace.ky/business-profile/bedside-manor' FROM "Company" co WHERE (co."nameKey" IN ('bedsidemanor') OR co."domain"='bedsidemanor.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='bedsidemanor.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='bedsidemanor.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'bhhscaymanislands.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/berkshire-hathaway-homeservices-cayman-islands' FROM "Company" co WHERE (co."nameKey" IN ('berkshirehathawayhomeservicescaymanislands') OR co."domain"='bhhscaymanislands.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='bhhscaymanislands.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='bhhscaymanislands.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'brandsourcecayman.com',"id",'https://www.renuspace.ky/business-profile/custom-closets' FROM "Company" co WHERE (co."nameKey" IN ('brandsourcehomegallery','customclosets') OR co."domain"='brandsourcecayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='brandsourcecayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='brandsourcecayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'britthay.com',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('britthayelectric') OR co."domain"='britthay.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='britthay.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='britthay.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'buildcayman.ky',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/general-contractors' FROM "Company" co WHERE (co."nameKey" IN ('buildcayman') OR co."domain"='buildcayman.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='buildcayman.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='buildcayman.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cdshuttersandscreens.com',"id",'https://www.renuspace.ky/business-profile/c-d-shutters-and-screens' FROM "Company" co WHERE (co."nameKey" IN ('cdshuttersandscreens') OR co."domain"='cdshuttersandscreens.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cdshuttersandscreens.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cdshuttersandscreens.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'candwltd.ky',"id",'https://www.renuspace.ky/business-profile/c-w-electrical-renovations-ltd' FROM "Company" co WHERE (co."nameKey" IN ('cwelectricalrenovations') OR co."domain"='candwltd.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='candwltd.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='candwltd.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caribclub.com',"id",'https://www.caribclub.com/about-us' FROM "Company" co WHERE (co."nameKey" IN ('caribbeanclub') OR co."domain"='caribclub.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caribclub.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caribclub.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ciwindows.com',"id",'https://www.renuspace.ky/business-profile/caribbean-impact-windows-doors' FROM "Company" co WHERE (co."nameKey" IN ('caribbeanimpactwindowsdoors') OR co."domain"='ciwindows.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ciwindows.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ciwindows.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'catalyst.ky',"id",'https://www.renuspace.ky/business-profile/catalyst' FROM "Company" co WHERE (co."nameKey" IN ('catalyst') OR co."domain"='catalyst.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='catalyst.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='catalyst.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caycargo.ky',"id",'https://caycargo.ky/contact/' FROM "Company" co WHERE (co."nameKey" IN ('caycargo') OR co."domain"='caycargo.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caycargo.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caycargo.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cayconstruction.ky',"id",'https://www.renuspace.ky/business-profile/cay-construction' FROM "Company" co WHERE (co."nameKey" IN ('cayconstruction') OR co."domain"='cayconstruction.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cayconstruction.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cayconstruction.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ccc.ky',"id",'https://www.caymanclimatecontrols.com/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('caymanclimatecontrols') OR co."domain"='ccc.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ccc.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ccc.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caymanepoxy.com',"id",'https://www.renuspace.ky/business-profile/caymanepoxysolutions' FROM "Company" co WHERE (co."nameKey" IN ('caymanepoxysolutions') OR co."domain"='caymanepoxy.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caymanepoxy.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caymanepoxy.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'seaboardcayman.com',"id",'https://www.seaboardmarine.com/grand-cayman/' FROM "Company" co WHERE (co."nameKey" IN ('caymanfreightshippingservicesseaboardmarine') OR co."domain"='seaboardcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='seaboardcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='seaboardcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caymangeneral.com',"id",'https://www.renuspace.ky/business-profile/cayman-general-contractors' FROM "Company" co WHERE (co."nameKey" IN ('caymangeneralcontractors','caymangeneralcontractor') OR co."domain"='caymangeneral.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caymangeneral.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caymangeneral.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caymangrowers.com',"id",'https://caymanresident.com/shopping/garden-centres' FROM "Company" co WHERE (co."nameKey" IN ('caymangrowers') OR co."domain"='caymangrowers.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caymangrowers.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caymangrowers.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cip.realestate',"id",'https://www.cireba.com/find-cayman-real-estate-company/cayman-islands-properties' FROM "Company" co WHERE (co."nameKey" IN ('caymanislandsproperties') OR co."domain"='cip.realestate') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cip.realestate') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cip.realestate')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cisheetmetal.com',"id",'https://www.cisheetmetal.com/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('caymanislandssheetmetal') OR co."domain"='cisheetmetal.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cisheetmetal.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cisheetmetal.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'sothebysrealty.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/cayman-islands-sotheby-s-int-l-realty' FROM "Company" co WHERE (co."nameKey" IN ('caymanislandssothebysintlrealty') OR co."domain"='sothebysrealty.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='sothebysrealty.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='sothebysrealty.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caymanmechanical.com',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('caymanmechanical') OR co."domain"='caymanmechanical.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caymanmechanical.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caymanmechanical.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caymanpropertyconsulting.com',"id",'https://caymanpropertyconsulting.com/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('caymanpropertyconsulting') OR co."domain"='caymanpropertyconsulting.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caymanpropertyconsulting.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caymanpropertyconsulting.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caymanrepairs.com',"id",'https://www.renuspace.ky/business-profile/cayman-repairs' FROM "Company" co WHERE (co."nameKey" IN ('caymanrepairs') OR co."domain"='caymanrepairs.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caymanrepairs.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caymanrepairs.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caymanroutes.com',"id",'https://caymanroutes.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('caymanroutesislandtours') OR co."domain"='caymanroutes.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caymanroutes.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caymanroutes.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caymanvillas.com',"id",'https://www.caymanvillas.com/' FROM "Company" co WHERE (co."nameKey" IN ('caymanvillas') OR co."domain"='caymanvillas.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caymanvillas.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caymanvillas.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'caytechac.com',"id",'https://caytechac.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('caytechairconditioning') OR co."domain"='caytechac.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='caytechac.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='caytechac.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cel.ky',"id",'https://www.renuspace.ky/business-profile/cel-cooling-supply' FROM "Company" co WHERE (co."nameKey" IN ('celcoolingsupply') OR co."domain"='cel.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cel.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cel.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'c21cayman.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/century-21-thompson' FROM "Company" co WHERE (co."nameKey" IN ('century21thompsonrealty') OR co."domain"='c21cayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='c21cayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='c21cayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'chalmersgibbs.ky',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('chalmersgibbsarchitects') OR co."domain"='chalmersgibbs.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='chalmersgibbs.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='chalmersgibbs.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'charterland.ky',"id",'https://www.charterland.ky/contact/' FROM "Company" co WHERE (co."nameKey" IN ('charterland') OR co."domain"='charterland.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='charterland.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='charterland.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'christophercolumbuscondos.com',"id",'https://www.cita.ky/beta/condos-villas/christopher-columbus' FROM "Company" co WHERE (co."nameKey" IN ('christophercolumbuscondos') OR co."domain"='christophercolumbuscondos.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='christophercolumbuscondos.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='christophercolumbuscondos.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'clan.ky',"id",'https://caymanresident.com/profile/clan-construction-ltd' FROM "Company" co WHERE (co."nameKey" IN ('clanconstruction') OR co."domain"='clan.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='clan.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='clan.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cleancayman.com',"id",'https://www.renuspace.ky/business-profile/clean-cayman' FROM "Company" co WHERE (co."nameKey" IN ('cleancayman') OR co."domain"='cleancayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cleancayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cleancayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cmec.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('cmec') OR co."domain"='cmec.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cmec.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cmec.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'coastalrealty.ky',"id",'https://www.coastalrealty.ky/' FROM "Company" co WHERE (co."nameKey" IN ('coastalrealty') OR co."domain"='coastalrealty.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='coastalrealty.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='coastalrealty.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'compasspoint.ky',"id",'https://www.compasspointdiveresort.com/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('compasspointdiveresort') OR co."domain"='compasspoint.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='compasspoint.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='compasspoint.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'completeconstruction.ky',"id",'https://www.completeconstruction.ky/' FROM "Company" co WHERE (co."nameKey" IN ('completeconstruction') OR co."domain"='completeconstruction.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='completeconstruction.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='completeconstruction.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'coolingpros.ky',"id",'https://caymanresident.com/housing/running-your-home/air-conditioning' FROM "Company" co WHERE (co."nameKey" IN ('coolingpros') OR co."domain"='coolingpros.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='coolingpros.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='coolingpros.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'coralstoneclub.com',"id",'https://www.coralstoneclub.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('coralstoneclub') OR co."domain"='coralstoneclub.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='coralstoneclub.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='coralstoneclub.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'corcorancayman.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/corcoran-cayman-islands' FROM "Company" co WHERE (co."nameKey" IN ('corcorancaymanislands') OR co."domain"='corcorancayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='corcorancayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='corcorancayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cornerstonegroup.ky',"id",'https://www.renuspace.ky/business-profile/cornerstone-group' FROM "Company" co WHERE (co."nameKey" IN ('cornerstonegroup') OR co."domain"='cornerstonegroup.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cornerstonegroup.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cornerstonegroup.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'corporate-electric.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('corporateelectric') OR co."domain"='corporate-electric.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='corporate-electric.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='corporate-electric.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'crightonproperties.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/crighton-properties' FROM "Company" co WHERE (co."nameKey" IN ('crightonproperties') OR co."domain"='crightonproperties.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='crightonproperties.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='crightonproperties.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'cynthiatranel.com',"id",'https://www.cynthiatranel.com/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('cynthiatranelstudio','labelcdesigns') OR co."domain"='cynthiatranel.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='cynthiatranel.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='cynthiatranel.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'labelcdesigns.com',"id",'https://www.cynthiatranel.com/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('cynthiatranelstudio','labelcdesigns') OR co."domain"='cynthiatranel.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='labelcdesigns.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='labelcdesigns.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'dart.ky',"id",'https://www.dart.ky/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('dart') OR co."domain"='dart.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='dart.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='dart.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'davenport.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('davenportdevelopment') OR co."domain"='davenport.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='davenport.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='davenport.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'dpms.ky',"id",'https://www.davenportpropertyservices.ky/contact' FROM "Company" co WHERE (co."nameKey" IN ('davenportpropertymanagementservices') OR co."domain"='dpms.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='dpms.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='dpms.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'dbmconstruction.ky',"id",'https://www.dbmconstruction.ky/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('dbmconstruction') OR co."domain"='dbmconstruction.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='dbmconstruction.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='dbmconstruction.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ddlstudio.com',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('ddlstudio') OR co."domain"='ddlstudio.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ddlstudio.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ddlstudio.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'deccoltd.com',"id",'https://www.casecayman.org/engineering' FROM "Company" co WHERE (co."nameKey" IN ('decco') OR co."domain"='deccoltd.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='deccoltd.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='deccoltd.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'design-cayman.ky',"id",'https://www.design-cayman.ky/contact/' FROM "Company" co WHERE (co."nameKey" IN ('designcayman','designcaymanarchitects') OR co."domain"='design-cayman.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='design-cayman.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='design-cayman.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'designstudio.ky',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('designstudio') OR co."domain"='designstudio.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='designstudio.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='designstudio.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'dewpointair.com',"id",'https://www.renuspace.ky/business-profile/dew-point-air-conditioning-refrigeration-ltd' FROM "Company" co WHERE (co."nameKey" IN ('dewpointairconditioningrefrigeration') OR co."domain"='dewpointair.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='dewpointair.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='dewpointair.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'discoverypointclub.com',"id",'https://www.cita.ky/where-to-stay/discovery-point-club' FROM "Company" co WHERE (co."nameKey" IN ('discoverypointclubstrata81') OR co."domain"='discoverypointclub.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='discoverypointclub.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='discoverypointclub.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'doortek.ky',"id",'https://www.renuspace.ky/business-profile/doortek' FROM "Company" co WHERE (co."nameKey" IN ('doortek') OR co."domain"='doortek.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='doortek.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='doortek.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'dreamscapedesign.ky',"id",'https://www.renuspace.ky/business-profile/dreamscape-design' FROM "Company" co WHERE (co."nameKey" IN ('dreamscapedesign') OR co."domain"='dreamscapedesign.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='dreamscapedesign.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='dreamscapedesign.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ecohousecayman.com',"id",'https://www.renuspace.ky/business-profile/eco-house-cayman' FROM "Company" co WHERE (co."nameKey" IN ('ecohousecayman') OR co."domain"='ecohousecayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ecohousecayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ecohousecayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ecosmart.ky',"id",'https://caymanresident.com/housing/running-your-home/air-conditioning' FROM "Company" co WHERE (co."nameKey" IN ('ecosmartcooling') OR co."domain"='ecosmart.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ecosmart.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ecosmart.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'edgewater.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('edgewaterdevelopment','edgewaterproperties') OR co."domain"='edgewater.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='edgewater.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='edgewater.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ediesdecor.ky',"id",'https://www.renuspace.ky/business-profile/edie-s-decor' FROM "Company" co WHERE (co."nameKey" IN ('ediesdecor') OR co."domain"='ediesdecor.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ediesdecor.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ediesdecor.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'efcon.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('efconconstruction') OR co."domain"='efcon.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='efcon.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='efcon.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT '81west.ky',"id",'https://caymanresident.com/shopping/garden-centres' FROM "Company" co WHERE (co."nameKey" IN ('eightyonewestbotanicemporium') OR co."domain"='81west.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='81west.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='81west.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'electratech.ky',"id",'https://alarm.ky/contact/' FROM "Company" co WHERE (co."nameKey" IN ('electratechservices') OR co."domain"='electratech.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='electratech.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='electratech.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'elevar.ky',"id",'https://www.elevar.ky/' FROM "Company" co WHERE (co."nameKey" IN ('elevar') OR co."domain"='elevar.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='elevar.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='elevar.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'encompasscayman.com',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/general-contractors' FROM "Company" co WHERE (co."nameKey" IN ('encompass') OR co."domain"='encompasscayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='encompasscayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='encompasscayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'entechky.com',"id",'https://www.renuspace.ky/business-profile/entech-ltd' FROM "Company" co WHERE (co."nameKey" IN ('entech') OR co."domain"='entechky.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='entechky.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='entechky.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'eracayman.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/era-cayman-islands' FROM "Company" co WHERE (co."nameKey" IN ('eracaymanislands') OR co."domain"='eracayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='eracayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='eracayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'emscayman.com',"id",'https://emscayman.com/' FROM "Company" co WHERE (co."nameKey" IN ('estatemanagementservices') OR co."domain"='emscayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='emscayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='emscayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ebt.com.ky',"id",'https://www.renuspace.ky/business-profile/every-blooming-thing' FROM "Company" co WHERE (co."nameKey" IN ('everybloomingthing') OR co."domain"='ebt.com.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ebt.com.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ebt.com.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'evolvingisland.com',"id",'https://www.renuspace.ky/business-profile/evolving-island' FROM "Company" co WHERE (co."nameKey" IN ('evolvingisland') OR co."domain"='evolvingisland.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='evolvingisland.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='evolvingisland.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'fsgroup.ky',"id",'https://www.fsgroup.ky/' FROM "Company" co WHERE (co."nameKey" IN ('fairwaystructuralgroup') OR co."domain"='fsgroup.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='fsgroup.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='fsgroup.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'fedaservices.com',"id",'https://caymanresident.com/housing/home-improvements/general-maintenance-repairs' FROM "Company" co WHERE (co."nameKey" IN ('fedamaintenanceservices') OR co."domain"='fedaservices.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='fedaservices.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='fedaservices.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'firstimpression.ky',"id",'https://www.firstimpression.ky/contact-first-impression' FROM "Company" co WHERE (co."nameKey" IN ('firstimpression') OR co."domain"='firstimpression.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='firstimpression.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='firstimpression.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'flowersgroup.com',"id",'https://caymanresident.com/profile/flowers-block' FROM "Company" co WHERE (co."nameKey" IN ('flowersblockflowersgroup') OR co."domain"='flowersgroup.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='flowersgroup.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='flowersgroup.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'forged-construction.com',"id",'https://www.forged-construction.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('forgedconstruction') OR co."domain"='forged-construction.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='forged-construction.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='forged-construction.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'frasercayman.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/fraser-properties-cayman-ltd' FROM "Company" co WHERE (co."nameKey" IN ('fraserpropertiescayman') OR co."domain"='frasercayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='frasercayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='frasercayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'frederickmcrae.com',"id",'https://www.renuspace.ky/business-profile/frederick-mcrae-ltd' FROM "Company" co WHERE (co."nameKey" IN ('frederickmcrae') OR co."domain"='frederickmcrae.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='frederickmcrae.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='frederickmcrae.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'freightproscayman.com',"id",'https://freightproscayman.com/' FROM "Company" co WHERE (co."nameKey" IN ('freightproscayman') OR co."domain"='freightproscayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='freightproscayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='freightproscayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'gmcgeneralcontractors.com',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('gmcgeneralcontractors') OR co."domain"='gmcgeneralcontractors.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='gmcgeneralcontractors.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='gmcgeneralcontractors.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'gpepro.com',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/general-contractors' FROM "Company" co WHERE (co."nameKey" IN ('gpeservices') OR co."domain"='gpepro.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='gpepro.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='gpepro.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'gracerms.com',"id",'https://www.renuspace.ky/business-profile/grace-repairs-and-maintenance-services' FROM "Company" co WHERE (co."nameKey" IN ('gracerepairsmaintenanceservices') OR co."domain"='gracerms.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='gracerms.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='gracerms.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'grandcaymanpropertyservices.com',"id",'https://grandcaymanpropertyservices.com/' FROM "Company" co WHERE (co."nameKey" IN ('grandcaymanpropertyservices') OR co."domain"='grandcaymanpropertyservices.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='grandcaymanpropertyservices.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='grandcaymanpropertyservices.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'grandcaymanvillas.com',"id",'https://www.grandcaymanvillas.com/about-us/' FROM "Company" co WHERE (co."nameKey" IN ('grandcaymanvillascondos') OR co."domain"='grandcaymanvillas.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='grandcaymanvillas.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='grandcaymanvillas.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'grandcaymanian.com',"id",'https://grandcaymanian.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('grandcaymanianresortsuitesholidayinnresortgrandcayman') OR co."domain"='grandcaymanian.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='grandcaymanian.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='grandcaymanian.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'graniteexpresscayman.com',"id",'https://www.renuspace.ky/business-profile/granite-express' FROM "Company" co WHERE (co."nameKey" IN ('graniteexpresscayman') OR co."domain"='graniteexpresscayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='graniteexpresscayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='graniteexpresscayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'greentech.ky',"id",'https://www.renuspace.ky/business-profile/green-tech-cayman' FROM "Company" co WHERE (co."nameKey" IN ('greentechcayman','greentechsolar') OR co."domain"='greentech.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='greentech.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='greentech.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'grimexltd.com',"id",'https://www.renuspace.ky/business-profile/grimex' FROM "Company" co WHERE (co."nameKey" IN ('grimex') OR co."domain"='grimexltd.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='grimexltd.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='grimexltd.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'growwiththeflow.ky',"id",'https://www.renuspace.ky/business-profile/grow-with-the-flow' FROM "Company" co WHERE (co."nameKey" IN ('growwiththeflow') OR co."domain"='growwiththeflow.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='growwiththeflow.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='growwiththeflow.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'handydandy.ky',"id",'https://caymanresident.com/housing/home-improvements/general-maintenance-repairs' FROM "Company" co WHERE (co."nameKey" IN ('handydandy') OR co."domain"='handydandy.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='handydandy.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='handydandy.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'handyhome.ky',"id",'https://handyhome.ky/about-us/' FROM "Company" co WHERE (co."nameKey" IN ('handyhome') OR co."domain"='handyhome.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='handyhome.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='handyhome.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'handymencan.com',"id",'https://handymencan.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('handymencan') OR co."domain"='handymencan.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='handymencan.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='handymencan.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'harbourheightscayman.com',"id",'https://www.harbourheightscayman.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('harbourheightscondominiums') OR co."domain"='harbourheightscayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='harbourheightscayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='harbourheightscayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'heritageandhinton.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/heritage-hinton-real-estate-ltd' FROM "Company" co WHERE (co."nameKey" IN ('heritagehintonrealestate') OR co."domain"='heritageandhinton.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='heritageandhinton.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='heritageandhinton.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'heritageholdings.ky',"id",'https://heritageholdings.ky/contact/' FROM "Company" co WHERE (co."nameKey" IN ('heritageholdings') OR co."domain"='heritageholdings.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='heritageholdings.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='heritageholdings.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'hislopcayman.com',"id",'https://www.renuspace.ky/business-profile/hislop-windows-doors' FROM "Company" co WHERE (co."nameKey" IN ('hislopwindowsdoors') OR co."domain"='hislopcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='hislopcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='hislopcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'homeandoutdoor.net',"id",'https://www.renuspace.ky/business-profile/home-outdoor' FROM "Company" co WHERE (co."nameKey" IN ('homeoutdoor') OR co."domain"='homeandoutdoor.net') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='homeandoutdoor.net') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='homeandoutdoor.net')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'homegas.com',"id",'https://www.cca.ky/home-gas-ltd' FROM "Company" co WHERE (co."nameKey" IN ('homegas') OR co."domain"='homegas.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='homegas.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='homegas.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'hometailor.ky',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('hometailor') OR co."domain"='hometailor.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='hometailor.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='hometailor.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'huiscayman.com',"id",'https://www.renuspace.ky/business-profile/huis' FROM "Company" co WHERE (co."nameKey" IN ('huis') OR co."domain"='huiscayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='huiscayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='huiscayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'hydessons.ky',"id",'https://www.renuspace.ky/business-profile/hydes-sons' FROM "Company" co WHERE (co."nameKey" IN ('hydessons') OR co."domain"='hydessons.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='hydessons.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='hydessons.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'idesignltd.com',"id",'https://idesignltd.com/' FROM "Company" co WHERE (co."nameKey" IN ('idesigninteriordesign') OR co."domain"='idesignltd.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='idesignltd.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='idesignltd.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'icia.ky',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/architects' FROM "Company" co WHERE (co."nameKey" IN ('instituteofcaymanislandsarchitects') OR co."domain"='icia.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='icia.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='icia.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'interiorconcepts.ky',"id",'https://interiorconcepts.ky/' FROM "Company" co WHERE (co."nameKey" IN ('interiorconcepts') OR co."domain"='interiorconcepts.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='interiorconcepts.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='interiorconcepts.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'idgcayman.com',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('interiordesigngroupidg') OR co."domain"='idgcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='idgcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='idgcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'irg.ky',"id",'https://www.irgcayman.com/our-property-management-services' FROM "Company" co WHERE (co."nameKey" IN ('internationalrealtygroupirg','internationalrealtygroup') OR co."domain"='irg.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='irg.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='irg.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ironshore.ky',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/general-contractors' FROM "Company" co WHERE (co."nameKey" IN ('ironshorecontracting') OR co."domain"='ironshore.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ironshore.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ironshore.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ishmealshutters.ky',"id",'https://www.renuspace.ky/business-profile/ishmeal-shutters' FROM "Company" co WHERE (co."nameKey" IN ('ishmealshutters') OR co."domain"='ishmealshutters.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ishmealshutters.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ishmealshutters.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'islandac.ky',"id",'https://islandac.ky/' FROM "Company" co WHERE (co."nameKey" IN ('islandairconditioningandmechanical') OR co."domain"='islandac.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='islandac.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='islandac.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'islandinteriors.com.ky',"id",'https://www.renuspace.ky/business-profile/island-interiors-ltd' FROM "Company" co WHERE (co."nameKey" IN ('islandinteriors') OR co."domain"='islandinteriors.com.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='islandinteriors.com.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='islandinteriors.com.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'islandpainting.ky',"id",'https://www.renuspace.ky/business-profile/island-painting' FROM "Company" co WHERE (co."nameKey" IN ('islandpainting') OR co."domain"='islandpainting.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='islandpainting.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='islandpainting.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'iwc.ky',"id",'https://islandwastecarriers.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('islandwastecarriers') OR co."domain"='iwc.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='iwc.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='iwc.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'itctile.net',"id",'https://www.renuspace.ky/business-profile/itc-tile' FROM "Company" co WHERE (co."nameKey" IN ('itctile') OR co."domain"='itctile.net') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='itctile.net') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='itctile.net')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'jrconstructionltd.ky',"id",'https://jrconstructionltd.ky/' FROM "Company" co WHERE (co."nameKey" IN ('jrconstruction') OR co."domain"='jrconstructionltd.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='jrconstructionltd.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='jrconstructionltd.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'jec.ky',"id",'https://www.jec.ky/request-a-quote/' FROM "Company" co WHERE (co."nameKey" IN ('jecpropertyconsultants') OR co."domain"='jec.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='jec.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='jec.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'johndoak.com',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('johndoakarchitecture') OR co."domain"='johndoak.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='johndoak.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='johndoak.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'rjda.ky',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/architects' FROM "Company" co WHERE (co."nameKey" IN ('johnsondesignarchitecture') OR co."domain"='rjda.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='rjda.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='rjda.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'kellerwilliams.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/keller-williams' FROM "Company" co WHERE (co."nameKey" IN ('kellerwilliams') OR co."domain"='kellerwilliams.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='kellerwilliams.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='kellerwilliams.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'kensington.ky',"id",'https://kensington.ky/' FROM "Company" co WHERE (co."nameKey" IN ('kensington') OR co."domain"='kensington.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='kensington.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='kensington.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'seafireresortandspa.com',"id",'https://www.seafireresortandspa.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('kimptonseafireresortspa') OR co."domain"='seafireresortandspa.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='seafireresortandspa.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='seafireresortandspa.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'kirkconcrete.ky',"id",'https://www.kirkconcrete.ky/contact' FROM "Company" co WHERE (co."nameKey" IN ('kirkconcrete') OR co."domain"='kirkconcrete.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='kirkconcrete.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='kirkconcrete.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'kuavo.com',"id",'https://www.kuavo.ky/strata-management/' FROM "Company" co WHERE (co."nameKey" IN ('kuavocayman','kuavo') OR co."domain"='kuavo.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='kuavo.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='kuavo.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'kwwoodwork.com',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('kwwoodwork') OR co."domain"='kwwoodwork.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='kwwoodwork.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='kwwoodwork.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'lehabitat.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('lehabitat','lehabitatcaymanislands') OR co."domain"='lehabitat.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='lehabitat.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='lehabitat.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'lesoleildor.com',"id",'https://www.lesoleildor.com/media/fbqfamtg/lsdo-brochure-nov-2025.pdf' FROM "Company" co WHERE (co."nameKey" IN ('lesoleildor') OR co."domain"='lesoleildor.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='lesoleildor.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='lesoleildor.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ledgerandlooms.com',"id",'https://www.renuspace.ky/business-profile/ledger-looms' FROM "Company" co WHERE (co."nameKey" IN ('ledgerlooms') OR co."domain"='ledgerandlooms.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ledgerandlooms.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ledgerandlooms.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'libertydesigns.ky',"id",'https://www.renuspace.ky/business-profile/liberty-designs' FROM "Company" co WHERE (co."nameKey" IN ('libertydesigns') OR co."domain"='libertydesigns.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='libertydesigns.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='libertydesigns.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'lightbox.ky',"id",'https://www.renuspace.ky/business-profile/lightbox' FROM "Company" co WHERE (co."nameKey" IN ('lightbox') OR co."domain"='lightbox.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='lightbox.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='lightbox.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'littlecayman.com',"id",'https://littlecayman.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('littlecaymanbeachresort') OR co."domain"='littlecayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='littlecayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='littlecayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'living.ky',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('livingky') OR co."domain"='living.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='living.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='living.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'logisticscaymanlimited.com',"id",'https://www.logisticscaymanltd.com/' FROM "Company" co WHERE (co."nameKey" IN ('logisticscayman') OR co."domain"='logisticscaymanlimited.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='logisticscaymanlimited.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='logisticscaymanlimited.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'londonhouse.ky',"id",'https://londonhouse.ky/' FROM "Company" co WHERE (co."nameKey" IN ('londonhousecondominiums') OR co."domain"='londonhouse.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='londonhouse.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='londonhouse.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'macplumbing.ky',"id",'https://caymanresident.com/housing/home-improvements/general-maintenance-repairs' FROM "Company" co WHERE (co."nameKey" IN ('macplumbingandmaintenanceservices') OR co."domain"='macplumbing.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='macplumbing.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='macplumbing.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'mbe.ky',"id",'https://mbe.ky/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('mailboxesetccayman') OR co."domain"='mbe.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='mbe.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='mbe.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'marksons.ky',"id",'https://www.renuspace.ky/business-profile/marksons-furniture-and-windows' FROM "Company" co WHERE (co."nameKey" IN ('marksonsfurnitureandwindows') OR co."domain"='marksons.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='marksons.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='marksons.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'mcalpineky.com',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('mcalpine') OR co."domain"='mcalpineky.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='mcalpineky.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='mcalpineky.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'mcruss.ky',"id",'https://www.casecayman.org/engineering' FROM "Company" co WHERE (co."nameKey" IN ('mcruss') OR co."domain"='mcruss.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='mcruss.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='mcruss.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'milanofurniture.ky',"id",'https://www.renuspace.ky/business-profile/milano-furniture' FROM "Company" co WHERE (co."nameKey" IN ('milanofurniture') OR co."domain"='milanofurniture.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='milanofurniture.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='milanofurniture.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'milestone.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/milestone-properties-cayman' FROM "Company" co WHERE (co."nameKey" IN ('milestonepropertiescayman') OR co."domain"='milestone.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='milestone.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='milestone.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'mjmdesignstudio.com',"id",'https://www.renuspace.ky/business-profile/mjm-design-studio' FROM "Company" co WHERE (co."nameKey" IN ('mjmdesignstudio') OR co."domain"='mjmdesignstudio.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='mjmdesignstudio.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='mjmdesignstudio.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'mrpowerguy.com',"id",'https://caymanresident.com/housing/running-your-home/electricians' FROM "Company" co WHERE (co."nameKey" IN ('mrpowerguy') OR co."domain"='mrpowerguy.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='mrpowerguy.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='mrpowerguy.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'mustcoolac.com',"id",'https://www.renuspace.ky/business-profile/must-cool-ac' FROM "Company" co WHERE (co."nameKey" IN ('mustcoolac') OR co."domain"='mustcoolac.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='mustcoolac.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='mustcoolac.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'mwproperty.management',"id",'https://caymanresident.com/housing/real-estate/property-management-services' FROM "Company" co WHERE (co."nameKey" IN ('mwpropertymanagement') OR co."domain"='mwproperty.management') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='mwproperty.management') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='mwproperty.management')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'nationalconcrete.ky',"id",'https://nationalconcrete.framer.website/' FROM "Company" co WHERE (co."nameKey" IN ('nationalconcrete') OR co."domain"='nationalconcrete.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='nationalconcrete.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='nationalconcrete.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'nationallogistics.ky',"id",'https://www.nationallogistics.ky/contact' FROM "Company" co WHERE (co."nameKey" IN ('nationallogistics') OR co."domain"='nationallogistics.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='nationallogistics.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='nationallogistics.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'nautic.ky',"id",'https://nautic.ky/contact/' FROM "Company" co WHERE (co."nameKey" IN ('nauticpropertyconsultants') OR co."domain"='nautic.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='nautic.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='nautic.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ncbgroup.ky',"id",'https://ncbgroup.ky/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('ncbgroup') OR co."domain"='ncbgroup.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ncbgroup.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ncbgroup.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ncifreight.com',"id",'https://ncifreight.com/location/cayman-islands' FROM "Company" co WHERE (co."nameKey" IN ('ncifreightlogistics') OR co."domain"='ncifreight.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ncifreight.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ncifreight.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'nudevelopments.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/netclues-4' FROM "Company" co WHERE (co."nameKey" IN ('nudevelopments') OR co."domain"='nudevelopments.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='nudevelopments.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='nudevelopments.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'nuenergy.ky',"id",'https://nuenergy.ky/' FROM "Company" co WHERE (co."nameKey" IN ('nuenergy') OR co."domain"='nuenergy.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='nuenergy.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='nuenergy.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'oadarchitects.com',"id",'https://www.renuspace.ky/business-profile/oad-architects' FROM "Company" co WHERE (co."nameKey" IN ('oadarchitects') OR co."domain"='oadarchitects.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='oadarchitects.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='oadarchitects.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'oasis.ky',"id",'https://oasis.ky/contact/' FROM "Company" co WHERE (co."nameKey" IN ('oasispoolspa') OR co."domain"='oasis.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='oasis.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='oasis.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'oceanclubcayman.com',"id",'https://www.oceanclubcayman.com/maps-and-contact' FROM "Company" co WHERE (co."nameKey" IN ('oceanclubstrata') OR co."domain"='oceanclubcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='oceanclubcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='oceanclubcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'oceanfrontrealty.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/oceanfront-realty-ltd' FROM "Company" co WHERE (co."nameKey" IN ('oceanfrontrealty') OR co."domain"='oceanfrontrealty.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='oceanfrontrealty.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='oceanfrontrealty.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'optimumengineering.ky',"id",'https://www.optimumengineering.ky/' FROM "Company" co WHERE (co."nameKey" IN ('optimumengineering') OR co."domain"='optimumengineering.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='optimumengineering.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='optimumengineering.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'otisair.ky',"id",'https://www.casecayman.org/engineering' FROM "Company" co WHERE (co."nameKey" IN ('otisair') OR co."domain"='otisair.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='otisair.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='otisair.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'paintpros.ky',"id",'https://www.renuspace.ky/business-profile/paint-pros-ltd' FROM "Company" co WHERE (co."nameKey" IN ('paintpros') OR co."domain"='paintpros.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='paintpros.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='paintpros.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'palmheights.com',"id",'https://palmheights.com/' FROM "Company" co WHERE (co."nameKey" IN ('palmheights') OR co."domain"='palmheights.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='palmheights.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='palmheights.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'paradise.ky',"id",'https://www.renuspace.ky/business-profile/paradise-landscaping' FROM "Company" co WHERE (co."nameKey" IN ('paradiselandscaping') OR co."domain"='paradise.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='paradise.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='paradise.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'paradisepropertiescayman.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/paradise-properties-cayman' FROM "Company" co WHERE (co."nameKey" IN ('paradisepropertiescayman') OR co."domain"='paradisepropertiescayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='paradisepropertiescayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='paradisepropertiescayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'paragon.ky',"id",'https://www.paragon.ky/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('paragonbuilders') OR co."domain"='paragon.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='paragon.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='paragon.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'paramountcarpets.ky',"id",'https://www.renuspace.ky/business-profile/paramount' FROM "Company" co WHERE (co."nameKey" IN ('paramount') OR co."domain"='paramountcarpets.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='paramountcarpets.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='paramountcarpets.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'parsonsac.com',"id",'https://caymanresident.com/housing/running-your-home/air-conditioning' FROM "Company" co WHERE (co."nameKey" IN ('parsonsairconditioning') OR co."domain"='parsonsac.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='parsonsac.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='parsonsac.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'pestkil.com',"id",'https://pestkil.com/' FROM "Company" co WHERE (co."nameKey" IN ('pestkil') OR co."domain"='pestkil.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='pestkil.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='pestkil.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'phoenix.com.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('phoenixconstruction') OR co."domain"='phoenix.com.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='phoenix.com.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='phoenix.com.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'pjconstruction.org',"id",'https://www.pjconstruction.org/' FROM "Company" co WHERE (co."nameKey" IN ('pjconstruction') OR co."domain"='pjconstruction.org') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='pjconstruction.org') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='pjconstruction.org')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'plantanacayman.com',"id",'https://www.plantanacayman.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('plantanacondominiums') OR co."domain"='plantanacayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='plantanacayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='plantanacayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'platinumpools.ky',"id",'https://www.renuspace.ky/business-profile/platinum-pool-care-ltd' FROM "Company" co WHERE (co."nameKey" IN ('platinumpoolcare') OR co."domain"='platinumpools.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='platinumpools.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='platinumpools.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'polarbear.ky',"id",'https://polarbear.ky/' FROM "Company" co WHERE (co."nameKey" IN ('polarbearairconditioning') OR co."domain"='polarbear.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='polarbear.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='polarbear.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'poolpatrol.ky',"id",'https://www.poolpatrol.ky/' FROM "Company" co WHERE (co."nameKey" IN ('poolpatrol') OR co."domain"='poolpatrol.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='poolpatrol.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='poolpatrol.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'poolscayman.ky',"id",'https://caymanresident.com/profile/pools-cayman' FROM "Company" co WHERE (co."nameKey" IN ('poolscayman') OR co."domain"='poolscayman.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='poolscayman.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='poolscayman.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'powerflower.ky',"id",'https://caymanresident.com/shopping/garden-centres' FROM "Company" co WHERE (co."nameKey" IN ('powerflower') OR co."domain"='powerflower.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='powerflower.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='powerflower.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'premierplumbing.ky',"id",'https://www.renuspace.ky/business-profile/premier-plumbing-services' FROM "Company" co WHERE (co."nameKey" IN ('premierplumbingservices') OR co."domain"='premierplumbing.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='premierplumbing.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='premierplumbing.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'propluscayman.com',"id",'https://www.renuspace.ky/business-profile/pro-plus-garden-centre' FROM "Company" co WHERE (co."nameKey" IN ('proplusgardencentre') OR co."domain"='propluscayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='propluscayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='propluscayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'propertycayman.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/property-cayman-ltd' FROM "Company" co WHERE (co."nameKey" IN ('propertycayman') OR co."domain"='propertycayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='propertycayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='propertycayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'propertymanagementcayman.com',"id",'https://www.propertymanagementcayman.com/' FROM "Company" co WHERE (co."nameKey" IN ('propertymanagementcayman') OR co."domain"='propertymanagementcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='propertymanagementcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='propertymanagementcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'propertypals.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/property-pals-ltd' FROM "Company" co WHERE (co."nameKey" IN ('propertypals') OR co."domain"='propertypals.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='propertypals.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='propertypals.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'prostarsconstruction.com',"id",'https://prostarsconstruction.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('prostarsconstruction') OR co."domain"='prostarsconstruction.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='prostarsconstruction.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='prostarsconstruction.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'provenanceproperties.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/provenance-properties-of-cayman-ltd' FROM "Company" co WHERE (co."nameKey" IN ('provenancepropertiesofcayman') OR co."domain"='provenanceproperties.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='provenanceproperties.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='provenanceproperties.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'rainbow.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('rainbowdevelopment','rainbowrealty') OR co."domain"='rainbow.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='rainbow.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='rainbow.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ramelectricalsupply.com',"id",'https://caymanchamber.ky/chamber-profile-ram-electrical-supply-ltd/' FROM "Company" co WHERE (co."nameKey" IN ('ramelectricalsupply') OR co."domain"='ramelectricalsupply.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ramelectricalsupply.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ramelectricalsupply.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'remax.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/remax-cayman-islands' FROM "Company" co WHERE (co."nameKey" IN ('remaxcaymanislands') OR co."domain"='remax.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='remax.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='remax.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'reedconsultingengineers.com',"id",'https://www.reedconsultingengineers.com/' FROM "Company" co WHERE (co."nameKey" IN ('reedconsultingengineers') OR co."domain"='reedconsultingengineers.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='reedconsultingengineers.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='reedconsultingengineers.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'regalbeach.ky',"id",'https://www.regalbeach.ky/contact-regal-beach-club/' FROM "Company" co WHERE (co."nameKey" IN ('regalbeachclub') OR co."domain"='regalbeach.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='regalbeach.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='regalbeach.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'reliable.ky',"id",'https://reliable.ky/' FROM "Company" co WHERE (co."nameKey" IN ('reliableindustries') OR co."domain"='reliable.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='reliable.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='reliable.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'remservices.ky',"id",'https://www.remservices.ky/' FROM "Company" co WHERE (co."nameKey" IN ('remservices') OR co."domain"='remservices.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='remservices.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='remservices.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'rhulens.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/rhulens' FROM "Company" co WHERE (co."nameKey" IN ('rhulens') OR co."domain"='rhulens.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='rhulens.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='rhulens.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ritchrealty.ky',"id",'https://caymanresident.com/housing/rentals/renting-a-property/rental-agents' FROM "Company" co WHERE (co."nameKey" IN ('ritchrealty') OR co."domain"='ritchrealty.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ritchrealty.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ritchrealty.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'rmsairconditioning.com',"id",'https://www.renuspace.ky/business-profile/rms-air-conditioning' FROM "Company" co WHERE (co."nameKey" IN ('rmsairconditioning') OR co."domain"='rmsairconditioning.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='rmsairconditioning.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='rmsairconditioning.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'roberttowell.com',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/architects' FROM "Company" co WHERE (co."nameKey" IN ('roberttowellarchitect') OR co."domain"='roberttowell.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='roberttowell.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='roberttowell.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'robson.construction',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/general-contractors' FROM "Company" co WHERE (co."nameKey" IN ('robsonconstruction') OR co."domain"='robson.construction') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='robson.construction') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='robson.construction')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'royallimocayman.com',"id",'https://royallimocayman.com/about' FROM "Company" co WHERE (co."nameKey" IN ('royallimo') OR co."domain"='royallimocayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='royallimocayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='royallimocayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'senergysolar.ky',"id",'https://www.renuspace.ky/business-profile/senergy-solar-cayman-ltd' FROM "Company" co WHERE (co."nameKey" IN ('senergysolarcayman') OR co."domain"='senergysolar.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='senergysolar.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='senergysolar.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'shoreline.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/shoreline-properties-cayman-islands' FROM "Company" co WHERE (co."nameKey" IN ('shorelinepropertiescaymanislands') OR co."domain"='shoreline.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='shoreline.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='shoreline.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'somanservicesltd.ky',"id",'https://www.renuspace.ky/business-profile/soman-services-ltd' FROM "Company" co WHERE (co."nameKey" IN ('somanservices') OR co."domain"='somanservicesltd.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='somanservicesltd.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='somanservicesltd.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'srcayman.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/sovereign-realty-10' FROM "Company" co WHERE (co."nameKey" IN ('sovereignrealty') OR co."domain"='srcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='srcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='srcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'spartanfencingky.com',"id",'https://www.renuspace.ky/business-profile/spartan-fencing' FROM "Company" co WHERE (co."nameKey" IN ('spartanfencing') OR co."domain"='spartanfencingky.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='spartanfencingky.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='spartanfencingky.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'splashinc.ky',"id",'https://splashinc.ky/2026/02/26/why-the-same-pool-costs-more-in-the-cayman-islands/' FROM "Company" co WHERE (co."nameKey" IN ('splash') OR co."domain"='splashinc.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='splashinc.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='splashinc.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'sprint.ky',"id",'https://sprint.ky/' FROM "Company" co WHERE (co."nameKey" IN ('sprintexpressservices') OR co."domain"='sprint.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='sprint.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='sprint.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'sshcayman.com',"id",'https://www.renuspace.ky/business-profile/ssh-cayman' FROM "Company" co WHERE (co."nameKey" IN ('sshcayman') OR co."domain"='sshcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='sshcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='sshcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'staffordflooring.com',"id",'https://www.renuspace.ky/business-profile/stafford-flooring' FROM "Company" co WHERE (co."nameKey" IN ('staffordflooring') OR co."domain"='staffordflooring.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='staffordflooring.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='staffordflooring.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'superiordrywallcayman.com',"id",'https://www.renuspace.ky/business-profile/superior-drywall-ltd' FROM "Company" co WHERE (co."nameKey" IN ('superiordrywall') OR co."domain"='superiordrywallcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='superiordrywallcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='superiordrywallcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'supermix.ky',"id",'https://www.supermix.ky/contact-us' FROM "Company" co WHERE (co."nameKey" IN ('supermix') OR co."domain"='supermix.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='supermix.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='supermix.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'surebuilt.ky',"id",'https://heritageholdings.ky/surebuilt/' FROM "Company" co WHERE (co."nameKey" IN ('surebuiltconstruction') OR co."domain"='surebuilt.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='surebuilt.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='surebuilt.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'synergycayman.com',"id",'https://synergy.ky/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('synergycayman') OR co."domain"='synergycayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='synergycayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='synergycayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'tensails.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/ten-sails-property-group-ltd' FROM "Company" co WHERE (co."nameKey" IN ('tensailspropertygroup') OR co."domain"='tensails.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='tensails.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='tensails.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'theguru.ky',"id",'https://www.renuspace.ky/business-profile/the-appliance-guru' FROM "Company" co WHERE (co."nameKey" IN ('theapplianceguru') OR co."domain"='theguru.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='theguru.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='theguru.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'avaloncayman.com',"id",'https://www.avaloncayman.com/contact' FROM "Company" co WHERE (co."nameKey" IN ('theavaloncondominiums') OR co."domain"='avaloncayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='avaloncayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='avaloncayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'beachcombergrandcayman.com',"id",'https://beachcombergrandcayman.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('thebeachcombergrandcayman') OR co."domain"='beachcombergrandcayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='beachcombergrandcayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='beachcombergrandcayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'grandviewcondos.com',"id",'https://www.cita.ky/the-grandview-strata' FROM "Company" co WHERE (co."nameKey" IN ('thegrandviewcondosstrata205') OR co."domain"='grandviewcondos.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='grandviewcondos.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='grandviewcondos.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'staylocale.com',"id",'https://staylocale.com/ufaq/who-do-you-call-about-maintenance/' FROM "Company" co WHERE (co."nameKey" IN ('thelocalehotelgrandcayman') OR co."domain"='staylocale.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='staylocale.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='staylocale.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'thepoolstoreltd.com',"id",'https://www.thepoolstoreltd.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('thepoolstore') OR co."domain"='thepoolstoreltd.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='thepoolstoreltd.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='thepoolstoreltd.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'thereef.com',"id",'https://www.cita.ky/wyndham-reef-resort' FROM "Company" co WHERE (co."nameKey" IN ('thereefbeachresortgrandcayman') OR co."domain"='thereef.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='thereef.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='thereef.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'security.ky',"id",'https://www.security.ky/' FROM "Company" co WHERE (co."nameKey" IN ('thesecuritycentre','securitycentre','caymansecuritycentre') OR co."domain"='security.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='security.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='security.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'westin-cayman.com',"id",'https://www.cita.ky/mobile/where-to-stay/westin-casuarina' FROM "Company" co WHERE (co."nameKey" IN ('thewestingrandcaymansevenmilebeachresortspa') OR co."domain"='westin-cayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='westin-cayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='westin-cayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'thermashield.ky',"id",'https://www.renuspace.ky/business-profile/therma-shield' FROM "Company" co WHERE (co."nameKey" IN ('thermashield') OR co."domain"='thermashield.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='thermashield.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='thermashield.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'tqh.ky',"id",'https://www.renuspace.ky/business-profile/thompson-quality-homes' FROM "Company" co WHERE (co."nameKey" IN ('thompsonqualityhomes') OR co."domain"='tqh.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='tqh.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='tqh.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'thompsonshipping.com',"id",'https://thompsonshipping.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('thompsonshipping') OR co."domain"='thompsonshipping.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='thompsonshipping.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='thompsonshipping.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'thpm.ky',"id",'https://www.thpm.ky/contact' FROM "Company" co WHERE (co."nameKey" IN ('thpmrealestate') OR co."domain"='thpm.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='thpm.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='thpm.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'tibbettslogisticsci.com',"id",'https://tibbettslogisticsci.com/contact-us/' FROM "Company" co WHERE (co."nameKey" IN ('tibbettslogistics') OR co."domain"='tibbettslogisticsci.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='tibbettslogisticsci.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='tibbettslogisticsci.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'tridentproperties.ky',"id",'https://www.cireba.com/find-cayman-real-estate-company/trident-properties-cayman-islands-ltd' FROM "Company" co WHERE (co."nameKey" IN ('tridentpropertiescaymanislands') OR co."domain"='tridentproperties.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='tridentproperties.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='tridentproperties.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'trioarchitects.com',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('trioarchitecture') OR co."domain"='trioarchitects.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='trioarchitects.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='trioarchitects.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'trio-design.net',"id",'https://caymanresident.com/housing/home-improvements/interior-designers' FROM "Company" co WHERE (co."nameKey" IN ('trioarchitecture') OR co."domain"='trioarchitects.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='trio-design.net') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='trio-design.net')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'tag.ky',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/general-contractors' FROM "Company" co WHERE (co."nameKey" IN ('tropicalarchitecturaldevelopmentgrouptag','tropicalarchitecturalgroup') OR co."domain"='tag.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='tag.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='tag.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'turtlenestinn.com',"id",'https://www.turtlenestinn.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('turtlenestinncondos') OR co."domain"='turtlenestinn.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='turtlenestinn.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='turtlenestinn.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'ucltd.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('unitedcontracting') OR co."domain"='ucltd.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='ucltd.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='ucltd.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'units.ky',"id",'https://www.cca.ky/members-directory/regular-members' FROM "Company" co WHERE (co."nameKey" IN ('units') OR co."domain"='units.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='units.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='units.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'vigoro.ky',"id",'https://caymanresident.com/shopping/garden-centres' FROM "Company" co WHERE (co."nameKey" IN ('vigoronursery','vigoroagricoladrive','vigorowalkersroad') OR co."domain"='vigoro.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='vigoro.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='vigoro.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'villasofthegalleon.com',"id",'https://www.villasofthegalleon.com/contact/' FROM "Company" co WHERE (co."nameKey" IN ('villasofthegalleon') OR co."domain"='villasofthegalleon.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='villasofthegalleon.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='villasofthegalleon.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'equipmentservices.ky',"id",'https://www.renuspace.ky/business-profile/walter-hislop-services' FROM "Company" co WHERE (co."nameKey" IN ('watlerhislopservices') OR co."domain"='equipmentservices.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='equipmentservices.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='equipmentservices.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'watlersmetalproducts.ky',"id",'https://www.watlersmetalproducts.com/contact' FROM "Company" co WHERE (co."nameKey" IN ('watlersmetalproducts') OR co."domain"='watlersmetalproducts.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='watlersmetalproducts.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='watlersmetalproducts.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'westindiesbrokers.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/west-indies-brokers' FROM "Company" co WHERE (co."nameKey" IN ('westindiesbrokers') OR co."domain"='westindiesbrokers.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='westindiesbrokers.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='westindiesbrokers.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'westpoint-cayman.com',"id",'https://www.cca.ky/westpoint-construction-group-ltd' FROM "Company" co WHERE (co."nameKey" IN ('westpointconstructiongroup') OR co."domain"='westpoint-cayman.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='westpoint-cayman.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='westpoint-cayman.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'westpoint-inspections.com',"id",'https://caymanresident.com/housing/building-a-home/building-professionals/land-surveyors' FROM "Company" co WHERE (co."nameKey" IN ('westpointinspections') OR co."domain"='westpoint-inspections.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='westpoint-inspections.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='westpoint-inspections.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'williams2realestate.com',"id",'https://www.cireba.com/find-cayman-real-estate-company/williams2-real-estate' FROM "Company" co WHERE (co."nameKey" IN ('williams2realestate') OR co."domain"='williams2realestate.com') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='williams2realestate.com') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='williams2realestate.com')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
INSERT INTO "CompanyEmailDomain" ("domain","companyId","sourceUrl")
SELECT 'wizardscreen.ky',"id",'https://www.renuspace.ky/business-profile/wizard-cayman' FROM "Company" co WHERE (co."nameKey" IN ('wizardcayman') OR co."domain"='wizardscreen.ky') AND co."archivedAt" IS NULL AND NOT EXISTS(SELECT 1 FROM "Company" WHERE "domain"='wizardscreen.ky') AND NOT EXISTS(SELECT 1 FROM "SubCompany" WHERE "domain"='wizardscreen.ky')
ORDER BY co."id" LIMIT 1 ON CONFLICT DO NOTHING;
