# Proposta executiva — Prato Certo (protótipo v0.2 + revisão de dados)

## 1. Identificação
Prato Certo — Tecnologia que alimenta conexões. Turma: [PREENCHER]. Integrantes: [PREENCHER NOMES E RMs EM ORDEM ALFABÉTICA]. Responsável: [PREENCHER].

## 2. Contextualização e recorte
Em 2022, o desperdício mundial estimado no varejo, serviços de alimentação e domicílios foi de **1,05 bilhão de toneladas**, segundo o *Food Waste Index Report 2024*, do PNUMA. Essa estatística é **global** e não deve ser apresentada como dado de São Paulo. Em São Paulo, o piloto se restringirá a restaurantes, padarias e organizações sociais de um distrito a definir. A confirmação da demanda local exige entrevistas e levantamento de dados complementares.

**Problema operacional específico:** estabelecimentos que dispõem de excedentes potencialmente doáveis e instituições receptoras podem não se conectar dentro da janela segura de aproveitamento.

**Persona ilustrativa (hipótese):** gerente de restaurante com pouco tempo para localizar instituições aptas e registrar retirada de alimentos; coordenadora de organização social com capacidade logística restrita. Validar perfis em entrevistas.

## 3. Público beneficiado e ecossistema
- Estabelecimentos doadores: precisam de registro simples e regras claras.
- Organizações receptoras: precisam de ofertas confiáveis e planejamento de coleta.
- Comunidade atendida: beneficia-se indiretamente de doações, sem necessidade de cadastro individual na plataforma.
- Profissionais habilitados: realizam atestação sanitária exigível; sistema não substitui avaliação técnica.
- Parceiros públicos e entidades locais: podem apoiar integração e supervisão, sem parceria já firmada.

## 4. Solução
Protótipo responsivo de cadastro e acompanhamento de lotes, com validação local da elegibilidade e recomendação explicável entre instituições fictícias. O matching já existe no front-end, mas usa capacidade, conservação, distâncias e tempos **simulados** e não executa logística real. Regras de negócio: somente lotes com confirmação de adequação sanitária, prazo ainda válido e condições de armazenamento documentadas podem ficar disponíveis para oferta. Matching não implica reserva automática; aceitação depende da organização.

**Acessibilidade:** formulários objetivos, contraste, semântica HTML, navegação por teclado e interface mobile. Compatibilidade completa com leitores de tela ainda demanda validação prática. Registro assistido em cenários de baixa conectividade é proposta futura. Sincronização offline seria evolução futura.

## 5. Impacto e ODS
Indicadores previstos: kg efetivamente entregues; taxa de aproveitamento (kg entregues ÷ kg ofertados); tempo mediano entre oferta e aceitação; taxa de cancelamento; proporção de instituições atendidas por território. Todos os números do protótipo serão marcados como **simulados**. ODS 2 e 12.3. Não equiparar automaticamente kg a refeições sem metodologia explícita.

## 6. Arquitetura
No protótipo: origem em formulário local e cenário simulado; processamento em funções TypeScript de validação, matching e agregação; armazenamento em estado React e opcionalmente `localStorage`; consumo em dashboard e fluxo operacional. Arquitetura **futura**, não implementada: ingestão de cadastros de estabelecimentos e instituições, processamento ETL com verificação documental humana, PostgreSQL com controles de acesso e auditoria, integração com mapas reais e relatórios agregados. Ver `architecture/fluxo-dados.mmd`.

## 7. Protótipo
Tela A: cadastro de lote (tipo, peso, validade, armazenamento), sempre pendente de verificação humana. Tela B: recomendação explicável, para lotes pré-verificados **no cenário fictício**, com escolha manual da instituição. Tela C: acompanhamento de oferta, aceite, retirada e entrega simulados. Tela D: dashboard cujos indicadores derivam dos mesmos lotes e são agrupados pelo mês da primeira oferta, no horário de São Paulo.

## 8. Uso responsável dos dados
O protótipo não solicita dados pessoais reais nem de beneficiários finais; todos os cadastros e localizações são fictícios. Para operação futura, planejam-se minimização de contatos, acesso por papéis, retenção e logs controlados, localização no nível necessário e auditabilidade das decisões. Esses controles de backend **não estão implementados**. O projeto não pode classificar cidadãos como merecedores de ajuda nem penalizar estabelecimentos por não doar.

## Riscos principais
- Oferta com falha sanitária: bloquear cadastro sem evidência de verificação; dupla conferência antes da entrega.
- Dado de validade incorreto: validações, confirmação humana e trilha de auditoria.
- Exclusão territorial: monitorar distribuição das instituições atendidas; considerar apoio operacional fora do app.
- Interpretação indevida dos impactos: separar estimativas, metas, simulação e resultados reais.

## Fontes
PNUMA (2024): https://wedocs.unep.org/bitstream/handle/20.500.11822/45275/Food-Waste-Index-2024-key-messages.pdf?sequence=8

Lei 15.224/2025, arts. 14-17: https://www2.camara.leg.br/legin/fed/lei/2025/lei-15224-30-setembro-2025-798048-publicacaooriginal-176570-pl.html
