import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logoFull from "../assets/logo-full.png";

export default function Header() {
  // Variants
  const staggerChildren = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Benefits", href: "#benefits" },
    { label: "Modules", href: "#modules" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
      className="px-8 py-6 flex items-center justify-between bg-raimes-purple bg-opacity-50 backdrop-blur-sm"
    >
      <motion.div
        variants={fadeIn}
        className="flex items-center gap-3 cursor-pointer"
      >
        <Link to="/">
          <img src={logoFull} alt="RAIMES" className="h-10" />
        </Link>
        <span className="sr-only">RAIMES</span>
      </motion.div>
      <nav className="hidden md:flex items-center gap-6 text-white">
        {navLinks.map((link) => (
          <motion.div
            key={link.label}
            variants={fadeIn}
            whileHover={{ color: "#FCD34D" }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            {link.href.startsWith("#") ? (
              <a href={link.href} className="hover:text-raimes-yellow">
                {link.label}
              </a>
            ) : (
              <Link to={link.href} className="hover:text-raimes-yellow">
                {link.label}
              </Link>
            )}
          </motion.div>
        ))}
      </nav>
      <motion.div variants={fadeIn} className="flex gap-3">
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/login"
            className="px-4 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-raimes-purple hover:text-white transition-colors"
          >
            Login
          </Link>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/register"
            className="px-4 py-2 bg-raimes-yellow text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Register
          </Link>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
