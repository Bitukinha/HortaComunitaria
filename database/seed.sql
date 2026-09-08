-- Horta Comunitária — dados de exemplo (opcional).
-- Execução: psql "$DATABASE_URL" -f database/seed.sql

INSERT INTO participantes (nome, contato, tipo_participacao) VALUES
  ('Maria Oliveira', 'maria@horta.org', 'Administrador'),
  ('João Pereira', '(44) 99812-3344', 'Responsável'),
  ('Ana Souza', 'ana.souza@email.com', 'Voluntário'),
  ('Carlos Lima', '(44) 99655-1020', 'Voluntário');

INSERT INTO canteiros (identificacao, localizacao, tamanho_m2, status) VALUES
  ('C-01', 'Setor Norte', 12.5, 'Ativo'),
  ('C-02', 'Setor Norte', 10, 'Ativo'),
  ('C-03', 'Setor Leste', 8, 'Em colheita'),
  ('C-04', 'Setor Sul', 14, 'Ativo'),
  ('C-05', 'Setor Sul', 9.5, 'Em preparo'),
  ('C-06', 'Setor Oeste', 11, 'Ativo');

INSERT INTO culturas (nome, categoria, periodo_cultivo_dias) VALUES
  ('Alface Crespa', 'Folhosa', 45),
  ('Tomate Cereja', 'Fruto', 80),
  ('Couve Manteiga', 'Folhosa', 60),
  ('Cenoura', 'Raiz', 70),
  ('Manjericão', 'Tempero', 40),
  ('Rúcula', 'Folhosa', 30);

INSERT INTO plantios (canteiro_id, cultura_id, data_plantio, quantidade, observacao)
SELECT c.id, k.id, current_date - 30, 60, 'Mudas doadas pela cooperativa'
FROM canteiros c, culturas k WHERE c.identificacao='C-01' AND k.nome='Alface Crespa';
INSERT INTO plantios (canteiro_id, cultura_id, data_plantio, quantidade, observacao)
SELECT c.id, k.id, current_date - 55, 24, 'Tutoramento realizado'
FROM canteiros c, culturas k WHERE c.identificacao='C-02' AND k.nome='Tomate Cereja';
INSERT INTO plantios (canteiro_id, cultura_id, data_plantio, quantidade, observacao)
SELECT c.id, k.id, current_date - 40, 35, ''
FROM canteiros c, culturas k WHERE c.identificacao='C-03' AND k.nome='Couve Manteiga';
INSERT INTO plantios (canteiro_id, cultura_id, data_plantio, quantidade, observacao)
SELECT c.id, k.id, current_date - 15, 80, 'Semeadura direta'
FROM canteiros c, culturas k WHERE c.identificacao='C-04' AND k.nome='Cenoura';
INSERT INTO plantios (canteiro_id, cultura_id, data_plantio, quantidade, observacao)
SELECT c.id, k.id, current_date - 8, 40, ''
FROM canteiros c, culturas k WHERE c.identificacao='C-06' AND k.nome='Rúcula';

INSERT INTO atividades (tipo, data, canteiro_id, participante_id, descricao)
SELECT 'Adubação', current_date - 5, c.id, p.id, 'Adubação orgânica com composto'
FROM canteiros c, participantes p WHERE c.identificacao='C-01' AND p.nome='Ana Souza';
INSERT INTO atividades (tipo, data, canteiro_id, participante_id, descricao)
SELECT 'Rega', current_date - 1, c.id, p.id, 'Rega matinal'
FROM canteiros c, participantes p WHERE c.identificacao='C-03' AND p.nome='Carlos Lima';
INSERT INTO atividades (tipo, data, canteiro_id, participante_id, descricao)
SELECT 'Capina', current_date - 3, c.id, p.id, 'Retirada de ervas daninhas'
FROM canteiros c, participantes p WHERE c.identificacao='C-04' AND p.nome='João Pereira';

INSERT INTO colheitas (plantio_id, data, quantidade_kg)
SELECT pl.id, current_date - 2, 24.5 FROM plantios pl
JOIN culturas k ON k.id = pl.cultura_id WHERE k.nome='Couve Manteiga';
INSERT INTO colheitas (plantio_id, data, quantidade_kg)
SELECT pl.id, current_date - 6, 18 FROM plantios pl
JOIN culturas k ON k.id = pl.cultura_id WHERE k.nome='Tomate Cereja';

INSERT INTO destinacoes (colheita_id, tipo_destino, quantidade_kg, data)
SELECT co.id, 'Doação', 12, current_date - 1 FROM colheitas co
JOIN plantios pl ON pl.id = co.plantio_id
JOIN culturas k ON k.id = pl.cultura_id WHERE k.nome='Couve Manteiga';
INSERT INTO destinacoes (colheita_id, tipo_destino, quantidade_kg, data)
SELECT co.id, 'Cozinha comunitária', 8, current_date - 5 FROM colheitas co
JOIN plantios pl ON pl.id = co.plantio_id
JOIN culturas k ON k.id = pl.cultura_id WHERE k.nome='Tomate Cereja';
