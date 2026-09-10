

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  contato text NOT NULL DEFAULT '',
  tipo_participacao text NOT NULL DEFAULT 'Voluntário',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS canteiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identificacao text NOT NULL UNIQUE,
  localizacao text NOT NULL DEFAULT '',
  tamanho_m2 numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Ativo',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS culturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL DEFAULT 'Hortaliça',
  periodo_cultivo_dias integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plantios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canteiro_id uuid NOT NULL REFERENCES canteiros(id) ON DELETE CASCADE,
  cultura_id uuid NOT NULL REFERENCES culturas(id) ON DELETE CASCADE,
  data_plantio date NOT NULL DEFAULT current_date,
  quantidade integer NOT NULL DEFAULT 1,
  observacao text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL DEFAULT 'Rega',
  data date NOT NULL DEFAULT current_date,
  canteiro_id uuid REFERENCES canteiros(id) ON DELETE SET NULL,
  participante_id uuid REFERENCES participantes(id) ON DELETE SET NULL,
  descricao text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS colheitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plantio_id uuid NOT NULL REFERENCES plantios(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT current_date,
  quantidade_kg numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS destinacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colheita_id uuid NOT NULL REFERENCES colheitas(id) ON DELETE CASCADE,
  tipo_destino text NOT NULL DEFAULT 'Doação',
  quantidade_kg numeric NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION valida_destinacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_colhido numeric;
  total_destinado numeric;
BEGIN
  SELECT quantidade_kg INTO total_colhido FROM colheitas WHERE id = NEW.colheita_id;
  SELECT COALESCE(SUM(quantidade_kg), 0) INTO total_destinado
    FROM destinacoes WHERE colheita_id = NEW.colheita_id AND id <> NEW.id;
  IF NEW.quantidade_kg <= 0 THEN
    RAISE EXCEPTION 'A quantidade destinada deve ser maior que zero.';
  END IF;
  IF total_destinado + NEW.quantidade_kg > total_colhido THEN
    RAISE EXCEPTION 'Quantidade destinada (%) excede o disponível (%) desta colheita.',
      NEW.quantidade_kg, total_colhido - total_destinado;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_valida_destinacao ON destinacoes;
CREATE TRIGGER trg_valida_destinacao
BEFORE INSERT OR UPDATE ON destinacoes
FOR EACH ROW EXECUTE FUNCTION valida_destinacao();
