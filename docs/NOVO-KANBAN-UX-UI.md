# 🎨 UX/UI Novo Kanban - Desenrola DCL

## Estrutura Visual

### Layout: 3 Colunas Kanban

```
┌────────────────────────────────────────────────────────────────────────┐
│  RASCUNHO (12)      │   PRODUÇÃO (45)    │   ENTREGUE (8)             │
│  ────────────────   │   ──────────────   │   ─────────────            │
│                     │                    │                             │
│  ┌───────────────┐  │  ┌───────────────┐ │  ┌───────────────┐         │
│  │ OS #1234      │  │  │ OS #1235      │ │  │ OS #1240      │         │
│  │ Cliente: João │  │  │ Cliente: Maria│ │  │ Cliente: Ana  │         │
│  │ Loja: Matrix  │  │  │ Loja: Central │ │  │ Loja: Matrix  │         │
│  │               │  │  │ Lab: Essilor  │ │  │ Lab: Zeiss    │         │
│  │ 🔴 SEM LENTE  │  │  │ ⏰ 3 dias     │ │  │ ✅ PRONTO     │         │
│  │               │  │  │               │ │  │               │         │
│  │ [Escolher]    │  │  │ Progresso 60% │ │  │ [Finalizar]   │         │
│  └───────────────┘  │  └───────────────┘ │  └───────────────┘         │
│                     │                    │                             │
│  ┌───────────────┐  │  ┌───────────────┐ │  ┌───────────────┐         │
│  │ OS #1236      │  │  │ OS #1237      │ │  │ OS #1241      │         │
│  │ 📱 DO PDV     │  │  │ 🟢 NO PRAZO   │ │  │               │         │
│  └───────────────┘  │  └───────────────┘ │  └───────────────┘         │
│                     │                    │                             │
└────────────────────────────────────────────────────────────────────────┘
```

## Componentes do Card

### Card Completo

```tsx
<Card className="group hover:shadow-xl transition-all duration-300">
  {/* Header com Gradiente do Lab */}
  <div
    className={cn(
      "h-2 rounded-t-lg",
      pedido.laboratorio_nome
        ? LAB_GRADIENTS[pedido.laboratorio_nome]
        : "bg-gray-300"
    )}
  />

  {/* Corpo do Card */}
  <CardContent className="p-4 space-y-3">
    {/* Linha 1: OS + Origem */}
    <div className="flex items-center justify-between">
      <span className="font-mono font-bold text-lg">
        OS #{pedido.os || pedido.numero_os}
      </span>
      {pedido.venda_id && (
        <Badge variant="outline" className="border-purple-500 text-purple-700">
          📱 PDV
        </Badge>
      )}
    </div>

    {/* Linha 2: Cliente */}
    <div className="text-sm text-gray-600 truncate">
      👤 {pedido.nome_cliente || "Sem cliente"}
    </div>

    {/* Linha 3: Loja */}
    <div className="flex items-center gap-2 text-sm">
      <Building className="h-4 w-4 text-gray-400" />
      <span className="truncate">{pedido.loja_nome}</span>
    </div>

    {/* Status-Specific Content */}
    {status === "RASCUNHO" && (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 text-xs">
          Aguardando escolha de lente
        </AlertDescription>
      </Alert>
    )}

    {status === "PRODUCAO" && (
      <>
        {/* Laboratório */}
        <div className="flex items-center gap-2 text-sm">
          <Factory className="h-4 w-4 text-orange-500" />
          <span className="font-medium">{pedido.laboratorio_nome}</span>
        </div>

        {/* Urgência */}
        <UrgenciaBadge
          dataPrometida={pedido.data_prometida}
          dataEntregue={pedido.data_entregue}
        />

        {/* Progresso */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progresso</span>
            <span>{progresso}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </>
    )}

    {status === "ENTREGUE" && (
      <>
        {/* Lab que fabricou */}
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>{pedido.laboratorio_nome}</span>
        </div>

        {/* Data de chegada */}
        <div className="text-xs text-gray-500">
          Chegou em {formatDate(pedido.data_chegou_loja)}
        </div>

        {/* Alerta: quanto tempo está esperando */}
        {diasEsperando > 3 && (
          <Badge className="bg-yellow-100 text-yellow-800">
            ⚠️ {diasEsperando} dias aguardando
          </Badge>
        )}
      </>
    )}

    {/* Divider */}
    <Separator />

    {/* Quick Actions */}
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => abrirDetalhes(pedido.id)}
        className="flex-1"
      >
        <Eye className="h-4 w-4 mr-1" />
        Ver
      </Button>

      {status === "RASCUNHO" && (
        <Button
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={() => escolherLente(pedido.id)}
        >
          <Package className="h-4 w-4 mr-1" />
          Escolher Lente
        </Button>
      )}

      {status === "PRODUCAO" && (
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => avancarStatus(pedido.id, "ENTREGUE")}
        >
          <ArrowRight className="h-4 w-4 mr-1" />
          Chegou
        </Button>
      )}

      {status === "ENTREGUE" && (
        <Button
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={() => finalizarPedido(pedido.id)}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Finalizar
        </Button>
      )}
    </div>
  </CardContent>
</Card>
```

