# OjoAlFraude — Contexto del Proyecto

## 🎯 Descripción General

**OjoAlFraude** es una plataforma web gamificada de detección de fraudes digitales dirigida a adultos mayores en Perú. Basada en Self-Determination Theory (Ryan & Deci 2020), enfatiza la **competencia** como driver de motivación intrínseca. El estudio mide el cambio de concientización antes/después de la intervención mediante un diseño pre-test / post-test.

- **Tesis**: Universidad de Lima, Ingeniería de Sistemas
- **Autor / propietario**: Mauricio Cuentas (mauriciocuentas0@gmail.com)
- **Colaborador**: Jean Pier Barbieri (jean.barbieri1996@gmail.com)
- **Hosting**: Firebase (proyecto `ojoalfraude-2c2a7`)
- **URL en vivo**: https://ojoalfraude-2c2a7.web.app
- **Git**: branch `master` es el principal

---

## 📊 Estado Actual (2026-10-01)

### ✅ Completado y en producción

**Flujo del participante**
- Autenticación Firebase (email/password, persistencia de sesión)
- Pantalla de bienvenida con **historial de sesiones previas** del usuario
- **Pre-test**: 10 preguntas (Formulario A)
- **3 niveles × 3 escenarios** aleatorios (WhatsApp/Email, SMS, Redes Sociales)
- **Post-test**: 10 preguntas (Formulario B — preguntas distintas al A, emparejadas por constructo)
- **Encuesta KAB** (concientización, 3 ítems Likert 1–5) en un **modal** que abre desde "Continuar" en la pantalla de progreso
- Pantalla de resultados/progreso (comparación pre vs post) y pantalla final
- **Winstreak**: bono en racha ≥2 aciertos consecutivos
- **Timer**: registra segundos por pregunta en cada escenario (`tiempoSegundos` en el historial)

**Diseño visual y responsive**
- **Tema claro (crema)** en toda la app: variables en `:root` de `styles.css` (`--bg`, `--surface`, `--text`, …). El ámbar como *texto* usa `--accent-ink` (más oscuro) para tener contraste; el ámbar vivo `--accent` queda para fondos y bordes. Pensado para legibilidad de adultos mayores.
- Los **simuladores de mensajes** (WhatsApp, SMS, email, Facebook) mantienen su look oscuro real, con colores de texto explícitos (no heredan del tema).
- **Pre/post-test como carrusel** (una pregunta a la vez, avance manual con Anterior/Siguiente) tanto en **celular como en desktop**. En celular el tamaño se adapta al **alto** de la pantalla para que pregunta + 4 opciones + botones entren sin scroll (verificado con capturas de Chrome en más de una docena de tamaños, desde 320×568 hasta 740×1000, y en horizontal). Con poco alto se oculta el subtítulo y luego la cabecera del búho.
- Escenarios en **2 columnas** en desktop (mensaje simulado | pregunta + opciones).
- Pantallas de progreso, SUS/KAB y final reorganizadas para desktop.

**Contenido de escenarios**
- 27 escenarios en el pool (`escenarios-full.js`), 9 por nivel
- **`consecuencias_mal` personalizadas por cada opción incorrecta** (no un único texto genérico)
- Opciones reescritas para que la respuesta correcta **no se auto-delate** (evita "Es un fraude…" y explicaciones que revelan la respuesta) — mejora la validez de la medición pre/post
- **Alternativas de colores con número**: cada opción es una barra de color (1 azul, 2 morado, 3 naranja, 4 turquesa) con el número en un **círculo blanco** a la izquierda y relieve de botón. Los números (en vez de formas) permiten nombrar la opción ("marca la 2") y evitan parecerse a Kahoot. Paleta **sin rojo ni verde** a propósito: esos colores quedan reservados para el resultado. Al responder, las demás opciones se apagan y la elegida se vuelve verde (✓) o roja (✗). Solo aplica a los **escenarios**; el pre/post-test conserva sus opciones sobrias.
- Al fallar **NO se revela** la respuesta correcta. Si el usuario responde entrando al enlace fraudulento no se marca ninguna opción (no eligió ninguna).
- 15 páginas falsas de phishing (badges + tooltips); se removió la palabra "educativa" del texto visible

