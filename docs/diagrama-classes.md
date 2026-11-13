# Diagrama de Classes

Modelo de domínio orientado a objetos do Horta Comunitária, implementado em
[`/src/domain`](../src/domain). As classes envelopam as linhas das tabelas de
[`/database/schema.sql`](../database/schema.sql) (cada uma tem um `fromRow()`
que converte a coluna `snake_case` do banco para o atributo `camelCase` da
classe) e concentram as regras de negócio. Contém os elementos exigidos pela
AEP: **classe abstrata**, **herança**, **polimorfismo via `override`** e
**composição de multiplicidade 1:N**.

```mermaid
classDiagram
    class Pessoa {
        <<abstract>>
        #id: string
        #nome: string
        #contato: string
        +getNome() string
        +getContato() string
        +getResumo()* string
    }

    class Participante {
        -tipoParticipacao: TipoParticipacao
        +fromRow(row)$ Participante
        +getTipoParticipacao() TipoParticipacao
        +getResumo() string
    }

    class RegistroProdutivo {
        <<abstract>>
        #id: string
        #data: string
        +getData() string
        +calcularIndicador()* number
        +getRotuloIndicador()* string
        +somarIndicadores(registros)$ Map
    }

    class Plantio {
        -canteiroId: string
        -culturaId: string
        -quantidade: number
        -observacao: string
        -colheitas: Colheita[]
        +fromRow(row)$ Plantio
        +adicionarColheita(c: Colheita) void
        +calcularIndicador() number
        +getRotuloIndicador() string
    }

    class Colheita {
        -plantioId: string
        -quantidadeKg: number
        -destinacoes: Destinacao[]
        +fromRow(row, destinacoes)$ Colheita
        +getTotalDestinado() number
        +getSaldoDisponivel() number
        +estaTotalmenteDestinada() boolean
        +verificarDestinacao(d: Destinacao, editando: boolean) void
        +adicionarDestinacao(d: Destinacao) void
        +verificarNovaQuantidade(kg: number) void
        +calcularIndicador() number
        +getRotuloIndicador() string
    }

    class Destinacao {
        -tipoDestino: string
        -quantidadeKg: number
        -data: string
        +fromRow(row)$ Destinacao
        +verificarCampos() void
        +validarContraColheita(disponivel: number) boolean
    }

    class Canteiro {
        -identificacao: string
        -localizacao: string
        -tamanhoM2: number
        -status: StatusCanteiro
        -plantios: Plantio[]
        +fromRow(row)$ Canteiro
        +estaAtivo() boolean
        +adicionarPlantio(p: Plantio) void
    }

    class Cultura {
        -nome: string
        -categoria: string
        -periodoCultivoDias: number
        +fromRow(row)$ Cultura
    }

    class Atividade {
        -tipo: string
        -data: string
        -canteiroId: string
        -participanteId: string
        -descricao: string
        +fromRow(row)$ Atividade
    }

    class Error
    class RegraDeNegocioError {
        +toString() string
    }

    Pessoa <|-- Participante : herança
    RegistroProdutivo <|-- Plantio : herança + polimorfismo (override)
    RegistroProdutivo <|-- Colheita : herança + polimorfismo (override)
    Error <|-- RegraDeNegocioError : herança

    Canteiro "1" *-- "0..*" Plantio : composição 1-N
    Plantio "1" *-- "0..*" Colheita : composição 1-N
    Colheita "1" *-- "0..*" Destinacao : composição 1-N

    Canteiro "1" o-- "0..*" Atividade : associação
    Participante "1" o-- "0..*" Atividade : associação
    Cultura "1" o-- "0..*" Plantio : associação
    Colheita ..> RegraDeNegocioError : lança
```

Legenda: `*` depois do método = abstrato; `$` = estático; `#` protegido;
`-` privado; `+` público.

## Onde está cada requisito de POO no código

| Pilar | Onde | Como é usado no app |
|---|---|---|
| **Classe abstrata** | [`Pessoa`](../src/domain/Pessoa.ts) e [`RegistroProdutivo`](../src/domain/RegistroProdutivo.ts) (`abstract class`, métodos `abstract`) | Não podem ser instanciadas; obrigam as subclasses a implementar `getResumo()` / `calcularIndicador()` / `getRotuloIndicador()`. |
| **Herança** | `Participante extends Pessoa`; `Plantio` e `Colheita extends RegistroProdutivo`; `RegraDeNegocioError extends Error` | Atributos e métodos comuns (`id`, `data`, `getNome()`…) ficam na superclasse. |
| **Polimorfismo (`override`)** | `calcularIndicador()` e `getRotuloIndicador()` sobrescritos em [`Plantio`](../src/domain/Plantio.ts) (mudas/sementes) e [`Colheita`](../src/domain/Colheita.ts) (kg colhidos); `getResumo()` em `Participante` | O **Painel** ([`src/routes/index.tsx`](../src/routes/index.tsx)) monta um `RegistroProdutivo[]` com plantios e colheitas e chama `RegistroProdutivo.somarIndicadores()`, que invoca o mesmo método sem saber o subtipo. O `tsconfig` usa `noImplicitOverride`, então o compilador exige a palavra `override`. |
| **Composição 1:N** | `Canteiro → Plantio[]`, `Plantio → Colheita[]`, `Colheita → Destinacao[]` | A regra central (não destinar mais do que o colhido) é `Colheita.verificarDestinacao()`, que soma as destinações que a colheita possui. É usada no servidor ([`src/integrations/db/saldo.ts`](../src/integrations/db/saldo.ts)) e no formulário ([`src/components/EntityCrud.tsx`](../src/components/EntityCrud.tsx)). No banco, o ciclo de vida é reforçado por `ON DELETE CASCADE` (ver [`der.md`](./der.md)). |

**Convenções:** código tipado (TypeScript `strict`), classes e tipos em
`PascalCase`, métodos e atributos em `camelCase`.
