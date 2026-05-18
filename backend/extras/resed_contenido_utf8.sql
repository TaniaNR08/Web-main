-- Recarga solo content_db con textos en español correcto (UTF-8).
-- Ejecutar en MySQL Workbench: File > Open > resed_contenido_utf8.sql > Run
-- O desde PowerShell (ajuste la contraseña):
--   Get-Content extras\resed_contenido_utf8.sql -Encoding utf8 -Raw | docker exec -i schoolweb_mysql mysql -uroot -p"TU_PASSWORD"

SET NAMES utf8mb4;
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
