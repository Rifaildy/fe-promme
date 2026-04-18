// --- src/pages/finance/FinanceReports.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { BarChart, FileText } from 'lucide-react';

const FinanceReports = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/finance/tax-calculator')
      .then(res => setTaxes(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Pajak & Laporan</h2>
      
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex items-center gap-2">
          <FileText size={16}/> Kalkulator Potongan Pajak (PPh) Creator
        </div>
        <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-[#7a7d85] text-xs uppercase border-b">
                    {/* Ubah header dari ID Creator menjadi Nama Creator */}
                    <th className="p-4">Nama Creator</th>
                    <th className="p-4">Status NPWP</th>
                    <th className="p-4 text-right">Rate Potongan Pajak</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                    <tr><td colSpan="3" className="p-6 text-center text-[#7a7d85]">Memuat profil pajak...</td></tr>
                    ) : taxes.length === 0 ? (
                    <tr><td colSpan="3" className="p-6 text-center text-[#7a7d85]">Belum ada data kreator.</td></tr>
                    ) : (
                    taxes.map((t, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                        {/* Ubah pemanggilan dari t.creator_id menjadi t.nama_creator */}
                        <td className="p-4 font-bold text-[#404145]">
                            {t.nama_creator || 'Tanpa Nama'}
                            <div className="text-[10px] text-gray-400 font-mono font-normal">{t.creator_id}</div>
                        </td>
                        <td className="p-4">
                            {t.has_npwp ? 
                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-700">TERDAFTAR</span> : 
                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-100 text-red-700">TIDAK ADA</span>
                            }
                        </td>
                        <td className="p-4 text-right font-bold text-[#404145]">
                            {(t.estimated_tax_rate * 100).toFixed(1)}%
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default FinanceReports;