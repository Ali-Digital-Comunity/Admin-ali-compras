import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Store, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import api from '../services/api';

const PRIMARY = '#122a4c';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password, userType: 'tenant' });
      
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // Optional: Save user info if available
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          if (response.data.user.perfil === 'entregador') {
            navigate('/driver');
            return;
          }
        }

        navigate('/dashboard');
      } else {
        setError('Falha no login: Resposta inválida.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f0f4f8' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white"
        style={{ backgroundColor: PRIMARY }}
      >
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-lg leading-tight">São Jorge Super</div>
              <div className="text-white/60 text-sm">Plataforma Administrativa</div>
            </div>
          </div>
          <h2 className="text-3xl font-semibold leading-snug mb-4">
            Gestão completa da sua operação de delivery
          </h2>
          <p className="text-white/65 text-base leading-relaxed">
            Controle pedidos, produtos, entregas, promoções e muito mais em um único painel robusto e intuitivo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Pedidos Hoje', value: '96' },
            { label: 'Faturamento do Dia', value: 'R$ 14.782' },
            { label: 'Clientes Ativos', value: '1.248' },
            { label: 'Produtos Cadastrados', value: '1.041' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}>
              <div className="text-white/60 text-xs mb-1">{stat.label}</div>
              <div className="text-white font-semibold text-xl">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">São Jorge Super</div>
              <div className="text-gray-500 text-sm">Plataforma Administrativa</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-gray-900 font-semibold text-2xl mb-1">Entrar no painel</h2>
            <p className="text-gray-500 text-sm mb-8">Acesse com suas credenciais administrativas</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">E-mail ou usuário</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@saojorgesuper.com.br"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-800 bg-white"
                    style={{ '--tw-ring-color': PRIMARY } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 text-gray-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-600">Lembrar acesso</span>
                </label>
                <button type="button" className="text-sm hover:underline" style={{ color: PRIMARY }}>
                  Esqueci a senha
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ backgroundColor: PRIMARY }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : 'Entrar no Painel'}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <button 
                onClick={() => navigate('/driver')}
                className="text-sm font-bold hover:underline flex items-center justify-center gap-1.5 w-full transition-all"
                style={{ color: PRIMARY }}
              >
                Acessar Minhas Entregas
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 São Jorge Super · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
