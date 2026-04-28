import { useState, useEffect, useCallback } from 'react';
import { Store, Clock, Truck, CreditCard, Save, Bell, Link as LinkIcon, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const PRIMARY = '#122a4c';

const sections = ['Dados do Mercado', 'Horário de Funcionamento', 'Entrega', 'Pagamentos', 'Notificações'];

export function Settings() {
  const [activeSection, setActiveSection] = useState('Dados do Mercado');
  const [saved, setSaved] = useState(false);
  const [mpStatus, setMpStatus] = useState<any>(null);
  const [loadingMp, setLoadingMp] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<any>({
    nome: '',
    cnpj: '',
    razao_social: '',
    telefone: '',
    email: '',
    descricao: '',
    logo_url: '',
    horario_abertura: '',
    horario_fechamento: '',
    valor_minimo_pedido: 0,
    taxa_entrega_padrao: 0,
    // Configurações
    permite_entrega: true,
    permite_retirada: true,
    tempo_medio_entrega_minutos: 30,
    whatsapp_suporte: '',
    configId: null
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const lojaId = user.loja_id;

  const checkMpConnection = useCallback(async () => {
    if (!lojaId) return;
    try {
      setLoadingMp(true);
      const response = await api.get(`/mercadopago/connection-status/${lojaId}`);
      setMpStatus(response.data.data);
    } catch (error) {
      console.error('Erro ao verificar conexão MP:', error);
    } finally {
      setLoadingMp(false);
    }
  }, [lojaId]);

  const loadData = useCallback(async () => {
    if (!lojaId) return;
    try {
      setLoading(true);
      setError('');

      const [storeRes, configRes] = await Promise.allSettled([
        api.get(`/lojas/${lojaId}`),
        api.get(`/lojas/${lojaId}/configuracoes`)
      ]);

      let store = {};
      if (storeRes.status === 'fulfilled') {
        store = storeRes.value.data?.data || storeRes.value.data;
      } else {
        throw new Error('Falha ao carregar dados da loja');
      }

      let config = {};
      if (configRes.status === 'fulfilled') {
        config = (configRes.value.data?.data || configRes.value.data)?.[0] || {};
      } else {
        console.warn('Configurações não encontradas ou erro no servidor, usando padrões');
      }

      setFormData({
        ...store,
        ...config,
        configId: config.id || null, // Armazena explicitamente o ID da configuração
        razao_social: store.razao_social || '',
        telefone: store.telefone || '',
        email: store.email || '',
        descricao: store.descricao || '',
        logo_url: store.logo_url || '',
        horario_abertura: store.horario_abertura || '',
        horario_fechamento: store.horario_fechamento || '',
        whatsapp_suporte: config.whatsapp_suporte || ''
      });
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Falha ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, [lojaId]);

  useEffect(() => {
    loadData();
    checkMpConnection();
  }, [loadData, checkMpConnection]);

  const save = async () => {
    try {
      setError('');
      const storeData = {
        nome: formData.nome,
        razao_social: formData.razao_social,
        cnpj: formData.cnpj,
        telefone: formData.telefone,
        email: formData.email,
        descricao: formData.descricao,
        logo_url: formData.logo_url,
        horario_abertura: formData.horario_abertura,
        horario_fechamento: formData.horario_fechamento,
        valor_minimo_pedido: Number(formData.valor_minimo_pedido),
        taxa_entrega_padrao: Number(formData.taxa_entrega_padrao)
      };

      const configData = {
        permite_entrega: formData.permite_entrega,
        permite_retirada: formData.permite_retirada,
        tempo_medio_entrega_minutos: Number(formData.tempo_medio_entrega_minutos),
        whatsapp_suporte: formData.whatsapp_suporte
      };

      await api.put(`/lojas/${lojaId}`, storeData);
      
      if (formData.configId) {
        await api.put(`/configuracoes_loja/${formData.configId}`, configData);
      } else {
        const res = await api.post(`/configuracoes_loja`, { ...configData, loja_id: lojaId });
        // Atualiza o configId após criar
        setFormData((prev: any) => ({ ...prev, configId: res.data?.data?.id || res.data?.id }));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar as configurações');
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConnectMp = () => {
    window.location.href = `${api.defaults.baseURL}/mercadopago/oauth/authorize/${lojaId}`;
  };

  const paymentMethods = ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Vale Refeição', 'Vale Alimentação'];
  const [enabledPayments, setEnabledPayments] = useState(['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']);

  const togglePayment = (method: string) => {
    setEnabledPayments(ps => ps.includes(method) ? ps.filter(p => p !== method) : [...ps, method]);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-5 overflow-y-auto flex-1 h-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-900 font-semibold">Configurações do Mercado</h2>
          <p className="text-gray-500 text-sm mt-0.5">Gerencie os dados e regras da operação</p>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
          style={{ backgroundColor: saved ? '#16a34a' : PRIMARY }}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Section nav */}
        <div className="lg:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={activeSection === s
                  ? { backgroundColor: '#eef2f9', color: PRIMARY, fontWeight: 600 }
                  : { color: '#6b7280' }}
              >
                {s}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === 'Dados do Mercado' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4" style={{ color: PRIMARY }} />
                <h3 className="font-semibold text-gray-800">Informações Gerais</h3>
              </div>
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-gray-300 transition-colors">
                <Store className="w-8 h-8 text-gray-300" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Nome do mercado</label>
                  <input name="nome" value={formData.nome} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">CNPJ</label>
                  <input name="cnpj" value={formData.cnpj} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1.5">Razão Social</label>
                  <input name="razao_social" value={formData.razao_social} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Telefone / WhatsApp</label>
                  <input name="telefone" value={formData.telefone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">E-mail de contato</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1.5">Descrição do Mercado</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1.5">URL do Logo</label>
                  <input name="logo_url" value={formData.logo_url} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Horário de Funcionamento' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" style={{ color: PRIMARY }} />
                <h3 className="font-semibold text-gray-800">Horário de Funcionamento</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Horário de Abertura</label>
                  <input type="time" name="horario_abertura" value={formData.horario_abertura} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Horário de Fechamento</label>
                  <input type="time" name="horario_fechamento" value={formData.horario_fechamento} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                * Estes horários são aplicados para todos os dias de funcionamento do mercado.
              </p>
            </div>
          )}

          {activeSection === 'Entrega' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4" style={{ color: PRIMARY }} />
                <h3 className="font-semibold text-gray-800">Configurações de Entrega</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Taxa de entrega padrão (R$)</label>
                  <input type="number" name="taxa_entrega_padrao" value={formData.taxa_entrega_padrao} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Valor mínimo do pedido (R$)</label>
                  <input type="number" name="valor_minimo_pedido" value={formData.valor_minimo_pedido} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Tempo médio de entrega (min)</label>
                  <input type="number" name="tempo_medio_entrega_minutos" value={formData.tempo_medio_entrega_minutos} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">WhatsApp de Suporte</label>
                  <input name="whatsapp_suporte" value={formData.whatsapp_suporte} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none" />
                </div>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="permite_entrega" checked={formData.permite_entrega} onChange={handleInputChange} className="rounded" />
                    <span className="text-sm text-gray-700">Permite Entrega</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="permite_retirada" checked={formData.permite_retirada} onChange={handleInputChange} className="rounded" />
                    <span className="text-sm text-gray-700">Permite Retirada</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Pagamentos' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4" style={{ color: PRIMARY }} />
                <h3 className="font-semibold text-gray-800">Formas de Pagamento</h3>
              </div>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <div key={method} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-700">{method}</span>
                    <button
                      onClick={() => togglePayment(method)}
                      className="relative inline-flex h-5 w-9 rounded-full transition-colors"
                      style={{ backgroundColor: enabledPayments.includes(method) ? PRIMARY : '#d1d5db' }}
                    >
                      <span
                        className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5"
                        style={{ transform: `translateX(${enabledPayments.includes(method) ? 18 : 2}px)` }}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#009ee3] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">MP</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Split de Pagamentos (Mercado Pago)</h4>
                      <p className="text-xs text-gray-500">Conecte sua conta para receber pagamentos e split automático</p>
                    </div>
                  </div>
                  {loadingMp ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  ) : mpStatus?.connected ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-100">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Conectado
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
                      <XCircle className="w-3.5 h-3.5" />
                      Não conectado
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {mpStatus?.connected ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">ID da Conta:</span>
                        <span className="font-mono text-gray-700">{mpStatus.mp_user_id}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Status no MP:</span>
                        <span className="capitalize text-gray-700">{mpStatus.onboarding_status || 'Aprovado'}</span>
                      </div>
                      <button 
                        onClick={handleConnectMp}
                        className="w-full mt-2 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-white transition-colors"
                      >
                        Reconectar Conta
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                        Para ativar o recebimento automático de vendas e o split de comissões da plataforma, 
                        você precisa autorizar nossa aplicação no seu Mercado Pago.
                      </p>
                      <button
                        onClick={handleConnectMp}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:brightness-110 shadow-sm"
                        style={{ backgroundColor: '#009ee3' }}
                      >
                        <LinkIcon className="w-4 h-4" />
                        Conectar com Mercado Pago
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Notificações' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4" style={{ color: PRIMARY }} />
                <h3 className="font-semibold text-gray-800">Preferências de Notificação</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Novo pedido recebido',
                  'Pedido atrasado',
                  'Produto sem estoque',
                  'Falha em pagamento',
                  'Campanha encerrando',
                  'Cupom expirando',
                  'Novo cliente cadastrado',
                  'Entrega concluída',
                ].map(notif => (
                  <div key={notif} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-700">{notif}</span>
                    <button
                      className="relative inline-flex h-5 w-9 rounded-full transition-colors"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      <span className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5" style={{ transform: 'translateX(18px)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}