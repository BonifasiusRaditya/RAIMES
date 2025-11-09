import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../components/Header";
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
          backgroundColor: '#F6F6FF',
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
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/login"
                  className="px-6 py-3 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                </Link>
              </motion.div>
              <motion.a
                href="#features"
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white transition-colors"
              >
                Watch Demo
              </motion.a>
            </motion.div>
          </motion.div>

          {/* ECO RATING BANNER (DIPERBAIKI DENGAN GLASSMORPHISM) */}
          <motion.div
            className="bg-white/15 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30 hover:bg-white/20 transition"
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
                  className={`${bgColor} backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/25 transition shadow-lg`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`${color} w-5 h-5`} />
                    <div className="text-sm text-black font-medium">
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
      <section className="px-8 py-10 bg-white/10 backdrop-blur-lg border-y border-white/20">
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
              <div className="text-black font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="px-8 py-12 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundColor: '#F6F6FF',
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
            Powerful Features for{" "}
            <span className="text-raimes-yellow">Sustainable Mining</span>
          </motion.h2>
          <motion.p
            className="text-center text-black mt-2 drop-shadow-md font-medium"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            Comprehensive tools to monitor, analyze, and improve your
            performance.
          </motion.p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {[
              [
                "Real-Time Monitoring",
                "IoT sensor integration for continuous environmental data collection and analysis.",
              ],
              [
                "Dynamic Rating System",
                "KPI-based scoring with transparent methodology and benchmarking.",
              ],
              [
                "Predictive Analytics",
                "AI-powered insights to forecast trends and identify improvements.",
              ],
              [
                "Compliance Tracking",
                "Automated monitoring of regulatory requirements and certification.",
              ],
              [
                "Automated Reporting",
                "Customizable reports for stakeholders, regulators, and investors.",
              ],
              [
                "Multi-Site Management",
                "Centralized dashboard to manage multiple operations.",
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
                className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:bg-white/20 hover:border-white/40 hover:shadow-2xl transition"
              >
                <h3 className="text-lg font-semibold text-raimes-yellow drop-shadow-sm">
                  {title}
                </h3>
                <p className="text-black mt-2 font-medium">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose */}
      <section
        id="benefits"
        className="px-8 py-12 bg-white/10 backdrop-blur-lg border-y border-white/20"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-black drop-shadow-md"
            >
              Why Choose <span className="text-raimes-yellow">RAIMES</span>?
            </motion.h2>
            <motion.ul className="mt-4 space-y-3 text-black font-medium">
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
            className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={scaleIn}
          >
            <h3 className="text-black font-semibold drop-shadow-sm">
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
                  className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-sm"
                >
                  <div className="text-raimes-yellow font-semibold drop-shadow-sm">
                    {s}
                  </div>
                  <div className="text-black text-sm mt-1">
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
                className="px-6 py-3 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
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
                className="px-6 py-3 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white transition-colors"
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
