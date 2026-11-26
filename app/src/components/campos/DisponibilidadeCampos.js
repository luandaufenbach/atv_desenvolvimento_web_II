import Field from '@/components/ui/Field';
import { Linha } from '@/components/FormLayout';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import TextField from '@/components/ui/TextField';
import { DIAS_SEMANA } from '@/services/formatos';

const OPCOES_DIAS = DIAS_SEMANA.map((nome, i) => ({ value: String(i), label: nome }));

/**
 * Campos do formulário de disponibilidade.
 * espacos: lista vinda da API para o select (o pai busca e repassa por props)
 */
export default function DisponibilidadeCampos({ disponibilidade, espacos = [], onChange, onChangeExterno, readOnly = false }) {
  const opcoesEspacos = espacos.map((e) => ({ value: e._id, label: e.ativo ? e.nome : `${e.nome} (inativo)` }));

  return (
    <>
      <Linha>
        <Select
          label="Espaço"
          name="espacoId"
          placeholder={readOnly ? undefined : 'Selecione o espaço'}
          options={opcoesEspacos}
          value={disponibilidade.espacoId}
          onChange={onChange}
          readOnly={readOnly}
        />
      </Linha>
      <Linha>
        <Select
          label="Dia da semana"
          name="diaSemana"
          placeholder={readOnly ? undefined : 'Selecione o dia'}
          options={OPCOES_DIAS}
          value={disponibilidade.diaSemana === '' ? '' : String(disponibilidade.diaSemana)}
          onChange={onChange}
          readOnly={readOnly}
        />
      </Linha>
      <TextField label="Abre às" type="time" name="horaInicio" value={disponibilidade.horaInicio} onChange={onChange} readOnly={readOnly} />
      <TextField label="Fecha às" type="time" name="horaFim" value={disponibilidade.horaFim} onChange={onChange} readOnly={readOnly} />
      <Linha>
        <Field label="Reservas externas">
          <Switch
            checked={!!disponibilidade.permiteExterno}
            onChange={onChangeExterno}
            disabled={readOnly}
            label={disponibilidade.permiteExterno ? 'Sim' : 'Não, só com empresa'}
          />
        </Field>
      </Linha>
    </>
  );
}
