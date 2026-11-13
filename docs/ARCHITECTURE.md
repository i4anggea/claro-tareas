# Requisitos y arquitectura

Fecha: 21 de octubre de 2026. Skill aplicada: autonomous-software-engineer, archivo local identificado como v1.3 borrador, con protocolos adicionales de evaluación. Alcance solicitado: una aplicación de tareas; no se ejecuta el piloto administrativo ni el benchmark de la skill.

## Requisitos y aceptación definidos antes de implementar

Usuario: una persona que organiza sus pendientes en un navegador. Se asume uso local y personal, sin identidad ni servidor. Las decisiones son reversibles y no requieren infraestructura externa.

- Crear y editar tareas con título obligatorio, descripción, prioridad, estado, proyecto y fecha opcional.
- Completar y reabrir; eliminar con posibilidad de deshacer la última eliminación.
- Buscar por título, descripción o proyecto, filtrar estado/prioridad, consultar hoy y completadas.
- Persistir tareas y tema entre recargas, detectar datos inválidos y fallos de cuota/permisos.
- Adaptar escritorio/móvil, ofrecer temas claro/oscuro, etiquetas, foco visible, navegación por teclado y mensajes de estado.
- Aprobar tipado, lint, formato, compilación, pruebas unitarias y recorridos en navegador; inspeccionar capturas en ambos temas/tamaños.

## Decisión técnica

SPA con React 19, TypeScript estricto y Vite 8. Las versiones efectivas y transitivas quedan congeladas en `package-lock.json`. Se verificó compatibilidad de Node con los metadatos de npm y la [documentación oficial de Vite](https://vite.dev/guide/). La entrada usa la API [createRoot de React](https://react.dev/reference/react-dom/client/createRoot).

Una SPA es proporcional a un espacio personal sin SEO, SSR ni rutas de servidor. Next.js y un backend/PostgreSQL añadirían despliegue, sesiones y mantenimiento sin un requisito actual que los justifique. Si se añade colaboración, se necesitarán API, validación/autorización en servidor, almacenamiento transaccional y migración explícita de datos locales.

La UI depende del módulo de tareas, que contiene contratos y reglas puras sin importar React. App coordina estado y almacenamiento; TaskForm administra el borrador y muestra errores. No hay contenedor de dependencias, router ni store global porque existe una sola pantalla. La persistencia se mantiene en App por su tamaño; puede extraerse a un adaptador si se añade otro repositorio de datos.

## Sistema visual

Paleta neutral con acento violeta; colores semánticos para prioridad y estado. Tokens CSS para superficie, texto, bordes y temas. Tipografía del sistema sin solicitudes externas. Navegación lateral en escritorio, compacta en tablet y superior en móvil; lista en columnas que cambia a tarjetas móviles. Breakpoints de 1200, 850 y 600 px. Movimiento reducido con `prefers-reduced-motion`. Dialog nativo para retener foco; Escape cierra y devuelve foco a Nueva tarea. No se afirma certificación WCAG.

## Seguridad y fronteras de confianza

Entrada del usuario y localStorage son datos no confiables. La decodificación crea objetos con campos permitidos, rechaza duplicados, campos incorrectos y cargas excesivas. La validación limita tamaños y fechas reales. React escapa texto; no hay `dangerouslySetInnerHTML`, evaluaciones dinámicas, enlaces del usuario ni solicitudes externas.

La CSP de producción impide scripts inline, objetos y bases externas, y el envío nativo de formularios; permite solamente recursos del origen y el WebSocket loopback de desarrollo. La excepción `unsafe-inline` para estilos se aplica solo por Vite durante desarrollo. Para un futuro hosting habría que establecer CSP como cabecera, añadir `frame-ancestors`, HTTPS y cabeceras adecuadas; no se configuró ni se publicó hosting.

No se implementan autenticación, RBAC o sesiones porque no existe identidad ni backend. localStorage no es una frontera de autorización ni una bóveda. Las pruebas de manipulación de contenido no sustituyen autorización en servidor para una futura versión multiusuario.

## Dependencias

Producción: React y React DOM (MIT). Desarrollo: TypeScript para tipado, Vite para desarrollo/build, ESLint + typescript-eslint + reglas de hooks para análisis, Prettier para formato, Vitest para reglas y Playwright para pruebas reales. Se eligieron herramientas mantenidas con versiones compatibles según metadatos disponibles de npm; no se ejecutaron sus scripts de instalación (`--ignore-scripts`). Sin librerías de estilos, componentes, formularios, fechas o iconos para reducir peso y superficie de dependencia. `npm audit` es una consulta de avisos conocidos, no una garantía de ausencia de vulnerabilidades.
