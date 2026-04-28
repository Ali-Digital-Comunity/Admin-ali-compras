import { useState } from 'react';
import { Plus, Edit2, Power, Calendar, Tag, X, Package } from 'lucide-react';
import { promotions as initialPromotions } from '../data/mockData';

const PRIMARY = '#122a4c';

const statusStyle: Record<string, { bg: string; text: string }> = {
  'Ativo': { bg: '#f0fdf4', text: '#16a34a' },
  'Agendado': { bg: '#eff6ff', text: '#2563eb' },
  'Encerrado': { bg: '#f3f4f6', text: '#9ca3af' },
};

function PromoForm({ promo, onClose }: { promo?: typeof initialPromotions[0] | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">{promo ? 'Editar Promoção' : 'Nova Promoção'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Nome da campanha *</label>
            <input defaultValue={promo?.name} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" placeholder="Ex: Semana do Arroz" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Desconto *</label>
              <input defaultValue={promo?.discount} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" placeholder="Ex: 15%" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Produtos</label>
              <input defaultValue={promo?.products} type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Data de início</label>
              <input type="date" defaultValue="2026-04-16" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Data de fim</label>
              <input type="date" defaultValue="2026-04-30" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg border border-blue-200 bg-blue-50">
            <input type="checkbox" id="home" className="rounded" />
            <label htmlFor="home" className="text-sm text-blue-700">Destacar na home do app</label>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: PRIMARY }}>
            {promo ? 'Salvar' : 'Criar Promoção'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Promotions() {
  const [promos, setPromos] = useState(initialPromotions);
  const [editing, setEditing] = useState<typeof initialPromotions[0] | null | undefined>(undefined);

  const toggle = (id: number) => {
    setPromos(ps => ps.map(p => p.id === id ? { ...p, status: p.status === 'Ativo' ? 'Encerrado' : 'Ativo' } : p));
  };

  return (
    <div className="p-5 overflow-y-auto flex-1 h-full">
      {editing !== undefined && <PromoForm promo={editing} onClose={() => setEditing(undefined)} />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-900 font-semibold">Promoções e Ofertas</h2>
          <p className="text-gray-500 text-sm mt-0.5">{promos.filter(p => p.status === 'Ativo').length} promoções ativas</p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}
        >
          <Plus className="w-4 h-4" /> Nova Promoção
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['Todas', 'Ativo', 'Agendado', 'Encerrado'].map(tab => (
          <button
            key={tab}
            className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 border transition-colors"
            style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb', color: '#6b7280' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {promos.map(promo => {
          const sc = statusStyle[promo.status];
          return (
            <div key={promo.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#eef2f9' }}
                  >
                    <Tag className="w-5 h-5" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{promo.name}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {promo.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Tag className="w-3.5 h-3.5 text-green-500" />
                        <span className="font-medium text-green-600">{promo.discount} de desconto</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Package className="w-3.5 h-3.5" />
                        <span>{promo.products} produtos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{promo.start} → {promo.end}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditing(promo)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggle(promo.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}