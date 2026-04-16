// --- src/pages/brand/CampaignList.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { List, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApi('/campaigns/my-campaigns')
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-[#7a7d85]">Memuat Daftar Campaign...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#404145]">Daftar Campaign</h2>
        <Button onClick={() => navigate('/dashboard/campaigns/create')} className="gap-2">
          <Plus size={18}/> Buat Campaign Baru
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-[#404145] flex items-center gap-2"><List size={18}/> Ringkasan Campaign Anda</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {campaigns.length === 0 ? (
            <div className="p-6 text-center text-[#7a7d85]">Belum ada campaign yang dibuat.</div>
          ) : (
            campaigns.map(c => (
              <div key={c.campaign_id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-[#404145] text-lg">{c.nama_campaign}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{c.status}</span>
                  </div>
                  <div className="flex space-x-4 text-sm text-[#7a7d85]">
                    <span>{c.platform}</span><span>•</span>
                    <span>Sisa Budget: Rp {c.budget_tersisa?.toLocaleString('id-ID')}</span><span>•</span>
                    <span>Limit Harian: Rp {c.daily_spend_limit?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {c.status === 'DRAFT' && <Button variant="primary" className="text-xs py-1.5 gap-1"><DollarSign size={14}/> Top Up</Button>}
                  <Button variant="outline" className="text-xs py-1.5">Kelola</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default CampaignList;