# Bug Report — CalendarSettingsModal sobrescreve google_calendar_id com undefined

**Data:** 2026-04-17  
**Arquivo:** `src/modules/agendamentos/components/CalendarSettingsModal.tsx`  
**Severidade:** Alta — profissionais desaparecem do seletor de agendamento

---

## Sintoma

Profissional com agenda configurada (ex: Milena Rodrigues) não aparece no dropdown
"Profissional Responsável" ao criar/editar agendamento.

**Causa raiz:** `config_agenda.google_calendar_id` está sendo sobrescrito com `undefined`
no banco durante o save da modal de configuração.

---

## Fluxo do Bug

### `handleSave` — linha 217 até 252

```typescript
const updates = users.map(user => {           // ← itera TODOS os usuários
    const calendarId = mappings[user.id];      // ← undefined se usuário não tem mapping no state
    const mainCal = calendars.find(c => c.id === calendarId);

    const newConfig = {
        ...user.config_agenda,
        google_calendar_id: calendarId,        // ← SOBRESCREVE com undefined
        google_calendar_summary: mainCal?.summary || 'Agenda Principal',
        ...
    };

    return supabase.from('usuarios').update({ config_agenda: newConfig }).eq('id', user.id);
    //              ↑ UPDATE enviado para TODOS, mesmo sem calendarId
});
```

### Por que `mappings[user.id]` pode ser `undefined`?

O estado `mappings` é inicializado apenas para usuários **visíveis** na UI no momento do
carregamento. Se um usuário entrou na lista depois (ex: outro admin adicionou), ou se o
componente foi remontado parcialmente, o `mappings` para esse usuário fica sem entrada.

---

## Impacto em cascata

1. `config_agenda.google_calendar_id = undefined` no banco
2. `AppointmentDetailsModal.tsx:1538` filtra: `user.config_agenda?.google_calendar_id`
3. Profissional desaparece do seletor → **impossível agendá-lo**

---

## Fix Aplicado

**Arquivo:** `CalendarSettingsModal.tsx` linha 240-246

Antes:
```typescript
const newConfig = {
    ...user.config_agenda,
    google_calendar_id: calendarId,
    google_calendar_summary: mainCal?.summary || 'Agenda Principal',
    conflict_calendars: conflictCalObjects,
    default_event_color: defaultColor
};
```

Depois:
```typescript
const newConfig = {
    ...user.config_agenda,
    ...(calendarId && {
        google_calendar_id: calendarId,
        google_calendar_summary: mainCal?.summary || 'Agenda Principal',
    }),
    conflict_calendars: conflictCalObjects,
    default_event_color: defaultColor
};
```

**Princípio:** só sobrescreve `google_calendar_id` se um novo valor foi explicitamente selecionado.
Preserva o valor anterior via spread de `user.config_agenda`.

---

## Verificação

Após o fix, rodar no Supabase para confirmar usuários afetados:

```sql
SELECT nome, config_agenda->>'google_calendar_id' as cal_id
FROM usuarios
WHERE ativo = true
  AND (config_agenda->>'google_calendar_id' IS NULL OR config_agenda->>'google_calendar_id' = '')
ORDER BY nome;
```

Usuários que retornarem precisam reconfigurar a agenda manualmente (os dados foram apagados pelo bug).

---

*Identificado por: investigação do filtro `.filter(user => user.config_agenda?.google_calendar_id)` em AppointmentDetailsModal.tsx:1538*
