import { useRef, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Hero from './components/Hero';
import EventsSection from './components/EventsSection';
import About from './components/About';
import Profile from './components/Profile';
import CreateEventModal from './components/CreateEventModal';
import SignUpModal from './components/SignUpModal';
import SignInModal from './components/SignInModal';

type ViewType = 'home' | 'profile';

function App() {
  const homeRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEventCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('home');
  };

  const handleViewProfile = () => {
    setCurrentView('profile');
  };

  const handleViewHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header
        onNavClick={(ref) => {
          setCurrentView('home');
          setTimeout(() => scrollToSection(ref), 100);
        }}
        refs={{ homeRef, eventsRef, aboutRef }}
        onCreateEventClick={() => setIsCreateEventModalOpen(true)}
        onJoinClick={() => setIsSignUpModalOpen(true)}
        onSignInClick={() => setIsSignInModalOpen(true)}
        onLogoutClick={handleLogout}
        onProfileClick={handleViewProfile}
        user={user}
      />
      {currentView === 'home' ? (
        <>
          {!user && (
            <div ref={homeRef}>
              <Hero onJoinClick={() => setIsSignUpModalOpen(true)} />
            </div>
          )}
          <div ref={eventsRef} className={user ? 'pt-24' : ''}>
            <EventsSection refreshTrigger={refreshTrigger} user={user} onSignUpClick={() => setIsSignUpModalOpen(true)} />
          </div>
          <div ref={aboutRef}>
            <About />
          </div>
          <footer className="bg-[#0f0f14] border-t border-gray-800 py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-gray-400">Built by <span className="text-white font-semibold">Het Patel</span></p>
              <p className="text-sm text-gray-500 mt-1">Part of <span className="text-teal-400 font-semibold">GrowFrame</span> - Creating tools for growth and innovation</p>
            </div>
          </footer>
        </>
      ) : (
        user && <Profile user={user} onCreateEventClick={() => setIsCreateEventModalOpen(true)} />
      )}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onEventCreated={handleEventCreated}
        user={user}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSwitchToSignIn={() => setIsSignInModalOpen(true)}
        onSignUpSuccess={handleViewProfile}
      />
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSwitchToSignUp={() => setIsSignUpModalOpen(true)}
        onSignInSuccess={handleViewProfile}
      />
    </div>
  );
}

export default App;
