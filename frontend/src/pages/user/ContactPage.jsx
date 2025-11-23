import React, { useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import {
  Mail,
  MessageSquare,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    inquiryType: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoized variants
  const variants = useMemo(
    () => ({
      fadeInUp: {
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      },
      staggerChildren: {
        hidden: {},
        visible: {
          transition: { staggerChildren: prefersReducedMotion ? 0 : 0.1 },
        },
      },
      scaleIn: {
        hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
      },
    }),
    [prefersReducedMotion]
  );

  const fadeInUp = variants.fadeInUp;
  const staggerChildren = variants.staggerChildren;
  const scaleIn = variants.scaleIn;

  const contactInfo = useMemo(
    () => [
      {
        title: "Program Collaboration",
        description:
          "Interested in partnership opportunities or research collaboration?",
        icon: Users,
        details: [
          "Email: raimes@raimes.com",
          "Contact: Arya Wiandra, Partnership Lead",
        ],
        color: "bg-purple-500/20",
        textColor: "text-purple-400",
      },
      {
        title: "Service Inquiries",
        description: "Questions about implementation or technical support?",
        icon: MessageSquare,
        details: ["Email: raimes@raimes.com", "Phone: +62 123-4567"],
        color: "bg-emerald-500/20",
        textColor: "text-emerald-400",
      },
      {
        title: "General Contact",
        description: "Have feedback or general inquiries for the RAIMES team?",
        icon: Mail,
        details: ["Email: raimes@raimes.com", "Response time: Within 24 hours"],
        color: "bg-blue-500/20",
        textColor: "text-blue-400",
      },
    ],
    []
  );

  const inquiryTypes = [
    "General Inquiry",
    "Partnership Collaboration",
    "Technical Support",
    "Account Issue",
    "Feature Request",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setError("Valid email is required");
      return false;
    }
    if (!formData.institution.trim()) {
      setError("Institution/Company is required");
      return false;
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      setError("Message must be at least 10 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would call your actual API endpoint
      // const response = await fetch("/api/contact/inquiry", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        institution: "",
        inquiryType: "general",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {user ? <Navbar /> : <Header />}

      {/* Hero Section */}
      <section className="px-8 py-12 bg-raimes-purple">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl font-extrabold text-white leading-tight"
            >
              Get in <span className="text-raimes-yellow">Touch</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-white text-lg max-w-3xl mx-auto"
            >
              Have questions about RAIMES? We'd love to hear from you. Contact
              us for partnerships, support, or general inquiries.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-8 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {contactInfo.map(({ title, description, icon, details }, index) => {
              // Removed unused variables color and textColor
              {
                user ? <Navbar /> : <Header useRootAnchors />;
              } // Added useRootAnchors prop
              const cardColors = [
                {
                  bg: "bg-raimes-purple",
                  border: "border-raimes-purple",
                  icon: "text-raimes-yellow",
                  bullet: "text-raimes-yellow",
                  title: "text-white",
                  description: "text-gray-100",
                  detail: "text-white",
                },
                {
                  bg: "bg-raimes-purple",
                  border: "border-raimes-purple",
                  icon: "text-raimes-yellow",
                  bullet: "text-raimes-yellow",
                  title: "text-white",
                  description: "text-gray-100",
                  detail: "text-white",
                },
                {
                  bg: "bg-raimes-purple",
                  border: "border-raimes-purple",
                  icon: "text-raimes-yellow",
                  bullet: "text-raimes-yellow",
                  title: "text-white",
                  description: "text-gray-100",
                  detail: "text-white",
                },
              ];
              const cardColor = cardColors[index];

              return (
                <motion.div
                  key={title}
                  variants={fadeInUp}
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : {
                          y: -4,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        }
                  }
                  transition={{ duration: 0.2 }}
                  className={`${cardColor.bg} rounded-2xl p-8 border ${cardColor.border} shadow-lg transition hover:shadow-xl`}
                >
                  <motion.div
                    className={`${cardColor.icon} mb-4`}
                    whileHover={
                      prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }
                    }
                    transition={{ duration: 0.2 }}
                  >
                    {React.createElement(icon, { className: "w-8 h-8" })}
                  </motion.div>
                  <h3
                    className={`text-xl font-semibold ${cardColor.title} mb-2`}
                  >
                    {title}
                  </h3>
                  <p className={`${cardColor.description} text-sm mb-4`}>
                    {description}
                  </p>
                  <div className="space-y-2">
                    {details.map((detail, idx) => (
                      <p
                        key={idx}
                        className={`${cardColor.detail} text-sm font-medium flex items-start`}
                      >
                        <span className={`${cardColor.bullet} mr-2 mt-0.5`}>
                          •
                        </span>
                        <span>{detail}</span>
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="px-8 py-12 bg-white">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleIn}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Send us a Message
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600 mb-8">
              We'll get back to you as soon as possible. Typically within 24
              hours.
            </motion.p>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-semibold">
                    Message sent successfully!
                  </p>
                  <p className="text-green-700 text-sm">
                    Thank you for reaching out. We'll be in touch soon.
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <motion.div
                className="space-y-5"
                initial="hidden"
                animate="visible"
                variants={staggerChildren}
              >
                {/* Name */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-raimes-purple focus:ring-2 focus:ring-raimes-purple/50 transition"
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-raimes-purple focus:ring-2 focus:ring-raimes-purple/50 transition"
                  />
                </motion.div>

                {/* Institution */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Institution / Company *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Your organization"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-raimes-purple focus:ring-2 focus:ring-raimes-purple/50 transition"
                  />
                </motion.div>

                {/* Inquiry Type */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-raimes-purple focus:ring-2 focus:ring-raimes-purple/50 transition"
                  >
                    {inquiryTypes.map((type) => (
                      <option
                        key={type}
                        value={type.toLowerCase().replace(/\s+/g, "-")}
                        className="bg-white"
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </motion.div>

                {/* Message */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-gray-900 font-semibold mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please tell us more about your inquiry..."
                    rows="5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-raimes-purple focus:ring-2 focus:ring-raimes-purple/50 transition resize-none"
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  variants={fadeInUp}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="px-8 py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-2xl font-bold text-gray-900 text-center mb-8"
          >
            Quick Links
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {[
              {
                title: "Documentation",
                description: "Learn how to use RAIMES",
              },
              {
                title: "Support Center",
                description: "Find answers and get help",
              },
              {
                title: "API Docs",
                description: "Integration guide for developers",
              },
              {
                title: "Status Page",
                description: "System status and updates",
              },
            ].map(({ title, description }) => (
              <motion.button
                key={title}
                variants={fadeInUp}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-raimes-purple transition"
              >
                <h3 className="font-semibold text-raimes-purple">{title}</h3>
                <p className="text-gray-600 text-sm mt-1">{description}</p>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className="px-8 py-6 text-center bg-raimes-purple text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        © {new Date().getFullYear()} RAIMES. All rights reserved.
      </motion.footer>
    </div>
  );
}
