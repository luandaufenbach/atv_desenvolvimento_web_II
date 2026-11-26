import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

/**
 * Campo de busca das listagens. onBuscar é chamado ao enviar; onLimpar volta para a lista completa.
 */
export default function BarraBusca({ valor, onChange, onBuscar, onLimpar, placeholder = 'Buscar por nome...', type = 'text', label, children }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onBuscar();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
      {children}
      <TextField
        label={label}
        type={type}
        name="busca"
        size="sm"
        prefixIcon="search"
        placeholder={placeholder}
        value={valor}
        onChange={onChange}
        style={{ width: 280 }}
      />
      <Button type="submit" variant="subtle" size="md" style={{ height: 32 }}>
        Buscar
      </Button>
      <Button variant="ghost" size="md" style={{ height: 32 }} onClick={onLimpar}>
        Limpar
      </Button>
    </form>
  );
}
