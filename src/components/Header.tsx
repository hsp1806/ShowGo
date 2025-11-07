import { Menu, X, Plus, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  onNavClick: (ref: React.RefObject<HTMLDivElement>) => void;
  refs: {
    homeRef: React.RefObject<HTMLDivElement>;
    eventsRef: React.RefObject<HTMLDivElement>;
    aboutRef: React.RefObject<HTMLDivElement>;
  };
  onCreateEventClick: () => void;
  onJoinClick: () => void;
  onSignInClick: () => void;
  onLogoutClick: () => void;
  onProfileClick: () => void;
  user: User | null;
}

export default function Header({ onNavClick, refs, onCreateEventClick, onJoinClick, onSignInClick, onLogoutClick, onProfileClick, user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (ref: React.RefObject<HTMLDivElement>) => {
    onNavClick(ref);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', ref: refs.homeRef },
    { label: 'Events', ref: refs.eventsRef },
    { label: 'About', ref: refs.aboutRef },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNavClick(refs.homeRef)}
            className="text-2xl font-bold tracking-tight hover:text-purple-400 transition-colors"
          >
            Show<span className="text-purple-500">Go</span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.ref)}
                className="text-sm font-medium hover:text-purple-400 transition-colors"
              >
                {item.label}
              </button>
            ))}
            {user && (
              <button
                onClick={onCreateEventClick}
                className="flex items-center gap-2 text-sm font-medium hover:text-purple-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={onLogoutClick}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onSignInClick}
                  className="px-4 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onJoinClick}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                >
                  Join Now
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/5 pt-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.ref)}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
              >
                {item.label}
              </button>
            ))}
            {user && (
              <button
                onClick={() => {
                  onCreateEventClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            )}
            <div className="pt-3 space-y-2 border-t border-white/5">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      onProfileClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      onLogoutClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onSignInClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      onJoinClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Join Now
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
