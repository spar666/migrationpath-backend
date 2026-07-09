"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRegionalPostcodeBands1796000000000 = void 0;
class CreateRegionalPostcodeBands1796000000000 {
    name = 'CreateRegionalPostcodeBands1796000000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "regional_postcode_bands" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "region" character varying NOT NULL,
        "category" character varying NOT NULL,
        "postcode_from" integer NOT NULL,
        "postcode_to" integer NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "effective_date" date,
        "source_note" text,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_regional_postcode_bands" PRIMARY KEY ("id")
      );
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_regional_band_category" ON "regional_postcode_bands" ("category");`);
        const rows = [
            ['Greater Sydney', 'METRO', 2000, 2249],
            ['Greater Sydney', 'METRO', 2555, 2574],
            ['Greater Sydney', 'METRO', 2745, 2786],
            ['Greater Melbourne', 'METRO', 3000, 3207],
            ['Greater Melbourne', 'METRO', 3335, 3341],
            ['Greater Melbourne', 'METRO', 3427, 3443],
            ['Greater Melbourne', 'METRO', 3750, 3810],
            ['Greater Melbourne', 'METRO', 3910, 3944],
            ['Greater Melbourne', 'METRO', 3975, 3978],
            ['Greater Melbourne', 'METRO', 8000, 8999],
            ['Greater Brisbane', 'METRO', 4000, 4207],
            ['Greater Brisbane', 'METRO', 4300, 4305],
            ['Greater Brisbane', 'METRO', 4500, 4519],
            ['Wollongong / Illawarra', 'CATEGORY_2', 2500, 2534],
            ['Newcastle / Lake Macquarie', 'CATEGORY_2', 2280, 2310],
            ['Canberra (ACT)', 'CATEGORY_2', 2600, 2620],
            ['Canberra (ACT)', 'CATEGORY_2', 2900, 2920],
            ['Geelong', 'CATEGORY_2', 3211, 3230],
            ['Gold Coast', 'CATEGORY_2', 4208, 4287],
            ['Sunshine Coast', 'CATEGORY_2', 4550, 4575],
            ['Perth', 'CATEGORY_2', 6000, 6199],
            ['Adelaide', 'CATEGORY_2', 5000, 5199],
            ['Hobart', 'CATEGORY_2', 7000, 7099],
            ['Ballarat', 'CATEGORY_3', 3350, 3356],
            ['Bendigo', 'CATEGORY_3', 3550, 3556],
            ['Toowoomba', 'CATEGORY_3', 4350, 4390],
            ['Townsville', 'CATEGORY_3', 4810, 4825],
            ['Cairns', 'CATEGORY_3', 4868, 4879],
            ['Wagga Wagga', 'CATEGORY_3', 2650, 2652],
            ['Albury', 'CATEGORY_3', 2640, 2642],
            ['Launceston', 'CATEGORY_3', 7248, 7325],
            ['Darwin (NT)', 'CATEGORY_3', 800, 832],
        ];
        for (const [region, category, from, to] of rows) {
            await queryRunner.query(`INSERT INTO "regional_postcode_bands" ("region","category","postcode_from","postcode_to")
         VALUES ($1,$2,$3,$4);`, [region, category, from, to]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "regional_postcode_bands";`);
    }
}
exports.CreateRegionalPostcodeBands1796000000000 = CreateRegionalPostcodeBands1796000000000;
//# sourceMappingURL=1796000000000-CreateRegionalPostcodeBands.js.map