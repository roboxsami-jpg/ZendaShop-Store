# Zenda Shop - Tienda Online Moderna

Una tienda online moderna y atractiva construida con **React 19**, **Tailwind CSS 4**, **Express**, **tRPC** y **MySQL**. Incluye carrito de compras, sistema de pago integrado con PayPal, soporte automatizado con IA y autenticación de usuario.

## 🌟 Características Principales

### Experiencia de Compra
- **Catálogo de Productos**: Visualización moderna de productos con imágenes de alta calidad
- **Búsqueda Avanzada**: Barra de búsqueda con filtrado en tiempo real
- **Carrito de Compras**: Gestión completa del carrito con actualización de cantidades
- **Selector de Colores**: Para productos con múltiples opciones de color (Jordan 1 Retro)
- **Secciones Dinámicas**: 
  - Destacados (productos disponibles)
  - Próximamente (productos en desarrollo)
  - Lo más buscado

### Sistema de Pago
- **Integración PayPal**: Pagos seguros con PayPal
- **Tarjeta de Crédito/Débito**: Soporte para Visa, Mastercard, American Express
- **Página de Checkout**: Interfaz segura y clara para completar pagos
- **Confirmación de Pedido**: Página de éxito con detalles del pedido

### Soporte al Cliente
- **Chat IA Integrado**: Sistema de soporte automatizado con inteligencia artificial
- **Acceso desde Productos**: Botón "Consultar" en cada producto
- **Historial de Conversaciones**: Almacenamiento de todas las conversaciones

### Autenticación
- **Login con Google**: Autenticación segura y rápida
- **Gestión de Usuarios**: Perfiles de usuario con historial de pedidos
- **Protección de Datos**: Encriptación de información sensible

## 📦 Productos Disponibles

### Destacados
1. **Jordan 1 Retro** - €100.00
   - Zapatillas de baloncesto clásicas
   - Colores: Rojo, Azul, Marrón, Verde

2. **AirPods Pro 2** - €35.00
   - Auriculares inalámbricos premium
   - Cancelación de ruido activa

3. **Portátil** - €560.00
   - Computadora portátil de alto rendimiento
   - Ideal para profesionales

### Próximamente
- Smartwatch Pro (€299.00)
- Cámara Digital (€899.00)
- Tablet Ultra (€799.00)

## 🛠️ Stack Tecnológico

### Frontend
- **React 19**: Framework UI moderno
- **Tailwind CSS 4**: Estilos responsivos
- **shadcn/ui**: Componentes accesibles
- **tRPC**: Type-safe API calls
- **Wouter**: Enrutamiento ligero

### Backend
- **Express 4**: Servidor web
- **tRPC 11**: API type-safe
- **MySQL/TiDB**: Base de datos
- **Drizzle ORM**: Gestión de base de datos

### Características Especiales
- **LLM Integration**: Soporte con IA (Claude/GPT)
- **OAuth**: Autenticación con Google
- **PayPal MCP**: Integración de pagos
- **S3 Storage**: Almacenamiento de archivos

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- pnpm o npm
- MySQL/TiDB database

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/SamiOusghir-cell/KeusBox.git
cd KeusBox

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
pnpm db:push

# Seed de productos
npx tsx scripts/seed-products.ts

# Iniciar servidor de desarrollo
pnpm dev
```

### Acceso
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/trpc

## 📁 Estructura del Proyecto

```
ZendaShop/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Checkout, Success)
│   │   ├── components/    # Componentes reutilizables
│   │   ├── lib/           # Utilidades (tRPC client)
│   │   └── App.tsx        # Enrutamiento principal
│   └── public/            # Activos estáticos
│
├── server/                # Backend Express
│   ├── routers.ts         # Rutas tRPC
│   ├── db.ts              # Helpers de base de datos
│   ├── paypal.ts          # Integración PayPal
│   └── _core/             # Configuración core
│
├── drizzle/               # Esquema de base de datos
│   └── schema.ts          # Tablas y tipos
│
└── scripts/               # Scripts de utilidad
    └── seed-products.ts   # Seed inicial de productos
```

## 🔐 Seguridad

- ✅ Encriptación SSL/TLS para pagos
- ✅ Validación de entrada en servidor
- ✅ Protección CSRF
- ✅ Autenticación OAuth
- ✅ Datos de tarjeta no almacenados

## 📊 Base de Datos

### Tablas Principales

**users**: Información de usuarios
- id, name, email, loginMethod, role, createdAt, lastSignedIn

**products**: Catálogo de productos
- id, name, description, price, image, colors, category, inStock, comingSoon

**cartItems**: Artículos en carrito
- id, userId, productId, quantity, selectedColor, createdAt, updatedAt

**orders**: Historial de pedidos
- id, userId, totalAmount, status, paymentMethod, paymentId, items, createdAt

**supportConversations**: Soporte con IA
- id, userId, productId, messages, resolved, createdAt, updatedAt

## 🎨 Diseño

- **Color Principal**: Verde (#16a34a)
- **Tema**: Claro con degradados suaves
- **Tipografía**: Moderna y legible
- **Responsive**: Optimizado para móvil, tablet y desktop

## 📝 Variables de Entorno Requeridas

```
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_TITLE=Zenda Shop
VITE_APP_LOGO=https://...
BUILT_IN_FORGE_API_URL=https://...
BUILT_IN_FORGE_API_KEY=your-api-key
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📧 Contacto

Para preguntas o soporte, contacta a: Ousghirsamibn@gmail.com

---

**Zenda Shop** - Hecho con ❤️ para una experiencia de compra excepcional

