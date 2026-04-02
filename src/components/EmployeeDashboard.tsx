"use client";

import { useState, useEffect } from "react";

export default function EmployeeDashboard() {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEntries();
    fetchProjects();
  }, []);

  const fetchEntries = async () => {
    const res = await fetch("/api/time-entries");
    if (res.ok) {
      setEntries(await res.json());
    }
  };

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
        ? { id: editingId, date, hours, taskDescription, projectId }
        : { date, hours, taskDescription, projectId };

    const res = await fetch("/api/time-entries", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setDate("");
      setHours("");
      setTaskDescription("");
      setProjectId("");
      setEditingId(null);
      fetchEntries();
    } else {
      const data = await res.json();
      setError(data.error || `Failed to ${editingId ? 'update' : 'submit'} time entry`);
    }
  };

  const handleEdit = (entry: { id: string; date: string; hours: number; taskDescription: string; projectId: string; }) => {
      setEditingId(entry.id);
      setDate(new Date(entry.date).toISOString().split('T')[0]);
      setHours(entry.hours.toString());
      setTaskDescription(entry.taskDescription);
      setProjectId(entry.projectId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this entry?")) return;

      const res = await fetch("/api/time-entries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
          fetchEntries();
      } else {
          alert("Failed to delete entry");
      }
  };

  const cancelEdit = () => {
      setEditingId(null);
      setDate("");
      setHours("");
      setTaskDescription("");
      setProjectId("");
      setError("");
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded shadow text-black">
        <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Time Entry" : "Log Time"}</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Project</label>
            <select
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Project...</option>
              {projects.map((p: { id: string; name: string }) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-sm mb-1">Hours</label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex-[2]">
            <label className="block text-sm mb-1">Task Description</label>
            <input
              type="text"
              required
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded h-[42px]">
              {editingId ? "Update" : "Add Entry"}
            </button>
            {editingId && (
                <button type="button" onClick={cancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded h-[42px]">
                    Cancel
                </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow text-black">
        <h2 className="text-xl font-bold mb-4">My Past Entries</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Date</th>
              <th className="p-2">Project</th>
              <th className="p-2">Description</th>
              <th className="p-2">Hours</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry: { id: string; date: string; project: { name: string }; projectId: string; taskDescription: string; hours: number }) => (
              <tr key={entry.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="p-2">{entry.project?.name}</td>
                <td className="p-2">{entry.taskDescription}</td>
                <td className="p-2">{entry.hours}</td>
                <td className="p-2 text-right space-x-2">
                  <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-500 hover:text-blue-700 underline text-sm"
                  >
                      Edit
                  </button>
                  <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-500 hover:text-red-700 underline text-sm"
                  >
                      Delete
                  </button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No time entries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
