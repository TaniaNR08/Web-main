CREATE TABLE IF NOT EXISTS Usuarios(
    user_id int NOT NULL,
    passwd varchar(255) NOT NULL,
    rol varchar(255) NOT NULL,
    PRIMARY KEY(user_id)
);
CREATE TABLE IF NOT EXISTS Grupos(
    group_id int AUTO_INCREMENT,
    nombre varchar(255) NOT NULL UNIQUE,
    profesor int,
    PRIMARY KEY(group_id),
    FOREIGN KEY (profesor) REFERENCES Usuarios(user_id)
);
CREATE TABLE IF NOT EXISTS Estudiantes_por_Grupo(
    user_id int,
    group_id int,
    FOREIGN KEY (user_id) REFERENCES Usuarios(user_id),
    FOREIGN KEY (group_id) REFERENCES Grupos(group_id)
);
CREATE TABLE IF NOT EXISTS Tareas(
    tarea_id int AUTO_INCREMENT,
    titulo varchar(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_final DATETIME NOT NULL,
    group_id int,
    PRIMARY KEY (tarea_id),
    FOREIGN KEY (group_id) REFERENCES Grupos(group_id)
);
CREATE TABLE IF NOT EXISTS Entregas(
    tarea_id int,
    user_id int,
    fecha_entrega DATETIME NOT NULL,
    nombre varchar(255),
    archivo_entrega LONGBLOB NOT NULL,
    FOREIGN KEY (tarea_id) REFERENCES Tareas(tarea_id),
    FOREIGN KEY (user_id) REFERENCES Usuarios(user_id)
);

INSERT IGNORE INTO Usuarios(user_id, passwd, rol) VALUES(1019986037, 'gcc', 'profesor');
INSERT IGNORE INTO Usuarios(user_id, passwd, rol) VALUES(1019987036, 'no', 'estudiante');
INSERT IGNORE INTO Grupos(nombre, profesor) VALUES('Algebra Lineal Grupo A2', 1019986037);
INSERT IGNORE INTO Grupos(nombre, profesor) VALUES('Programacion Lineal Grupo N', 1019986037);
INSERT IGNORE INTO Grupos(nombre, profesor) VALUES('Catedra Unilibrista Grupo N', 1019986037);
INSERT IGNORE INTO Grupos(nombre, profesor) VALUES('Matematicas Discretas Grupo A', 1019986037);
INSERT IGNORE INTO Estudiantes_por_Grupo(user_id, group_id) VALUES(1019987036, 1);
INSERT IGNORE INTO Estudiantes_por_Grupo(user_id, group_id) VALUES(1019987036, 2);
INSERT IGNORE INTO Estudiantes_por_Grupo(user_id, group_id) VALUES(1019987036, 3);
INSERT IGNORE INTO Estudiantes_por_Grupo(user_id, group_id) VALUES(1019987036, 4);
