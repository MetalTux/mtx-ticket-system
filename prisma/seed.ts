// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando el sembrado de GTSoft...')

  // 1. Proveedor Base (Buscamos primero para no duplicar si el seed se corre 2 veces)
  const provider = await prisma.providerCompany.findFirst({
    where: { id: 'cmnv443a20000c0gsqwr2cbgk' }
  })

  // 3. Estados Base (NUEVA LISTA EXPANDIDA)
  const statusData = [
    { name: 'Pendiente',               systemKey: 'OPEN',             color: '#64748b', order: 1 },
    { name: 'Escalado',                systemKey: 'ESCALATED',        color: '#f59e0b', order: 2 },
    { name: 'En Proceso',              systemKey: 'IN_PROGRESS',      color: '#0ea5e9', order: 3 },
    { name: 'Pendiente de Aprobación', systemKey: 'PENDING_APPROVAL', color: '#8b5cf6', order: 4 },
    { name: 'Pausado',                 systemKey: 'PAUSED',           color: '#71717a', order: 5 },
    { name: 'Entregado',               systemKey: 'DELIVERED',        color: '#06b6d4', order: 6 },
    { name: 'Resuelto',                systemKey: 'RESOLVED',         color: '#10b981', order: 7 },
    { name: 'Cancelado',               systemKey: 'CANCELLED',        color: '#ef4444', order: 8 },
  ]

  for (const s of statusData) {
    await prisma.ticketStatus.upsert({
      where: { 
        providerId_systemKey: { providerId: provider!.id, systemKey: s.systemKey } 
      },
      update: { name: s.name, color: s.color, order: s.order },
      create: { ...s, providerId: provider!.id }
    })
  }

  // 4. Prioridades Base
  const priorityData = [
    { name: 'Baja',    systemKey: 'LOW',    color: '#94a3b8', weight: 1 },
    { name: 'Media',   systemKey: 'MEDIUM', color: '#0ea5e9', weight: 2 },
    { name: 'Alta',    systemKey: 'HIGH',   color: '#f59e0b', weight: 3 },
    { name: 'Urgente', systemKey: 'URGENT', color: '#ef4444', weight: 4 },
  ]

  for (const p of priorityData) {
    await prisma.ticketPriority.upsert({
      where: { 
        providerId_systemKey: { providerId: provider!.id, systemKey: p.systemKey } 
      },
      update: { name: p.name, color: p.color, weight: p.weight },
      create: { ...p, providerId: provider!.id }
    })
  }

  // 6. TIPOS DE ATENCIÓN (NUEVO)
  const attentionTypesData = [
    { name: 'Soporte',  systemKey: 'SUPPORT' },
    { name: 'Garantía', systemKey: 'WARRANTY' },
    { name: 'Error',    systemKey: 'BUG' },
  ]

  for (const a of attentionTypesData) {
    await prisma.attentionType.upsert({
      where: { 
        providerId_systemKey: { providerId: provider!.id, systemKey: a.systemKey } 
      },
      update: { name: a.name },
      create: { ...a, providerId: provider!.id }
    })
  }

  // 7. NIVELES DE SOPORTE (NUEVO)
  const supportLevelsData = [
    {
      id: 'sl-basico', // ID forzado para permitir Upsert fácilmente
      name: 'Nivel Básico',
      description: 'Soporte estándar sin registro detallado de tiempos.',
      showTimeAnalysis: false,
      showTimeDev: false,
      showTimeSupport: false,
      showTimeUpdate: false,
    },
    {
      id: 'sl-medium',
      name: 'Nivel Medio',
      description: 'Soporte estándar con tiempo de respuesta más acotado.',
      showTimeAnalysis: true,
      showTimeDev: true,
      showTimeSupport: true,
      showTimeUpdate: true,
    },
    {
      id: 'sl-premium',
      name: 'Nivel Premium',
      description: 'Soporte prioritario con respuesta inmediata.',
      showTimeAnalysis: true,
      showTimeDev: true,
      showTimeSupport: true,
      showTimeUpdate: false,
    },
    {
      id: 'sl-dedicated',
      name: 'Nivel Dedicado',
      description: 'Soporte prioritario con SLA y desglose completo de horas de trabajo.',
      showTimeAnalysis: true,
      showTimeDev: true,
      showTimeSupport: true,
      showTimeUpdate: true,
    }
  ]

  for (const sl of supportLevelsData) {
    await prisma.supportLevel.upsert({
      where: { id: sl.id },
      update: { 
        name: sl.name, 
        description: sl.description,
        showTimeAnalysis: sl.showTimeAnalysis,
        showTimeDev: sl.showTimeDev,
        showTimeSupport: sl.showTimeSupport,
        showTimeUpdate: sl.showTimeUpdate
      },
      create: { ...sl, providerId: provider!.id }
    })
  }

  console.log('✅ Base de datos GTSoft alimentada con éxito.')
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })