import Field from '@/components/ui/Field';
import { Linha } from '@/components/FormLayout';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import TextField from '@/components/ui/TextField';
import { TIPOS_ESPACO } from '@/services/formatos';

// Campos do formulário de espaço (usados em create, read, update e delete)
export default function EspacoCampos({ espaco, onChange, onChangeAtivo, readOnly = false }) {
  return (
    <>
      <Linha>
        <TextField label="Nome" name="nome" placeholder="ex.: Sala de Reunião 01" value={espaco.nome} onChange={onChange} readOnly={readOnly} />
      </Linha>
      <Select label="Tipo" name="tipo" placeholder={readOnly ? undefined : 'Selecione o tipo'} options={TIPOS_ESPACO} value={espaco.tipo} onChange={onChange} readOnly={readOnly} />
      <TextField label="Capacidade (pessoas)" type="number" min="1" name="capacidade" placeholder="ex.: 10" value={espaco.capacidade} onChange={onChange} readOnly={readOnly} />
      <Linha>
        <Textarea label="Descrição" name="descricao" rows={3} placeholder="Recursos, equipamentos, observações..." value={espaco.descricao} onChange={onChange} readOnly={readOnly} />
      </Linha>
      <Linha>
        <Field label="Situação" hint={readOnly ? undefined : 'Espaço inativo não recebe novas reservas nem disponibilidades.'}>
          <Switch checked={!!espaco.ativo} onChange={onChangeAtivo} disabled={readOnly} label={espaco.ativo ? 'Ativo' : 'Inativo'} />
        </Field>
      </Linha>
    </>
  );
}
