import { PRISMA } from "@common/constants";
import { type PrismaDB } from "@config/db";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export abstract class InjectedRespository {
  constructor(@Inject(PRISMA) protected readonly db: PrismaDB) {}
}
