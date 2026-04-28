export const orders = [
  { id: '#00481', customer: 'Ana Paula Mendes', total: 187.50, time: '08:14', type: 'Entrega', payment: 'Cartão de Crédito', status: 'Em Separação', phone: '(11) 99234-5678', address: 'Rua das Flores, 142 – Jardim América' },
  { id: '#00482', customer: 'Carlos Eduardo Lima', total: 312.80, time: '08:32', type: 'Retirada', payment: 'PIX', status: 'Confirmado', phone: '(11) 98765-4321', address: 'Av. Paulista, 900 – Bela Vista' },
  { id: '#00483', customer: 'Fernanda Rocha', total: 89.90, time: '09:01', type: 'Entrega', payment: 'Cartão de Débito', status: 'Recebido', phone: '(11) 97654-3210', address: 'Rua Vergueiro, 55 – Liberdade' },
  { id: '#00484', customer: 'Marcos Vinicius Santos', total: 456.20, time: '09:15', type: 'Entrega', payment: 'PIX', status: 'Pronto', phone: '(11) 96543-2109', address: 'Rua Augusta, 220 – Consolação' },
  { id: '#00485', customer: 'Juliana Costa', total: 134.70, time: '09:30', type: 'Entrega', payment: 'Cartão de Crédito', status: 'Saiu para Entrega', phone: '(11) 95432-1098', address: 'Av. Rebouças, 1440 – Pinheiros' },
  { id: '#00486', customer: 'Roberto Alves', total: 67.40, time: '09:45', type: 'Retirada', payment: 'Dinheiro', status: 'Entregue', phone: '(11) 94321-0987', address: 'Rua Oscar Freire, 77 – Jardins' },
  { id: '#00487', customer: 'Patricia Oliveira', total: 223.10, time: '10:00', type: 'Entrega', payment: 'Cartão de Crédito', status: 'Cancelado', phone: '(11) 93210-9876', address: 'Av. Faria Lima, 3000 – Itaim Bibi' },
  { id: '#00488', customer: 'Diego Ferreira', total: 392.60, time: '10:15', type: 'Entrega', payment: 'PIX', status: 'Em Separação', phone: '(11) 92109-8765', address: 'Rua Teodoro Sampaio, 800 – Pinheiros' },
  { id: '#00489', customer: 'Camila Sousa', total: 155.30, time: '10:40', type: 'Entrega', payment: 'Cartão de Débito', status: 'Confirmado', phone: '(11) 91098-7654', address: 'Rua Haddock Lobo, 450 – Cerqueira César' },
  { id: '#00490', customer: 'Lucas Pereira', total: 278.90, time: '11:05', type: 'Retirada', payment: 'PIX', status: 'Recebido', phone: '(11) 90987-6543', address: 'Rua da Consolação, 2100 – Consolação' },
  { id: '#00491', customer: 'Renata Almeida', total: 143.60, time: '11:20', type: 'Entrega', payment: 'Cartão de Crédito', status: 'Confirmado', phone: '(11) 99111-2233', address: 'Rua das Acácias, 67 – Jardim América' },
  { id: '#00492', customer: 'Thiago Barbosa', total: 310.40, time: '11:35', type: 'Entrega', payment: 'PIX', status: 'Em Separação', phone: '(11) 98222-3344', address: 'Rua Maria Antônia, 45 – Consolação' },
  { id: '#00493', customer: 'Isabela Martins', total: 78.20, time: '11:50', type: 'Entrega', payment: 'Dinheiro', status: 'Pronto', phone: '(11) 97333-4455', address: 'Rua Galvão Bueno, 312 – Liberdade' },
  { id: '#00494', customer: 'Eduardo Nunes', total: 225.00, time: '12:10', type: 'Entrega', payment: 'Cartão de Débito', status: 'Recebido', phone: '(11) 96444-5566', address: 'Rua Harmonia, 820 – Vila Madalena' },
  { id: '#00495', customer: 'Beatriz Cunha', total: 187.90, time: '12:25', type: 'Entrega', payment: 'PIX', status: 'Saiu para Entrega', phone: '(11) 95555-6677', address: 'Rua Mourato Coelho, 340 – Vila Madalena' },
  { id: '#00496', customer: 'Rodrigo Fonseca', total: 99.50, time: '12:40', type: 'Entrega', payment: 'Cartão de Crédito', status: 'Confirmado', phone: '(11) 94666-7788', address: 'Rua Girassol, 150 – Vila Madalena' },
  { id: '#00497', customer: 'Larissa Teixeira', total: 432.10, time: '13:00', type: 'Entrega', payment: 'PIX', status: 'Pronto', phone: '(11) 93777-8899', address: 'Rua Cerqueira César, 80 – Cerqueira César' },
];

export const products = [
  { id: 1, name: 'Arroz Integral Camil 1kg', category: 'Mercearia', price: 8.49, promoPrice: 6.99, stock: 120, status: 'Ativo', brand: 'Camil', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop' },
  { id: 2, name: 'Feijão Carioca Kicaldo 1kg', category: 'Mercearia', price: 7.90, promoPrice: null, stock: 85, status: 'Ativo', brand: 'Kicaldo', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=80&h=80&fit=crop' },
  { id: 3, name: 'Leite Integral Italac 1L', category: 'Laticínios', price: 4.89, promoPrice: 3.99, stock: 200, status: 'Ativo', brand: 'Italac', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&h=80&fit=crop' },
  { id: 4, name: 'Café Pilão Torrado 500g', category: 'Bebidas', price: 12.90, promoPrice: 10.49, stock: 0, status: 'Inativo', brand: 'Pilão', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&h=80&fit=crop' },
  { id: 5, name: 'Macarrão Barilla Penne 500g', category: 'Mercearia', price: 6.50, promoPrice: null, stock: 67, status: 'Ativo', brand: 'Barilla', image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=80&h=80&fit=crop' },
  { id: 6, name: 'Óleo de Soja Liza 900ml', category: 'Mercearia', price: 9.90, promoPrice: 8.49, stock: 43, status: 'Ativo', brand: 'Liza', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&h=80&fit=crop' },
  { id: 7, name: 'Iogurte Nestlé Morango 170g', category: 'Laticínios', price: 3.20, promoPrice: null, stock: 150, status: 'Ativo', brand: 'Nestlé', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=80&h=80&fit=crop' },
  { id: 8, name: 'Refrigerante Coca-Cola 2L', category: 'Bebidas', price: 9.50, promoPrice: 7.99, stock: 210, status: 'Ativo', brand: 'Coca-Cola', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=80&h=80&fit=crop' },
];

export const categories = [
  { id: 1, name: 'Mercearia', icon: '🛒', count: 342, status: 'Ativo' },
  { id: 2, name: 'Laticínios', icon: '🥛', count: 87, status: 'Ativo' },
  { id: 3, name: 'Bebidas', icon: '🥤', count: 124, status: 'Ativo' },
  { id: 4, name: 'Hortifruti', icon: '🥦', count: 95, status: 'Ativo' },
  { id: 5, name: 'Carnes', icon: '🥩', count: 61, status: 'Ativo' },
  { id: 6, name: 'Padaria', icon: '🍞', count: 38, status: 'Ativo' },
  { id: 7, name: 'Limpeza', icon: '🧹', count: 112, status: 'Ativo' },
  { id: 8, name: 'Higiene', icon: '🧴', count: 98, status: 'Ativo' },
  { id: 9, name: 'Congelados', icon: '❄️', count: 54, status: 'Inativo' },
  { id: 10, name: 'Petshop', icon: '🐾', count: 29, status: 'Ativo' },
];

export const customers = [
  { id: 1, name: 'Ana Paula Mendes', phone: '(11) 99234-5678', email: 'ana.paula@email.com', orders: 24, total: 3420.50, lastOrder: '16/04/2026', status: 'Ativo' },
  { id: 2, name: 'Carlos Eduardo Lima', phone: '(11) 98765-4321', email: 'carlos.lima@email.com', orders: 8, total: 1120.80, lastOrder: '15/04/2026', status: 'Ativo' },
  { id: 3, name: 'Fernanda Rocha', phone: '(11) 97654-3210', email: 'fernanda.r@email.com', orders: 42, total: 7890.30, lastOrder: '16/04/2026', status: 'Ativo' },
  { id: 4, name: 'Marcos Vinicius Santos', phone: '(11) 96543-2109', email: 'marcos.v@email.com', orders: 3, total: 456.20, lastOrder: '12/04/2026', status: 'Inativo' },
  { id: 5, name: 'Juliana Costa', phone: '(11) 95432-1098', email: 'juliana.c@email.com', orders: 18, total: 2340.70, lastOrder: '14/04/2026', status: 'Ativo' },
  { id: 6, name: 'Roberto Alves', phone: '(11) 94321-0987', email: 'roberto.a@email.com', orders: 1, total: 67.40, lastOrder: '16/04/2026', status: 'Ativo' },
];

export const deliveries = [
  { id: '#00481', customer: 'Ana Paula Mendes', courier: 'João Silva', address: 'Rua das Flores, 142', time: '10:30', status: 'Em Rota', eta: '10:45' },
  { id: '#00485', customer: 'Juliana Costa', courier: 'Pedro Santos', address: 'Av. Rebouças, 1440', time: '11:00', status: 'Em Rota', eta: '11:20' },
  { id: '#00484', customer: 'Marcos Vinicius', courier: 'Carlos Lima', address: 'Rua Augusta, 220', time: '09:45', status: 'Pronto para Saída', eta: '—' },
  { id: '#00488', customer: 'Diego Ferreira', courier: '—', address: 'Rua Teodoro Sampaio, 800', time: '—', status: 'Em Preparo', eta: '—' },
  { id: '#00486', customer: 'Roberto Alves', courier: 'Marcos Rocha', address: 'Rua Oscar Freire, 77', time: '09:30', status: 'Entregue', eta: '09:55' },
];

export const coupons = [
  { id: 1, name: 'BEMVINDO10', type: 'Percentual', value: '10%', expires: '30/04/2026', maxUse: 500, used: 127, status: 'Ativo' },
  { id: 2, name: 'FRETE0', type: 'Frete Grátis', value: '—', expires: '20/04/2026', maxUse: 200, used: 189, status: 'Ativo' },
  { id: 3, name: 'DESC15', type: 'Fixo', value: 'R$ 15,00', expires: '15/04/2026', maxUse: 100, used: 100, status: 'Encerrado' },
  { id: 4, name: 'VIP20', type: 'Percentual', value: '20%', expires: '01/05/2026', maxUse: 50, used: 8, status: 'Ativo' },
  { id: 5, name: 'SABADO5', type: 'Fixo', value: 'R$ 5,00', expires: '30/04/2026', maxUse: 1000, used: 342, status: 'Ativo' },
];

export const payments = [
  { id: '#00481', customer: 'Ana Paula Mendes', value: 187.50, method: 'Cartão de Crédito', status: 'Pago', date: '16/04/2026 08:14' },
  { id: '#00482', customer: 'Carlos Eduardo Lima', value: 312.80, method: 'PIX', status: 'Pago', date: '16/04/2026 08:32' },
  { id: '#00483', customer: 'Fernanda Rocha', value: 89.90, method: 'Cartão de Débito', status: 'Pendente', date: '16/04/2026 09:01' },
  { id: '#00484', customer: 'Marcos Vinicius Santos', value: 456.20, method: 'PIX', status: 'Pago', date: '16/04/2026 09:15' },
  { id: '#00485', customer: 'Juliana Costa', value: 134.70, method: 'Cartão de Crédito', status: 'Pago', date: '16/04/2026 09:30' },
  { id: '#00487', customer: 'Patricia Oliveira', value: 223.10, method: 'Cartão de Crédito', status: 'Reembolsado', date: '16/04/2026 10:00' },
  { id: '#00488', customer: 'Diego Ferreira', value: 392.60, method: 'PIX', status: 'Pago', date: '16/04/2026 10:15' },
];

export const internalUsers = [
  { id: 1, name: 'Admin Master', email: 'admin@saojorgesuper.com.br', role: 'Administrador', status: 'Ativo', lastLogin: '16/04/2026 07:30' },
  { id: 2, name: 'Gerente Operacional', email: 'gerente@saojorgesuper.com.br', role: 'Gerente', status: 'Ativo', lastLogin: '16/04/2026 08:00' },
  { id: 3, name: 'Operador João', email: 'joao@saojorgesuper.com.br', role: 'Operador de Pedidos', status: 'Ativo', lastLogin: '16/04/2026 08:05' },
  { id: 4, name: 'Estoque Maria', email: 'maria@saojorgesuper.com.br', role: 'Estoque', status: 'Ativo', lastLogin: '15/04/2026 18:45' },
  { id: 5, name: 'Marketing Ana', email: 'ana@saojorgesuper.com.br', role: 'Marketing', status: 'Inativo', lastLogin: '10/04/2026 09:00' },
];

export const promotions = [
  { id: 1, name: 'Semana do Arroz', discount: '15%', products: 8, start: '15/04/2026', end: '22/04/2026', status: 'Ativo' },
  { id: 2, name: 'Feirão de Bebidas', discount: '20%', products: 24, start: '10/04/2026', end: '20/04/2026', status: 'Ativo' },
  { id: 3, name: 'Hortifruti em Oferta', discount: '10%', products: 15, start: '01/04/2026', end: '10/04/2026', status: 'Encerrado' },
  { id: 4, name: 'Limpeza Total', discount: '25%', products: 32, start: '20/04/2026', end: '30/04/2026', status: 'Agendado' },
  { id: 5, name: 'Queijo & Frios', discount: '12%', products: 11, start: '16/04/2026', end: '19/04/2026', status: 'Ativo' },
];

export const banners = [
  { id: 1, title: 'Semana do Arroz', subtitle: 'Até 15% OFF em grãos selecionados', link: '/categoria/mercearia', start: '15/04/2026', end: '22/04/2026', order: 1, status: 'Ativo' },
  { id: 2, title: 'Feirão de Bebidas', subtitle: 'Refrigerantes, sucos e muito mais', link: '/categoria/bebidas', start: '10/04/2026', end: '20/04/2026', order: 2, status: 'Ativo' },
  { id: 3, title: 'Entrega Grátis', subtitle: 'Pedidos acima de R$ 150', link: '/ofertas', start: '01/04/2026', end: '30/04/2026', order: 3, status: 'Ativo' },
  { id: 4, title: 'Limpeza Total', subtitle: 'Em breve: até 25% OFF', link: '/categoria/limpeza', start: '20/04/2026', end: '30/04/2026', order: 4, status: 'Agendado' },
];

export const notifications = [
  { id: 1, type: 'order', title: 'Novo pedido recebido', desc: 'Pedido #00490 de Lucas Pereira – R$ 278,90', time: 'Há 5 min', read: false },
  { id: 2, type: 'stock', title: 'Produto sem estoque', desc: 'Café Pilão Torrado 500g está com estoque zerado', time: 'Há 12 min', read: false },
  { id: 3, type: 'warning', title: 'Pedido atrasado', desc: 'Pedido #00481 está em rota há mais de 40 min', time: 'Há 18 min', read: false },
  { id: 4, type: 'payment', title: 'Falha em pagamento', desc: 'Pagamento do pedido #00487 foi reembolsado', time: 'Há 30 min', read: true },
  { id: 5, type: 'promo', title: 'Campanha encerrando', desc: 'Feirão de Bebidas encerra em 4 dias', time: 'Há 1h', read: true },
  { id: 6, type: 'coupon', title: 'Cupom quase esgotado', desc: 'Cupom FRETE0 usado 189/200 vezes', time: 'Há 2h', read: true },
  { id: 7, type: 'order', title: 'Novo pedido recebido', desc: 'Pedido #00489 de Camila Sousa – R$ 155,30', time: 'Há 2h', read: true },
];

export const salesData = [
  { day: 'Seg', vendas: 4200, pedidos: 32 },
  { day: 'Ter', vendas: 5800, pedidos: 41 },
  { day: 'Qua', vendas: 3900, pedidos: 28 },
  { day: 'Qui', vendas: 7200, pedidos: 56 },
  { day: 'Sex', vendas: 9100, pedidos: 74 },
  { day: 'Sáb', vendas: 11500, pedidos: 98 },
  { day: 'Dom', vendas: 8400, pedidos: 67 },
];

export const statusData = [
  { name: 'Entregue', value: 67, color: '#16a34a' },
  { name: 'Em Separação', value: 14, color: '#2563eb' },
  { name: 'Em Rota', value: 9, color: '#7c3aed' },
  { name: 'Cancelado', value: 6, color: '#dc2626' },
  { name: 'Recebido', value: 4, color: '#d97706' },
];

export const topProducts = [
  { name: 'Arroz Camil 1kg', qty: 312, revenue: 2647.88 },
  { name: 'Leite Italac 1L', qty: 287, revenue: 1403.13 },
  { name: 'Coca-Cola 2L', qty: 241, revenue: 2291.50 },
  { name: 'Café Pilão 500g', qty: 198, revenue: 2554.20 },
  { name: 'Feijão Kicaldo 1kg', qty: 176, revenue: 1390.40 },
];

export const categoryRevenueData = [
  { name: 'Mercearia', value: 38 },
  { name: 'Bebidas', value: 22 },
  { name: 'Laticínios', value: 15 },
  { name: 'Hortifruti', value: 12 },
  { name: 'Carnes', value: 8 },
  { name: 'Outros', value: 5 },
];