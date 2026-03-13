## Curso Programación Backend - Proyecto Final

Servidor de ecommerce desarrollado con **Node.js**, **Express** y **MongoDB**, con autenticación JWT (cookie), manejo de roles, recuperación de contraseña por correo y lógica de compra con generación de tickets.

## Requisitos

- Node.js 18+ (recomendado)
- MongoDB (local o remoto)
- npm

## Instalación

```bash
npm install
```

## Configuración (.env)

El proyecto usa variables de entorno. Partí de `.env.example` y creá tu `.env`.

Variables principales:

- `PORT`: puerto del servidor (default 8080)
- `MONGO_URI`: string de conexión a MongoDB
- `JWT_SECRET`: secreto para firmar JWT
- `APP_BASE_URL`: URL base para armar el link del mail de recuperación (ej. `http://localhost:8080`)

Mailing (opcional, para recuperación de contraseña):

- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`

Si las variables de mail **no están** configuradas, el endpoint de recuperación responde OK igual (respuesta neutra) pero **no envía** correo.

## Ejecución

Modo desarrollo (nodemon):

```bash
npm start
```

Servidor:
- `http://localhost:8080`

## Arquitectura (resumen)

Se incorporó una arquitectura más profesional por capas:

- **DAO**: acceso a datos (Mongo/Mongoose) en `src/dao/mongo/`
- **Repository**: abstracción para lógica de negocio en `src/repositories/`
- **Services**: casos de uso (reset password, compra) en `src/services/`
- **DTOs**: salida controlada de datos (ej. `/current`) en `src/dtos/`
- **Middlewares**: autorización por roles en `src/middlewares/`

## Autenticación y roles

- Login genera un JWT y lo setea en cookie `jwt` (HTTPOnly).
- Roles soportados: `user` y `admin`.

Reglas:

- **Solo `admin`** puede crear/actualizar/eliminar productos:
  - `POST /api/products`
  - `PUT /api/products/:pid`
  - `DELETE /api/products/:pid`
- **Solo `user`** puede agregar productos al carrito:
  - `POST /api/carts/:cid/product/:pid`

## Endpoints principales

### Sesiones

- `POST /api/sessions/register`: registra usuario (crea carrito asociado)
- `POST /api/sessions/login`: login (cookie `jwt`)
- `GET /api/sessions/current`: devuelve **DTO** del usuario (sin datos sensibles)

### Recuperación de contraseña

- `POST /api/sessions/forgot-password`
  - Body: `{ "email": "..." }`
  - Envía correo con link (si mailing está configurado)
  - Link expira en **1 hora**
- `POST /api/sessions/reset-password?token=...`
  - Body: `{ "password": "..." }`
  - Valida expiración del token
  - Evita restablecer a la **misma contraseña** (actual e historial reciente)

### Carritos

- `POST /api/carts`: crea un carrito
- `GET /api/carts/:cid`: obtiene carrito con productos
- `POST /api/carts/:cid/product/:pid`: agrega producto (solo `user`)
- `POST /api/carts/:cid/purchase`: realiza compra y genera ticket (solo `user`)

## Compra y ticket

La compra:

- Verifica stock por producto
- Descuenta stock cuando alcanza
- Genera un **ticket** con:
  - `code`, `purchase_datetime`, `amount`, `purchaser`, `products`
  - `status`: `complete` o `incomplete`
- Si hay productos sin stock, la compra queda **incompleta** y el carrito conserva solo lo no comprado

## Tecnologías

- Express
- MongoDB + Mongoose
- Passport (JWT)
- Nodemailer (mailing)
- Handlebars
- Socket.io
- Multer

