"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BossDashboard() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [projects, setProjects] = useState([]);

  // Filters
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterProject, setFilterProject] = useState("");

  useEffect(() => {
    fetchEntries();
    fetchProjects();
  }, []);

  useEffect(() => {
    let result = entries;
    if (filterEmployee) {
      result = result.filter((e: { user: { name: string } }) =>
        e.user?.name?.toLowerCase().includes(filterEmployee.toLowerCase())
      );
    }
    if (filterProject) {
      result = result.filter((e: { projectId: string }) => e.projectId === filterProject);
    }
    setFilteredEntries(result);
  }, [entries, filterEmployee, filterProject]);

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

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Timesheet Report", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Date", "Employee", "Project", "Description", "Hours"]],
      body: filteredEntries.map((e: { date: string; user: { name: string }; project: { name: string }; taskDescription: string; hours: number }) => [
        new Date(e.date).toLocaleDateString(),
        e.user?.name || "Unknown",
        e.project?.name || "Unknown",
        e.taskDescription,
        e.hours
      ]),
    });

    doc.save("timesheet-report.pdf");
  };

  return (
    <div className="bg-white p-6 rounded shadow text-black space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Master Timesheet</h2>
        <button onClick={exportPDF} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Export PDF
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm mb-1">Filter by Employee</label>
          <input
            type="text"
            placeholder="Search name..."
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Filter by Project</label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">All Projects</option>
            {projects.map((p: { id: string; name: string }) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="w-full text-left border-collapse mt-4">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2">Date</th>
            <th className="p-2">Employee</th>
            <th className="p-2">Project</th>
            <th className="p-2">Description</th>
            <th className="p-2">Hours</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry: { id: string; date: string; user: { name: string }; project: { name: string }; taskDescription: string; hours: number }) => (
            <tr key={entry.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{new Date(entry.date).toLocaleDateString()}</td>
              <td className="p-2">{entry.user?.name}</td>
              <td className="p-2">{entry.project?.name}</td>
              <td className="p-2">{entry.taskDescription}</td>
              <td className="p-2 font-bold">{entry.hours}</td>
            </tr>
          ))}
          {filteredEntries.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">No time entries match the filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
