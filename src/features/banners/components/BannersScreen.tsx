import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, X, Image, Calendar, Power } from 'lucide-react';
import { banners as initialBanners } from '@/shared/constants/mockData';

const PRIMARY = '#122a4c';

const bannerColors = [
  { bg: 'linear-gradient(135deg, #122a4c 0%, #1e4d87 100%)' },
  { bg: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)' },
  { bg: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)' },
  { bg: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' },
];

function BannerForm({ banner, onClose }: { banner?: typeof initialBanners[0] | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">{banner ? 'Editar Banner' : 'Novo Banner'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 bg-gray-50 cursor-pointer">
            <Image className="w-8 h-8 text-gray-300" />
            <span className="text-sm text-gray-500">Clique para enviar imagem do banner</span>
            <span className="text-xs text-gray-400">Recomendado: 1200x400px</span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Título *</label>
            <input defaultValue={banner?.title} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Subtítulo</label>
            <input defaultValue={banner?.subtitle} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Link / Destino</label>
            <input defaultValue={banner?.link} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" placeholder="/categoria/mercearia" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Início da exibição</label>
              <input type="date" defaultValue="2026-04-16" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Fim da exibição</label>
              <input type="date" defaultValue="2026-04-30" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Prioridade (ordem)</label>
            <input type="number" defaultValue={banner?.order ?? 1} min={1} max={10} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: PRIMARY }}>
            {banner ? 'Salvar' : 'Criar Banner'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BannersScreen() {
  const [banners, setBanners] = useState(initialBanners);
  const [editing, setEditing] = useState<typeof initialBanners[0] | null | undefined>(undefined);

  const remove = (id: number) => setBanners(bs => bs.filter(b => b.id !== id));
  const toggle = (id: number) => {
    setBanners(bs => bs.map(b => b.id === id ? { ...b, status: b.status === 'Ativo' ? 'Inativo' : 'Ativo' } : b));
  };

  return (
    <div className="p-5 overflow-y-auto flex-1 h-full">
      {editing !== undefined && <BannerForm banner={editing} onClose={() => setEditing(undefined)} />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-900 font-semibold">Banners e Conteúdo da Home</h2>
          <p className="text-gray-500 text-sm mt-0.5">{banners.filter(b => b.status === 'Ativo').length} banners ativos · Arraste para reordenar</p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}
        >
          <Plus className="w-4 h-4" /> Novo Banner
        </button>
      </div>

      {/* Preview */}
      <div className="mb-6 bg-gray-100 rounded-xl p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Prévia no App</div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {banners.filter(b => b.status === 'Ativo').map((banner, i) => (
            <div
              key={banner.id}
              className="w-64 h-28 rounded-xl flex-shrink-0 flex flex-col justify-end p-3 text-white"
              style={{ background: bannerColors[i % bannerColors.length].bg }}
            >
              <div className="text-xs font-semibold truncate">{banner.title}</div>
              <div className="text-[10px] opacity-80 truncate">{banner.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner list */}
      <div className="space-y-3">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className="text-gray-300 cursor-grab flex-shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
            <div
              className="w-16 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: bannerColors[(banner.order - 1) % bannerColors.length].bg }}
            >
              #{banner.order}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-800 text-sm">{banner.title}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={banner.status === 'Ativo'
                    ? { backgroundColor: '#f0fdf4', color: '#16a34a' }
                    : banner.status === 'Agendado'
                    ? { backgroundColor: '#eff6ff', color: '#2563eb' }
                    : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                >
                  {banner.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{banner.subtitle}</div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{banner.start} → {banner.end}
                </span>
                <span className="text-[11px] text-blue-500">{banner.link}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setEditing(banner)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => toggle(banner.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <Power className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => remove(banner.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}