-- CREATE DATABASE wordle;

-- Подключиться к базе данных
-- \c wordle;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    total_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    average_attempts DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица игр
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempts INTEGER NOT NULL,
    won BOOLEAN NOT NULL,
    score INTEGER NOT NULL,
    word VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица распределения попыток (для статистики)
CREATE TABLE IF NOT EXISTS attempt_distribution (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempts INTEGER NOT NULL,
    count INTEGER DEFAULT 1,
    UNIQUE(user_id, attempts)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
CREATE INDEX IF NOT EXISTS idx_distribution_user_id ON attempt_distribution(user_id);

-- Функция для обновления статистики пользователя
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    new_streak INTEGER;
BEGIN
    IF NEW.won THEN
        -- Получаем текущую серию перед обновлением
        SELECT current_streak INTO new_streak FROM users WHERE id = NEW.user_id;
        new_streak := new_streak + 1;
        
        -- Обновляем статистику при победе
        UPDATE users SET
            games_played = games_played + 1,
            games_won = games_won + 1,
            current_streak = new_streak,
            best_streak = GREATEST(best_streak, new_streak),
            total_score = total_score + NEW.score
        WHERE id = NEW.user_id;
        
        -- Обновляем распределение попыток
        INSERT INTO attempt_distribution (user_id, attempts, count)
        VALUES (NEW.user_id, NEW.attempts, 1)
        ON CONFLICT (user_id, attempts)
        DO UPDATE SET count = attempt_distribution.count + 1;
        
        -- Пересчитываем среднее количество попыток
        UPDATE users SET
            average_attempts = (
                SELECT COALESCE(
                    SUM(attempts * count)::DECIMAL / NULLIF(SUM(count), 0),
                    0
                )
                FROM attempt_distribution
                WHERE user_id = NEW.user_id
            )
        WHERE id = NEW.user_id;
    ELSE
        -- Обновляем статистику при проигрыше
        UPDATE users SET
            games_played = games_played + 1,
            current_streak = 0
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления статистики
CREATE TRIGGER update_stats_trigger
AFTER INSERT ON games
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

