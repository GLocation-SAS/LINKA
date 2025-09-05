# 📌 Proyecto LINKA

## 🚀 Descripción General
**LINKA** es una plataforma de gestión de campañas y mensajería multicanal (SMS y WhatsApp) con autenticación de usuarios, gestión administrativa y almacenamiento de datos en la nube.  

El sistema está compuesto por:  
- **Backend** desarrollado en **NestJS**.  
- **Bases de datos en la nube**:  
  - **Google BigQuery**: almacenamiento de campañas, audiencias, contactos y mensajes.  
  - **Firestore (Firebase)**: gestión de usuarios y roles.  
- **Frontend** desarrollado en **React**, que se conectará al backend para ofrecer diferentes módulos de uso.  

---

## 🛠️ Tecnologías Principales
- ⚙️ **NestJS** → framework para el backend.  
- 🔑 **Firebase Authentication** → login con Google.  
- ☁️ **Firestore** → gestión de usuarios y roles (`admin` y `gestor`).  
- 📊 **Google BigQuery** → almacenamiento de campañas, audiencias, contactos y mensajes.  
- ⚛️ **React** → frontend modular.  

---

## 📂 Arquitectura de Módulos

### 🔑 Autenticación
- Login con **Google Auth (Firebase)**.  
- Registro automático en Firestore con roles (`admin | gestor`).  
- Endpoints protegidos en NestJS mediante guard de autenticación.  

### 👨‍💼 Administrador
| Módulo | Descripción |
|--------|-------------|
| **Gestión de Usuarios** | Crear, listar, actualizar y eliminar usuarios. Asignación de roles y permisos. |
| **Historial** | Registro de acciones y eventos importantes (pendiente de definición). |

### 📢 Campañas
- Creación de campañas de mensajería.  
- Asociación con usuarios y audiencias.  
- Almacenadas en **BigQuery**.  

### 👥 Audiencias
- Creación y gestión de grupos de contactos.  
- Relación directa con campañas.  
- Almacenadas en **BigQuery**.  

### 📱 Envío de Mensajes
Módulo especializado en la selección y envío de mensajes:  

| Tipo de Mensaje | Descripción |
|-----------------|-------------|
| **SMS** | Envío de mensajes de texto cortos vía SMS. |
| **WhatsApp - Texto** | Envío de mensajes de texto vía WhatsApp. |
| **WhatsApp - Imagen** | Envío de imágenes vía WhatsApp. |
| **WhatsApp - Video** | Envío de videos vía WhatsApp. |

Todos los mensajes se registran en **BigQuery** con su estado (`pendiente`, `enviado`, `fallido`).  

---

## 📊 Bases de Datos

### 🔹 Firestore (Usuarios)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| uid | STRING (PK) | ID de usuario desde Firebase Auth |
| email | STRING | Correo electrónico |
| display_name | STRING | Nombre visible del usuario |
| rol | STRING | `admin` o `gestor` |
| fecha_creacion | TIMESTAMP | Fecha de registro |

### 🔹 BigQuery (Tablas Principales)
| Tabla | Campos Principales |
|-------|---------------------|
| **Campañas** | idCampana, nombre, fecha_creacion, idUsuario |
| **Audiencias** | idAudiencia, nombre, fecha_creacion, idCampana, idUsuario |
| **Contactos** | idContacto, nombre_contacto, numero_contacto |
| **Mensajes** | idMensaje, idCampana, idUsuario, idContacto, contenido, tipo, fecha_envio, estado |

---

## 📌 Flujo General
1. 🔑 Usuario accede con **Google Auth**.  
2. 👤 Se crea o consulta su información en **Firestore**.  
3. 🛡️ El acceso a módulos depende del rol (`admin` o `gestor`).  
4. 🖥️ Desde el frontend (React) gestiona campañas, audiencias y mensajes.  
5. ⚙️ El backend (NestJS) procesa la información y la guarda en **BigQuery** y **Firestore**.  

---

## 📖 Próximos pasos
- 🛠️ Completar implementación de los módulos en React.  
- 📝 Definir flujo del **Historial de Administrador**.  
- 📡 Integración con proveedores de SMS y WhatsApp.  
- ☁️ Despliegue en la nube con escalabilidad.  

---

✨ **LINKA** es la solución integral para gestionar y enviar mensajes masivos con control total de usuarios, campañas y audiencias.  
cd