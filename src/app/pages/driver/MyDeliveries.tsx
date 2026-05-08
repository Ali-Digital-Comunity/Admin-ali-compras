import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, ChevronRight, Clock, Inbox, Loader2, MapPin, Package, RotateCcw } from 'lucide-react';
import api from '../../services/api';

const PRIMARY = '#122a4c';

export type DriverStop = {
  id: string;
  orderId: string;
  orderNumber?: string;
  sequence: number;
  customerName: string;
  customerPhone: string;
  address: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  status: 'pending' | 'delivered' | 'failed';
  note?: string;
  failedReason?: string;
  checkedAt?: string;
  finishedAt?: string;
};

export type DriverRoute = {
  id: string;
  status: 'planned' | 'in_progress' | 'completed' | 'canceled';
  routeName: string;
  optimized: boolean;
  neighborhoods: string[];
  totalStops: number;
  pendingCount: number;
  deliveredCount: number;
  failedCount?: number;
  totalDistanceKm?: string | null;
  totalDurationText?: string | null;
  googleMapsUrl?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  stops: DriverStop[];
};

const getApiList = (payload: any): any[] => {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const getDeliveryLabel = (route: Pick<DriverRoute, 'status' | 'optimized'>) => {
  if (route.status === 'completed') return 'Concluída';
  if (route.status === 'canceled') return 'Cancelada';
  if (!route.optimized) return 'Aguardando rota';
  if (route.status === 'in_progress') return 'Em andamento';
  return 'Rota gerada';
};

const getStatusStyle = (route: DriverRoute) => {
  const label = getDeliveryLabel(route);
  if (label === 'Aguardando rota') return { bg: '#fef3c7', color: '#92400e' };
  if (label === 'Rota gerada') return { bg: '#dbeafe', color: '#1e40af' };
  if (label === 'Em andamento') return { bg: '#e0e7ff', color: '#3730a3' };
  if (label === 'Concluída') return { bg: '#dcfce7', color: '#166534' };
  return { bg: '#fee2e2', color: '#991b1b' };
};

const sortDeliveries = (routes: DriverRoute[]) => (
  [...routes].sort((a, b) => {
    const weight = (route: DriverRoute) => {
      if (route.status === 'completed') return 3;
      if (!route.optimized) return 1;
      return 2;
    };
    return weight(a) - weight(b) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })
);

const getActionLabel = (route: DriverRoute) => {
  const label = getDeliveryLabel(route);
  if (label === 'Aguardando rota') return 'Abrir entregas';
  if (label === 'Concluída') return 'Ver resumo';
  if (label === 'Cancelada') return 'Ver detalhes';
  return 'Continuar rota';
};

export function MyDeliveries() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/delivery-routes/my-deliveries');
      setRoutes(sortDeliveries(getApiList(response.data) as DriverRoute[]));
    } catch (err) {
      console.error('Erro ao buscar entregas:', err);
      setError('Não foi possível carregar suas entregas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const totals = useMemo(() => {
    return routes.reduce(
      (acc, route) => ({
        pending: acc.pending + (route.pendingCount || 0),
        done: acc.done + (route.deliveredCount || 0),
      }),
      { pending: 0, done: 0 }
    );
  }, [routes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 text-[#122a4c] animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Carregando suas entregas...</p>
      </div>
    );
  }

  if (routes.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">Nenhuma entrega atribuída no momento</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Quando o mercado atribuir uma entrega para você, ela aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto pb-24 sm:pb-8">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-gray-900">Minhas Entregas</h2>
          <button
            onClick={fetchDeliveries}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#122a4c]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Atualizar
          </button>
        </div>

        {routes.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
              <div className="text-xs font-semibold uppercase text-amber-700">Pendentes</div>
              <div className="text-2xl font-bold text-amber-800">{totals.pending}</div>
            </div>
            <div className="rounded-2xl border border-green-100 bg-green-50 p-3">
              <div className="text-xs font-semibold uppercase text-green-700">Concluídas</div>
              <div className="text-2xl font-bold text-green-800">{totals.done}</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {routes.map((route) => {
          const style = getStatusStyle(route);
          const label = getDeliveryLabel(route);
          const neighborhoods = route.neighborhoods?.length ? route.neighborhoods.join(', ') : 'Sem bairro';

          return (
            <button
              key={route.id}
              onClick={() => navigate(`/driver/route/${encodeURIComponent(route.id)}`)}
              className="w-full text-left bg-white rounded-2xl border border-gray-200 p-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Entrega</div>
                  <div className="font-semibold text-gray-900 truncate">{route.routeName || `Entrega ${route.id.slice(0, 8)}`}</div>
                </div>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: style.bg, color: style.color }}
                >
                  {label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{neighborhoods}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                <span className="inline-flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  {route.totalStops} pedidos
                </span>
                <span className="text-amber-700">{route.pendingCount} pendentes</span>
                <span className="text-green-700">{route.deliveredCount} concluídos</span>
                {route.totalDistanceKm ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {route.totalDistanceKm.toString().replace('.', ',')} km
                  </span>
                ) : (
                  <span className="text-gray-400">Distância não calculada</span>
                )}
                {route.totalDurationText && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {route.totalDurationText}
                  </span>
                )}
              </div>

              <div
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                <span>{getActionLabel(route)}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