**Personaje: búho "Ojito"** (acompañante del juego)
- Búho marrón con chaleco azul y escudo-candado, lupa de detective. 12 imágenes PNG con fondo transparente en `src/public/img/buho1.png … buho12.png`.
- **Mapa de imágenes por pantalla:**

| Momento | Imagen |
|---|---|
| Login | `buho1` (detective con lupa) |
| Bienvenida | `buho5` (alas abiertas, feliz) |
| Intro de cada nivel | `buho3` (investigando) |
| Escenario (junto a la nube de texto) | `buho2` (con celular) |
| Feedback correcto / incorrecto | `buho7` (pulgar arriba) / `buho4` (serio) |
| Entró a enlace fraudulento | `buho12` ("¡Alerta! Puede ser un fraude.") |
| Pre-test y post-test | `buho6` (asomándose) — **idéntico en ambos**, sin texto |
| Resultados del juego | `buho8` ("Antes de hacer clic, ¡piensa!") |
| Pantalla final | `buho10` ("Juntos por un internet más seguro.") |
| *Sin usar* | `buho9`, `buho11` |

- **Nube de diálogo con narración** en cada escenario: el búho "lee" el reto en **primera persona** ("Mira, te llegó un WhatsApp… Leámoslo juntos"). Texto en el campo `narracion` de cada escenario (27, sin pistas sobre si es fraude). Se sincroniza a Firestore con el botón **"🦉 Sincronizar narración del búho"**.
- **Ícono**: `src/public/buho-icon.svg` (cara de búho con gorra y escudo, dibujada en SVG). Se usa de **favicon**, en la **pantalla de carga** y en el **header** de las pantallas con topbar.
- Los PNG originales (con fondo crema) están en `img/` en la raíz; los de `src/public/img/` son los procesados (fondo removido y recortado).

**Panel de administrador**
- Lista de participantes con **buscador por nombre** y layout desktop
- **Detalle de participante**: sesiones con puntajes coloreados, mejora pre→post, badge ⭐ mejor sesión, tiempo total
- **Pantalla dedicada de detalle de sesión**: comparación pre/post lado a lado por constructo, juego agrupado por nivel (con tiempos), respuestas KAB
- **Eliminar participante** (borra perfil + todas sus sesiones)
- **Tasas de éxito**: por sesión, por participante y general
- **Vista 2 — Resumen estadístico** (botón "📊 Estadísticas"): ver sección dedicada abajo
- Gestión de escenarios/preguntas + botones de sincronización a Firestore

### 🟡 Ítem histórico aún abierto (UX de páginas falsas)
- Al clickear un link fraudulento se registra como respuesta incorrecta y se abre la página falsa en otra pestaña. Sigue pendiente refinar el feedback cuando el usuario **cierra la pestaña y vuelve** al escenario.

---

## 🧪 Vista 2 — Resumen Estadístico (para la tesis)

Accesible desde el topbar del admin ("📊 Estadísticas"). Calcula automáticamente sobre **la primera sesión de cada participante** (menor timestamp).

- **Estadística descriptiva**: N, media O₁ (pre), media O₂ (post), media Δ = O₂−O₁, DE(Δ), mín/máx Δ, distribución de Δ (mejoraron / igual / bajaron), media del puntaje del juego
- **Prueba t de Student para muestras relacionadas** (una cola, H₁: μO₂ > μO₁):
  - `t = media(Δ) / (DE(Δ) / √N)`, gl = N−1
  - valor p vía **función beta incompleta regularizada** (fracción continua, Abramowitz & Stegun) — implementado en `src/js/stats.js`
  - conclusión automática vs α = 0.05
- **Encuesta KAB**: media por ítem (A1/A2/A3) con etiqueta Likert, distribución de frecuencias por ítem, media global
- **Exportar CSV**: una fila por participante con `nombre, fecha, O1, O2, delta, puntaje_juego, KAB_A1, KAB_A2, KAB_A3, KAB_media`

> Nota: el test es de **una cola** por ser H₁ direccional. El valor de dos colas ya se calcula internamente (`pTwo` en `pairedTTest`) por si el comité lo pide.

---

## 🏗️ Arquitectura Técnica

### Stack
```
Frontend: Vanilla JS + ES modules
Bundler:  Vite (dev: npm run dev, build: npm run build)
Backend:  Firebase (Auth + Firestore)
Hosting:  Firebase Hosting
Deploy:   npm run deploy  → vite build && firebase deploy --only hosting,firestore
```

