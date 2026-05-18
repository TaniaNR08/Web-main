-- ==========================================
-- MICROSERVICES DATABASE INITIALIZATION
-- ==========================================

-- auth_db
CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;
CREATE TABLE IF NOT EXISTS Usuarios (
    user_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    passwd VARCHAR(255) NOT NULL,
    rol VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);
INSERT IGNORE INTO Usuarios (user_id, nombre, passwd, rol) VALUES (1000, 'Administrador', 'admin123', 'administrador');
INSERT IGNORE INTO Usuarios (user_id, nombre, passwd, rol) VALUES (1019986037, 'Profesor Demo', 'gcc', 'profesor');

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
INSERT IGNORE INTO Grupos (nombre, profesor) VALUES ('Álgebra Lineal Grupo A2', 1019986037);
INSERT IGNORE INTO Grupos (nombre, profesor) VALUES ('Programación Lineal Grupo N', 1019986037);
INSERT IGNORE INTO Grupos (nombre, profesor) VALUES ('Catedra Unilibrista Grupo N', 1019986037);
INSERT IGNORE INTO Grupos (nombre, profesor) VALUES ('Matematicas Discretas Grupo A', 1019986037);
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
    nota DECIMAL(5,2) NULL,
    comentario VARCHAR(500) NULL,
    fecha_calificacion DATETIME NULL,
    PRIMARY KEY (entrega_id)
);

-- content_db
CREATE DATABASE IF NOT EXISTS content_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE content_db;

CREATE TABLE IF NOT EXISTS Contenido_Institucional (
    clave VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Noticias (
    noticia_id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    imagen_url VARCHAR(500),
    tipo ENUM('noticia','evento') DEFAULT 'noticia',
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Eventos_Calendario (
    evento_id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    tipo VARCHAR(100) DEFAULT 'general',
    color VARCHAR(20) DEFAULT '#374151'
);

CREATE TABLE IF NOT EXISTS Documentos (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria ENUM('circular','formato','pei','manual','lista','otro') DEFAULT 'otro',
    nombre_archivo VARCHAR(255) NOT NULL,
    archivo LONGBLOB NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Mensajes_Contacto (
    mensaje_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    asunto VARCHAR(255),
    mensaje TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Galeria (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    tipo ENUM('imagen','video') DEFAULT 'imagen',
    categoria VARCHAR(100) DEFAULT 'general',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Admisiones (
    admision_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estudiante VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    grado_solicitado VARCHAR(50),
    nombre_acudiente VARCHAR(255) NOT NULL,
    parentesco VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','revisada','aceptada','rechazada') DEFAULT 'pendiente'
);

-- Datos de ejemplo
INSERT IGNORE INTO Contenido_Institucional (clave, titulo, contenido) VALUES
('mision', 'Mision', 'Formar ciudadanos integrales, criticos y comprometidos con su entorno, mediante una educacion de calidad basada en valores cristianos y el desarrollo de competencias para la vida.'),
('vision', 'Vision', 'Ser reconocidos como una institucion educativa de referencia en la region, lider en innovacion pedagogica y formacion en valores para el siglo XXI.'),
('historia', 'Historia', 'El Colegio San Francisco de Asis fue fundado con el proposito de ofrecer educacion integral a la comunidad. A lo largo de los anos hemos formado generaciones de estudiantes comprometidos con la excelencia academica y los valores humanos.'),
('estructura', 'Estructura organizacional', 'Rectoria | Coordinacion academica | Coordinacion disciplinaria | Secretaria academica | Orientacion escolar | Cuerpo docente por areas | Consejo directivo de padres.');

INSERT IGNORE INTO Noticias (titulo, contenido, imagen_url, tipo) VALUES
('Bienvenidos al año escolar 2026', 'Estimados estudiantes, docentes y padres de familia: les damos la más cordial bienvenida a un nuevo año académico lleno de oportunidades, crecimiento y aprendizaje.', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 'noticia'),
('Feria de la Ciencia 2026', 'El próximo 15 de junio se realizará nuestra tradicional Feria de la Ciencia. Todos los grados participarán con proyectos innovadores. ¡Preparen sus ideas!', 'https://images.unsplash.com/photo-1532094349884-543559c8d0e3?w=800', 'evento'),
('Entrega de boletines primer período', 'La entrega de boletines del primer período académico se realizará el día 15 de marzo de 2026 en las instalaciones del colegio de 7am a 12pm.', NULL, 'noticia');

INSERT IGNORE INTO Eventos_Calendario (titulo, descripcion, fecha, tipo, color) VALUES
('Inicio de clases', 'Primer día de clases del año 2026', '2026-01-20', 'academico', '#2563eb'),
('Entrega de boletines', 'Entrega del primer boletín de notas', '2026-03-15', 'academico', '#7c3aed'),
('Día del maestro', 'Celebración del día del maestro', '2026-05-15', 'institucional', '#059669'),
('Feria de la Ciencia', 'Feria de proyectos científicos institucional', '2026-06-15', 'evento', '#d97706'),
('Exámenes finales', 'Período de exámenes finales del año', '2026-11-10', 'academico', '#dc2626'),
('Clausura', 'Ceremonia de clausura del año escolar', '2026-11-28', 'institucional', '#0891b2');

INSERT IGNORE INTO Galeria (titulo, url, tipo, categoria) VALUES
('Patio principal', 'https://picsum.photos/id/417/600/400', 'imagen', 'instalaciones'),
('Laboratorio de ciencias', 'https://picsum.photos/id/356/600/400', 'imagen', 'instalaciones'),
('Deportes 2025', 'https://picsum.photos/id/477/600/400', 'imagen', 'deportes'),
('Graduacion 2025', 'https://picsum.photos/id/306/600/400', 'imagen', 'eventos');
