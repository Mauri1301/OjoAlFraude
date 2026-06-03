# OjoAlFraude — Contexto del Proyecto

## 🎯 Descripción General

**OjoAlFraude** es una plataforma gamificada de detección de fraudes dirigida a adultos mayores en Perú. Basada en Self-Determination Theory (Ryan & Deci 2020), enfatiza la competencia como driver de motivación intrínseca.

- **Tesis**: Universidad de Lima, Ingeniería de Sistemas
- **Autor**: Mauricio Cuentas (mauriciocuentas0@gmail.com)
- **Hosting**: Firebase (ojoalfraude-2c2a7)
- **URL en vivo**: https://ojoalfraude-2c2a7.web.app
- **Repositorio**: c:\Users\USUARIO\Documents\Mauri\2026-1\Seminario

---

## 📊 Estado Actual (2026-06-03)

### ✅ Completado
- **Arquitectura multiarchivo** con Vite + Firebase + ES modules
- **Autenticación** con Firebase (email/password, persistencia de sesión)
- **Panel de admin** con:
  - Lista de participantes (filtrados por role, ordenados por sesiones)
  - Detalle de participante con todas las sesiones
  - Expandible con respuestas detalladas (pre-test, escenarios, post-test, SUS)
  - Gestión de escenarios y preguntas desde UI admin
- **15 páginas falsas de phishing** (educativas, con badges + tooltips):
  - Bancos: BCP, BBVA, Interbank, Scotiabank
  - Estado: SUNAT, RENIEC, MINTRA, MIDIS
  - Telco: Movistar, Claro, Entel
  - Delivery: OLVA, Rappi
  - Otros: CriptoInversiones, Instagram
- **Winstreak mechanic** (+15 pts en racha ≥2 correctas)
- **Flujo completo**: Login → Pretest → 3 Niveles × 3 escenarios (aleatorios) → Posttest → SUS → Admin view

### 🟡 En Revisión (UX de páginas falsas)
- **Problema identificado**: Desconexión UX entre clickear link → ver página falsa → cerrar → volver al escenario
  - Usuario no sabe si "contó" como respuesta
  - No hay feedback claro de que falló
  - Tooltips en badges son muy pequeños (mobile unfriendly para adultos mayores)
- **Decisión pendiente**: Si usuario clickea link fraudulento:
  - ¿Cómo comunicar que respondió mal?
  - ¿Mostrar o NO la respuesta correcta después?
  - ¿Cómo se ve el flujo en el juego cuando regresa?

### ⏸️ En Stand-by (Fases futuras)
- **Fase 4 (Migración de contenido a Firestore)**: Función `syncScenarioLinks()` existe pero sin UI de "re-seed" simplificada aún
- **Concienciación vs Gamificación**: Proyecto transitando de gamificado a enfoque de concienciación educativa

---

## 🏗️ Arquitectura Técnica

### Stack
```
Frontend: Vanilla JS + ES modules
Bundler: Vite (dev: npm run dev, build: npm run build)
Backend: Firebase (Auth + Firestore)
Hosting: Firebase Hosting (deploy: npm run deploy)
```

### Rutas Principales
```
src/
├── index.html              # Única página HTML con todas las pantallas (#p-login, #p-admin, etc.)
├── styles.css              # Estilos globales
├── js/
│   ├── main.js             # Entry point, observer de auth, expone funciones globales
│   ├── state.js            # STATE objeto + goTo(pantallaId) router
│   ├── auth-ui.js          # Login/Registro UI
│   ├── nivel.js            # Motor del juego (renderEscenario, responderEscenario, clicoEnlaceFraude)
│   ├── test.js             # Pre/Post-test lógica
│   ├── sus.js              # SUS questionnaire
│   ├── admin-ui.js         # Panel admin (participantes, escenarios, preguntas)
│   ├── results.js          # Pantalla de resultados
│   ├── export.js           # Exportar/reiniciar
│   └── mensaje-renderer.js # Renderear mensajes dinámicos
├── firebase/
│   ├── config.js           # Init Firebase con env vars
│   ├── auth.js             # Funciones auth (loginWithEmail, registerWithEmail, etc.)
│   └── db.js               # Firestore queries + syncScenarioLinks()
├── data/
│   ├── escenarios.js       # 9 escenarios fallback (nivel 1, 2, 3)
│   ├── escenarios-full.js  # 27 escenarios pool (9 por nivel) — YA CON linkUrl añadido
│   ├── test-questions.js   # 5 preguntas pre/post fallback
│   ├── test-questions-full.js  # 10 preguntas pool
│   └── nivel-config.js     # Configuración de niveles + 5 preguntas SUS
└── public/
    └── fake/               # 15 páginas falsas de phishing
        ├── fake.css        # Estilos compartidos
        ├── fake.js         # Comportamiento compartido (tooltips, cerrar)
        ├── bcp.html        # ...y 14 más (bbva, sunat, movistar, etc.)
        └── ...
```

