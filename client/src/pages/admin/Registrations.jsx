import { useEffect, useState, useCallback } from 'react';
import axios, { errorMessage } from '../../utils/axios';
import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import { refreshBadge } from '../../utils/badge';

const GROUP_LABELS = {
  'men': 'Men', 'women': 'Women', 'youths': 'Youths',
  'men-excos': 'Men Excos', 'women-excos': 'Women Excos', 'youth-excos': 'Youth Excos',
  'workers': 'Workers', 'ffcc': 'FFCC', 'church-committee': 'Church Committee', 'choir': 'Choir',
};

const TABS = [
  { id: 'pending',  label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const QUICK_REASONS = [
  'We could not confirm you are a member of this church.',
  'Please visit the church office to complete your registration.',
  'Duplicate request.',
];

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const age = (dob) => {
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return null;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a -= 1;
  return a;
};

const Registrations = () => {
  const [tab, setTab]         = useState('pending');
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [toast, setToast]     = useState(null);
  const [working, setWorking] = useState(null);   // id being processed
  const [rejecting, setRejecting] = useState(null); // registration being rejected
  const [reason, setReason]   = useState('');

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/registrations?status=${tab}`);
      setItems(res.data);
    } catch (err) {
      setError(errorMessage(err, 'Could not load registrations.'));
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const approve = async (reg) => {
    setWorking(reg._id);
    try {
      const res = await axios.post(`/registrations/${reg._id}/approve`);
      setItems((prev) => prev.filter((r) => r._id !== reg._id));
      showToast('ok', `${res.data.message} An SMS has been sent.`);
      refreshBadge();
    } catch (err) {
      showToast('error', errorMessage(err, 'Could not approve.'));
      if (err.response?.status === 409) { load(); refreshBadge(); }
    } finally {
      setWorking(null);
    }
  };

  const confirmReject = async () => {
    const reg = rejecting;
    setWorking(reg._id);
    try {
      await axios.post(`/registrations/${reg._id}/reject`, { reason: reason.trim() });
      setItems((prev) => prev.filter((r) => r._id !== reg._id));
      showToast('ok', `${reg.name}'s request was rejected. An SMS has been sent.`);
      setRejecting(null);
      setReason('');
      refreshBadge();
    } catch (err) {
      showToast('error', errorMessage(err, 'Could not reject.'));
    } finally {
      setWorking(null);
    }
  };

  const remove = async (reg) => {
    if (!window.confirm(`Delete ${reg.name}'s request from the list?`)) return;
    setWorking(reg._id);
    try {
      await axios.delete(`/registrations/${reg._id}`);
      setItems((prev) => prev.filter((r) => r._id !== reg._id));
    } catch (err) {
      showToast('error', errorMessage(err, 'Could not delete.'));
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF5]">
      <Navbar />
      <PageHeader title="Registrations" icon="📝" back="/admin-dashboard"
        subtitle="Approve or reject people who want to join the member portal" />

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-white border border-amber-100 rounded-2xl p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === t.id ? 'bg-amber-500 text-white shadow' : 'text-amber-800 hover:bg-amber-50'
              }`}>
              {t.label}
              {t.id === tab && !loading && ` (${items.length})`}
            </button>
          ))}
        </div>

        {toast && (
          <div className={`mb-4 rounded-xl p-3 text-sm font-medium text-center border ${
            toast.type === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {toast.text}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
            {error} <button onClick={load} className="underline font-semibold ml-1">Retry</button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-36 rounded-2xl bg-amber-50 animate-pulse" />)}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-5xl mb-3">{tab === 'pending' ? '🎉' : '📭'}</p>
            <p>{tab === 'pending' ? 'No one is waiting. All caught up!' : `No ${tab} requests.`}</p>
          </div>
        )}

        {!loading && items.map((reg) => (
          <article key={reg._id} className={`bg-white rounded-2xl border border-amber-100 shadow-sm p-5 mb-3 ${working === reg._id ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg text-gray-900">{reg.name}</h3>
                <a href={`tel:${reg.phone}`} className="text-amber-700 font-medium">{reg.phone}</a>
                <p className="text-sm text-gray-700 mt-1">
                  Born {reg.dateOfBirth}{age(reg.dateOfBirth) !== null && ` (${age(reg.dateOfBirth)} yrs)`}
                </p>
              </div>
              <span className="text-sm text-gray-600 text-right shrink-0">{formatDate(reg.createdAt)}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {(reg.categories || []).map((c) => (
                <span key={c} className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
                  {GROUP_LABELS[c] || c}
                </span>
              ))}
            </div>

            {reg.status !== 'pending' && (
              <p className="mt-3 text-sm text-gray-600">
                {reg.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                {reg.reviewedBy && ` by ${reg.reviewedBy}`}
                {reg.reviewedAt && ` · ${formatDate(reg.reviewedAt)}`}
                {reg.reason && <span className="block text-gray-700 italic mt-0.5">Reason: {reg.reason}</span>}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              {reg.status === 'pending' && (
                <>
                  <button onClick={() => approve(reg)} disabled={working === reg._id}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors active:scale-95 disabled:opacity-50">
                    {working === reg._id ? 'Working…' : 'Approve'}
                  </button>
                  <button onClick={() => { setRejecting(reg); setReason(''); }} disabled={working === reg._id}
                    className="flex-1 py-2.5 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition-colors active:scale-95 disabled:opacity-50">
                    Reject
                  </button>
                </>
              )}
              {reg.status !== 'pending' && (
                <button onClick={() => remove(reg)} disabled={working === reg._id}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium">
                  Delete from list
                </button>
              )}
            </div>
          </article>
        ))}
      </main>

      {/* Reject dialog */}
      {rejecting && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => working !== rejecting._id && setRejecting(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900">Reject {rejecting.name}?</h2>
            <p className="text-sm text-gray-700 mt-1">They will get an SMS with the reason below.</p>

            <div className="flex flex-col gap-2 mt-4">
              {QUICK_REASONS.map((r) => (
                <button key={r} onClick={() => setReason(r)}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    reason === r ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}>
                  {r}
                </button>
              ))}
            </div>

            <textarea rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Or write your own reason (optional)"
              className="gc-input mt-3 resize-none text-sm" />

            <div className="flex gap-2 mt-4">
              <button onClick={() => setRejecting(null)} disabled={working === rejecting._id}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm">
                Cancel
              </button>
              <button onClick={confirmReject} disabled={working === rejecting._id}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm disabled:opacity-50">
                {working === rejecting._id ? 'Rejecting…' : 'Reject & send SMS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registrations;
