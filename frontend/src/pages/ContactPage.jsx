import React, { useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import Header from "../components/Header";
import {
  Mail,
  MessageSquare,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
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
          "Email: partnerships@raimes.io",
          "Contact: Dr. Sarah Chen, Partnership Lead",
        ],
        color: "bg-purple-500/20",
        textColor: "text-purple-400",
      },
      {
        title: "Service Inquiries",
        description: "Questions about implementation or technical support?",
        icon: MessageSquare,
        details: ["Email: support@raimes.io", "Phone: +1 (555) 123-4567"],
        color: "bg-emerald-500/20",
        textColor: "text-emerald-400",
      },
      {
        title: "General Contact",
        description: "Have feedback or general inquiries for the RAIMES team?",
        icon: Mail,
        details: ["Email: info@raimes.io", "Response time: Within 24 hours"],
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
      <Header />

      {/* Hero Section */}
      <section
        className="px-8 py-12 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url('/MiningSite_BackgroundPictureNoBlur.svg')`,
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl font-extrabold text-white leading-tight drop-shadow-lg"
            >
              Get in <span className="text-raimes-yellow">Touch</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-gray-100 text-lg max-w-3xl mx-auto"
            >
              Have questions about RAIMES? We'd love to hear from you. Contact
              us for partnerships, support, or general inquiries.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-8 py-12 bg-white/10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {contactInfo.map(
              ({ title, description, icon, details, color, textColor }) => (
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
                  className={`${color} backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-lg transition hover:border-white/50`}
                >
                  <motion.div
                    className={`${textColor} mb-4`}
                    whileHover={
                      prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }
                    }
                    transition={{ duration: 0.2 }}
                  >
                    {React.createElement(icon, { className: "w-8 h-8" })}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-sm">
                    {title}
                  </h3>
                  <p className="text-gray-100 text-sm mb-4">{description}</p>
                  <div className="space-y-2">
                    {details.map((detail, idx) => (
                      <p
                        key={idx}
                        className="text-white text-sm font-medium flex items-start"
                      >
                        <span className={`${textColor} mr-2 mt-0.5`}>•</span>
                        <span>{detail}</span>
                      </p>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="px-8 py-12 bg-gray-50 bg-opacity-5">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleIn}
            className="bg-white/15 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-white mb-2 drop-shadow-md"
            >
              Send us a Message
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-gray-100 mb-8 drop-shadow-sm"
            >
              We'll get back to you as soon as possible. Typically within 24
              hours.
            </motion.p>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-100 font-semibold">
                    Message sent successfully!
                  </p>
                  <p className="text-emerald-50 text-sm">
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
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-100 text-sm">{error}</p>
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
                  <label className="block text-white font-semibold mb-2 drop-shadow-sm">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-raimes-yellow focus:ring-2 focus:ring-raimes-yellow/50 transition"
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-white font-semibold mb-2 drop-shadow-sm">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-raimes-yellow focus:ring-2 focus:ring-raimes-yellow/50 transition"
                  />
                </motion.div>

                {/* Institution */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-white font-semibold mb-2 drop-shadow-sm">
                    Institution / Company *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Your organization"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-raimes-yellow focus:ring-2 focus:ring-raimes-yellow/50 transition"
                  />
                </motion.div>

                {/* Inquiry Type */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-white font-semibold mb-2 drop-shadow-sm">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-raimes-yellow focus:ring-2 focus:ring-raimes-yellow/50 transition"
                  >
                    {inquiryTypes.map((type) => (
                      <option
                        key={type}
                        value={type.toLowerCase().replace(/\s+/g, "-")}
                        className="bg-gray-900"
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </motion.div>

                {/* Message */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-white font-semibold mb-2 drop-shadow-sm">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please tell us more about your inquiry..."
                    rows="5"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-raimes-yellow focus:ring-2 focus:ring-raimes-yellow/50 transition resize-none"
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
      <section className="px-8 py-12 bg-white/10 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-2xl font-bold text-white text-center mb-8 drop-shadow-md"
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
                className="text-left p-4 bg-white/15 border border-white/30 rounded-lg hover:bg-white/20 hover:border-white/50 transition backdrop-blur-md"
              >
                <h3 className="font-semibold text-raimes-yellow drop-shadow-sm">
                  {title}
                </h3>
                <p className="text-white text-sm mt-1">{description}</p>
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
