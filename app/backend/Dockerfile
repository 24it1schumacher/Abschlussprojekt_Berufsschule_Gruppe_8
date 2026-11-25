# Backend-Image in zwei Stufen:
#   1. "build": Maven baut das JAR und fuehrt die Tests aus (schlaegt ein Test fehl, entsteht kein Image)
#   2. Laufzeit: nur Java-Laufzeit (JRE) und das fertige JAR, kein Maven, kein Quellcode

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
# Zuerst nur die pom.xml: Abhaengigkeiten werden gecacht, solange sie sich nicht aendern
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B package && cp target/*.jar /app.jar

FROM eclipse-temurin:21-jre-noble
WORKDIR /app
COPY --from=build /app.jar app.jar
# Ohne Root-Rechte laufen (Benutzer "ubuntu", UID 1000, ist im Basis-Image vorhanden)
USER 1000:1000
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:8080/api/health || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
