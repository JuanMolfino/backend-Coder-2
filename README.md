# Curso Programacion Backend -2

Sistema de ecommerce con Node.js, Express, MongoDB y Socket.io.

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB local (ejecutándose en localhost:27017)
- npm o yarn

## Instalacion

1. Clonar el repositorio o descargar los archivos
2. Navegar a la carpeta del proyecto
3. Instalar las dependencias:

```bash
npm install
```

## Levantar el Proyecto en Local

Para iniciar el servidor en modo desarrollo:

```bash
npm start
```

El servidor se iniciará en:
```
http://localhost:8080
```

La base de datos se conectará automáticamente a:
```
mongodb://127.0.0.1:27017/entrega-final
```

## Estructura del Proyecto

```
.
├── public/
│   ├── css/
│   │   └── index.css
│   └── js/
│       ├── index.js
│       └── ecommerce.js
├── src/
│   ├── app.js
│   ├── websocket.js
│   ├── dao/
│   │   ├── cartDBManager.js
│   │   ├── cartFSManager.js
│   │   └── models/
│   │       ├── productModel.js
│   │       └── cartModel.js
│   ├── routes/
│   │   ├── productRouter.js
│   │   ├── cartRouter.js
│   │   └── viewsRouter.js
│   ├── utils/
│   │   ├── constantsUtil.js
│   │   └── multerUtil.js
│   └── views/
│       ├── index.handlebars
│       ├── cart.handlebars
│       ├── realTimeProducts.handlebars
│       ├── notFound.handlebars
│       └── layouts/
│           └── main.handlebars
└── package.json
```

## API Endpoints

### Productos

#### GET /api/products
Obtiene la lista de todos los productos con paginacion.

Query parameters:
- `limit`: cantidad de productos por página (default: 10)
- `page`: número de página (default: 1)
- `sort`: ordenamiento (asc o desc)
- `query`: búsqueda por filtros

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "docs": [...],
    "totalPages": 5,
    "prevPage": null,
    "nextPage": 2,
    "page": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevLink": null,
    "nextLink": "/api/products?page=2"
  }
}
```

#### GET /api/products/:pid
Obtiene un producto específico por su ID.

Parámetros:
- `pid`: ID del producto (requerido)

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "title": "Producto",
    "description": "Descripción",
    "price": 100,
    "thumbnails": [...],
    "code": "ABC123",
    "stock": 50,
    "category": "categoría",
    "status": true
  }
}
```

#### POST /api/products
Crea un nuevo producto. Soporta carga de imágenes mediante multipart/form-data.

Body (multipart/form-data):
```
title: string (requerido)
description: string (requerido)
price: number (requerido)
thumbnails: files (máximo 3 archivos)
code: string (requerido)
stock: number (requerido)
category: string (requerido)
status: boolean (default: true)
```

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "title": "Nuevo Producto",
    ...
  }
}
```

#### PUT /api/products/:pid
Actualiza un producto existente. Soporta carga de imágenes.

Parámetros:
- `pid`: ID del producto (requerido)

Body (multipart/form-data): mismos campos que POST

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "title": "Producto Actualizado",
    ...
  }
}
```

#### DELETE /api/products/:pid
Elimina un producto.

Parámetros:
- `pid`: ID del producto (requerido)

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "deleteCount": 1
  }
}
```

### Carritos

#### GET /api/carts/:cid
Obtiene los productos de un carrito específico.

Parámetros:
- `cid`: ID del carrito (requerido)

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "products": [
      {
        "product": {...},
        "quantity": 2
      }
    ]
  }
}
```

#### POST /api/carts
Crea un nuevo carrito vacío.

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "products": []
  }
}
```

#### POST /api/carts/:cid/product/:pid
Agrega un producto al carrito.

Parámetros:
- `cid`: ID del carrito (requerido)
- `pid`: ID del producto (requerido)

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "products": [...]
  }
}
```

#### DELETE /api/carts/:cid/product/:pid
Elimina un producto del carrito.

Parámetros:
- `cid`: ID del carrito (requerido)
- `pid`: ID del producto (requerido)

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "deleteCount": 1
  }
}
```

#### PUT /api/carts/:cid
Actualiza todos los productos del carrito.

Parámetros:
- `cid`: ID del carrito (requerido)

Body (JSON):
```json
{
  "products": [
    {
      "product": "id_producto",
      "quantity": 2
    }
  ]
}
```

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "products": [...]
  }
}
```

#### PUT /api/carts/:cid/product/:pid
Actualiza la cantidad de un producto en el carrito.

Parámetros:
- `cid`: ID del carrito (requerido)
- `pid`: ID del producto (requerido)

Body (JSON):
```json
{
  "quantity": 5
}
```

Respuesta:
```json
{
  "status": "success",
  "payload": {
    "_id": "...",
    "products": [...]
  }
}
```

## Vistas

### GET /products
Página principal con listado de productos. Incluye paginación y búsqueda.

### GET /realtimeproducts
Página de productos en tiempo real. Utiliza WebSocket para actualizaciones.

### GET /cart/:cid
Página del carrito. Muestra los productos agregados al carrito.

## Tecnologías Utilizadas

- Express.js: framework web
- MongoDB: base de datos
- Mongoose: ODM para MongoDB
- Handlebars: motor de plantillas
- Socket.io: comunicación en tiempo real
- Multer: carga de archivos
- Nodemon: reinicio automático en desarrollo

