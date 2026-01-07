"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ role, onLogout }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavLinks = () => {
    if (role === "admin") {
      return [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/colleges", label: "Colleges" },
        { href: "/admin/requests", label: "Requests" },
      ];
    } else if (role === "college") {
      return [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/profile", label: "Profile" },
        { href: "/academic-audit", label: "Academic Audit" },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href={role === "admin" ? "/admin/dashboard" : "/dashboard"}
              className="flex items-center"
            >
              <span className="text-2xl font-bold text-indigo-600">
                IPU Trinity
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={onLogout}
              className="ml-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? "Close menu" : "Open menu"}
              </span>
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 border-t border-gray-200 bg-gray-50 px-2 pt-2 pb-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                pathname === link.href
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full rounded-md bg-red-600 px-3 py-2 text-left text-base font-medium text-white transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
