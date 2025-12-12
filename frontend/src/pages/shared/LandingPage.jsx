import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import { Droplets, Zap, Shield, Wind, Leaf, BarChart3, Sparkles, Check, TrendingUp, Award, Lightbulb, Target } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={staggerChildren}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4" /> Responsible AI Mining
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mt-6 text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight"
            >
              Transform mining into a sustainable future
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-gray-700 max-w-lg leading-relaxed"
            >
              Systematic ESG assessment powered by weighted AI scoring, evidence-first validation, and stakeholder-ready intelligence. Built for mining operators and auditors seeking data-driven accountability.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10">
              <Link
                to="/register"
                className="inline-block px-8 py-3.5 rounded-md bg-raimes-purple text-white font-semibold hover:bg-indigo-900 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Request account
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-12 flex flex-col gap-2"
            >
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Trusted by leading mining companies</p>
              <div className="flex flex-wrap gap-6">
                <div className="flex flex-col">
                  <div className="text-3xl font-bold text-raimes-purple">150+</div>
                  <div className="text-sm text-gray-600">Mining sites</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-3xl font-bold text-raimes-purple">25+</div>
                  <div className="text-sm text-gray-600">KPIs tracked</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-3xl font-bold text-raimes-purple">99%</div>
                  <div className="text-sm text-gray-600">Compliance</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={scaleIn}
          >
            <div className="rounded-lg bg-white border border-raimes-purple/15 shadow-lg p-8 flex flex-col gap-8">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Assessment highlights</p>
                <p className="text-2xl font-bold text-raimes-purple mt-2">What teams get</p>
              </div>

              {/* Features List with Checkmarks */}
              <div className="space-y-4">
                {["Weighted AI scoring", "Evidence-first validation", "Stakeholder-ready PDF", "Progress tracking"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-gray-900 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              {/* Stats Section */}
              <div className="border-t border-gray-200 pt-8">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-6">By the numbers</p>
                <div className="grid grid-cols-3 gap-6">
                  {[{ label: "Assessments", value: "120+" }, { label: "Avg. completion", value: "92%" }, { label: "Reports shipped", value: "250+" }].map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <div className="text-4xl font-bold text-raimes-purple">{stat.value}</div>
                      <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature trio */}
      <section className="bg-raimes-purple text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureCards.map(({ title, copy, icon: Icon }) => (
            <motion.div
              key={title}
              className="rounded-lg border border-white/15 bg-white/10 p-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeInUp}
            >
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-raimes-yellow" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-indigo-100 mt-3 leading-relaxed">{copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.h2
            className="text-4xl font-bold text-raimes-purple text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            Comprehensive, AI-powered mining assessment
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 mt-4 text-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            Everything you need to audit ESG performance, validate evidence, and brief stakeholders.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerChildren}
          >
            {[
              { item: "Questionnaire-based assessment", icon: Target },
              { item: "Real-time scoring", icon: Zap },
              { item: "Evidence validation", icon: Check },
              { item: "Progress tracking", icon: TrendingUp },
              { item: "Detailed PDF reports", icon: BarChart3 },
              { item: "Stakeholder-friendly summaries", icon: Award }
            ].map(({ item, icon: Icon }) => (
              <motion.div
                key={item}
                variants={fadeInUp}
                className="rounded-xl border border-raimes-purple/20 bg-white p-6 hover:shadow-lg hover:border-raimes-purple/40 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-raimes-purple/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-raimes-purple" />
                </div>
                <p className="font-semibold text-gray-900">{item}</p>
                <p className="text-sm text-gray-600 mt-2">Purpose-built workflows to keep teams aligned and audits quick.</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Mining Site - Vale Sorowako */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerChildren}
            className="flex flex-col items-center text-center gap-4 mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-raimes-purple"
            >
              Assessment Case Study
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 max-w-2xl"
            >
              Real-world responsible mining assessment in progress
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
            className="max-w-2xl mx-auto"
          >
            <div className="rounded-xl border border-raimes-purple/20 bg-white shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-raimes-purple text-white p-8">
                <h3 className="text-3xl font-bold mb-2">Vale Sorowako</h3>
                <p className="text-purple-100">Nickel Mining Operations</p>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Operating Company</p>
                    <p className="text-lg text-gray-900 font-semibold mt-1">Vale</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Mine Site</p>
                    <p className="text-lg text-gray-900 font-semibold mt-1">Sorowako</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Location</p>
                    <p className="text-sm text-gray-700 mt-1">Sorowako, East Luwu Regency, South Sulawesi Province, Indonesia</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Assessment Status</p>
                    <p className="text-sm text-raimes-purple font-semibold mt-1">Independent Assessment In Process</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-bold text-raimes-purple mb-4">Primary Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Director Name</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">Anditya Sudirgo</p>
                      <p className="text-xs text-gray-600 mt-1">ESG Disclosure and Engagement Specialist</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                      <a href="mailto:anditya.sudirgo@vale.com" className="text-sm text-raimes-purple hover:underline mt-1 block">
                        anditya.sudirgo@vale.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-bold text-raimes-purple mb-4">Resources</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Website</p>
                      <a 
                        href="https://www.vale.com/indonesia/about-pt-vale" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-raimes-purple hover:underline break-all"
                      >
                        https://www.vale.com/indonesia/about-pt-vale
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Previous Assessment</p>
                      <a 
                        href="https://connections.responsiblemining.net/site/335" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-raimes-purple hover:underline break-all"
                      >
                        https://connections.responsiblemining.net/site/335
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Segmen A: Metodologi Skoring dan Akuntabilitas */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-raimes-purple text-center"
            >
              Transparency in Accountability
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-center text-gray-600 mt-4 text-lg max-w-3xl mx-auto"
            >
              RAIMES builds stakeholder confidence through systematic, auditable scoring methodologies that eliminate ambiguity.
            </motion.p>

            <motion.div
              variants={staggerChildren}
              className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <motion.div
                variants={fadeInUp}
                className="rounded-xl border border-raimes-purple/20 bg-white p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-raimes-purple/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-raimes-purple" />
                  </div>
                  <h3 className="text-xl font-bold text-raimes-purple">Weighted AI Scoring</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">•</span>
                    <span className="text-gray-700"><strong>Parametric Logic:</strong> Each question carries predefined weights; AI applies consistent rules across all assessments.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">•</span>
                    <span className="text-gray-700"><strong>Transparent Calculation:</strong> Score breakdowns show auditors exactly how responses influence final ratings.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">•</span>
                    <span className="text-gray-700"><strong>Bias Mitigation:</strong> Standardized weights reduce human judgment variance and improve audit defensibility.</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="rounded-xl border border-raimes-purple/20 bg-white p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-raimes-purple/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-raimes-purple" />
                  </div>
                  <h3 className="text-xl font-bold text-raimes-purple">Evidence-First Validation</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">•</span>
                    <span className="text-gray-700"><strong>Claim-to-Proof Mapping:</strong> Every assertion requires supporting documentation—eliminating unsubstantiated claims.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">•</span>
                    <span className="text-gray-700"><strong>Audit Trail:</strong> Complete record of submissions, uploads, and validation steps for full traceability.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">•</span>
                    <span className="text-gray-700"><strong>Validation Governance:</strong> Auditors can flag incomplete or insufficient evidence before scores finalize.</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Segmen B: Selaras dengan Standar Global */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-raimes-purple text-center"
            >
              Responsible Mining Standards
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-center text-gray-600 mt-4 text-lg max-w-3xl mx-auto"
            >
              RAIMES assessments align with global responsible mining frameworks and international best practices for sustainable operations.
            </motion.p>

            <motion.div
              variants={staggerChildren}
              className="mt-12 space-y-6"
            >
              <motion.div
                variants={fadeInUp}
                className="rounded-lg border border-raimes-purple/15 bg-white p-8"
              >
                <h3 className="text-xl font-bold text-raimes-purple mb-4">Guided by International Standards</h3>
                <p className="text-gray-700 mb-4">
                  Our assessment framework incorporates best practices from leading responsible mining initiatives:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-raimes-purple rounded-full"></span>
                    <span className="text-gray-700"><strong>IRMA Standards</strong> – Comprehensive auditable requirements for responsible mining practices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-raimes-purple rounded-full"></span>
                    <span className="text-gray-700"><strong>RMI Framework</strong> – Company-level performance evaluation on EESG criteria</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="rounded-lg border border-raimes-purple/15 bg-white p-8"
              >
                <h3 className="text-xl font-bold text-raimes-purple mb-4">Assessment & Transparency</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">✓</span>
                    <span className="text-gray-700">Questions mapped to IRMA's 420+ auditable requirements covering human rights, environmental protection, and community welfare.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">✓</span>
                    <span className="text-gray-700">RMI methodology applied to evaluate corporate policies and on-site practices across Environmental, Social, Economic, and Governance dimensions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold mt-1">✓</span>
                    <span className="text-gray-700">Transparent scoring and public reporting aligned with stakeholder expectations for accountability.</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Segmen C: Fitur Laporan dan Output Strategis */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerChildren}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-raimes-purple text-center"
            >
              Strategic Reporting for Leaders
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-center text-gray-600 mt-4 text-lg max-w-3xl mx-auto"
            >
              Transform raw assessment data into executive summaries and board-ready reports that drive informed decision-making.
            </motion.p>

            <motion.div
              variants={staggerChildren}
              className="mt-12 space-y-6"
            >
              <motion.div
                variants={fadeInUp}
                className="rounded-xl border-2 border-blue-400/20 bg-linear-to-br from-blue-50/80 to-cyan-50/80 p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-700">Detailed PDF Reports</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Comprehensive reports equip auditors and compliance teams with full assessment visibility:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold">→</span>
                    <span className="text-gray-700">Question-by-question scoring breakdowns with evidence references</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold">→</span>
                    <span className="text-gray-700">Weighted scoring methodology explanation for audit defense</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold">→</span>
                    <span className="text-gray-700">Gap analysis highlighting non-compliance areas and improvement priorities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold">→</span>
                    <span className="text-gray-700">Progress tracking over time—visualize ESG trajectory quarter-over-quarter</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="rounded-xl border-2 border-violet-400/20 bg-linear-to-br from-violet-50/80 to-pink-50/80 p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-bold text-violet-700">Stakeholder-Friendly Summaries</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Board-ready executive briefs simplify complex ESG data for non-technical stakeholders:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold">→</span>
                    <span className="text-gray-700">Visual dashboards and KPI cards for quick-scan comprehension</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold">→</span>
                    <span className="text-gray-700">Risk stratification—red-flag critical gaps requiring immediate action</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold">→</span>
                    <span className="text-gray-700">Benchmarking context—see how your site compares to industry standards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-raimes-purple font-bold">→</span>
                    <span className="text-gray-700">Action roadmaps with prioritized recommendations for stakeholder buy-in</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-gray-50" id="benefits">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.h2
            className="text-4xl font-bold text-raimes-purple text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            From data to decisions in four moves
          </motion.h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="rounded-lg border border-raimes-purple/15 bg-white p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-md bg-raimes-purple text-white font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-raimes-purple">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="bg-raimes-purple text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
          <motion.h2
            className="text-4xl font-bold"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            Ready to raise your ESG game?
          </motion.h2>
          <motion.p
            className="text-gray-300 max-w-2xl text-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
          >
            Get a guided walkthrough, see how AI scoring works, and align your teams on sustainability goals.
          </motion.p>
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} className="flex flex-wrap justify-center gap-4 mt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-md bg-white text-raimes-purple font-semibold hover:bg-gray-100 transition-colors"
            >
              Request access
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-md border border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="px-8 py-6 text-center text-gray-500 bg-white border-t border-gray-200">
        © {new Date().getFullYear()} RAIMES. Responsible AI Mining Evaluation System.
      </footer>
    </div>
  );
}
