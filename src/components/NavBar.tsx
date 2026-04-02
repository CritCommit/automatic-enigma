"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Timesheet App
        </Link>
        <div>
          {session ? (
            <div className="flex items-center space-x-4">
              <span>{session.user?.name} ({(session.user as { role?: string })?.role})</span>
              {(session.user as { role?: string })?.role === "BOSS" && (
                <Link href="/projects" className="hover:underline">
                  Manage Projects
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
