import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { 
  Search, 
  PenSquare, 
  Menu, 
  X, 
  Bell,
  LogOut,
  User,
  Bookmark,
  Settings,
  ChevronDown
} from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthRedux();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Explore", path: "/explore" },
  ];

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.userName) return user.userName.charAt(0).toUpperCase();
    return 'U';
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1E1E1E] py-2"
            : "bg-[#0A0A0A] py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LEFT: Logo */}
            <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 border border-[#3B82F6]/30 flex items-center justify-center group-hover:border-[#3B82F6]/50 transition-all">
                  <span className="text-lg font-bold text-white">F</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#3B82F6] rounded-full border border-[#0A0A0A] animate-pulse" />
              </div>
              <span className="text-xl font-semibold text-white hidden sm:block">
                Flagged<span className="text-[#3B82F6]">.</span>
              </span>
            </Link>

            {/* CENTER: Navigation Links - Show only when logged in */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "text-white bg-[#1E1E1E]"
                          : "text-[#A1A1A1] hover:text-white hover:bg-[#1E1E1E]/50"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2">
              
              {/* Search Button - Always visible */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#121212] border border-[#1E1E1E] text-[#A1A1A1] hover:text-white transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Write Button */}
                  <Link
                    to="/write"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors"
                  >
                    <PenSquare className="w-4 h-4" />
                    <span>Write</span>
                  </Link>

                  {/* Notification Bell */}
                  <button className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg bg-[#121212] border border-[#1E1E1E] text-[#A1A1A1] hover:text-white transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#1E1E1E] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {getUserInitial()}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#A1A1A1] transition-transform duration-200 ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setIsProfileMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-56 bg-[#121212] border border-[#1E1E1E] rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            <div className="p-3 border-b border-[#1E1E1E]">
                              <p className="text-sm font-medium text-white">
                                {user?.userName || 'User'}
                              </p>
                              <p className="text-xs text-[#666666] truncate">
                                {user?.emailId || 'user@example.com'}
                              </p>
                            </div>
                            <div className="p-2">
                              <Link
                                to="/profile"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-[#1E1E1E] transition-colors"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                <User className="w-4 h-4" />
                                <span className="text-sm">Profile</span>
                              </Link>
                              <Link
                                to="/saved"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-[#1E1E1E] transition-colors"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                <Bookmark className="w-4 h-4" />
                                <span className="text-sm">Saved</span>
                              </Link>
                              <Link
                                to="/settings"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-[#1E1E1E] transition-colors"
                                onClick={() => setIsProfileMenuOpen(false)}
                              >
                                <Settings className="w-4 h-4" />
                                <span className="text-sm">Settings</span>
                              </Link>
                              <div className="border-t border-[#1E1E1E] my-2" />
                              <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#A1A1A1] hover:text-red-400 hover:bg-[#1E1E1E] transition-colors w-full"
                              >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Log out</span>
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-[#A1A1A1] hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:block px-4 py-2 text-sm font-medium bg-white text-[#0A0A0A] rounded-lg hover:bg-[#F5F5F5] transition-colors"
                  >
                    Sign up
                  </Link>
                  {/* Mobile Auth Button */}
                  <Link
                    to="/login"
                    className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#121212] border border-[#1E1E1E] text-[#A1A1A1] hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#121212] border border-[#1E1E1E] text-[#A1A1A1] hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="w-full h-10 pl-11 pr-4 bg-[#121212] border border-[#1E1E1E] rounded-xl text-white placeholder-[#666666] focus:outline-none focus:border-[#3B82F6] text-sm"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#0A0A0A] border-l border-[#1E1E1E] shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-semibold text-white">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-[#121212] border border-[#1E1E1E] text-[#A1A1A1] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {isAuthenticated ? (
                    <>
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-[#1E1E1E]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {getUserInitial()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user?.userName || 'User'}
                          </p>
                          <p className="text-xs text-[#666666] truncate">
                            {user?.emailId || 'user@example.com'}
                          </p>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-1">
                        <Link
                          to="/home"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-[#121212] transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>Home</span>
                        </Link>
                        <Link
                          to="/saved"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-[#121212] transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Bookmark className="w-4 h-4" />
                          <span>Saved</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-[#121212] transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-[#121212] transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="pt-4 border-t border-[#1E1E1E]">
                        <Link
                          to="/write"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <PenSquare className="w-4 h-4" />
                          <span>Write a story</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-2 bg-[#121212] text-[#A1A1A1] rounded-lg hover:text-red-400 hover:bg-[#1E1E1E] transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        className="flex items-center justify-center w-full px-4 py-3 rounded-lg border border-[#1E1E1E] text-[#A1A1A1] hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center justify-center w-full px-4 py-3 bg-white text-[#0A0A0A] rounded-lg hover:bg-[#F5F5F5] transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;