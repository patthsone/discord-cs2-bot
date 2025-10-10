# Используем официальный образ Node.js 20
FROM node:20.18.0-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем исходный код
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S discord -u 1001

# Меняем владельца файлов
RUN chown -R discord:nodejs /app
USER discord

# Открываем порт (если нужен)
EXPOSE 3000

# Команда запуска
CMD ["npm", "start"]
