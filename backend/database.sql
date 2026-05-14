CREATE TABLE sites (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    url         TEXT,
    type        TEXT,
    country     TEXT,
    description TEXT
);

CREATE TABLE blocks (
    id              SERIAL PRIMARY KEY,
    site_id         INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    blocker         TEXT,
    blocker_country TEXT,
    reason          TEXT,
    date            TEXT,
    status          TEXT DEFAULT 'active',
    bypass          TEXT
);

INSERT INTO sites (id, name, url, type, country, description) VALUES
(1, 'Wikipedia', 'wikipedia.org', 'энциклопедия', 'США', 'Свободная онлайн-энциклопедия'),
(2, 'Медиазона', 'zona.media', 'новостной', 'Россия', 'Независимое издание о правозащитной тематике'),
(3, 'Telegram', 'https://t.me', 'социальная сеть', 'Россия', 'Заблокирован РосКомНадзором'),
(4, 'Rutube', 'https://rutube.ru/', 'другое', 'Россия', 'Российский видеохостинг');

SELECT setval('sites_id_seq', (SELECT MAX(id) FROM sites));

INSERT INTO blocks (id, site_id, blocker, blocker_country, reason, date, status, bypass) VALUES
(1, 1, 'Роскомнадзор', 'Россия', 'Отказ удалить статьи о наркотиках', '2017-08-25', 'lifted', 'Не требуется'),
(2, 3, 'Роскомнадзор', 'Россия', 'Павел Дуров какашка', '2026-05-05', 'active', 'VPN'),
(3, 1, 'Роскомнадзор', 'Россия', 'Слишком хорошие статьи делаете', '2026-05-12', 'active', '');

SELECT setval('blocks_id_seq', (SELECT MAX(id) FROM blocks));