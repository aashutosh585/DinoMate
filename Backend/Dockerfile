# ---------------------------------------------------
# Stage 1: Build & Package the Spring Boot Application
# ---------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache Maven dependencies separately to accelerate rebuilds
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy application source code and compile production JAR
COPY src ./src
RUN [ -f src/main/resources/application.properties ] || cp src/main/resources/application.properties.example src/main/resources/application.properties
RUN mvn clean package -DskipTests -B

# ---------------------------------------------------
# Stage 2: Minimal, Secure Production Runtime
# ---------------------------------------------------
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-root system user and group for security
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Copy the generated executable JAR from the builder stage
COPY --from=builder /app/target/JobPortal-*.jar app.jar

# Environment defaults (supports dynamic $PORT on cloud platforms like Railway, Render, Fly.io)
ENV PORT=8080
ENV SERVER_PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]