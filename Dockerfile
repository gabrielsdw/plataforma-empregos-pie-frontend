FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Copy .env files (Next.js will read them automatically during build)
COPY .env* ./

COPY . .

RUN yarn build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

RUN corepack enable && corepack prepare yarn@1.22.22 --activate && \
    yarn install --frozen-lockfile --production

EXPOSE 3000

CMD ["yarn", "start", "-H", "0.0.0.0", "-p", "3000"]