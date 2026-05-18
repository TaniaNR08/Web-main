-- Calificaciones en entregas (ejecutar en submissions_db si la BD ya existía)
USE submissions_db;

ALTER TABLE Entregas ADD COLUMN nota DECIMAL(5,2) NULL;
ALTER TABLE Entregas ADD COLUMN comentario VARCHAR(500) NULL;
ALTER TABLE Entregas ADD COLUMN fecha_calificacion DATETIME NULL;
