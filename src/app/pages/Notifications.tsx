import { useState } from 'react';
import { Bell, Package, AlertTriangle, CreditCard, Tag, Ticket, ShoppingCart, CheckCheck } from 'lucide-react';
import { notifications as initialNotifications } from '../data/mockData';

const PRIMARY = '#122a4c';

const typeConfig: Record<string, { icon: typeof Bell; bg: string; color: string }> = {
  order: { icon: ShoppingCart, bg: '#eff6ff', color: '#2563eb' },
  stock: { icon: Package, bg: '#fef2f2', color: '#dc2626' },
  warning: { icon: AlertTriangle, bg: '#fffbeb', color: '#d97706' },
  payment: { icon: CreditCard, bg: '#fef2f2', color: '#dc2626' },
  promo: { icon: Tag, bg: '#f5f3ff', color: '#7c3aed' },
  coupon: { icon: Ticket, bg: '#ecfeff', color: '#0891b2' },
};

export function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('Todas');

  const filtered = filter === 'Todas' ? notifications : filter === 'Não lidas' ? notifications.filter(n => !n.read) : notifications.filter(n => n.read);

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="p-5 max-w-2xl mx-auto overflow-y-auto flex-1 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-gray-900 font-semibold">Notificações</h2>
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#dc2626' }}>
                {unread}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Alertas e eventos operacionais</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm hover:underline"
            style={{ color: PRIMARY }}
          >
            <CheckCheck className="w-4 h-4" /> Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        {['Todas', 'Não lidas', 'Lidas'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={filter === f ? { backgroundColor: PRIMARY, color: 'white' } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(notif => {
          const tc = typeConfig[notif.type] ?? typeConfig.order;
          const Icon = tc.icon;
          return (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                !notif.read ? 'bg-white border-gray-200' : 'bg-gray-50 border-transparent'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: tc.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: tc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-gray-800 text-sm">{notif.title}</div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: PRIMARY }} />
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{notif.desc}</div>
                <div className="text-xs text-gray-400 mt-1">{notif.time}</div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Nenhuma notificação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}