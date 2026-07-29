import { useEffect, useState } from 'react';
import { api, WorkOrder } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_COLUMNS: WorkOrder['status'][] = [
  'NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED',
];

export default function BoardPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/work-orders', { params: { size: 100 } })
      .then((res) => setOrders(res.data.content ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>KEYSTONE</h2>
          <span style={{ color: '#666' }}>{user?.name} · {user?.role}</span>
        </div>
        <button onClick={logout}>Log out</button>
      </header>

      {loading ? (
        <p>Loading work orders...</p>
      ) : orders.length === 0 ? (
        <p>No work orders to show yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STATUS_COLUMNS.length}, 1fr)`, gap: 12 }}>
          {STATUS_COLUMNS.map((status) => (
            <div key={status} style={{ background: '#f5f5f7', borderRadius: 8, padding: 8 }}>
              <h4 style={{ marginTop: 0 }}>{status.replace('_', ' ')}</h4>
              {orders.filter((o) => o.status === status).map((o) => (
                <div key={o.id} style={{ background: 'white', borderRadius: 6, padding: 8, marginBottom: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <strong>{o.code}</strong>
                  <div>{o.title}</div>
                  <small style={{ color: '#888' }}>{o.siteName} · {o.priority}</small>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
