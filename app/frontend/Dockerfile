# Webserver-Image in zwei Stufen:
#   1. "build": Node baut das Frontend zu statischen Dateien (HTML, JS, CSS)
#   2. Laufzeit: Caddy liefert diese Dateien aus und leitet /api an das Backend weiter
#      Die Caddy-Konfiguration kommt aus infra/proxy/Caddyfile (per Volume eingebunden)

FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Leere Basis-URL: Das Frontend ruft /api auf derselben Adresse auf, unter der es geladen wurde.
# Dadurch braucht es kein CORS zwischen Frontend und Backend.
ENV VITE_API_BASE_URL=""
RUN npm run build

FROM caddy:2.11-alpine
COPY --from=build /src/dist /srv
