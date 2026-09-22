import { useEffect, useState } from 'react';
import { useRouter, buildPath } from '@/lib/router';
import { getConfig } from '@/lib/config';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ActivityTicker } from '@/components/ActivityTicker';
import {
  PositioningSection,
  BecomeSection,
  NoFollowersSection,
  RealityShowSection,
  WinnerSection,
  PrizeSection,
  MediaSection,
  MysterySection,
  ScarcitySection,
  TrustSection,
  FinalCtaSection,
  CountersSection,
  Footer,
} from '@/components/Sections';
import { RegisterForm } from '@/components/RegisterForm';
import { PaymentPage } from '@/components/PaymentPage';
import { ThankYou } from '@/components/ThankYou';
import { Dashboard } from '@/components/Dashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { Login } from '@/components/Login';
import type { AdminConfig } from '@/lib/types';

function App() {
  const { route, navigate } = useRouter();
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    const handler = () => {
      setShowStickyCta(window.scrollY > 600);
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const goRegister = () => navigate('/register');
  const goHome = () => navigate('/');

  // Admin route
  if (route.name === 'admin') {
    return <AdminPanel />;
  }
  // Login route
  if (route.name === 'login') {
    return (
      <Login
        onBack={goHome}
        onLoggedIn={(pid) => navigate(buildPath('/dashboard', { pid }))}
      />
    );
  }
  // Registration route
  if (route.name === 'register') {
    return <RegisterForm refId={route.ref ?? null} onBack={goHome} onRegistered={(pid) => navigate(buildPath('/payment', { pid }))} />;
  }

  // Payment route
  if (route.name === 'payment' && route.participantId) {
    return (
      <PaymentPage
        participantId={route.participantId}
        onBack={goHome}
        onPaymentSuccess={(pid) => navigate(buildPath('/thankyou', { pid }))}
      />
    );
  }

  // Thank you route
  if (route.name === 'thankyou' && route.participantId) {
    return (
      <ThankYou
        participantId={route.participantId}
        onGoToDashboard={(pid) => navigate(buildPath('/dashboard', { pid }))}
      />
    );
  }

  // Dashboard route
  if (route.name === 'dashboard' && route.participantId) {
    return <Dashboard participantId={route.participantId} onBack={goHome} />;
  }

  // Home / landing page
  const sections = config?.sections;
  return (
    <div className="min-h-screen bg-black">
      <Navbar onTakeShot={goRegister} />

      <Hero onTakeShot={goRegister} />

      {sections?.positioning !== false && <PositioningSection />}
      {sections?.become !== false && <BecomeSection />}
      {sections?.noFollowers !== false && <NoFollowersSection onTakeShot={goRegister} />}
      {sections?.realityShow !== false && <RealityShowSection />}
      <CountersSection />
      {sections?.winner !== false && <WinnerSection />}
      {sections?.prizes !== false && <PrizeSection />}
      {sections?.media !== false && <MediaSection />}
      {sections?.mystery !== false && <MysterySection />}
      {sections?.scarcity !== false && <ScarcitySection />}
      {sections?.trust !== false && <TrustSection />}
      {sections?.finalCta !== false && <FinalCtaSection onTakeShot={goRegister} />}

      <Footer />
      <ActivityTicker />

      {/* Sticky mobile CTA */}
      {showStickyCta && (
        <div className="sticky-cta md:hidden">
          <button
            onClick={goRegister}
            className="w-full py-4 bg-[#00ff88] text-black font-display font-bold text-sm tracking-widest uppercase rounded-sm pulse-glow"
          >
            Take Your Shot
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
