import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, ShoppingCart, Users, XCircle, DollarSign, BarChart3 } from 'lucide-react';
import { salesData, categoryRevenueData, topProducts, statusData } from '../data/mockData';

const PRIMARY = '#122a4c';

const COLORS = [PRIMARY, '#2563eb', '#7c3aed', '#16a34a', '#d97706', '#ea580c'];

const hourlyData = [
  { hour: '07h', pedidos: 4 }, { hour: '08h', pedidos: 12 }, { hour: '09h', pedidos: 18 },
  { hour: '10h', pedidos: 22 }, { hour: '11h', pedidos: 15 }, { hour: '12h', pedidos: 28 },
  { hour: '13h', pedidos: 31 }, { hour: '14h', pedidos: 19 }, { hour: '15h', pedidos: 24 },
  { hour: '16h', pedidos: 27 }, { hour: '17h', pedidos: 35 }, { hour: '18h', pedidos: 42 },
  { hour: '19h', pedidos: 38 }, { hour: '20h', pedidos: 29 }, { hour: '21h', pedidos: 18 },
  { hour: '22h', pedidos: 8 },
];

export function Reports() {
  return (
    <div className="p-5 space-y-5 overflow-y-auto flex-1 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold">Relatórios e Análises</h2>
          <p className="text-gray-500 text-sm mt-0.5">Desempenho operacional — Abril 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none">
            <option>Este mês</option>
            <option>Semana atual</option>
            <option>Mês anterior</option>
            <option>Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Faturamento', value: 'R$ 94.820', sub: '+14.2%', color: PRIMARY, icon: DollarSign },
          { label: 'Pedidos', value: '1.248', sub: '+8.7%', color: '#2563eb', icon: ShoppingCart },
          { label: 'Ticket Médio', value: 'R$ 75,98', sub: '+5.1%', color: '#7c3aed', icon: TrendingUp },
          { label: 'Novos Clientes', value: '312', sub: '+22.3%', color: '#16a34a', icon: Users },
          { label: 'Cancelamentos', value: '4.8%', sub: '-1.2%', color: '#d97706', icon: XCircle },
          { label: 'Receita Líq.', value: 'R$ 83.650', sub: '+12.8%', color: '#ea580c', icon: BarChart3 },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-3">
            <kpi.icon className="w-4 h-4 mb-2" style={{ color: kpi.color }} />
            <div className="font-semibold text-gray-800 text-sm">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
            <div className="text-[11px] font-medium mt-1" style={{ color: kpi.sub.startsWith('+') ? '#16a34a' : '#dc2626' }}>{kpi.sub} vs mês ant.</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Faturamento por Dia</h3>
              <p className="text-xs text-gray-400 mt-0.5">Últimos 7 dias</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, 'Faturamento']} />
              <Area type="monotone" dataKey="vendas" stroke={PRIMARY} strokeWidth={2} fill="url(#repGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Categories pie */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Vendas por Categoria</h3>
          <p className="text-xs text-gray-400 mb-3">Participação no faturamento</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryRevenueData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={false}>
                {categoryRevenueData.map((entry, i) => (
                  <Cell key={`category-pie-${entry.name}-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {categoryRevenueData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-gray-600">{c.name}</span>
                </div>
                <span className="text-xs font-medium text-gray-700">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly pedidos */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Horários de Maior Movimento</h3>
          <p className="text-xs text-gray-400 mb-4">Pedidos por hora – hoje</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="pedidos" fill={PRIMARY} radius={[3, 3, 0, 0]} name="Pedidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products table */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Produtos Mais Vendidos</h3>
          <p className="text-xs text-gray-400 mb-4">Ranking do mês</p>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7c2f' : '#e5e7eb' }}
                >
                  <span style={{ color: i >= 3 ? '#6b7280' : 'white' }}>{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 font-medium truncate">{p.name}</div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(p.qty / topProducts[0].qty) * 100}%`, backgroundColor: PRIMARY }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-gray-700">{p.qty} un.</div>
                  <div className="text-[11px] text-gray-400">R$ {p.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}