### Firestore Collections
```
/users/
  {uid}/
    nombre, edad, genero, email, role, sessionCount, ...
    
/sessions/
  {docId}/
    userId, sessionNumber, pretest, juego, posttest, sus, completadoEn, ...
    
/scenarios/      (importados vía importarContenido())
/questions/      (importados vía importarContenido())
```

---

## 🔗 Flujo Crítico: Clickear Link Fraudulento

**Archivo clave**: `src/js/nivel.js`, función `clicoEnlaceFraude(n)`

**Actual (lo que ocurre ahora):**
1. Usuario ve escenario con mensaje + 4 opciones
2. En el mensaje hay un `<span class="wa-link">www.dominio-falso.com</span>`
3. En `renderEscenario()`, si `esc.linkUrl` existe, los spans se convierten a `<a href="/fake/bcp.html" target="_blank" onclick="clicoEnlaceFraude()">`
4. Al clickear:
   - Se registra automáticamente como respuesta INCORRECTA
   - Se abre nueva pestaña con página falsa
   - Usuario ve la página educativa (badges + tooltips)
   - Cierra la pestaña
   - Vuelve al juego (escenario original)
   - **PROBLEMA**: No hay feedback claro de "fallaste" al volver

**Decisión pendiente**: ¿Qué ocurre cuando cierra la pestaña y vuelve? (Ver sección "En Revisión" arriba)

---

## 📱 Próximos Pasos (Prioridad)

### 1. **FIX CRÍTICO: UX al cerrar página falsa**
   - Mejorar feedback cuando usuario regresa del link
   - Decidir si mostrar/ocultar respuesta correcta
   - Hacer más claro para adultos mayores que "respondieron incorrectamente"

### 2. **Testing con usuarios reales**
   - Prueba con 2-3 adultos mayores (target audience)
   - Observar: ¿Notan los badges? ¿Entienden tooltips? ¿Aprenden?
   - Base para decisiones de refactor

### 3. **Considerar refactor de concienciación**
   - Actualmente: Gamificación + phishing interactivo
   - Futuro: Mayor énfasis en reconocer señales de fraude ANTES de clickear
   - NO comenzar esto hasta validar con usuarios

### 4. **Fase 4 (Migración de contenido)**
   - Botón "🔗 Sincronizar enlaces de páginas falsas" ya existe en admin
   - Pendiente: UI simplificada para re-seed de contenido (si necesario)

---

## 🔐 Requisitos Técnicos para Colaborador

### Configuración Local
```bash
cd c:\Users\[TU_USER]\Documents\Mauri\2026-1\Seminario
npm install
npm run dev              # Dev server en http://localhost:5173
npm run build            # Build para producción
npm run deploy           # Deploy a Firebase (requiere: firebase login)
```

### Variables de Entorno
- **Archivo**: `.env.local` (raíz del proyecto, NO trackeado en git)
- **Contenido**: Credenciales de Firebase (API key, auth domain, project ID, etc.)
- **Nota**: Si no existe, pídelas al propietario original

### Firebase CLI
```bash
firebase login           # Necesario para deploy
firebase deploy --only hosting
```

---

## 🎓 Decisiones de Diseño (No Cambiar sin consultar)

1. **Opción B (No Opción A)**: Perfil del usuario persiste entre sesiones. No se pide re-entrada de datos.
   - Razón: UX fluida, usuario no pierde contexto
   
2. **Winstreak = Competencia (SDT)**: +15 pts en racha ≥2 correctas
   - Razón: Refuerza necesidad de "competencia" (Ryan & Deci)
   - No cambiar puntajes sin justificación pedagógica

3. **15 empresas, 1 página por empresa** (excepto: BCP/BBVA/Interbank reutilizan con parámetro `?u=dominio`)
   - Razón: Balance entre fidelidad visual y mantenibilidad
   - Si agregas empresas, sigue el patrón de las existentes

4. **Clickear link = Respuesta incorrecta automática**
   - Razón: Realismo + impacto educativo
   - La UX de cómo comunicar esto está EN REVISIÓN

---

## 📞 Contacto & Credenciales

- **Propietario**: Mauricio Cuentas (mauriciocuentas0@gmail.com)
- **Firebase Project**: ojoalfraude-2c2a7
- **Git**: Branch `master` es main
- **Deploy**: Automático via Firebase Hosting después de `npm run deploy`

---

## 🚨 Bugs Conocidos / Gotchas

- ❌ Tooltips en badges muy pequeños en mobile → adultos mayores no los notan
- ⚠️ Desconexión UX cuando regresa de página falsa (VER: "En Revisión")
- ⚠️ `syncScenarioLinks()` funciona pero sin UI simplificada para admin

---

## 📝 Notas para Próxima Sesión

- **NO comenzar Fase 4** (Firestore migration) hasta que UX de páginas falsas esté resuelta
- **Prioridad**: Validar con usuarios antes de cambiar enfoque a concienciación
- **Decisión pendiente**: Feedback cuando usuario cierra página falsa y regresa al escenario
