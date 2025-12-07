FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

RUN npm prune --production

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 8000
ENTRYPOINT ["npm", "start"]
