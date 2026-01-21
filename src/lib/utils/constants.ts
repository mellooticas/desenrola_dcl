import { StatusPedido, PrioridadeLevel } from '@/lib/types/database'

// Status Colors (matching database design)
export const STATUS_COLORS: Record<StatusPedido, string> = {
  'PENDENTE': '#94a3b8',        // Slate 400 - DCL analisa receita
  'REGISTRADO': '#94A3B8',      // Slate 400
  'AG_PAGAMENTO': '#F59E0B',    // Amber 500
  'PAGO': '#10B981',            // Emerald 500
  'PRODUCAO': '#3B82F6',        // Blue 500
  'PRONTO': '#8B5CF6',          // Violet 500
  'ENVIADO': '#EF4444',         // Red 500
  'CHEGOU': '#06B6D4',          // Cyan 500
  'ENTREGUE': '#10B981',        // Emerald 500
  'FINALIZADO': '#047857',      // Emerald 700
  'CANCELADO': '#6B7280'        // Gray 500
}

// Status Labels for UI
export const STATUS_LABELS: Record<StatusPedido, string> = {
  'PENDENTE': 'Pendente - Análise DCL',
  'REGISTRADO': 'Registrado',
  'AG_PAGAMENTO': 'Aguardando Pagamento',
  'PAGO': 'Pago',
  'PRODUCAO': 'Em Produção', 
  'PRONTO': 'Pronto',
  'ENVIADO': 'Enviado',
  'CHEGOU': 'Chegou na Loja',
  'ENTREGUE': 'Entregue',
  'FINALIZADO': 'Finalizado',
  'CANCELADO': 'Cancelado'
}

// Priority Colors
export const PRIORITY_COLORS: Record<PrioridadeLevel, string> = {
  'BAIXA': '#10B981',     // Green
  'NORMAL': '#6B7280',    // Gray
  'ALTA': '#F59E0B',      // Amber
  'URGENTE': '#EF4444'    // Red
}

// Priority Labels
export const PRIORITY_LABELS: Record<PrioridadeLevel, string> = {
  'BAIXA': 'Baixa',
  'NORMAL': 'Normal',
  'ALTA': 'Alta',
  'URGENTE': 'Urgente'
}

// Kanban Column Order
export const KANBAN_COLUMNS: StatusPedido[] = [
  'PENDENTE',
  'REGISTRADO',
  'AG_PAGAMENTO',
  'PAGO',
  'PRODUCAO',
  'PRONTO',
  'ENVIADO',
  'CHEGOU',
  'ENTREGUE',
  'FINALIZADO'
]

// Status transitions allowed (for validation)
export const ALLOWED_TRANSITIONS: Record<StatusPedido, StatusPedido[]> = {
  'PENDENTE': ['REGISTRADO', 'CANCELADO'],
  'REGISTRADO': ['AG_PAGAMENTO', 'CANCELADO'],
  'AG_PAGAMENTO': ['PAGO', 'CANCELADO'],
  'PAGO': ['PRODUCAO', 'CANCELADO'],
  'PRODUCAO': ['PRONTO', 'CANCELADO'],
  'PRONTO': ['ENVIADO', 'CANCELADO'],
  'ENVIADO': ['CHEGOU'],
  'CHEGOU': ['ENTREGUE'],
  'ENTREGUE': ['FINALIZADO'],
  'FINALIZADO': [],
  'CANCELADO': []
}

// SLA default configurations
export const SLA_DEFAULTS = {
  MONOFOCAL: 3,
  MULTIFOCAL: 5,
  TRANSITIONS: 7,
  TRATAMENTO: 4,
  URGENTE_REDUCAO: 3, // dias reduzidos para urgente
  ALTA_REDUCAO: 1,    // dias reduzidos para alta prioridade
  BAIXA_ADICAO: 2     // dias adicionados para baixa prioridade
}



