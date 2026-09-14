# Multi-stage Docker build for Spring Boot Backend (Java 21)
# Used when Render Root Directory is configured to "backend"

# Stage 1: Build JAR using Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy Maven descriptor and source code
COPY pom.xml .
COPY src ./src

# Build production executable JAR without running tests
RUN mvn clean package -DskipTests

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built JAR from builder stage
COPY --from=build /app/target/*.jar app.jar

# Render assigns port dynamically via $PORT
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
