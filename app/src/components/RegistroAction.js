import Button from '@/components/ui/Button';

/**
 * Ações de cada linha da listagem (Visualizar / Editar / Deletar).
 * O componente pai passa o id do registro (pid) e a rota base do cadastro.
 */
export default function RegistroAction({ base, pid, podeEditar = true }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <Button variant="ghost" size="sm" icon="visibility" href={`${base}/read/${pid}`}>
        Visualizar
      </Button>
      {podeEditar && (
        <Button variant="ghost" size="sm" icon="edit" href={`${base}/update/${pid}`}>
          Editar
        </Button>
      )}
      <Button variant="ghost" size="sm" icon="delete" href={`${base}/delete/${pid}`} style={{ color: 'var(--status-error)' }}>
        Deletar
      </Button>
    </div>
  );
}
