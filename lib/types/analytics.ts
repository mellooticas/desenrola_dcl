// Tipos genéricos para eventos/telemetria do dashboard (placeholder)
export interface TelemetryEvent {
	name: string
	timestamp: string
	properties?: Record<string, string | number | boolean | null>
}

export interface ExportRequestMeta {
	module: 'labs' | 'finance' | 'kpis' | 'alerts' | 'trends'
	format: 'csv' | 'xlsx' | 'json'
	rows: number
}
