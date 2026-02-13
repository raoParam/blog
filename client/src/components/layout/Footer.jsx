import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-lg font-semibold text-white">
                Flagged<span className="text-[#3B82F6]">.</span>
              </span>
            </Link>
            <p className="text-sm text-[#A1A1A1] max-w-md">
              A modern platform for developers to write and share their stories — 
              publicly or anonymously.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              {['Home', 'Explore', 'Write'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-sm text-[#A1A1A1] hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {['Privacy', 'Terms', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`}
                    className="text-sm text-[#A1A1A1] hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-[#1E1E1E]">
          <p className="text-sm text-[#666666] text-center">
            © 2026 Flagged. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer