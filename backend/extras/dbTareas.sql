CREATE DATABASE dbTareas;
USE dbTareas;
CREATE TABLE Usuarios(
    user_id int NOT NULL,
    passwd varchar(255) NOT NULL,
    rol varchar(255) NOT NULL,
    PRIMARY KEY(user_id)
);
CREATE TABLE Grupos(
    group_id int AUTO_INCREMENT,
    nombre varchar(255) NOT NULL UNIQUE,
    profesor int,
    PRIMARY KEY(group_id),
    FOREIGN KEY (profesor) REFERENCES Usuarios(user_id)
);
CREATE TABLE Estudiantes_por_Grupo(
    user_id int,
    group_id int,
    FOREIGN KEY (user_id) REFERENCES Usuarios(user_id),
    FOREIGN KEY (group_id) REFERENCES Grupos(group_id)
);
CREATE TABLE Tareas(
    tarea_id int AUTO_INCREMENT,
    titulo varchar(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_final DATETIME NOT NULL,
    group_id int,
    PRIMARY KEY (tarea_id),
    FOREIGN KEY (group_id) REFERENCES Grupos(group_id)
);
CREATE TABLE Entregas(
    tarea_id int,
    user_id int,
    fecha_entrega DATETIME NOT NULL,
    nombre varchar(255),
    archivo_entrega LONGBLOB NOT NULL,
    FOREIGN KEY (tarea_id) REFERENCES Tareas(tarea_id),
    FOREIGN KEY (user_id) REFERENCES Usuarios(user_id)
);
