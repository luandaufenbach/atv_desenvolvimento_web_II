import { Linha } from '@/components/FormLayout';
import TextField from '@/components/ui/TextField';
import { formatarData } from '@/services/formatos';

// Campos do formulário de empresa (usados em create, read, update e delete)
export default function EmpresaCampos({ empresa, onChange, readOnly = false }) {
  return (
    <>
      <Linha>
        <TextField label="Nome" name="nome" value={empresa.nome} onChange={onChange} readOnly={readOnly} />
      </Linha>
      <TextField label="CNPJ" name="cnpj" value={empresa.cnpj} onChange={onChange} readOnly={readOnly} />
      <TextField label="Telefone" name="telefone" value={empresa.telefone} onChange={onChange} readOnly={readOnly} />
      <Linha>
        <TextField label="E-mail" type="email" name="email" value={empresa.email} onChange={onChange} readOnly={readOnly} />
      </Linha>
      <Linha>
        <TextField label="Endereço" name="endereco" value={empresa.endereco} onChange={onChange} readOnly={readOnly} />
      </Linha>
      {readOnly && empresa.dataCadastro && <TextField label="Data de cadastro" name="dataCadastro" value={formatarData(empresa.dataCadastro)} readOnly />}
    </>
  );
}
