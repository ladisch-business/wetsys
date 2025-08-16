# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
RUN npm run build

# --- serve static with nginx ---
FROM nginx:alpine AS run
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
