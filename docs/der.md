# Diagrama do Banco de Dados (DER)

Espelha exatamente as tabelas criadas em [`/database/schema.sql`](../database/schema.sql).

```mermaid
erDiagram
    PARTICIPANTES {
        uuid id PK
        text nome
        text contato
        text tipo_participacao
        timestamptz created_at
    }

    CANTEIROS {
        uuid id PK
        text identificacao UK
        text localizacao
        numeric tamanho_m2
        text status
        timestamptz created_at
    }

    CULTURAS {
        uuid id PK
        text nome
        text categoria
        integer periodo_cultivo_dias
        timestamptz created_at
    }

    PLANTIOS {
        uuid id PK
        uuid canteiro_id FK
        uuid cultura_id FK
        date data_plantio
        integer quantidade
        text observacao
        timestamptz created_at
    }

    ATIVIDADES {
        uuid id PK
        text tipo
        date data
        uuid canteiro_id FK
        uuid participante_id FK
        text descricao
        timestamptz created_at
    }

    COLHEITAS {
        uuid id PK
        uuid plantio_id FK
        date data
        numeric quantidade_kg
        timestamptz created_at
    }

    DESTINACOES {
        uuid id PK
        uuid colheita_id FK
        text tipo_destino
        numeric quantidade_kg
        date data
        timestamptz created_at
    }

    CANTEIROS ||--o{ PLANTIOS : "recebe"
    CULTURAS ||--o{ PLANTIOS : "é plantada em"
    CANTEIROS ||--o{ ATIVIDADES : "sofre manutenção"
    PARTICIPANTES ||--o{ ATIVIDADES : "realiza"
    PLANTIOS ||--o{ COLHEITAS : "origina"
    COLHEITAS ||--o{ DESTINACOES : "é destinada em"
```

## Regra de negócio representada no banco

Um trigger (`trg_valida_destinacao`, função `valida_destinacao()`) garante que a
soma das `destinacoes.quantidade_kg` de uma colheita nunca ultrapasse
`colheitas.quantidade_kg` — a regra de negócio central identificada na fase de
Descoberta (ver [`entrega-1.md`](./entrega-1.md)).