// Alert Types
export const ALERT_TYPES = {
  PAYMENT_OVERDUE: 'payment_overdue',
  PRODUCTION_DELAYED: 'production_delayed',
  URGENT_ATTENTION: 'urgent_attention',
  LAB_CONTACT_NEEDED: 'lab_contact_needed',
  SLA_WARNING: 'sla_warning'
} as const

// Alert Colors
export const ALERT_COLORS = {
  [ALERT_TYPES.PAYMENT_OVERDUE]: '#F59E0B',
  [ALERT_TYPES.PRODUCTION_DELAYED]: '#EF4444',
  [ALERT_TYPES.URGENT_ATTENTION]: '#DC2626',
  [ALERT_TYPES.LAB_CONTACT_NEEDED]: '#8B5CF6',
  [ALERT_TYPES.SLA_WARNING]: '#F59E0B'
}

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  GESTOR: 'gestor',
  OPERADOR: 'operador',
  FINANCEIRO: 'financeiro'
} as const

// Permissions
export const PERMISSIONS = {
  // Pedidos
  CREATE_PEDIDO: 'create_pedido',
  EDIT_PEDIDO: 'edit_pedido',
  DELETE_PEDIDO: 'delete_pedido',
  VIEW_ALL_PEDIDOS: 'view_all_pedidos',
  
  // Pagamentos
  MARK_PAYMENT: 'mark_payment',
  VIEW_FINANCIAL: 'view_financial',
  
  // Configurações
  MANAGE_LABS: 'manage_labs',
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  EXPORT_REPORTS: 'export_reports'
} as const

// Default permissions by role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.GESTOR]: [
    PERMISSIONS.CREATE_PEDIDO,
    PERMISSIONS.EDIT_PEDIDO,
    PERMISSIONS.VIEW_ALL_PEDIDOS,
    PERMISSIONS.MARK_PAYMENT,
    PERMISSIONS.VIEW_FINANCIAL,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EXPORT_REPORTS
  ],
  [USER_ROLES.OPERADOR]: [
    PERMISSIONS.CREATE_PEDIDO,
    PERMISSIONS.EDIT_PEDIDO,
    PERMISSIONS.MARK_PAYMENT,
    PERMISSIONS.VIEW_DASHBOARD
  ],
  [USER_ROLES.FINANCEIRO]: [
    PERMISSIONS.VIEW_ALL_PEDIDOS,
    PERMISSIONS.MARK_PAYMENT,
    PERMISSIONS.VIEW_FINANCIAL,
    PERMISSIONS.VIEW_DASHBOARD
  ]
}

// Form validation constants
export const VALIDATION = {
  MIN_VALOR_PEDIDO: 10,
  MAX_VALOR_PEDIDO: 50000,
  MIN_CLIENTE_NOME_LENGTH: 2,
  MAX_CLIENTE_NOME_LENGTH: 100,
  TELEFONE_PATTERN: /^(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  RELATIVE: 'relative' // For date-fns formatDistanceToNow
}

// Local Storage Keys
export const STORAGE_KEYS = {
  KANBAN_FILTERS: 'dcl_kanban_filters',
  USER_PREFERENCES: 'dcl_user_preferences',
  LAST_LOJA: 'dcl_last_loja',
  THEME: 'dcl_theme'
} as const

// API Endpoints
export const API_ENDPOINTS = {
  PEDIDOS: '/api/pedidos',
  DASHBOARD: '/api/dashboard',
  ALERTAS: '/api/alertas',
  WEBHOOK: '/api/webhook'
} as const

// Real-time channels
export const REALTIME_CHANNELS = {
  PEDIDOS: 'pedidos-changes',
  ALERTAS: 'alertas-changes',
  DASHBOARD: 'dashboard-updates'
} as const



// Business hours
export const BUSINESS_HOURS = {
  START: '08:00',
  END: '18:00',
  TIMEZONE: 'America/Sao_Paulo'
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  KANBAN_LIMIT: 200 // Limit for kanban view
}

// Notification settings
export const NOTIFICATIONS = {
  DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000
  },
  POSITION: 'top-right' as const
}