// components/ui/SmartSelect.tsx

interface SmartSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  showRecent?: boolean;
  favoriteFirst?: boolean;
  autoFocus?: boolean;
  keyboardNavigation?: boolean;
}

const SmartSelect: React.FC<SmartSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  searchable = false,
  showRecent = false,
  favoriteFirst = false,
  autoFocus = false,
  keyboardNavigation = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Filtrar e ordenar opções
  const filteredOptions = useMemo(() => {
    let filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.searchTerms?.some(term => 
        term.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Ordenar por favoritos primeiro
    if (favoriteFirst) {
      filtered.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    }

    return filtered;
  }, [options, searchTerm, favoriteFirst]);

  // Keyboard navigation
  useEffect(() => {
    if (!keyboardNavigation || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            Math.min(prev + 1, filteredOptions.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            onChange(filteredOptions[highlightedIndex].value);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions, onChange, keyboardNavigation]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 text-left border rounded-lg transition-all focus:outline-none
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          ${isOpen ? 'border-blue-500 shadow-lg' : 'border-gray-300 hover:border-gray-400'}
          ${value ? 'text-gray-900 dark:text-white' : 'text-gray-500'}
        `}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">
            {value ? options.find(opt => opt.value === value)?.label : placeholder}
          </span>
          <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}

          {/* Recent Items */}
          {showRecent && getRecentSelections().length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">Recentes</div>
              {getRecentSelections().slice(0, 3).map((option, index) => (
                <OptionItem 
                  key={`recent-${option.value}`}
                  option={option} 
                  isHighlighted={false}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    addToRecentSelections(option);
                  }}
                  icon="🕒"
                />
              ))}
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
            </div>
          )}

          {/* Options */}
          <div ref={optionsRef} className="p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <OptionItem
                  key={option.value}
                  option={option}
                  isHighlighted={index === highlightedIndex}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    addToRecentSelections(option);
                  }}
                  icon={option.favorite ? '⭐' : option.icon}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const OptionItem: React.FC<{
  option: SelectOption;
  isHighlighted: boolean;
  onClick: () => void;
  icon?: string;
}> = ({ option, isHighlighted, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`
      w-full px-3 py-2 text-left rounded-lg transition-all duration-150 flex items-center gap-3
      ${isHighlighted 
        ? 'bg-blue-600 text-white' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }
    `}
  >
    {icon && <span className="text-sm">{icon}</span>}
    <div className="flex-1 min-w-0">
      <div className="font-medium truncate">{option.label}</div>
      {option.description && (
        <div className={`text-xs truncate ${
          isHighlighted ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {option.description}
        </div>
      )}
    </div>
    {option.badge && (
      <span className={`
        px-2 py-1 rounded-full text-xs font-medium
        ${isHighlighted 
          ? 'bg-white/20 text-white' 
          : 'bg-blue-100 text-blue-800'
        }
      `}>
        {option.badge}
      </span>
    )}
  </button>
);





// components/ui/StatusBadge.tsx

interface StatusBadgeProps {
  status: StatusPedido;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showAnimation?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  showAnimation = false,
  clickable = false,
  onClick
}) => {
  const statusConfig = {
    'REGISTRADO': {
      color: 'bg-gray-500',
      textColor: 'text-white',
      icon: '📝',
      label: 'Registrado',
      animation: 'animate-pulse'
    },
    'AG_PAGAMENTO': {
      color: 'bg-amber-500',
      textColor: 'text-white',
      icon: '💰',
      label: 'Aguardando Pagamento',
      animation: 'animate-bounce'
    },
    'PAGO': {
      color: 'bg-green-500',
      textColor: 'text-white',
      icon: '✅',
      label: 'Pago',
      animation: ''
    },
    'PRODUCAO': {
      color: 'bg-blue-500',
      textColor: 'text-white',
      icon: '⚙️',
      label: 'Em Produção',
      animation: 'animate-spin'
    },
    'PRONTO': {
      color: 'bg-purple-500',
      textColor: 'text-white',
      icon: '📦',
      label: 'Pronto',
      animation: ''
    },
    'ENVIADO': {
      color: 'bg-red-500',
      textColor: 'text-white',
      icon: '🚚',
      label: 'Enviado',
      animation: ''
    },
    'CHEGOU': {
      color: 'bg-cyan-500',
      textColor: 'text-white',
      icon: '📍',
      label: 'Chegou na Loja',
      animation: ''
    },
    'ENTREGUE': {
      color: 'bg-green-600',
      textColor: 'text-white',
      icon: '✅',
      label: 'Entregue',
      animation: ''
    },
    'CANCELADO': {
      color: 'bg-gray-600',
      textColor: 'text-white',
      icon: '❌',
      label: 'Cancelado',
      animation: ''
    }
  };

  const config = statusConfig[status];
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      onClick={clickable ? onClick : undefined}
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${config.color} ${config.textColor} ${sizes[size]}
        ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${showAnimation && config.animation ? config.animation : ''}
      `}
    >
      {showIcon && <span className="text-xs">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};


