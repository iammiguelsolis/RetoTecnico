# 🎨 Arquitectura del Frontend — Sistema de Gestión de Gastos

## Índice

1. [Visión General](#-visión-general)
2. [Estructura de Carpetas](#-estructura-de-carpetas)
3. [Flujo Completo del Usuario](#-flujo-completo-del-usuario)
4. [Punto de Entrada (main.tsx + App.tsx)](#-punto-de-entrada-maintsx--apptsx)
5. [Sistema de Rutas y Protección](#-sistema-de-rutas-y-protección)
6. [Módulo Auth — Autenticación](#-módulo-auth--autenticación)
7. [Módulo Core — Servicios, Tipos y Componentes Reutilizables](#-módulo-core--servicios-tipos-y-componentes-reutilizables)
8. [Módulo Gastos — La Pantalla Principal](#-módulo-gastos--la-pantalla-principal)
9. [Módulo Landing — Página de Bienvenida](#-módulo-landing--página-de-bienvenida)
10. [Módulo Dashboard](#-módulo-dashboard)
11. [Atomic Design — Organización de Componentes](#-atomic-design--organización-de-componentes)
12. [Comunicación con el Backend (Servicios HTTP)](#-comunicación-con-el-backend-servicios-http)
13. [Estado Global con Context API](#-estado-global-con-context-api)
14. [Flujo de Autenticación (Frontend ↔ Backend)](#-flujo-de-autenticación-frontend--backend)
15. [Tipos de Datos (Espejo del Backend)](#-tipos-de-datos-espejo-del-backend)
16. [Manejo de Errores en el Frontend](#-manejo-de-errores-en-el-frontend)
17. [Mapa de Dependencias](#-mapa-de-dependencias)

---

## 🌐 Visión General

El frontend es una **SPA (Single Page Application)** construida con **React + TypeScript** y empaquetada con **Vite**. Se comunica con el backend a través de peticiones HTTP usando **Axios** y maneja el estado de autenticación mediante **React Context API**.

### Tecnologías principales

| Tecnología | Uso |
|---|---|
| React 19 | Librería de UI (componentes) |
| TypeScript | Lenguaje con tipado estático |
| Vite 7 | Bundler y servidor de desarrollo (reemplazo de Webpack) |
| React Router 7 | Navegación entre páginas sin recargar |
| Axios | Cliente HTTP para comunicarse con la API |
| CSS Vanilla | Estilos personalizados (sin frameworks como Tailwind) |

### Principios de diseño aplicados

| Principio | Dónde se aplica |
|---|---|
| **Modularidad** | Cada módulo (auth, gastos, core) es independiente |
| **Atomic Design** | Componentes organizados en atoms → molecules → organisms → templates |
| **Separación de responsabilidades** | Tipos, servicios y componentes están en carpetas distintas |
| **Barrel Exports** | Cada carpeta tiene un `index.ts` para importaciones limpias |

---

## 📁 Estructura de Carpetas

```
frontend/src/
├── main.tsx                          ← Punto de entrada de React
├── App.tsx                           ← Rutas, Navbar y protección de rutas
├── App.css                           ← Estilos de la app (navbar, layout)
├── index.css                         ← Estilos globales (variables, reset)
│
└── modules/                          ← Organización modular
    │
    ├── auth/                         ← Módulo de Autenticación
    │   ├── context/
    │   │   └── AuthContext.tsx        ← Estado global del usuario (Context API)
    │   ├── pages/
    │   │   ├── LoginPage.tsx          ← Formulario de login
    │   │   ├── RegisterPage.tsx       ← Formulario de registro
    │   │   └── AuthPages.css          ← Estilos compartidos de auth
    │   └── index.ts                   ← Barrel export del módulo
    │
    ├── core/                         ← Módulo compartido (usado por todos)
    │   ├── components/
    │   │   ├── atoms/
    │   │   │   └── Button/           ← Botón reutilizable
    │   │   └── molecules/
    │   │       └── ExpenseFormInput/  ← Campo de formulario con label
    │   ├── services/
    │   │   ├── authService.ts        ← Llamadas HTTP de autenticación
    │   │   ├── expenseService.ts     ← Llamadas HTTP de gastos
    │   │   └── index.ts
    │   └── types/
    │       ├── auth.ts               ← Tipos de usuario y credenciales
    │       ├── expense.ts            ← Tipos de gasto y DTOs
    │       └── index.ts
    │
    ├── gastos/                       ← Módulo principal de Gastos
    │   ├── components/
    │   │   ├── atoms/                ← Piezas mínimas
    │   │   ├── molecules/
    │   │   │   └── MonthFilter/      ← Selector de año/mes
    │   │   ├── organisms/
    │   │   │   ├── ExpenseForm/      ← Formulario crear/editar gasto
    │   │   │   └── ExpenseTable/     ← Tabla con lista de gastos
    │   │   └── templates/            ← Layout de la página
    │   └── pages/
    │       ├── GastosPage.tsx         ← Página principal (orquesta todo)
    │       └── GastosPage.css
    │
    ├── dashboard/                    ← Módulo Dashboard (en desarrollo)
    │   └── pages/
    │       └── index.ts
    │
    └── landing/                      ← Página de bienvenida
        ├── LandingPage.tsx
        └── LandingPage.css
```

---

## 🔄 Flujo Completo del Usuario

```
┌──────────────────────────────────────────────────────────────────┐
│  USUARIO NUEVO                                                    │
│                                                                  │
│  1. Abre la app → ve LandingPage (/)                             │
│  2. Hace clic en "Registrarse" → RegisterPage (/register)       │
│  3. Llena el formulario → authService.register()                 │
│  4. Backend responde con { user, token }                         │
│  5. AuthContext guarda el token en localStorage                  │
│  6. Redirige automáticamente a GastosPage (/gastos)              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  USUARIO QUE VUELVE                                               │
│                                                                  │
│  1. Abre la app → AuthContext revisa localStorage                │
│  2. ¿Hay token guardado?                                         │
│     ├── SÍ → getProfile() valida con el backend → GastosPage    │
│     └── NO → LandingPage (/)                                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  EN LA PÁGINA DE GASTOS                                           │
│                                                                  │
│  1. Se cargan los gastos automáticamente (expenseService.getAll)  │
│  2. El usuario puede:                                            │
│     ├── ✏️ Crear un gasto nuevo (formulario modal)                │
│     ├── 📝 Editar un gasto existente                              │
│     ├── 🗑️ Eliminar un gasto (con confirmación)                  │
│     ├── 📅 Filtrar por mes/año                                    │
│     └── 📊 Ver resumen (Ingresos, Gastos, Balance)               │
│  3. Cada acción llama al backend y actualiza la UI al instante   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Punto de Entrada (`main.tsx` + `App.tsx`)

### `main.tsx` — El botón de encendido

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Solo hace 3 cosas:
1. Busca el `<div id="root">` en el HTML.
2. Renderiza la app dentro de él.
3. `StrictMode` activa advertencias extra durante el desarrollo (no afecta producción).

### `App.tsx` — El ensamblador

Este archivo hace lo mismo que `server.ts` en el backend: **conecta todas las piezas**.

```tsx
function App() {
  return (
    <BrowserRouter>         {/* Activa React Router */}
      <AuthProvider>        {/* Provee el estado de auth a toda la app */}
        <AppRoutes />       {/* Define las rutas y la navbar */}
      </AuthProvider>
    </BrowserRouter>
  );
}
```

La estructura de árbol es:
```
<BrowserRouter>          ← Habilita la navegación
  └── <AuthProvider>     ← Provee user, login(), logout() a todos los hijos
       └── <AppRoutes>   ← Navbar + Rutas
```

---

## 🛤️ Sistema de Rutas y Protección

### Tabla de Rutas

| URL | Componente | ¿Protegida? | Comportamiento si está logueado |
|---|---|---|---|
| `/` | `LandingPage` | ❌ | Redirige a `/gastos` |
| `/login` | `LoginPage` | ❌ | Redirige a `/gastos` |
| `/register` | `RegisterPage` | ❌ | Redirige a `/gastos` |
| `/gastos` | `GastosPage` | ✅ | Muestra la página |
| `*` (cualquier otra) | - | - | Redirige a `/` o `/gastos` |

### `ProtectedRoute` — El guardián de las rutas

```tsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
```

Funciona exactamente como el `authMiddleware` del backend, pero en el frontend:
- Si el usuario **tiene sesión** → muestra la página protegida.
- Si **no tiene sesión** → lo manda al login automáticamente.

### Doble protección

Las rutas públicas (`/login`, `/register`) también tienen protección inversa:
```tsx
<Route path="/login" element={isAuthenticated ? <Navigate to="/gastos" /> : <LoginPage />} />
```
Si ya estás logueado y escribes `/login` en la barra de dirección, te redirige a `/gastos`. No tiene sentido ver el formulario de login si ya tienes sesión.

---

## 🔐 Módulo Auth — Autenticación

### Estructura

```
auth/
├── context/
│   └── AuthContext.tsx    ← Estado global (quién está logueado)
├── pages/
│   ├── LoginPage.tsx      ← Formulario de login
│   ├── RegisterPage.tsx   ← Formulario de registro
│   └── AuthPages.css      ← Estilos compartidos
└── index.ts               ← Barrel export
```

### `AuthContext.tsx` — El cerebro del estado de usuario

```
┌─────────────────────────────────────────┐
│ AuthContext provee a toda la app:       │
│                                         │
│ • user        → datos del usuario       │
│ • isAuthenticated → ¿está logueado?     │
│ • isLoading   → ¿está procesando?       │
│ • login()     → función para loguearse  │
│ • register()  → función para registrarse│
│ • logout()    → función para salir      │
└─────────────────────────────────────────┘
```

Cualquier componente en la app puede acceder a estos datos usando:
```tsx
const { user, login, logout } = useAuth();
```

### Flujo del `AuthProvider`

```
1. Al montar → revisa si hay un token en localStorage
   ├── SÍ → llama a getProfile() al backend para validar
   │        ├── Token válido → setUser(datos)
   │        └── Token expirado → authService.logout() (limpia localStorage)
   └── NO → user queda en null (no autenticado)
```

### `LoginPage.tsx` y `RegisterPage.tsx`

Son formularios que:
1. Recogen email/password (y nombre en registro).
2. Llaman a `login()` o `register()` del AuthContext.
3. Si hay éxito → el AuthContext actualiza el estado → React redirige automáticamente a `/gastos`.
4. Si hay error → muestran un mensaje de error al usuario.

---

## 🧰 Módulo Core — Servicios, Tipos y Componentes Reutilizables

### Estructura

```
core/
├── components/          ← Componentes reutilizables (Atomic Design)
│   ├── atoms/
│   │   └── Button/      ← Botón genérico con variantes
│   └── molecules/
│       └── ExpenseFormInput/  ← Campo de formulario con label
├── services/            ← Comunicación con el backend
│   ├── authService.ts   ← Llamadas HTTP de auth
│   └── expenseService.ts ← Llamadas HTTP de gastos
└── types/               ← Tipos de datos compartidos
    ├── auth.ts           ← IUser, LoginCredentials, etc.
    └── expense.ts        ← IExpense, CreateExpenseDTO, etc.
```

### ¿Por qué existe el módulo `core`?

Es la "caja de herramientas" compartida. Tanto el módulo `auth` como el módulo `gastos` necesitan:
- Los **tipos** (`IUser`, `IExpense`).
- Los **servicios** (`authService`, `expenseService`).
- Los **componentes** reutilizables (`Button`, `ExpenseFormInput`).

En vez de duplicar código, todo se centraliza aquí.

---

## 💰 Módulo Gastos — La Pantalla Principal

### Estructura

```
gastos/
├── components/
│   ├── atoms/               ← Piezas básicas (badges de prioridad, etc.)
│   ├── molecules/
│   │   └── MonthFilter/     ← Selector de año y mes para filtrar
│   ├── organisms/
│   │   ├── ExpenseForm/     ← Formulario completo (crear + editar)
│   │   └── ExpenseTable/    ← Tabla con todos los gastos
│   └── templates/           ← Layout de la página
└── pages/
    ├── GastosPage.tsx        ← Orquestador (la página principal)
    └── GastosPage.css
```

### `GastosPage.tsx` — El orquestador

Este es el componente más importante del frontend. Es el que coordina todo lo que pasa en la pantalla principal:

#### Estado que maneja

| Variable | Tipo | Uso |
|---|---|---|
| `expenses` | `IExpense[]` | Lista de gastos cargados |
| `isLoading` | `boolean` | ¿Están cargando los datos? |
| `isSubmitting` | `boolean` | ¿Se está enviando un formulario? |
| `error` | `string \| null` | Mensaje de error actual |
| `showForm` | `boolean` | ¿Mostrar el formulario? |
| `expenseToEdit` | `IExpense \| null` | ¿Qué gasto se está editando? |
| `filterYear` | `number` | Año seleccionado para filtrar |
| `filterMonth` | `number` | Mes seleccionado para filtrar |
| `isFiltering` | `boolean` | ¿Se está filtrando por mes? |

#### Funciones principales

```
┌────────────────────┬─────────────────────────────────────────────────┐
│ Función            │ Qué hace                                       │
├────────────────────┼─────────────────────────────────────────────────┤
│ loadExpenses()     │ Carga todos los gastos del usuario              │
│ loadExpensesByMonth│ Filtra gastos por año/mes                       │
│ handleCreate()     │ Crea un gasto nuevo y lo agrega a la lista      │
│ handleUpdate()     │ Edita un gasto y actualiza la lista             │
│ handleDelete()     │ Pide confirmación y elimina el gasto            │
│ openCreateForm()   │ Abre el formulario vacío                        │
│ openEditForm()     │ Abre el formulario con datos del gasto a editar │
│ closeForm()        │ Cierra el formulario                            │
│ applyFilter()      │ Aplica el filtro de mes                         │
│ clearFilter()      │ Quita el filtro y muestra todos                 │
└────────────────────┴─────────────────────────────────────────────────┘
```

#### Cálculos en tiempo real

La página calcula automáticamente tres métricas sin necesidad de pedírselas al backend:

```ts
const totalIncome  = expenses.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
const totalExpenses = expenses.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
const balance      = totalIncome - totalExpenses;
```

Estos valores se muestran en las **tarjetas de estadísticas** en la parte superior de la página:
- 💚 **Ingresos** (color verde)
- 🔴 **Gastos** (color coral)
- 📊 **Balance Neto** (verde si positivo, rojo si negativo)

#### Actualización optimista de la UI

Cuando creas, editas o borras un gasto, el frontend **actualiza la lista inmediatamente** sin necesidad de recargar toda la página:

```ts
// Al crear → agrega al inicio de la lista
setExpenses((prev) => [nuevoGasto, ...prev]);

// Al editar → reemplaza solo el que cambió
setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

// Al borrar → quita de la lista
setExpenses((prev) => prev.filter((e) => e.id !== id));
```

Esto usa **`setState` con función callback** (`prev =>`) en lugar de recargar todos los datos desde el servidor. El resultado es una UI mucho más fluida y rápida.

---

## 🏠 Módulo Landing — Página de Bienvenida

```
landing/
├── LandingPage.tsx    ← Componente de la landing
└── LandingPage.css    ← Estilos de la landing
```

Es la primera página que ve un usuario no autenticado. Contiene:
- Presentación de la aplicación.
- Botones para ir a Login o Registro.
- Una vez autenticado, nunca se vuelve a ver (redirige a `/gastos`).

---

## 📊 Módulo Dashboard

```
dashboard/
└── pages/
    └── index.ts    ← Solo un export vacío (en desarrollo)
```

Este módulo está preparado para futuras funcionalidades como gráficos, reportes y estadísticas avanzadas. Actualmente está en fase de desarrollo.

---

## ⚛️ Atomic Design — Organización de Componentes

El frontend organiza sus componentes siguiendo el patrón **Atomic Design**, donde las piezas más simples se combinan para formar las más complejas:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   🔵 ÁTOMOS (Atoms)                                 │
│   Las piezas más pequeñas e indivisibles.           │
│   • Button → un botón con variantes (primary,       │
│              secondary, danger) y tamaños (sm, md)  │
│   • Badges de prioridad (LOW, MEDIUM, HIGH)         │
│                                                     │
│   🟢 MOLÉCULAS (Molecules)                           │
│   Combinación de átomos que forman un componente    │
│   funcional:                                        │
│   • ExpenseFormInput → label + input                │
│   • MonthFilter → selector de año + selector de mes │
│                                                     │
│   🟠 ORGANISMOS (Organisms)                          │
│   Componentes complejos con lógica propia:          │
│   • ExpenseForm → formulario completo de gasto      │
│     (usa múltiples ExpenseFormInput + Button)        │
│   • ExpenseTable → tabla con filas de gastos,       │
│     botones de editar/eliminar                      │
│                                                     │
│   🔴 TEMPLATES (Templates)                           │
│   Definen el layout de la página:                   │
│   • Estructura de la GastosPage                     │
│                                                     │
│   🟣 PÁGINAS (Pages)                                 │
│   El componente final que usa todo lo anterior:     │
│   • GastosPage → orquesta organismos + estado       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### ¿Por qué usar Atomic Design?

| Sin Atomic Design | Con Atomic Design |
|---|---|
| Un solo archivo gigante con todo | Piezas pequeñas y reutilizables |
| Si cambias el botón, no sabes qué se rompe | Cambias `Button/` y afecta a toda la app consistentemente |
| Difícil de testear | Puedes testear cada pieza por separado |
| Difícil de reutilizar | El mismo `Button` se usa en auth, gastos y landing |

---

## 🔌 Comunicación con el Backend (Servicios HTTP)

### `authService.ts` — Servicio de Autenticación

```
┌────────────────────────────────────────────────────────────┐
│ authService                                                │
│                                                            │
│ • register(credentials) → POST /api/auth/register          │
│ • login(credentials)    → POST /api/auth/login             │
│ • getProfile()          → GET  /api/auth/me                │
│ • saveSession(auth)     → guarda token + user en localStorage │
│ • logout()              → borra token + user de localStorage  │
│ • getToken()            → lee el token de localStorage     │
│ • getUser()             → lee el usuario de localStorage   │
│ • isAuthenticated()     → ¿hay token guardado?             │
└────────────────────────────────────────────────────────────┘
```

### `expenseService.ts` — Servicio de Gastos

```
┌────────────────────────────────────────────────────────────┐
│ expenseService                                             │
│                                                            │
│ • getAll()                   → GET    /api/expenses        │
│ • getByMonth(year, month)    → GET    /api/expenses/month/ │
│ • create(data)               → POST   /api/expenses       │
│ • update(id, data)           → PUT    /api/expenses/:id    │
│ • delete(id)                 → DELETE /api/expenses/:id    │
└────────────────────────────────────────────────────────────┘
```

### El Interceptor de Axios (JWT automático)

En lugar de agregar el token manualmente en cada petición, el `expenseService` usa un **interceptor**:

```ts
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Esto significa que **todas las peticiones** que salgan de este `apiClient` llevarán el token JWT automáticamente en el header. Es el equivalente frontend del `authMiddleware` del backend.

### Configuración del API Client

```ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});
```

- **`baseURL`**: Usa la variable de entorno `VITE_API_URL`. Si no existe, usa `http://localhost:3000/api`.
- **`Content-Type`**: Todas las peticiones envían y esperan JSON.

---

## 🧠 Estado Global con Context API

### ¿Cómo funciona el AuthContext?

```
          ┌─────────────────────┐
          │    AuthProvider      │ ← Envuelve toda la app en App.tsx
          │                     │
          │  Estado:            │
          │  • user = {...}     │
          │  • isAuthenticated  │
          │  • isLoading        │
          │                     │
          │  Funciones:         │
          │  • login()          │
          │  • register()       │
          │  • logout()         │
          └──────────┬──────────┘
                     │ provee datos a...
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼─────┐    ┌─────────▼─────────┐
    │  Navbar   │    │  ProtectedRoute    │
    │ (muestra  │    │ (decide si dejar   │
    │  nombre)  │    │  pasar o redirigir)│
    └───────────┘    └───────────────────┘
```

### ¿Por qué Context y no Redux/Zustand?

Para esta aplicación, el único estado realmente "global" es si el usuario está logueado o no. Context API es perfecto para esto:
- **Simple**: No necesitas instalar librerías extra.
- **Nativo**: Viene incluido en React.
- **Suficiente**: Para un estado pequeño (solo `user` y `token`), no necesitas un sistema más complejo.

### El patrón `useAuth()`

```tsx
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
```

Este **custom hook** tiene dos beneficios:
1. **Simplifica el uso**: En vez de importar `useContext` y `AuthContext` en cada componente, solo importas `useAuth`.
2. **Seguridad**: Si alguien intenta usar `useAuth()` fuera del `AuthProvider`, lanza un error claro en vez de devolver `undefined`.

---

## 🔄 Flujo de Autenticación (Frontend ↔ Backend)

### Registro

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ RegisterPage │     │ AuthContext   │     │  Backend     │
│              │     │              │     │              │
│ 1. Usuario   │     │              │     │              │
│    llena el  │     │              │     │              │
│    formulario│     │              │     │              │
│              │     │              │     │              │
│ 2. Llama a   │────▶│ 3. register()│────▶│ 4. Crea user │
│    register()│     │    del       │     │    hashea pw │
│              │     │    context   │     │    genera JWT│
│              │     │              │     │              │
│              │     │ 5. Guarda    │◀────│ { user,token}│
│              │     │    token en  │     │              │
│              │     │    localStorage    │              │
│              │     │              │     │              │
│ 7. Redirige  │◀────│ 6. setUser() │     │              │
│    a /gastos │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Login

```
1. LoginPage → llama a login() del AuthContext
2. AuthContext → llama a authService.login()
3. authService → POST /api/auth/login con email + password
4. Backend → verifica credenciales → devuelve { user, token }
5. authService → guarda token y user en localStorage
6. AuthContext → actualiza el estado (setUser)
7. React → detecta el cambio → redirige a /gastos
```

### Persistencia de sesión (al recargar la página)

```
1. App se monta → AuthProvider se inicializa
2. AuthProvider → lee localStorage para ver si hay un token
3. Si hay token → llama a getProfile() al backend
   ├── Token válido → setUser(datos) → la app sabe quién eres
   └── Token expirado → logout() → limpia localStorage → manda a login
4. Si no hay token → user es null → la app muestra LandingPage
```

### Almacenamiento en localStorage

| Clave | Valor | Ejemplo |
|---|---|---|
| `expense_tracker_token` | JWT del usuario | `"eyJhbGciOiJ..."` |
| `expense_tracker_user` | Datos del usuario (JSON) | `'{"id":"abc","name":"Miguel",...}'` |

---

## 📝 Tipos de Datos (Espejo del Backend)

Los tipos del frontend son un **espejo** de los modelos del backend. Esto asegura que ambos "hablen el mismo idioma":

### `auth.ts` — Tipos de autenticación

```
┌──────────────────────────────────────────────┐
│ IUser (lo que se guarda en el Context)       │
├──────────────────────────────────────────────┤
│ id, name, email, monthlyBudget               │
│ createdAt, updatedAt                         │
│                                              │
│ ⚠️ NO tiene passwordHash                     │
│ (el backend nunca lo envía, por seguridad)   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ AuthResponse (lo que devuelve login/register)│
├──────────────────────────────────────────────┤
│ user: IUser                                  │
│ token: string (JWT)                          │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ LoginCredentials / RegisterCredentials       │
├──────────────────────────────────────────────┤
│ email, password (+name en registro)          │
└──────────────────────────────────────────────┘
```

### `expense.ts` — Tipos de gasto

```
┌──────────────────────────────────────────────┐
│ IExpense (un gasto completo)                 │
├──────────────────────────────────────────────┤
│ id, userId, title, reason, date, amount      │
│ type: 'INCOME' | 'EXPENSE'                  │
│ priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH'    │
│ isRecurring, frequency, interval             │
│ reminderDate, createdAt, updatedAt           │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ CreateExpenseDTO (para crear un gasto nuevo) │
├──────────────────────────────────────────────┤
│ title, reason, date, amount, type            │
│ + campos opcionales                          │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ApiResponse<T> (estructura de respuesta)     │
├──────────────────────────────────────────────┤
│ status: 'success' | 'error'                 │
│ data?: T                                     │
│ count?, message?, filter?                    │
└──────────────────────────────────────────────┘
```

### ¿Por qué duplicar los tipos?

Porque el frontend y el backend son proyectos **independientes**. Podrían estar en repositorios diferentes, ejecutarse en máquinas diferentes, y ser manejados por equipos diferentes. Tener los tipos definidos en ambos lados asegura que:
1. El frontend sabe exactamente qué estructura esperar del backend.
2. TypeScript te avisa si intentas usar un campo que no existe.
3. El autocompletado de VS Code funciona en ambos lados.

---

## ❌ Manejo de Errores en el Frontend

### Errores de red (API calls)

Cada función en `GastosPage` tiene su propio manejo de errores:

```tsx
const handleCreate = async (data) => {
  try {
    setIsSubmitting(true);
    const nuevo = await expenseService.create(data);
    setExpenses((prev) => [nuevo, ...prev]);
  } catch {
    setError('Error al crear el gasto.');   // ← se muestra como alerta roja
  } finally {
    setIsSubmitting(false);                 // ← siempre se ejecuta
  }
};
```

### El patrón `try / catch / finally`

| Bloque | Siempre ejecuta | Cuándo |
|---|---|---|
| `try` | No (solo si todo bien) | Lógica principal |
| `catch` | No (solo si hay error) | Guardar mensaje de error en estado |
| `finally` | **SÍ, SIEMPRE** | Quitar el loading/spinner |

### Componente de alerta

Cuando hay un error, la página muestra una alerta roja con un botón de "Reintentar":

```tsx
{error ? (
  <div className="gastos-alert" role="alert">
    ⚠️ {error}
    <button onClick={loadExpenses}>Reintentar</button>
  </div>
) : null}
```

---

## 🗺️ Mapa de Dependencias

```
main.tsx
  └── App.tsx
       │
       ├── <BrowserRouter>                  ← React Router
       │
       └── <AuthProvider>                   ← Context API (estado global)
            │   usa → authService           ← HTTP calls al backend
            │   usa → localStorage          ← persistencia del token
            │
            └── <AppRoutes>
                 │
                 ├── <Navbar>                ← usa useAuth() para mostrar nombre
                 │
                 ├── <LandingPage>           ← página pública
                 ├── <LoginPage>             ← usa useAuth().login()
                 ├── <RegisterPage>          ← usa useAuth().register()
                 │
                 └── <ProtectedRoute>        ← verifica isAuthenticated
                      │
                      └── <GastosPage>       ← la página principal
                           │   usa → expenseService    ← HTTP calls
                           │   usa → useState           ← estado local
                           │
                           ├── <Button>          (atom)
                           ├── <MonthFilter>     (molecule)
                           ├── <ExpenseForm>     (organism)
                           └── <ExpenseTable>    (organism)
```

---

## ⚙️ Variables de Entorno

| Variable | Uso | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:3000/api` |

Para configurarla, crea un archivo `.env` en la raíz del frontend:
```
VITE_API_URL=http://localhost:3000/api
```

> **Nota**: En Vite, las variables de entorno deben empezar con `VITE_` para ser accesibles desde el código.

---

## 🛠️ Scripts Disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo (hot reload) |
| `npm run build` | Compila TypeScript y genera el bundle de producción |
| `npm run lint` | Ejecuta ESLint para buscar errores de estilo |
| `npm run preview` | Previsualiza el build de producción localmente |
