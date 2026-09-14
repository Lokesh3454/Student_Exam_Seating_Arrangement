# ===================================================================
# Multi-stage Dockerfile: Angular Frontend + Spring Boot Backend
# Result: Single deployable image - Angular UI served from Spring Boot
# ===================================================================

# Stage 1: Build Angular Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install

# Copy source and build production bundle
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot Backend JAR
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app/backend

# Copy Maven descriptor and resolve dependencies first (better cache)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -q

# Copy backend source
COPY backend/src ./src

# Copy the built Angular files into Spring Boot static resources
COPY --from=frontend-build /app/frontend/dist/smart-exam-seating-frontend/ ./src/main/resources/static/

# Package the fat JAR (includes static Angular assets)
RUN mvn package -DskipTests -q

# Stage 3: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the executable Spring Boot JAR
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Memory optimization for Render free tier (512MB RAM)
ENV JAVA_TOOL_OPTIONS="-Xmx384m -Xms128m -XX:+UseG1GC -XX:MaxRAMPercentage=75"

# Render injects PORT dynamically
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
