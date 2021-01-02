const express = require('express');
const http = require('http');

const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const expressStaticGzip = require("express-static-gzip");

const app = express();


// Устанавливаем корневую рендер-директорию
// И "pug" как основной рендерер
app.set('views',       'views' );
app.set('view engine', 'pug');

// Установка cookie-парсера
app.use(cookieParser());
app.set('etag', false);
app.disable('x-powered-by');

// Виртуализация сетевых директорий
app.use('/assets', expressStaticGzip(__dirname.concat('/assets')));
app.use('/static', expressStaticGzip(__dirname.concat('/static')));
app.use('/dist', expressStaticGzip(__dirname.concat('/dist'), {}));

// Включаем парсер body
app.use('/', bodyParser.json({ type: '*/json' }));
app.use('/', bodyParser.text({ type: '*/text' }));

// Публичная версия приложения (стабильная)
app.get('/vk_app', (req, res) => {
  res.render("vk_app", { dev: false });
})

// Версия для разработки
app.get('/vk_app_dev', (req, res) => {
  res.render("vk_app", { dev: true });
})


const server = http.createServer(app);
server.listen(3000);
console.clear();