import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logoFull from "../assets/logo-full.png";

export default function Header({ useRootAnchors = false } = {}) {
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
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
      className="px-8 py-4 bg-raimes-purple animate-slideDown"
    >
      <div className="flex items-center justify-between">
        <motion.div variants={fadeIn} className="flex items-center">
          <Link to="/">
            <img src={logoFull} alt="RAIMES" className="h-12 animate-fadeIn" />
          </Link>
          <span className="sr-only">RAIMES</span>
        </motion.div>
        <nav className="hidden md:flex items-center gap-12 text-white">
          {navLinks.map((link) => (
            <motion.div
              key={link.label}
              variants={fadeIn}
              whileHover={{ y: -2 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              {(() => {
                const href = link.href.startsWith("#")
                  ? useRootAnchors
                    ? `/${link.href}`
                    : link.href
                  : link.href;
                return href.startsWith("#") ? (
                  <a
                    href={href}
                    className="font-semibold hover:text-raimes-yellow transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={href}
                    className="font-semibold hover:text-raimes-yellow transition-colors"
                  >
                    {link.label}
                  </Link>
                );
              })()}
            </motion.div>
          ))}
        </nav>
        <motion.div variants={fadeIn}>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/login"
              className="px-6 py-2 bg-raimes-yellow text-blue font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}
