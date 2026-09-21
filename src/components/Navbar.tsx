import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavLink {
  label: string;
  target: string;
}

const links: NavLink[] = [
  { label: 'THE EXPERIENCE', target: 'experience' },
  { label: 'OPPORTUNITIES', target: 'opportunities' },
  { label: 'PRIZES', target: 'prizes' },
  { label: 'BEFORE YOU ENTER', target: 'trust' },
];

export function Navbar({ onTakeShot }: { onTakeShot: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-display font-black text-lg tracking-[0.2em] text-white"
          >
            THE<span className="text-[#00ff88]">SHOT</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollTo(link.target)}
                className="text-xs font-grotesk tracking-widest text-gray-400 hover:text-white transition-colors uppercase"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={onTakeShot}
              className="px-6 py-2.5 bg-[#00ff88] text-black font-bold text-xs tracking-widest uppercase rounded-sm hover:bg-white transition-colors duration-300"
            >
              Take Your Shot
            </button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-6">
          {links.map((link) => (
            <button
              key={link.target}
              onClick={() => scrollTo(link.target)}
              className="text-lg font-grotesk tracking-widest text-gray-400 hover:text-white transition-colors uppercase"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              onTakeShot();
            }}
            className="mt-4 px-8 py-3 bg-[#00ff88] text-black font-bold text-sm tracking-widest uppercase rounded-sm"
          >
            Take Your Shot
          </button>
        </div>
      )}
    </>
  );
}
