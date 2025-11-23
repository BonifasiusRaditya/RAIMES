import { useState } from "react";
import Navbar from "../../components/Navbar";

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const resources = [
    {
      id: 1,
      category: "guidelines",
      title: "Responsible Mining Best Practices Guide",
      description:
        "Comprehensive guide covering environmental, social, and governance best practices for responsible mining operations.",
      type: "PDF",
      size: "2.5 MB",
      downloadUrl: "#",
    },
    {
      id: 2,
      category: "regulations",
      title: "Indonesian Mining Regulations 2025",
      description:
        "Up-to-date compilation of mining laws, regulations, and compliance requirements in Indonesia.",
      type: "PDF",
      size: "4.1 MB",
      downloadUrl: "#",
    },
    {
      id: 3,
      category: "case-studies",
      title: "Sustainable Mining Case Study: PT Alam Lestari",
      description:
        "Success story of implementing sustainable practices in gold mining operations.",
      type: "PDF",
      size: "1.8 MB",
      downloadUrl: "#",
    },
    {
      id: 4,
      category: "templates",
      title: "Environmental Impact Assessment Template",
      description:
        "Standard template for conducting environmental impact assessments for mining projects.",
      type: "DOCX",
      size: "450 KB",
      downloadUrl: "#",
    },
    {
      id: 5,
      category: "guidelines",
      title: "Community Engagement Framework",
      description:
        "Framework for building and maintaining positive relationships with local communities.",
      type: "PDF",
      size: "1.2 MB",
      downloadUrl: "#",
    },
    {
      id: 6,
      category: "training",
      title: "Safety Protocol Training Materials",
      description:
        "Comprehensive training materials for mine safety and emergency response protocols.",
      type: "ZIP",
      size: "15.3 MB",
      downloadUrl: "#",
    },
    {
      id: 7,
      category: "case-studies",
      title: "Water Management in Coal Mining",
      description:
        "Best practices and case studies on water conservation and management in coal mining.",
      type: "PDF",
      size: "3.2 MB",
      downloadUrl: "#",
    },
    {
      id: 8,
      category: "regulations",
      title: "International Mining Standards Compliance",
      description:
        "Guide to international mining standards and certification requirements.",
      type: "PDF",
      size: "2.9 MB",
      downloadUrl: "#",
    },
  ];

  const categories = [
    { value: "all", label: "All Resources", icon: "📚" },
    { value: "guidelines", label: "Guidelines", icon: "📖" },
    { value: "regulations", label: "Regulations", icon: "⚖️" },
    { value: "case-studies", label: "Case Studies", icon: "📊" },
    { value: "templates", label: "Templates", icon: "📝" },
    { value: "training", label: "Training", icon: "🎓" },
  ];

  const filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  const getFileIcon = (type) => {
    switch (type) {
      case "PDF":
        return "📄";
      case "DOCX":
        return "📝";
      case "ZIP":
        return "📦";
      default:
        return "📄";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resources</h1>
          <p className="text-gray-600">
            Guidelines, regulations, templates, and educational materials for
            responsible mining practices
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category.value
                    ? "bg-raimes-purple text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-sm">{category.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getFileIcon(resource.type)}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {resource.type}
                      </span>
                      <span>{resource.size}</span>
                    </div>
                    <button
                      onClick={() =>
                        window.open(resource.downloadUrl, "_blank")
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
                Need More Resources?
              </h3>
              <p className="text-blue-800 mb-3">
                Can't find what you're looking for? Contact our support team for
                additional resources, customized templates, or specialized
                guidance for your mining operations.
              </p>
              <button
                onClick={() => (window.location.href = "/contact")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Sustainability Guide
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Learn about environmental sustainability in mining
            </p>
            <button className="text-raimes-purple font-semibold hover:underline">
              Learn More →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl mb-3">👷</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Safety Standards
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Comprehensive safety protocols and training
            </p>
            <button className="text-raimes-purple font-semibold hover:underline">
              Learn More →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Community Relations
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Building positive community partnerships
            </p>
            <button className="text-raimes-purple font-semibold hover:underline">
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
