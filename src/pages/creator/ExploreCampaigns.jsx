import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Search, MapPin, DollarSign } from 'lucide-react';

const ExploreCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/campaigns/explore')
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#404145]">Eksplorasi Campaign</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input type="text" placeholder="Cari campaign..." className="w-full pl-10 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-[#7a7d85]">Mencari campaign aktif...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-[#7a7d85]">Belum ada campaign yang tersedia untuk saat ini.</p>
        ) : (
          campaigns.map(c => (
            <Card key={c.campaign_id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex-1">
                <span className="text-xs font-bold text-[#1dbf73] uppercase">{c.platform}</span>
                <h4 className="font-bold text-[#404145] text-lg mt-1">{c.nama_campaign}</h4>
                <div className="flex items-center gap-1 text-[#7a7d85] text-xs mt-2">
                  <DollarSign size={14}/> Komisi: Rp {c.komisi_per_view?.toLocaleString('id-ID')} / View
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-[#7a7d85]">Min. Durasi</p>
                  <p className="font-bold text-sm text-[#404145]">{c.min_watch_duration} Detik</p>
                </div>
                <Button className="text-xs py-1.5">Ambil Campaign</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExploreCampaigns;