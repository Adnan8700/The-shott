import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Lock } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
  onLoggedIn: (participantId: string) => void;
}

export function Login({ onBack, onLoggedIn }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('participants')
        .select('participant_id, password_hash')
        .eq('username', username)
        .maybeSingle();

      if (dbError) throw dbError;
      if (!data) { setError('Invalid username or password.'); return; }
      if (data.password_hash !== btoa(password)) { setError('Invalid username or password.'); return; }

      onLoggedIn(data.participant_id);
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm font-grotesk"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00ff88]/10 mb-6">
            <Lock size={28} className="text-[#00ff88]" />
          </div>
          <h1 className="font-display font-black text-white text-3xl tracking-tight">
            MY <span className="text-[#00ff88]">SHOT</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 font-grotesk">Login to view your status</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white font-grotesk text-sm focus:border-[#00ff88]/50"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white font-grotesk text-sm focus:border-[#00ff88]/50"
            required
          />
          {error && <p className="text-sm text-red-400 font-grotesk">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00ff88] text-black font-display font-bold text-sm tracking-widest uppercase rounded-sm hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
