# Proposta executiva — Prato Certo (versão 0.1)

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
Aplicação responsiva de cadastro e acompanhamento de lotes, validação da elegibilidade e priorização explicável de instituições receptoras. Regras de negócio: somente lotes com confirmação de adequação sanitária, prazo ainda válido e condições de armazenamento documentadas podem ficar disponíveis para oferta. Matching não implica reserva automática; aceitação depende da organização.

**Acessibilidade:** formulários objetivos, contraste, compatibilidade com leitor de tela, interface mobile e possibilidade de registros por intermediário autorizado nos casos de baixa conectividade. Sincronização offline seria evolução futura.

## 5. Impacto e ODS
Indicadores previstos: kg efetivamente entregues; porcentagem dos lotes elegíveis com doação concluída; tempo mediano entre oferta e aceitação; taxa de cancelamento; proporção de instituições atendidas por território. Todos os números do protótipo serão marcados como **simulados**. ODS 2 e 12.3. Não equiparar automaticamente kg a refeições sem metodologia explícita.

## 6. Arquitetura
Origem: formulários de estabelecimentos e instituições; dados territoriais de apoio. Processamento: validação sanitária documental, regras de qualidade, georreferenciamento aproximado, ordenação explicável. Armazenamento: PostgreSQL com controle de acesso e trilhas de auditoria. Consumo: painel operacional, consulta de oferta e indicadores agregados. Ver `architecture/fluxo-dados.mmd`.

## 7. Protótipo
Tela A: cadastro de lote (tipo, peso, validade, armazenamento, atestado). Tela B: lista de ofertas elegíveis ordenadas por compatibilidade. Tela C: acompanhamento (ofertado → aceito → retirado → entregue). Tela D: painel agregado de resultados.

## 8. Uso responsável dos dados
Minimização de dados pessoais de responsáveis; não registrar beneficiários individuais; acesso por papéis; retenção definida; logs controlados; dados de localização no nível adequado à operação; auditabilidade das decisões. O projeto não pode classificar cidadãos como merecedores de ajuda nem penalizar estabelecimentos por não doar.

## Riscos principais
- Oferta com falha sanitária: bloquear cadastro sem evidência de verificação; dupla conferência antes da entrega.
- Dado de validade incorreto: validações, confirmação humana e trilha de auditoria.
- Exclusão territorial: monitorar distribuição das instituições atendidas; considerar apoio operacional fora do app.
- Interpretação indevida dos impactos: separar estimativas, metas, simulação e resultados reais.

## Fontes
PNUMA (2024): https://wedocs.unep.org/bitstream/handle/20.500.11822/45275/Food-Waste-Index-2024-key-messages.pdf?sequence=8

Lei 15.224/2025, arts. 14-17: https://www2.camara.leg.br/legin/fed/lei/2025/lei-15224-30-setembro-2025-798048-publicacaooriginal-176570-pl.html
