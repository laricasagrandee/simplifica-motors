ALTER TABLE public.configuracoes
  ADD COLUMN taxas_parcelamento jsonb DEFAULT '{"2":3.9,"3":4.9,"4":5.9,"5":6.9,"6":7.9,"7":8.9,"8":9.9,"9":10.9,"10":11.9,"11":12.9,"12":13.9}'::jsonb;