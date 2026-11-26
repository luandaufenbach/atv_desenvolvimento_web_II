import Field from '@/components/ui/Field';
import { Linha } from '@/components/FormLayout';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/Icon';
import Select from '@/components/ui/Select';
import TextField from '@/components/ui/TextField';
import { DIAS_SEMANA, formatarData, hoje } from '@/services/formatos';

const OPCOES_STATUS = [
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export function BadgeStatus({ status }) {
  if (status === 'CONFIRMADA') return <Badge tone="success" icon="check_circle">Confirmada</Badge>;
  if (status === 'CANCELADA') return <Badge tone="error" icon="cancel">Cancelada</Badge>;
  return null;
}

// Mostra os horários em que o espaço abre no dia da semana da data escolhida
function HorariosDoDia({ reserva, disponibilidades }) {
  if (!reserva.espacoId || !reserva.data) return null;

  const dia = new Date(`${reserva.data}T00:00:00`).getDay();
  const doDia = disponibilidades.filter((d) => d.espacoId === reserva.espacoId && d.diaSemana === dia);

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: '12px 14px',
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        font: '400 13px/18px var(--font-sans)',
        color: 'var(--text-secondary)',
      }}
    >
      <Icon name="schedule" size={18} color="var(--text-gold)" />
      {doDia.length === 0 ? (
        <span>O espaço não abre {DIAS_SEMANA[dia].toLowerCase()}. Escolha outra data.</span>
      ) : (
        <span>
          Horários deste espaço ({DIAS_SEMANA[dia].toLowerCase()}):{' '}
          {doDia.map((d, i) => (
            <span key={d._id}>
              {i > 0 && ', '}
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {d.horaInicio}–{d.horaFim}
              </strong>
              {!d.permiteExterno && ' (só empresas)'}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

/**
 * Campos do formulário de reserva.
 * modo: 'create', 'update' (permite trocar o status) ou 'read'.
 * espacos, usuarios, empresas e disponibilidades vêm da API pelo componente pai.
 */
export default function ReservaCampos({ reserva, espacos = [], usuarios = [], empresas = [], disponibilidades = [], onChange, modo = 'read' }) {
  const readOnly = modo === 'read';

  return (
    <>
      <Linha>
        <Select
          label="Espaço"
          name="espacoId"
          placeholder={readOnly ? undefined : 'Selecione o espaço'}
          options={espacos.map((e) => ({ value: e._id, label: `${e.nome} · até ${e.capacidade} pessoa(s)` }))}
          value={reserva.espacoId}
          onChange={onChange}
          readOnly={readOnly}
        />
      </Linha>
      <Select
        label="Usuário"
        name="usuarioId"
        placeholder={readOnly ? undefined : 'Selecione o usuário'}
        options={usuarios.map((u) => ({ value: u._id, label: u.nome }))}
        value={reserva.usuarioId}
        onChange={onChange}
        readOnly={readOnly}
      />
      <Select
        label="Empresa"
        name="empresaId"
        placeholder="Sem empresa (reserva externa)"
        options={empresas.map((e) => ({ value: e._id, label: e.nome }))}
        value={reserva.empresaId || ''}
        onChange={onChange}
        readOnly={readOnly}
      />
      {readOnly ? (
        <TextField label="Data" name="data" value={formatarData(reserva.data)} readOnly />
      ) : (
        <TextField label="Data" type="date" name="data" min={modo === 'create' ? hoje() : undefined} value={reserva.data} onChange={onChange} />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="Início" type="time" name="horaInicio" value={reserva.horaInicio} onChange={onChange} readOnly={readOnly} />
        <TextField label="Fim" type="time" name="horaFim" value={reserva.horaFim} onChange={onChange} readOnly={readOnly} />
      </div>

      {!readOnly && (
        <Linha>
          <HorariosDoDia reserva={reserva} disponibilidades={disponibilidades} />
        </Linha>
      )}

      {modo === 'update' && <Select label="Situação" name="status" options={OPCOES_STATUS} value={reserva.status} onChange={onChange} />}

      {readOnly && reserva.status && (
        <Field label="Situação">
          <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
            <BadgeStatus status={reserva.status} />
          </div>
        </Field>
      )}
      {readOnly && reserva.dataCadastro && <TextField label="Reservado em" name="dataCadastro" value={formatarData(reserva.dataCadastro)} readOnly />}
    </>
  );
}
