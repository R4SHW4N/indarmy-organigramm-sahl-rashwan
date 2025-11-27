DROP TABLE IF EXISTS indiarmy;
CREATE TABLE indiarmy (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  boss_id INTEGER REFERENCES indiarmy(id) --rekursive Beziehung
);

INSERT INTO indiarmy (name, boss_id) VALUES
('Field Marshal', NULL),
('General', 1),
('General', 1),
('Lieutenant general', 2),
('Lieutenant general', 2),
('Lieutenant general', 3),
('Lieutenant general', 3),
('Major general', 4),
('Major general', 4),
('Major general', 4),
('Major general', 5),
('Major general', 5),
('Major general', 5),
('Major general', 6),
('Major general', 6),
('Major general', 6),
('Major general', 7),
('Major general', 7),
('Major general', 7),
('Brigadier', 8),
('Brigadier', 9),
('Brigadier', 10),
('Brigadier', 11),
('Brigadier', 12),
('Brigadier', 13),
('Brigadier', 14),
('Brigadier', 15),
('Brigadier', 16),
('Brigadier', 17),
('Brigadier', 18),
('Brigadier', 19);
