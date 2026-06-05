# OjoAlFraude

Plataforma gamificada de concientización sobre fraudes digitales, dirigida a adultos mayores en Perú.

- **URL en vivo:** https://ojoalfraude-2c2a7.web.app
- **Tesis:** Universidad de Lima — Ingeniería de Sistemas
- **Autor:** Mauricio Cuentas

---

## Requisitos previos

### 1. Instalar nvm (gestor de versiones de Node.js)

Abre una terminal y ejecuta:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Cierra y vuelve a abrir la terminal para que surta efecto.

### 2. Instalar Node.js 22

```bash
nvm install 22
nvm use 22
```

Verifica la instalación:

```bash
node --version   # debe mostrar v22.x.x
```

---

## Instalación del proyecto

### 3. Clonar o descargar el repositorio

Si tiene Git instalado:

```bash
git clone https://github.com/Mauri1301/OjoAlFraude.git
cd OjoAlFraude
```

Si no, descargue el ZIP desde GitHub, descomprímalo y abra una terminal en esa carpeta.

### 4. Instalar dependencias

```bash
npm install
```

### 5. Configurar variables de entorno

Coloque el archivo `.env.local` (proporcionado por el autor) en la raíz del proyecto. La estructura del proyecto debe quedar así:

```
OjoAlFraude/
├── .env.local        ← aquí va el archivo
├── src/
├── package.json
└── ...
```

> **Importante:** Sin este archivo la aplicación no puede conectarse a la base de datos.

---

## Levantar el proyecto

```bash
nvm use 22
npm run dev
```

Abra el navegador en: **http://localhost:5173**

---

## Acceso al panel de administrador

Para revisar los datos de los participantes:

1. Inicie sesión con las credenciales de administrador proporcionadas por el autor.
2. Será redirigido automáticamente al panel de administración.
3. Desde ahí podrá ver todos los participantes, sus sesiones y resultados detallados.

---

## Estructura del proyecto

```
src/
├── index.html              # Aplicación principal (SPA)
├── styles.css              # Estilos globales
├── js/                     # Lógica de la aplicación
│   ├── main.js             # Punto de entrada
│   ├── nivel.js            # Motor del juego
│   ├── test.js             # Pre-test y post-test
│   ├── sus.js              # Encuesta de concientización
│   ├── admin-ui.js         # Panel de administrador
│   └── ...
├── data/                   # Contenido del juego
│   ├── test-questions-a.js # Formulario A (pre-test, 10 preguntas)
│   ├── test-questions-b.js # Formulario B (post-test, 10 preguntas)
│   ├── escenarios-full.js  # 27 escenarios de fraude
│   └── ...
├── firebase/               # Configuración de Firebase
└── public/
    └── fake/               # 15 páginas falsas educativas
```

---

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | Vanilla JS + ES Modules |
| Bundler | Vite |
| Base de datos | Firebase Firestore |
| Autenticación | Firebase Auth |
| Hosting | Firebase Hosting |

---

## Comandos disponibles

```bash
npm run dev       # Servidor de desarrollo (http://localhost:5173)
npm run build     # Compilar para producción
npm run deploy    # Compilar y publicar en Firebase
```
