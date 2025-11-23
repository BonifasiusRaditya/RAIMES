import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { Droplets, Zap, Shield, Wind } from "lucide-react";

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();

  // Memoized variants to prevent recalculation
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
          transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 },
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

  // Eco Ratings with icons and colors
  const ecoRatings = useMemo(
    () => [
      {
        label: "Water",
        val: "92%",
        icon: Droplets,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      },
      {
        label: "Energy",
        val: "88%",
        icon: Zap,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
      },
      {
        label: "Safety",
        val: "95%",
        icon: Shield,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/20",
      },
      {
        label: "Emissions",
        val: "85%",
        icon: Wind,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        className="px-8 py-12 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundColor: "#F6F6FF",
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-green-200 text-sm font-medium border border-white/30"
            >
              Certified Sustainability Platform
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="mt-4 text-5xl font-extrabold text-black leading-tight drop-shadow-lg"
            >
              Transform Mining into{" "}
              <span className="text-raimes-yellow">Sustainable</span> Future
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-gray-100 text-lg"
            >
              Real-time integrated management system for comprehensive
              responsible AI mining rating. Monitor, analyze, and improve
              performance with data-driven insights.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex gap-4 items-center"
            >
              <motion.div
                whileHover={prefersReducedMotion ? {} : { y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/login"
                  className="px-8 py-4 text-lg bg-raimes-yellow text-white font-bold rounded-lg hover:bg-raimes-yellow/90 shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ECO RATING BANNER (DIPERBAIKI DENGAN GLASSMORPHISM) */}
          <motion.div
            className="bg-raimes-purple/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-raimes-yellow hover:bg-raimes-purple transition"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleIn}
          >
            <h3 className="text-raimes-yellow font-semibold mb-4 drop-shadow-md">
              Eco Rating
            </h3>
            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              {ecoRatings.map(({ label, val, icon: Icon, color, bgColor }) => (
                <motion.div
                  key={label}
                  variants={fadeInUp}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                  className="bg-gray-800 backdrop-blur-md rounded-xl p-4 border border-raimes-yellow/50 hover:border-raimes-yellow transition shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`${color} w-5 h-5`} />
                    <div className="text-sm text-white font-medium">
                      {label}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-raimes-yellow drop-shadow-sm">
                    {val}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Counters */}
      <section className="px-8 py-10 bg-raimes-purple">
        <motion.div
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          {[
            ["150+", "Mining Sites"],
            ["25+", "KPIs Tracked"],
            ["40%", "CO₂ Reduction"],
            ["99%", "Compliance Rate"],
          ].map(([num, label]) => (
            <motion.div key={label} variants={fadeInUp}>
              <div className="text-4xl font-extrabold text-raimes-yellow drop-shadow-md">
                {num}
              </div>
              <div className="text-white font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="px-8 py-12 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundColor: "#F6F6FF",
        }}
      >
        <div className="max-w-6xl mx_auto"></div>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-black text-center drop-shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            Comprehensive AI-Powered{" "}
            <span className="text-raimes-yellow">Mining Assessment</span>
          </motion.h2>
          <motion.p
            className="text-center text-black mt-2 drop-shadow-md font-medium"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            Intelligent evaluation system to assess and improve your mining
            sustainability practices.
          </motion.p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {[
              [
                "Questionnaire-Based Assessment",
                "Comprehensive self-assessment questionnaires covering all aspects of responsible mining practices.",
              ],
              [
                "AI-Powered Evaluation",
                "Advanced AI algorithms analyze your responses and evidence to generate accurate sustainability scores.",
              ],
              [
                "Evidence Validation",
                "Upload and submit supporting documents to validate your mining practices and compliance.",
              ],
              [
                "Real-Time Scoring",
                "Get instant feedback on your assessment with weighted scoring based on question importance.",
              ],
              [
                "Progress Tracking",
                "Monitor your assessment completion status and track improvements over time.",
              ],
              [
                "Detailed Reports",
                "Receive comprehensive evaluation reports highlighting strengths and areas for improvement.",
              ],
            ].map(([title, desc]) => (
              <motion.div
                key={title}
                variants={fadeInUp}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        y: -4,
                      }
                }
                transition={{ duration: 0.2 }}
                className="bg-raimes-purple rounded-2xl p-6 shadow-lg border border-raimes-yellow hover:shadow-xl hover:border-raimes-yellow hover:bg-raimes-purple/90 transition"
              >
                <h3 className="text-lg font-semibold text-raimes-yellow">
                  {title}
                </h3>
                <p className="text-white mt-2">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose */}
      <section id="benefits" className="px-8 py-12 bg-raimes-purple">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-white drop-shadow-md"
            >
              Why Choose <span className="text-raimes-yellow">RAIMES</span>?
            </motion.h2>
            <motion.ul className="mt-4 space-y-3 text-white font-medium">
              {[
                "Continuous Monitoring — get real-time insights 24/7",
                "Transparent Methodology — standardized framework",
                "Investor Confidence — stronger ESG ratings",
                "Competitive Advantage — demonstrate sustainability leadership",
              ].map((item) => (
                <motion.li key={item} variants={fadeInUp} className="pl-1">
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.div
            className="bg-raimes-purple rounded-2xl p-6 border border-raimes-yellow shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleIn}
          >
            <h3 className="text-raimes-yellow font-semibold">
              For Stakeholders
            </h3>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              {["Mining Companies", "Regulators", "Investors"].map((s) => (
                <motion.div
                  key={s}
                  variants={fadeInUp}
                  className="bg-gray-800 rounded-xl p-4 border border-raimes-yellow/50 shadow-sm"
                >
                  <div className="text-raimes-yellow font-semibold">{s}</div>
                  <div className="text-white text-sm mt-1">
                    Benchmark, monitor compliance, and verify claims with data.
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-8 py-14 bg-gray-50 bg-opacity-75">
        <motion.div
          className="max-w-5xl mx-auto text-center bg-white rounded-2xl p-10 shadow"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={scaleIn}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold text-raimes-purple"
          >
            Ready to Transform Your Mining Operations?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-700 mt-2">
            Join mining companies building a sustainable future.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="mt-6 flex justify-center gap-4"
          >
            <motion.div
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/register"
                className="px-6 py-3 bg-raimes-purple text-white font-semibold rounded-lg hover:bg-raimes-purple/90 transition-all"
              >
                Request an Account
              </Link>
            </motion.div>
            <motion.div
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/login"
                className="px-6 py-3 border-2 border-raimes-purple text-raimes-purple font-semibold rounded-lg hover:bg-raimes-purple hover:text-white transition-all"
              >
                Contact Admin
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="px-8 py-6 text-center bg-raimes-purple text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        © {new Date().getFullYear()} RAIMES
      </motion.footer>
    </div>
  );
}
