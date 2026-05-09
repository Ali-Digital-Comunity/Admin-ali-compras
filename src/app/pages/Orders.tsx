import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  X,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  User,
  Package,
  ArrowLeft,
  CheckCircle2,
  Printer,
  List,
  Map as MapIcon,
  ChevronDown,
  ChevronRight,
  TruckIcon,
  Navigation,
  Loader2,
} from "lucide-react";
import api from "../services/api";

const statusColor: Record<string, { bg: string; text: string }> = {
  Recebido: { bg: "#fffbeb", text: "#d97706" },
  pendente: { bg: "#fffbeb", text: "#d97706" },
  Confirmado: { bg: "#eff6ff", text: "#2563eb" },
  confirmado: { bg: "#eff6ff", text: "#2563eb" },
  "Em Separação": { bg: "#f5f3ff", text: "#7c3aed" },
  em_separacao: { bg: "#f5f3ff", text: "#7c3aed" },
  Pronto: { bg: "#ecfeff", text: "#0891b2" },
  pronto: { bg: "#ecfeff", text: "#0891b2" },
  "Saiu para Entrega": { bg: "#fff7ed", text: "#ea580c" },
  saiu_para_entrega: { bg: "#fff7ed", text: "#ea580c" },
  Entregue: { bg: "#f0fdf4", text: "#16a34a" },
  entregue: { bg: "#f0fdf4", text: "#16a34a" },
  Cancelado: { bg: "#fef2f2", text: "#dc2626" },
  cancelado: { bg: "#fef2f2", text: "#dc2626" },
};

