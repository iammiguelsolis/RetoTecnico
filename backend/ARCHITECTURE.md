# 🏗️ Arquitectura del Backend — Sistema de Gestión de Gastos

## Índice

1. [Visión General](#-visión-general)
2. [Estructura de Carpetas](#-estructura-de-carpetas)
3. [Flujo Completo de una Petición](#-flujo-completo-de-una-petición)
4. [Capa 1 — Modelos (models/)](#-capa-1--modelos-models)
5. [Capa 2 — Validación (schemas/)](#-capa-2--validación-schemas)
6. [Capa 3 — Repositorios (repository/ + data/)](#-capa-3--repositorios-repository--data)
7. [Capa 4 — Servicios (services/)](#-capa-4--servicios-services)
8. [Capa 5 — Controladores (controllers/)](#-capa-5--controladores-controllers)
9. [Capa 6 — Middlewares (middlewares/)](#-capa-6--middlewares-middlewares)
10. [Capa 7 — Manejo de Errores (errors/)](#-capa-7--manejo-de-errores-errors)
11. [Capa 8 — Rutas (routes/)](#-capa-8--rutas-routes)
12. [Patrones de Diseño (patterns/)](#-patrones-de-diseño-patterns)
13. [Seguridad y Autenticación](#-seguridad-y-autenticación)
14. [Estructuras de Datos Utilizadas](#-estructuras-de-datos-utilizadas)
15. [Testing](#-testing)
16. [Ensamblaje Final (server.ts + index.ts)](#-ensamblaje-final-serverts--indexts)
17. [Mapa de Dependencias](#-mapa-de-dependencias)

---

## 🌐 Visión General

Este backend es una **API REST** construida con **TypeScript + Express.js** para gestionar gastos personales. Sigue una arquitectura en capas (Layered Architecture) donde cada capa tiene una responsabilidad única y bien definida.

### Tecnologías principales

| Tecnología | Uso |
|---|---|
| TypeScript | Lenguaje principal (tipado estático) |
| Express.js | Framework HTTP para manejar rutas y middlewares |
| MySQL | Base de datos relacional principal |
| JSON (archivo local) | Base de datos alternativa para desarrollo sin MySQL |
| Zod | Validación de datos de entrada |
| bcrypt | Encriptación de contraseñas |
| jsonwebtoken (JWT) | Autenticación basada en tokens |
| Jest | Framework de testing |
| Swagger | Documentación interactiva de la API |

### Principios de diseño aplicados

| Principio | Dónde se aplica |
|---|---|
| **Separación de responsabilidades** | Cada capa (Repo, Service, Controller) tiene un único propósito |
| **Inversión de dependencias** | Los servicios dependen de interfaces, no de implementaciones concretas |
| **Principio Abierto/Cerrado** | Los patrones Observer y Strategy permiten extender sin modificar |
| **Inyección de dependencias** | Todo se ensambla en `server.ts` y se pasa por constructor |

---

## 📁 Estructura de Carpetas

```
backend/src/
├── index.ts                  ← Punto de entrada (arranca el servidor)
├── server.ts                 ← Ensamblador (conecta todas las piezas)
├── swagger.ts                ← Documentación interactiva de la API
│
├── models/                   ← Capa 1: Forma de los datos
│   ├── Expense.ts            ← Interfaces y DTOs de gastos
│   └── User.ts               ← Interfaces y DTOs de usuarios
│
├── schemas/                  ← Capa 2: Validación de entrada
│   ├── expenseSchema.ts      ← Reglas Zod para gastos
│   └── authSchema.ts         ← Reglas Zod para auth
│
├── repository/               ← Capa 3a: Contratos (interfaces)
│   └── interfaces/
│       ├── IExpenseRepository.ts
│       └── IUserRepository.ts
│
├── data/                     ← Capa 3b: Implementaciones de los repos
│   ├── MySqlExpenseRepository.ts
│   ├── MySqlUserRepository.ts
│   ├── JsonExpenseRepository.ts
│   ├── JsonUserRepository.ts
│   ├── ExpenseRepositoryFactory.ts
│   └── index.ts
│
├── services/                 ← Capa 4: Lógica de negocio
│   ├── AuthService.ts
│   ├── ExpenseService.ts
│   └── __tests__/
│       └── ExpenseService.test.ts
│
├── controllers/              ← Capa 5: Manejo HTTP
│   ├── AuthController.ts
│   ├── ExpenseController.ts
│   └── index.ts
│
├── middlewares/               ← Capa 6: Funciones intermedias
│   ├── authMiddleware.ts     ← Verifica JWT
│   ├── errorHandler.ts       ← Captura errores globales
│   └── index.ts
│
├── errors/                   ← Capa 7: Errores personalizados
│   ├── AppError.ts           ← Error base con statusCode
│   ├── NotFoundError.ts      ← Error 404 específico
│   └── index.ts
│
├── routes/                   ← Capa 8: Mapa URL → Controlador
│   ├── authRoutes.ts
│   ├── expenseRoutes.ts
│   └── index.ts
│
└── patterns/                 ← Patrones de diseño
    ├── factory/
    │   └── RepositoryFactory.ts
    ├── observer/
    │   ├── ExpenseSubject.ts
    │   ├── HighPriorityAlertObserver.ts
    │   └── WhatsAppObserver.ts
    ├── proxy/
    │   └── CacheExpenseProxy.ts
    └── strategy/
        ├── ExpenseFilterContext.ts
        ├── FilterByMonthStrategy.ts
        ├── FilterByPriorityStrategy.ts
        └── __tests__/
            └── FilterByMonthStrategy.test.ts
```

---

## 🔄 Flujo Completo de una Petición

El siguiente diagrama muestra lo que sucede cuando un usuario del frontend crea un gasto nuevo:

```
[Frontend] → POST /api/expenses { title: "Almuerzo", amount: 50 }
     │
     │  Header: Authorization: Bearer eyJhbG...
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  EXPRESS SERVER                                             │
│                                                             │
│  1. CORS Middleware         → Permite peticiones externas   │
│  2. JSON Parser             → Convierte body a objeto JS   │
│                                                             │
│  3. authMiddleware          → ¿Tiene token válido?          │
│     ├── NO → errorHandler   → { error: "Token requerido" } │
│     └── SÍ → req.user = { userId: "abc123", email: "..." } │
│                                                             │
│  4. ExpenseController.create()                              │
│     ├── Valida con Zod (createExpenseSchema)                │
│     │   ├── FALLA → throw AppError("Datos inválidos", 400) │
│     │   └── OK → continúa                                  │
│     │                                                       │
│     └── Llama a ExpenseService.createExpense()              │
│         ├── Guarda en DB vía Repository                     │
│         │   └── CacheProxy → MySqlRepository                │
│         ├── Notifica al Observer                            │
│         │   ├── HighPriorityAlertObserver → 🚨 consola      │
│         │   └── WhatsAppObserver → 📱 WhatsApp              │
│         └── Devuelve el gasto creado                        │
│                                                             │
│  5. Response → { status: "success", data: { ... } }        │
│                                                             │
│  Si hay error en cualquier paso:                            │
│  → errorHandler → { status: "error", message: "..." }      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Capa 1 — Modelos (`models/`)

### ¿Para qué sirve?
Define la **forma exacta** de los datos que fluyen por la aplicación. Si un campo no existe en el modelo, TypeScript te avisará al compilar.

### `Expense.ts` — Modelo de Gasto

```
┌─────────────────────────────────────────────────────┐
│ IExpense (La ficha completa en la base de datos)    │
├─────────────────────────────────────────────────────┤
│ id            → Identificador único (UUID)          │
│ userId        → A qué usuario pertenece             │
│ title         → "Almuerzo de trabajo"               │
│ reason        → "Comida"                            │
│ date          → "2026-03-01T10:00:00Z"              │
│ amount        → 150.00                              │
│ type          → 'INCOME' | 'EXPENSE'                │
│ priorityLevel → 'LOW' | 'MEDIUM' | 'HIGH'          │
│ isRecurring   → true/false                          │
│ frequency     → 'DAILY' | 'WEEKLY' | ... | null     │
│ interval      → cada cuántas veces se repite        │
│ reminderDate  → Fecha de recordatorio o null        │
│ createdAt     → Cuándo se creó                      │
│ updatedAt     → Cuándo se editó por última vez      │
└─────────────────────────────────────────────────────┘
```

#### DTOs (Data Transfer Objects)

Los DTOs son "versiones recortadas" de la interfaz principal para momentos específicos:

| DTO | Campos | Uso |
|---|---|---|
| `CreateExpenseDTO` | title, reason, date, amount, type + opcionales | Se usa para **crear** un gasto. No incluye `id` ni `userId` porque el servidor los genera. |
| `UpdateExpenseDTO` | Todos opcionales (`Partial<CreateExpenseDTO>`) | Se usa para **editar**. Puede enviar solo `{ amount: 200 }` sin reescribir todo. |

### `User.ts` — Modelo de Usuario

```
┌─────────────────────────────────────────────────────┐
│ IUser (Completo en la base de datos)                │
├─────────────────────────────────────────────────────┤
│ id            → Identificador único                 │
│ name          → "Miguel"                            │
│ email         → "miguel@email.com"                  │
│ passwordHash  → "$2b$12$K..." (NUNCA la clave real) │
│ monthlyBudget → 5000 (presupuesto mensual)          │
│ createdAt / updatedAt                               │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ UserProfile = Omit<IUser, 'passwordHash'>            │
│ Es IUser SIN el hash de la contraseña.               │
│ Se usa para enviar datos al frontend de forma segura.│
└──────────────────────────────────────────────────────┘
```

#### DTOs de Autenticación

| DTO | Campos | Uso |
|---|---|---|
| `RegisterDTO` | name, email, **password** (la clave real) | Lo que envía el formulario de registro |
| `LoginDTO` | email, **password** | Lo que envía el formulario de login |
| `AuthResponse` | **user** (UserProfile) + **token** (JWT) | Lo que el servidor devuelve al frontend tras login/registro |

---

## ✅ Capa 2 — Validación (`schemas/`)

### ¿Para qué sirve?
Los modelos protegen al programador en compilación. Los schemas protegen al **servidor en ejecución** contra datos inválidos que vienen del exterior.

### Diferencia clave

| Característica | Models (Interfaces) | Schemas (Zod) |
|---|---|---|
| **Cuándo actúa** | Al escribir código (compilación) | Cuando la app está corriendo (runtime) |
| **Objetivo** | Ayudar al programador | Proteger al servidor |
| **Si falla** | El código no compila (rojo en VS Code) | La API responde 400 Bad Request |

### `authSchema.ts`

| Schema | Validaciones |
|---|---|
| `registerSchema` | Nombre: mín. 2 chars. Email: formato válido, pasa a minúsculas. Password: mín. 6 chars. |
| `loginSchema` | Email: formato válido. Password: no vacía. |
| `updateBudgetSchema` | Presupuesto: número positivo mayor a 0. |

### `expenseSchema.ts`

| Schema | Validaciones |
|---|---|
| `createExpenseSchema` | Título: 1-100 chars. Monto: positivo. Fecha: formato ISO válido. Tipo: solo 'INCOME' o 'EXPENSE'. |
| `updateExpenseSchema` | Usa `.partial()`: mismas reglas pero todos los campos opcionales. |
| `filterByMonthSchema` | Año: 2000-2100. Mes: 1-12. Usa `.coerce.number()` para convertir texto de URL a número. |

---

## 💾 Capa 3 — Repositorios (`repository/` + `data/`)

### ¿Para qué sirve?
Separar **QUÉ** se puede hacer con los datos de **CÓMO** se guardan realmente.

### Arquitectura del Repositorio

```
                        ┌─────────────────────────┐
                        │  IExpenseRepository      │ ← contrato (interface)
                        │  findAll()               │
                        │  create()                │
                        │  update()                │
                        │  delete()                │
                        └──────────┬──────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
          ┌─────────▼──────┐  ┌───▼──────────┐  ┌▼───────────────┐
          │ MySqlExpense   │  │ JsonExpense  │  │ CacheExpense   │
          │ Repository     │  │ Repository   │  │ Proxy          │
          │ (SQL real)     │  │ (archivo .json)│ │ (cache en RAM) │
          └────────────────┘  └──────────────┘  └────────────────┘
```

### ¿Por qué separar Interface de Implementación?

1. **Intercambiabilidad**: Si mañana quieres usar PostgreSQL, creas `PostgresExpenseRepository` y listo. El servicio ni se entera.
2. **Facilidad de Testing**: En los tests, puedes crear un repositorio "de mentira" (Mock) sin necesitar una base de datos real.
3. **Limpieza**: La lógica de negocio (Service) no se mezcla con queries SQL.

### MySQL vs JSON — Dos implementaciones, una misma interface

#### `MySqlExpenseRepository.ts`
- Se conecta a MySQL usando un pool de conexiones.
- Ejecuta queries SQL reales (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- Tiene una función `ensureTable()` que crea la tabla si no existe (auto-migración).
- Tiene una función `autoPriority()` que asigna prioridad automática según el monto:
  - `≥ 500` → HIGH
  - `≥ 100` → MEDIUM
  - `< 100` → LOW
- Usa `mapRow()` para convertir los nombres de columnas de MySQL (`snake_case`) a los nombres de TypeScript (`camelCase`).

#### `JsonExpenseRepository.ts`
- Lee y escribe en un archivo JSON local.
- No necesita MySQL instalado.
- Ideal para desarrollo rápido o demos.
- Implementa exactamente los mismos métodos que la versión MySQL.

#### ¿Quién decide cuál usar?
La **Factory** (`ExpenseRepositoryFactory.ts`), que lee la variable `DB_TYPE` del `.env`:
```
DB_TYPE=mysql  →  MySqlExpenseRepository
DB_TYPE=json   →  JsonExpenseRepository
```

---

## 🧠 Capa 4 — Servicios (`services/`)

### ¿Para qué sirve?
Es el **cerebro** de la aplicación. Contiene la lógica de negocio pura: qué hacer, cuándo hacerlo y qué reglas aplicar.

### `AuthService.ts` — Seguridad de Usuarios

| Método | Responsabilidad |
|---|---|
| `register()` | Verifica que el email no exista → Hashea la contraseña con bcrypt → Crea el usuario → Genera JWT |
| `login()` | Busca el usuario por email → Compara contraseña con hash → Genera JWT |
| `getProfile()` | Devuelve los datos del usuario SIN el passwordHash |
| `updateBudget()` | Actualiza el presupuesto mensual del usuario |
| `generateToken()` | Crea un JWT firmado con el secreto del servidor (dura 7 días por defecto) |
| `toProfile()` | Filtra el hash de la contraseña antes de enviar datos al frontend |

#### Flujo de seguridad

```
Frontend envía "Clave123"
       │
       ▼
AuthService.register()
       │
       ├── bcrypt.hash("Clave123", 12) → "$2b$12$K8..."
       │
       ├── userRepository.create(data, "$2b$12$K8...")
       │
       └── sign({ userId, email }, secret) → "eyJhbG..."
       │
       ▼
Frontend recibe { user: { name, email... }, token: "eyJhbG..." }
```

### `ExpenseService.ts` — Gestión de Gastos

| Método | Responsabilidad |
|---|---|
| `getAllExpenses()` | Trae todos los gastos de un usuario |
| `getExpensesByMonth()` | Filtra gastos por año y mes |
| `createExpense()` | Guarda el gasto + **notifica al Observer** (alertas) |
| `updateExpense()` | Edita un gasto o lanza NotFoundError |
| `deleteExpense()` | Elimina un gasto o lanza NotFoundError |

#### Punto clave: Aislamiento por usuario
Todos los métodos reciben `userId` como primer argumento. Un usuario **nunca** puede ver, editar o borrar los gastos de otro.

#### Punto clave: Notificación al Observer
```ts
async createExpense(userId, data) {
  const expense = await this.expenseRepository.create(userId, data);
  this.expenseSubject.notify(expense);  // ← Dispara alertas automáticamente
  return expense;
}
```

---

## 🎮 Capa 5 — Controladores (`controllers/`)

### ¿Para qué sirve?
Traduce las peticiones HTTP a llamadas al servicio. **No contiene lógica de negocio**, solo gestiona el tráfico.

### Patrón de cada método (siempre igual)

```
1. Extraer datos del Request    →  req.body, req.params, req.user
2. Validar con Zod              →  schema.safeParse()
3. Llamar al Service            →  this.service.método()
4. Responder con JSON           →  res.status(200).json({ status: 'success', data })
5. Si falla, delegar al error   →  catch (error) { next(error) }
```

### Endpoints disponibles

#### AuthController

| Método HTTP | URL | Protegido | Acción |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Registrar nuevo usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| GET | `/api/auth/me` | ✅ JWT | Ver perfil del usuario |
| PUT | `/api/auth/budget` | ✅ JWT | Actualizar presupuesto mensual |

#### ExpenseController

| Método HTTP | URL | Protegido | Acción |
|---|---|---|---|
| GET | `/api/expenses` | ✅ JWT | Listar todos los gastos |
| GET | `/api/expenses/month/:year/:month` | ✅ JWT | Filtrar gastos por mes |
| POST | `/api/expenses` | ✅ JWT | Crear un gasto nuevo |
| PUT | `/api/expenses/:id` | ✅ JWT | Editar un gasto |
| DELETE | `/api/expenses/:id` | ✅ JWT | Eliminar un gasto |

---

## 🛡️ Capa 6 — Middlewares (`middlewares/`)

### ¿Para qué sirve?
Son funciones que se ejecutan **entre** la petición del usuario y el controlador. Son los "guardaespaldas" de la aplicación.

### `authMiddleware.ts` — El portero 🔐

Verifica que toda petición protegida traiga un JWT válido. Su flujo:

```
1. Busca el header "Authorization: Bearer <token>"
2. Si no existe → Error 401: "Token requerido"
3. Si existe → Decodifica el token con jwt.verify()
   ├── Token válido → req.user = { userId, email } → next()
   └── Token expirado/falso → Error 401: "Token inválido"
```

#### Extensión global de TypeScript
```ts
declare global {
  namespace Express {
    interface Request { user?: JwtPayload; }
  }
}
```
Este bloque le dice a TypeScript que **todas** las peticiones de Express ahora pueden tener una propiedad `user`. Sin esto, `req.user.userId` daría error de compilación.

### `errorHandler.ts` — La red de seguridad 🥅

Es el **último** middleware que se registra. Captura cualquier error lanzado en toda la cadena:

```
¿Es un AppError? (error planeado por el programador)
├── SÍ → Responde con el statusCode y mensaje definidos
│       Ejemplo: { status: "error", statusCode: 404, message: "Gasto no encontrado" }
│
└── NO → Es un bug o error desconocido
        → Lo imprime en consola (para el programador)
        → Responde con un genérico 500: "Error interno del servidor"
          (para no exponer información del sistema al usuario)
```

---

## ❌ Capa 7 — Manejo de Errores (`errors/`)

### ¿Para qué sirve?
Define errores personalizados con códigos HTTP para que el `errorHandler` sepa exactamente qué responder.

### `AppError.ts` — Error base

```ts
export class AppError extends Error {
  public readonly statusCode: number;     // 400, 401, 404, 409...
  public readonly isOperational: boolean;  // true = error planeado, no un bug
}
```

Se usa así en cualquier parte del código:
```ts
throw new AppError('El correo ya está registrado', 409);
throw new AppError('Token inválido', 401);
throw new AppError('Datos inválidos', 400);
```

### `NotFoundError.ts` — Atajo para el 404

```ts
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404); // Siempre es 404
  }
}
```

Simplifica el código: en vez de escribir `new AppError('Gasto no encontrado', 404)`, usas `new NotFoundError('Gasto no encontrado')`.

---

## 🗺️ Capa 8 — Rutas (`routes/`)

### ¿Para qué sirve?
Es el **mapa** de la API. Conecta cada URL con el método del controlador correspondiente.

### `authRoutes.ts`

```ts
router.post('/register', controller.register);          // Abierta
router.post('/login', controller.login);                 // Abierta
router.get('/me', authMiddleware, controller.getProfile); // Protegida
router.put('/budget', authMiddleware, controller.updateBudget); // Protegida
```

Nota cómo `/register` y `/login` no tienen `authMiddleware` porque un usuario no puede tener un token **antes** de registrarse.

### `expenseRoutes.ts`

```ts
router.use(authMiddleware); // ← TODAS las rutas debajo están protegidas
router.get('/', controller.getAll);
router.get('/month/:year/:month', controller.getByMonth);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
```

El `router.use(authMiddleware)` al inicio es un atajo: en vez de poner el middleware en cada línea, se aplica a todas las rutas de ese router de una sola vez.

---

## 🧩 Patrones de Diseño (`patterns/`)

### ¿Por qué usar patrones?
Porque sin ellos, el código crece y se vuelve imposible de mantener. Los patrones resuelven problemas comunes de forma probada y estandarizada.

---

### 1. 🏭 Factory — `RepositoryFactory`

**Categoría:** Creacional
**Archivo:** `patterns/factory/RepositoryFactory.ts`

#### Problema que resuelve
Sin Factory, para cambiar de MySQL a JSON tendrías que buscar y editar cada lugar del código donde se instancia el repositorio.

#### Cómo funciona

```
.env: DB_TYPE=mysql
         │
         ▼
RepositoryFactory.createExpenseRepository()
         │
         ├── 'mysql' → new MySqlExpenseRepository()
         └── 'json'  → new JsonExpenseRepository()
```

#### ¿Cómo cambiar de base de datos?
Solo cambias **una línea** en el archivo `.env`:
```
DB_TYPE=json
```
El resto del código no se toca. Esto es el principio de **Inversión de Dependencias**.

---

### 2. 👁️ Observer — `ExpenseSubject` + Observers

**Categoría:** Comportamiento
**Archivos:** `patterns/observer/ExpenseSubject.ts`, `HighPriorityAlertObserver.ts`, `WhatsAppObserver.ts`

#### Problema que resuelve
Cuando se crea un gasto, quieres reaccionar a ese evento (alertar, notificar, auditar) **sin meter esa lógica dentro de ExpenseService**.

#### Cómo funciona internamente

```
ExpenseSubject
  observers = []          ← lista de observadores suscritos

  attach(observer)        → agrega a la lista
  detach(observer)        → quita de la lista
  notify(expense)         → recorre la lista y llama a update() en cada uno
```

#### Flujo real al crear un gasto HIGH

```
POST /api/expenses { title: "Laptop", amount: 5000, priorityLevel: "HIGH" }
         │
         ▼
ExpenseService.createExpense()
  ├── Guarda en DB ✅
  └── expenseSubject.notify(expense)
         │
         ├── HighPriorityAlertObserver.update()
         │   └── 🚨 "Gasto alto: Laptop | S/5000"
         │
         └── WhatsAppObserver.update()
             └── 📱 "WhatsApp enviado: Gasto alto → Laptop S/5000"
```

#### ¿Cómo agregar un nuevo canal de notificación?

Solo dos pasos:

**Paso 1:** Crear la clase del observer:
```ts
// patterns/observer/EmailObserver.ts
export class EmailObserver implements IExpenseObserver {
  update(expense: IExpense): void {
    if (expense.priorityLevel === 'HIGH') {
      // Enviar email al administrador
    }
  }
}
```

**Paso 2:** Registrarlo en `server.ts`:
```ts
expenseSubject.attach(new EmailObserver());
```

> ✅ `ExpenseService` **nunca se toca**. Solo agregas una clase y una línea.

---

### 3. 🛡️ Proxy — `CacheExpenseProxy`

**Categoría:** Estructural
**Archivo:** `patterns/proxy/CacheExpenseProxy.ts`

#### Problema que resuelve
Consultar la base de datos en cada petición es lento y caro. El Proxy intercepta las llamadas y devuelve resultados desde la memoria RAM si ya los tiene.

#### Cómo funciona internamente

```
ExpenseService llama a repo.findByMonth(userId, 2026, 3)
         │
         ▼
CacheExpenseProxy
  monthCache = Map {
    "user1-2026-3" → [...gastos de marzo]  ← datos en RAM
  }

  ┌─ ¿Existe "user1-2026-3" en cache?
  │
  ├── SÍ → devuelve directo desde RAM      ⚡ ~1ms
  └── NO → pregunta a MySQL → guarda en cache → devuelve   ~80ms
```

#### Invalidación del cache

Cuando el usuario **crea, edita o elimina** un gasto, el cache de ese usuario se borra para que la próxima consulta traiga datos frescos:

```ts
async create(userId, data) {
  const result = await this.baseRepository.create(userId, data);
  this.invalidateCache(userId); // ← borra el cache de este usuario
  return result;
}
```

#### Rendimiento

```
1ra petición:  GET /expenses/month/2026/3
  → cache MISS → MySQL → guarda en cache → ~80ms

2da petición:  GET /expenses/month/2026/3  (mismo usuario)
  → cache HIT  → RAM   → ~1ms  ⚡
```

> El `ExpenseService` **no sabe** que hay un cache. Para él siempre está hablando con un repositorio normal.

---

### 4. 🎯 Strategy — `ExpenseFilterContext`

**Categoría:** Comportamiento
**Archivos:** `patterns/strategy/ExpenseFilterContext.ts`, `FilterByMonthStrategy.ts`, `FilterByPriorityStrategy.ts`

#### Problema que resuelve
Necesitas filtrar gastos de distintas maneras. Sin Strategy, el controlador acumula un `if/else` gigante. Con Strategy, cada tipo de filtro es una clase separada e intercambiable.

#### Cómo funciona

```ts
// El contexto tiene una "ranura" donde se enchufa la estrategia activa
class ExpenseFilterContext {
  private strategy?: IExpenseFilterStrategy;

  setStrategy(strategy) { this.strategy = strategy; }

  filter(expenses) {
    if (!this.strategy) return expenses;       // sin filtro → todo
    return this.strategy.execute(expenses);    // con filtro → delega
  }
}
```

#### Estrategias disponibles

| Estrategia | Qué hace |
|---|---|
| `FilterByMonthStrategy(2026, 3)` | Solo gastos de marzo 2026 |
| `FilterByPriorityStrategy('HIGH')` | Solo gastos de alta prioridad |

#### ¿Cómo agregar "filtrar por categoría"?

```ts
export class FilterByCategoryStrategy implements IExpenseFilterStrategy {
  constructor(private category: string) {}
  execute(expenses: IExpense[]): IExpense[] {
    return expenses.filter(e => e.reason === this.category);
  }
}
```

Y en el controlador: `filterContext.setStrategy(new FilterByCategoryStrategy('Comida'))`.

> ✅ El controlador **no cambia**. Solo una nueva clase.

---

### Resumen de Patrones

| Patrón | Categoría | Sin él | Con él |
|---|---|---|---|
| **Factory** | Creacional | Cambiar DB = editar muchos archivos | Cambiar una línea en `.env` |
| **Observer** | Comportamiento | Meter alertas dentro del Service | Agregar un `attach()` y una clase nueva |
| **Proxy** | Estructural | Query a MySQL en cada petición | Respuesta desde RAM si ya existe |
| **Strategy** | Comportamiento | `if/else` gigante en el controlador | Una clase por filtro, intercambiable |

---

## 🔒 Seguridad y Autenticación

### Flujo de Autenticación JWT

```
┌──────────────────────────────────────────────────────────┐
│                    REGISTRO                               │
│                                                          │
│  1. Frontend envía: { name, email, password }            │
│  2. AuthService hashea password con bcrypt (12 rondas)   │
│  3. Guarda usuario con passwordHash en la DB             │
│  4. Genera JWT firmado con JWT_SECRET                    │
│  5. Devuelve: { user (sin hash), token }                 │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    LOGIN                                  │
│                                                          │
│  1. Frontend envía: { email, password }                  │
│  2. AuthService busca usuario por email                  │
│  3. bcrypt.compare(password, passwordHash)               │
│  4. Si coincide → Genera JWT → Devuelve token            │
│  5. Si no coincide → Error 401                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│               PETICIÓN PROTEGIDA                          │
│                                                          │
│  1. Frontend envía: Authorization: Bearer <token>        │
│  2. authMiddleware extrae el token                       │
│  3. jwt.verify(token, JWT_SECRET)                        │
│  4. Si válido → req.user = { userId, email } → next()   │
│  5. Si inválido → Error 401                              │
└──────────────────────────────────────────────────────────┘
```

### Medidas de seguridad implementadas

| Medida | Dónde | Qué protege |
|---|---|---|
| **bcrypt** con 12 rondas | Registro | Las contraseñas se guardan encriptadas, no en texto plano |
| **JWT firmado** | Login | El token es verificable pero no falsificable |
| **Token con expiración** | Login (7 días) | Si roban un token, deja de servir después de 7 días |
| **UserProfile (Omit)** | toProfile() | Nunca se envía el passwordHash al frontend |
| **Aislamiento por userId** | Todos los repositorios | Un usuario solo ve sus propios gastos |
| **Mensajes genéricos** | Login | Dice "Credenciales inválidas" (no "Email no encontrado") para no revelar qué emails existen |
| **Error 500 genérico** | errorHandler | Los errores de sistema nunca se exponen al usuario |

---

## 📊 Estructuras de Datos Utilizadas

### 1. `Map` — Cache del Proxy

```ts
private monthCache: Map<string, IExpense[]> = new Map();
```

El `CacheExpenseProxy` usa un `Map` de JavaScript para almacenar resultados de consultas en memoria RAM.

| Característica | Detalle |
|---|---|
| **Clave** | String compuesto: `"userId-año-mes"` (ej. `"abc123-2026-3"`) |
| **Valor** | Array de gastos (`IExpense[]`) |
| **Complejidad de búsqueda** | O(1) — acceso instantáneo |
| **Invalidación** | Al crear/editar/borrar un gasto, se eliminan todas las entradas del usuario |

### 2. `Array` — Observers del Subject

```ts
private observers: IExpenseObserver[] = [];
```

El `ExpenseSubject` mantiene un array simple de observers suscritos.

| Operación | Método | Complejidad |
|---|---|---|
| Suscribir | `attach()` → `push()` | O(1) |
| Desuscribir | `detach()` → `splice()` | O(n) |
| Notificar a todos | `notify()` → `forEach` | O(n) |

### 3. Pool de Conexiones — MySQL

```ts
this.pool = mysql.createPool({ connectionLimit: 10 });
```

El repositorio MySQL usa un **pool de conexiones** en vez de una conexión única. Esto permite hasta 10 consultas simultáneas sin que una bloquee a las otras.

---

## 🧪 Testing

### Estrategia de testing

Se utilizan **tests unitarios** con Jest. El principio es probar la lógica de negocio en **aislamiento total**, sin dependencias externas.

### Archivos de test

| Archivo | Qué prueba | Tests |
|---|---|---|
| `ExpenseService.test.ts` | Toda la lógica del servicio de gastos | 9 tests |
| `FilterByMonthStrategy.test.ts` | El filtrado por mes del patrón Strategy | 3 tests |

### Técnica: Mocks (Dobles de prueba)

En vez de usar MySQL real, creamos objetos "de mentira" con `jest.fn()`:

```ts
const mockRepository: jest.Mocked<IExpenseRepository> = {
  create: jest.fn(),    // No hace nada, pero registra si fue llamada
  delete: jest.fn(),
  // ...
};
```

### Patrón de cada test: AAA (Arrange, Act, Assert)

```ts
it('should persist and notify', async () => {
  // ARRANGE (Preparar): le decimos al mock qué devolver
  mockRepository.create.mockResolvedValue(mockExpense);

  // ACT (Ejecutar): llamamos al método real
  const result = await expenseService.createExpense('user-1', dto);

  // ASSERT (Verificar): revisamos que pasó lo esperado
  expect(mockRepository.create).toHaveBeenCalledWith('user-1', dto);
  expect(mockSubject.notify).toHaveBeenCalledWith(mockExpense);
});
```

### Ejecutar los tests

```bash
npm test
```

Resultado esperado:
```
PASS  src/services/__tests__/ExpenseService.test.ts
PASS  src/patterns/strategy/__tests__/FilterByMonthStrategy.test.ts

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Time:        0.302 s
```

---

## 🔧 Ensamblaje Final (`server.ts` + `index.ts`)

### `server.ts` — La fábrica de montaje

Este archivo es donde **todas las piezas se conectan**. Sigue un orden lógico:

```
1. Crear la app Express
2. Configurar middlewares globales (CORS, JSON parser)
3. Crear repositorios      → Factory decide MySQL o JSON
4. Envolver con cache      → CacheExpenseProxy
5. Crear observers         → HighPriorityAlertObserver + WhatsApp
6. Crear servicios         → les pasa repos + observer
7. Crear controladores     → les pasa services + filterContext
8. Registrar rutas         → las asocia al prefijo /api
9. Montar Swagger          → documentación en /api/docs
10. Poner errorHandler     → siempre al final
```

### `index.ts` — El botón de encendido

Solo hace 3 cosas:
1. Carga las variables de entorno (`.env`).
2. Llama a `createServer()` para obtener la app ensamblada.
3. Le dice al servidor que escuche en el puerto configurado.

```ts
dotenv.config();
const app = createServer();
app.listen(PORT, () => { ... });
```

---

## 🗺️ Mapa de Dependencias

```
index.ts
  └── server.ts
       │
       ├── RepositoryFactory  ───────────── → decide MySQL o JSON
       │       └── + CacheExpenseProxy      → envuelve con cache
       │
       ├── ExpenseSubject  ─────────────── → publica eventos
       │       ├── HighPriorityAlertObserver → reacciona a HIGH
       │       └── WhatsAppObserver          → notifica por WA
       │
       ├── ExpenseFilterContext  ────────── → portador de la estrategia activa
       │
       ├── AuthService  ←  userRepository
       ├── ExpenseService  ←  cachedRepo + subject
       │
       ├── AuthController  ←  authService
       ├── ExpenseController  ←  expenseService + filterContext
       │
       ├── authRoutes  ←  authController + authMiddleware
       ├── expenseRoutes  ←  expenseController + authMiddleware
       │
       └── errorHandler (siempre al final)
```

---

## 📝 Variables de Entorno

| Variable | Uso | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `DB_TYPE` | Tipo de base de datos (`mysql` / `json`) | `mysql` |
| `MYSQL_HOST` | Host de MySQL | `localhost` |
| `MYSQL_PORT` | Puerto de MySQL | `3306` |
| `MYSQL_USER` | Usuario de MySQL | `root` |
| `MYSQL_PASSWORD` | Contraseña de MySQL | `""` |
| `MYSQL_DATABASE` | Nombre de la base de datos | `gestion_gastos_db` |
| `JWT_SECRET` | Palabra secreta para firmar tokens | `default_secret` |
| `JWT_EXPIRES_IN` | Duración del token | `7d` |
| `NODE_ENV` | Entorno de ejecución | `development` |
