import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { Droplets, Zap, Shield, Wind, Leaf, BarChart3, Sparkles, Check } from "lucide-react";

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();

  const variants = useMemo(
    () => ({
      fadeInUp: {
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
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
        visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
      },
    }),
    [prefersReducedMotion]
  );

  const fadeInUp = variants.fadeInUp;
  const staggerChildren = variants.staggerChildren;
  const scaleIn = variants.scaleIn;

  const ecoRatings = useMemo(
    () => [
      { label: "Water", val: "92%", icon: Droplets, color: "text-sky-300" },
      { label: "Energy", val: "88%", icon: Zap, color: "text-amber-300" },
      { label: "Safety", val: "95%", icon: Shield, color: "text-emerald-300" },
      { label: "Emissions", val: "85%", icon: Wind, color: "text-violet-300" },
    ],
    []
  );

  const featureCards = [
    {
      title: "AI scoring you can trust",
      copy: "Weighted scores, transparent logic, and instant insights for every site.",
      icon: BarChart3,
    },
    {
      title: "Evidence-first workflow",
      copy: "Upload proofs, validate claims, and keep auditors aligned in one place.",
      icon: Shield,
    },
    {
      title: "Sustainability playbooks",
      copy: "Prebuilt questionnaires and guidance tailored to responsible mining.",
      icon: Leaf,
    },
  ];

  const steps = [
    {
      title: "Map your operation",
      body: "Start with a curated questionnaire built for mining sustainability.",
    },
    {
      title: "Submit evidence",
      body: "Attach documents, photos, or reports to validate every response.",
    },
    {
      title: "See the score",
      body: "AI weights answers, highlights gaps, and shows progress instantly.",
    },
    {
      title: "Act with clarity",
      body: "Download reports, brief stakeholders, and track improvements over time.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-raimes-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50">

        <div className="max-w-6xl mx-auto px-6 pt-14 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={staggerChildren}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white text-raimes-purple text-xs font-semibold shadow-sm border border-raimes-purple/10"
            >
              <Sparkles className="w-4 h-4 text-raimes-purple" /> Responsible AI Mining
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mt-4 text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight"
            >
              Transform mining into a
              <span className="block text-raimes-purple">sustainable future</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-gray-700 max-w-xl"
            >
              Monitor, analyze, and improve ESG performance with AI-driven scoring, evidence validation, and stakeholder-ready reports.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-8 flex gap-3 flex-wrap">
              <Link
                to="/register"
                className="px-6 py-3 rounded-lg bg-raimes-purple text-white font-semibold shadow-lg shadow-raimes-purple/20 hover:shadow-xl transition-transform hover:-translate-y-0.5"
              >
                Request Account
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl"
            >
              {["150+ mining sites", "25+ KPIs tracked", "99% compliance"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-3 text-sm font-semibold text-gray-700"
                >
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={scaleIn}
          >
            <div className="rounded-lg bg-white border border-gray-200 shadow-xl p-6 flex flex-col gap-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Assessment highlights</p>
                <p className="text-xl font-bold text-gray-900 mt-1">What teams get</p>
              </div>

              <div className="flex flex-col gap-3">
                {["Weighted AI scoring", "Evidence-first validation", "Stakeholder-ready PDF", "Progress tracking"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-gray-200">
                {[{ label: "Assessments", value: "120+" }, { label: "Avg. completion", value: "92%" }, { label: "Reports shipped", value: "250+" }].map((stat) => (
                  <div key={stat.label} className="py-2 px-2">
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature trio */}
      <section className="bg-raimes-purple text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map(({ title, copy, icon: Icon }) => (
            <motion.div
              key={title}
              className="rounded-lg border border-white/10 bg-white/5 backdrop-blur shadow-lg p-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeInUp}
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-raimes-yellow" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-indigo-100 mt-2 leading-relaxed">{copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="bg-raimes-white">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <motion.h2
            className="text-3xl font-black text-raimes-purple text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            Comprehensive, AI-powered mining assessment
          </motion.h2>
          <motion.p
            className="text-center text-slate-600 mt-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            Everything you need to audit ESG performance, validate evidence, and brief stakeholders.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {["Questionnaire-based assessment", "Real-time scoring", "Evidence validation", "Progress tracking", "Detailed PDF reports", "Stakeholder-friendly summaries"].map((item) => (
              <motion.div
                key={item}
                variants={fadeInUp}
                className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <p className="font-semibold text-gray-900 mb-1">{item}</p>
                <p className="text-sm text-gray-600">Purpose-built workflows to keep teams aligned and audits quick.</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-slate-50" id="benefits">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <motion.h2
            className="text-3xl font-black text-raimes-purple text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            From data to decisions in four moves
          </motion.h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-raimes-purple text-white font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="bg-raimes-purple text-white">
        <div className="max-w-5xl mx-auto px-6 py-14 flex flex-col items-center text-center gap-4">
          <motion.h2
            className="text-3xl font-black"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            Ready to raise your ESG game?
          </motion.h2>
          <motion.p
            className="text-indigo-100 max-w-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            Get a guided walkthrough, see how AI scoring works, and align your teams on sustainability goals.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 mt-2">
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg bg-white text-raimes-purple font-semibold shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-transform"
            >
              Request access
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg border border-white/60 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
          </motion.div>
        </div>
      </section>

      <motion.footer
        className="px-8 py-6 text-center text-slate-500 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        © {new Date().getFullYear()} RAIMES. Responsible AI Mining Evaluation System.
      </motion.footer>
    </div>
  );
}