### Rutas Principales
```
raíz/
├── firebase.json           # Config hosting + firestore rules
├── firestore.rules         # Reglas de seguridad por rol (admin vs usuario)
└── src/
    ├── index.html          # Única página HTML con todas las pantallas (#p-login, #p-admin, #p-admin-stats, …)
    ├── styles.css          # Estilos globales
    ├── js/
    │   ├── main.js             # Entry point, observer de auth, expone funciones globales al window
    │   ├── state.js            # STATE + goTo(id) (dispara evento 'screen-change')
    │   ├── auth-ui.js          # Login / Registro (maneja re-registro de perfil eliminado)
    │   ├── content-loader.js   # Carga y selección aleatoria de escenarios/preguntas por sesión
    │   ├── nivel.js            # Motor del juego (renderEscenario, responderEscenario, clicoEnlaceFraude, opciones de colores)
    │   ├── buho.js             # Búho: buhoImg(), buildBuho(texto) (nube de diálogo), buhoSVG() (SVG dibujado a mano, ya sin uso en pantalla)
    │   ├── test.js            # Pre/Post-test (carrusel de una pregunta a la vez, celular y desktop)
    │   ├── sus.js             # Encuesta KAB (modal) — guarda campo `kab` en Firestore
    │   ├── results.js         # Comparación pre/post + pantalla final
    │   ├── admin-ui.js        # Panel admin completo (participantes, sesiones, escenarios, preguntas, Vista 2)
    │   ├── stats.js           # Funciones estadísticas puras (media, DE, prueba t, beta incompleta)
    │   ├── export.js          # Reiniciar juego / exportar
    │   └── mensaje-renderer.js # Render de mensajes dinámicos (WhatsApp/SMS/email/facebook)
    ├── firebase/
    │   ├── config.js          # Init Firebase con env vars
    │   ├── auth.js            # loginWithEmail, registerWithEmail, onAuthChange, …
    │   └── db.js              # Queries Firestore + sync* + migrarSusAKab + getAllSessions + deleteParticipante
    ├── data/
    │   ├── escenarios.js          # 9 escenarios fallback local
    │   ├── escenarios-full.js     # 27 escenarios pool (con linkUrl, consecuencias_mal por opción y narracion del búho)
    │   ├── test-questions-a.js    # 10 preguntas — Formulario A (pre-test)
    │   ├── test-questions-b.js    # 10 preguntas — Formulario B (post-test)
    │   ├── test-questions-full.js # pool legacy
    │   ├── test-questions.js      # legacy
    │   └── nivel-config.js        # Config de niveles + KAB (SUS_PREGUNTAS = 3 ítems, LIKERT_LABELS)
    └── public/                 # Se publica tal cual en Hosting (no poner páginas de prueba aquí)
        ├── buho-icon.svg       # Favicon + pantalla de carga + header
        ├── img/                # buho1.png … buho12.png (transparentes)
        └── fake/               # 15 páginas falsas + fake.css + fake.js
```

> `img/` en la **raíz** guarda los PNG originales del búho (con fondo crema). Las páginas de prueba o borradores se pueden poner en `src/` (fuera de `public/`): el servidor de desarrollo las sirve pero **no entran al build**.

### Firestore Collections
```
/users/{uid}
    nombre, edad, genero, email, role, sessionCount, creadoEn, …
    (role === 'admin' habilita el panel; los demás son participantes)

/sessions/{docId}
    userId, sessionNumber, completadoEn,
    participante,
    pretest:  { respuestas: {q0..q9}, score },   // O₁ (0–10)
    posttest: { respuestas: {q0..q9}, score },   // O₂ (0–10)
    juego:    { puntaje_total, puntaje_por_nivel, historial[], max_winstreak, … },
    kab:      { respuestas: {q0,q1,q2} }          // Likert 1–5 (antes se llamaba `sus`)

/scenarios/   (contenido del juego, importado/seedeado desde admin)
    nivel, idx, titulo, mensaje, pregunta, opciones, correcta,
    consecuencia_ok, consecuencias_mal{ índice → texto }, narracion, linkUrl, …
/questions/   (contenido del juego)
```

