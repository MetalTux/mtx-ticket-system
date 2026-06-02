// src/app/dashboard/users/[id]/edit/page.tsx
import UserStaffForm from "@/components/users/user-form";
import db from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.providerId || session.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  // Consultas en paralelo para mayor velocidad
  const [user, categories] = await Promise.all([
    // 1. Buscamos al usuario incluyendo sus categorías actuales
    db.user.findUnique({
      where: { id: id },
      include: {
        allowedCategories: { select: { id: true } }
      }
    }),
    // 2. Buscamos la lista maestra de categorías
    db.ticketCategory.findMany({
      where: { providerId: session.user.providerId, isActive: true },
      orderBy: { name: 'asc' }
    })
  ]);

  if (!user) notFound();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
        Modificar Usuario
      </h1>
      <UserStaffForm initialData={user} categories={categories} />
    </div>
  );
}