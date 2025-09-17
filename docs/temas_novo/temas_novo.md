🎨 BLUEPRINT DE DESIGN - DESENROLA DCL

Sistema de gestão com a experiência visual mais elegante e moderna possível
Design System completo para máxima usabilidade e impacto visual


🎯 FILOSOFIA DE DESIGN
CONCEITO CENTRAL: "Eficiência Visual"

Minimalismo Inteligente: Cada elemento tem propósito claro
Hierarquia Visual Clara: Informações importantes se destacam naturalmente
Fluidez de Interação: Transições suaves e feedback imediato
Consistência Absoluta: Padrões uniformes em todo o sistema
Personalização Profunda: Cada usuário molda sua experiência

PRINCÍPIOS FUNDAMENTAIS

Zero Friction: Qualquer ação deve ser intuitiva na primeira tentativa
Information Dense: Máximo de informação útil, mínimo de ruído visual
Context Aware: Interface adapta-se ao contexto e prioridades
Predictable: Comportamento consistente gera confiança
Delightful: Pequenos detalhes que surpreendem positivamente


🌈 SISTEMA DE CORES AVANÇADO
PALETA PRINCIPAL - "Optical Precision"
scss:root {
  // === CORES PRIMÁRIAS ===
  --primary-50:  #eff6ff;   // Mais clara
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;   // AZUL PRINCIPAL - Confiança, Tecnologia
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;   // Mais escura

  // === CORES SECUNDÁRIAS ===
  --secondary-50:  #f8fafc;
  --secondary-100: #f1f5f9;
  --secondary-200: #e2e8f0;
  --secondary-300: #cbd5e1;
  --secondary-400: #94a3b8;
  --secondary-500: #64748b;  // CINZA PRINCIPAL - Elegância, Profissionalismo
  --secondary-600: #475569;
  --secondary-700: #334155;
  --secondary-800: #1e293b;
  --secondary-900: #0f172a;

  // === CORES DE STATUS (Sistema Kanban) ===
  --status-registrado:    #94a3b8;  // Cinza neutro
  --status-ag-pagamento:  #f59e0b;  // Amarelo atenção
  --status-pago:          #10b981;  // Verde sucesso
  --status-producao:      #3b82f6;  // Azul processo
  --status-pronto:        #8b5cf6;  // Roxo finalização
  --status-enviado:       #ef4444;  // Vermelho movimento
  --status-chegou:        #06b6d4;  // Cyan chegada
  --status-entregue:      #10b981;  // Verde final
  --status-cancelado:     #6b7280;  // Cinza cancelamento

  // === CORES FUNCIONAIS ===
  --success:   #10b981;    // Verde - Sucesso, Confirmação
  --warning:   #f59e0b;    // Amarelo - Atenção, Cuidado  
  --error:     #ef4444;    // Vermelho - Erro, Perigo
  --info:      #06b6d4;    // Cyan - Informação, Neutralidade

  // === GRADIENTES AVANÇADOS ===
  --gradient-primary:   linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
  --gradient-success:   linear-gradient(135deg, #10b981 0%, #059669 100%);
  --gradient-warning:   linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  --gradient-premium:   linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  --gradient-glass:     linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
}
TEMA ESCURO - "Dark Precision"
scss[data-theme="dark"] {
  // === BACKGROUNDS ESCUROS ===
  --bg-primary:        #0f172a;    // Fundo principal
  --bg-secondary:      #1e293b;    // Cards, containers
  --bg-tertiary:       #334155;    // Elementos elevados
  --bg-glass:          rgba(30, 41, 59, 0.8); // Efeito vidro
  
  // === TEXTOS ESCUROS ===
  --text-primary:      #f8fafc;    // Texto principal
  --text-secondary:    #cbd5e1;    // Texto secundário
  --text-muted:        #94a3b8;    // Texto desabilitado
  
  // === BORDAS ESCURAS ===
  --border-default:    #334155;    // Bordas padrão
  --border-muted:      #1e293b;    // Bordas sutis
  --border-focus:      var(--primary-500); // Bordas em foco
  
  // === SOMBRAS ESCURAS ===
  --shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.4);
  --shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.5);
}
TEMA CLARO - "Light Precision"
scss[data-theme="light"] {
  // === BACKGROUNDS CLAROS ===
  --bg-primary:        #ffffff;    // Fundo principal
  --bg-secondary:      #f8fafc;    // Cards, containers  
  --bg-tertiary:       #f1f5f9;    // Elementos elevados
  --bg-glass:          rgba(248, 250, 252, 0.8); // Efeito vidro
  
  // === TEXTOS CLAROS ===
  --text-primary:      #0f172a;    // Texto principal
  --text-secondary:    #475569;    // Texto secundário
  --text-muted:        #94a3b8;    // Texto desabilitado
  
  // === BORDAS CLARAS ===
  --border-default:    #e2e8f0;    // Bordas padrão
  --border-muted:      #f1f5f9;    // Bordas sutis
  --border-focus:      var(--primary-500); // Bordas em foco
  
  // === SOMBRAS CLARAS ===
  --shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

📝 SISTEMA TIPOGRÁFICO AVANÇADO
FAMÍLIA DE FONTES
scss:root {
  // === FONTES PRINCIPAIS ===
  --font-primary: 'Inter Variable', 'Inter', system-ui, sans-serif;     // Texto geral
  --font-display: 'Cal Sans', 'Inter Variable', system-ui, sans-serif;  // Títulos, destaques
  --font-mono:    'JetBrains Mono Variable', 'Fira Code', monospace;    // Códigos, números
  
  // === PESOS DISPONÍVEIS ===
  --font-weight-light:     300;  // Textos sutis
  --font-weight-normal:    400;  // Texto padrão
  --font-weight-medium:    500;  // Texto importante
  --font-weight-semibold:  600;  // Títulos pequenos
  --font-weight-bold:      700;  // Títulos principais
  --font-weight-black:     900;  // Super destaques
}
ESCALA TIPOGRÁFICA
scss:root {
  // === TAMANHOS DE TEXTO ===
  --text-xs:    0.75rem;   // 12px - Metadados, timestamps
  --text-sm:    0.875rem;  // 14px - Texto secundário
  --text-base:  1rem;      // 16px - Texto principal
  --text-lg:    1.125rem;  // 18px - Texto destacado
  --text-xl:    1.25rem;   // 20px - Títulos pequenos
  --text-2xl:   1.5rem;    // 24px - Títulos médios
  --text-3xl:   1.875rem;  // 30px - Títulos grandes
  --text-4xl:   2.25rem;   // 36px - Títulos principais
  --text-5xl:   3rem;      // 48px - Display headlines

  // === ALTURAS DE LINHA ===
  --leading-tight:   1.25;  // Títulos
  --leading-normal:  1.5;   // Texto padrão
  --leading-relaxed: 1.75;  // Texto longo
  
  // === ESPAÇAMENTO DE LETRAS ===
  --tracking-tight:   -0.025em; // Títulos grandes
  --tracking-normal:   0em;      // Texto normal
  --tracking-wide:     0.025em;  // Texto pequeno
}