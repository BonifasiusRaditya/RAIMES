import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logoFull from "../assets/logo-full.png";

export default function Header({ useRootAnchors = false } = {}) {
  // Variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="px-8 py-5 bg-raimes-purple text-white shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex items-center shrink-0">
          <Link to="/" className="inline-block">
            <img src={logoFull} alt="RAIMES" className="h-10" />
          </Link>
        </motion.div>

        {/* Navigation Links - Center */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link) => {
            const href = link.href.startsWith("#")
              ? useRootAnchors
                ? `/${link.href}`
                : link.href
              : link.href;
            const isHashLink = href.startsWith("#");

            return (
              <motion.div
                key={link.label}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
              >
                {isHashLink ? (
                  <a
                    href={href}
                    className="text-white font-medium hover:text-raimes-yellow transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={href}
                    className="text-white font-medium hover:text-raimes-yellow transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Login Button - Right */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible">
          <Link
            to="/login"
            className="px-6 py-2.5 border border-white text-white font-semibold rounded-md hover:bg-white hover:text-raimes-purple transition-all duration-200"
          >
            Login
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
