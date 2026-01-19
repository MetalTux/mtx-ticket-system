// src/lib/db.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const prismaClientSingleton = () => {
  // Creamos el pool de conexiones usando la variable de entorno
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });
  
  // Instanciamos el adaptador
  const adapter = new PrismaPg(pool);
  
  // Retornamos el cliente usando el adaptador
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;