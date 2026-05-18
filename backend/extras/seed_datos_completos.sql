-- =============================================================================
-- SchoolWebPro — Datos de demostración
-- Colegio San Francisco de Asís
--
-- Requiere haber ejecutado antes microservices_init.sql (estructura).
-- Docker: se aplica automaticamente como 02_seed.sql al crear el contenedor.
-- Manual (UTF-8): ejecutar en MySQL Workbench o:
--   Get-Content extras\seed_datos_completos.sql -Encoding utf8 -Raw | docker exec -i schoolweb_mysql mysql -uroot -p"TU_PASSWORD"
-- Si los textos en BD siguen sin tildes, vuelva a ejecutar este seed (borra y recarga contenido público).
--
-- Credenciales:
--   Admin:    1000 / admin123
--   Profesor: 1019986037 / gcc
--   Estudiantes (1020001001-1020001010): estudiante123
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS groups_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS tasks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS submissions_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS content_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tablas content_db (si no existen por init anterior)
USE content_db;
CREATE TABLE IF NOT EXISTS Contenido_Institucional (
    clave VARCHAR(50) PRIMARY KEY, titulo VARCHAR(255) NOT NULL, contenido TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS Noticias (
    noticia_id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(255) NOT NULL, contenido TEXT NOT NULL,
    imagen_url VARCHAR(500), tipo ENUM('noticia','evento') DEFAULT 'noticia',
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP, activo BOOLEAN DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS Eventos_Calendario (
    evento_id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(255) NOT NULL, descripcion TEXT,
    fecha DATE NOT NULL, tipo VARCHAR(100) DEFAULT 'general', color VARCHAR(20) DEFAULT '#374151');
CREATE TABLE IF NOT EXISTS Documentos (
    doc_id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255) NOT NULL,
    categoria ENUM('circular','formato','pei','manual','lista','otro') DEFAULT 'otro',
    nombre_archivo VARCHAR(255) NOT NULL, archivo LONGBLOB NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP, activo BOOLEAN DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS Mensajes_Contacto (
    mensaje_id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
    asunto VARCHAR(255), mensaje TEXT NOT NULL, fecha DATETIME DEFAULT CURRENT_TIMESTAMP, leido BOOLEAN DEFAULT FALSE);
CREATE TABLE IF NOT EXISTS Galeria (
    media_id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(255) NOT NULL, url VARCHAR(500) NOT NULL,
    tipo ENUM('imagen','video') DEFAULT 'imagen', categoria VARCHAR(100) DEFAULT 'general',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP, activo BOOLEAN DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS Admisiones (
    admision_id INT AUTO_INCREMENT PRIMARY KEY, nombre_estudiante VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE, grado_solicitado VARCHAR(50), nombre_acudiente VARCHAR(255) NOT NULL,
    parentesco VARCHAR(50), email VARCHAR(255) NOT NULL, telefono VARCHAR(20), mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','revisada','aceptada','rechazada') DEFAULT 'pendiente');

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTH — Usuarios (admin, profesor, 10 estudiantes)
-- ─────────────────────────────────────────────────────────────────────────────
USE auth_db;

DELETE FROM Usuarios WHERE user_id = 1019987036;
DELETE FROM Usuarios WHERE user_id BETWEEN 1020001001 AND 1020001010;

INSERT INTO Usuarios (user_id, nombre, passwd, rol) VALUES
(1000, 'Administrador', 'admin123', 'administrador'),
(1019986037, 'Profesor Carlos Mendoza', 'gcc', 'profesor'),
(1020001001, 'Sofía Ramírez García', 'estudiante123', 'estudiante'),
(1020001002, 'Mateo López Herrera', 'estudiante123', 'estudiante'),
(1020001003, 'Valentina Torres Díaz', 'estudiante123', 'estudiante'),
(1020001004, 'Santiago Morales Ruiz', 'estudiante123', 'estudiante'),
(1020001005, 'Isabella Castro Vargas', 'estudiante123', 'estudiante'),
(1020001006, 'Nicolás Jiménez Pardo', 'estudiante123', 'estudiante'),
(1020001007, 'Mariana Gutiérrez Silva', 'estudiante123', 'estudiante'),
(1020001008, 'Daniel Rojas Mejía', 'estudiante123', 'estudiante'),
(1020001009, 'Camila Vargas Ortiz', 'estudiante123', 'estudiante'),
(1020001010, 'Sebastián Herrera Luna', 'estudiante123', 'estudiante')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), passwd = VALUES(passwd), rol = VALUES(rol);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUPS — Grupos e inscripciones
-- ─────────────────────────────────────────────────────────────────────────────
USE groups_db;

DELETE FROM Estudiantes_por_Grupo;
DELETE FROM Grupos;

ALTER TABLE Grupos AUTO_INCREMENT = 1;

INSERT INTO Grupos (nombre, profesor) VALUES
('Álgebra Lineal Grupo A2', 1019986037),
('Programación Lineal Grupo N', 1019986037),
('Cátedra Unilibrista Grupo N', 1019986037),
('Matemáticas Discretas Grupo A', 1019986037),
('Física General Grupo B', 1019986037),
('Lengua Castellana Grupo C', 1019986037);

INSERT INTO Estudiantes_por_Grupo (user_id, group_id) VALUES
(1020001001, 1), (1020001002, 1), (1020001003, 1),
(1020001004, 2), (1020001005, 2), (1020001006, 2),
(1020001007, 3), (1020001008, 3),
(1020001009, 4), (1020001010, 4),
(1020001001, 5), (1020001004, 5),
(1020001002, 6), (1020001007, 6);

-- ─────────────────────────────────────────────────────────────────────────────
-- TASKS — Tareas por grupo
-- ─────────────────────────────────────────────────────────────────────────────
USE tasks_db;

DELETE FROM Tareas;
ALTER TABLE Tareas AUTO_INCREMENT = 1;

INSERT INTO Tareas (titulo, descripcion, fecha_inicio, fecha_final, group_id) VALUES
('Taller 1: Matrices y determinantes', 'Resolver los ejercicios 1 al 15 del capítulo 3. Entregar en PDF.', '2026-01-25 07:00:00', '2026-05-30 23:59:00', 1),
('Quiz: Espacios vectoriales', 'Estudio de definiciones y ejemplos. Material en aula virtual.', '2026-02-10 07:00:00', '2026-06-05 23:59:00', 1),
('Proyecto: Modelo de programación lineal', 'Plantear un problema real y resolverlo con el método simplex.', '2026-02-01 07:00:00', '2026-06-10 23:59:00', 2),
('Laboratorio: Graficación de restricciones', 'Usar GeoGebra o similar. Adjuntar capturas.', '2026-03-01 07:00:00', '2026-06-12 23:59:00', 2),
('Ensayo: Valores institucionales', 'Mínimo 2 páginas sobre convivencia y respeto en la comunidad educativa.', '2026-01-20 07:00:00', '2026-05-20 23:59:00', 3),
('Foro: Lectura compartida', 'Comentar la lectura asignada en el foro del grupo.', '2026-02-15 07:00:00', '2026-05-25 23:59:00', 3),
('Tarea: Lógica proposicional', 'Completar la hoja de trabajo de tablas de verdad.', '2026-02-05 07:00:00', '2026-06-01 23:59:00', 4),
('Reto: Inducción matemática', 'Demostrar las propiedades del enunciado 8 al 12.', '2026-03-10 07:00:00', '2026-06-15 23:59:00', 4),
('Informe: Cinemática', 'Informe de laboratorio sobre movimiento rectilíneo.', '2026-02-20 07:00:00', '2026-06-08 23:59:00', 5),
('Análisis de texto narrativo', 'Identificar estructura y figuras literarias en el cuento asignado.', '2026-02-01 07:00:00', '2026-05-28 23:59:00', 6);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUBMISSIONS — Algunas entregas de ejemplo (archivo minimo)
-- ─────────────────────────────────────────────────────────────────────────────
USE submissions_db;

DELETE FROM Entregas;
ALTER TABLE Entregas AUTO_INCREMENT = 1;

SET @archivo_demo = CONVERT('Entrega de demostración - SchoolWebPro', BINARY);

INSERT INTO Entregas (tarea_id, user_id, fecha_entrega, nombre, archivo_entrega, nota, comentario, fecha_calificacion) VALUES
(1, 1020001001, '2026-05-10 14:30:00', 'taller_matrices_sofia.pdf', @archivo_demo, 92.5, 'Excelente trabajo y presentación.', '2026-05-11 10:00:00'),
(1, 1020001002, '2026-05-11 09:15:00', 'matrices_mateo.pdf', @archivo_demo, NULL, NULL, NULL),
(3, 1020001004, '2026-05-12 16:00:00', 'proyecto_pl_santiago.pdf', @archivo_demo, 78.0, 'Buen avance; revise el ejercicio 4.', '2026-05-13 09:30:00'),
(5, 1020001007, '2026-05-08 11:20:00', 'ensayo_valentina_g.pdf', @archivo_demo, 88.0, NULL, '2026-05-09 14:00:00'),
(7, 1020001009, '2026-05-14 18:45:00', 'logica_camila.pdf', @archivo_demo, NULL, NULL, NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- CONTENT — Sitio publico completo
-- ─────────────────────────────────────────────────────────────────────────────
USE content_db;

DELETE FROM Admisiones;
DELETE FROM Mensajes_Contacto;
DELETE FROM Documentos;
DELETE FROM Galeria;
DELETE FROM Eventos_Calendario;
DELETE FROM Noticias;
DELETE FROM Contenido_Institucional;

ALTER TABLE Noticias AUTO_INCREMENT = 1;
ALTER TABLE Eventos_Calendario AUTO_INCREMENT = 1;
ALTER TABLE Documentos AUTO_INCREMENT = 1;
ALTER TABLE Mensajes_Contacto AUTO_INCREMENT = 1;
ALTER TABLE Galeria AUTO_INCREMENT = 1;
ALTER TABLE Admisiones AUTO_INCREMENT = 1;

INSERT INTO Contenido_Institucional (clave, titulo, contenido) VALUES
('mision', 'Misión',
 'Formar ciudadanos integrales, críticos y comprometidos con su entorno, mediante una educación de calidad basada en valores cristianos, el respeto, la responsabilidad y el desarrollo de competencias para la vida y la sociedad.'),
('vision', 'Visión',
 'Ser reconocidos como una institución educativa de referencia en la región, líder en innovación pedagógica, inclusión y formación en valores para el siglo XXI.'),
('historia', 'Historia',
 'El Colegio San Francisco de Asís fue fundado para ofrecer educación integral a la comunidad. Durante décadas hemos acompañado a familias de la región, formando estudiantes con excelencia académica, sentido de pertenencia y compromiso social.'),
('estructura', 'Estructura organizacional',
 'Rectoría | Vicerrectoría académica | Coordinación de convivencia | Secretaría académica | Orientación escolar | Psicoorientación | Cuerpo docente por áreas | Consejo directivo de padres | Comité de convivencia.'),
('valores', 'Valores institucionales',
 'Respeto | Responsabilidad | Honestidad | Solidaridad | Tolerancia | Amor al trabajo | Espíritu de servicio | Compromiso con la excelencia.');

-- Imagenes Pexels alineadas al contexto (hotlink permitido)
INSERT INTO Noticias (titulo, contenido, imagen_url, tipo, fecha_publicacion) VALUES
('Bienvenidos al año escolar 2026',
 'Estimados estudiantes, docentes y padres: les damos la bienvenida a un nuevo año lleno de aprendizaje, proyectos y crecimiento personal y académico.',
 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'noticia', '2026-01-15 08:00:00'),
('Inicio de clases presenciales',
 'Recordamos que el inicio oficial de clases es el 20 de enero. Uniforme completo y carnet estudiantil.',
 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'noticia', '2026-01-18 10:00:00'),
('Feria de la Ciencia 2026',
 'El 15 de junio realizaremos la Feria de la Ciencia. Todos los grados presentarán proyectos. Inscripción en coordinación académica.',
 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'evento', '2026-02-01 09:00:00'),
('Jornada de puertas abiertas',
 'Invitamos a familias interesadas a conocer nuestras instalaciones y proceso de admisión el 8 de marzo.',
 'https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'evento', '2026-02-20 11:00:00'),
('Entrega de boletines primer período',
 'La entrega de boletines del primer período será el 15 de marzo de 8:00 a.m. a 12:00 m.',
 'https://images.pexels.com/photos/5905708/pexels-photo-5905708.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'noticia', '2026-03-01 08:30:00'),
('Campeonato interclases de deportes',
 'Del 20 al 24 de abril se realizará el torneo de fútbol, baloncesto y atletismo. Apoyen a sus equipos.',
 'https://images.pexels.com/photos/4679800/pexels-photo-4679800.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'noticia', '2026-04-05 14:00:00'),
('Taller para padres: Uso responsable de tecnología',
 'Charla dirigida a acudientes sobre redes sociales y bienestar digital. Auditorio principal, 5:00 p.m.',
 'https://images.pexels.com/photos/1181395/pexels-photo-1181395.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'noticia', '2026-04-12 16:00:00'),
('Suspensión de clases día de ascensión',
 'Por calendario oficial no habrá clases el 2 de junio. Actividades de recuperación se anunciarán oportunamente.',
 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'noticia', '2026-05-20 07:00:00');

INSERT INTO Eventos_Calendario (titulo, descripcion, fecha, tipo, color) VALUES
('Inicio de clases 2026', 'Primer día de clases del año escolar', '2026-01-20', 'academico', '#2563eb'),
('Reunión de padres 6° a 11°', 'Presentación de lineamientos académicos', '2026-02-05', 'institucional', '#059669'),
('Día de la mujer', 'Actividades culturales y reflexión', '2026-03-08', 'institucional', '#db2777'),
('Entrega boletines período 1', 'Entrega en secretaría y aula', '2026-03-15', 'academico', '#7c3aed'),
('Semana Santa', 'Receso calendario nacional', '2026-04-02', 'institucional', '#6b7280'),
('Día del maestro', 'Celebración institucional', '2026-05-15', 'institucional', '#059669'),
('Feria de la Ciencia', 'Exposición de proyectos', '2026-06-15', 'evento', '#d97706'),
('Evaluaciones finales', 'Último período académico', '2026-11-10', 'academico', '#dc2626'),
('Clausura año escolar', 'Ceremonia de grados y reconocimientos', '2026-11-28', 'institucional', '#0891b2');

SET @doc_pei = CONVERT('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF\n', BINARY);
SET @doc_manual = CONVERT('MANUAL DE CONVIVENCIA - Colegio San Francisco de Asís - Documento oficial de demostración.', BINARY);
SET @doc_circular = CONVERT('CIRCULAR No. 012-2026: Calendario de evaluaciones primer período.', BINARY);
SET @doc_formato = CONVERT('FORMATO DE MATRÍCULA 2026 - Diligenciar y entregar en secretaría académica.', BINARY);
SET @doc_lista = CONVERT('LISTA DE ÚTILES ESCOLARES 2026 - Grados 6 a 11.', BINARY);

INSERT INTO Documentos (nombre, categoria, nombre_archivo, archivo, fecha_subida) VALUES
('Proyecto Educativo Institucional (PEI)', 'pei', 'PEI_SanFranciscoDeAsis_2026.pdf', @doc_pei, '2026-01-10 09:00:00'),
('Manual de convivencia', 'manual', 'Manual_Convivencia_2026.pdf', @doc_manual, '2026-01-10 09:05:00'),
('Circular calendario evaluaciones', 'circular', 'Circular_012_2026.pdf', @doc_circular, '2026-03-01 10:00:00'),
('Formato de matrícula', 'formato', 'Formato_Matricula_2026.pdf', @doc_formato, '2026-01-15 08:00:00'),
('Lista de útiles escolares', 'lista', 'Lista_Utiles_2026.pdf', @doc_lista, '2026-01-12 11:00:00');

INSERT INTO Galeria (titulo, url, tipo, categoria) VALUES
('Fachada principal', 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'instalaciones'),
('Biblioteca', 'https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'instalaciones'),
('Laboratorio de ciencias', 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'instalaciones'),
('Salón de informática', 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'instalaciones'),
('Torneo de fútbol 2025', 'https://images.pexels.com/photos/4679800/pexels-photo-4679800.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'deportes'),
('Equipo de baloncesto', 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'deportes'),
('Graduación promoción 2025', 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'eventos'),
('Acto cívico 20 de julio', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'eventos'),
('Obra de teatro estudiantil', 'https://images.pexels.com/photos/109669/pexels-photo-109669.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'cultura'),
('Club de robótica', 'https://images.pexels.com/photos/8294555/pexels-photo-8294555.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop', 'imagen', 'cultura');

INSERT INTO Mensajes_Contacto (nombre, email, asunto, mensaje, fecha, leido) VALUES
('Laura Martínez', 'laura.martinez@email.com', 'Información admisiones',
 'Buenos días, deseo conocer requisitos y fechas para grado 7. Gracias.', '2026-05-10 09:30:00', TRUE),
('Pedro Salazar', 'pedro.salazar@email.com', 'Horario de atención',
 '¿Cuál es el horario de secretaría en vacaciones?', '2026-05-12 15:45:00', FALSE),
('Ángela Ruiz', 'angela.ruiz@email.com', 'Felicitación',
 'Felicitamos al equipo docente por la feria de ciencia del año pasado.', '2026-05-14 11:00:00', FALSE);

INSERT INTO Admisiones (nombre_estudiante, fecha_nacimiento, grado_solicitado, nombre_acudiente, parentesco, email, telefono, mensaje, fecha, estado) VALUES
('Tomás Arias Beltrán', '2014-03-12', '6°', 'Claudia Beltrán', 'Madre', 'claudia.beltran@email.com', '3001234567',
 'Solicito cupo para próximo año. Adjuntaré documentos en secretaría.', '2026-05-01 10:00:00', 'pendiente'),
('Emma Suárez Polo', '2013-08-22', '7°', 'Ricardo Suárez', 'Padre', 'ricardo.suarez@email.com', '3109876543',
 'Venimos de otra ciudad y nos interesa el enfoque institucional.', '2026-05-05 14:20:00', 'revisada'),
('Lucas Pineda Ríos', '2012-11-05', '8°', 'Martha Ríos', 'Madre', 'martha.rios@email.com', '3205558899',
 NULL, '2026-05-08 08:15:00', 'aceptada');

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- RESUMEN — 10 ESTUDIANTES (login: ID + contraseña estudiante123)
-- =============================================================================
-- 1020001001  Sofía Ramírez García
-- 1020001002  Mateo López Herrera
-- 1020001003  Valentina Torres Díaz
-- 1020001004  Santiago Morales Ruiz
-- 1020001005  Isabella Castro Vargas
-- 1020001006  Nicolás Jiménez Pardo
-- 1020001007  Mariana Gutiérrez Silva
-- 1020001008  Daniel Rojas Mejía
-- 1020001009  Camila Vargas Ortiz
-- 1020001010  Sebastián Herrera Luna
-- =============================================================================
