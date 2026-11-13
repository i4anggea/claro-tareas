# Claro · Administrador personal de tareas

Aplicación React + TypeScript en español, con diseño adaptable, modo oscuro y persistencia en el navegador. Permite crear, editar, completar, reabrir, eliminar y deshacer la última eliminación. Incluye búsqueda, filtros combinados, vistas de hoy/completadas, prioridades, proyectos, fechas y un resumen de progreso.

## Ejecutar localmente

Requisitos: Node.js >=22.12 (ESLint requiere >=22.13 en Node 22) y npm. Entorno comprobado: Node 26.5.0, npm 11.17.0, macOS y Google Chrome instalado.

```sh
npm ci --ignore-scripts
npm run dev
```

Abrir http://127.0.0.1:5173. La primera visita muestra seis tareas ficticias. No hay cuentas, claves, variables de entorno ni servicios externos. Los datos pertenecen al origen y navegador actual; cambiar de puerto/origen utiliza otro almacenamiento.

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
npm audit
npm run preview
# Con npm run dev activo en 5173:
node scripts/dev-smoke.mjs
```

`test:e2e` compila y arranca una vista previa local en el puerto 5173; necesita ese puerto libre y Chrome (`channel: chrome`). Ejecuta cuatro escenarios en escritorio (1440 × 1000) y móvil (390 × 844). Las capturas se guardan en `docs/evidence/`; las trazas de fallos, en `test-results/`. `preview` usa normalmente el puerto 4173. Ambos servidores escuchan exclusivamente en loopback.

## Estructura

```text
src/
  main.tsx                   Entrada de React y estilos
  App.tsx                    Estado, persistencia y composición de pantalla
  components/TaskForm.tsx    Formulario modal y errores accesibles
  components/Icon.tsx        Iconos SVG locales
  lib/tasks.ts               Contratos, validación, filtros, fechas y datos semilla
  styles.css                 Tokens, temas y puntos de adaptación
 tests/
  tasks.test.ts              Pruebas de dominio y lectura de datos no confiables
  app.spec.ts                Recorridos en Chrome, persistencia y fallos controlados
 docs/
  ARCHITECTURE.md            Requisitos, decisiones, seguridad y límites
  VERIFICATION.md            Comandos, resultados y restricciones de cobertura
```

## Datos y seguridad

Las tareas se guardan en `localStorage` bajo `claro.tasks.v1` al modificarlas. Las preferencias de tema se guardan bajo `claro.theme`; la primera visita respeta el tema del sistema. No se envían tareas a servidores. El almacenamiento local **no cifra ni protege datos confidenciales**: cualquier persona con acceso al navegador puede leerlos. No usar para secretos o información sensible.

Se validan los formularios y los datos recuperados (tipos, longitudes, fechas, estados, prioridades e IDs únicos). React renderiza las entradas como texto; no se usa HTML dinámico. Una CSP limita fuentes, scripts, conexiones y formularios; en desarrollo se permite el CSS inline requerido por HMR, mientras producción exige hojas de estilo del propio origen. No se cargan fuentes, imágenes ni scripts de terceros.

Si el almacenamiento falla, se muestra una alerta y se mantienen los cambios en memoria. Si los datos originales están corruptos, se preservan y no se sobrescriben. El usuario debe recuperar o respaldar ese contenido desde las herramientas del navegador antes de repararlo. Deshacer permite restaurar la última eliminación durante la sesión hasta cerrar el aviso o eliminar otra tarea.

Límites: hasta 5000 tareas, títulos de 100 caracteres, descripción de 1000, proyecto de 40. Sin sincronización entre dispositivos ni resolución de escrituras simultáneas entre pestañas; evitar editar en varias pestañas. No hay service worker ni garantía de apertura sin red; una página ya cargada funciona sin llamadas externas. No es un sistema multiusuario ni una aplicación con RBAC.

Esta versión de portafolio se publica con datos de demostración y sin servicios externos.
