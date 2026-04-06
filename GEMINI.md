# ESTÁNDAR DE DESARROLLO FRONTEND (FILOSOFÍA YII2)

Este documento define las normas estrictas de arquitectura, estilo y comportamiento para el desarrollo frontend en este proyecto. Se basa en una adaptación de la filosofía de Yii2, priorizando la separación de responsabilidades, la legibilidad y la robustez del código.

---

## 1. ARQUITECTURA DE CAPAS

Toda funcionalidad debe dividirse en cuatro capas conceptuales para asegurar el desacoplamiento:

1.  **Component (Lógica Reutilizable):** Funciones JS puras, utilitarios y lógica de negocio genérica independiente de la UI.
2.  **Controller (Orquestador JS):** Scripts JS que gestionan el ciclo de vida de la página, inicializan componentes y coordinan la comunicación entre la UI y los servicios.
3.  **JavaScript (UI + Fetch + Validaciones):** Manejo de eventos del DOM, validaciones de entrada de usuario y peticiones al servidor.
4.  **Vista (HTML + CSS):** Estructura semántica y definición visual. La lógica de control está estrictamente prohibida aquí.

---

## 2. ESTRUCTURA DE ARCHIVOS

La organización debe ser **orientada a entidades** dentro del directorio base:

```text

├── js/
│   ├── {entity}Controller.js
│   └── {entity}Actions.js
├── css/
│   └── {entity}Style.css
├── html/
│   └── {entity}View.css
├── index.html (o fragmentos de vista)

```

---

## 3. CONVENCIONES DE NAMING

| Tecnología | Convención | Ejemplo |
| :--- | :--- | :--- |
| **JavaScript** | `camelCase` | `getUserData`, `isValidationValid` |
| **CSS (Clases/Vars)** | `kebab-case` | `.main-container`, `--primary-color` |
| **HTML (IDs/Names)** | `snake_case` | `user_id`, `btn_save_trip` |
| **Archivos** | `PascalCase` o `kebab-case` | `TripController.js` |

---

## 4. HTML SEMÁNTICO Y LIMPIO

*   **DEBE** usar etiquetas semánticas (`<main>`, `<section>`, `<article>`, `<nav>`).
*   **DEBE** usar `snake_case` para atributos `id` y `name`.
*   **NO DEBE** contener lógica de negocio ni eventos inline (`onclick="..."`).
*   **NO DEBE** usar estilos inline (`style="..."`).
*   **Inputs:** Deben estar correctamente tipados (`type="number"`, `type="email"`, etc.) y asociados a un `<label>`.

---

## 5. CSS MODULAR Y FRAMEWORKS

*   **DEBE** utilizar **Bootstrap (última versión)** para el sistema de rejilla (grid) y componentes base.
*   **DEBE** utilizar selectores de clase. Evitar el uso de IDs para estilos.
*   **DEBE** seguir una estructura modular por entidad para estilos personalizados.
*   **DEBE** usar variables CSS para valores repetitivos (colores, espaciados).
*   **NO DEBE** usar `!important` a menos que sea estrictamente necesario para overrides de librerías externas.

---

## 6. JAVASCRIPT: NÚCLEO Y COMPORTAMIENTO

### 6.1. Fail Fast y Early Return
El código debe validar condiciones negativas primero para evitar anidamientos innecesarios.

```javascript
// CORRECTO
function processData(data) {
    if (!data) return;
    if (data.status !== 'active') return;

    // Lógica principal
}

// INCORRECTO
function processData(data) {
    if (data) {
        if (data.status === 'active') {
            // Lógica principal
        }
    }
}
```

### 6.2. Validaciones Centralizadas
Toda validación debe ocurrir **ANTES** de cualquier petición fetch.

*   **DEBE** existir una función central de validación (ej. `validateRequiredFields`).
*   **DEBE** proporcionar feedback visual inmediato al usuario.

---

## 7. MANEJO DE PETICIONES (FETCH)

Todas las peticiones deben realizarse a través de un wrapper estandarizado (ej. `requestFetch`) para manejar cabeceras, tokens y errores de forma global.

### 7.1. Estándar de Respuesta
El frontend espera siempre el siguiente formato de objeto desde el backend:

```javascript
{
    "code": 0, // 0 para éxito, 1 para error
    "message": "Descripción del resultado",
    "data": {} // Información devuelta
}
```

### 7.2. Implementación de Fetch
```javascript
async function saveData(payload) {
    if (!validateFields(payload)) return; // Fail Fast

    try {
        const response = await requestFetch('/api/save', 'POST', payload);
        if (response.code !== 0) {
            showError(response.message);
            return;
        }
        showSuccess(response.message);
    } catch (error) {
        console.error("Critical Error:", error);
    }
}
```

---

## 8. GENERACIÓN DE HTML DESDE JS

*   **DEBE** usar *Template Literals* para mayor legibilidad.
*   **DEBE** mantener los templates limpios de lógica compleja.
*   **DEBE** escapar datos sensibles para prevenir ataques XSS.

---

## 9. REGLAS DE ORO (STRICT RULES)

1.  **❌ PROHIBIDO:** Mezclar responsabilidades (ej. hacer un fetch directamente en un event listener sin pasar por el controlador).
2.  **❌ PROHIBIDO:** Dejar validaciones solo del lado del servidor.
3.  **❌ PROHIBIDO:** Usar variables globales. Encapsular en módulos o clases.
4.  **❌ PROHIBIDO:** Realizar cualquier operación de **Git** (commit, push, staging, etc.). El usuario gestionará el control de versiones manualmente.
5.  **✔ OBLIGATORIO:** Comentar el "por qué" de lógicas complejas, no el "qué".
6.  **✔ OBLIGATORIO:** Mantener consistencia total con el naming de la base de datos y el backend.
