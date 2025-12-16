# Wordle Backend API

Backend сервер для мобильной игры Wordle RN.

## Технологии

- Node.js
- Express.js
- PostgreSQL
- JWT для авторизации
- bcrypt для хеширования паролей

## Установка

```bash
npm install
```

## Настройка

### 1. Установите PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Скачайте и установите PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/

### 2. Создайте базу данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE wordle;

# Выйдите
\q
```

### 3. Инициализируйте схему

```bash
psql -U postgres -d wordle -f init.sql
```

### 4. Создайте файл `.env`

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wordle
DB_USER=postgres
DB_PASSWORD=your-postgres-password
JWT_SECRET=your-secret-key-change-in-production
```

**Важно**: Для продакшена используйте облачный PostgreSQL (например, AWS RDS, Heroku Postgres) и установите безопасный JWT_SECRET.

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшен
```bash
npm start
```

Сервер будет доступен на `http://localhost:3000`

## API Endpoints

### Авторизация

#### POST /api/auth/register
Регистрация нового пользователя

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "totalScore": 0
  }
}
```

#### POST /api/auth/login
Вход пользователя

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** (аналогично register)

### Игры

#### POST /api/games
Сохранение результата игры (требует авторизации)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "attempts": 5,
  "won": true,
  "score": 50,
  "word": "APPLE"
}
```

#### GET /api/games/progress
Получение прогресса пользователя (требует авторизации)

**Response:**
```json
{
  "success": true,
  "userId": "string",
  "totalScore": 1000,
  "gamesPlayed": 50,
  "gamesWon": 40,
  "currentStreak": 5,
  "bestStreak": 10,
  "averageAttempts": 4.2,
  "distribution": {
    "1": 2,
    "2": 5,
    "3": 10,
    "4": 15,
    "5": 8
  }
}
```

### Рейтинг

#### GET /api/leaderboard
Получение рейтинга игроков

**Query параметры:**
- `limit` - количество игроков (по умолчанию 100)

**Response:**
```json
[
  {
    "username": "player1",
    "totalScore": 5000,
    "gamesWon": 100,
    "winRate": 80,
    "rank": 1
  },
  ...
]
```

## Структура базы данных

### Таблица users
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR(50), UNIQUE)
- `email` (VARCHAR(100), UNIQUE)
- `password` (VARCHAR(255), hashed)
- `total_score` (INTEGER)
- `games_played` (INTEGER)
- `games_won` (INTEGER)
- `current_streak` (INTEGER)
- `best_streak` (INTEGER)
- `average_attempts` (DECIMAL(5, 2))
- `created_at` (TIMESTAMP)

### Таблица games
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY -> users.id)
- `attempts` (INTEGER)
- `won` (BOOLEAN)
- `score` (INTEGER)
- `word` (VARCHAR(10))
- `created_at` (TIMESTAMP)

### Таблица attempt_distribution
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY -> users.id)
- `attempts` (INTEGER)
- `count` (INTEGER)
- UNIQUE(user_id, attempts)

### Триггеры
Автоматический триггер `update_stats_trigger` обновляет статистику пользователя при добавлении новой игры.

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены используются для аутентификации
- Токены действительны 30 дней
- Все защищенные маршруты требуют валидный токен

