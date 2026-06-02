// src/app/dashboard/users/new/page.tsx
import UserStaffForm from "@/components/users/user-form";
import { auth } from "@/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";

export default async function NewUserStaffPage() {
  const session = await auth();
  
  if (!session?.user?.providerId || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Traer las categorías activas para los checkboxes
  const categories = await db.ticketCategory.findMany({
    where: { providerId: session.user.providerId, isActive: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Gestionar Personal</h1>
      <UserStaffForm categories={categories} />
    </div>
  );
}