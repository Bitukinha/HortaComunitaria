export type FieldType = "text" | "number" | "date" | "select" | "reference" | "textarea";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  
  refTable?: EntityKey;
  
  refLabel?: string;
  required?: boolean;
  step?: string;
  optional?: boolean;
};

export type EntityKey =
  | "participantes"
  | "canteiros"
  | "culturas"
  | "plantios"
  | "atividades"
  | "colheitas"
  | "destinacoes";

export type EntityConfig = {
  key: EntityKey;
  singular: string;
  plural: string;
  description: string;
  orderBy: string;
  ascending?: boolean;
  fields: Field[];
};

export const entities: Record<EntityKey, EntityConfig> = {
  participantes: {
    key: "participantes",
    singular: "Participante",
    plural: "Participantes",
    description:
      "Cadastro das pessoas que cuidam da horta, com nome, contato e tipo de participação.",
    orderBy: "nome",
    ascending: true,
    fields: [
      { name: "nome", label: "Nome completo", type: "text", required: true },
      { name: "contato", label: "Contato (e-mail ou telefone)", type: "text", required: true },
      {
        name: "tipo_participacao",
        label: "Tipo de participação",
        type: "select",
        options: ["Administrador", "Responsável", "Voluntário"],
        required: true,
      },
    ],
  },
  canteiros: {
    key: "canteiros",
    singular: "Canteiro",
    plural: "Canteiros",
    description: "Espaços de cultivo da horta, com identificação única, localização e tamanho.",
    orderBy: "identificacao",
    ascending: true,
    fields: [
      { name: "identificacao", label: "Identificação (única)", type: "text", required: true },
      { name: "localizacao", label: "Localização", type: "text", required: true },
      { name: "tamanho_m2", label: "Tamanho (m²)", type: "number", step: "0.1", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Ativo", "Em preparo", "Em colheita", "Inativo"],
        required: true,
      },
    ],
  },
  culturas: {
    key: "culturas",
    singular: "Cultura",
    plural: "Culturas",
    description: "Espécies cultivadas, com categoria e período estimado de cultivo.",
    orderBy: "nome",
    ascending: true,
    fields: [
      { name: "nome", label: "Nome da cultura", type: "text", required: true },
      {
        name: "categoria",
        label: "Categoria",
        type: "select",
        options: ["Folhosa", "Fruto", "Raiz", "Tempero", "Legume", "Outra"],
        required: true,
      },
      {
        name: "periodo_cultivo_dias",
        label: "Período de cultivo (dias)",
        type: "number",
        required: true,
      },
    ],
  },
  plantios: {
    key: "plantios",
    singular: "Plantio",
    plural: "Plantios",
    description: "Registro de qual cultura foi plantada em qual canteiro e quando.",
    orderBy: "data_plantio",
    fields: [
      {
        name: "canteiro_id",
        label: "Canteiro",
        type: "reference",
        refTable: "canteiros",
        refLabel: "identificacao",
        required: true,
      },
      {
        name: "cultura_id",
        label: "Cultura",
        type: "reference",
        refTable: "culturas",
        refLabel: "nome",
        required: true,
      },
      { name: "data_plantio", label: "Data do plantio", type: "date", required: true },
      { name: "quantidade", label: "Quantidade de mudas/sementes", type: "number", required: true },
      { name: "observacao", label: "Observação", type: "textarea", optional: true },
    ],
  },
  atividades: {
    key: "atividades",
    singular: "Atividade",
    plural: "Atividades",
    description: "Manutenção realizada na horta, com tipo, data, canteiro e responsável.",
    orderBy: "data",
    fields: [
      {
        name: "tipo",
        label: "Tipo de atividade",
        type: "select",
        options: ["Rega", "Adubação", "Capina", "Poda", "Controle de pragas", "Preparo de solo"],
        required: true,
      },
      { name: "data", label: "Data", type: "date", required: true },
      {
        name: "canteiro_id",
        label: "Canteiro",
        type: "reference",
        refTable: "canteiros",
        refLabel: "identificacao",
        required: true,
      },
      {
        name: "participante_id",
        label: "Participante responsável",
        type: "reference",
        refTable: "participantes",
        refLabel: "nome",
        required: true,
      },
      { name: "descricao", label: "Descrição", type: "textarea", optional: true },
    ],
  },
  colheitas: {
    key: "colheitas",
    singular: "Colheita",
    plural: "Colheitas",
    description: "Quantidade colhida a partir de cada plantio.",
    orderBy: "data",
    fields: [
      {
        name: "plantio_id",
        label: "Plantio",
        type: "reference",
        refTable: "plantios",
        required: true,
      },
      { name: "data", label: "Data da colheita", type: "date", required: true },
      {
        name: "quantidade_kg",
        label: "Quantidade (kg)",
        type: "number",
        step: "0.1",
        required: true,
      },
    ],
  },
  destinacoes: {
    key: "destinacoes",
    singular: "Destinação",
    plural: "Destinações",
    description:
      "Para onde foram os alimentos colhidos. A quantidade nunca pode ultrapassar o total da colheita.",
    orderBy: "data",
    fields: [
      {
        name: "colheita_id",
        label: "Colheita",
        type: "reference",
        refTable: "colheitas",
        required: true,
      },
      {
        name: "tipo_destino",
        label: "Destino",
        type: "select",
        options: [
          "Doação",
          "Cozinha comunitária",
          "Banco de alimentos",
          "Consumo dos participantes",
          "Venda solidária",
        ],
        required: true,
      },
      {
        name: "quantidade_kg",
        label: "Quantidade (kg)",
        type: "number",
        step: "0.1",
        required: true,
      },
      { name: "data", label: "Data", type: "date", required: true },
    ],
  },
};

export type Row = any;