## Badge de Urgência

```tsx
type NivelUrgencia = "CRITICO" | "URGENTE" | "NORMAL" | "OK";

function UrgenciaBadge({ dataPrometida, dataEntregue }: Props) {
  const hoje = new Date();
  const prometida = new Date(dataPrometida);
  const diasRestantes = Math.ceil((prometida - hoje) / (1000 * 60 * 60 * 24));

  let nivel: NivelUrgencia;
  let className: string;
  let icon: ReactNode;

  if (dataEntregue) {
    // Já entregue
    if (dataEntregue <= dataPrometida) {
      nivel = "OK";
      className = "bg-green-100 text-green-800";
      icon = <CheckCircle className="h-3 w-3" />;
    } else {
      nivel = "CRITICO";
      className = "bg-red-100 text-red-800";
      icon = <XCircle className="h-3 w-3" />;
    }
  } else {
    // Ainda não entregue
    if (diasRestantes < 0) {
      nivel = "CRITICO";
      className = "bg-red-600 text-white animate-pulse";
      icon = <AlertTriangle className="h-3 w-3" />;
    } else if (diasRestantes <= 2) {
      nivel = "URGENTE";
      className = "bg-orange-500 text-white";
      icon = <Clock className="h-3 w-3" />;
    } else if (diasRestantes <= 5) {
      nivel = "NORMAL";
      className = "bg-yellow-100 text-yellow-800";
      icon = <Clock className="h-3 w-3" />;
    } else {
      nivel = "OK";
      className = "bg-green-100 text-green-800";
      icon = <CheckCircle className="h-3 w-3" />;
    }
  }

  return (
    <Badge className={cn("text-xs flex items-center gap-1", className)}>
      {icon}
      {diasRestantes >= 0
        ? `${diasRestantes} dias`
        : `${Math.abs(diasRestantes)} dias atrasado`}
    </Badge>
  );
}
```

## Filtros Avançados

```tsx
<div className="bg-white border rounded-lg p-4 space-y-4">
  {/* Busca */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    <Input
      placeholder="Buscar OS, cliente, lente..."
      className="pl-10"
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
    />
  </div>

  {/* Filtros em Grid */}
  <div className="grid grid-cols-2 gap-4">
    {/* Loja (Multi-select) */}
    <div>
      <Label className="text-sm mb-2">Loja</Label>
      <MultiSelect
        options={lojas}
        selected={lojasSelecionadas}
        onChange={setLojasSelecionadas}
        placeholder="Todas as lojas"
      />
    </div>

    {/* Laboratório (Multi-select) */}
    <div>
      <Label className="text-sm mb-2">Laboratório</Label>
      <MultiSelect
        options={laboratorios}
        selected={labsSelecionados}
        onChange={setLabsSelecionados}
        placeholder="Todos os labs"
      />
    </div>

    {/* Urgência */}
    <div>
      <Label className="text-sm mb-2">Urgência</Label>
      <Select value={urgenciaFiltro} onValueChange={setUrgenciaFiltro}>
        <SelectTrigger>
          <SelectValue placeholder="Todas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="CRITICO">🔴 Crítico</SelectItem>
          <SelectItem value="URGENTE">🟠 Urgente</SelectItem>
          <SelectItem value="NORMAL">🟡 Normal</SelectItem>
          <SelectItem value="OK">🟢 OK</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Período */}
    <div>
      <Label className="text-sm mb-2">Período</Label>
      <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
        <SelectTrigger>
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="hoje">Hoje</SelectItem>
          <SelectItem value="semana">Esta semana</SelectItem>
          <SelectItem value="mes">Este mês</SelectItem>
          <SelectItem value="custom">Personalizado...</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Origem (PDV vs Manual) */}
  <div className="flex items-center gap-4">
    <Label className="text-sm">Origem</Label>
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={origemFiltro === "all" ? "default" : "outline"}
        onClick={() => setOrigemFiltro("all")}
      >
        Todos
      </Button>
      <Button
        size="sm"
        variant={origemFiltro === "pdv" ? "default" : "outline"}
        onClick={() => setOrigemFiltro("pdv")}
      >
        📱 PDV
      </Button>
      <Button
        size="sm"
        variant={origemFiltro === "manual" ? "default" : "outline"}
        onClick={() => setOrigemFiltro("manual")}
      >
        ✍️ Manual
      </Button>
    </div>
  </div>

  {/* Contador de Resultados */}
  <div className="text-sm text-gray-600 text-center">
    {pedidosFiltrados.length}{" "}
    {pedidosFiltrados.length === 1
      ? "pedido encontrado"
      : "pedidos encontrados"}
  </div>
</div>
```

