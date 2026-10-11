import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, LayoutDashboard, Users, Settings, Share2, Eye, Search, Download, Check, X, ChevronRight, TrendingUp, Activity, ChevronLeft } from 'lucide-react';
import type { Participant, Referral, InstagramSubmission, AdminConfig, Prize } from '@/lib/types';
import { DEFAULT_CONFIG } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type AdminTab = 'dashboard' | 'participants' | 'referrals' | 'instagram' | 'config' | 'socialproof';

const ADMIN_SESSION_KEY = 'shot-admin-auth';

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (stored === 'true') setAuthed(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, password_hash')
        .eq('email', loginEmail)
        .maybeSingle();

      if (error) throw error;
      if (!data) { setLoginError('Invalid credentials.'); return; }
      if (data.password_hash !== btoa(loginPass)) { setLoginError('Invalid credentials.'); return; }

      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setAuthed(true);
    } catch {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-5">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00ff88]/10 mb-6">
              <Lock size={28} className="text-[#00ff88]" />
            </div>
            <h1 className="font-display font-black text-white text-3xl tracking-tight">
              ADMIN <span className="text-[#00ff88]">ACCESS</span>
            </h1>
            <p className="mt-3 text-sm text-gray-500 font-grotesk">THE SHOT — Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Admin email" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white font-grotesk text-sm focus:border-[#00ff88]/50" required />
            <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white font-grotesk text-sm focus:border-[#00ff88]/50" required />
            {loginError && <p className="text-sm text-red-400 font-grotesk">{loginError}</p>}
            <button type="submit" disabled={loginLoading} className="w-full py-3 bg-[#00ff88] text-black font-display font-bold text-sm tracking-widest uppercase rounded-sm hover:bg-white transition-colors disabled:opacity-50">
              {loginLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'referrals', label: 'Referral Tree', icon: Share2 },
    { id: 'instagram', label: 'Instagram', icon: Eye },
    { id: 'socialproof', label: 'Social Proof', icon: TrendingUp },
    { id: 'config', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <span className="font-display font-black text-white text-sm tracking-[0.2em]">THE<span className="text-[#00ff88]">SHOT</span> <span className="text-gray-600 text-xs">ADMIN</span></span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-grotesk"><LogOut size={14} /> Logout</button>
        </div>
      </div>
      <div className="pt-16 max-w-7xl mx-auto px-5 py-6 flex flex-col md:flex-row gap-6">
        <div className="md:w-56 flex-shrink-0">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-grotesk transition-colors whitespace-nowrap ${tab === t.id ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <t.icon size={16} />{t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {tab === 'dashboard' && <AdminDashboard />}
          {tab === 'participants' && <AdminParticipants />}
          {tab === 'referrals' && <AdminReferrals />}
          {tab === 'instagram' && <AdminInstagram />}
          {tab === 'socialproof' && <AdminSocialProof />}
          {tab === 'config' && <AdminConfigEditor />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD STATS
// ============================================================
type PayRow = {
  participant_id: string;
  full_name: string;
  email: string;
  phone: string;
  payment_amount: string | null;
  payment_reference: string | null;
  updated_at: string;
  created_at: string;
};

const PAY_COLUMNS = 'participant_id, full_name, email, phone, payment_amount, payment_reference, updated_at, created_at';

function formatDateTime(v: string) {
  return new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [revenue, setRevenue] = useState(0);
  const [recentPaid, setRecentPaid] = useState<PayRow[]>([]);
  const [recentUnpaid, setRecentUnpaid] = useState<PayRow[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const [statsRes, paidRes, unpaidRes, revRes] = await Promise.all([
      supabase.rpc('get_admin_stats'),
      supabase.from('participants').select(PAY_COLUMNS).eq('payment_verified', true).order('updated_at', { ascending: false }).limit(10),
      supabase.from('participants').select(PAY_COLUMNS).eq('payment_verified', false).order('created_at', { ascending: false }).limit(10),
      supabase.from('participants').select('payment_amount').eq('payment_verified', true),
    ]);
    setStats(statsRes.data ?? {});
    setRecentPaid((paidRes.data as PayRow[]) || []);
    setRecentUnpaid((unpaidRes.data as PayRow[]) || []);
    const rows = (revRes.data as { payment_amount: string | null }[]) || [];
    setRevenue(rows.reduce((sum, r) => sum + (parseFloat(String(r.payment_amount ?? '').replace(/[^0-9.]/g, '')) || 0), 0));
    setLastUpdated(new Date());
  }, []);

  // Har 10 second mein data apne aap refresh hota hai
  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  if (!stats) return <div className="text-gray-500 font-grotesk text-sm">Loading...</div>;

  const cards: { label: string; value: number; suffix?: string; prefix?: string }[] = [
    { label: 'Total Registrations', value: stats.total_registrations ?? 0 },
    { label: 'Paid Registrations', value: stats.paid_registrations ?? 0 },
    { label: 'Unpaid (Pending Payments)', value: stats.pending_payments ?? 0 },
    { label: 'Revenue', value: revenue, prefix: '\u20B9' },
    { label: 'Failed Payments', value: stats.failed_payments ?? 0 },
    { label: "Today's Registrations", value: stats.daily_registrations ?? 0 },
    { label: "Today's Payments", value: stats.daily_payments ?? 0 },
    { label: 'Conversion Rate', value: stats.conversion_rate ?? 0, suffix: '%' },
    { label: 'Confirmed Participants', value: stats.confirmed_shots ?? 0 },
    { label: 'Pending Shots', value: stats.pending_shots ?? 0 },
    { label: 'Successful Referrals', value: stats.successful_referrals ?? 0 },
    { label: '0-Referral Participants', value: stats.zero_referral_participants ?? 0 },
    { label: '1-Referral Participants', value: stats.one_referral_participants ?? 0 },
    { label: '2+ Referral Participants', value: stats.two_plus_referral_participants ?? 0 },
    { label: 'Instagram Submissions', value: (stats.pending_instagram ?? 0) + (stats.approved_instagram ?? 0) + (stats.rejected_instagram ?? 0) },
    { label: 'Instagram Approved', value: stats.approved_instagram ?? 0 },
    { label: 'Instagram Pending', value: stats.pending_instagram ?? 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-white text-xl">Dashboard Metrics</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-grotesk">
          <span className="inline-block w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          Live{lastUpdated ? ` \u00B7 updated ${lastUpdated.toLocaleTimeString('en-IN')}` : ''}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-gray-500 font-grotesk uppercase tracking-wider mb-2">{c.label}</p>
            <p className="font-display font-bold text-white text-2xl">{c.prefix || ''}{c.value.toLocaleString('en-IN')}{c.suffix || ''}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <h3 className="font-display font-bold text-[#00ff88] text-sm tracking-wider uppercase mb-4">Recent Payments (Paid)</h3>
          {recentPaid.length === 0 ? (
            <p className="text-sm text-gray-600 font-grotesk">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-grotesk">
                <thead className="text-gray-500 uppercase tracking-wider">
                  <tr><th className="pb-2 pr-3">Name</th><th className="pb-2 pr-3">ID</th><th className="pb-2 pr-3">Amount</th><th className="pb-2 pr-3">Payment Ref</th><th className="pb-2">Time</th></tr>
                </thead>
                <tbody className="text-gray-300">
                  {recentPaid.map((p) => (
                    <tr key={p.participant_id} className="border-t border-white/5">
                      <td className="py-2 pr-3">{p.full_name}</td>
                      <td className="py-2 pr-3">{p.participant_id}</td>
                      <td className="py-2 pr-3">{p.payment_amount ? `\u20B9${p.payment_amount}` : '-'}</td>
                      <td className="py-2 pr-3">{p.payment_reference || '-'}</td>
                      <td className="py-2 whitespace-nowrap">{formatDateTime(p.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <h3 className="font-display font-bold text-yellow-400 text-sm tracking-wider uppercase mb-4">Registered, Not Paid Yet</h3>
          {recentUnpaid.length === 0 ? (
            <p className="text-sm text-gray-600 font-grotesk">Everyone has paid.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-grotesk">
                <thead className="text-gray-500 uppercase tracking-wider">
                  <tr><th className="pb-2 pr-3">Name</th><th className="pb-2 pr-3">ID</th><th className="pb-2 pr-3">Phone</th><th className="pb-2 pr-3">Email</th><th className="pb-2">Registered</th></tr>
                </thead>
                <tbody className="text-gray-300">
                  {recentUnpaid.map((p) => (
                    <tr key={p.participant_id} className="border-t border-white/5">
                      <td className="py-2 pr-3">{p.full_name}</td>
                      <td className="py-2 pr-3">{p.participant_id}</td>
                      <td className="py-2 pr-3">{p.phone}</td>
                      <td className="py-2 pr-3">{p.email}</td>
                      <td className="py-2 whitespace-nowrap">{formatDateTime(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PARTICIPANTS TABLE with search, filter, sort, pagination
// ============================================================
const PAGE_SIZE = 20;

function AdminParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Participant | null>(null);

  const load = useCallback(async (silent?: unknown) => {
    if (silent !== true) setLoading(true);
    let countQuery = supabase.from('participants').select('*', { count: 'exact', head: true });
    let dataQuery = supabase.from('participants').select('*');

    if (filter === 'paid') { countQuery = countQuery.eq('payment_verified', true); dataQuery = dataQuery.eq('payment_verified', true); }
    if (filter === 'unpaid') { countQuery = countQuery.eq('payment_verified', false); dataQuery = dataQuery.eq('payment_verified', false); }
    if (filter === 'confirmed') { countQuery = countQuery.eq('shot_status', 'confirmed'); dataQuery = dataQuery.eq('shot_status', 'confirmed'); }
    if (filter === 'pending') { countQuery = countQuery.eq('shot_status', 'pending'); dataQuery = dataQuery.eq('shot_status', 'pending'); }

    const { count } = await countQuery;
    setTotal(count ?? 0);

    dataQuery = dataQuery.order(sortBy, { ascending: sortDir === 'asc' }).range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    const { data } = await dataQuery;
    setParticipants(data as Participant[] || []);
    setLoading(false);
  }, [filter, sortBy, sortDir, page]);

  useEffect(() => { load(); }, [load]);
  // Har 10 second mein list apne aap refresh (bina screen hilaye)
  useEffect(() => {
    const t = setInterval(() => load(true), 10000);
    return () => clearInterval(t);
  }, [load]);

  const filtered = participants.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.full_name?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s) || p.phone?.includes(s) || p.participant_id?.toLowerCase().includes(s) || p.referral_id?.toLowerCase().includes(s) || p.city?.toLowerCase().includes(s) || p.instagram_username?.toLowerCase().includes(s);
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportCSV = () => {
    const headers = ['Participant ID', 'Name', 'Phone', 'Email', 'Age', 'Gender', 'City', 'Instagram', 'Referral ID', 'Referred By', 'Referral Count', 'Payment Status', 'Instagram Status', 'Participation Status', 'Registration Date'];
    const rows = filtered.map((p) => [p.participant_id, p.full_name, p.phone, p.email, p.age || '', p.gender || '', p.city || '', p.instagram_username || '', p.referral_id, p.referred_by_referral_id || '', p.valid_referral_count, p.payment_status, p.instagram_status, p.shot_status, formatDate(p.registration_date)]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'participants.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const updateStatus = async (id: string, field: string, value: string) => {
    await supabase.from('participants').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', id);
    load();
    if (selected?.id === id) setSelected({ ...selected, [field]: value });
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }
    else { setSortBy(col); setSortDir('desc'); }
    setPage(0);
  };

  const thClass = "py-3 px-2 cursor-pointer hover:text-white select-none";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-display font-bold text-white text-xl">Participants</h2>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-sm font-grotesk hover:bg-[#00ff88]/20 transition-colors"><Download size={14} /> Export CSV</button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone, ID, city, Instagram..." className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white font-grotesk text-sm focus:border-[#00ff88]/50" />
        </div>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }} className="bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white font-grotesk text-sm focus:border-[#00ff88]/50">
          <option value="all">All</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option>
        </select>
      </div>

      {loading ? <div className="text-gray-500 font-grotesk text-sm">Loading...</div> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 font-grotesk uppercase tracking-wider border-b border-white/10">
                  <th className={thClass} onClick={() => toggleSort('participant_id')}>Part ID {sortBy === 'participant_id' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                  <th className={thClass} onClick={() => toggleSort('full_name')}>Name {sortBy === 'full_name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                  <th className="py-3 px-2">Phone</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Age</th>
                  <th className="py-3 px-2">Gender</th>
                  <th className="py-3 px-2">City</th>
                  <th className="py-3 px-2">Instagram</th>
                  <th className="py-3 px-2">Ref ID</th>
                  <th className="py-3 px-2">Referred By</th>
                  <th className="py-3 px-2">Refs</th>
                  <th className="py-3 px-2">Payment</th>
                  <th className="py-3 px-2">IG</th>
                  <th className="py-3 px-2">Status</th>
                  <th className={thClass} onClick={() => toggleSort('created_at')}>Date {sortBy === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2 text-gray-400 font-grotesk text-xs">{p.participant_id}</td>
                    <td className="py-3 px-2 text-white font-grotesk">{p.full_name}</td>
                    <td className="py-3 px-2 text-gray-400 font-grotesk text-xs">{p.phone}</td>
                    <td className="py-3 px-2 text-gray-400 font-grotesk text-xs">{p.email}</td>
                    <td className="py-3 px-2 text-gray-400 font-grotesk">{p.age || '-'}</td>
                    <td className="py-3 px-2 text-gray-400 font-grotesk text-xs">{p.gender || '-'}</td>
                    <td className="py-3 px-2 text-gray-400 font-grotesk">{p.city || '-'}</td>
                    <td className="py-3 px-2 text-gray-400 font-grotesk text-xs">{p.instagram_username || '-'}</td>
                    <td className="py-3 px-2 text-[#00ff88] font-grotesk text-xs">{p.referral_id}</td>
                    <td className="py-3 px-2 text-gray-400 font-grotesk text-xs">{p.referred_by_referral_id || 'Direct'}</td>
                    <td className="py-3 px-2 text-gray-400 font-grotesk">{p.valid_referral_count}</td>
                    <td className="py-3 px-2"><span className={`text-xs font-grotesk ${p.payment_verified ? 'text-[#00ff88]' : 'text-yellow-500'}`}>{p.payment_verified ? 'Paid' : 'Pending'}</span></td>
                    <td className="py-3 px-2"><span className={`text-xs font-grotesk ${p.instagram_status === 'approved' ? 'text-[#00ff88]' : p.instagram_status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{p.instagram_status}</span></td>
                    <td className="py-3 px-2"><span className={`text-xs font-grotesk ${p.shot_status === 'confirmed' ? 'text-[#00ff88]' : p.shot_status === 'unlocked' ? 'text-[#00ff88]' : 'text-yellow-500'}`}>{p.shot_status}</span></td>
                    <td className="py-3 px-2 text-gray-500 font-grotesk text-xs">{formatDate(p.registration_date)}</td>
                    <td className="py-3 px-2"><button onClick={() => setSelected(p)} className="text-gray-500 hover:text-[#00ff88] transition-colors"><ChevronRight size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-600 font-grotesk text-sm py-8">No participants found.</p>}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-600 font-grotesk">Page {page + 1} of {totalPages} ({total} total)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1.5 border border-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30 flex items-center gap-1 text-xs"><ChevronLeft size={14} /> Prev</button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 border border-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30 flex items-center gap-1 text-xs">Next <ChevronRight size={14} /></button>
            </div>
          </div>
        </>
      )}

      {selected && <ParticipantDetail participant={selected} onClose={() => setSelected(null)} onUpdate={updateStatus} />}
    </div>
  );
}

function ParticipantDetail({ participant, onClose, onUpdate }: { participant: Participant; onClose: () => void; onUpdate: (id: string, field: string, value: string) => void; }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-white text-lg">{participant.full_name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-3 text-sm font-grotesk">
          {[['Email', participant.email],['Phone', participant.phone],['Age', String(participant.age || '-')],['Gender', participant.gender || '-'],['City', participant.city || '-'],['Address', participant.address || '-'],['Instagram', participant.instagram_username || '-'],['Participant ID', participant.participant_id],['Referral ID', participant.referral_id],['Referred By', participant.referred_by_referral_id || 'Direct'],['Registration Date', formatDate(participant.registration_date)],['Payment Reference', participant.payment_reference || '-']].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4"><span className="text-gray-500">{label}</span><span className="text-white text-right">{value}</span></div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Shot Status</label>
            <select value={participant.shot_status} onChange={(e) => onUpdate(participant.id, 'shot_status', e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white font-grotesk text-sm"><option value="pending">Pending</option><option value="unlocked">Unlocked</option><option value="confirmed">Confirmed</option></select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Instagram Status</label>
            <select value={participant.instagram_status} onChange={(e) => onUpdate(participant.id, 'instagram_status', e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white font-grotesk text-sm"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REFERRAL TREE
// ============================================================
function AdminReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: refData }, { data: partData }] = await Promise.all([
        supabase.from('referrals').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('participants').select('*').limit(500),
      ]);
      setReferrals(refData as Referral[] || []);
      setParticipants(partData as Participant[] || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-gray-500 font-grotesk text-sm">Loading...</div>;

  const partMap = new Map(participants.map((p) => [p.referral_id, p]));
  const childMap = new Map(participants.map((p) => [p.id, p]));

  return (
    <div>
      <h2 className="font-display font-bold text-white text-xl mb-6">Referral Tree</h2>
      <div className="space-y-3">
        {referrals.map((r) => {
          const parent = partMap.get(r.parent_referral_id);
          const child = r.child_participant_id ? childMap.get(r.child_participant_id) : null;
          return (
            <div key={r.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00ff88]/10 flex items-center justify-center"><Share2 size={16} className="text-[#00ff88]" /></div>
                  <div>
                    <p className="text-white font-grotesk text-sm">{parent?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-[#00ff88] font-grotesk">{r.parent_referral_id}</p>
                  </div>
                </div>
              </div>
              <div className="text-gray-600">→</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Users size={16} className="text-gray-400" /></div>
                  <div>
                    <p className="text-white font-grotesk text-sm">{child?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 font-grotesk">{r.child_referral_id}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span className={`font-grotesk ${r.is_valid ? 'text-[#00ff88]' : 'text-gray-600'}`}>{r.is_valid ? 'Valid' : 'Invalid'}</span>
                <span className={`font-grotesk ${r.payment_verified ? 'text-[#00ff88]' : 'text-yellow-500'}`}>{r.payment_verified ? 'Paid' : 'Unpaid'}</span>
                {r.is_self_referral && <span className="text-red-500 font-grotesk">Self-ref</span>}
                {r.is_duplicate && <span className="text-yellow-500 font-grotesk">Duplicate</span>}
              </div>
              <div className="text-xs text-gray-600 font-grotesk hidden md:block">{formatDate(r.created_at)}</div>
            </div>
          );
        })}
      </div>
      {referrals.length === 0 && <p className="text-center text-gray-600 font-grotesk text-sm py-8">No referrals yet.</p>}
    </div>
  );
}

// ============================================================
// INSTAGRAM APPROVALS
// ============================================================
function AdminInstagram() {
  const [submissions, setSubmissions] = useState<InstagramSubmission[]>([]);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: subs } = await supabase.from('instagram_submissions').select('*').order('submitted_at', { ascending: false }).limit(200);
    const { data: parts } = await supabase.from('participants').select('*').limit(500);
    setSubmissions(subs as InstagramSubmission[] || []);
    setParticipants(new Map((parts as Participant[] || []).map((p) => [p.id, p])));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => { await supabase.rpc('approve_instagram_submission', { p_submission_id: id }); load(); };
  const reject = async (id: string) => { await supabase.rpc('reject_instagram_submission', { p_submission_id: id, p_notes: 'Rejected by admin' }); load(); };

  if (loading) return <div className="text-gray-500 font-grotesk text-sm">Loading...</div>;

  return (
    <div>
      <h2 className="font-display font-bold text-white text-xl mb-6">Instagram Submissions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {submissions.map((s) => {
          const p = participants.get(s.participant_id);
          return (
            <div key={s.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div><p className="text-white font-grotesk text-sm">{p?.full_name || 'Unknown'}</p><p className="text-xs text-gray-600 font-grotesk">{p?.participant_id}</p></div>
                <span className={`text-xs font-grotesk px-2 py-1 rounded ${s.status === 'approved' ? 'bg-[#00ff88]/10 text-[#00ff88]' : s.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{s.status}</span>
              </div>
              <div className="space-y-1 text-xs text-gray-400 font-grotesk mb-4">
                <p>Username: {s.instagram_username || '-'}</p>
                <p>URL: <a href={s.post_url || '#'} target="_blank" rel="noopener noreferrer" className="text-[#00ff88] hover:underline">{s.post_url}</a></p>
                <p>Submitted: {formatDate(s.submitted_at)}</p>
              </div>
              {s.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => approve(s.id)} className="flex-1 py-2 bg-[#00ff88] text-black font-bold text-xs rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-1"><Check size={14} /> Approve</button>
                  <button onClick={() => reject(s.id)} className="flex-1 py-2 border border-red-500/30 text-red-500 font-bold text-xs rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"><X size={14} /> Reject</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {submissions.length === 0 && <p className="text-center text-gray-600 font-grotesk text-sm py-8">No submissions yet.</p>}
    </div>
  );
}

// ============================================================
// SOCIAL PROOF CONTROLS
// ============================================================
function AdminSocialProof() {
  const [config, setConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCity, setNewCity] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('admin_config').select('key, value');
      if (!data) return;
      const cfg = { ...DEFAULT_CONFIG } as unknown as Record<string, unknown>;
      for (const row of data) { cfg[row.key] = row.value; }
      setConfig(cfg as unknown as AdminConfig);
    })();
  }, []);

  const [dirty, setDirty] = useState<Record<string, unknown>>({});

  // Ab ye sirf screen par badlav karta hai, database mein nahi.
  const saveConfig = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  // Database mein tabhi save hoga jab "Save Changes" button dabega.
  const saveAllChanges = async () => {
    const entries = Object.entries(dirty);
    if (entries.length === 0) return;
    setSaving(true); setSaved(false);
    const { error } = await supabase.from('admin_config').upsert(
      entries.map(([key, value]) => ({
        key,
        value: JSON.parse(JSON.stringify(value)),
        updated_at: new Date().toISOString(),
      }))
    );
    setSaving(false);
    if (error) { alert('Save failed: ' + error.message); return; }
    setDirty({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = 'w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white font-grotesk text-sm focus:border-[#00ff88]/50';

  const addCity = () => {
    if (!newCity.trim()) return;
    const cities = [...config.activity_cities, newCity.trim()];
    saveConfig('activity_cities', cities);
    setNewCity('');
  };

  const removeCity = (city: string) => {
    saveConfig('activity_cities', config.activity_cities.filter((c) => c !== city));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-black py-3">
        <h2 className="font-display font-bold text-white text-xl">Social Proof</h2>
        <div className="flex items-center gap-3">
          {Object.keys(dirty).length > 0 && <span className="text-xs text-yellow-400 font-grotesk">Unsaved changes</span>}
          {saved && <span className="text-xs text-[#00ff88] font-grotesk flex items-center gap-1"><Check size={14} /> Saved!</span>}
          <button type="button" onClick={saveAllChanges} disabled={saving || Object.keys(dirty).length === 0} className="px-6 py-2.5 bg-[#00ff88] text-black font-bold text-sm rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>

      {/* Counter Mode */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <h3 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Counter Mode</h3>
        <div className="flex gap-3 mb-6">
          <button onClick={() => saveConfig('social_proof_mode', 'campaign')} className={`flex-1 py-3 rounded-lg text-sm font-grotesk transition-colors ${config.social_proof_mode === 'campaign' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : 'bg-white/[0.03] text-gray-500 border border-white/10'}`}>Campaign / Demo</button>
          <button onClick={() => saveConfig('social_proof_mode', 'real')} className={`flex-1 py-3 rounded-lg text-sm font-grotesk transition-colors ${config.social_proof_mode === 'real' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : 'bg-white/[0.03] text-gray-500 border border-white/10'}`}>Real Registrations</button>
        </div>

        {config.social_proof_mode === 'campaign' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Campaign Number</label>
              <input type="number" value={config.social_proof_number} onChange={(e) => saveConfig('social_proof_number', parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Campaign Label</label>
              <input type="text" value={config.social_proof_label} onChange={(e) => saveConfig('social_proof_label', e.target.value)} className={inputClass} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 font-grotesk">Real mode is active. The landing page will display the actual verified registration count from the database.</p>
        )}
      </div>

      {/* Activity Mode */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <h3 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Activity Mode</h3>
        <div className="flex gap-3 mb-6">
          <button onClick={() => saveConfig('activity_mode', 'campaign')} className={`flex-1 py-3 rounded-lg text-sm font-grotesk transition-colors ${config.activity_mode === 'campaign' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : 'bg-white/[0.03] text-gray-500 border border-white/10'}`}>Campaign Activity</button>
          <button onClick={() => saveConfig('activity_mode', 'real')} className={`flex-1 py-3 rounded-lg text-sm font-grotesk transition-colors ${config.activity_mode === 'real' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : 'bg-white/[0.03] text-gray-500 border border-white/10'}`}>Real Activity</button>
        </div>

        {config.activity_mode === 'campaign' ? (
          <>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Activity Frequency (seconds between notifications)</label>
              <input type="number" value={config.activity_frequency} onChange={(e) => saveConfig('activity_frequency', parseInt(e.target.value) || 5)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-grotesk uppercase tracking-wider">Campaign Cities</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {config.activity_cities.map((city) => (
                  <span key={city} className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-grotesk">
                    {city}
                    <button onClick={() => removeCity(city)} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }} placeholder="Add city..." className={inputClass} />
                <button onClick={addCity} className="px-4 py-2.5 bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 rounded-lg text-sm font-grotesk hover:bg-[#00ff88]/20">Add</button>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Activity Messages (one per line)</label>
              <textarea value={config.activity_messages.join('\n')} onChange={(e) => saveConfig('activity_messages', e.target.value.split('\n').filter((m) => m.trim()))} className={`${inputClass} min-h-[80px]`} />
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 font-grotesk">Real mode is active. Activity notifications will use actual recent participant registrations from the database. Only city information is shown — no personal data is exposed.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CONFIG EDITOR
// ============================================================
function AdminConfigEditor() {
  const [config, setConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paymentHtmlLocal, setPaymentHtmlLocal] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('admin_config').select('key, value');
      if (!data) return;
      const cfg = { ...DEFAULT_CONFIG } as unknown as Record<string, unknown>;
      for (const row of data) { cfg[row.key] = row.value; }
      setConfig(cfg as unknown as AdminConfig);
      setPaymentHtmlLocal((cfg.payment_html as string) || '');
    })();
  }, []);

  const [dirty, setDirty] = useState<Record<string, unknown>>({});

  // Ab ye sirf screen par badlav karta hai, database mein nahi.
  const saveConfig = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  // Database mein tabhi save hoga jab "Save Changes" button dabega.
  const saveAllChanges = async () => {
    const entries = Object.entries(dirty);
    if (entries.length === 0) return;
    setSaving(true); setSaved(false);
    const { error } = await supabase.from('admin_config').upsert(
      entries.map(([key, value]) => ({
        key,
        value: JSON.parse(JSON.stringify(value)),
        updated_at: new Date().toISOString(),
      }))
    );
    setSaving(false);
    if (error) { alert('Save failed: ' + error.message); return; }
    setDirty({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const savePaymentHtml = () => {
    saveConfig('payment_html', paymentHtmlLocal);
  };

  const inputClass = 'w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white font-grotesk text-sm focus:border-[#00ff88]/50';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-black py-3">
        <h2 className="font-display font-bold text-white text-xl">Configuration</h2>
        <div className="flex items-center gap-3">
          {Object.keys(dirty).length > 0 && <span className="text-xs text-yellow-400 font-grotesk">Unsaved changes</span>}
          {saved && <span className="text-xs text-[#00ff88] font-grotesk flex items-center gap-1"><Check size={14} /> Saved!</span>}
          <button type="button" onClick={saveAllChanges} disabled={saving || Object.keys(dirty).length === 0} className="px-6 py-2.5 bg-[#00ff88] text-black font-bold text-sm rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>

      {/* Dates & Settings */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <h3 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Dates & Registration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField label="Show Start Date" value={config.show_start_date} onCommit={(v) => saveConfig('show_start_date', v)} />
          <DateField label="Registration Deadline" value={config.registration_deadline} onCommit={(v) => saveConfig('registration_deadline', v)} />
          <div><label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Registration Window (days)</label><input type="number" value={config.registration_window_days} onChange={(e) => saveConfig('registration_window_days', parseInt(e.target.value) || 0)} className={inputClass} /></div>
          <div><label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Referral Requirement</label><input type="number" value={config.referral_requirement} onChange={(e) => saveConfig('referral_requirement', parseInt(e.target.value) || 2)} className={inputClass} /></div>
          <div><label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Registration Fee</label><input type="text" value={config.registration_fee} onChange={(e) => saveConfig('registration_fee', e.target.value)} className={inputClass} /></div>
          <div><label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Grace Period (days)</label><input type="number" value={config.grace_period_days} onChange={(e) => saveConfig('grace_period_days', parseInt(e.target.value) || 0)} className={inputClass} /></div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={config.registration_open} onChange={(e) => saveConfig('registration_open', e.target.checked)} className="w-4 h-4 accent-[#00ff88]" /><span className="text-sm text-gray-300 font-grotesk">Registration Open</span></label>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={config.prizes_enabled} onChange={(e) => saveConfig('prizes_enabled', e.target.checked)} className="w-4 h-4 accent-[#00ff88]" /><span className="text-sm text-gray-300 font-grotesk">Prizes Section Enabled</span></label>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <h3 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Payment Integration</h3>
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input type="checkbox" checked={config.payment_enabled} onChange={(e) => saveConfig('payment_enabled', e.target.checked)} className="w-4 h-4 accent-[#00ff88]" />
          <span className="text-sm text-gray-300 font-grotesk">Payment Enabled</span>
        </label>
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Payment Button / Embed HTML</label>
          <textarea
            value={config.payment_html}
            onChange={(e) => saveConfig('payment_html', e.target.value)}
            className={`${inputClass} min-h-[120px] font-mono text-xs`}
            placeholder="Paste your payment gateway's HTML/embed/button code here..."
          />
          <p className="mt-2 text-xs text-gray-600 font-grotesk">Ye code payment page par dikhega. Upar "Save Changes" dabane par hi save hoga.</p>
        </div>
      </div>

      {/* Prizes */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <h3 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Prize Configuration</h3>
        <div className="space-y-3">
          {config.prizes.map((prize, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div><label className="block text-xs text-gray-500 mb-1 font-grotesk">Label</label><input type="text" value={prize.label} onChange={(e) => { const np = [...config.prizes]; np[i] = { ...prize, label: e.target.value }; saveConfig('prizes', np); }} className={inputClass} /></div>
              <div><label className="block text-xs text-gray-500 mb-1 font-grotesk">Amount</label><input type="text" value={prize.amount} onChange={(e) => { const np = [...config.prizes]; np[i] = { ...prize, amount: e.target.value }; saveConfig('prizes', np); }} className={inputClass} /></div>
              <div><label className="block text-xs text-gray-500 mb-1 font-grotesk">Count</label><input type="number" value={prize.count} onChange={(e) => { const np = [...config.prizes]; np[i] = { ...prize, count: parseInt(e.target.value) || 1 }; saveConfig('prizes', np); }} className={inputClass} /></div>
              <div><label className="block text-xs text-gray-500 mb-1 font-grotesk">Rank</label><input type="number" value={prize.rank} onChange={(e) => { const np = [...config.prizes]; np[i] = { ...prize, rank: parseInt(e.target.value) || 1 }; saveConfig('prizes', np); }} className={inputClass} /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={prize.confirmed} onChange={(e) => { const np = [...config.prizes]; np[i] = { ...prize, confirmed: e.target.checked }; saveConfig('prizes', np); }} className="w-4 h-4 accent-[#00ff88]" /><span className="text-xs text-gray-400 font-grotesk">Confirmed</span></label>
            </div>
          ))}
        </div>
      </div>

      {/* Social & Text */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <h3 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Social & Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Instagram Handle</label><input type="text" value={config.social_instagram} onChange={(e) => saveConfig('social_instagram', e.target.value)} className={inputClass} /></div>
          <div><label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">YouTube URL</label><input type="text" value={config.social_youtube} onChange={(e) => saveConfig('social_youtube', e.target.value)} className={inputClass} /></div>
          <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Eligibility Text</label><textarea value={config.eligibility_text} onChange={(e) => saveConfig('eligibility_text', e.target.value)} className={`${inputClass} min-h-[80px]`} /></div>
          <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">Refund Policy</label><textarea value={config.refund_policy} onChange={(e) => saveConfig('refund_policy', e.target.value)} className={`${inputClass} min-h-[80px]`} /></div>
        </div>
      </div>

      {/* Section toggles */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
        <h3 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4">Section Visibility</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(config.sections).map(([key, val]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={val} onChange={(e) => saveConfig('sections', { ...config.sections, [key]: e.target.checked })} className="w-4 h-4 accent-[#00ff88]" /><span className="text-sm text-gray-300 font-grotesk capitalize">{key}</span></label>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateField({ label, value, onCommit }: { label: string; value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value || '');
  useEffect(() => { setDraft(value || ''); }, [value]);
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1 font-grotesk uppercase tracking-wider">{label}</label>
      <input
        type="date"
        value={draft}
        onChange={(e) => { setDraft(e.target.value); if (e.target.value) onCommit(e.target.value); }}
        onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* ignore */ } }}
        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white font-grotesk text-sm focus:border-[#00ff88]/50"
      />
    </div>
  );
}
