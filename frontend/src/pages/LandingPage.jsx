import React from 'react';
import { Link } from 'react-router-dom';
import logoFull from '../assets/logo-full.png';

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-raimes-purple flex flex-col">
			{/* Header */}
			<header className="px-8 py-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<img src={logoFull} alt="RAIMES" className="h-10" />
					<span className="sr-only">RAIMES</span>
				</div>
				<nav className="hidden md:flex items-center gap-6 text-white">
					<a href="#features" className="hover:text-raimes-yellow">Features</a>
					<a href="#benefits" className="hover:text-raimes-yellow">Benefits</a>
					<a href="#modules" className="hover:text-raimes-yellow">Modules</a>
					<a href="#contact" className="hover:text-raimes-yellow">Contact</a>
				</nav>
				<div className="flex gap-3">
					<Link to="/login" className="px-4 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-raimes-purple hover:text-white transition-colors">Login</Link>
					<Link to="/register" className="px-4 py-2 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">Register</Link>
				</div>
			</header>

			{/* Hero */}
			<section className="px-8 py-12 bg-linear-to-b from-raimes-white to-gray-100">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
					<div>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Certified Sustainability Platform</div>
						<h1 className="mt-4 text-5xl font-extrabold text-raimes-purple leading-tight">Transform Mining into <span className="text-raimes-yellow">Sustainable</span> Future</h1>
						<p className="mt-4 text-gray-700 text-lg">Real-time integrated management system for comprehensive responsible AI mining rating. Monitor, analyze, and improve performance with data-driven insights.</p>
						<div className="mt-8 flex gap-4">
							<Link to="/login" className="px-6 py-3 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90">Get Started Free</Link>
							<a href="#features" className="px-6 py-3 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white">Watch Demo</a>
						</div>
					</div>
					<div className="bg-white rounded-2xl shadow p-6">
						<h3 className="text-raimes-purple font-semibold mb-4">Eco Rating</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-gray-50 rounded-xl p-4">
								<div className="text-sm text-gray-500">Water</div>
								<div className="text-2xl font-bold text-raimes-purple">92%</div>
							</div>
							<div className="bg-gray-50 rounded-xl p-4">
								<div className="text-sm text-gray-500">Energy</div>
								<div className="text-2xl font-bold text-raimes-purple">88%</div>
							</div>
							<div className="bg-gray-50 rounded-xl p-4">
								<div className="text-sm text-gray-500">Safety</div>
								<div className="text-2xl font-bold text-raimes-purple">95%</div>
							</div>
							<div className="bg-gray-50 rounded-xl p-4">
								<div className="text-sm text-gray-500">Emissions</div>
								<div className="text-2xl font-bold text-raimes-purple">85%</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Counters */}
			<section className="px-8 py-10 bg-white">
				<div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
					<div>
						<div className="text-4xl font-extrabold text-raimes-purple">150+</div>
						<div className="text-gray-600">Mining Sites</div>
					</div>
					<div>
						<div className="text-4xl font-extrabold text-raimes-purple">25+</div>
						<div className="text-gray-600">KPIs Tracked</div>
					</div>
					<div>
						<div className="text-4xl font-extrabold text-raimes-purple">40%</div>
						<div className="text-gray-600">CO₂ Reduction</div>
					</div>
					<div>
						<div className="text-4xl font-extrabold text-raimes-purple">99%</div>
						<div className="text-gray-600">Compliance Rate</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section id="features" className="px-8 py-12 bg-gray-50">
				<div className="max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold text-raimes-purple text-center">Powerful Features for <span className="text-raimes-yellow">Sustainable Mining</span></h2>
					<p className="text-center text-gray-600 mt-2">Comprehensive tools to monitor, analyze, and improve your performance.</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
						{[
							['Real-Time Monitoring','IoT sensor integration for continuous environmental data collection and analysis.'],
							['Dynamic Rating System','KPI-based scoring with transparent methodology and benchmarking.'],
							['Predictive Analytics','AI-powered insights to forecast trends and identify improvements.'],
							['Compliance Tracking','Automated monitoring of regulatory requirements and certification.'],
							['Automated Reporting','Customizable reports for stakeholders, regulators, and investors.'],
							['Multi-Site Management','Centralized dashboard to manage multiple operations.'],
						].map(([title, desc]) => (
							<div key={title} className="bg-white rounded-2xl p-6 shadow">
								<h3 className="text-lg font-semibold text-raimes-purple">{title}</h3>
								<p className="text-gray-700 mt-2">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Why Choose */}
			<section id="benefits" className="px-8 py-12 bg-white">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
					<div>
						<h2 className="text-3xl font-bold text-raimes-purple">Why Choose <span className="text-raimes-yellow">RAIMES</span>?</h2>
						<ul className="mt-4 space-y-3 text-gray-700">
							<li>Continuous Monitoring — get real-time insights 24/7</li>
							<li>Transparent Methodology — standardized framework</li>
							<li>Investor Confidence — stronger ESG ratings</li>
							<li>Competitive Advantage — demonstrate sustainability leadership</li>
						</ul>
					</div>
					<div className="bg-gray-50 rounded-2xl p-6 shadow">
						<h3 className="text-raimes-purple font-semibold">For Stakeholders</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
							{['Mining Companies','Regulators','Investors'].map((s) => (
								<div key={s} className="bg-white rounded-xl p-4 shadow-sm">
									<div className="text-raimes-purple font-semibold">{s}</div>
									<div className="text-gray-600 text-sm mt-1">Benchmark, monitor compliance, and verify claims with data.</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section id="contact" className="px-8 py-14 bg-gray-50">
				<div className="max-w-5xl mx-auto text-center bg-white rounded-2xl p-10 shadow">
					<h2 className="text-3xl font-bold text-raimes-purple">Ready to Transform Your Mining Operations?</h2>
					<p className="text-gray-700 mt-2">Join mining companies building a sustainable future.</p>
					<div className="mt-6 flex justify-center gap-4">
						<Link to="/register" className="px-6 py-3 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90">Request an Account</Link>
						<Link to="/login" className="px-6 py-3 border-2 border-raimes-yellow text-raimes-yellow font-semibold rounded-lg hover:bg-raimes-yellow hover:text-white">Contact Admin</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="px-8 py-6 text-center bg-raimes-purple text-white">© {new Date().getFullYear()} RAIMES</footer>
		</div>
	);
}