> **Campo KAB**: antes se guardaba como `sus`. Se renombró a `kab` y se migraron los documentos existentes (`migrarSusAKab()` en db.js, disparable desde el admin). El código lee `kab ?? sus` por compatibilidad.

### Reglas de Firestore (`firestore.rules`)
- Usuario: lee/escribe **solo su propio** perfil; crea/lee **solo sus propias** sesiones.
- Admin (`role == 'admin'`): lee/escribe/borra todo; puede `update` sesiones (necesario para migración).
- `scenarios` / `questions`: lectura para autenticados, escritura solo admin.

---

## 🎓 Decisiones de Diseño (No cambiar sin consultar)

1. **Perfil persistente entre sesiones** (Opción B): no se re-piden datos. Excepción: si un admin elimina a un participante y este vuelve a loguearse, se le pide **completar su perfil** de nuevo (su cuenta de Auth sigue existiendo; el email queda pre-llenado y bloqueado, sin pedir contraseña).
2. **Winstreak = Competencia (SDT)**: bono en racha ≥2 aciertos. No cambiar puntajes sin justificación pedagógica.
3. **Opciones correctas neutrales**: la respuesta correcta describe una acción, **nunca** se auto-identifica como "fraude/estafa" ni explica su razonamiento (protege la validez del pre-test). Mantener este criterio al agregar/editar escenarios.
4. **Clickear link = respuesta incorrecta automática** (realismo + impacto). Al fallar no se revela la correcta.
5. **15 empresas, 1 página por empresa** (BCP/BBVA/Interbank reutilizan con `?u=dominio`). Seguir el patrón existente si se agregan.
6. **Análisis estadístico usa la primera sesión** de cada participante.
7. **El búho no da consejos en el pre/post-test.** Las frases educativas ("Antes de hacer clic, ¡piensa!", etc.) enseñarían justo antes de medir y contaminarían O₁. En ambos tests va el mismo búho neutral (`buho6`, sin texto) para no introducir diferencias entre pre y post. Las narraciones del búho en los escenarios **no revelan** si el mensaje es fraude.
8. **Verde y rojo reservados para el resultado.** Las alternativas de los escenarios usan una paleta sin rojo/verde (azul, morado, naranja, turquesa); solo la opción elegida se vuelve verde o roja.
9. **Texto de acento sobre fondo claro → `--accent-ink`**, no `--accent` (el ámbar vivo se pierde sobre crema). Los simuladores de mensajes siempre llevan colores explícitos (son oscuros por diseño).
10. **Alternativas apiladas, con número en círculo blanco.** Se probaron y descartaron: la grilla 2×2 estilo Kahoot, las formas ▲◆●■ (muy parecidas a Kahoot) y otros estilos de número (ficha con relieve, franja lateral, numeral grande).
11. **Popup de feedback en una sola columna** (búho, puntos y veredicto arriba; explicación debajo). Se probó una versión en dos columnas para escritorio (búho y puntos a la izquierda, explicación a la derecha) y se **revirtió** por decisión del equipo.

---

## 🔧 Flujos internos clave

- **Router**: `goTo(id)` en `state.js` activa la pantalla y dispara `screen-change`. `main.js` escucha ese evento para recargar el historial al entrar a `p-bienvenida` (siempre actualizado tras jugar).
- **Contenido por sesión**: `content-loader.js` intenta cargar escenarios/preguntas de Firestore; si no hay, cae a los archivos locales (`escenarios-full.js`, forms A/B).
- **Guardado de sesión**: `finalizarSUS()` en `sus.js` arma el documento y lo guarda vía `saveSession()`.
- **Sincronización de contenido** (admin → Escenarios): 4 botones — enlaces de páginas falsas, consecuencias (`consecuencias_mal`), opciones y respuestas (`opciones` + `consecuencia_ok`), y narración del búho (`narracion`). Necesarios porque editar `escenarios-full.js` **no** actualiza los documentos ya guardados en Firestore (empareja por `nivel` + `idx`). Tras cambiar texto de escenarios: desplegar y luego pulsar el botón que corresponda.
- **Búho en el feedback**: `mostrarFeedback()` elige la imagen (acierto/error/enlace fraudulento) con la marca `STATE.fraudeLink`, que `clicoEnlaceFraude()` activa antes de registrar la respuesta.

---

