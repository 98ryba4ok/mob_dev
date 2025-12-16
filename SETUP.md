# Инструкция по настройке проекта

## Шаг 1: Установка зависимостей

### Фронтенд
```bash
npm install
```

### Бекенд
```bash
cd backend
npm install
cd ..
```

## Шаг 2: Настройка PostgreSQL

### Вариант 1: Локальная установка PostgreSQL

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

### Вариант 2: Облачный PostgreSQL

1. Используйте AWS RDS, Heroku Postgres, или другой облачный сервис
2. Получите connection string
3. Используйте параметры подключения в `.env` файле бекенда

### Создание базы данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE wordle;

# Выйдите
\q
```

### Инициализация схемы

```bash
cd backend
psql -U postgres -d wordle -f init.sql
```

## Шаг 3: Настройка бекенда

1. Перейдите в папку `backend`
2. Создайте файл `.env`:
```bash
cp .env.example .env
```

3. Отредактируйте `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wordle
DB_USER=postgres
DB_PASSWORD=your-postgres-password
# Или для облачного PostgreSQL:
# DB_HOST=your-db-host.com
# DB_PORT=5432
# DB_NAME=wordle
# DB_USER=your-username
# DB_PASSWORD=your-password
JWT_SECRET=your-secret-key-change-in-production
```

**Важно**: Измените `JWT_SECRET` на случайную строку для безопасности!

## Шаг 4: Запуск бекенда

```bash
cd backend
npm run dev
```

Сервер должен запуститься на `http://localhost:3000`

Проверьте, что сервер работает:
```bash
curl http://localhost:3000/api/health
```

Должен вернуться ответ: `{"success":true,"message":"Server is running"}`

## Шаг 5: Настройка API URL в приложении

Если вы используете физическое устройство или Android эмулятор, откройте `src/services/api.ts` и измените `API_BASE_URL`:

**Для Android эмулятора:**
```typescript
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api'
  : 'http://localhost:3000/api';
```

**Для физического устройства:**
1. Узнайте IP-адрес вашего компьютера:
   - macOS/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
2. Замените `localhost` на ваш IP:
```typescript
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:3000/api'  // Замените на ваш IP
  : 'http://localhost:3000/api';
```

## Шаг 6: Запуск приложения

В корневой папке проекта:
```bash
npm start
```

Откройте приложение на вашем устройстве через Expo Go или эмулятор.

## Проверка работы

1. При первом запуске должен появиться экран приветствия
2. Затем экран авторизации
3. Зарегистрируйте нового пользователя
4. После входа вы должны увидеть главное меню
5. Попробуйте сыграть игру - результаты должны сохраняться

## Решение проблем

### PostgreSQL не запускается
- Убедитесь, что PostgreSQL установлен и запущен
- Проверьте статус: `brew services list` (macOS) или `sudo systemctl status postgresql` (Linux)
- Проверьте, что сервис слушает на порту 5432: `lsof -i :5432`

### Бекенд не подключается к PostgreSQL
- Проверьте правильность параметров подключения в `.env` (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- Убедитесь, что PostgreSQL запущен
- Проверьте, что база данных создана: `psql -U postgres -l`
- Убедитесь, что схема инициализирована: `psql -U postgres -d wordle -c "\dt"`
- Для облачного PostgreSQL проверьте, что IP-адрес добавлен в whitelist

### API запросы не работают
- Убедитесь, что бекенд запущен на порту 3000
- Проверьте правильность `API_BASE_URL` в `src/services/api.ts`
- Для физических устройств убедитесь, что устройство и компьютер в одной сети Wi-Fi
- Проверьте файрвол - порт 3000 должен быть открыт

### Ошибки авторизации
- Проверьте, что токен сохраняется в AsyncStorage
- Убедитесь, что `JWT_SECRET` одинаковый на сервере
- Проверьте логи бекенда для деталей ошибки

