import { PrismaClient } from "@prisma/client";
import { caminhoBanco } from "./config/paths";

export const prisma = new PrismaClient({
  datasourceUrl: `file:${caminhoBanco()}`,
});