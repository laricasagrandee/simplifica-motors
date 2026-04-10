
DELETE FROM plano_precos;

INSERT INTO plano_precos (slug, intervalo, valor_centavos, max_funcionarios, ativo)
VALUES
  ('completo', 'mensal', 1990, 999, true),
  ('completo', 'anual', 20990, 999, true);