const statusLabels: Record<string, string> = {
  pendente: "Recebido",
  confirmado: "Confirmado",
  em_separacao: "Em Separação",
  pronto: "Pronto",
  saiu_para_entrega: "Saiu para Entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const bairroColors = [
  { bg: "#e0f2fe", border: "#7dd3fc", text: "#0c4a6e", dot: "#0284c7" },
  { bg: "#ecfdf5", border: "#86efac", text: "#166534", dot: "#16a34a" },
  { bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6", dot: "#7c3aed" },
  { bg: "#fff7ed", border: "#fdba74", text: "#9a3412", dot: "#f97316" },
  { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", dot: "#dc2626" },
  { bg: "#ecfeff", border: "#67e8f9", text: "#0f766e", dot: "#06b6d4" },
  { bg: "#fefce8", border: "#fde68a", text: "#713f12", dot: "#f59e0b" },
  { bg: "#f8fafc", border: "#cbd5e1", text: "#0f172a", dot: "#334155" },
];

const allStatuses = [
  "Todos",
  "Recebido",
  "Confirmado",
  "Em Separação",
  "Pronto",
  "Saiu para Entrega",
  "Entregue",
  "Cancelado",
];
const statusFlow = [
  "Recebido",
  "Confirmado",
  "Em Separação",
  "Pronto",
  "Saiu para Entrega",
  "Entregue",
];
const frontendToBackendStatus: Record<string, string | undefined> = {
  Todos: undefined,
  Recebido: "pendente",
  Confirmado: "confirmado",
  "Em Separação": "em_separacao",
  Pronto: "pronto",
  "Saiu para Entrega": "saiu_para_entrega",
  Entregue: "entregue",
  Cancelado: "cancelado",
};
const PRIMARY = "#122a4c";

const orderItemsMock = [
  { name: "Arroz Camil 1kg", qty: 2, price: 8.49, obs: "" },
  { name: "Leite Italac 1L", qty: 4, price: 4.89, obs: "" },
];

const extractBairro = (address: string) => {
  if (!address) return "Não informado";
  const parts = address.split("–");
  return parts.length > 1 ? parts[1].trim() : "Não informado";
};

const getApiList = (payload: any): any[] => {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const getBackendStatus = (status: string) => {
  const mapped = Object.entries(statusLabels).find(
    ([, label]) => label === status,
  );
  if (mapped) return mapped[0];

  return status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const canChangeDeliveryCourier = (delivery: any) =>
  !delivery || ["aguardando", "atribuida"].includes(delivery.status);

const isDeliveryOrder = (order: any) =>
  (order?.tipo_pedido || order?.type || "").toLowerCase() === "entrega";

const getOrderNeighborhood = (order: any) =>
  order.endereco_cliente?.bairro || extractBairro(order.address || "");

const getOrderAddress = (order: any) => {
  const address = order.endereco_cliente;
  if (!address) return order.address || "Endereço não informado";
  return [address.logradouro || address.rua, address.numero]
    .filter(Boolean)
    .join(", ");
};

const getDeliveryLabel = (route: any) => {
  if (route.status === "completed") return "Concluída";
  if (route.status === "canceled") return "Cancelada";
  if (!route.optimized) return "Aguardando rota";
  if (route.status === "in_progress") return "Em andamento";
  return "Rota gerada";
};

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback;

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(18, 42, 76, ${alpha})`;

  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Print comanda for a single order
const printComanda = (order: any, orderItems: any[] = orderItemsMock) => {
  const subtotal = orderItems.reduce(
    (a, i) => a + (i.price_unit * i.quantity || i.price * i.qty),
    0,
  );
  const delivery =
    order.type === "Entrega" || order.tipo_pedido === "entrega"
      ? order.taxa_entrega || 6.99
      : 0;
  const total = order.total || order.valor_total || 0;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Comanda ${order.numero_pedido || order.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; padding: 16px; font-size: 12px; color: #000; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .large { font-size: 15px; }
    .divider-solid { border-top: 1px solid #000; margin: 8px 0; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .row-total { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-bottom: 3px; }
    .obs { font-size: 10px; color: #555; margin: 0 0 5px 16px; font-style: italic; }
    p { margin-bottom: 4px; }
    .tag { display: inline-block; border: 1px solid #000; padding: 1px 6px; font-size: 11px; margin: 2px 0; }
  </style>
</head>
<body>
  <div class="center">
    <p class="large bold">SÃO JORGE SUPER</p>
    <p style="font-size:10px">CNPJ: 00.000.000/0001-00</p>
    <p style="font-size:10px">Rua São Jorge, 100 – Centro</p>
    <p style="font-size:10px">Tel: (11) 3000-0000</p>
  </div>
  <div class="divider-solid"></div>
  <div class="center">
    <p class="bold large">COMANDA DE PEDIDO</p>
    <p>Pedido: <span class="bold">${order.numero_pedido || order.id}</span></p>
    <p>Data: ${new Date(order.created_at || new Date()).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })} ${new Date(order.created_at || new Date()).toLocaleTimeString("pt-BR")}</p>
    <span class="tag">${(order.tipo_pedido || order.type || "").toUpperCase()}</span>
  </div>
  <div class="divider"></div>
  <p><span class="bold">Cliente:</span> ${order.cliente?.nome || order.customer || "Não informado"}</p>
  <p><span class="bold">Telefone:</span> ${order.cliente?.telefone || order.phone || "Não informado"}</p>
  ${order.type === "Entrega" || order.tipo_pedido === "entrega" ? `<p><span class="bold">Endereço:</span> ${order.endereco_cliente?.logradouro || order.address || "Não informado"}</p><p><span class="bold">Bairro:</span> ${order.endereco_cliente?.bairro || extractBairro(order.address || "")}</p>` : ""}
  <div class="divider"></div>
  <p class="bold" style="margin-bottom:6px">ITENS DO PEDIDO:</p>
  ${(Array.isArray(orderItems) ? orderItems : [])
    .map(
      (i) => `
    <div class="row">
      <span>${i.quantity || i.qty}x ${i.produto?.nome || i.name}</span>
      <span>R$ ${((i.price_unit || i.price) * (i.quantity || i.qty)).toFixed(2).replace(".", ",")}</span>
    </div>
    ${i.observacoes || i.obs ? `<p class="obs">Obs: ${i.observacoes || i.obs}</p>` : ""}
  `,
    )
    .join("")}
  <div class="divider"></div>
  <div class="row"><span>Subtotal</span><span>R$ ${subtotal.toFixed(2).replace(".", ",")}</span></div>
  ${order.type === "Entrega" || order.tipo_pedido === "entrega" ? `<div class="row"><span>Taxa de entrega</span><span>R$ ${delivery.toFixed(2).replace(".", ",")}</span></div>` : '<div class="row"><span>Retirada na loja</span><span>Grátis</span></div>'}
  <div class="row"><span>Desconto</span><span>R$ ${(order.desconto || 0).toFixed(2).replace(".", ",")}</span></div>
  <div class="divider-solid"></div>
  <div class="row-total"><span>TOTAL A PAGAR</span><span>R$ ${parseFloat(total).toFixed(2).replace(".", ",")}</span></div>
  <div class="divider"></div>
  <p><span class="bold">Pagamento:</span> ${order.pagamento?.metodo || order.payment || "Não informado"}</p>
  <div class="divider-solid"></div>
  <div class="center" style="margin-top: 8px;">
    <p>Obrigado pela preferência!</p>
    <p class="bold" style="margin-top:4px">São Jorge Super</p>
    <p style="font-size:10px;margin-top:2px">www.saojorgesuper.com.br</p>
  </div>
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=420,height=650");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

const printBairroRoute = (bairro: string, bairroOrders: any[]) => {
  const total = bairroOrders.reduce(
    (a, o) => a + parseFloat(o.valor_total || o.total || 0),
    0,
  );
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Rota – ${bairro}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; padding: 16px; font-size: 12px; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .divider-solid { border-top: 1px solid #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    p { margin-bottom: 4px; }
    .order-block { border: 1px dashed #555; padding: 8px; margin-bottom: 8px; }
    .num { display: inline-block; width: 18px; height: 18px; border: 1px solid #000; text-align: center; line-height: 18px; margin-right: 4px; font-size: 10px; }
  </style>
</head>
<body>
  <div class="center">
    <p class="bold" style="font-size:15px">SÃO JORGE SUPER</p>
    <p style="font-size:10px">FOLHA DE ROTA</p>
  </div>
  <div class="divider-solid"></div>
  <div class="center">
    <p class="bold" style="font-size:13px">BAIRRO: ${bairro.toUpperCase()}</p>
    <p>Data: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
    <p>${bairroOrders.length} pedido${bairroOrders.length !== 1 ? "s" : ""} · R$ ${total.toFixed(2).replace(".", ",")}</p>
  </div>
  <div class="divider"></div>
  ${bairroOrders
    .map(
      (o, i) => `
    <div class="order-block">
      <p><span class="num">${i + 1}</span> <span class="bold">${o.numero_pedido || o.id}</span> – ${statusLabels[o.status] || o.status}</p>
      <p class="bold" style="margin-top:4px">${o.cliente?.nome || o.customer || "Não informado"}</p>
      <p>${o.cliente?.telefone || o.phone || "Não informado"}</p>
      <p>${o.endereco_cliente?.logradouro || o.address || "Não informado"}</p>
      <div class="divider"></div>
      <div class="row"><span>Total</span><span class="bold">R$ ${parseFloat(
        o.valor_total || o.total || 0,
      )
        .toFixed(2)
        .replace(".", ",")}</span></div>
      <div class="row"><span>Pagamento</span><span>${o.pagamento?.metodo || o.payment || "Não informado"}</span></div>
    </div>
  `,
    )
    .join("")}
  <div class="divider-solid"></div>
  <div class="row bold"><span>TOTAL DA ROTA</span><span>R$ ${total.toFixed(2).replace(".", ",")}</span></div>
  <div style="margin-top:12px">
    <p>Entregador: _______________________</p>
    <p style="margin-top:8px">Saída: ______ Retorno: ______</p>
  </div>
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=420,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [bairroFilter, setBairroFilter] = useState("Todos");
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"lista" | "bairros">("lista");
  const [expandedBairros, setExpandedBairros] = useState<
    Record<string, boolean>
  >({});
  const [couriers, setCouriers] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [deliveryRecords, setDeliveryRecords] = useState<any[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<any | null>(null);
  const [assigningCourier, setAssigningCourier] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [deliveryNotice, setDeliveryNotice] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deliveryModalOrders, setDeliveryModalOrders] = useState<any[] | null>(
    null,
  );
  const [routeDriverId, setRouteDriverId] = useState("");
  const [openRoutes, setOpenRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [confirmingRoute, setConfirmingRoute] = useState(false);
  const [loadingOpenRoutes, setLoadingOpenRoutes] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(PRIMARY);
  const PER_PAGE = 20;

  const user = (() => {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    setOrders([]);
    setPage(1);
    fetchOrders(1, true);
    fetchAuxiliaryData();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (!user?.loja_id) return;

    api
      .get(`/lojas/${user.loja_id}/configuracoes`)
      .then((res) => {
        const config = res.data?.data || res.data;
        if (config?.cor_primaria) setPrimaryColor(config.cor_primaria);
      })
      .catch(() => setPrimaryColor(PRIMARY));
  }, [user?.loja_id]);

  useEffect(() => {
    if (viewMode === "bairros" && typeFilter === "Retirada") {
      setTypeFilter("Entrega");
    }
  }, [viewMode, typeFilter]);

  useEffect(() => {
    setSelectedOrderIds([]);
  }, [search, statusFilter, typeFilter, bairroFilter, viewMode]);

  const fetchAuxiliaryData = async () => {
    try {
      const [entRes, areaRes, deliveryRes] = await Promise.all([
        api.get("/entregadores"),
        api.get("/areas_entrega"),
        api.get("/entregas"),
      ]);
      const eData = entRes.data.data;
      const allCouriers = Array.isArray(eData) ? eData : eData?.data || [];
      setCouriers(
        allCouriers.filter(
          (c: any) => c.status === "ativo" || c.status === "disponivel",
        ),
      );

      const aData = areaRes.data.data;
      setAreas(Array.isArray(aData) ? aData : aData?.data || []);

      setDeliveryRecords(getApiList(deliveryRes.data));
    } catch (error) {
      console.error("Error fetching auxiliary data:", error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders([]);
      setPage(1);
      fetchOrders(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const params: any = {
        page: pageNum,
        per_page: PER_PAGE + 1, // Pesquisa 21 para saber se tem mais
        status: frontendToBackendStatus[statusFilter],
        tipo_pedido:
          typeFilter === "Todos" ? undefined : typeFilter.toLowerCase(),
        busca: search || undefined,
      };

      const response = await api.get("/pedidos", { params });
      const rawData = response.data.data;
      const data = Array.isArray(rawData) ? rawData : rawData?.data || [];

      const more = data.length > PER_PAGE;
      const displayData = more ? data.slice(0, PER_PAGE) : data;

      setHasMore(more);
      setOrders((prev) => (reset ? displayData : [...prev, ...displayData]));
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchOrders(page + 1);
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const response = await api.get("/itens_pedido", {
        params: { pedido_id: orderId },
      });
      const rawItems = response.data.data ?? response.data;
      setSelectedItems(Array.isArray(rawItems) ? rawItems : []);
    } catch (error) {
      console.error("Error fetching order items:", error);
      // fallback
      try {
        const resp2 = await api.get(`/pedidos/${orderId}/itens`);
        const rawItems2 = resp2.data.data ?? resp2.data;
        setSelectedItems(Array.isArray(rawItems2) ? rawItems2 : []);
      } catch (err2) {
        setSelectedItems(Array.isArray(orderItemsMock) ? orderItemsMock : []);
      }
    }
  };

  const fetchOrderDelivery = async (orderId: string) => {
    try {
      const response = await api.get("/entregas", {
        params: { pedido_id: orderId },
      });
      const data = getApiList(response.data);
      // Se houver entrega, pega a primeira (geralmente só tem uma)
      setCurrentDelivery(data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error("Error fetching order delivery:", error);
      setCurrentDelivery(null);
    }
  };

  const getDeliveryForOrder = async (orderId: string) => {
    const response = await api.get("/entregas", {
      params: { pedido_id: orderId },
    });
    const data = getApiList(response.data);
    return data.length > 0 ? data[0] : null;
  };

  const handleSelectOrder = (order: any) => {
    setSelected(order);
    setSelectedItems([]);
    setCurrentDelivery(null);
    fetchOrderItems(order.id);
    if ((order.tipo_pedido || order.type || "").toLowerCase() === "entrega") {
      fetchOrderDelivery(order.id);
    }
  };

  const handleAssignCourier = async (entregadorId: string) => {
    if (!selected) return;

    try {
      setAssigningCourier(true);
      const latestDelivery = currentDelivery?.id
        ? await getDeliveryForOrder(selected.id)
        : currentDelivery;

      if (latestDelivery) {
        if (latestDelivery.entregador_id === entregadorId) {
          setCurrentDelivery(latestDelivery);
          return;
        }

        if (!canChangeDeliveryCourier(latestDelivery)) {
          setCurrentDelivery(latestDelivery);
          alert(
            "Não é possível alterar o entregador depois que a entrega saiu para rota.",
          );
          return;
        }

        // Já existe uma entrega, vamos atribuir/mudar o entregador
        const response = await api.patch(
          `/entregas/${latestDelivery.id}/atribuir-entregador`,
          {
            entregador_id: entregadorId,
          },
        );
        setCurrentDelivery(response.data.data || response.data);
      } else {
        // Não existe entrega, vamos criar uma
        // Precisamos de uma área de entrega. Vamos tentar encontrar uma pelo bairro ou usar a primeira disponível.
        const bairro =
          selected.endereco_cliente?.bairro ||
          extractBairro(selected.address || "");
        let area = areas.find(
          (a) => a.nome.toLowerCase() === bairro.toLowerCase(),
        );

        if (!area && areas.length > 0) {
          area = areas[0]; // Fallback para a primeira área
        }

        if (!area) {
          alert(
            "Nenhuma área de entrega configurada para esta loja. Crie uma área de entrega primeiro.",
          );
          return;
        }

        const response = await api.post("/entregas", {
          pedido_id: selected.id,
          entregador_id: entregadorId,
          area_entrega_id: area.id,
          status: "atribuida",
        });
        setCurrentDelivery(response.data.data || response.data);
      }
    } catch (error) {
      console.error("Error assigning courier:", error);
      alert(
        getApiErrorMessage(
          error,
          "Erro ao atribuir entregador. Verifique os dados e tente novamente.",
        ),
      );
    } finally {
      setAssigningCourier(false);
    }
  };

  const advanceStatus = async (id: string, currentStatus: string) => {
    // Map current status to next status in backend format
    const backendStatusFlow = [
      "pendente",
      "confirmado",
      "em_separacao",
      "pronto",
      "saiu_para_entrega",
      "entregue",
    ];
    const rawStatus = getBackendStatus(currentStatus);
    let idx = backendStatusFlow.indexOf(rawStatus);

    if (idx >= 0 && idx < backendStatusFlow.length - 1) {
      const nextStatus = backendStatusFlow[idx + 1];
      try {
        const order =
          selected?.id === id ? selected : orders.find((o) => o.id === id);
        const isDeliveryOrder =
          (order?.tipo_pedido || order?.type || "").toLowerCase() === "entrega";
        const nextIsDeliveryStatus =
          nextStatus === "saiu_para_entrega" || nextStatus === "entregue";

        if (isDeliveryOrder && nextIsDeliveryStatus) {
          let delivery = await getDeliveryForOrder(id);

          if (!delivery?.entregador_id) {
            setCurrentDelivery(delivery);
            alert(
              "Atribua um entregador antes de enviar este pedido para entrega.",
            );
            return;
          }

          if (delivery.status === "aguardando") {
            const response = await api.patch(
              `/entregas/${delivery.id}/atribuir-entregador`,
              {
                entregador_id: delivery.entregador_id,
              },
            );
            delivery = response.data.data || response.data;
          }

          if (
            nextStatus === "saiu_para_entrega" &&
            !["saiu_para_entrega", "entregue"].includes(delivery.status)
          ) {
            await api.patch(`/entregas/${delivery.id}/sair-para-entrega`);
          }

          if (nextStatus === "entregue" && delivery.status !== "entregue") {
            await api.patch(`/entregas/${delivery.id}/entregar`);
          }

          const updatedDelivery = await getDeliveryForOrder(id);
          setCurrentDelivery(updatedDelivery);
        } else {
          await api.patch(`/pedidos/${id}/status`, { status: nextStatus });
        }

        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o)),
        );
        if (selected?.id === id) {
          setSelected((p: any) => (p ? { ...p, status: nextStatus } : null));
        }
      } catch (error) {
        console.error("Error updating status", error);
        alert(
          getApiErrorMessage(
            error,
            "Erro ao atualizar status. Verifique se as condições para este status foram atendidas (ex: entregador atribuído).",
          ),
        );
      }
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      await api.patch(`/pedidos/${id}/cancelar`);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "cancelado" } : o)),
      );
      if (selected?.id === id)
        setSelected((p: any) => (p ? { ...p, status: "cancelado" } : null));
    } catch (error) {
      console.error("Error canceling order", error);
    }
  };

  const getStatusLabel = (status: string) => statusLabels[status] || status;

  const filtered = orders.filter((o) => {
    const customerName = (o.cliente?.nome || o.customer || "").toLowerCase();
    const orderId = (o.numero_pedido || o.id || "").toLowerCase();
    const matchSearch =
      customerName.includes(search.toLowerCase()) ||
      orderId.includes(search.toLowerCase());

    // No longer filtering by status/type in memory as we do it in API
    return matchSearch;
  });

  const assignedOrderIds = new Set(
    deliveryRecords.map((delivery) => delivery.pedido_id),
  );
  const allDeliveryOrders = filtered.filter(isDeliveryOrder);
  const bairroOptions = Array.from(
    new Set(allDeliveryOrders.map(getOrderNeighborhood)),
  ).sort((a, b) => a.localeCompare(b));
  const bairroFilteredDeliveryOrders =
    bairroFilter === "Todos"
      ? allDeliveryOrders
      : allDeliveryOrders.filter(
          (order) => getOrderNeighborhood(order) === bairroFilter,
        );
  const listDeliveryOrders = allDeliveryOrders.filter(
    (order) => !assignedOrderIds.has(order.id),
  );
  const deliveryOrders = bairroFilteredDeliveryOrders.filter(
    (order) => !assignedOrderIds.has(order.id),
  );
  const selectableDeliveryOrders =
    viewMode === "bairros" ? deliveryOrders : listDeliveryOrders;
  const selectedDeliveryOrders = selectableDeliveryOrders.filter((order) =>
    selectedOrderIds.includes(order.id),
  );
  const selectedDeliveryCount = selectedDeliveryOrders.length;
  const bairroGroups: Record<
    string,
    { orders: any[]; total: number; colorIdx: number }
  > = {};
  const bairroColorMap: Record<string, number> = {};

  deliveryOrders.forEach((o) => {
    const bairro = getOrderNeighborhood(o);
    if (!bairroGroups[bairro]) {
      bairroColorMap[bairro] =
        Object.keys(bairroColorMap).length % bairroColors.length;
      bairroGroups[bairro] = {
        orders: [],
        total: 0,
        colorIdx: bairroColorMap[bairro],
      };
    }
    bairroGroups[bairro].orders.push(o);
    bairroGroups[bairro].total += parseFloat(o.valor_total || o.total || 0);
  });

  const sortedBairros = Object.entries(bairroGroups).sort(
    (a, b) => b[1].orders.length - a[1].orders.length,
  );

  const toggleBairro = (bairro: string) => {
    setExpandedBairros((p) => ({ ...p, [bairro]: !p[bairro] }));
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  };

  const toggleSelectableOrder = (order: any, canSelect: boolean) => {
    if (!canSelect) return;
    toggleOrderSelection(order.id);
  };

  const resetDeliveryModal = () => {
    setDeliveryModalOrders(null);
    setRouteDriverId("");
    setOpenRoutes([]);
    setSelectedRouteId("");
    setConfirmStep(false);
    setDeliveryNotice("");
  };

  const openDeliveryModal = (ordersToAssign: any[]) => {
    const uniqueOrders = Array.from(
      new Map(ordersToAssign.map((order) => [order.id, order])).values(),
    );
    const activeOrders = uniqueOrders.filter(
      (order) =>
        !assignedOrderIds.has(order.id) &&
        !["entregue", "cancelado", "Entregue", "Cancelado"].includes(
          order.status,
        ),
    );
    if (activeOrders.length === 0) {
      setDeliveryNotice(
        "Nenhum pedido não atribuído disponível para adicionar.",
      );
      return;
    }

    setDeliveryNotice("");
    const firstCourier = couriers[0]?.id || "";
    setDeliveryModalOrders(activeOrders);
    setRouteDriverId(firstCourier);
    setSelectedRouteId("__new__");
    setConfirmStep(false);
    if (firstCourier) fetchOpenRoutes(firstCourier);
  };

  const openSelectedOrdersModal = () => {
    openDeliveryModal(selectedDeliveryOrders);
  };

  const fetchOpenRoutes = async (driverId: string) => {
    if (!driverId) {
      setOpenRoutes([]);
      return;
    }

    try {
      setLoadingOpenRoutes(true);
      const response = await api.get("/delivery-routes/open", {
        params: { driverId },
      });
      const routes = getApiList(response.data);
      setOpenRoutes(routes);
      setSelectedRouteId(routes[0]?.id || "__new__");
    } catch (error) {
      console.error("Erro ao carregar entregas abertas:", error);
      setOpenRoutes([]);
      setSelectedRouteId("__new__");
    } finally {
      setLoadingOpenRoutes(false);
    }
  };

  const handleDriverChange = (driverId: string) => {
    setRouteDriverId(driverId);
    setConfirmStep(false);
    fetchOpenRoutes(driverId);
  };

  const handleConfirmDeliveryAssignment = async () => {
    if (!deliveryModalOrders || !routeDriverId || !selectedRouteId) return;

    try {
      setConfirmingRoute(true);
      const orderIds = deliveryModalOrders.map((order) => order.id);
      if (selectedRouteId === "__new__") {
        const bairros = Array.from(
          new Set(deliveryModalOrders.map(getOrderNeighborhood)),
        ).join(", ");
        await api.post("/delivery-routes/draft", {
          driverId: routeDriverId,
          orderIds,
          routeName: `Entrega - ${bairros}`,
        });
      } else {
        await api.patch("/delivery-routes/assign-orders", {
          routeId: selectedRouteId,
          driverId: routeDriverId,
          orderIds,
        });
      }

      setSelectedOrderIds((current) =>
        current.filter((id) => !orderIds.includes(id)),
      );
      await fetchAuxiliaryData();
      resetDeliveryModal();
    } catch (err: any) {
      alert(
        getApiErrorMessage(
          err,
          "Erro ao atualizar a entrega. Verifique os dados e tente novamente.",
        ),
      );
    } finally {
      setConfirmingRoute(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="p-5 flex-1 h-full flex items-center justify-center">
        <div
          className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"
          style={{ borderColor: `${PRIMARY}40`, borderTopColor: PRIMARY }}
        ></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left panel: list or bairros */}
      <div
        className={`flex flex-col ${selected ? "hidden lg:flex lg:w-1/2 xl:w-3/5" : "flex-1"}`}
      >
        {/* Filters bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Filter className="w-4 h-4" style={{ color: PRIMARY }} />
              Filtros de pedidos
            </div>
            {(search ||
              statusFilter !== "Todos" ||
              typeFilter !== "Todos" ||
              bairroFilter !== "Todos") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("Todos");
                  setTypeFilter(viewMode === "bairros" ? "Entrega" : "Todos");
                  setBairroFilter("Todos");
                }}
                className="text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(220px,1fr)_auto] gap-3">
            <div className="relative">
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                Busca
              </label>
              <Search className="absolute left-3 bottom-2.5 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pedido ou cliente"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                Visualização
              </label>
              <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 w-fit">
                <button
                  onClick={() => setViewMode("lista")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={
                    viewMode === "lista"
                      ? { backgroundColor: PRIMARY, color: "white" }
                      : { color: "#6b7280" }
                  }
                >
                  <List className="w-3.5 h-3.5" /> Lista
                </button>
                <button
                  onClick={() => setViewMode("bairros")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={
                    viewMode === "bairros"
                      ? { backgroundColor: PRIMARY, color: "white" }
                      : { color: "#6b7280" }
                  }
                >
                  <MapIcon className="w-3.5 h-3.5" /> Por bairro
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-1"
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-1"
              >
                {(viewMode === "bairros"
                  ? ["Entrega"]
                  : ["Todos", "Entrega", "Retirada"]
                ).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {viewMode === "bairros" && (
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                  Bairro
                </label>
                <select
                  value={bairroFilter}
                  onChange={(e) => setBairroFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-1"
                >
                  <option value="Todos">Todos os bairros</option>
                  {bairroOptions.map((bairro) => (
                    <option key={bairro} value={bairro}>
                      {bairro}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {viewMode === "bairros" && (
            <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              A visualização por bairro mostra pedidos de entrega e também
              respeita busca, status e bairro selecionado.
            </div>
          )}
        </div>

        {/* Count bar */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          {viewMode === "lista" ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}{" "}
                encontrado{filtered.length !== 1 ? "s" : ""}
              </span>
              {selectedDeliveryCount > 0 && (
                <button
                  onClick={openSelectedOrdersModal}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Adicionar {selectedDeliveryCount} à entrega
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                Pedidos não atribuídos: {deliveryOrders.length} · Já atribuídos:{" "}
                {allDeliveryOrders.length - deliveryOrders.length}
              </span>
              {selectedDeliveryCount > 0 && (
                <button
                  onClick={openSelectedOrdersModal}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Adicionar {selectedDeliveryCount} à entrega
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── LISTA VIEW ─────────────────────────────── */}
        {viewMode === "lista" && (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filtered.map((order, orderIndex) => {
              const statusDisplay = getStatusLabel(order.status);
              const sc = statusColor[order.status] ||
                statusColor["Recebido"] || { bg: "#fffbeb", text: "#d97706" };
              const isEntrega = isDeliveryOrder(order);
              const canSelectForDelivery =
                isEntrega &&
                !assignedOrderIds.has(order.id) &&
                !["entregue", "cancelado"].includes(order.status);
              const isSelectedForDelivery = selectedOrderIds.includes(order.id);
              const rowBgClass = isSelectedForDelivery
                ? ""
                : orderIndex % 2 === 0
                  ? "bg-white"
                  : "bg-slate-50";

              return (
                <div
                  key={order.id}
                  onClick={() =>
                    toggleSelectableOrder(order, canSelectForDelivery)
                  }
                  onKeyDown={(event) => {
                    if (!canSelectForDelivery) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleOrderSelection(order.id);
                    }
                  }}
                  role={canSelectForDelivery ? "checkbox" : undefined}
                  aria-checked={
                    canSelectForDelivery ? isSelectedForDelivery : undefined
                  }
                  tabIndex={canSelectForDelivery ? 0 : undefined}
                  className={`px-4 py-3.5 transition-colors border-l-2 ${rowBgClass} ${canSelectForDelivery ? "cursor-pointer hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset" : "cursor-default"} ${isSelectedForDelivery ? "" : "border-transparent"}`}
                  style={
                    isSelectedForDelivery
                      ? {
                          backgroundColor: hexToRgba(primaryColor, 0.12),
                          borderLeftColor: primaryColor,
                          boxShadow: `inset 0 0 0 1px ${hexToRgba(primaryColor, 0.22)}`,
                        }
                      : ({
                          borderLeftColor: "transparent",
                          "--tw-ring-color": hexToRgba(primaryColor, 0.35),
                        } as any)
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">
                            {order.numero_pedido || order.id}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{ backgroundColor: sc.bg, color: sc.text }}
                          >
                            {statusDisplay}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {isEntrega ? "Entrega" : "Retirada"}
                          </span>
                          {isEntrega && assignedOrderIds.has(order.id) && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              Atribuído
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {order.cliente?.nome ||
                            order.customer ||
                            "Desconhecido"}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(
                              order.created_at || new Date(),
                            ).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {order.pagamento?.metodo ||
                              order.payment ||
                              "Pendente"}
                          </span>
                          {isEntrega && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.endereco_cliente?.bairro ||
                                extractBairro(order.address || "")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-gray-800">
                        R${" "}
                        {parseFloat(order.valor_total || order.total || 0)
                          .toFixed(2)
                          .replace(".", ",")}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOrder(order);
                        }}
                        className="mt-1 text-xs flex items-center gap-1 ml-auto hover:underline"
                        style={{ color: PRIMARY }}
                      >
                        <Eye className="w-3 h-3" /> Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="p-4 flex justify-center border-t border-gray-100">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 rounded-full border text-sm font-medium transition-colors hover:bg-gray-50 flex items-center gap-2"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}
                >
                  {loading ? (
                    <div
                      className="w-4 h-4 border-2 border-gray-200 border-t-primary rounded-full animate-spin"
                      style={{ borderTopColor: PRIMARY }}
                    ></div>
                  ) : (
                    "Carregar mais pedidos"
                  )}
                </button>
              </div>
            )}

            {filtered.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Package className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        )}

        {/* ── POR BAIRRO VIEW ────────────────────────── */}
        {viewMode === "bairros" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedBairros.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <TruckIcon className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">Nenhum pedido de entrega encontrado</p>
              </div>
            )}
            {sortedBairros.map(([bairro, group], idx) => {
              const col = bairroColors[group.colorIdx];
              const isExpanded = expandedBairros[bairro] !== false; // expanded by default
              const activeOrders = group.orders.filter(
                (o) =>
                  !["entregue", "cancelado", "Entregue", "Cancelado"].includes(
                    o.status,
                  ),
              );
              const deliveredCount = group.orders.filter((o) =>
                ["entregue", "Entregue"].includes(o.status),
              ).length;
              return (
                <div
                  key={bairro}
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: col.border, backgroundColor: col.bg }}
                >
                  {/* Bairro header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleBairro(bairro)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: col.dot }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-semibold text-sm"
                          style={{ color: col.text }}
                        >
                          {bairro}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                          style={{ backgroundColor: col.dot }}
                        >
                          {group.orders.length} pedido
                          {group.orders.length !== 1 ? "s" : ""}
                        </span>
                        {activeOrders.length > 0 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border"
                            style={{ color: col.text, borderColor: col.border }}
                          >
                            {activeOrders.length} ativo
                            {activeOrders.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {deliveredCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                            {deliveredCount} entregue
                            {deliveredCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: col.text, opacity: 0.75 }}
                      >
                        Total: R$ {group.total.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeliveryModal(activeOrders);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors hover:opacity-80"
                        style={{
                          borderColor: col.border,
                          backgroundColor: PRIMARY,
                          color: "white",
                        }}
                        title="Adicionar pedidos deste bairro a uma entrega"
                      >
                        <Navigation className="w-3 h-3" />
                        <span className="hidden sm:inline">Adicionar</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          printBairroRoute(bairro, group.orders);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors hover:opacity-80"
                        style={{
                          borderColor: col.border,
                          backgroundColor: "white",
                          color: col.text,
                        }}
                        title="Imprimir folha de rota"
                      >
                        <Printer className="w-3 h-3" />
                        <span className="hidden sm:inline">Imprimir</span>
                      </button>
                      {isExpanded ? (
                        <ChevronDown
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: col.text }}
                        />
                      ) : (
                        <ChevronRight
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: col.text }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Orders in this bairro */}
                  {isExpanded && (
                    <div
                      className="bg-white border-t divide-y"
                      style={{ borderColor: col.border }}
                    >
                      {group.orders.map((order, oIdx) => {
                        const statusDisplay = getStatusLabel(order.status);
                        const sc = statusColor[order.status] ||
                          statusColor["Recebido"] || {
                            bg: "#eee",
                            text: "#666",
                          };
                        const canSelectForDelivery =
                          !assignedOrderIds.has(order.id) &&
                          !["entregue", "cancelado"].includes(order.status);
                        const isSelectedForDelivery = selectedOrderIds.includes(
                          order.id,
                        );
                        return (
                          <div
                            key={order.id}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors border-l-2 ${canSelectForDelivery ? "hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset" : "cursor-default"} ${isSelectedForDelivery ? "" : "border-transparent"}`}
                            onClick={() =>
                              toggleSelectableOrder(order, canSelectForDelivery)
                            }
                            onKeyDown={(event) => {
                              if (!canSelectForDelivery) return;
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                toggleOrderSelection(order.id);
                              }
                            }}
                            role={canSelectForDelivery ? "checkbox" : undefined}
                            aria-checked={
                              canSelectForDelivery
                                ? isSelectedForDelivery
                                : undefined
                            }
                            tabIndex={canSelectForDelivery ? 0 : undefined}
                            style={
                              isSelectedForDelivery
                                ? {
                                    backgroundColor: hexToRgba(
                                      primaryColor,
                                      0.12,
                                    ),
                                    borderLeftColor: primaryColor,
                                    boxShadow: `inset 0 0 0 1px ${hexToRgba(primaryColor, 0.22)}`,
                                  }
                                : ({
                                    borderLeftColor: "transparent",
                                    "--tw-ring-color": hexToRgba(
                                      primaryColor,
                                      0.35,
                                    ),
                                  } as any)
                            }
                          >
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{
                                backgroundColor: col.dot,
                                fontSize: "10px",
                                fontWeight: 700,
                              }}
                            >
                              {oIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-800">
                                  {order.numero_pedido || order.id}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                  style={{
                                    backgroundColor: sc.bg,
                                    color: sc.text,
                                  }}
                                >
                                  {statusDisplay}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5 truncate">
                                {order.cliente?.nome || order.customer}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5 truncate">
                                {order.endereco_cliente?.logradouro ||
                                  order.address?.split("–")[0]?.trim()}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-400">
                                  {order.cliente?.telefone || order.phone}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  · {order.pagamento?.metodo || order.payment}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-semibold text-gray-700">
                                R${" "}
                                {parseFloat(
                                  order.valor_total || order.total || 0,
                                )
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    printComanda(order);
                                  }}
                                  className="text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
                                  title="Imprimir comanda"
                                >
                                  <Printer className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectOrder(order);
                                  }}
                                  className="text-[11px] flex items-center gap-1 hover:underline"
                                  style={{ color: PRIMARY }}
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DELIVERY ASSIGNMENT MODAL ──────────────────── */}
      {deliveryModalOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800">
                  {confirmStep
                    ? "Confirmar atualização da entrega"
                    : "Adicionar pedidos à entrega"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {deliveryModalOrders.length} pedido
                  {deliveryModalOrders.length !== 1 ? "s" : ""} não atribuído
                  {deliveryModalOrders.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={resetDeliveryModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {!confirmStep ? (
                <>
                  <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Novos pedidos
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                      {deliveryModalOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white border border-gray-100 rounded-lg px-3 py-2"
                        >
                          <div className="text-sm font-semibold text-gray-800">
                            {order.numero_pedido || order.id}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {order.cliente?.nome || order.customer || "Cliente"}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {getOrderNeighborhood(order)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Selecionar Entregador
                    </label>
                    {couriers.length === 0 ? (
                      <p className="text-sm text-red-500">
                        Nenhum entregador disponível.
                      </p>
                    ) : (
                      <select
                        value={routeDriverId}
                        onChange={(e) => handleDriverChange(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2"
                        style={{ "--tw-ring-color": PRIMARY } as any}
                      >
                        {couriers.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.nome || c.name} —{" "}
                            {c.veiculo || c.vehicle || "Veículo não informado"}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      Entregas abertas deste entregador
                    </label>
                    {loadingOpenRoutes ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando entregas...
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {openRoutes.map((route) => (
                          <button
                            key={route.id}
                            onClick={() => setSelectedRouteId(route.id)}
                            className={`w-full text-left rounded-xl border p-3 transition-colors ${selectedRouteId === route.id ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold text-sm text-gray-800">
                                  {route.routeName ||
                                    `Entrega ${route.id.slice(0, 8)}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {getDeliveryLabel(route)} ·{" "}
                                  {(route.neighborhoods || []).join(", ") ||
                                    "Sem bairro"}
                                </div>
                              </div>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                                {route.totalStops || 0} pedidos
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-500">
                              <span>{route.pendingCount || 0} pendentes</span>
                              <span>
                                {route.deliveredCount || 0} concluídos
                              </span>
                              {route.totalDistanceKm && (
                                <span>{route.totalDistanceKm} km</span>
                              )}
                              {route.totalDurationText && (
                                <span>{route.totalDurationText}</span>
                              )}
                            </div>
                          </button>
                        ))}
                        <button
                          onClick={() => setSelectedRouteId("__new__")}
                          className={`w-full text-left rounded-xl border p-3 transition-colors ${selectedRouteId === "__new__" ? "border-blue-300 bg-blue-50" : "border-dashed border-gray-300 hover:bg-gray-50"}`}
                        >
                          <div className="font-semibold text-sm text-gray-800">
                            Criar nova entrega
                          </div>
                          <div className="text-xs text-gray-500">
                            Ação explícita do balcão. A rota ainda não será
                            otimizada.
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={resetDeliveryModal}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setConfirmStep(true)}
                      disabled={!routeDriverId || !selectedRouteId}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      Continuar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Entrega destino
                      </p>
                      {selectedRouteId === "__new__" ? (
                        <div>
                          <div className="font-semibold text-gray-800">
                            Nova entrega
                          </div>
                          <div className="text-xs text-gray-500">
                            Será criada sem rota otimizada.
                          </div>
                        </div>
                      ) : (
                        (() => {
                          const route = openRoutes.find(
                            (r) => r.id === selectedRouteId,
                          );
                          return (
                            <div>
                              <div className="font-semibold text-gray-800">
                                {route?.routeName || "Entrega selecionada"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {route?.totalStops || 0} pedidos atuais ·{" "}
                                {route?.pendingCount || 0} pendentes
                              </div>
                              <div className="text-xs text-gray-500">
                                {(route?.neighborhoods || []).join(", ") ||
                                  "Sem bairro"}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                    <div className="rounded-xl border border-gray-200 p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Após confirmação
                      </p>
                      <div className="text-sm text-gray-700">
                        Total de pedidos:{" "}
                        <strong>
                          {(openRoutes.find((r) => r.id === selectedRouteId)
                            ?.totalStops || 0) + deliveryModalOrders.length}
                        </strong>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Bairros:{" "}
                        {Array.from(
                          new Set([
                            ...(openRoutes.find((r) => r.id === selectedRouteId)
                              ?.neighborhoods || []),
                            ...deliveryModalOrders.map(getOrderNeighborhood),
                          ]),
                        ).join(", ")}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Pedidos adicionados
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {deliveryModalOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-start justify-between gap-3 rounded-lg bg-white border border-gray-100 px-3 py-2"
                        >
                          <div>
                            <div className="text-sm font-semibold text-gray-800">
                              {order.numero_pedido || order.id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.cliente?.nome ||
                                order.customer ||
                                "Cliente"}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {getOrderAddress(order)} ·{" "}
                              {getOrderNeighborhood(order)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setConfirmStep(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleConfirmDeliveryAssignment}
                      disabled={confirmingRoute}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {confirmingRoute ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Salvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Confirmar
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {deliveryNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800">Atenção</h3>
              </div>
              <button
                onClick={() => setDeliveryNotice("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700">{deliveryNotice}</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setDeliveryNotice("")}
                  className="px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL PANEL ───────────────────────────────── */}
      {selected && (
        <div className="flex-1 lg:border-l border-gray-200 overflow-y-auto bg-white">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3 z-10">
            <button
              onClick={() => setSelected(null)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-gray-900 font-semibold">
                  Pedido {selected.numero_pedido || selected.id}
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: (
                      statusColor[selected.status] ||
                      statusColor["Recebido"] || { bg: "#eee", text: "#666" }
                    ).bg,
                    color: (
                      statusColor[selected.status] ||
                      statusColor["Recebido"] || { bg: "#eee", text: "#666" }
                    ).text,
                  }}
                >
                  {getStatusLabel(selected.status)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(selected.created_at || new Date()).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" },
                )}{" "}
                ·{" "}
                {(selected.tipo_pedido || selected.type || "").toUpperCase() ===
                "ENTREGA"
                  ? "Entrega"
                  : "Retirada"}
              </div>
            </div>
            <button
              onClick={() => printComanda(selected, selectedItems)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              title="Imprimir comanda"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Imprimir</span>
            </button>
            <button
              onClick={() => setSelected(null)}
              className="hidden lg:block text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Timeline */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {statusFlow.map((s, i) => {
                  const currentDisplay = getStatusLabel(selected.status);
                  const curIdx =
                    statusFlow.indexOf(currentDisplay) >= 0
                      ? statusFlow.indexOf(currentDisplay)
                      : 0;
                  const done = i <= curIdx;
                  return (
                    <div
                      key={s}
                      className="flex items-center gap-1 flex-shrink-0"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: done ? PRIMARY : "#e5e7eb",
                          }}
                        >
                          {done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        <span className="text-[9px] text-gray-500 mt-1 text-center max-w-12 leading-tight">
                          {s}
                        </span>
                      </div>
                      {i < statusFlow.length - 1 && (
                        <div
                          className="w-6 h-0.5 mb-3 flex-shrink-0"
                          style={{
                            backgroundColor: i < curIdx ? PRIMARY : "#e5e7eb",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer info */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: PRIMARY }} /> Dados do
                Cliente
              </h4>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-800">
                  {selected.cliente?.nome || selected.customer || "Sem nome"}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-3.5 h-3.5" />
                  {selected.cliente?.telefone ||
                    selected.phone ||
                    "Sem telefone"}
                </div>
                {(selected.tipo_pedido || selected.type || "").toLowerCase() ===
                  "entrega" && (
                  <>
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>
                        {selected.endereco_cliente
                          ? `${selected.endereco_cliente.logradouro}, ${selected.endereco_cliente.numero} - ${selected.endereco_cliente.complemento || ""}`
                          : selected.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}
                      >
                        Bairro:{" "}
                        {selected.endereco_cliente?.bairro ||
                          extractBairro(selected.address || "")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" style={{ color: PRIMARY }} /> Itens
                do Pedido
              </h4>
              <div className="space-y-2.5">
                {Array.isArray(selectedItems) &&
                  selectedItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm text-gray-700">
                          {item.quantity || item.qty}x{" "}
                          {item.produto?.nome || item.name}
                        </div>
                        {(item.observacoes || item.obs) && (
                          <div className="text-xs text-gray-400 italic mt-0.5">
                            {item.observacoes || item.obs}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        R${" "}
                        {(
                          (item.price_unit || item.price) *
                          (item.quantity || item.qty)
                        )
                          .toFixed(2)
                          .replace(".", ",")}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>
                    R${" "}
                    {parseFloat(selected.subtotal || selected.total || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>
                {(selected.tipo_pedido || selected.type || "").toLowerCase() ===
                "entrega" ? (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Taxa de entrega</span>
                    <span>
                      R${" "}
                      {parseFloat(selected.taxa_entrega || 6.99)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Retirada na loja</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Desconto</span>
                  <span className="text-green-600">
                    -R${" "}
                    {parseFloat(selected.desconto || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Total</span>
                  <span>
                    R${" "}
                    {parseFloat(selected.valor_total || selected.total || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: PRIMARY }} />{" "}
                Pagamento
              </h4>
              <div className="text-sm text-gray-600">
                {selected.pagamento?.metodo ||
                  selected.payment ||
                  "Não informado"}
              </div>
              <div className="mt-1 text-xs text-green-600 font-medium">
                ✓ {selected.pagamento?.status || "Confirmado"}
              </div>
            </div>

            {/* Delivery Person Assignment */}
            {(selected.tipo_pedido || selected.type || "").toLowerCase() ===
              "entrega" && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                  <TruckIcon className="w-4 h-4" style={{ color: PRIMARY }} />{" "}
                  Entregador
                </h4>

                <div className="space-y-3">
                  {currentDelivery?.entregador_id ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {couriers.find(
                              (c) => c.id === currentDelivery.entregador_id,
                            )?.nome || "Entregador atribuído"}
                          </div>
                          <div className="text-[10px] text-gray-400 capitalize">
                            Status: {currentDelivery.status.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Nenhum entregador atribuído.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {getStatusLabel(selected.status) !== "Entregue" &&
                getStatusLabel(selected.status) !== "Cancelado" && (
                  <button
                    onClick={() =>
                      advanceStatus(
                        selected.id,
                        getStatusLabel(selected.status),
                      )
                    }
                    className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {getStatusLabel(selected.status) === "Recebido" &&
                      "Confirmar Pedido"}
                    {getStatusLabel(selected.status) === "Confirmado" &&
                      "Iniciar Separação"}
                    {getStatusLabel(selected.status) === "Em Separação" &&
                      "Marcar como Pronto"}
                    {getStatusLabel(selected.status) === "Pronto" &&
                      "Enviar para Entrega"}
                    {getStatusLabel(selected.status) === "Saiu para Entrega" &&
                      "Confirmar Entrega"}
                  </button>
                )}
              <button
                onClick={() => printComanda(selected, selectedItems)}
                className="w-full py-2.5 rounded-lg text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimir Comanda
              </button>
              {getStatusLabel(selected.status) !== "Cancelado" &&
                getStatusLabel(selected.status) !== "Entregue" && (
                  <button
                    onClick={() => cancelOrder(selected.id)}
                    className="w-full py-2.5 rounded-lg text-red-600 text-sm font-medium border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Cancelar Pedido
                  </button>
                )}
              <button className="w-full py-2.5 rounded-lg text-gray-600 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Entrar em Contato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
