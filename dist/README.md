README — Как публиковать сайт (файлы из `dist`) и запускать `server.js`

Кратко
------
Проект отдаёт статические файлы из папки `dist` и запускает Node-сервер `server.js`, который также выступает как прокси для внешних API. Перед деплоем убедитесь, что в корне проекта рядом с `server.js` есть собранная папка `dist`.

Подготовка
----------
1. На машине сборки (локально или CI) выполните:

```bash
README — Как публиковать сайт (файлы рядом с `server.js`) и запускать `server.js`


Подготовка
----------
1. На машине сборки (локально или CI) выполните (если у вас исходники):

```bash
npm ci
npm run build
```

2. Файлы `index.html`, `i18n/translations.json`, `main.js`, `styles.css`, `images/` и т.д. должны лежать в той же папке, что и `server.js`.

3. Создайте файл `.env` в той же папке (не коммитить в репозиторий) со значениями переменных окружения, которые использует `server.js`:

```
PORT=5000
API_KEY=ваш_api_key
CRICKET_API_KEY=ваш_cricket_key
NEWS_API_KEY=ваш_news_key
```

4. В `server.js` убедитесь, что Express отдает файлы из текущей директории. В начале файла (где настроена статика) замените использование `dist` на `__dirname` или `path.join(__dirname, '.')`. Пример:

```js
import path from 'path';
// ...
app.use(express.static(path.join(__dirname, '.')));

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
```

Развёртывание на VPS (Ubuntu) + systemd + Nginx
------------------------------------------------
1) Скопируйте файлы проекта на сервер, например в `/var/www/onesporst`:

```bash
sudo mkdir -p /var/www/onesporst
sudo chown $USER:$USER /var/www/onesporst
cd /var/www/onesporst
# скопируйте сюда server.js, package.json, index.html и все файлы сборки (css/js/images/i18n/...)
```

2) Установите зависимости (если копировали исходники):

```bash
npm ci
```

3) Поместите `.env` в `/var/www/onesporst` (как выше).

4) Создайте systemd unit `/etc/systemd/system/onesporst.service`:

```ini
[Unit]
Description=onesporst Node app
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/onesporst
EnvironmentFile=/var/www/onesporst/.env
ExecStart=/usr/bin/node /var/www/onesporst/server.js
Restart=always
User=www-data
Group=www-data
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

5) Запустите сервис:

```bash
sudo systemctl daemon-reload
sudo systemctl enable onesporst
sudo systemctl start onesporst
sudo journalctl -u onesporst -f
```

6) Настройте Nginx как реверс-прокси (пример `/etc/nginx/sites-available/onesporst`):

```nginx
server {
    listen 80;
    server_name your-domain.tld;

    location / {
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   Host      $host;
        *** Begin Patch
        *** End Patch
}

