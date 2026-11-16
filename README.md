# 🍽️ Prato Certo — Tecnologia que alimenta conexões

> Projeto conceitual CitizenTech | Global Solution 2026.2 — FIAP | Data Science

**Missão:** conectar estabelecimentos com excedentes alimentares aptos à doação a organizações receptoras, com priorização transparente, rastreabilidade e proteção de dados.

**Status:** proposta acadêmica / protótipo conceitual. Não representa sistema operacional, entrega real de alimentos ou validação sanitária.

## Problema e território
Piloto proposto no município de São Paulo (SP). A operação de alimentos combina excedentes de curta janela de aproveitamento com organizações receptoras que possuem capacidade e condições de recebimento. A hipótese é que informação fragmentada e coordenação logística insuficiente aumentem oportunidades perdidas de doação. Essa hipótese precisa ser validada em entrevistas.

## Solução
1. Estabelecimento cadastra um lote de excedentes, quantidade, validade e requisitos de conservação.
2. Responsável habilitado confirma a aptidão para doação, conforme exigências sanitárias.
3. O sistema filtra instituições elegíveis e ordena alternativas por compatibilidade, distância e prazo.
4. Organização aceita a oferta e confirma retirada e recebimento.
5. Painel mostra volume efetivamente doado, taxa de aproveitamento e tempos de operação.

**Não há promessa de aprovação sanitária automática** nem de predição de IA treinada.

## Objetivos de Desenvolvimento Sustentável
- **ODS 2:** apoio indireto a ações contra a insegurança alimentar.
- **ODS 12, especialmente 12.3:** redução potencial de desperdício no varejo e serviços alimentares.

## Entregáveis FIAP
- Proposta executiva: `presentation/`
- Vídeo pitch e arquivos-fonte: `pitch/` e `src/`
- Relatório de Governança, Ética e Segurança: `docs/`
- Diagrama de fluxo: `architecture/`
- Dados de demonstração: `data/`

## Tecnologias propostas
Formulário web responsivo / interface leve; API Python (FastAPI, como opção futura); PostgreSQL; ETL Python; Metabase ou Power BI; geocodificação por OpenStreetMap, condicionada a limites/licenças. Tecnologias são **propostas**, não implementadas.

## Boas práticas
Dados simulados estão marcados como tais. Não publicar nomes, RMs, contatos reais, coordenadas domiciliares, dados de beneficiários nem segredos de API. Documentação acadêmica com nomes/RMs deve ficar em entrega privada.

## Fontes
- [PNUMA — Food Waste Index Report 2024, mensagens-chave](https://wedocs.unep.org/bitstream/handle/20.500.11822/45275/Food-Waste-Index-2024-key-messages.pdf?sequence=8)
- [Lei 15.224/2025 — Câmara dos Deputados](https://www2.camara.leg.br/legin/fed/lei/2025/lei-15224-30-setembro-2025-798048-publicacaooriginal-176570-pl.html)
- [ONU — ODS 2](https://sdgs.un.org/goals/goal2) e [ODS 12](https://sdgs.un.org/goals/goal12)

## Equipe
**Preencher somente nas cópias privadas de entrega:** [nomes completos e RMs, em ordem alfabética]. 

## Executar o protótipo localmente

Requisitos: Node.js 22.18 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite no terminal. Use o menu para acessar o dashboard de
impacto, cadastrar um excedente ou filtrar as doações por status e instituição.

| Script | O que faz |
| --- | --- |
| `npm run dev` | Inicia o servidor local com atualização automática. |
| `npm run build` | Verifica os tipos e gera o site estático em `dist/`. |
| `npm run preview` | Serve o build localmente após a compilação. |
| `npm test` | Executa os testes de validação, registro e filtros. |

A interface usa React, TypeScript, Vite e Tailwind CSS. Os indicadores e as instituições
são fictícios. O dashboard apresenta uma série histórica independente da lista de
acompanhamento. Os lotes cadastrados ficam em memória e são descartados ao recarregar
a página. Cada novo lote fica pendente de verificação sanitária humana e indisponível
para oferta. O protótipo funciona sem backend, autenticação ou integrações externas.

### Animações e pitch

A visão de impacto usa GSAP na abertura, Three.js com React Three Fiber na cena 3D,
Lenis na rolagem e Motion nas transições e nos cards. A preferência do sistema por
movimento reduzido ativa a ilustração estática e mantém a rolagem nativa.

O botão **Abrir vídeo** no dashboard exibe a apresentação curta e silenciosa de 38
segundos. A composição usa Remotion e fica em `pitch/video/`.

- `npm run pitch:studio` abre o editor local do vídeo.
- `npm run pitch:render` gera `pitch/prato-certo.mp4` em 1080p, a 30 quadros por segundo.
  O Remotion pode baixar o navegador de renderização na primeira execução.