## Gradientes por Laboratório

```typescript
const LAB_GRADIENTS: Record<string, string> = {
  Essilor: "bg-gradient-to-r from-blue-500 to-cyan-500",
  Zeiss: "bg-gradient-to-r from-purple-500 to-pink-500",
  Hoya: "bg-gradient-to-r from-green-500 to-emerald-500",
  Kodak: "bg-gradient-to-r from-yellow-500 to-orange-500",
  Rodenstock: "bg-gradient-to-r from-red-500 to-rose-500",
  default: "bg-gradient-to-r from-gray-400 to-gray-500",
};
```

## Drag & Drop

```tsx
<DragDropContext onDragEnd={handleDragEnd}>
  {/* RASCUNHO */}
  <Droppable droppableId="RASCUNHO">
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={cn(
          "space-y-3 min-h-[500px] p-4 rounded-lg transition-colors",
          snapshot.isDraggingOver && "bg-slate-100 border-2 border-slate-300"
        )}
      >
        {pedidosRascunho.map((pedido, index) => (
          <Draggable key={pedido.id} draggableId={pedido.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={cn(
                  "transition-transform",
                  snapshot.isDragging && "scale-105 shadow-2xl"
                )}
              >
                <KanbanCard pedido={pedido} status="RASCUNHO" />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>

  {/* PRODUCAO */}
  <Droppable droppableId="PRODUCAO">{/* similar... */}</Droppable>

  {/* ENTREGUE */}
  <Droppable droppableId="ENTREGUE">{/* similar... */}</Droppable>
</DragDropContext>
```

## Empty States

```tsx
// RASCUNHO vazio
<EmptyState
  icon={<Package className="h-12 w-12 text-gray-400" />}
  title="Nenhum rascunho"
  description="Crie um novo pedido para começar"
  action={
    <Button onClick={abrirNovaOrdem}>
      <Plus className="h-4 w-4 mr-2" />
      Nova Ordem
    </Button>
  }
/>

// PRODUCAO vazio
<EmptyState
  icon={<Factory className="h-12 w-12 text-gray-400" />}
  title="Nenhum pedido em produção"
  description="Envie pedidos para o laboratório"
/>

// ENTREGUE vazio
<EmptyState
  icon={<CheckCircle className="h-12 w-12 text-gray-400" />}
  title="Nenhum pedido aguardando retirada"
  description="Pedidos entregues aparecerão aqui"
/>
```

## Animações

```tsx
// Transição entre colunas (Framer Motion)
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
  transition={{ duration: 0.3 }}
>
  <KanbanCard pedido={pedido} />
</motion.div>

// Pulse no badge crítico
<Badge className="bg-red-600 text-white animate-pulse">
  🔴 ATRASADO
</Badge>

// Loading skeleton
<div className="space-y-3">
  {[1, 2, 3].map(i => (
    <Skeleton key={i} className="h-48 w-full" />
  ))}
</div>
```

## Responsividade

```tsx
// Desktop: 3 colunas lado a lado
<div className="hidden lg:grid lg:grid-cols-3 gap-6">

// Tablet: 2 colunas (RASCUNHO+PRODUCAO | ENTREGUE)
<div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6">

// Mobile: Tabs
<Tabs defaultValue="RASCUNHO">
  <TabsList className="grid grid-cols-3">
    <TabsTrigger value="RASCUNHO">Rascunho</TabsTrigger>
    <TabsTrigger value="PRODUCAO">Produção</TabsTrigger>
    <TabsTrigger value="ENTREGUE">Entregue</TabsTrigger>
  </TabsList>
  <TabsContent value="RASCUNHO">...</TabsContent>
  <TabsContent value="PRODUCAO">...</TabsContent>
  <TabsContent value="ENTREGUE">...</TabsContent>
</Tabs>
```
