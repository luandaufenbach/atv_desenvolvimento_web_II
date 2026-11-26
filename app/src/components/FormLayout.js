import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

/**
 * Cartão padrão das páginas create / read / update / delete:
 * campos, mensagem da API e botões (ação principal + Voltar).
 */
export default function FormLayout({ titulo, voltar, mensagem, acoes, aviso, children }) {
  return (
    <div style={{ maxWidth: 760 }}>
      <Card title={titulo}>
        {aviso && <div style={{ marginBottom: 20 }}>{aviso}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>{children}</div>

        <Alert mensagem={mensagem} style={{ marginTop: 20 }} />

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {acoes}
          <Button variant="ghost" href={voltar}>
            Voltar
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Faz um campo ocupar as duas colunas do formulário
export function Linha({ children }) {
  return <div style={{ gridColumn: '1 / -1' }}>{children}</div>;
}
