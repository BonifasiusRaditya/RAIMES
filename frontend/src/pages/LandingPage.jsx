import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logoFull from '../assets/logo-full.png';

export default function LandingPage() {
	const prefersReducedMotion = useReducedMotion();

	// Variants
	const fadeInUp = {
		hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
	};

	const staggerChildren = {
		hidden: {},
		visible: {
			transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 }
		}
	};

	const fadeIn = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.6 } }
	};

	const scaleIn = {
		hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 },
		visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
	};

	return (
		<div className="min-h-screen bg-raimes-purple flex flex-col">
			{/* Header */}
			<motion.header
				initial="hidden"
				animate="visible"
				variants={staggerChildren}
				className="px-8 py-6 flex items-center justify-between"
			>
				<motion.div variants={fadeIn} className="flex items-center gap-3">
					<img src={logoFull} alt="RAIMES" className="h-10" />
					<span className="sr-only">RAIMES</span>
				</motion.div>
				<nav className="hidden md:flex items-center gap-6 text-white">
					{['#features','\#benefits','\#modules','\#contact'].map((href, i) => (
						<motion.a
							key={href}
							href={href.replace('\\','')}
							variants={fadeIn}
							whileHover={{ color: '#F3C614' }}
							transition={{ type: 'tween', duration: 0.2 }}
							className="hover:text-raimes-yellow"
						>
							{['Features','Benefits','Modules','Contact'][i]}
						</motion.a>
					))}
				</nav>
				<motion.div variants={fadeIn} className="flex gap-3">
					<motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
						<Link to="/login" className="px-4 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-raimes-purple hover:text-white transition-colors">Login</Link>
					</motion.div>
					<motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
						<Link to="/register" className="px-4 py-2 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">Register</Link>
					</motion.div>
				</motion.div>
			</motion.header>

			{/* Hero */}
			<section className="px-8 py-12 bg-linear-to-b from-raimes-white to-gray-100">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={staggerChildren}
					>
						<motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Certified Sustainability Platform</motion.div>
						<motion.h1 variants={fadeInUp} className="mt-4 text-5xl font-extrabold text-raimes-purple leading-tight">Transform Mining into <span className="text-raimes-yellow">Sustainable</span> Future</motion.h1>
						<motion.p variants={fadeInUp} className="mt-4 text-gray-700 text-lg">Real-time integrated management system for comprehensive responsible AI mining rating. Monitor, analyze, and improve performance with data-driven insights.</motion.p>
						<motion.div variants={fadeInUp} className="mt-8 flex gap-4">
							<motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
								<Link to="/login" className="px-6 py-3 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90">Get Started Free</Link>
							</motion.div>
							<motion.a href="#features" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white">Watch Demo</motion.a>
						</motion.div>
					</motion.div>
					<motion.div
						className="bg-white rounded-2xl shadow p-6"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
						variants={scaleIn}
					>
						<h3 className="text-raimes-purple font-semibold mb-4">Eco Rating</h3>
						<motion.div className="grid grid-cols-2 gap-4" variants={staggerChildren} initial="hidden" animate="visible">
							{[
								['Water','92%'],
								['Energy','88%'],
								['Safety','95%'],
								['Emissions','85%']
							].map(([label, val]) => (
								<motion.div
									key={label}
									variants={fadeInUp}
									whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
									className="bg-gray-50 rounded-xl p-4"
								>
									<div className="text-sm text-gray-500">{label}</div>
									<div className="text-2xl font-bold text-raimes-purple">{val}</div>
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Counters */}
			<section className="px-8 py-10 bg-white">
				<motion.div
					className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.3 }}
					variants={staggerChildren}
				>
					{[
						['150+','Mining Sites'],
						['25+','KPIs Tracked'],
						['40%','CO₂ Reduction'],
						['99%','Compliance Rate']
					].map(([num, label]) => (
						<motion.div key={label} variants={fadeInUp}>
							<div className="text-4xl font-extrabold text-raimes-purple">{num}</div>
							<div className="text-gray-600">{label}</div>
						</motion.div>
					))}
				</motion.div>
			</section>

			{/* Features Grid */}
			<section id="features" className="px-8 py-12 bg-gray-50">
				<div className="max-w-6xl mx_auto"></div>
				<div className="max-w-6xl mx-auto">
					<motion.h2
						className="text-3xl font-bold text-raimes-purple text-center"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={fadeInUp}
					>
						Powerful Features for <span className="text-raimes-yellow">Sustainable Mining</span>
					</motion.h2>
					<motion.p
						className="text-center text-gray-600 mt-2"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={fadeInUp}
					>
						Comprehensive tools to monitor, analyze, and improve your performance.
					</motion.p>
					<motion.div
						className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
						variants={staggerChildren}
					>
						{[
							['Real-Time Monitoring','IoT sensor integration for continuous environmental data collection and analysis.'],
							['Dynamic Rating System','KPI-based scoring with transparent methodology and benchmarking.'],
							['Predictive Analytics','AI-powered insights to forecast trends and identify improvements.'],
							['Compliance Tracking','Automated monitoring of regulatory requirements and certification.'],
							['Automated Reporting','Customizable reports for stakeholders, regulators, and investors.'],
							['Multi-Site Management','Centralized dashboard to manage multiple operations.'],
						].map(([title, desc], idx) => (
							<motion.div
								key={title}
								variants={fadeInUp}
								whileHover={{ y: prefersReducedMotion ? 0 : -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
								transition={{ duration: 0.2 }}
								className="bg-white rounded-2xl p-6 shadow"
							>
								<h3 className="text-lg font-semibold text-raimes-purple">{title}</h3>
								<p className="text-gray-700 mt-2">{desc}</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Why Choose */}
			<section id="benefits" className="px-8 py-12 bg-white">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
						variants={staggerChildren}
					>
						<motion.h2 variants={fadeInUp} className="text-3xl font-bold text-raimes-purple">Why Choose <span className="text-raimes-yellow">RAIMES</span>?</motion.h2>
						<motion.ul className="mt-4 space-y-3 text-gray-700">
							{[
								'Continuous Monitoring — get real-time insights 24/7',
								'Transparent Methodology — standardized framework',
								'Investor Confidence — stronger ESG ratings',
								'Competitive Advantage — demonstrate sustainability leadership'
							].map((item) => (
								<motion.li key={item} variants={fadeInUp} className="pl-1">{item}</motion.li>
							))}
						</motion.ul>
					</motion.div>
					<motion.div
						className="bg-gray-50 rounded-2xl p-6 shadow"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
						variants={scaleIn}
					>
						<h3 className="text-raimes-purple font-semibold">For Stakeholders</h3>
						<motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" variants={staggerChildren} initial="hidden" animate="visible">
							{['Mining Companies','Regulators','Investors'].map((s) => (
								<motion.div key={s} variants={fadeInUp} className="bg-white rounded-xl p-4 shadow-sm">
									<div className="text-raimes-purple font-semibold">{s}</div>
									<div className="text-gray-600 text-sm mt-1">Benchmark, monitor compliance, and verify claims with data.</div>
								</motion.div>
							))}
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* CTA */}
			<section id="contact" className="px-8 py-14 bg-gray-50">
				<motion.div
					className="max-w-5xl mx-auto text-center bg-white rounded-2xl p-10 shadow"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.3 }}
					variants={scaleIn}
				>
					<motion.h2 variants={fadeInUp} className="text-3xl font-bold text-raimes-purple">Ready to Transform Your Mining Operations?</motion.h2>
					<motion.p variants={fadeInUp} className="text-gray-700 mt-2">Join mining companies building a sustainable future.</motion.p>
					<motion.div variants={fadeInUp} className="mt-6 flex justify-center gap-4">
						<motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
							<Link to="/register" className="px-6 py-3 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90">Request an Account</Link>
						</motion.div>
						<motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
							<Link to="/login" className="px-6 py-3 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white">Contact Admin</Link>
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

