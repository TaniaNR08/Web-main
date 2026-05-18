# SchoolWebPro - San Francisco de Asis

Full Stack Project: School management web platform. Frontend Angular 19, backend ExpressJS y MySQL. Arquitectura de microservicios.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Execution Instructions

**1. Base de datos (Docker):**
```bash
cd backend
docker-compose up -d
```

**2. Backend (microservicios):**
```bash
cd backend
npm install
npm start
```

**3. Frontend:**
```bash
cd frontend
npm start
```

Abre `http://localhost:4200` en el navegador.

## Capturas de pantalla

### Sitio público e inicio de sesión

| Página principal | Inicio de sesión |
| --- | --- |
| ![Landing](frontend/public/assets/img/landing-principal.png) | ![Login](frontend/public/assets/img/login.png) |

### Panel administrador

| Principal | Noticias | Eventos |
| --- | --- | --- |
| ![Admin principal](frontend/public/assets/img/admin-principal.png) | ![Admin noticias](frontend/public/assets/img/admin-noticias.png) | ![Admin eventos](frontend/public/assets/img/admin-eventos.png) |

| Documentos | Mensajes de contacto | Admisiones |
| --- | --- | --- |
| ![Admin documentos](frontend/public/assets/img/admin-documentos.png) | ![Admin contactos](frontend/public/assets/img/admin-contactos.png) | ![Admin admisiones](frontend/public/assets/img/admin-admisiones.png) |

### Panel profesor

| Mis grupos | Detalle del grupo | Calificación de entregas |
| --- | --- | --- |
| ![Profesor principal](frontend/public/assets/img/profesor-principal.png) | ![Profesor grupo](frontend/public/assets/img/profesor-grupo.png) | ![Profesor calificación](frontend/public/assets/img/profesor-calificacion.png) |

### Panel estudiante

| Mis asignaturas | Tareas y calificaciones |
| --- | --- |
| ![Estudiante principal](frontend/public/assets/img/Estudiate-principal.png) | ![Estudiante tareas](frontend/public/assets/img/Estudiante-tareas.png) |
