const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const http  = require('http');
const https = require('https');
const mysql = require('mysql2');
const qs = require('querystring');

const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const expressStaticGzip = require("express-static-gzip");




// ====================================================
// | Инициализация константных значений
// ====================================================

const IS_DEV = false;

/**
 * @description Прокси-префикс URI-ардеса
 */
const URI_PREFIX = "";

/**
 * @description Основной порт
 */
const PORT = 3000;

/**
 * @description Секретный ключ. Используется для проверки подписи
 */
const secretKey = "2soxvl6nSTuKTffqZgQ8";

/**
 * @description Ключ доступа. Используется для VK API
 */
const accessKey = "e7625570e7625570e762557024e717f939ee762e7625570b89cef51d855d884f8d27262";

/**
 * @description Единственный экземпляр фреймворка express
 */
const app = express();

/**
 * @description Единственный экземпляр для работы с БД
 */
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "admin",
  database: "ogau"
}).promise();

// ====================================================



// ====================================================
// | Процедурные функции
// ====================================================

function makeVKAPIQuery(methodName="users.get", params) {
  return new Promise((resolve, reject) => {
    const query = qs.stringify({...params, v: '5.126', access_token: accessKey});
    https.get(`https://api.vk.com/method/${methodName}?${query}`, (resp) => {
      let data = '';  
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => resolve(data));
    }).on('error', (err) => console.log("Error: " + err.message));
  })
}

/**
 * @description Добавляет пользователя в БД
 * @param {Object} uinfo
 */
function insertUserIntoDB(uinfo) {
  const uid = uinfo.vk_user_id ?? 0;
  const platform = uinfo.vk_platform ?? "none";
  const key = getRandomKey();
  const ref = uinfo.vk_ref ?? "none";
  const lang = uinfo.vk_language ?? "none";
  const favorite = parseInt(uinfo.vk_is_favorite ?? 0);
  var first_name = "", last_name = "";
  
  makeVKAPIQuery("users.get", { user_ids: uid }).then(result => {
    try {
      const response = JSON.parse(result).response[0];
      first_name = response.first_name;
      last_name = response.last_name;
    } catch(e) {
      console.log(e);
    }

    pool.execute(`INSERT INTO users(uid, first_name, last_name, last_seen, lang, platform, ref, favorite, ukey) VALUES (\
      "${uid}", "${first_name}", "${last_name}", NOW(), "${lang}", "${platform}", "${ref}", ${favorite}, "${key}"\
    );`);
  });

  return key;
}

/**
 * 
 */
function updateUser(uinfo) {
  const platform = uinfo.vk_platform ?? false;
  const ref = uinfo.vk_ref ?? false;
  const lang = uinfo.vk_language ?? false;
  const favorite = parseInt(uinfo.vk_is_favorite ?? 0);
  const uid = uinfo.vk_user_id ?? uinfo.uid;
  const query = `UPDATE users SET last_seen=NOW() \
  ${lang ? `,lang="${lang}"`:''} ${platform ? `,platform="${platform}"`:''} ${ref ? `,ref="${ref}"`:''} \
  ${uinfo.hasOwnProperty('vk_is_favorite') ? `,favorite=${favorite}`:''} WHERE uid='${uid}';`;

  pool.execute(query);
}

/**
 * 
 * @param {string} secretKey
 * @param {string} message
 */
function sha256(secretKey, message) {
  return crypto
  .createHmac('sha256', secretKey)
  .update(message)
  .digest()
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=$/, '');
}

/**
 * @description Проверка подписи запроса  
 * @param {Object} query
 * @return {string}
 */
function getSign(query) {
  const urlParams = query;
  const ordered = {};
  Object.keys(urlParams).sort().forEach((key) => {
      if (key.slice(0, 3) === 'vk_') {
          ordered[key] = urlParams[key];
      }
  });
  
  const stringParams = qs.stringify(ordered);
  const paramsHash = sha256(secretKey, stringParams);

  return paramsHash;
}

/**
 * @description Создаёт рандомный ключ
 * @returns {string}
 */
function getRandomKey() {
  return Math.random().toString(36).slice(2).trim();
}


/**
 * @description Возвращает пользователя из базы данных по ID
 * @param {number} uid
 */
function getUserByID(uid) {
  return new Promise((resolve, reject) => {
    pool.execute(`SELECT * FROM users WHERE \`uid\`=${uid};`)
      .then(result => resolve(result));
  })
}

function insertTestResult(tinfo) {
  const tasksCount = tinfo.tasks_count;
  const result = tinfo.result;
  const uid = tinfo.uid;

  pool.execute(`INSERT INTO results(uid, result, tasks_count, date) VALUES ("${uid}", "${result}", "${tasksCount}", NOW());`);
}

// ====================================================



// ====================================================
// | Настройка Express-экзмепляра
// ====================================================

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use('/', bodyParser.text({ type: '*/text' }));


// ====================================================





// Публичная версия приложения (стабильная)
app.get(URI_PREFIX.concat('/vk_app'), (req, res) => {

  const signStatus = req.query.sign == getSign(req.query);
  if (!signStatus) return res.sendStatus(404);

  getUserByID(req.query.vk_user_id).then(([[user_info]]) => {
    var key;
    if (user_info == undefined) {
      fs.writeFileSync("./static/tasks-state/" + req.query.vk_user_id, new Array(206).fill(0).join(' '));
      key = insertUserIntoDB(req.query);
    } else {
      updateUser(req.query);
      key = user_info.ukey;
    }

    /**TODO */
    res.render("temp_vk_app", { dev: IS_DEV, prefix: URI_PREFIX, key, uid: req.query.vk_user_id });
  })
});


app.post(URI_PREFIX.concat('/api'), (req, res) => {
  var response = { status: true };
  const sendError = (message) => {
    response.status = false;
    response.message = message;
    res.send(JSON.stringify(response));
    res.end();
    return ;
  }

  if (!req.body.uid || isNaN(parseInt(req.body.uid))) {
    return sendError("Некорректный параметр uid");
  }
  
  getUserByID(parseInt(req.body.uid).toString()).then(result => {
    if (!result[0] || !result[0].length) {
      return sendError("Некорректный запрос");
    }

    if (crypto.createHmac('sha256', result[0][0].ukey).update(req.body.seed).digest().toString('hex') != req.body.secret) {
      return sendError("Некорректный запрос");
    }

    switch (req.body.action) {
      case 'online': {
        updateUser({ uid: req.body.uid });
        break;
      }
      case 'update-results': {
        const fname = `./static/tasks-state/${req.body.uid}`;
        var tasks = fs.readFileSync(fname).toString('utf8').split(' ').map(v => parseInt(v));
        req.body.tasks.forEach((v, i) => {
          tasks[v[0]] += v[1];
        })
        fs.writeFileSync(fname, tasks.join(' '));
        insertTestResult(req.body);
        break;
      }
      default: {
        return sendError("Не указан параметр action");
      }
    }
  
    res.send(JSON.stringify(response));
  })
});




// Запуск сервера
const server = http.createServer(app);
server.listen(PORT);