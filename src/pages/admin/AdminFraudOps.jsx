import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { ShieldAlert, AlertOctagon, Lock, FileX } from 'lucide-react';

const AdminFraudOps = () => {
  const [loading, setLoading] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [campaignId, setCampaignId] = useState('');

  const executeAction = async (endpoint, method = 'POST', successMsg) => {
    if(!window.confirm(`Peringatan: Aksi ini bersifat Force Action. Lanjutkan?`)) return;
    setLoading(true);
    try {
      await fetchApi(endpoint, { method });
      alert(successMsg);
    } catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-red-600 flex items-center gap-2">
        <ShieldAlert size={24}/> Fraud Operations (God Mode)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Control */}
        <Card className="border-red-200">
          <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2"><Lock size={18} className="text-red-500"/> Kontrol Dompet Creator</h3>
          <div className="space-y-3">
            <Input label="Wallet ID" value={walletId} onChange={e => setWalletId(e.target.value)} placeholder="Masukkan UUID Wallet" />
            <div className="flex gap-2">
              <Button onClick={() => executeAction(`/admin/wallets/${walletId}/hold`, 'POST', 'Saldo berhasil dibekukan!')} variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white" disabled={!walletId || loading}>
                Hold Saldo
              </Button>
              <Button onClick={() => executeAction(`/admin/wallets/${walletId}/release`, 'POST', 'Saldo berhasil dibebaskan!')} className="flex-1 bg-green-600" disabled={!walletId || loading}>
                Release Saldo
              </Button>
            </div>
            <p className="text-[10px] text-[#7a7d85] italic">Membekukan uang creator untuk investigasi jika ada indikasi fraud.</p>
          </div>
        </Card>

        {/* Submission Control */}
        <Card className="border-orange-200">
          <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2"><FileX size={18} className="text-orange-500"/> Invalidate Submission</h3>
          <div className="space-y-3">
            <Input label="Submission ID" value={submissionId} onChange={e => setSubmissionId(e.target.value)} placeholder="Masukkan UUID Submission" />
            <Button onClick={() => executeAction(`/admin/submissions/${submissionId}/invalidate`, 'PATCH', 'Submission ditolak paksa!')} variant="outline" className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white" disabled={!submissionId || loading}>
              Tolak Pekerjaan (Force Reject)
            </Button>
            <p className="text-[10px] text-[#7a7d85] italic">Membatalkan pekerjaan yang dianggap menggunakan bot views/spam.</p>
          </div>
        </Card>

        {/* Campaign Control */}
        <Card className="border-purple-200 md:col-span-2">
          <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2"><AlertOctagon size={18} className="text-purple-500"/> Force Cancel Campaign</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input label="Campaign ID" value={campaignId} onChange={e => setCampaignId(e.target.value)} placeholder="Masukkan UUID Campaign" />
            </div>
            <Button onClick={() => executeAction(`/admin/campaigns/${campaignId}/force-cancel`, 'POST', 'Campaign berhasil dihentikan paksa!')} className="bg-purple-600 mb-4 px-8" disabled={!campaignId || loading}>
              Hentikan Campaign
            </Button>
          </div>
          <p className="text-[10px] text-[#7a7d85] italic mt-[-10px]">Hentikan kampanye Brand yang melanggar ToS platform.</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminFraudOps;