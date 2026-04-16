// --- src/pages/finance/FinanceDashboard.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';

const FinanceDashboard = () => {
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    fetchApi('/finance/withdrawals/pending')
      .then(res => setWithdrawals(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#404145]">Finance Ops - Pencairan Dana</h2>
      <Card>
        <p className="mb-4 font-bold text-orange-600">Antrian Pencairan Besar ({withdrawals?.length || 0})</p>
        {withdrawals?.length === 0 ? (
          <p className="text-[#7a7d85] text-sm">Tidak ada antrian pencairan saat ini.</p>
        ) : (
          <div className="space-y-2">
            {withdrawals.map(w => (
              <div key={w.withdrawal_id} className="p-3 border rounded-md">
                <p>Withdrawal ID: {w.withdrawal_id}</p>
                <p className="font-bold">Amount: Rp {w.amount?.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FinanceDashboard;