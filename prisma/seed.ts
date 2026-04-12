// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt-ts";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Seed Global...");

  const password = await hash("@Gt21Mj19*", 10); // Cambia esto después

  // 1. Crear el Proveedor Global (La empresa dueña del software)
  const globalProvider = await prisma.providerCompany.upsert({
    where: { id: "gtsoft-global-id" }, // ID fijo para referencia
    update: {},
    create: {
      id: "gtsoft-global-id",
      name: "GTSoft Global Administration",
      isActive: true,
    },
  });

  // 2. Crear el Usuario SUPER_ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@gtsoft.cl" },
    update: {
      role: "SUPER_ADMIN",
      providerId: globalProvider.id,
    },
    create: {
      name: "Gestor Global",
      email: "superadmin@gtsoft.cl",
      password: password,
      role: "SUPER_ADMIN",
      providerId: globalProvider.id,
      isActive: true,
    },
  });

  console.log(`✅ Universo creado.`);
  console.log(`⭐ Super Admin: ${superAdmin.email}`);
  console.log(`🏢 Provider Maestro: ${globalProvider.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });