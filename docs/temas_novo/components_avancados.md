import React, { useState } from 'react';

const AdvancedButtonSystem = () => {
  const [activeDemo, setActiveDemo] = useState('primary');
  const [isDark, setIsDark] = useState(false);

  const buttonVariants = {
    primary: {
      base: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl',
      description: 'Ação principal - Nova Ordem, Confirmar Pagamento'
    },
    secondary: {
      base: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm hover:shadow-md',
      description: 'Ação secundária - Editar, Visualizar Detalhes'
    },
    ghost: {
      base: 'hover:bg-gray-100 text-gray-700 hover:text-gray-900',
      description: 'Ação sutil - Filtros, Opções Auxiliares'
    },
    danger: {
      base: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl',
      description: 'Ação destrutiva - Cancelar Pedido, Deletar'
    },
    success: {
      base: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl',
      description: 'Ação de sucesso - Marcar Entregue, Concluir'
    },
    warning: {
      base: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl',
      description: 'Ação de atenção - Requer Atenção, Urgente'
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const Button = ({ variant = 'primary', size = 'md', children, icon: Icon, loading = false, disabled = false, className = '' }) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/20';
    
    return (
      <button
        className={`${baseClasses} ${buttonVariants[variant].base} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        disabled={disabled || loading}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : Icon ? (
          <Icon size={16} />
        ) : null}
        {children}
      </button>
    );
  };

  // Componentes de ícones simulados
  const PlusIcon = ({ size }) => <div className={`w-${size/4} h-${size/4} bg-current rounded-sm`} style={{width: size, height: size}} />;
  const EditIcon = ({ size }) => <div className={`w-${size/4} h-${size/4} bg-current rounded-sm`} style={{width: size, height: size}} />;

  return (
    <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-all duration-300`}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sistema de Botões - Desenrola DCL
          </h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            {isDark ? '☀️ Claro' : '🌙 Escuro'}
          </button>
        </div>
        <p className="text-gray-600 text-lg">
          Hierarquia visual clara para diferentes tipos de ações no sistema
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Botões Primários */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Botões de Ação Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(buttonVariants).map(([variant, config]) => (
              <div key={variant} className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="font-semibold mb-2 capitalize">{variant}</h3>
                <p className="text-sm text-gray-500 mb-4">{config.description}</p>
                <div className="space-y-3">
                  <Button variant={variant} size="sm" icon={PlusIcon}>
                    Pequeno
                  </Button>
                  <Button variant={variant} size="md" icon={EditIcon}>
                    Médio
                  </Button>
                  <Button variant={variant} size="lg">
                    Grande
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estados dos Botões */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Estados e Variações</h2>
          <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Normal</h3>
                <Button variant="primary">Nova Ordem</Button>
                <Button variant="secondary">Editar</Button>
                <Button variant="ghost">Filtros</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Loading</h3>
                <Button variant="primary" loading>Salvando...</Button>
                <Button variant="success" loading>Processando</Button>
                <Button variant="warning" loading>Verificando</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Disabled</h3>
                <Button variant="primary" disabled>Indisponível</Button>
                <Button variant="secondary" disabled>Sem Permissão</Button>
                <Button variant="danger" disabled>Bloqueado</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Com Ícones</h3>
                <Button variant="primary" icon={PlusIcon}>Adicionar</Button>
                <Button variant="secondary" icon={EditIcon}>Editar</Button>
                <Button variant="success" icon={PlusIcon}>Concluir</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Casos de Uso Específicos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Casos de Uso no Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Kanban Actions */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">🎯 Ações do Kanban</h3>
              <div className="space-y-3">
                <Button variant="primary" size="sm" className="w-full">+ Nova Ordem</Button>
                <Button variant="success" size="sm" className="w-full">✓ Marcar Pago</Button>
                <Button variant="warning" size="sm" className="w-full">⚠️ Requer Atenção</Button>
                <Button variant="ghost" size="sm" className="w-full">👁️ Ver Detalhes</Button>
              </div>
            </div>

            {/* Card Actions */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">💳 Ações do Card</h3>
              <div className="space-y-3">
                <Button variant="secondary" size="sm" className="w-full">📝 Editar</Button>
                <Button variant="ghost" size="sm" className="w-full">📞 Contatar Lab</Button>
                <Button variant="ghost" size="sm" className="w-full">📋 Copiar Info</Button>
                <Button variant="danger" size="sm" className="w-full">❌ Cancelar</Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">📋 Ações de Formulário</h3>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1">Cancelar</Button>
                <Button variant="secondary" className="flex-1">Salvar Rascunho</Button>
                <Button variant="primary" className="flex-1">Confirmar</Button>
              </div>
            </div>

            {/* Dashboard Actions */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4">📊 Ações do Dashboard</h3>
              <div className="space-y-3">
                <Button variant="ghost" size="sm" className="w-full">📈 Exportar Relatório</Button>
                <Button variant="ghost" size="sm" className="w-full">🔄 Atualizar</Button>
                <Button variant="secondary" size="sm" className="w-full">⚙️ Configurar</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Micro-interações */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Micro-interações Avançadas</h2>
          <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="font-semibold mb-4">Hover Effects</h3>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg transform transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25">
                  Hover me
                </button>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold mb-4">Ripple Effect</h3>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg relative overflow-hidden group">
                  <span className="relative z-10">Click me</span>
                  <span className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-200"></span>
                </button>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold mb-4">Pulse Animation</h3>
                <button className="px-6 py-3 bg-red-600 text-white rounded-lg animate-pulse hover:animate-none">
                  Urgent Action
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedButtonSystem;


import React, { useState } from 'react';

const AdvancedCardSystem = () => {
  const [isDark, setIsDark] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Mock data for pedidos
  const pedidosMock = [
    {
      id: 1,
      numero: '#2024001',
      cliente: 'Maria Silva Santos',
      loja: 'DCL Matriz',
      laboratorio: 'Essilor Brasil',
      classe: 'Multifocal Premium',
      valor: 450.00,
      status: 'PRODUCAO',
      prioridade: 'ALTA',
      dias: 3,
      pagamentoAtrasado: false,
      producaoAtrasada: false,
      alertas: 1
    },
    {
      id: 2,
      numero: '#2024002',
      cliente: 'João Carlos Oliveira',
      loja: 'DCL Shopping',
      laboratorio: 'Zeiss Vision',
      classe: 'Transitions Signature',
      valor: 680.00,
      status: 'AG_PAGAMENTO',
      prioridade: 'NORMAL',
      dias: 5,
      pagamentoAtrasado: true,
      producaoAtrasada: false,
      alertas: 2
    },
    {
      id: 3,
      numero: '#2024003',
      cliente: 'Ana Paula Costa',
      loja: 'DCL Vila Madalena',
      laboratorio: 'Hoya Lens',
      classe: 'Monofocal CR-39',
      valor: 280.00,
      status: 'PRONTO',
      prioridade: 'NORMAL',
      dias: 1,
      pagamentoAtrasado: false,
      producaoAtrasada: false,
      alertas: 0
    }
  ];

  const statusConfig = {
    'REGISTRADO': { color: 'bg-gray-500', text: 'text-white', label: 'Registrado' },
    'AG_PAGAMENTO': { color: 'bg-amber-500', text: 'text-white', label: 'Aguardando Pagamento' },
    'PAGO': { color: 'bg-green-500', text: 'text-white', label: 'Pago' },
    'PRODUCAO': { color: 'bg-blue-500', text: 'text-white', label: 'Em Produção' },
    'PRONTO': { color: 'bg-purple-500', text: 'text-white', label: 'Pronto' },
    'ENVIADO': { color: 'bg-red-500', text: 'text-white', label: 'Enviado' },
    'CHEGOU': { color: 'bg-cyan-500', text: 'text-white', label: 'Chegou' },
    'ENTREGUE': { color: 'bg-green-600', text: 'text-white', label: 'Entregue' }
  };

  const prioridadeConfig = {
    'BAIXA': { color: 'border-l-gray-400', bg: 'bg-gray-50' },
    'NORMAL': { color: 'border-l-blue-400', bg: 'bg-blue-50' },
    'ALTA': { color: 'border-l-amber-400', bg: 'bg-amber-50' },
    'URGENTE': { color: 'border-l-red-500', bg: 'bg-red-50' }
  };

  const KanbanCard = ({ pedido, variant = 'default' }) => {
    const status = statusConfig[pedido.status];
    const prioridade = prioridadeConfig[pedido.prioridade];
    
    const cardVariants = {
      default: `bg-white border border-gray-200 hover:border-gray-300`,
      elevated: `bg-white shadow-lg hover:shadow-xl`,
      glass: `bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg`,
      gradient: `bg-gradient-to-br from-white to-gray-50 border border-gray-200`,
    };

    return (
      <div
        className={`
          ${cardVariants[variant]}
          ${isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}
          rounded-xl p-4 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer
          ${prioridade.color} border-l-4
          ${pedido.pagamentoAtrasado || pedido.producaoAtrasada ? 'ring-2 ring-red-200' : ''}
        `}
        onMouseEnter={() => setHoveredCard(pedido.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Header com número e status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-gray-600">
              {pedido.numero}
            </span>
            {pedido.alertas > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pedido.alertas}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.text}`}>
              {status.label}
            </span>
            {pedido.prioridade !== 'NORMAL' && (
              <span className={`px-2 py-1 rounded text-xs font-medium border ${
                pedido.prioridade === 'ALTA' ? 'border-amber-400 text-amber-700 bg-amber-50' :
                pedido.prioridade === 'URGENTE' ? 'border-red-500 text-red-700 bg-red-50' :
                'border-gray-400 text-gray-700 bg-gray-50'
              }`}>
                {pedido.prioridade}
              </span>
            )}
          </div>
        </div>

        {/* Nome do cliente */}
        <h3 className="font-semibold text-gray-900 mb-2 truncate">
          {pedido.cliente}
        </h3>

        {/* Informações principais */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-16 text-xs font-medium">Loja:</span>
            <span>{pedido.loja}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-16 text-xs font-medium">Lab:</span>
            <span className="truncate">{pedido.laboratorio}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-16 text-xs font-medium">Classe:</span>
            <span className="truncate">{pedido.classe}</span>
          </div>
        </div>

        {/* Valor e tempo */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-green-600">
            R$ {pedido.valor.toFixed(2).replace('.', ',')}
          </span>
          <span className={`text-sm font-medium ${
            pedido.dias > 7 ? 'text-red-600' : 
            pedido.dias > 4 ? 'text-amber-600' : 'text-gray-600'
          }`}>
            {pedido.dias} dias
          </span>
        </div>

        {/* Flags de atenção */}
        {(pedido.pagamentoAtrasado || pedido.producaoAtrasada) && (
          <div className="mb-3 space-y-1">
            {pedido.pagamentoAtrasado && (
              <div className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Pagamento em atraso
              </div>
            )}
            {pedido.producaoAtrasada && (
              <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                Produção atrasada
              </div>
            )}
          </div>
        )}

        {/* Ações rápidas - aparecem no hover */}
        <div className={`transition-all duration-300 ${
          hoveredCard === pedido.id ? 'opacity-100 max-h-16' : 'opacity-0 max-h-0'
        } overflow-hidden`}>
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button className="flex-1 text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all">
              Ver Detalhes
            </button>
            <button className="flex-1 text-xs px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all">
              Ação Rápida
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DashboardCard = ({ title, value, change, icon, color = "blue" }) => (
    <div className={`
      ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      rounded-xl border p-6 transition-all duration-300 hover:shadow-lg group cursor-pointer
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mt-2`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {change > 0 ? '+' : ''}{change}% vs mês anterior
            </p>
          )}
        </div>
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          bg-${color}-100 text-${color}-600 group-hover:scale-110 transition-transform
        `}>
          {icon}
        </div>
      </div>
    </div>
  );

  const GlassCard = ({ children, className = "" }) => (
    <div className={`
      bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg
      ${isDark ? 'bg-gray-800/50 border-gray-700/50' : ''}
      ${className}
    `}>
      {children}
    </div>
  );

  return (
    <div className={`min-h-screen p-8 transition-all duration-300 ${
      isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 
      'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sistema de Cards - Desenrola DCL
          </h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`px-4 py-2 rounded-lg transition-all ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white/80 hover:bg-white shadow-lg'
            }`}
          >
            {isDark ? '☀️ Claro' : '🌙 Escuro'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Cards do Kanban */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Cards do Kanban - Pedidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidosMock.map(pedido => (
              <KanbanCard key={pedido.id} pedido={pedido} variant="elevated" />
            ))}
          </div>
        </section>

        {/* Cards de Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Cards de Métricas - Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Pedidos Ativos"
              value="147"
              change={12}
              icon="📊"
              color="blue"
            />
            <DashboardCard
              title="Em Produção"
              value="58"
              change={-5}
              icon="⚙️"
              color="purple"
            />
            <DashboardCard
              title="Pagamentos Pendentes"
              value="23"
              change={-15}
              icon="💰"
              color="amber"
            />
            <DashboardCard
              title="SLA Compliance"
              value="94.5%"
              change={2}
              icon="🎯"
              color="green"
            />
          </div>
        </section>

        {/* Variações de Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Variações de Estilo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card Padrão */}
            <div className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className="font-semibold mb-2">Card Padrão</h3>
              <p className="text-sm text-gray-500">Design limpo e minimalista</p>
            </div>

            {/* Card Elevado */}
            <div className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className="font-semibold mb-2">Card Elevado</h3>
              <p className="text-sm text-gray-500">Com sombra e hover effect</p>
            </div>

            {/* Card Vidro */}
            <GlassCard className="p-6 transition-all duration-300 hover:shadow-xl">
              <h3 className="font-semibold mb-2">Card Vidro</h3>
              <p className="text-sm opacity-80">Efeito glassmorphism</p>
            </GlassCard>

            {/* Card Gradiente */}
            <div className="rounded-xl p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <h3 className="font-semibold mb-2">Card Gradiente</h3>
              <p className="text-sm opacity-90">Para destaques especiais</p>
            </div>
          </div>
        </section>

        {/* Cards Interativos */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Cards Interativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Expansível */}
            <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } hover:shadow-lg group`}>
              <div className="p-6">
                <h3 className="font-semibold mb-2">Card Expansível</h3>
                <p className="text-sm text-gray-500">Hover para ver mais detalhes</p>
              </div>
              <div className="px-6 pb-0 max-h-0 group-hover:max-h-32 group-hover:pb-6 overflow-hidden transition-all duration-300">
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm">Conteúdo adicional que aparece no hover</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver mais →
                  </button>
                </div>
              </div>
            </div>

            {/* Card com Loading */}
            <div className={`rounded-xl p-6 transition-all duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h3 className="font-semibold mb-4">Card com Loading</h3>
              <div className="space-y-3">
                <div className={`h-4 rounded animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-4 rounded animate-pulse w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-4 rounded animate-pulse w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
            </div>

            {/* Card com Ações */}
            <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } hover:shadow-lg`}>
              <div className="p-6">
                <h3 className="font-semibold mb-2">Card com Ações</h3>
                <p className="text-sm text-gray-500">Múltiplas ações disponíveis</p>
              </div>
              <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Primary
                  </button>
                  <button className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                    isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                  }`}>
                    Secondary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Micro-animações */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Micro-animações</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:-rotate-1 ${
              isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
            } shadow-lg hover:shadow-xl`}>
              <h3 className="font-semibold">Hover Scale</h3>
              <p className="text-sm text-gray-500 mt-2">Escala + rotação sutil</p>
            </div>
            
            <div className={`rounded-xl p-6 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } border-2 border-transparent hover:border-blue-500`}>
              <h3 className="font-semibold">Glow Effect</h3>
              <p className="text-sm text-gray-500 mt-2">Borda + sombra colorida</p>
            </div>
            
            <div className={`rounded-xl p-6 cursor-pointer relative overflow-hidden group ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <h3 className="font-semibold relative z-10">Gradient Overlay</h3>
              <p className="text-sm text-gray-500 mt-2 relative z-10">Overlay no hover</p>
            </div>
            
            <div className={`rounded-xl p-6 cursor-pointer transition-all duration-300 ${
              isDark ? 'bg-gray-800 hover:bg-gradient-to-br hover:from-gray-800 hover:to-blue-900' : 
              'bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50'
            } shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}>
              <h3 className="font-semibold">Background Shift</h3>
              <p className="text-sm text-gray-500 mt-2">Mudança sutil de fundo</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdvancedCardSystem;

import React, { useState, useEffect } from 'react';

const AdvancedLayoutSystem = () => {
  const [isDark, setIsDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('kanban');
  const [notifications, setNotifications] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Simulação de dados do usuário
  const currentUser = {
    name: 'Carlos Silva',
    email: 'carlos.silva@dcl.com.br',
    role: 'Operador DCL',
    loja: 'DCL Matriz',
    avatar: '👨‍💼'
  };

  // Menu principal
  const menuItems = [
    { id: 'kanban', label: 'Kanban', icon: '📋', badge: '42' },
    { id: 'pedidos', label: 'Pedidos', icon: '📦', badge: null },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null },
    { id: 'alertas', label: 'Alertas', icon: '🚨', badge: notifications },
    { id: 'configuracoes', label: 'Configurações', icon: '⚙️', badge: null },
  ];

  // Breadcrumb dinâmico
  const breadcrumbs = {
    'kanban': ['Dashboard', 'Kanban'],
    'pedidos': ['Dashboard', 'Pedidos'],
    'dashboard': ['Dashboard'],
    'alertas': ['Dashboard', 'Alertas'],
    'configuracoes': ['Dashboard', 'Configurações']
  };

  const Sidebar = () => (
    <div className={`
      ${sidebarCollapsed ? 'w-16' : 'w-64'}
      ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
      border-r transition-all duration-300 flex flex-col h-screen
    `}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            D
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="font-bold text-lg">Desenrola DCL</h1>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
              ${activeSection === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : isDark 
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
          >
            <span className="text-lg">{item.icon}</span>
            {!sidebarCollapsed && (
              <>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-semibold
                    ${activeSection === item.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-600 text-white'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.loja}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white">
              {currentUser.avatar}
            </div>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`
          absolute -right-3 top-20 w-6 h-6 rounded-full border-2 flex items-center justify-center
          ${isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}
          hover:scale-110 transition-all duration-200 shadow-lg
        `}
      >
        <span className={`text-xs transform transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}>
          ←
        </span>
      </button>
    </div>
  );

  const Header = () => (
    <header className={`
      ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      border-b px-6 py-4 flex items-center justify-between
    `}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {breadcrumbs[activeSection]?.map((crumb, index) => (
          <React.Fragment key={crumb}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <span className={`
              ${index === breadcrumbs[activeSection].length - 1 
                ? 'font-semibold text-gray-900 dark:text-white' 
                : 'text-gray-500 hover:text-gray-700 cursor-pointer'
              }
            `}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar pedidos..."
            className={`
              w-64 px-4 py-2 pl-10 rounded-lg border transition-all duration-200
              ${isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className={`
            p-2 rounded-lg transition-all duration-200 relative
            ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
          `}>
            <span className="text-xl">🔔</span>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
          `}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`
              flex items-center gap-2 p-2 rounded-lg transition-all duration-200
              ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            `}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white">
              {currentUser.avatar}
            </div>
          </button>

          {/* User Dropdown */}
          {userMenuOpen && (
            <div className={`
              absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-50
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg">
                    {currentUser.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{currentUser.name}</p>
                    <p className="text-sm text-gray-500">{currentUser.role}</p>
                    <p className="text-xs text-gray-400">{currentUser.loja}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button className={`
                  w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                  ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                `}>
                  👤 Meu Perfil
                </button>
                <button className={`
                  w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                  ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                `}>
                  ⚙️ Configurações
                </button>
                <button className={`
                  w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                  ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                `}>
                  🌙 Aparência
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button className={`
                  w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-red-600
                  ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                `}>
                  🚪 Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const QuickActions = () => (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3">
      {/* Nova Ordem - Ação Principal */}
      <button className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center group">
        <span className="text-2xl">+</span>
        <div className="absolute right-16 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Nova Ordem
        </div>
      </button>

      {/* Ações Secundárias */}
      <div className="flex flex-col gap-2">
        <button className={`
          w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group hover:scale-110
          ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-700'}
        `}>
          <span className="text-lg">🔍</span>
          <div className="absolute right-14 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Busca Rápida
          </div>
        </button>

        <button className={`
          w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group hover:scale-110
          ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-700'}
        `}>
          <span className="text-lg">📊</span>
          <div className="absolute right-14 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Relatórios
          </div>
        </button>
      </div>
    </div>
  );

  const MainContent = () => {
    const contentMap = {
      'kanban': (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Kanban Board</h1>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                + Nova Ordem
              </button>
              <button className={`px-4 py-2 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
              } border`}>
                Filtros
              </button>
            </div>
          </div>
          
          {/* Kanban Columns Preview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Registrado', 'Aguardando Pag.', 'Em Produção', 'Pronto'].map(status => (
              <div key={status} className={`
                rounded-xl p-4 min-h-[400px]
                ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
              `}>
                <h3 className="font-semibold mb-4 flex items-center justify-between">
                  {status}
                  <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
                    {Math.floor(Math.random() * 20) + 1}
                  </span>
                </h3>
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className={`
                      p-4 rounded-lg border-l-4 border-blue-500 cursor-pointer transition-all hover:scale-105
                      ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:shadow-lg'}
                    `}>
                      <p className="font-medium">Pedido #{2024000 + i}</p>
                      <p className="text-sm text-gray-500">Cliente {i}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-green-600 font-semibold">R$ {(Math.random() * 500 + 200).toFixed(0)}</span>
                        <span className="text-xs text-gray-400">{i} dias</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      'dashboard': (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
          
          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Pedidos Ativos', value: '147', change: '+12%', color: 'blue' },
              { label: 'SLA Compliance', value: '94.5%', change: '+2.1%', color: 'green' },
              { label: 'Receita do Mês', value: 'R$ 45.2K', change: '+8.3%', color: 'purple' },
              { label: 'Alertas Ativos', value: '23', change: '-15%', color: 'red' }
            ].map(metric => (
              <div key={metric.label} className={`
                p-6 rounded-xl transition-all hover:scale-105
                ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg
              `}>
                <p className="text-sm text-gray-500 mb-2">{metric.label}</p>
                <p className="text-3xl font-bold mb-1">{metric.value}</p>
                <p className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change} vs mês anterior
                </p>
              </div>
            ))}
          </div>

          {/* Gráfico Placeholder */}
          <div className={`
            p-8 rounded-xl h-64 flex items-center justify-center
            ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg
          `}>
            <div className="text-center">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-lg font-semibold">Gráfico de Performance</p>
              <p className="text-gray-500">SLA Compliance vs Volume de Pedidos</p>
            </div>
          </div>
        </div>
      ),
      'alertas': (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Central de Alertas</h1>
          
          <div className="space-y-4">
            {[
              { type: 'error', title: 'Pagamento Vencido', desc: 'Pedido #2024045 - 3 dias em atraso', time: '2h atrás' },
              { type: 'warning', title: 'SLA em Risco', desc: 'Pedido #2024044 - vence em 4 horas', time: '5h atrás' },
              { type: 'info', title: 'Produção Iniciada', desc: 'Pedido #2024043 - Essilor Brasil', time: '1 dia atrás' }
            ].map((alert, i) => (
              <div key={i} className={`
                p-4 rounded-lg border-l-4 transition-all hover:shadow-lg
                ${alert.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }
                ${isDark ? 'bg-opacity-20' : ''}
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{alert.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alert.desc}</p>
                  </div>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      'pedidos': (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Gestão de Pedidos</h1>
          
          {/* Tabela de Pedidos */}
          <div className={`
            rounded-xl overflow-hidden shadow-lg
            ${isDark ? 'bg-gray-800' : 'bg-white'}
          `}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[1,2,3,4,5].map(i => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm">#{2024000 + i}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">Cliente {i}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Em Produção
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          R$ {(Math.random() * 500 + 200).toFixed(0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
      'configuracoes': (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Configurações</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-lg font-semibold mb-4">🏪 Lojas</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Gerenciar lojas e filiais</p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Configurar Lojas
              </button>
            </div>
            
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-lg font-semibold mb-4">🧪 Laboratórios</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Configurar SLA e contatos</p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Configurar Labs
              </button>
            </div>
            
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-lg font-semibold mb-4">👥 Usuários</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Gerenciar permissões de acesso</p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Gerenciar Usuários
              </button>
            </div>
            
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-lg font-semibold mb-4">🚨 Alertas</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Configurar notificações automáticas</p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Configurar Alertas
              </button>
            </div>
          </div>
        </div>
      )
    };

    return contentMap[activeSection] || contentMap['kanban'];
  };

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'} transition-all duration-300`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header />
          
          {/* Content */}
          <main className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
              <MainContent />
            </div>
          </main>
        </div>
      </div>

      {/* Quick Actions FAB */}
      <QuickActions />

      {/* Loading Overlay (exemplo) */}
      {false && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg">Carregando...</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-40">
        {false && (
          <div className={`
            max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-0
            ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
          `}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                ✓
              </div>
              <div>
                <p className="font-semibold">Sucesso!</p>
                <p className="text-sm text-gray-500">Pedido criado com sucesso</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation (quando necessário) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2">
        <div className="flex justify-around">
          {menuItems.slice(0, 4).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1
                ${activeSection === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedLayoutSystem;

