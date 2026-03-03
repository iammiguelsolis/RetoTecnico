# Frontend - Gestión de Gastos Personales

Aplicación web construida con **React + TypeScript + Vite**.

---

## 🤖 Documentación de Uso de IA Generativa

Durante el desarrollo del frontend, se utilizó una herramienta de IA Generativa (LLM/Copilot) para acelerar la creación de la interfaz de usuario. A continuación se documentan los tres prompts principales utilizados de forma secuencial:

---

### Prompt 1: Pantalla Principal (Landing Page)

**Prompt utilizado:**
> "Crea una Landing Page moderna en React con TypeScript para una aplicación de gestión de gastos personales. Debe incluir una barra de navegación, una sección hero con llamada a la acción, una sección que explique las funcionalidades principales (CRUD de gastos, filtros por mes, dashboard de resumen) y un footer. Usa un diseño oscuro con colores morados y azules, aplica Vanilla CSS con variables CSS para el sistema de diseño y asegúrate de que sea responsiva."

**Cómo se aplicó:**
La IA generó la estructura base del componente `LandingPage.tsx` y su hoja de estilos `LandingPage.css`. Se ajustaron los textos, la paleta de colores exacta, y se refinó el espaciado y las animaciones de transición para lograr un diseño más pulido y alineado con la identidad visual de la aplicación.

**Archivos generados/modificados:**
- `src/modules/landing/LandingPage.tsx`
- `src/modules/landing/LandingPage.css`

---

### Prompt 2: Módulo de Autenticación (Login y Registro)

**Prompt utilizado:**
> "Crea un módulo de autenticación en React + TypeScript que incluya dos páginas: LoginPage y RegisterPage. Cada página debe tener un formulario centrado en la pantalla con validación básica de campos (email, contraseña, nombre). Los formularios deben conectarse a un endpoint REST de Express usando fetch, manejar el token JWT recibido guardándolo en localStorage, y redirigir al usuario al Dashboard si la autenticación es exitosa. Incluye manejo de errores visible para el usuario. El estilo debe ser coherente con un diseño oscuro moderno."

**Cómo se aplicó:**
La IA generó las páginas `LoginPage.tsx` y `RegisterPage.tsx` con la lógica de formulario y la llamada a la API. Se ajustó la URL del endpoint para apuntar al backend local, se creó el `AuthContext` para mantener el estado de sesión global, y se refinó el manejo de errores para mostrar mensajes específicos retornados por la API de validación (Zod).

**Archivos generados/modificados:**
- `src/modules/auth/pages/LoginPage.tsx`
- `src/modules/auth/pages/RegisterPage.tsx`
- `src/modules/auth/context/AuthContext.tsx`
- `src/modules/auth/index.ts`

---

### Prompt 3: Dashboard y Módulo de Gastos

**Prompt utilizado:**
> "Crea un Dashboard principal en React que muestre un resumen financiero del usuario con tarjetas de estadísticas (total gastado, presupuesto mensual, gastos de alta prioridad). Incluye también un módulo completo de gestión de gastos (CRUD) con: una lista de gastos filtrable por mes, un formulario modal para crear/editar un gasto (con campos: título, motivo, monto, fecha, tipo, prioridad), y confirmación para eliminar. Aplica el patrón Atomic Design para organizar los componentes (atoms, molecules, organisms, templates). Conecta todo con el backend REST usando JWT para autenticación."

**Cómo se aplicó:**
La IA generó la estructura de carpetas siguiendo Atomic Design dentro de `src/modules/gastos/components/` y creó los componentes base. Se realizaron ajustes manuales significativos: se integró el contexto de autenticación para adjuntar el token en cada petición, se conectaron los endpoints reales del backend, y se ajustó la lógica del filtro de mes para que coincidiera con el formato de datos retornado por la API.

**Archivos generados/modificados:**
- `src/modules/dashboard/pages/DashboardPage.tsx`
- `src/modules/gastos/pages/` (ExpensesPage, CreateExpensePage, EditExpensePage)
- `src/modules/gastos/components/atoms/` (ExpenseBadge)
- `src/modules/gastos/components/molecules/` (ExpenseCard, MonthFilter, ExpenseFormFields, StatCard)
- `src/modules/gastos/components/organisms/` (ExpenseList, ExpenseForm, ConfirmDeleteModal, etc.)
- `src/modules/gastos/components/templates/` (ExpenseListTemplate)

---

## 🚀 Cómo ejecutar el Frontend

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

> **Nota:** Requiere que el backend esté corriendo en `http://localhost:3000`.
