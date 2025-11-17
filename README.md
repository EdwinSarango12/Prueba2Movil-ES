# Planes Móviles Tigo Ecuador - Ionic App

Aplicación móvil desarrollada con Ionic Framework y Angular (NgModules) para la gestión de planes móviles de Tigo Ecuador.

## Características

- Autenticación con Firebase (Email/Password)
- Gestión de roles (Asesor Comercial, Usuario Registrado, Invitado)
- CRUD completo de planes móviles
- Chat en tiempo real con Firebase Firestore
- Almacenamiento de imágenes con Firebase Storage
- Contratación de planes
- Gestión de contrataciones

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Ionic CLI: `npm install -g @ionic/cli`
- Cuenta de Firebase con proyecto creado

## Instalación

1. Clonar o navegar al directorio del proyecto:
```bash
cd Prueba2
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar Firebase:

   a. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
   
   b. Habilitar los siguientes servicios:
      - Authentication (Email/Password)
      - Firestore Database
      - Storage
   
   c. Obtener las credenciales de Firebase (Configuración del proyecto > Configuración general > Tus aplicaciones)
   
   d. Actualizar `src/environments/environment.ts` y `src/environments/environment.prod.ts` con tus credenciales:
   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: "TU_API_KEY",
       authDomain: "TU_PROJECT_ID.firebaseapp.com",
       projectId: "TU_PROJECT_ID",
       storageBucket: "TU_PROJECT_ID.appspot.com",
       messagingSenderId: "TU_MESSAGING_SENDER_ID",
       appId: "TU_APP_ID"
     }
   };
   ```

4. Configurar Firestore:

   Crear las siguientes colecciones en Firestore:
   - `perfiles` - Para almacenar información de usuarios y roles
   - `planes_moviles` - Para almacenar los planes móviles
   - `contrataciones` - Para almacenar las solicitudes de contratación
   - `mensajes_chat` - Para almacenar los mensajes del chat

5. Configurar Firebase Storage:

   Crear un bucket llamado `planes-imagenes` con las siguientes reglas:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /planes-imagenes/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null && 
                       request.resource.size < 5 * 1024 * 1024 &&
                       request.resource.contentType.matches('image/(jpeg|jpg|png)');
       }
     }
   }
   ```

6. Configurar Firestore Security Rules:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Perfiles
       match /perfiles/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Planes móviles
       match /planes_moviles/{planId} {
         allow read: if resource.data.activo == true || 
                       (request.auth != null && 
                        get(/databases/$(database)/documents/perfiles/$(request.auth.uid)).data.rol == 'asesor_comercial');
         allow create, update, delete: if request.auth != null && 
                                         get(/databases/$(database)/documents/perfiles/$(request.auth.uid)).data.rol == 'asesor_comercial';
       }
       
       // Contrataciones
       match /contrataciones/{contratacionId} {
         allow read: if request.auth != null && 
                       (resource.data.usuarioId == request.auth.uid || 
                        get(/databases/$(database)/documents/perfiles/$(request.auth.uid)).data.rol == 'asesor_comercial');
         allow create: if request.auth != null;
         allow update: if request.auth != null && 
                         get(/databases/$(database)/documents/perfiles/$(request.auth.uid)).data.rol == 'asesor_comercial';
       }
       
       // Mensajes de chat
       match /mensajes_chat/{mensajeId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Ejecutar la Aplicación

<img width="1341" height="475" alt="image" src="https://github.com/user-attachments/assets/80ef8785-2cd2-42ff-8254-929bd394c533" />

<img width="565" height="556" alt="image" src="https://github.com/user-attachments/assets/0e89a5fa-7650-4859-851c-a556cd9bfdd6" />

<img width="625" height="505" alt="image" src="https://github.com/user-attachments/assets/b9d93606-90ea-4cce-a78d-bb994c219224" />

<img width="1348" height="629" alt="image" src="https://github.com/user-attachments/assets/6ec92031-c1b0-4fa2-997e-ebf99f6c11e4" />


### Desarrollo (Navegador)
```bash
ionic serve
```

### Android
```bash
ionic cap add android
ionic cap sync android
ionic cap open android
```

### iOS
```bash
ionic cap add ios
ionic cap sync ios
ionic cap open ios
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── guards/          # Guards de autenticación y roles
│   ├── models/          # Modelos TypeScript
│   ├── pages/           # Páginas de la aplicación
│   │   ├── asesor/      # Páginas para asesores
│   │   ├── catalogo/    # Catálogo público
│   │   ├── chat/        # Chat para usuarios
│   │   ├── login/       # Login
│   │   ├── registro/    # Registro
│   │   └── ...
│   ├── services/        # Servicios (Auth, Plan, Chat, etc.)
│   └── home/           # Home/Catálogo para usuarios registrados
├── environments/       # Configuración de entornos
└── ...
```

## Roles de Usuario

### 1. Invitado (No autenticado)
- Ver catálogo de planes (solo lectura)
- Acceder a detalles de planes
- Registrarse o iniciar sesión

### 2. Usuario Registrado
- Ver catálogo de planes
- Contratar planes
- Ver historial de contrataciones
- Chatear con asesores

### 3. Asesor Comercial
- Gestión completa de planes (CRUD)
- Subir imágenes promocionales
- Ver y gestionar contrataciones
- Chatear con clientes

## Planes Predefinidos

La aplicación incluye tres planes de ejemplo:

1. **SMART 5GB** - $15.99/mes
2. **PREMIUM 15GB** - $29.99/mes
3. **ILIMITADO TOTAL** - $45.99/mes

Puedes crear más planes desde el dashboard del asesor.

## Notas Importantes

- Asegúrate de configurar correctamente Firebase antes de ejecutar la aplicación
- Los roles se asignan automáticamente: "usuario_registrado" por defecto
- Para crear un asesor comercial, actualiza manualmente el campo `rol` en Firestore a "asesor_comercial"
- Las imágenes de planes tienen un límite de 5MB y solo aceptan formatos JPG y PNG

## Solución de Problemas

### Error de autenticación
- Verifica que las credenciales de Firebase estén correctas
- Asegúrate de que Authentication esté habilitado con Email/Password

### Error al subir imágenes
- Verifica que el bucket de Storage esté creado
- Revisa las reglas de Storage
- Asegúrate de que el archivo sea menor a 5MB

### Error al leer/escribir en Firestore
- Verifica las reglas de seguridad de Firestore
- Asegúrate de que el usuario esté autenticado cuando sea necesario
