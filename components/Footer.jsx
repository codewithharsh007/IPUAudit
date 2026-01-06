import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              IPU Trinity
            </h3>
            <p className="text-sm">
              A unified platform for managing college registrations and
              university administration.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Important Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-white"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-white"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: support@iputrinity.edu</li>
              <li>Phone: +91-XXX-XXX-XXXX</li>
              <li>Help Center: Available 24/7</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Responsive: Vertical on Mobile, Horizontal on Desktop */}
        <div className="-mx-4 mt-8 border-t border-gray-800 px-4 pt-8 sm:-mx-6 sm:px-6 md:border-t-2 lg:-mx-8 lg:px-8">
          <div className="flex flex-col space-y-2 text-center text-sm md:flex-row md:items-center md:justify-between md:space-y-0 md:text-left">
            <p>
              &copy; {new Date().getFullYear()} IPU Trinity. All rights
              reserved.
            </p>
            <p className="text-gray-500">
              Created by Harsh - Full Stack Developer
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
