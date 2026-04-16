import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { fetchApi } from '../../utils/api';
import { FileText, ExternalLink, Plus } from 'lucide-react';

const CreatorSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/submissions')
      .then(res => setSubmissions(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#404145]">Riwayat Pekerjaan</h2>
        <Button onClick={() => alert("Gunakan menu Eksplorasi untuk submit konten baru")} className="gap-2 text-xs py-2">
          <Plus size={16}/> Submit Konten
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex items-center gap-2">
          <FileText size={16}/> Daftar Submission
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center text-[#7a7d85]">Memuat data...</div>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-center text-[#7a7d85]">Anda belum pernah mengirimkan konten.</div>
          ) : (
            submissions.map(s => (
              <div key={s.submission_id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-[#404145]">{s.nama_campaign}</h4>
                  <a href={s.content_url} target="_blank" className="text-xs text-[#1dbf73] flex items-center gap-1 hover:underline">
                    Lihat Konten <ExternalLink size={12}/>
                  </a>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-[#7a7d85]">Views Valid</p>
                    <p className="font-bold text-sm">{s.views_tervalidasi || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#7a7d85]">Net Earning</p>
                    <p className="font-bold text-sm text-[#1dbf73]">Rp {s.net_earning?.toLocaleString('id-ID') || 0}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${s.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreatorSubmissions;