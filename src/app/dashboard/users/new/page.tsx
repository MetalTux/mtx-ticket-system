// src/app/dashboard/users/new/page.tsx
import UserStaffForm from "@/components/users/user-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewUserStaffPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Gestionar Personal</h1>
      <UserStaffForm />
    </div>
  );
}