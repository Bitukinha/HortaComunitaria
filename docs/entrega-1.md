# Horta Comunitária — 1ª Entrega da AEP (Bimestre 1, 2026.2)

**Equipe:** Jean Novaes, Gabriel Kondo, Lucas Reche
**Curso:** Engenharia de Software / Análise e Desenvolvimento de Sistemas — UniCesumar
**Repositório:** https://github.com/Bitukinha/HortaComunitaria

---

## 1. Descoberta

Hortas comunitárias urbanas costumam ser organizadas de forma informal —
cadernos de anotação, grupos de mensagens e memória dos voluntários mais
antigos. Levantamos, junto a esse tipo de iniciativa, três dores recorrentes
que servem de origem para os requisitos deste projeto:

1. **Perda de informação sobre o que foi plantado e onde.** Sem um registro
   central, ninguém sabe com certeza qual canteiro está com qual cultura, nem
   há quanto tempo — o que compromete o planejamento do próximo plantio.
2. **Falta de rastreio da colheita até o destino final.** O alimento colhido
   é doado, consumido pelos próprios participantes ou vendido, mas não existe
   controle de quanto foi para cada destino nem garantia de que a soma
   destinada bate com o que foi realmente colhido — abrindo espaço para
   destinar mais do que existe.
3. **Dificuldade em reconhecer e coordenar quem participa.** Sem um cadastro
   de participantes e do histórico de atividades (rega, adubação, poda,
   colheita), a divisão de tarefas depende de comunicação informal e é fácil
   perder de vista quem fez o quê.

Essas dores são a origem direta da regra de negócio central do sistema: **a
quantidade destinada de uma colheita nunca pode ultrapassar a quantidade
colhida** (ver [`der.md`](./der.md)), e da lista de requisitos abaixo.

## 2. Concepção e Alinhamento aos ODS

O **Horta Comunitária** é um sistema de gestão para hortas coletivas urbanas:
cadastro de participantes, canteiros, culturas, plantios, atividades de
manejo, colheitas e destinação do que é colhido, com um painel de
indicadores gerais.

O projeto está alinhado a três Objetivos de Desenvolvimento Sustentável da
ONU:

- **ODS 2 — Fome Zero e Agricultura Sustentável**: ao registrar e rastrear
  destinações como doação, cozinha comunitária e banco de alimentos, o
  sistema apoia diretamente o combate à insegurança alimentar local.
- **ODS 11 — Cidades e Comunidades Sustentáveis**: hortas comunitárias
  ocupam e requalificam espaços urbanos coletivamente, e o sistema torna essa
  gestão coletiva viável em escala (múltiplos canteiros, múltiplos
  voluntários).
- **ODS 12 — Consumo e Produção Responsáveis**: a regra de negócio que
  impede destinar mais do que foi colhido, e o histórico de atividades por
  canteiro, promovem o uso responsável do que é produzido e evitam
  desperdício de registro (e, indiretamente, de alimento).

## 3. Lista de Requisitos

1. O sistema deve permitir o cadastro de participantes, com nome completo,
   contato (e-mail ou telefone) e tipo de participação (Administrador,
   Responsável ou Voluntário).
2. O sistema deve permitir o cadastro de canteiros, com identificação única,
   localização, tamanho em m² e status (Ativo, Em preparo, Em colheita ou
   Inativo).
3. O sistema deve permitir o cadastro de culturas (espécies cultivadas), com
   nome, categoria e período estimado de cultivo em dias.
4. O sistema deve permitir registrar plantios, associando uma cultura a um
   canteiro, com data do plantio, quantidade de mudas/sementes e observação.
5. O sistema deve permitir registrar atividades de manejo (rega, adubação,
   capina, poda, controle de pragas, preparo de solo) associadas a um
   canteiro e a um participante responsável, com data e descrição.
6. O sistema deve permitir registrar colheitas a partir de um plantio, com
   data e quantidade colhida em kg.
7. O sistema deve permitir registrar destinações de uma colheita (doação,
   cozinha comunitária, banco de alimentos, consumo dos participantes ou
   venda solidária), **impedindo que a soma das destinações de uma colheita
   ultrapasse a quantidade colhida**.
8. O sistema deve apresentar um painel com indicadores gerais: total de
   participantes, canteiros ativos, total colhido (kg) e total destinado
   (kg).

## 4. Justificativa Técnica e Arquitetural

| Escolha                                                                                        | Por quê                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript + React**                                                                         | Tipagem estática reduz erros de integração entre as várias entidades relacionadas (canteiro → plantio → colheita → destinação) e o ecossistema React tem suporte maduro para formulários e tabelas, que são a maior parte da interface deste sistema.                                                                                                                                                                                                                                                    |
| **TanStack Start (SSR + Server Functions)**                                                    | Permite manter toda a lógica de acesso ao banco em funções que só executam no servidor (`src/integrations/db`), sem expor a _connection string_ do banco ao navegador, e sem precisar montar uma API REST separada — as _server functions_ já fazem esse papel de forma tipada de ponta a ponta.                                                                                                                                                                                                         |
| **PostgreSQL (Neon)**                                                                          | Os dados do domínio são fortemente relacionais (um canteiro tem N plantios, um plantio tem N colheitas, uma colheita tem N destinações) e a regra de negócio mais importante do sistema — destinação não pode exceder colheita — é natural de expressar como uma _constraint_/_trigger_ de banco relacional, garantindo a integridade mesmo se a regra falhar na aplicação. O Neon oferece Postgres gerenciado, com _connection pooling_ pronto para uso em funções serverless/servidores de vida curta. |
| **Padrão arquitetural em camadas**                                                             | `routes/` (apresentação) → `components/EntityCrud` (interação genérica) → `lib/horta.ts` (regras de acesso a dados) → `integrations/db` (persistência via _server functions_ + `pg`). Cada camada só conhece a camada imediatamente abaixo, o que permite trocar a camada de persistência (como já foi feito, migrando de Supabase para conexão direta com o Neon) sem reescrever a interface.                                                                                                           |
| **Modelo de domínio orientado a objetos** (ver [`diagrama-classes.md`](./diagrama-classes.md)) | `Pessoa` → `Participante` (herança) e `RegistroProdutivo` → `Plantio`/`Colheita` (polimorfismo) isolam o comportamento específico de cada entidade produtiva, enquanto a composição `Canteiro → Plantio → Colheita → Destinacao` modela fielmente o ciclo de vida real desses registros (excluir um canteiro deve excluir os plantios que dependem dele).                                                                                                                                                |

## 5. Ambiente de Controle de Versão

Repositório público no GitHub: **https://github.com/Bitukinha/HortaComunitaria**

## 6. Estrutura do Repositório

```
HortaComunitaria/
├── src/            # aplicação (rotas, componentes, integrações)
├── docs/           # este documento, diagrama de classes e DER
├── database/       # schema.sql (DDL) e seed.sql (dados de exemplo)
└── README.md       # descrição, ODS, requisitos, cronograma e como rodar
```

## 7. Diagramas

- Diagrama de Classe: [`diagrama-classes.md`](./diagrama-classes.md)
- Diagrama do Banco (DER): [`der.md`](./der.md)

## 8. Cronograma

Ver a tabela de Cronograma de Execução no [`README.md`](../README.md#cronograma-de-execução) —
o mesmo cronograma apresentado neste documento é espelhado lá, conforme exigido.
