# Wordle RN - Мобильная игра Wordle

React Native (Expo) приложение для игры в Wordle с полной интеграцией бекенда, авторизацией и статистикой.

## Возможности

- 🎮 **Игровой процесс**: Угадывание слов из 5 букв с цветовыми подсказками
- 👤 **Авторизация**: Регистрация и вход пользователей
- 📊 **Статистика**: Отслеживание прогресса, серий побед и распределения попыток
- 🏆 **Рейтинг**: Глобальный рейтинг игроков
- ⚙️ **Настройки**: Звук, язык, сложность игры
- 📖 **Правила**: Подробные инструкции по игре
- 🌐 **Онлайн-режим**: Синхронизация данных с удаленным сервером

## Технологии

### Frontend
- React Native (Expo)
- TypeScript
- React Navigation
- AsyncStorage
- Expo AV (звуки)

### Backend
- Node.js + Express
- PostgreSQL
- JWT авторизация
- bcrypt для хеширования паролей

## Требования

- Node.js 18+ 
- npm или yarn
- PostgreSQL (локально или облачный сервис)
- Expo CLI (устанавливается автоматически)

## Быстрый старт

```bash
# 1. Установите зависимости фронтенда
npm install

# 2. Установите зависимости бекенда
cd backend
npm install

# 3. Настройте PostgreSQL и создайте базу данных (см. раздел ниже)
# 4. Настройте .env файл
# 5. Инициализируйте схему БД: psql -U postgres -d wordle -f backend/init.sql
# 6. Запустите бекенд
npm run dev

# 6. В другом терминале, из корневой папки проекта запустите приложение
cd ..
npm start
```

## Установка и запуск

### 1. Установка зависимостей фронтенда

```bash
cd wordle-rn
npm install
```

### 2. Настройка и запуск бекенда

```bash
cd backend
npm install
```

#### Установка PostgreSQL

**macOS (с Homebrew):**
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

#### Создание базы данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE wordle;

# Выйдите
\q
```

#### Инициализация схемы

```bash
psql -U postgres -d wordle -f init.sql
```

#### Настройка .env

Создайте файл `.env` в папке `backend`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wordle
DB_USER=postgres
DB_PASSWORD=your-postgres-password
JWT_SECRET=your-secret-key-change-in-production
```

**Важно**: Для продакшена используйте облачный PostgreSQL (AWS RDS, Heroku Postgres и т.д.) и измените `JWT_SECRET` на безопасный ключ.

#### Запуск бекенд сервера

```bash
npm run dev
# или для продакшена
npm start
```

Сервер будет доступен на `http://localhost:3000`

### 3. Настройка API URL в приложении

Откройте файл `src/services/api.ts` и при необходимости измените `API_BASE_URL`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'  // Для эмулятора/симулятора
  : 'http://YOUR_IP:3000/api';    // Для физического устройства замените YOUR_IP на IP вашего компьютера
```

**Для физических устройств**: 
- Убедитесь, что устройство и компьютер в одной сети Wi-Fi
- Замените `localhost` на IP-адрес вашего компьютера (например, `192.168.1.100`)
- Для Android эмулятора используйте `10.0.2.2` вместо `localhost`

### 4. Запуск мобильного приложения

В корневой папке проекта (`wordle-rn`):

```bash
# Запуск Expo dev server
npm start

# Или напрямую для конкретной платформы
npm run android  # для Android
npm run ios      # для iOS
```

Отсканируйте QR-код в терминале с помощью:
- **Android**: Expo Go app
- **iOS**: Camera app (откроет Expo Go)

## Структура проекта

```
wordle-rn/
├── src/
│   ├── screens/          # Экраны приложения
│   │   ├── WelcomeScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   ├── RulesScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── services/         # API сервисы
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── game.ts
│   ├── utils/            # Утилиты
│   │   └── wordle.ts
│   └── data/             # Данные
│       └── words.ts
├── backend/              # Backend сервер
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── App.tsx               # Главный компонент
└── package.json
```

## API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя

### Игры
- `POST /api/games` - Сохранение результата игры (требует авторизации)
- `GET /api/games/progress` - Получение прогресса пользователя (требует авторизации)

### Рейтинг
- `GET /api/leaderboard` - Получение рейтинга игроков

## Использование

1. **Первый запуск**: При первом запуске приложения вы увидите экран приветствия, затем экран авторизации
2. **Регистрация**: Создайте аккаунт с именем пользователя, email и паролем
3. **Игра**: Выберите категорию и сложность, начните угадывать слова
4. **Статистика**: Просматривайте свой прогресс в разделе "Статистика"
5. **Рейтинг**: Сравнивайте свои результаты с другими игроками
6. **Настройки**: Настройте звук, язык и другие параметры

## Разработка

### Запуск тестов
```bash
npm test
```

### Сборка для продакшена
```bash
# Android
expo build:android

# iOS
expo build:ios
```

## Решение проблем

### Бекенд не подключается
- Убедитесь, что PostgreSQL запущен
- Проверьте правильность параметров подключения в `.env` (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- Убедитесь, что база данных создана и схема инициализирована (`init.sql`)
- Проверьте, что бекенд сервер запущен на порту 3000

### API запросы не работают на физическом устройстве
- Замените `localhost` на IP-адрес вашего компьютера в `src/services/api.ts`
- Убедитесь, что устройство и компьютер в одной сети Wi-Fi
- Проверьте, что файрвол не блокирует порт 3000

### Ошибки авторизации
- Убедитесь, что токен сохраняется в AsyncStorage
- Проверьте, что JWT_SECRET совпадает на сервере

## Лицензия

Private

## Контакты

Для вопросов и предложений создайте issue в репозитории проекта.
