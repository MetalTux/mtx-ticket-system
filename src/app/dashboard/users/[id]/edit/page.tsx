// src/app/dashboard/users/[id]/edit/page.tsx
import UserStaffForm from "@/components/users/user-form";
import db from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";

// Definimos el tipo de la prop params como una Promesa
interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  // DESENVOLVEMOS los params antes de usarlos
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id: id } // Ahora id ya no es undefined
  });

  if (!user) notFound();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
        Modificar Usuario
      </h1>
      <UserStaffForm initialData={user} />
    </div>
  );
}