import { CheckCircle, ArrowRight } from 'lucide-react';

interface ThankYouProps {
  onLogin: () => void;
  onHome: () => void;
}

// Ye page koi personal data nahi dikhata, isliye koi bhi link khole to kuch nahi milta.
// Referral ID aur status sirf login ke baad (aur sirf paid users ko) dikhte hain.
export function ThankYou({ onLogin, onHome }: ThankYouProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00ff88]/10 mb-6">
          <CheckCircle size={30} className="text-[#00ff88]" />
        </div>
        <h1 className="font-display font-black text-white text-3xl md:text-4xl tracking-tight">
          THANK <span className="text-[#00ff88]">YOU</span>
        </h1>
        <p className="mt-6 text-sm text-gray-400 font-grotesk leading-relaxed">
          Your payment is being confirmed. Login with your username and password to see your Referral ID and your status.
        </p>
        <p className="mt-3 text-xs text-gray-600 font-grotesk">
          If login says payment is pending, wait a minute and try again.
        </p>
        <button
          onClick={onLogin}
          className="mt-8 w-full py-3 bg-[#00ff88] text-black font-display font-bold text-sm tracking-widest uppercase rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-2"
        >
          Login <ArrowRight size={16} />
        </button>
        <button
          onClick={onHome}
          className="mt-4 text-sm text-gray-500 hover:text-white transition-colors font-grotesk"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
