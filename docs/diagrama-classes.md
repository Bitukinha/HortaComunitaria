# Diagrama de Classes

Modelo de domínio orientado a objetos do Horta Comunitária — a camada de
classes que vai envelopar o acesso ao banco (`/database/schema.sql`) na
implementação da 2ª entrega. Contém os três elementos exigidos pela AEP:
**herança**, **polimorfismo** e uma **composição de multiplicidade 1:N**.

```mermaid
classDiagram
    class Pessoa {
        <<abstract>>
        #nome: string
        #contato: string
        +getResumo() string
    }

    class Participante {
        -tipoParticipacao: TipoParticipacao
        +getResumo() string
    }

    class RegistroProdutivo {
        <<abstract>>
        #data: Date
        +calcularIndicador() number
    }

    class Plantio {
        -quantidade: number
        -observacao: string
        +calcularIndicador() number
    }

    class Colheita {
        -quantidadeKg: number
        +calcularIndicador() number
    }

    class Canteiro {
        -identificacao: string
        -localizacao: string
        -tamanhoM2: number
        -status: StatusCanteiro
        +adicionarPlantio(p: Plantio) void
    }

    class Cultura {
        -nome: string
        -categoria: string
        -periodoCultivoDias: number
    }

    class Atividade {
        -tipo: string
        -data: Date
        -descricao: string
    }

    class Destinacao {
        -tipoDestino: string
        -quantidadeKg: number
        -data: Date
        +validarContraColheita(disponivel: number) boolean
    }

    Pessoa <|-- Participante : herança
    RegistroProdutivo <|-- Plantio : herança + polimorfismo (@Override)
    RegistroProdutivo <|-- Colheita : herança + polimorfismo (@Override)

    Canteiro "1" *-- "0..*" Plantio : composição 1-N
    Plantio "1" *-- "0..*" Colheita : composição 1-N
    Colheita "1" *-- "0..*" Destinacao : composição 1-N

    Canteiro "1" o-- "0..*" Atividade : associação
    Participante "1" o-- "0..*" Atividade : associação
    Cultura "1" o-- "0..*" Plantio : associação
```

## Onde está cada requisito

- **Herança**: `Participante` estende a classe abstrata `Pessoa`; `Plantio` e
  `Colheita` estendem `RegistroProdutivo`.
- **Polimorfismo**: `RegistroProdutivo.calcularIndicador()` é sobrescrito
  (`@Override`) de forma diferente em cada subclasse — em `Plantio` retorna a
  quantidade de mudas/sementes, em `Colheita` retorna o total colhido em kg.
  O código que consome um `RegistroProdutivo[]` (por exemplo, no Painel) chama
  o mesmo método sem saber qual subtipo está tratando.
- **Composição 1:N**: um `Canteiro` é dono do ciclo de vida dos seus
  `Plantio`s — ao excluir um canteiro, os plantios são excluídos junto
  (reforçado no banco pelo `ON DELETE CASCADE`, ver
  [`der.md`](./der.md)). O mesmo vale para `Plantio → Colheita` e
  `Colheita → Destinacao`.
