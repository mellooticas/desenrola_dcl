import React, { useState, useEffect } from 'react';

const ThemeCustomizationSystem = () => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  });
  const [fontSize, setFontSize] = useState('medium');
  const [borderRadius, setBorderRadius] = useState('medium');
  const [animation, setAnimation] = useState('normal');
  const [density, setDensity] = useState('comfortable');
  const [isDark, setIsDark] = useState(false);

  const themes = {
    default: {
      name: 'Desenrola Padrão',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      description: 'Tema padrão azul profissional'
    },
    ocean: {
      name: 'Oceano Profundo',
      colors: {
        primary: '#0891b2',
        secondary: '#64748b',
        accent: '#06b6d4',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626'
      },
      description: 'Tons de azul e ciano'
    },
    forest: {
      name: 'Floresta Verde',
      colors: {
        primary: '#059669',
        secondary: '#6b7280',
        accent: '#10b981',
        success: '#047857',
        warning: '#d97706',
        error: '#dc2626'
      },
      description: 'Verde natureza e sustentabilidade'
    },
    sunset: {
      name: 'Pôr do Sol',
      colors: {
        primary: '#ea580c',
        secondary: '#78716c',
        accent: '#f59e0b',
        success: '#16a34a',
        warning: '#eab308',
        error: '#dc2626'
      },
      description: 'Laranja e dourado quentes'
    },
    purple: {
      name: 'Roxo Premium',
      colors: {
        primary: '#7c3aed',
        secondary: '#64748b',
        accent: '#a855f7',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      description: 'Roxo elegante e sofisticado'
    },
    custom: {
      name: 'Personalizado',
      colors: customColors,
      description: 'Suas cores personalizadas'
    }
  };

  const fontSizes = {
    small: { name: 'Pequeno', scale: '0.875' },
    medium: { name: 'Médio', scale: '1' },
    large: { name: 'Grande', scale: '1.125' },
    xlarge: { name: 'Extra Grande', scale: '1.25' }
  };

  const borderRadiuses = {
    none: { name: 'Reto', value: '0px' },
    small: { name: 'Pequeno', value: '4px' },
    medium: { name: 'Médio', value: '8px' },
    large: { name: 'Grande', value: '12px' },
    xlarge: { name: 'Extra Grande', value: '16px' },
    pill: { name: 'Pílula', value: '9999px' }
  };

  const animations = {
    none: { name: 'Sem Animação', duration: '0s' },
    fast: { name: 'Rápida', duration: '0.15s' },
    normal: { name: 'Normal', duration: '0.3s' },
    slow: { name: 'Lenta', duration: '0.5s' }
  };

  const densities = {
    compact: { name: 'Compacto', padding: '0.5rem', gap: '0.25rem' },
    comfortable: { name: 'Confortável', padding: '1rem', gap: '0.5rem' },
    spacious: { name: 'Espaçoso', padding: '1.5rem', gap: '1rem' }
  };

  const ColorPicker = ({ label, color, onChange, presets = [] }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
        />
      </div>
      {presets.length > 0 && (
        <div className="flex gap-2">
          {presets.map(preset => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const ThemePreview = () => {
    const theme = themes[currentTheme];
    const colors = theme.colors;
    
    return (
      <div className={`
        p-6 rounded-xl border-2 transition-all duration-300
        ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
      `} style={{
        '--primary': colors.primary,
        '--secondary': colors.secondary,
        '--accent': colors.accent,
        '--success': colors.success,
        '--warning': colors.warning,
        '--error': colors.error,
        fontSize: `${parseFloat(fontSizes[fontSize].scale)}rem`,
        '--border-radius': borderRadiuses[borderRadius].value,
        '--animation-duration': animations[animation].duration
      }}>
        <h3 className="text-xl font-bold mb-4">Preview do Tema</h3>
        
        {/* Botões de Exemplo */}
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <button 
              className="px-4 py-2 text-white font-semibold hover:opacity-90 transition-all"
              style={{ 
                backgroundColor: colors.primary,
                borderRadius: borderRadiuses[borderRadius].value,
                transitionDuration: animations[animation].duration
              }}
            >
              Botão Primário
            </button>
            
            <button 
              className="px-4 py-2 text-white font-semibold hover:opacity-90 transition-all"
              style={{ 
                backgroundColor: colors.success,
                borderRadius: borderRadiuses[borderRadius].value,
                transitionDuration: animations[animation].duration
              }}
            >
              Sucesso
            </button>
            
            <button 
              className="px-4 py-2 text-white font-semibold hover:opacity-90 transition-all"
              style={{ 
                backgroundColor: colors.warning,
                borderRadius: borderRadiuses[borderRadius].value,
                transitionDuration: animations[animation].duration
              }}
            >
              Atenção
            </button>
            
            <button 
              className="px-4 py-2 text-white font-semibold hover:opacity-90 transition-all"
              style={{ 
                backgroundColor: colors.error,
                borderRadius: borderRadiuses[borderRadius].value,
                transitionDuration: animations[animation].duration
              }}
            >
              Perigo
            </button>
          </div>

          {/* Card de Exemplo */}
          <div 
            className={`p-4 border transition-all hover:shadow-lg ${densities[density].padding}`}
            style={{ 
              borderRadius: borderRadiuses[borderRadius].value,
              borderColor: colors.secondary + '40',
              transitionDuration: animations[animation].duration
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Pedido #2024001</h4>
              <span 
                className="px-2 py-1 text-xs font-medium text-white"
                style={{ 
                  backgroundColor: colors.accent,
                  borderRadius: borderRadiuses[borderRadius].value
                }}
              >
                Em Produção
              </span>
            </div>
            <p className="text-gray-600 mb-2">Cliente: Maria Silva Santos</p>
            <div className="flex justify-between items-center">
              <span style={{ color: colors.success }} className="font-semibold">
                R$ 450,00
              </span>
              <span className="text-sm text-gray-500">3 dias</span>
            </div>
          </div>

          {/* Badges de Status */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Registrado', color: colors.secondary },
              { label: 'Pago', color: colors.success },
              { label: 'Produção', color: colors.primary },
              { label: 'Pronto', color: colors.accent },
              { label: 'Atrasado', color: colors.error }
            ].map(badge => (
              <span
                key={badge.label}
                className="px-3 py-1 text-xs font-medium text-white"
                style={{ 
                  backgroundColor: badge.color,
                  borderRadius: borderRadiuses[borderRadius].value
                }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const applyTheme = (themeName) => {
    setCurrentTheme(themeName);
    const theme = themes[themeName];
    
    // Aplicar CSS custom properties no root
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const exportTheme = () => {
    const themeConfig = {
      theme: currentTheme,
      colors: themes[currentTheme].colors,
      fontSize,
      borderRadius,
      animation,
      density,
      isDark
    };
    
    const dataStr = JSON.stringify(themeConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'desenrola-dcl-theme.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          setCurrentTheme(config.theme || 'default');
          setCustomColors(config.colors || customColors);
          setFontSize(config.fontSize || 'medium');
          setBorderRadius(config.borderRadius || 'medium');
          setAnimation(config.animation || 'normal');
          setDensity(config.density || 'comfortable');
          setIsDark(config.isDark || false);
        } catch (error) {
          alert('Erro ao importar tema. Verifique se o arquivo é válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`min-h-screen p-8 transition-all duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personalização de Tema
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } border`}
              >
                {isDark ? '☀️ Claro' : '🌙 Escuro'}
              </button>
              
              <button
                onClick={exportTheme}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                📤 Exportar
              </button>
              
              <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
                📥 Importar
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Personalize completamente a aparência do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configurações */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Temas Pré-definidos */}
            <section className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-2xl font-bold mb-6">🎨 Temas Pré-definidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(themes).filter(([key]) => key !== 'custom').map(([key, theme]) => (
                  <div
                    key={key}
                    onClick={() => applyTheme(key)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105
                      ${currentTheme === key 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {Object.values(theme.colors).slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{theme.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">{theme.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Cores Personalizadas */}
            <section className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🌈 Cores Personalizadas</h2>
                <button
                  onClick={() => applyTheme('custom')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Aplicar Custom
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="🔵 Cor Primária"
                  color={customColors.primary}
                  onChange={(color) => setCustomColors({...customColors, primary: color})}
                  presets={['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef']}
                />
                
                <ColorPicker
                  label="⚫ Cor Secundária"
                  color={customColors.secondary}
                  onChange={(color) => setCustomColors({...customColors, secondary: color})}
                  presets={['#64748b', '#6b7280', '#78716c', '#71717a', '#737373']}
                />
                
                <ColorPicker
                  label="💜 Cor Destaque"
                  color={customColors.accent}
                  onChange={(color) => setCustomColors({...customColors, accent: color})}
                  presets={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']}
                />
                
                <ColorPicker
                  label="✅ Cor Sucesso"
                  color={customColors.success}
                  onChange={(color) => setCustomColors({...customColors, success: color})}
                  presets={['#10b981', '#059669', '#16a34a', '#15803d', '#166534']}
                />
                
                <ColorPicker
                  label="⚠️ Cor Atenção"
                  color={customColors.warning}
                  onChange={(color) => setCustomColors({...customColors, warning: color})}
                  presets={['#f59e0b', '#d97706', '#eab308', '#ca8a04', '#a16207']}
                />
                
                <ColorPicker
                  label="❌ Cor Erro"
                  color={customColors.error}
                  onChange={(color) => setCustomColors({...customColors, error: color})}
                  presets={['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']}
                />
              </div>
            </section>

            {/* Configurações Avançadas */}
            <section className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-2xl font-bold mb-6">⚙️ Configurações Avançadas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tamanho da Fonte */}
                <div>
                  <label className="block text-sm font-medium mb-3">📱 Tamanho da Fonte</label>
                  <div className="space-y-2">
                    {Object.entries(fontSizes).map(([key, size]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="fontSize"
                          value={key}
                          checked={fontSize === key}
                          onChange={(e) => setFontSize(e.target.value)}
                          className="text-blue-600"
                        />
                        <span style={{ fontSize: `${parseFloat(size.scale)}rem` }}>
                          {size.name} - Exemplo de texto
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Raio das Bordas */}
                <div>
                  <label className="block text-sm font-medium mb-3">📐 Raio das Bordas</label>
                  <div className="space-y-2">
                    {Object.entries(borderRadiuses).map(([key, radius]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="borderRadius"
                          value={key}
                          checked={borderRadius === key}
                          onChange={(e) => setBorderRadius(e.target.value)}
                          className="text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 bg-blue-600"
                            style={{ borderRadius: radius.value }}
                          />
                          <span>{radius.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Velocidade das Animações */}
                <div>
                  <label className="block text-sm font-medium mb-3">⚡ Velocidade das Animações</label>
                  <div className="space-y-2">
                    {Object.entries(animations).map(([key, anim]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="animation"
                          value={key}
                          checked={animation === key}
                          onChange={(e) => setAnimation(e.target.value)}
                          className="text-blue-600"
                        />
                        <span>{anim.name} ({anim.duration})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Densidade da Interface */}
                <div>
                  <label className="block text-sm font-medium mb-3">📏 Densidade da Interface</label>
                  <div className="space-y-2">
                    {Object.entries(densities).map(([key, dens]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="density"
                          value={key}
                          checked={density === key}
                          onChange={(e) => setDensity(e.target.value)}
                          className="text-blue-600"
                        />
                        <span>{dens.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <ThemePreview />
            
            {/* Informações do Tema Atual */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="font-bold mb-3">📋 Configuração Atual</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Tema:</strong> {themes[currentTheme].name}
                </div>
                <div>
                  <strong>Fonte:</strong> {fontSizes[fontSize].name}
                </div>
                <div>
                  <strong>Bordas:</strong> {borderRadiuses[borderRadius].name}
                </div>
                <div>
                  <strong>Animações:</strong> {animations[animation].name}
                </div>
                <div>
                  <strong>Densidade:</strong> {densities[density].name}
                </div>
                <div>
                  <strong>Modo:</strong> {isDark ? 'Escuro' : 'Claro'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizationSystem;