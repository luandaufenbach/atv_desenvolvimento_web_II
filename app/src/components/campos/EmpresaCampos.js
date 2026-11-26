import { Linha } from '@/components/FormLayout';
import TextField from '@/components/ui/TextField';
import { formatarData } from '@/services/formatos';

// Campos do formulário de empresa (usados em create, read, update e delete)
export default function EmpresaCampos({ empresa, onChange, readOnly = false }) {
  return (
    <>
      <Linha>
        <TextField label="Nome" name="nome" placeholder="ex.: Tech Sul Ltda" value={empresa.nome} onChange={onChange} readOnly={readOnly} />
      </Linha>
      <TextField label="CNPJ" name="cnpj" placeholder="14 números" hint={readOnly ? undefined : 'Somente números ou com pontuação.'} value={empresa.cnpj} onChange={onChange} readOnly={readOnly} />
      <TextField label="Telefone" name="telefone" placeholder="ex.: 4834310000" value={empresa.telefone} onChange={onChange} readOnly={readOnly} />
      <Linha>
        <TextField label="E-mail" type="email" name="email" placeholder="ex.: contato@empresa.com" value={empresa.email} onChange={onChange} readOnly={readOnly} />
      </Linha>
      <Linha>
        <TextField label="Endereço" name="endereco" placeholder="Rua, número - bairro, cidade/UF" value={empresa.endereco} onChange={onChange} readOnly={readOnly} />
      </Linha>
      {readOnly && empresa.dataCadastro && <TextField label="Data de cadastro" name="dataCadastro" value={formatarData(empresa.dataCadastro)} readOnly />}
    </>
  );
}
