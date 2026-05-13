# Plano de Melhoria UI/UX — Tela "Minha Clínica"

**Elaborado por:** Uma (UX Design Expert)  
**Data:** 2026-04-17  
**Arquivo alvo:** `src/modules/organization/pages/OrganizationSettings.tsx`  
**Status:** Aguardando aprovação

---

## Diagnóstico: Problemas Identificados

### 1. Nome da clínica duplicado e sem propósito
O nome "ReabilitaCão" aparece **duas vezes**: no `PageHeader` (título da página) e como um `<input>` editável abaixo das abas — criando redundância visual e confusão sobre o que é display vs. o que é editável.

### 2. "Sobre a Clínica" sufoca a tela
O campo de descrição exibe um bloco de texto corrido de +500 palavras sem truncamento, sem hierarquia visual. Isso domina toda a viewport, empurrando as seções de Endereço e Contatos para fora de vista.

### 3. Section headers incompletos
`IDENTIFICAÇÃO` e `SOBRE A CLÍNICA` usam `uppercase` mas não possuem separadores visuais claros. Os dados de CNPJ e Responsável Técnico ficam soltos, sem cards ou grouping.

### 4. Layout sem ritmo visual
- Separadores `h-px` entre seções são muito sutis
- Espaçamento inconsistente (às vezes `mb-6`, às vezes `space-y-6`)
- O bloco do nome (`text-2xl font-black`) cria peso visual isolado sem contexto (badge de status, avatar, etc.)

### 5. Ausência de feedback de estado vazio
Quando campos como CNPJ e Responsável não estão preenchidos, o estado vazio usa italic cinza — pouco convidativo para o usuário completar o cadastro.

---

## Plano de Melhoria (4 Iniciativas)

---

### Iniciativa 1 — Header da Unidade: Profile Card

**Problema:** Nome duplicado + edição inline invisível  
**Solução:** Substituir o `<input>` solto por um **Profile Card** compacto no topo do conteúdo da aba `Detalhes`.

**Layout proposto:**
```
┌─────────────────────────────────────────────────────┐
│  🏥  ReabilitaCão                    [✏️ Editar nome] │
│       CNPJ: 36.718.372/0001-03                      │
│       Resp. Técnico: Francielly Arenazio Passarini  │
└─────────────────────────────────────────────────────┘
```

- Ícone `Building2` com fundo `bg-primary/10` rounded
- Nome como `h2` estático (não mais `<input>` inline)
- Botão "Editar nome" abre modal ou inline edit com confirmação explícita
- CNPJ e Resp. Técnico aparecem como chips/badges compactos logo abaixo do nome
- **Efeito:** Elimina a redundância com o PageHeader e concentra identidade da unidade em um card profissional

**Arquivos a modificar:**
- `OrganizationSettings.tsx` — remover `<input>` de nome da linha 161-168
- `OrganizationSettings.tsx` — criar componente `UnitProfileCard` inline

---

### Iniciativa 2 — "Sobre a Clínica": Texto Truncado com Expandir

**Problema:** Bloco de texto corrido sufoca a viewport  
**Solução:** Truncar em **3 linhas** com botão "Ler mais / Recolher"

**Comportamento:**
- Estado padrão: 3 linhas + `...` + link "Ler descrição completa ↓"
- Ao clicar: expand com `animate-in slide-in-from-top-1` suave
- Badge "Ajuda a IA" permanece visível no header da seção

**Código de referência (view mode):**
```tsx
const [expanded, setExpanded] = useState(false);
<p className={cn(
  "text-sm text-gray-600 leading-relaxed",
  !expanded && "line-clamp-3"
)}>
  {metadata.description}
</p>
{metadata.description && metadata.description.length > 200 && (
  <button onClick={() => setExpanded(e => !e)}
    className="text-xs text-primary font-medium mt-1 hover:underline">
    {expanded ? "Recolher ↑" : "Ler descrição completa ↓"}
  </button>
)}
```

**Arquivos a modificar:**
- `OrganizationSettings.tsx` — view mode do `SectionEditableBlock` "Sobre a Clínica" (linhas 270-275)

---

### Iniciativa 3 — Seção Identificação: Data Cards com Visual Claro

**Problema:** Dados soltos sem agrupamento  
**Solução:** Cards info com ícone + label + valor, organizados em grid 2 colunas

**Layout atual (problemático):**
```
CNPJ                    36.718.372/0001-03
⚕️ Responsável Téc.     Francielly Arenazio Passarini
                                                32662
```

**Layout proposto (view mode):**
```
┌─────────────────────┐  ┌─────────────────────────────────┐
│ 📄 CNPJ             │  │ ⚕️ RESPONSÁVEL TÉCNICO           │
│ 36.718.372/0001-03  │  │ Francielly Arenazio Passarini   │
│                     │  │ CREFITO: 32662                  │
└─────────────────────┘  └─────────────────────────────────┘
```

- Cada info em card `bg-gray-50 border rounded-lg p-4`
- Label em `text-xs uppercase text-gray-400`
- Valor em `text-sm font-semibold text-gray-900`
- Quando vazio: card com estado "Não informado" + link "Adicionar →"

**Arquivos a modificar:**
- `OrganizationSettings.tsx` — view mode da seção Identificação (linhas 222-244)

---

### Iniciativa 4 — Separadores: Hierarquia Visual por Seção

**Problema:** Separadores `h-px` muito sutis, sem distinção entre seções  
**Solução:** Substituir por seções com `space-y-8` e section titles com fundo sutil

**Padrão proposto para cada section header:**
```
──────────── IDENTIFICAÇÃO ────────────  [✏️ Editar]
```

Implementado como:
```tsx
<div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400">
  <div className="flex-1 h-px bg-gray-100" />
  <span>{title}</span>
  <div className="flex-1 h-px bg-gray-100" />
</div>
```

Isso cria divisão visual elegante sem cores pesadas.

**Arquivos a modificar:**
- `SectionEditableBlock` component (se centralizado) ou cada seção em `OrganizationSettings.tsx`

---

## Resumo de Impacto

| Problema | Severidade | Iniciativa | Esforço |
|----------|-----------|------------|---------|
| Nome duplicado | Alta | 1 | Médio |
| Texto sufoca viewport | Alta | 2 | Baixo |
| Dados de identificação soltos | Média | 3 | Baixo |
| Separadores fracos | Baixa | 4 | Baixo |

**Esforço total estimado:** ~3-4h de implementação  
**Risco:** Baixo — sem mudanças de API ou estrutura de dados  
**Impacto visual:** Alto — tela passa de "bagunçada" para profissional

---

## Próximos Passos (após aprovação)

1. [ ] Aprovar este plano
2. [ ] `@dev` implementar Iniciativa 2 (menor risco, maior impacto visual)
3. [ ] `@dev` implementar Iniciativa 3 (data cards identificação)
4. [ ] `@dev` implementar Iniciativa 1 (profile card + remover nome duplicado)
5. [ ] `@dev` implementar Iniciativa 4 (separadores)
6. [ ] `@qa` revisar resultado final no browser

---

*— Uma, desenhando com empatia 💝*
