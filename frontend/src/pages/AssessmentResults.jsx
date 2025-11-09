import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";

export default function AssessmentResults() {
  // Mock data (to be replaced by API later)
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const data = useMemo(
    () => [
      {
        id: 1,
        company: "PT Tambang Sejahtera",
        overall: 82,
        category: "High",
        status: "Complete",
        completedAt: "2025-10-21",
      },
      {
        id: 2,
        company: "PT Batu Energi",
        overall: 90,
        category: "Very High",
        status: "Complete",
        completedAt: "2025-10-19",
      },
      {
        id: 3,
        company: "PT Mineral Nusantara",
        overall: 68,
        category: "Medium",
        status: "In Review",
        completedAt: "-",
      },
      {
        id: 4,
        company: "PT Adhi Sukma",
        overall: 74,
        category: "Medium",
        status: "In Review",
        completedAt: "-",
      },
      {
        id: 5,
        company: "PT Bara Mandiri",
        overall: 55,
        category: "Low",
        status: "Pending",
        completedAt: "-",
      },
      {
        id: 6,
        company: "PT Alam Lestari",
        overall: 88,
        category: "High",
        status: "Complete",
        completedAt: "2025-09-30",
      },
      {
        id: 7,
        company: "PT Nusa Mineral",
        overall: 61,
        category: "Medium",
        status: "Pending",
        completedAt: "-",
      },
      {
        id: 8,
        company: "PT Elang Emas",
        overall: 79,
        category: "High",
        status: "Complete",
        completedAt: "2025-09-12",
      },
      {
        id: 9,
        company: "PT Sumber Daya",
        overall: 92,
        category: "Very High",
        status: "Complete",
        completedAt: "2025-09-01",
      },
      {
        id: 10,
        company: "PT Bukit Andalan",
        overall: 47,
        category: "Low",
        status: "Pending",
        completedAt: "-",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    let rows = data;
    if (query) {
      rows = rows.filter((r) =>
        r.company.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (status !== "all") {
      rows = rows.filter((r) => r.status.toLowerCase() === status);
    }
    return rows;
  }, [data, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageClamped = Math.min(page, totalPages);
  const paged = filtered.slice(
    (pageClamped - 1) * pageSize,
    pageClamped * pageSize
  );

  const stat = useMemo(
    () => ({
      total: data.length,
      complete: data.filter((d) => d.status === "Complete").length,
      pending: data.filter((d) => d.status === "Pending").length,
      review: data.filter((d) => d.status === "In Review").length,
      avgScore: Math.round(
        data
          .filter((d) => d.status === "Complete")
          .reduce((s, d) => s + d.overall, 0) /
          Math.max(1, data.filter((d) => d.status === "Complete").length)
      ),
    }),
    [data]
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-8 py-8 bg-white bg-opacity-75">
        <h1 className="text-4xl font-bold text-raimes-purple mb-8">
          Assessment Results
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="text-sm text-gray-500">Total Assessments</div>
            <div className="text-3xl font-bold text-raimes-purple">
              {stat.total}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-3xl font-bold text-green-600">
              {stat.complete}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">
              {stat.pending}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="text-sm text-gray-500">Avg. Score (completed)</div>
            <div className="text-3xl font-bold text-raimes-purple">
              {isNaN(stat.avgScore) ? "-" : stat.avgScore}
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
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
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
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-raimes-yellow capitalize"
              >
                <option value="all">All</option>
                <option value="complete">Complete</option>
                <option value="pending">Pending</option>
                <option value="in review">In Review</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90">
                Export CSV
              </button>
              <button className="px-4 py-2 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white">
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-raimes-purple text-white">
                <th className="px-6 py-4 text-left font-semibold">No</th>
                <th className="px-6 py-4 text-left font-semibold">Company</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Overall Score
                </th>
                <th className="px-6 py-4 text-left font-semibold">Category</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Completed At
                </th>
                <th className="px-6 py-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 text-raimes-purple">
                    {(pageClamped - 1) * pageSize + idx + 1}
                  </td>
                  <td className="px-6 py-4 text-raimes-purple font-medium">
                    {row.company}
                  </td>
                  <td className="px-6 py-4 text-raimes-purple font-bold text-lg">
                    {row.status === "Complete" ? row.overall : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        row.category === "Very High"
                          ? "bg-green-100 text-green-700"
                          : row.category === "High"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.category === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize text-raimes-purple">
                    {row.status.toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-raimes-purple">
                    {row.completedAt}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-2 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white">
                        View Detail
                      </button>
                      <button className="px-3 py-2 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90">
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {(pageClamped - 1) * pageSize + 1} -{" "}
            {Math.min(pageClamped * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </div>
          <div className="flex gap-2">
            <button
              disabled={pageClamped === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-2 rounded-lg border ${
                pageClamped === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-lg border ${
                    p === pageClamped
                      ? "bg-raimes-yellow text-white border-raimes-yellow"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              disabled={pageClamped === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-2 rounded-lg border ${
                pageClamped === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
