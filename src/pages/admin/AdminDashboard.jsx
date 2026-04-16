// --- src/pages/admin/AdminDashboard.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchApi('/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#404145]">Admin Panel - Pengguna</h2>
      <Card>
        <p className="mb-4 font-bold">Total Pengguna Terdaftar: {users.length}</p>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="p-3 border rounded-md flex justify-between">
              <span>{u.email}</span>
              <span className="font-bold text-[#1dbf73]">{u.role}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;