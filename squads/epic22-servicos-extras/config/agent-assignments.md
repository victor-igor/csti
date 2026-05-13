# Epic 22 — Mapa de Agentes e Responsabilidades

## Resumo Rápido

| Story/Fase | Agente | Escopo |
|-----------|--------|--------|
| 22.1 T1 | `@data-engineer` | Verificar trigger (PRÉ-FLIGHT BLOQUEANTE) |
| 22.1 T2-T4 | `@data-engineer` | Migration RPC + view + índice |
| 22.1 T5-T6 | `@dev` | Fix deleted_at + tipos TypeScript |
| 22.1 QA | `@qa` | Gate story 22.1 |
| 22.2 T1-T7 | `@dev` | UI completa SessionEvolutionModal |
| 22.2 QA | `@qa` | Gate story 22.2 |
| Deploy | `@devops` | push + PR (EXCLUSIVO) |

---

## @data-engineer (Dara) — Story 22.1 Tasks de BD

### Ativar
```
@data-engineer
*develop 22.1
```

### Responsabilidades
1. **T1 — OBRIGATÓRIO PRIMEIRO**: Verificar se trigger `atualizar_qtd_usada_pacote` é `AFTER INSERT OR UPDATE` ou apenas `AFTER UPDATE`. Se só UPDATE, ajustar.
2. **T2**: Migration `adicionar_servico_extra_sessao` com todas as validações de segurança
3. **T3**: View `v_agendamentos_com_preco` na mesma migration
4. **T4**: Índice parcial em `agendamentos.sales_package_item_id`

### Constraints
- NUNCA fazer git push (delegar para @devops)
- RPC deve derivar `usuario_id` de `auth.uid()` — não aceitar como parâmetro
- Validar `org_id` antes de qualquer INSERT

---

## @dev (Dex) — Story 22.1 TypeScript + Story 22.2 completa

### Ativar
```
@dev
*develop 22.1  # apenas T5 e T6
# após QA PASS 22.1:
*develop 22.2
```

### Responsabilidades
**Story 22.1:**
- T5: Fix `getSessionAppointments` com `.is('deleted_at', null)`
- T6: Interface `AdicionarServicoExtraPayload` sem `usuario_id`/`tutor_id`; função `adicionarServicoExtra()`

**Story 22.2:**
- T1–T7: Implementação completa do mini-form inline no `SessionEvolutionModal`
- Hook `useSessionEvolution` com `refreshSessionAppointments`

### Constraints
- NUNCA fazer git push (delegar para @devops)
- NÃO adicionar `tutorId` ou `usuarioId` às props do modal
- `adicionarServicoExtra()` não passa `usuario_id` nem `tutor_id`

---

## @qa (Quinn) — Gates 22.1 e 22.2

### Ativar
```
@qa
*qa-gate 22.1
# após PASS:
*qa-gate 22.2
```

### Gate 22.1 — Checklist
- [ ] Migration aplicada sem erros
- [ ] RPC rejeita `usuario_id` spoofado
- [ ] Ownership validado (vet não opera sessão alheia)
- [ ] Org isolation (catalog_item de outra org bloqueado)
- [ ] `sales_package_item_id` validado contra `pacote_id`
- [ ] Caso avulso: `origem_preco = 'avulso'`, `preco_referencia` correto
- [ ] Caso pacote: `origem_preco = 'pacote'`, `qtd_usada` incrementado
- [ ] View disponível e retorna dados corretos
- [ ] `getSessionAppointments` não retorna soft-deleted
- [ ] Build TypeScript sem erros

### Gate 22.2 — Checklist
- [ ] Botão `+ Serviço Extra` visível
- [ ] Avulso: serviço aparece na grade marcado
- [ ] Com pacote: `qtd_usada` incrementado, item correto
- [ ] Itens esgotados aparecem disabled
- [ ] Erro inline no mini-form
- [ ] Build e typecheck passam

---

## @devops (Gage) — Deploy Final

### Ativar (após ambos QA PASS)
```
@devops
*push
*create-pr
```

### Responsabilidades
- git push origin (OPERAÇÃO EXCLUSIVA)
- gh pr create com descrição do Epic 22
- Verificar CI/CD pass antes de merge

---

## Revisores (já concluídos ✅)

| Especialista | Squad | Status |
|-------------|-------|--------|
| Aria (Architect) | AIOX Core | ✅ Análise de viabilidade |
| CTO Architect | c-level-squad | ✅ ADR + segurança + escalabilidade |
| Datum (Data Chief) | data-squad | ✅ Modelo de dados + view recomendada |