## 🚀 Setup y Deploy

```bash
npm install
npm run dev      # http://localhost:5173  (requiere Node 20+/22; el proyecto usa Node 22 vía nvm)
npm run build
npm run deploy   # build + deploy hosting y firestore rules (requiere firebase login)
```

- **Variables de entorno**: `.env.local` (raíz, NO trackeado) con credenciales de Firebase.
- **Firebase CLI**: `firebase login`. Para deploy, el colaborador debe estar agregado al proyecto `ojoalfraude-2c2a7`.
- **Node**: Vite requiere Node 20.19+/22.12+. Con nvm: `nvm use 22`.

---

## 📝 Próximos pasos sugeridos

1. **Testing con usuarios reales** (adultos mayores) y recolección de datos para el análisis de la Vista 2.
2. Refinar el feedback de la **UX de páginas falsas** al volver de la pestaña.
3. Validar con el comité los supuestos estadísticos (una vs dos colas, tamaño muestral).
4. Pendiente menor: ajuste fino de la **cabecera del pre/post-test en celular** (posición del título respecto al búho).
5. Decidir dónde usar `buho9` ("Los estafadores también se hacen pasar por amigos") y `buho11` ("Más conciencia, menos fraudes"), que aún no tienen pantalla.

## ⚠️ Gotchas

- En un iPhone SE con Safari (≈550px de alto útil), las preguntas del test **más largas** pueden dejar los botones apenas bajo el borde; las de largo normal entran.
- El favicon se cachea fuerte: al cambiarlo, recargar con Cmd+Shift+R.
- `main.js` aún importa `buhoSVG` sin usarlo (import muerto, inofensivo).
- **Caché de Hosting:** `index.html` se sirve con `cache-control: max-age=3600`. Justo después de desplegar, un `curl` o un navegador pueden seguir viendo el `index.html` anterior (que apunta a los `assets/index-*.js/css` viejos). Para verificar un despliegue, comprobar que el `index.html` en vivo (con un parámetro `?v=<timestamp>`) apunta a los mismos assets que `dist/index.html`.
- **Cambios de texto en escenarios:** editar `escenarios-full.js` y desplegar **no basta**; hay que pulsar el botón de sincronización que corresponda en el admin (ver "Flujos internos clave").

---

## 🗓️ Historial de cambios

**2026-06 → 2026-09 · Base y admin**
- Arquitectura Vite + Firebase, flujo completo, 15 páginas falsas, winstreak.
- Timer por pregunta (`tiempoSegundos`), pantalla de bienvenida con historial, carrusel de pre/post-test en desktop.
- Admin: buscador, detalle de participante y de sesión, eliminar participante, tasas de éxito, `firestore.rules`.
- Contenido: `consecuencias_mal` por opción, opciones sin auto-delación, botones de sincronización a Firestore.
- Vista 2 (estadística descriptiva, prueba t pareada, KAB, CSV) y renombre `sus` → `kab` con migración.

**2026-09-29 → 2026-10-01 · Identidad visual y experiencia**
- Búho "Ojito": 12 imágenes, ícono SVG, nube de narración en los 27 escenarios (primera persona, sin pistas), búho en login/bienvenida/niveles/feedback/resultados/final y búho neutral en pre/post-test.
- Tema claro crema en toda la app y correcciones de contraste (simuladores, banners de racha, naranjas de texto).
- Pre/post-test como carrusel también en celular, adaptado al alto de pantalla (verificado con capturas).
- Alternativas de los escenarios: barras de colores con número en círculo blanco, paleta sin rojo/verde, feedback ✓/✗ con las demás opciones atenuadas.
- Ensayados y descartados: grilla 2×2, formas ▲◆●■, otros estilos de número, popup de feedback en dos columnas.
- Despliegue a Firebase de todo lo anterior (verificado en vivo).

**2026-11-08 · Cierre de sesión**
- Commit de todos los cambios pendientes (ver `git log`). El despliegue en producción ya incluía este código.
- Pendiente para el equipo: pulsar **"🦉 Sincronizar narración del búho"** en el admin (sin esto el búho muestra el texto genérico).

---

## 📞 Contacto

- **Propietario**: Mauricio Cuentas (mauriciocuentas0@gmail.com)
- **Firebase Project**: ojoalfraude-2c2a7
