-- ==========================================
-- MICROSERVICES DATABASE INITIALIZATION
-- ==========================================

-- auth_db
CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;
CREATE TABLE IF NOT EXISTS Usuarios (
    user_id INT NOT NULL,
    passwd VARCHAR(255) NOT NULL,
    rol VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);
INSERT IGNORE INTO Usuarios (user_id, passwd, rol) VALUES (1019986037, 'gcc', 'profesor');
INSERT IGNORE INTO Usuarios (user_id, passwd, rol) VALUES (1019987036, 'no', 'estudiante');

-- groups_db
CREATE DATABASE IF NOT EXISTS groups_db;
USE groups_db;
CREATE TABLE IF NOT EXISTS Grupos (
    group_id INT AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    profesor INT NOT NULL,
    PRIMARY KEY (group_id)
);
CREATE TABLE IF NOT EXISTS Estudiantes_por_Grupo (
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES Grupos(group_id)
);
INSERT IGNORE INTO Grupos (nombre, profesor) VALUES ('Algebra Lineal Grupo A2', 1019986037);
INSERT IGNORE INTO Grupos (nombre, profesor) VALUES ('Programacion Lineal Grupo N', 1019986037);
INSERT IGNORE INTO Grupos (nombre, profesor) VALUES ('Catedra Unilibrista Grupo N', 1019986037);
INSERT IGNORE INTO Grupos (nombre, profesor) VALUES ('Matematicas Discretas Grupo A', 1019986037);
INSERT IGNORE INTO Estudiantes_por_Grupo (user_id, group_id) VALUES (1019987036, 1);
INSERT IGNORE INTO Estudiantes_por_Grupo (user_id, group_id) VALUES (1019987036, 2);
INSERT IGNORE INTO Estudiantes_por_Grupo (user_id, group_id) VALUES (1019987036, 3);
INSERT IGNORE INTO Estudiantes_por_Grupo (user_id, group_id) VALUES (1019987036, 4);

-- tasks_db
CREATE DATABASE IF NOT EXISTS tasks_db;
USE tasks_db;
CREATE TABLE IF NOT EXISTS Tareas (
    tarea_id INT AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_final DATETIME NOT NULL,
    group_id INT NOT NULL,
    PRIMARY KEY (tarea_id)
);

-- submissions_db
CREATE DATABASE IF NOT EXISTS submissions_db;
USE submissions_db;
CREATE TABLE IF NOT EXISTS Entregas (
    entrega_id INT AUTO_INCREMENT,
    tarea_id INT NOT NULL,
    user_id INT NOT NULL,
    fecha_entrega DATETIME NOT NULL,
    nombre VARCHAR(255),
    archivo_entrega LONGBLOB NOT NULL,
    PRIMARY KEY (entrega_id)
);
