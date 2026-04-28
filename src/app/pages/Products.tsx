import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit2, Power, Eye, X, Package, 
  ChevronDown, Grid2X2, List, Trash2, CheckCircle2, AlertCircle, Tag, Star  
} from 'lucide-react';
import api from '../services/api';

const PRIMARY = '#122a4c';

// Categorias agora são carregadas do banco de dados

function GlobalProductSelector({ existingProductIds, onSelect, onClose }: { existingProductIds: string[]; onSelect: (product: any) => void; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGlobalProducts = async (term: string) => {
    try {
      setLoading(true);
      const response = await api.get('/produtos', { params: { busca_global: term, ativo: true } });
      const results = response.data.data || [];
      
      // Sort: Not added first, added last
      const sorted = [...results].sort((a, b) => {
        const aExists = existingProductIds.includes(a.id);
        const bExists = existingProductIds.includes(b.id);
        if (aExists === bExists) return 0;
        return aExists ? 1 : -1;
      });
      
      setProducts(sorted);
    } catch (error) {
      console.error('Error fetching global products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGlobalProducts(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Vincular Produto</h2>
            <p className="text-xs text-gray-500">Escolha um produto da base global para sua loja</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, marca ou código de barras..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
               <div className="w-8 h-8 border-3 border-gray-100 border-t-primary rounded-full animate-spin" style={{ borderTopColor: PRIMARY }}></div>
               <span className="text-sm text-gray-400 font-medium">Buscando produtos...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-1.5">
               {products.map(p => {
                 const alreadyAdded = existingProductIds.includes(p.id);
                 return (
                   <button
                     key={p.id}
                     onClick={() => !alreadyAdded && onSelect(p)}
                     disabled={alreadyAdded}
                     className={`flex items-center gap-4 p-3.5 rounded-xl transition-all text-left group border border-transparent ${alreadyAdded ? 'opacity-60 cursor-default bg-gray-50/50' : 'hover:bg-gray-50 hover:border-gray-100'}`}
                   >
                     <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                       {p.imagem_url ? (
                         <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                       ) : (
                         <Package className="w-7 h-7 text-gray-300" />
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">{p.nome}</div>
                       <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                         <span className="font-medium px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{p.marca || 'Sem marca'}</span>
                         {p.codigo_barras && (
                           <>
                             <span className="w-1 h-1 rounded-full bg-gray-300" />
                             <span className="font-mono">{p.codigo_barras}</span>
                           </>
                         )}
                       </div>
                     </div>
                     {alreadyAdded ? (
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Adicionado</span>
                       </div>
                     ) : (
                       <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                         <Plus className="w-5 h-5" />
                       </div>
                     )}
                   </button>
                 );
               })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                <Search className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">{search ? 'Nenhum produto encontrado' : 'Comece a digitar para buscar'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ product, isNew, categories, onClose, onSuccess }: { product: any; isNew: boolean; categories: any[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    preco: product?.preco?.toString() ?? '',
    preco_promocional: product?.preco_promocional?.toString() ?? '',
    estoque: product?.estoque?.toString() ?? '',
    ativo: isNew ? true : (product?.ativo_na_loja ?? true),
    destaque: product?.destaque ?? false,
    codigo_interno: product?.codigo_interno ?? '',
    categoria_id: product?.categoria_id ?? product?.produto_categoria_id ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        preco: form.preco ? parseFloat(form.preco.toString().replace(',', '.')) : null,
        preco_promocional: form.preco_promocional ? parseFloat(form.preco_promocional.toString().replace(',', '.')) : null,
        estoque: parseInt(form.estoque.toString()) || 0,
        produto_id: isNew ? product.id : product.produto_id,
        categoria_id: form.categoria_id || null,
        ativo_na_loja: form.ativo,
        destaque: form.destaque,
        codigo_interno: form.codigo_interno
      };

      if (isNew) {
        await api.post('/produtos_loja', payload);
      } else {
        await api.patch(`/produtos_loja/${product.id}`, payload);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving product association', error);
      alert(error.response?.data?.message || 'Erro ao salvar produto na loja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end">
      <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{isNew ? 'Vincular à Minha Loja' : 'Editar Produto na Loja'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Section: Basic (Read Only) */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
               {product.imagem_url ? (
                 <img src={product.imagem_url} alt={product.nome} className="w-full h-full object-cover" />
               ) : (
                 <Package className="w-8 h-8 text-gray-300" />
               )}
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Informações do Produto</div>
               <div className="text-sm font-semibold text-gray-900 truncate">{product.nome}</div>
               <div className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">{product.marca || 'Sem marca'}</span>
                  <span className="mx-1.5 opacity-30">•</span>
                  <span>{product.unidade_medida || 'un'}</span>
               </div>
               <div className="text-[10px] text-gray-400 mt-2 line-clamp-2 italic">
                  {product.descricao || 'Sem descrição cadastrada'}
               </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Section: Store Details */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Configurações da Loja</div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">Código Interno (SKU)</label>
                <input
                  value={form.codigo_interno}
                  onChange={e => setForm(p => ({ ...p, codigo_interno: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Ex: PROD-001"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">Categoria na Loja</label>
                <select
                  value={form.categoria_id}
                  onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="">Usar categoria global</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.emoji || '📁'} {cat.nome}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Se não selecionado, usará a categoria padrão do produto.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Pricing */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Preço e Estoque</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Preço normal (R$) *</label>
                  <input
                    value={form.preco}
                    onChange={e => setForm(p => ({ ...p, preco: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Preço promocional (R$)</label>
                  <input
                    value={form.preco_promocional}
                    onChange={e => setForm(p => ({ ...p, preco_promocional: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Estoque</label>
                <input
                  value={form.estoque}
                  onChange={e => setForm(p => ({ ...p, estoque: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Section: Options */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Configurações</div>
            <div className="space-y-2.5">
              {[
                { key: 'ativo', label: 'Produto ativo na loja', desc: 'Visível no app dos clientes' },
                { key: 'destaque', label: 'Produto em destaque', desc: 'Aparece em seção especial na loja' },
              ].map(opt => (
                <div key={opt.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{opt.label}</div>
                    <div className="text-xs text-gray-400">{opt.desc}</div>
                  </div>
                  <button
                    onClick={() => setForm(p => ({ ...p, [opt.key]: !p[opt.key as keyof typeof form] }))}
                    className="relative inline-flex h-5 w-9 rounded-full transition-colors"
                    style={{ backgroundColor: form[opt.key as keyof typeof form] ? PRIMARY : '#d1d5db' }}
                  >
                    <span
                      className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5"
                      style={{ transform: `translateX(${form[opt.key as keyof typeof form] ? 18 : 2}px)` }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: PRIMARY }}
          >
            {loading ? 'Processando...' : (isNew ? 'Confirmar Vínculo' : 'Salvar Alterações')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Products() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [products, setProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categorias');
      setDbCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos_loja');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    const pName = (p.nome || '').toLowerCase();
    const pBrand = (p.marca || '').toLowerCase();
    const sTerm = search.toLowerCase();
    const matchSearch = pName.includes(sTerm) || pBrand.includes(sTerm);
    
    const matchCat = categoryFilter === 'Todas' || p.categoria_nome === categoryFilter; 
    
    const displayStatus = p.ativo_na_loja ? 'Ativo' : 'Inativo';
    const matchStatus = statusFilter === 'Todos' || displayStatus === statusFilter;
    
    return matchSearch && matchCat && matchStatus;
  });

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
       await api.patch(`/produtos_loja/${id}/ativo`, { ativo: !currentStatus });
       setProducts(ps => ps.map(p => p.id === id ? { ...p, ativo_na_loja: !currentStatus } : p));
    } catch (error) {
       console.error('Error updating status', error);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {isSearchingGlobal && (
        <GlobalProductSelector
          existingProductIds={products.map(p => p.produto_id)}
          onSelect={(globalProduct) => {
            setIsSearchingGlobal(false);
            setEditingProduct({ ...globalProduct, isNew: true });
          }}
          onClose={() => setIsSearchingGlobal(false)}
        />
      )}

      {editingProduct && (
        <ProductForm 
          product={editingProduct} 
          isNew={!!editingProduct.isNew}
          categories={dbCategories}
          onClose={() => setEditingProduct(null)} 
          onSuccess={fetchProducts}
        />
      )}

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar produto ou marca..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1"
            />
          </div>
          <button
            onClick={() => setIsSearchingGlobal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
            style={{ backgroundColor: PRIMARY }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Produto</span>
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('Todas')}
            className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors"
            style={categoryFilter === 'Todas' ? { backgroundColor: PRIMARY, color: 'white' } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
          >
            Todas
          </button>
          {dbCategories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.nome)}
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors flex items-center gap-1.5"
              style={categoryFilter === c.nome ? { backgroundColor: PRIMARY, color: 'white' } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
            >
              <span>{c.emoji || '📁'}</span>
              {c.nome}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 flex-shrink-0 mx-1" />
          {['Todos', 'Ativo', 'Inativo'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors"
              style={statusFilter === s ? { backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">{filtered.length} produto{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto relative">
        {loading && products.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" style={{ borderColor: `${PRIMARY}40`, borderTopColor: PRIMARY }}></div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Estoque</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map(product => {
                const isActive = product.ativo_na_loja;
                const stock = product.estoque || 0;
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {product.imagem_url ? (
                            <img src={product.imagem_url} alt={product.nome} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{product.nome}</div>
                          <div className="text-xs text-gray-400">{product.marca || 'Sem marca'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 flex items-center gap-1">
                        <span>{product.categoria_emoji || '📁'}</span>
                        {product.categoria_nome || 'Sem categoria'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-gray-800">R$ {parseFloat(product.preco || 0).toFixed(2).replace('.', ',')}</div>
                      {product.preco_promocional && (
                        <div className="text-xs text-green-600 font-medium">R$ {parseFloat(product.preco_promocional).toFixed(2).replace('.', ',')}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        {stock === 0 && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                        <span className={`text-sm font-medium ${stock === 0 ? 'text-red-500' : stock < 20 ? 'text-amber-500' : 'text-gray-700'}`}>
                          {stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={isActive
                          ? { backgroundColor: '#f0fdf4', color: '#16a34a' }
                          : { backgroundColor: '#fef2f2', color: '#dc2626' }}
                      >
                        {isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleStatus(product.id, isActive)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title={isActive ? 'Desativar' : 'Ativar'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-colors" title="Destacar">
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors" title="Promoção">
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Tag className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
