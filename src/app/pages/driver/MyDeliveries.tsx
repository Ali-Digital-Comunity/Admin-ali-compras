import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Truck, MapPin, Package, Clock, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import api from '../../services/api';

export type DriverStop = {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'delivered' | 'failed';
  sequence: number;
  problemReason?: string;
};

export type DriverRoute = {
  id: string;
  status: 'planned' | 'in_progress' | 'completed' | 'canceled';
  marketId: string;
  driverId?: string;
  routeName: string;
  totalDistanceMeters: number;
  totalDistanceKm: string;
  totalDurationSeconds: number;
  totalDurationText: string;
  googleMapsUrl: string;
  createdAt: string;
  stops?: DriverStop[];
};

const statusStyles: Record<string, string> = {
  'planned': 'bg-amber-100 text-amber-800',
  'in_progress': 'bg-indigo-100 text-indigo-800',
  'completed': 'bg-green-100 text-green-800',
  'canceled': 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  'planned': 'Aguardando rota',
  'in_progress': 'Em andamento',
  'completed': 'Concluída',
  'canceled': 'Cancelada',
};

export function MyDeliveries() {
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = (() => {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    if (!user?.loja_id) return;
    try {
      setLoading(true);
      const response = await api.get(`/delivery-routes?marketId=${user.loja_id}`);
      // The backend returns snake_case for the list endpoint currently? 
      // Actually, I should check the repository.
      // Repository returns: select('*, entregador:entregadores(nome), stops:delivery_route_stops(count)')
      // It returns raw DB fields. I should map them.
      
      const mappedRoutes = response.data.map((r: any) => ({
        id: r.id,
        status: r.status,
        marketId: r.loja_id,
        driverId: r.entregador_id,
        routeName: r.route_name,
        totalDistanceMeters: r.total_distance_meters,
        totalDistanceKm: (r.total_distance_meters / 1000).toFixed(1),
        totalDurationSeconds: r.total_duration_seconds,
        totalDurationText: `${Math.round(r.total_duration_seconds / 60)} min`,
        createdAt: r.created_at,
        stopCount: r.stops?.[0]?.count || 0
      }));
      
      setRoutes(mappedRoutes);
    } catch (err) {
      console.error('Erro ao buscar rotas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 text-[#122a4c] animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Carregando suas entregas...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-20 sm:pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">
          Olá, <span className="text-[#122a4c]">{user?.nome?.split(' ')[0] || 'Entregador'}</span>.
        </h1>
        <p className="text-gray-500 font-medium italic">Boas vindas!</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-700">Minhas Entregas</h2>
        <span className="text-xs text-gray-500 font-medium">
          {routes.length} {routes.length === 1 ? 'rota atribuída' : 'rotas atribuídas'}
        </span>
      </div>

      {routes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-800">Nenhuma entrega atribuída</h3>
            <p className="text-sm text-gray-500 max-w-[200px]">
              Quando o mercado atribuir uma entrega para você, ela aparecerá aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {routes.map((route) => {
            return (
              <button
                key={route.id}
                onClick={() => navigate(`/driver/route/${route.id}`)}
                className="w-full text-left block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden active:scale-[0.98] transition-all"
              >
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Rota</span>
                      <h2 className="text-lg font-bold text-gray-800 -mt-0.5 truncate max-w-[200px]">
                        {route.routeName || `Entrega #${route.id.slice(0, 4)}`}
                      </h2>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight ${statusStyles[route.status]}`}>
                      {statusLabels[route.status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      <span>{(route as any).stopCount} entregas</span>
                    </div>
                    {route.totalDistanceKm && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{route.totalDistanceKm.toLocaleString()} km</span>
                      </div>
                    )}
                    {route.totalDurationText && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{route.totalDurationText}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#122a4c] px-4 py-3 flex items-center justify-between text-white font-bold text-sm">
                  <span>
                    {route.status === 'planned' ? 'Abrir entregas' :
                     route.status === 'completed' ? 'Ver resumo' : 'Continuar rota'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
