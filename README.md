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
