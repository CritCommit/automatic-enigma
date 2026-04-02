import { getSession } from "@/lib/auth";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import BossDashboard from "@/components/BossDashboard";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {session.user?.name}</h1>
      {role === "BOSS" ? <BossDashboard /> : <EmployeeDashboard />}
    </div>
  );
}
