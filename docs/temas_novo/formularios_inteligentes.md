// components/forms/NovaOrdemForm.tsx

interface NovaOrdemFormProps {
  onSubmit: (data: NovaOrdemData) => void;
  onCancel: () => void;
}

const NovaOrdemForm: React.FC<NovaOrdemFormProps> = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [startTime] = useState(Date.now());
  const [formData, setFormData] = useState<NovaOrdemData>({});

  // Auto-focus no próximo campo
  const nextFieldRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (nextFieldRef.current) {
      nextFieldRef.current.focus();
    }
  }, [currentStep]);

  // Cálculo de SLA automático
  const calculateSLA = useMemo(() => {
    if (formData.laboratorio_id && formData.classe_lente_id) {
      // Buscar SLA do laboratório + classe
      const sla = getSLA(formData.laboratorio_id, formData.classe_lente_id);
      const prioridade = formData.prioridade || 'NORMAL';
      
      return adjustSLAForPriority(sla, prioridade);
    }
    return null;
  }, [formData.laboratorio_id, formData.classe_lente_id, formData.prioridade]);

  const FormStep = ({ step, title, children, isActive = false }) => (
    <div className={`
      transition-all duration-300 transform
      ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-50 pointer-events-none'}
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center mb-4">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
            ${isActive ? 'bg-blue-600' : 'bg-gray-400'}
          `}>
            {step}
          </div>
          <h3 className="ml-3 text-lg font-semibold">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header com timer */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">⚡ Nova Ordem Rápida</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              ⏱️ {Math.floor((Date.now() - startTime) / 1000)}s
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        <div className="space-y-6">
          {/* Step 1: Loja */}
          <FormStep step={1} title="Selecionar Loja" isActive={currentStep >= 1}>
            <SmartSelect
              options={lojas}
              value={formData.loja_id}
              onChange={(value) => {
                setFormData({...formData, loja_id: value});
                if (value) setCurrentStep(2);
              }}
              placeholder="Digite ou selecione a loja..."
              autoFocus
              searchable
              keyboardNavigation
            />
          </FormStep>

          {/* Step 2: Laboratório */}
          <FormStep step={2} title="Laboratório" isActive={currentStep >= 2}>
            <SmartSelect
              options={laboratorios}
              value={formData.laboratorio_id}
              onChange={(value) => {
                setFormData({...formData, laboratorio_id: value});
                if (value) setCurrentStep(3);
              }}
              placeholder="Laboratório preferencial..."
              searchable
              showRecent
              favoriteFirst
            />
          </FormStep>

          {/* Step 3: Classe da Lente */}
          <FormStep step={3} title="Classe da Lente" isActive={currentStep >= 3}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {classes_lente.map(classe => (
                <button
                  key={classe.id}
                  onClick={() => {
                    setFormData({...formData, classe_lente_id: classe.id});
                    setCurrentStep(4);
                  }}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all hover:scale-105
                    ${formData.classe_lente_id === classe.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div 
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: classe.cor_badge }}
                  />
                  <div className="font-medium text-sm">{classe.nome}</div>
                  <div className="text-xs text-gray-500">{classe.sla_base_dias} dias</div>
                </button>
              ))}
            </div>
          </FormStep>

          {/* Step 4: Detalhes Finais */}
          <FormStep step={4} title="Finalizar" isActive={currentStep >= 4}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SmartInput
                label="Nome do Cliente"
                value={formData.cliente_nome}
                onChange={(value) => setFormData({...formData, cliente_nome: value})}
                placeholder="Nome completo..."
                autoComplete="customer-name"
                required
              />
              
              <SmartInput
                label="Telefone"
                value={formData.cliente_telefone}
                onChange={(value) => setFormData({...formData, cliente_telefone: value})}
                placeholder="(11) 99999-9999"
                mask="phone"
              />
              
              <SmartInput
                label="Valor do Pedido"
                value={formData.valor_pedido}
                onChange={(value) => setFormData({...formData, valor_pedido: value})}
                placeholder="R$ 450,00"
                mask="currency"
              />

              <SmartSelect
                label="Prioridade"
                options={prioridades}
                value={formData.prioridade}
                onChange={(value) => setFormData({...formData, prioridade: value})}
                defaultValue="NORMAL"
              />
            </div>

            {/* SLA Preview */}
            {calculateSLA && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">📅 Data Prevista de Entrega:</span>
                  <span className="font-bold text-blue-600">
                    {formatDate(calculateSLA.dataPrevisao)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  SLA: {calculateSLA.diasUteis} dias úteis
                </div>
              </div>
            )}
          </FormStep>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            ← Voltar
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            
            {currentStep === 4 && (
              <button
                onClick={() => onSubmit(formData)}
                disabled={!isFormValid(formData)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transform hover:scale-105 transition-all"
              >
                ✓ Criar Pedido ({Math.floor((Date.now() - startTime) / 1000)}s)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


