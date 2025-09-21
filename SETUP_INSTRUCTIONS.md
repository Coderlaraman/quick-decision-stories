# 🚀 Setup Instructions - Logging & Authentication

Este documento te guiará para configurar el sistema de logging y las funciones de autenticación en Quick Decision Stories.

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- Una cuenta en [Supabase](https://supabase.com)
- Git

## 🔧 Configuración de Supabase

### 1. Crear un proyecto en Supabase

1. Ve a [Supabase](https://app.supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración (puede tomar unos minutos)

### 2. Configurar la base de datos

1. Ve a la sección **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido del archivo `supabase-schema.sql`
3. Ejecuta el script para crear las tablas y configuraciones necesarias

### 3. Obtener las credenciales

1. Ve a **Settings** > **API** en tu proyecto de Supabase
2. Copia los siguientes valores:
   - **Project URL**
   - **anon public key**

### 4. Configurar variables de entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y reemplaza los valores:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
   ```

## 🏗️ Instalación y Ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar en modo desarrollo

```bash
npm run dev
```

### 3. Abrir en el navegador

La aplicación estará disponible en `http://localhost:5173`

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticación

- **Registro de usuarios**: Crear nuevas cuentas con email y contraseña
- **Inicio de sesión**: Autenticación con credenciales existentes
- **Recuperación de contraseña**: Envío de enlaces de recuperación por email
- **Gestión de perfil**: Actualización de información del usuario
- **Cierre de sesión**: Terminar sesión de forma segura

### 📊 Sistema de Logging

- **Categorías de logs**: AUTH, USER, GAME, SYSTEM, ERROR
- **Niveles de log**: DEBUG, INFO, WARN, ERROR
- **Logging automático**: Eventos de autenticación, errores y acciones del usuario
- **Métricas**: Seguimiento de rendimiento y uso

### 🎮 Integración con el Juego

- **Estadísticas persistentes**: Progreso guardado en la base de datos
- **Sesiones de juego**: Registro de partidas y decisiones
- **Logros**: Sistema de achievements (preparado para futuras implementaciones)

## 🧪 Pruebas

### Probar Autenticación

1. **Registro**:
   - Haz clic en "Registrarse"
   - Completa el formulario con un email válido
   - Verifica que recibas el email de confirmación

2. **Inicio de sesión**:
   - Usa las credenciales creadas
   - Verifica que aparezca el menú de usuario

3. **Recuperación de contraseña**:
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa tu email
   - Verifica que recibas el email de recuperación

### Probar Logging

1. Abre las **Developer Tools** del navegador (F12)
2. Ve a la pestaña **Console**
3. Realiza acciones como:
   - Registrarse/iniciar sesión
   - Jugar una historia
   - Cerrar sesión
4. Observa los logs en la consola con formato estructurado

## 🔍 Verificación de la Base de Datos

1. Ve a **Table Editor** en Supabase
2. Verifica que se hayan creado las siguientes tablas:
   - `profiles`: Perfiles de usuario
   - `game_sessions`: Sesiones de juego
   - `user_stats`: Estadísticas de usuario

3. Después de registrar un usuario, verifica que:
   - Se cree automáticamente un perfil en `profiles`
   - Se inicialicen las estadísticas en `user_stats`

## 🛠️ Solución de Problemas

### Error: "Supabase credentials not found"

- Verifica que el archivo `.env` existe y tiene las variables correctas
- Asegúrate de que las variables empiecen con `VITE_`
- Reinicia el servidor de desarrollo después de cambiar el `.env`

### Error de conexión a Supabase

- Verifica que la URL del proyecto sea correcta
- Confirma que la clave anónima sea válida
- Revisa que el proyecto de Supabase esté activo

### Errores de base de datos

- Asegúrate de haber ejecutado el script `supabase-schema.sql`
- Verifica que las políticas RLS estén habilitadas
- Revisa los logs en Supabase Dashboard > Logs

## 📚 Estructura de Archivos Creados

```
src/
├── utils/
│   └── logger.ts              # Sistema de logging centralizado
├── lib/
│   └── supabase.ts           # Configuración y servicios de Supabase
├── hooks/
│   └── useAuth.ts            # Hook para manejo de autenticación
├── components/
│   └── auth/
│       ├── AuthModal.tsx     # Modal de login/registro
│       └── UserMenu.tsx      # Menú de usuario autenticado
├── .env.example              # Plantilla de variables de entorno
├── supabase-schema.sql       # Esquema de base de datos
└── SETUP_INSTRUCTIONS.md     # Este archivo
```

## 🎯 Próximos Pasos

1. **Personalizar el diseño**: Ajustar estilos según tu marca
2. **Agregar más campos al perfil**: Avatar, biografía, preferencias
3. **Implementar logros**: Sistema de achievements basado en estadísticas
4. **Añadir notificaciones**: Feedback visual para acciones del usuario
5. **Optimizar rendimiento**: Implementar caching y lazy loading

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en la consola del navegador
2. Verifica los logs en Supabase Dashboard
3. Consulta la [documentación de Supabase](https://supabase.com/docs)
4. Revisa que todas las dependencias estén instaladas correctamente

¡Disfruta desarrollando con Quick Decision Stories! 🎮✨