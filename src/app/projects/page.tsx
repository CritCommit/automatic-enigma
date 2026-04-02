"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as { role?: string })?.role !== "BOSS") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, session, router]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      setProjects(await res.json());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const method = editingId ? "PUT" : "POST";
    const body = editingId
        ? { id: editingId, name, description }
        : { name, description };

    const res = await fetch("/api/projects", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setName("");
      setDescription("");
      setEditingId(null);
      fetchProjects();
    } else {
      const data = await res.json();
      setError(data.error || `Failed to ${editingId ? 'update' : 'create'} project`);
    }
  };

  const handleEdit = (project: { id: string; name: string; description: string }) => {
      setEditingId(project.id);
      setName(project.name);
      setDescription(project.description || "");
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
      setEditingId(null);
      setName("");
      setDescription("");
      setError("");
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session || (session.user as { role?: string })?.role !== "BOSS") return null;

  return (
    <div className="space-y-8 text-black">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Project" : "Add New Project"}</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-[1]">
            <label className="block text-sm mb-1">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex-[2]">
            <label className="block text-sm mb-1">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded h-[42px]">
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
                <button type="button" onClick={cancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded h-[42px]">
                    Cancel
                </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Active Projects</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Description</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project: { id: string; name: string; description: string }) => (
              <tr key={project.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{project.name}</td>
                <td className="p-2 text-gray-600">{project.description}</td>
                <td className="p-2 text-right">
                  <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-500 hover:text-blue-700 underline text-sm"
                  >
                      Edit
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
