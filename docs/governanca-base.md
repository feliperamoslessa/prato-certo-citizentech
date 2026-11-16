# Governança, Ética e Segurança — base para relatório Word

> **Versão inicial:** transformar em documento Word final, expandir com dicionário técnico completo e imagem do DFD. Exigência oficial: **12 termos**, **3 tabelas**, **4 políticas** e controles da tríade CID.

## 1. Objetivo
Documentar práticas de dados confiáveis, rastreáveis, protegidos e usados somente para facilitar a doação de excedentes elegíveis. Projeto conceitual, sem infraestrutura implementada.

## 2. Glossário de negócio (12 termos)
| Termo | Definição | Sinônimos | Fonte |
|---|---|---|---|
| Doador | Pessoa física ou jurídica que doa alimento voluntariamente | Estabelecimento doador | Lei 15.224/2025, art. 3 |
| Instituição receptora | Entidade que recebe e distribui ou utiliza doações | Entidade recebedora | Lei 15.224/2025, art. 3 |
| Beneficiário final | Pessoa que consome alimento doado | Destinatário final | Lei 15.224/2025, art. 3 |
| Banco de alimentos | Estrutura para captação e distribuição de alimentos doados | Centro de redistribuição | Lei 15.224/2025, art. 3 |
| Desperdício de alimentos | Perda ao fim da cadeia, no varejo ou consumo | Descarte evitável | Lei 15.224/2025, art. 3 |
| Lote de excedente | Conjunto rastreável de alimentos oferecidos | Oferta, lote | Definição proposta do projeto |
| Validade | Prazo informado de segurança comercial do produto | Prazo de vencimento | Definição proposta; verificar normas aplicáveis |
| Aptidão sanitária | Condição atestada por profissional habilitado para a doação | Conformidade sanitária | Lei 15.224/2025, art. 14 |
| Capacidade receptora | Quantidade de alimento que instituição informa poder receber | Capacidade disponível | Definição proposta do projeto |
| Janela de coleta | Intervalo permitido para retirar o lote | Prazo de retirada | Definição proposta do projeto |
| Doação concluída | Lote com recebimento confirmado | Entrega confirmada | Definição proposta do projeto |
| Taxa de aproveitamento | kg efetivamente doados / kg elegíveis ofertados | Índice de doação | Métrica proposta do projeto |

## 3. Tabelas nucleares
- `estabelecimentos`: `estabelecimento_id` (UUID/PK), `nome_fantasia` (VARCHAR), `bairro` (VARCHAR), `responsavel_contato` (VARCHAR protegido), `ativo` (BOOLEAN), `criado_em` (TIMESTAMP).
- `lotes_excedentes`: `lote_id` (UUID/PK), `estabelecimento_id` (UUID/FK), `descricao` (VARCHAR), `quantidade_kg` (DECIMAL > 0), `validade_em` (TIMESTAMP), `atestacao_sanitaria` (BOOLEAN), `estado` (ENUM), `criado_em` (TIMESTAMP).
- `doacoes`: `doacao_id` (UUID/PK), `lote_id` (UUID/FK), `instituicao_receptora_codigo` (VARCHAR pseudônimo), `aceito_em` (TIMESTAMP nullable), `entregue_em` (TIMESTAMP nullable), `quantidade_entregue_kg` (DECIMAL >= 0), `status` (ENUM).

**Ajuste arquitetural necessário antes do MVP real:** manter um cadastro controlado de instituições receptoras, em tabela adicional de apoio. As três tabelas acima são o núcleo exigido pelo relatório acadêmico, não o esquema completo do produto.

## 4. DFD
Quatro camadas: origem, processamento, armazenamento, consumo. Fonte editável em `architecture/fluxo-dados.mmd`; inserir captura legível no Word final. Linhagem: registro de criação → validação → mudança de estado → evento de entrega → indicador agregado.

## 5. Políticas operacionais
1. **Nomenclatura:** snake_case; chaves terminadas em `_id`; data ISO 8601 (AAAA-MM-DD em campos date); versão de esquema documentada.
2. **Qualidade e integridade:** impedir valores negativos, validade inválida, status fora do domínio; integridade referencial; registrar rejeições; executar profiling, analysis e cleansing com trilha.
3. **Rastreabilidade:** versionar dicionário de dados e regras; logs de ETL contendo fonte, data, transformação, contagem e erro; não sobrescrever histórico de status.
4. **Acesso e proteção:** RBAC e mínimo privilégio; pseudonimizar contatos nos ambientes de teste; mascarar dados em relatórios; base legal e retenção documentadas antes da operação.

## 6. Ética
A priorização é por regras explicáveis e não por pontuação social de pessoas. Não usar dados para vigilância punitiva de empregados, restaurantes ou cidadãos. Sem classificador preditivo, os riscos principais são validade digitada incorretamente, falsas declarações, cobertura desigual e falta de atualização de capacidade. Mitigação: validação por responsável habilitado, checagem humana, auditoria de decisões, canal de contestação e revisão de cobertura territorial.

## 7. Segurança da informação
- **Confidencialidade:** papéis RBAC (Operador Doador, Operador Receptor, Gestor da Plataforma e Auditor); TLS em trânsito; criptografia em repouso; segregação entre teste e produção.
- **Integridade:** PK/FK, validações de domínio, trilhas imutáveis onde viável, hashes de artefatos e reconciliação de entregas.
- **Disponibilidade:** backups redundantes, testes periódicos de restauração e monitoramento.
- Retenção de logs: **180 dias como parâmetro ilustrativo**, sujeita à avaliação jurídica, necessidade operacional e política interna.
- Dados de cidadãos beneficiários não são necessários no escopo proposto. Não publicar dados pessoais do projeto no GitHub.

## 8. Conclusão
A governança dá consistência às métricas, a ética limita usos indevidos, e a segurança protege pessoas e operações. O resultado esperado é maior capacidade de coordenação — e não ganho comprovado, que dependeria de piloto.

## Referência jurídica
https://www2.camara.leg.br/legin/fed/lei/2025/lei-15224-30-setembro-2025-798048-publicacaooriginal-176570-pl.html
