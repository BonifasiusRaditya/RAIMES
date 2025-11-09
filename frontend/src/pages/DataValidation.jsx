import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";

export default function DataValidation() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("pending");
  const [selectedId, setSelectedId] = useState(null);

  // Mock submissions queue
  const submissions = useMemo(
    () => [
      {
        id: 101,
        company: "PT Tambang Sejahtera",
        submittedAt: "2025-10-21 14:22",
        submittedBy: "op_trisna",
        status: "pending",
        flags: 1,
        region: "Kalimantan Timur",
      },
      {
        id: 102,
        company: "PT Batu Energi",
        submittedAt: "2025-10-21 13:10",
        submittedBy: "op_sari",
        status: "pending",
        flags: 0,
        region: "Papua",
      },
      {
        id: 103,
        company: "PT Mineral Nusantara",
        submittedAt: "2025-10-20 09:42",
        submittedBy: "op_bayu",
        status: "in-review",
        flags: 2,
        region: "Sumatera Selatan",
      },
      {
        id: 104,
        company: "PT Adhi Sukma",
        submittedAt: "2025-10-18 16:05",
        submittedBy: "op_rama",
        status: "rejected",
        flags: 3,
        region: "Sulawesi Tengah",
      },
      {
        id: 105,
        company: "PT Alam Lestari",
        submittedAt: "2025-10-18 08:27",
        submittedBy: "op_dewi",
        status: "approved",
        flags: 0,
        region: "Kalimantan Selatan",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    let rows = submissions;
    if (status !== "all") rows = rows.filter((r) => r.status === status);
    if (query)
      rows = rows.filter((r) =>
        r.company.toLowerCase().includes(query.toLowerCase())
      );
    return rows;
  }, [submissions, status, query]);

  const selected =
    filtered.find((r) => r.id === selectedId) || filtered[0] || null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-8 py-8 bg-white bg-opacity-75">
        <h1 className="text-4xl font-bold text-raimes-purple mb-6">
          Data Validation
        </h1>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">
              {submissions.filter((s) => s.status === "pending").length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="text-sm text-gray-500">In Review</div>
            <div className="text-3xl font-bold text-blue-600">
              {submissions.filter((s) => s.status === "in-review").length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="text-sm text-gray-500">Approved</div>
            <div className="text-3xl font-bold text-green-600">
              {submissions.filter((s) => s.status === "approved").length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="text-sm text-gray-500">Rejected</div>
            <div className="text-3xl font-bold text-red-600">
              {submissions.filter((s) => s.status === "rejected").length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-raimes-purple mb-1">
                Search company
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type company name..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-raimes-yellow"
              />
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-raimes-purple mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-raimes-yellow capitalize"
              >
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-raimes-purple text-white">
                  <th className="px-6 py-4 text-left font-semibold">ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Company</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Submitted At
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Submitted By
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Flags</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } cursor-pointer hover:bg-yellow-50`}
                  >
                    <td className="px-6 py-4 text-raimes-purple">#{row.id}</td>
                    <td className="px-6 py-4 text-raimes-purple font-medium">
                      {row.company}
                    </td>
                    <td className="px-6 py-4 text-raimes-purple">
                      {row.submittedAt}
                    </td>
                    <td className="px-6 py-4 text-raimes-purple">
                      {row.submittedBy}
                    </td>
                    <td className="px-6 py-4 text-raimes-purple">
                      {row.flags}
                    </td>
                    <td className="px-6 py-4 text-raimes-purple capitalize">
                      {row.status.replace("-", " ")}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No submissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Review panel */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-raimes-purple mb-4">
              Review Details
            </h2>
            {!selected && (
              <p className="text-gray-500">Select a submission to review.</p>
            )}
            {selected && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID</span>
                  <span className="font-medium text-raimes-purple">
                    #{selected.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Company</span>
                  <span className="font-medium text-raimes-purple">
                    {selected.company}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Region</span>
                  <span className="font-medium text-raimes-purple">
                    {selected.region}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted at</span>
                  <span className="font-medium text-raimes-purple">
                    {selected.submittedAt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted by</span>
                  <span className="font-medium text-raimes-purple">
                    {selected.submittedBy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Flags</span>
                  <span className="font-medium text-raimes-purple">
                    {selected.flags}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-raimes-purple mb-2">
                    Reviewer Notes
                  </h3>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-raimes-yellow"
                    rows={4}
                    placeholder="Write your analysis, checks performed, references, etc."
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:opacity-90">
                    Approve
                  </button>
                  <button className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:opacity-90">
                    Reject
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Actions are placeholders; hook them to the API when endpoints
                  are ready.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
