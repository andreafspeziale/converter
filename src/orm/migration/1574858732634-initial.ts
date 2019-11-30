import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1574858732634 implements MigrationInterface {
    name = 'initial1574858732634'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "rate" ("id" BIGSERIAL NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "rate" text NOT NULL, "ticker" character varying(3) NOT NULL, CONSTRAINT "PK_2618d0d38af322d152ccc328f33" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "rate"`, undefined);
    }

}
