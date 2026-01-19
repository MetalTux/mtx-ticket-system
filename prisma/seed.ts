// prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Aseguramos la carga del .env
dotenv.config({ path: join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL no encontrada en el archivo .env");
}

// Configuramos el adaptador manualmente
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Iniciando el proceso de Seed con Generación Automática de IDs ---');

  // 1. Crear la Empresa Proveedora (Tu empresa de atención)
  const provider = await prisma.providerCompany.create({
    data: {
      name: 'Servicios IT Pro',
    },
  });
  console.log('✅ Empresa Proveedora creada:', provider.name, `(ID: ${provider.id})`);

  // 2. Crear un Usuario Administrador de la Empresa Proveedora
  const hashedAdminPassword = await bcrypt.hash('A123456z', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'jrios.03@hotmail.com',
      name: 'Juan Rios (Admin)',
      password: hashedAdminPassword,
      role: Role.ADMIN,
      providerId: provider.id, // Relación automática
    },
  });
  console.log('✅ Usuario Administrador creado:', adminUser.email);

  // 3. Crear una Empresa Cliente vinculada al Proveedor
  const client = await prisma.clientCompany.create({
    data: {
      name: 'Cliente Corporativo S.A.',
      providerId: provider.id,
    },
  });
  console.log('✅ Empresa Cliente creada:', client.name, `(ID: ${client.id})`);

  // 4. Crear un Contacto para esa Empresa Cliente
  const hashedClientPassword = await bcrypt.hash('Cliente123!', 10);
  const clientUser = await prisma.user.create({
    data: {
      email: 'metaltux.82@gmail.com',
      name: 'Metal Tux',
      password: hashedClientPassword,
      role: Role.CONTACTO_CLIENTE,
      clientId: client.id, // Relación automática
    },
  });
  console.log('✅ Usuario de Cliente creado:', clientUser.email);

  console.log('--- Seed finalizado con éxito ---');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en el Seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });