# --- Etapa de build ---
FROM node:22.17.1-slim

# Definir el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json .

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar el proyecto NestJS
RUN npm run build

# 🔹 Variable de entorno para Firebase
# Cloud Run inyecta automáticamente GOOGLE_APPLICATION_CREDENTIALS si le subes el JSON como Secret/Config
ENV GOOGLE_APPLICATION_CREDENTIALS=src/config/firebase-service-account.json

# Copiar credenciales (opcional, si no las vas a inyectar como secreto en Cloud Run)
COPY src/config/firebase-service-account.json ./src/config/firebase-service-account.json

EXPOSE 3000

# Comando de inicio
CMD ["npm","run","start:prod"]

