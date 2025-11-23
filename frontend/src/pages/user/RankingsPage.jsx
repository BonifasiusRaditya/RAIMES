Dashboard | My Assessments | Results | Resources | Helpimport { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, region, industry

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockRankings = [
      {
        id: 1,
        company: "PT Tambang Sejahtera",
        region: "Kalimantan Timur",
        industry: "Coal Mining",
        score: 92.5,
        grade: "A",
        assessmentDate: "2025-11-15",
        trend: "up",
      },
      {
        id: 2,
        company: "PT Alam Lestari",
        region: "Kalimantan Selatan",
        industry: "Gold Mining",
        score: 88.3,
        grade: "A",
        assessmentDate: "2025-11-10",
        trend: "stable",
      },
      {
        id: 3,
        company: "PT Mineral Nusantara",
        region: "Sumatera Selatan",
        industry: "Nickel Mining",
        score: 85.7,
        grade: "B+",
        assessmentDate: "2025-11-12",
        trend: "up",
      },
      {
        id: 4,
        company: "PT Batu Energi",
        region: "Papua",
        industry: "Copper Mining",
        score: 82.1,
        grade: "B+",
        assessmentDate: "2025-11-08",
        trend: "down",
      },
      {
        id: 5,
        company: "PT Adhi Sukma",
        region: "Sulawesi Tengah",
        industry: "Iron Ore Mining",
        score: 78.9,
        grade: "B",
        assessmentDate: "2025-11-05",
        trend: "stable",
      },
    ];

    setTimeout(() => {
      setRankings(mockRankings);
      setLoading(false);
    }, 500);
  }, []);

  const getGradeColor = (grade) => {
    if (grade === "A") return "bg-green-100 text-green-800 border-green-300";
    if (grade === "B+") return "bg-blue-100 text-blue-800 border-blue-300";
    if (grade === "B") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") {
      return (
        <svg
          className="w-5 h-5 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (trend === "down") {
      return (
        <svg
          className="w-5 h-5 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-5 h-5 text-gray-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading rankings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mining Companies Rankings
          </h1>
          <p className="text-gray-600">
            Public assessment results ranked by responsible mining practices
            score
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Total Companies</div>
            <div className="text-3xl font-bold text-raimes-purple">
              {rankings.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Average Score</div>
            <div className="text-3xl font-bold text-blue-600">
              {(
                rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length
              ).toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Grade A Companies</div>
            <div className="text-3xl font-bold text-green-600">
              {rankings.filter((r) => r.grade === "A").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500 mb-1">Improving Trend</div>
            <div className="text-3xl font-bold text-green-600">
              {rankings.filter((r) => r.trend === "up").length}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-raimes-yellow"
            >
              <option value="all">All Companies</option>
              <option value="region">By Region</option>
              <option value="industry">By Industry</option>
            </select>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-raimes-purple text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Rank</th>
                <th className="px-6 py-4 text-left font-semibold">Company</th>
                <th className="px-6 py-4 text-left font-semibold">Region</th>
                <th className="px-6 py-4 text-left font-semibold">Industry</th>
                <th className="px-6 py-4 text-left font-semibold">Score</th>
                <th className="px-6 py-4 text-left font-semibold">Grade</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Assessment Date
                </th>
                <th className="px-6 py-4 text-left font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((company, index) => (
                <tr
                  key={company.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-yellow-50 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {index === 0 && (
                        <svg
                          className="w-6 h-6 text-yellow-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      <span className="text-lg font-bold text-raimes-purple">
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {company.company}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{company.region}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {company.industry}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-2xl font-bold text-raimes-purple">
                      {company.score}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(
                        company.grade
                      )}`}
                    >
                      {company.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {company.assessmentDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      {getTrendIcon(company.trend)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-blue-500 mr-3 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                About Rankings
              </h3>
              <p className="text-blue-800 mb-2">
                This public ranking showcases mining companies' commitment to
                responsible and sustainable mining practices. Scores are based
                on comprehensive assessments across multiple criteria including
                environmental impact, safety standards, community engagement,
                and regulatory compliance.
              </p>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>
                  <strong>Grade A:</strong> 90-100 - Excellent practices
                </li>
                <li>
                  <strong>Grade B+:</strong> 80-89 - Very good practices
                </li>
                <li>
                  <strong>Grade B:</strong> 70-79 - Good practices
                </li>
                <li>
                  <strong>Grade C:</strong> Below 70 - Needs improvement
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
