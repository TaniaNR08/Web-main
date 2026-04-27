USE dbTareas;
INSERT INTO Usuarios(user_id,passwd,rol)
VALUES(1019986037,"gcc","profesor");
INSERT INTO Usuarios(user_id,passwd,rol)
VALUES(1019987036,"no","estudiante");
INSERT INTO Grupos(nombre,profesor)
VALUES("Algebra Lineal Grupo A2",1019986037);
INSERT INTO Grupos(nombre,profesor)
VALUES("Programacion Lineal Grupo N",1019986037);
INSERT INTO Grupos(nombre,profesor)
VALUES("Catedra Unilibrista Grupo N",1019986037);
INSERT INTO Grupos(nombre,profesor)
VALUES("Matematicas Discretas Grupo A",1019986037);
INSERT INTO Estudiantes_por_Grupo(user_id,group_id)
VALUES(1019987036,1);
INSERT INTO Estudiantes_por_Grupo(user_id,group_id)
VALUES(1019987036,2);
INSERT INTO Estudiantes_por_Grupo(user_id,group_id)
VALUES(1019987036,3);
INSERT INTO Estudiantes_por_Grupo(user_id,group_id)
VALUES(1019987036,4);
