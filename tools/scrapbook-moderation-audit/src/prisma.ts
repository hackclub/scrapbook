import { PrismaClient } from "../../../apps/web/node_modules/@prisma/client/index.js";

export type AuditPrismaClient = InstanceType<typeof PrismaClient>;

export function createPrismaClient() {
  return new PrismaClient({
    log: ["warn", "error"]
  });
}
