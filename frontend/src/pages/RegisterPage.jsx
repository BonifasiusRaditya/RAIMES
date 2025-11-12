import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import logoFull from "../assets/logo-full.png";
import authService from "../services/authService";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [affiliationFile, setAffiliationFile] = useState(null);
  const [affiliationFileName, setAffiliationFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (!file) {
      setAffiliationFile(null);
      setAffiliationFileName("");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError(
        "Only image files (JPG, PNG, GIF) and document files (PDF, DOC, DOCX) are allowed"
      );
      setAffiliationFile(null);
      setAffiliationFileName("");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File size must not exceed 10MB");
      setAffiliationFile(null);
      setAffiliationFileName("");
      return;
    }

    setAffiliationFile(file);
    setAffiliationFileName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!companyName.trim()) {
      setError("Company name is required");
      return;
    }

    if (!affiliationFile) {
      setError("Affiliation proof file is required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("companyName", companyName);
      formData.append("affiliationProof", affiliationFile);

  await authService.submitAccountRequest(formData);

      setSuccess(
        "Account request submitted successfully! Admin will review your request soon."
      );

      // Reset form
      setUsername("");
      setEmail("");
      setCompanyName("");
      setAffiliationFile(null);
      setAffiliationFileName("");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err || "Failed to submit account request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-lg w-full max-w-md overflow-hidden">
          <div className="bg-raimes-purple px-8 py-6 rounded-br-[80px]">
            <img
              src={logoFull}
              alt="Responsible AI Mining Evaluation System"
              className="h-10"
            />
          </div>

          <div className="px-12 py-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-raimes-purple">Request </span>
                <span className="text-raimes-yellow">Account</span>
              </h1>
              <p className="text-gray-600">
                Your submission will first be verified by an admin before account activation. 
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-raimes-purple font-semibold mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-raimes-purple font-semibold mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="companyName"
                  className="block text-raimes-purple font-semibold mb-2"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-raimes-purple focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="affiliationFile"
                  className="block text-raimes-purple font-semibold mb-2"
                >
                  Affiliation Proof
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Upload ID card, employee certificate, or company document
                  (JPG, PNG, GIF, PDF, DOC, DOCX - Max 10MB)
                </p>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-raimes-purple transition-colors">
                  <input
                    type="file"
                    id="affiliationFile"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    disabled={loading}
                  />
                  <div className="text-center pointer-events-none">
                    <svg
                      className="w-8 h-8 mx-auto text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {affiliationFileName ? (
                      <>
                        <p className="text-sm text-raimes-purple font-semibold">
                          {affiliationFileName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click to change file
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {fileError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {fileError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !affiliationFile}
                className="w-full bg-raimes-purple hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting request...
                  </>
                ) : (
                  "Submit Account Request"
                )}
              </button>
            </form>

            <p className="text-center mt-8 text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-raimes-yellow font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
