import Navbar from "../components/Navbar";
import warningIcon from "../assets/warning-icon.png";
import bellIcon from "../assets/bell-icon.png";

// Data dummy untuk companies
const companies = [
  {
    no: 1,
    name: "PT Tambang Emas Nusantara",
    progress: 85,
    status: "In Progress",
    aiScore: "8.5",
    action: "Review",
    actionStyle: "yellow"
  },
  {
    no: 2,
    name: "CV Mineral Indonesia",
    progress: 100,
    status: "Completed",
    aiScore: "9.2",
    action: "Approved",
    actionStyle: "yellow-outline"
  },
  {
    no: 3,
    name: "PT Batubara Kalimantan",
    progress: 45,
    status: "In Progress",
    aiScore: "6.8",
    action: "Pending",
    actionStyle: "gray"
  },
  {
    no: 4,
    name: "PT Nikel Sulawesi",
    progress: 90,
    status: "Review",
    aiScore: "8.9",
    action: "Review",
    actionStyle: "yellow"
  },
  {
    no: 5,
    name: "CV Pasir Besi Jawa",
    progress: 100,
    status: "Completed",
    aiScore: "9.5",
    action: "Approved",
    actionStyle: "yellow-outline"
  }
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="px-8 py-8">
        <h1 className="text-4xl font-bold text-raimes-purple mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-8 shadow">
            <h2 className="text-xl font-semibold text-raimes-purple mb-4">
              Questionnaire Progress
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-raimes-yellow h-4 rounded-full"
                  style={{ width: "66.67%" }}
                ></div>
              </div>
            </div>
            <p className="text-raimes-purple">
              10 out of 15 companies have filled in
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow flex items-center justify-center gap-6">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">⚠</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-raimes-purple">2</div>
              <div className="text-raimes-purple font-semibold">
                Data is not valid!!
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow flex items-center justify-center gap-6">
            <div className="h-36 w-36 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-4xl">🔔</span>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-raimes-purple">0</div>
              <div className="text-raimes-purple font-semibold">
                Notification
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-raimes-purple text-white">
                <th className="px-6 py-4 text-left font-semibold">No</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Company Name
                </th>
                <th className="px-6 py-4 text-left font-semibold">Progress</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">AI Score</th>
                <th className="px-6 py-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, index) => (
                <tr
                  key={company.no}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 text-raimes-purple">{company.no}</td>
                  <td className="px-6 py-4 text-raimes-purple font-medium">
                    {company.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                        <div
                          className="bg-raimes-yellow h-2 rounded-full"
                          style={{ width: `${company.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-raimes-purple font-medium">
                        {company.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-raimes-purple">
                    {company.status}
                  </td>
                  <td className="px-6 py-4 text-raimes-purple font-bold text-lg">
                    {company.aiScore}
                  </td>
                  <td className="px-6 py-4">
                    {company.actionStyle === "yellow" && (
                      <button className="px-6 py-2 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        {company.action}
                      </button>
                    )}
                    {company.actionStyle === "yellow-outline" && (
                      <button className="px-6 py-2 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white transition-colors">
                        {company.action}
                      </button>
                    )}
                    {company.actionStyle === "gray" && (
                      <button className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed">
                        {company.action}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
