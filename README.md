# AxoMotor - Plataforma web

Este es el repositorio del frontend (plataforma web) de AxoMotor, un sistema de monitoreo vehicular que protege el automóvil de robos e intrusiones y registra lo que ocurre en un percance vial. La plataforma web se conecta al servidor API REST ([axomotor-v1-backend](https://github.com/ddiazcts293/axomotor-v1-backend)).

Está hecha como una Single Page Application con React, Vite, React Router y Axios.

## Instalación

Componentes requeridos:

- Git
- Node.js 20.19 o superior (con npm)
- El backend de AxoMotor corriendo en `http://127.0.0.1:8000`

Pasos:

1. Clonar este repositorio: `git clone https://github.com/jazminmaldonadoh1-cell/axomotor-v1-frontend.git`.
2. Entrar a la carpeta del proyecto: `cd axomotor-v1-frontend`.
3. Instalar dependencias: `npm install`.
4. Crear una copia de `.env.example` llamada `.env` (`copy .env.example .env` en Windows).
5. Iniciar el servidor de desarrollo: `npm run dev`.

El sitio es accesible en `http://localhost:5173`. Usar siempre `localhost` y no `127.0.0.1`, porque el CORS del backend solo permite ese origen.

## Configuración

El archivo `.env` solo necesita la dirección de la API:

```
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Vite lee el `.env` únicamente al arrancar, así que si se modifica hay que reiniciar `npm run dev`. El archivo `.env` no se sube a Git.

## Ejecutar todo junto

Orden recomendado para trabajar:

1. Abrir Docker Desktop.
2. En la carpeta del backend: `docker compose up -d` y luego `fastapi dev` (puerto 8000).
3. En la carpeta del frontend: `npm run dev` (puerto 5173).

Si el backend no tiene usuarios, crear el primer administrador desde Swagger (`http://127.0.0.1:8000/docs`, `POST /api/v1/users/`) con `"role": "ADMIN"`.

## Secciones y roles

| Sección | Ruta | Administrador | Agente | Conductor |
|---|---|---|---|---|
| Inicio de sesión | `/login` | Sí | Sí | Sí |
| Inicio (dashboard) | `/` | Sí | Sí | Sí |
| Viajes | `/trips` | Sí | Sí | Sí |
| Incidencias y eventos | `/incidents` | Sí | Sí | Sí |
| Conductores | `/drivers` | Sí | Sí | No |
| Vehículos | `/vehicles` | Sí | Sí | Sí |
| Panel de administración | `/admin` | Sí | No | No |
| Cuenta | `/account` | Sí | Sí | Sí |

Estas restricciones solo ocultan secciones en la interfaz. La protección real de los datos debe validarse en el backend.

## Estado del desarrollo

Listo:

- Inicio de sesión con JWT y cierre de sesión.
- Layout (barra lateral, cabecera y menú de usuario) y rutas protegidas por rol.
- Cuenta: cambio de correo, teléfono y contraseña.
- Conductores: lista, búsqueda, detalle y vigencia de la licencia.
- Panel de administración: crear, editar y deshabilitar usuarios y conductores (con los datos de la licencia cuando el rol es conductor).
- Dashboard: indicadores de usuarios y conductores, accesos rápidos y tabla de últimas incidencias.

Pendiente (depende de los endpoints del backend):

- Viajes (con mapa en tiempo real y ubicaciones conocidas).
- Incidencias y eventos.
- Vehículos (mantenimiento y dispositivos).
- Vehículos y ubicaciones conocidas dentro del panel de administración.
- Incidencias reales en el dashboard.

## Estructura del proyecto

```
src/
├── api/          Cliente de Axios (agrega el token a cada petición)
├── auth/         Sesión, rutas protegidas y rutas por rol
├── components/   Layout, barra lateral, cabecera
└── pages/        Una carpeta por sección (Dashboard, Drivers, Admin, ...)
```

## Contribuir

Para realizar cambios en este repositorio hay que crear una rama nueva por cada contribución, con un nombre corto y descriptivo en minúsculas (por ejemplo `seccion-vehiculos`), y unirla a `main` mediante un Pull Request.

Lineamientos:

- El código del proyecto debe estar escrito en inglés, pero los comentarios sí pueden estar en español.
- Usar la convención snake_case para nombrar variables y funciones.
- Los componentes de React se nombran en PascalCase, porque React lo requiere.
- Los textos que ve el usuario en la interfaz van en español.
- Cada sección vive en su propia carpeta dentro de `src/pages/`, para evitar conflictos entre integrantes.