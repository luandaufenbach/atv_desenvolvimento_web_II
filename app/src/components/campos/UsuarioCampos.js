import { Linha } from '@/components/FormLayout';
import TextField from '@/components/ui/TextField';
import { formatarData } from '@/services/formatos';

/**
 * Campos do formulário de usuário.
 * modo: 'create' (senha obrigatória), 'update' (senha opcional) ou 'read' (sem senha, só leitura)
 */
export default function UsuarioCampos({ usuario, onChange, modo = 'read' }) {
  const readOnly = modo === 'read';
  return (
    <>
      <Linha>
        <TextField label="Nome" name="nome" value={usuario.nome} onChange={onChange} readOnly={readOnly} />
      </Linha>
      <TextField label="E-mail" type="email" name="email" value={usuario.email} onChange={onChange} readOnly={readOnly} />
      <TextField label="Telefone" name="telefone" value={usuario.telefone} onChange={onChange} readOnly={readOnly} />
      {!readOnly && (
        <TextField
          label={modo === 'update' ? 'Nova senha' : 'Senha'}
          type="password"
          name="senha"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          hint={modo === 'update' ? 'Deixe em branco para manter a senha atual.' : undefined}
          value={usuario.senha || ''}
          onChange={onChange}
        />
      )}
      {readOnly && usuario.dataCadastro && <TextField label="Data de cadastro" name="dataCadastro" value={formatarData(usuario.dataCadastro)} readOnly />}
    </>
  );
}
