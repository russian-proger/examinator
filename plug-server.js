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

// Режим разработки
const IS_DEV = true;

// ID пользователей, для которых доступна скидочная цена
const DISCOUNT_IDS = [194530200, 248107510, 461383565, 384384993, 590926986];

// Кодовые названия предметов
const subjects = ['evm', 'int', 'inf'];

/**
 * Необходимая цена и цена со скидкой
 */
const REQUIRED_SUM = 300 * 1000 * (IS_DEV ? 1 : 1);
const DISCOUNT_SUM = 150 * 1000;

/**
 * @description Прокси-префикс URI-ардеса
 */
const URI_PREFIX = "";

/**
 * @description Основной порт
 */
const PORT = 10002;

if (!fs.existsSync("config.json")) {
  console.error("Cannot find file named \"config.json\"");
}

if (!fs.existsSync("./static/tasks-state/")) {
  fs.mkdirSync("./static/tasks-state/", { recursive: true });
  console.warn("Created folder ./static/tasks-state");
}

const Config = JSON.parse(fs.readFileSync("config.json"));

/**
 * @description Секретный ключ. Используется для проверки подписи
 */
const secretKey = Config.vk.secret_key;

/**
 * @description Ключ доступа. Используется для VK API
 */
const accessKey = Config.vk.access_key;

/**
 * @description Единственный экземпляр фреймворка express
 */
const app = express();

/**
 * @description Единственный экземпляр для работы с БД
 */
const pool = mysql.createPool({
  connectionLimit: 5,
  host: Config.mysql.host,
  user: Config.mysql.user,
  database: Config.mysql.database,
  password: Config.mysql.password
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
  const balance = (isDiscountID(uid) ? DISCOUNT_SUM : REQUIRED_SUM);
  
  makeVKAPIQuery("users.get", { user_ids: uid }).then(result => {
    try {
      const response = JSON.parse(result).response[0];
      first_name = response.first_name;
      last_name = response.last_name;
    } catch(e) {
      console.log(e);
    }

    pool.execute(`INSERT INTO users(uid, first_name, last_name, last_seen, lang, platform, ref, favorite, ukey, balance) VALUES (\
      "${uid}", "${first_name}", "${last_name}", NOW(), "${lang}", "${platform}", "${ref}", ${favorite}, "${key}", ${balance}\
    );`);
  });

  return key;
}

/**
 * Обновляет информацию пользователя в БД
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
 * Создаёт хэш
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
 * @description скидку для пользователя
 * @param {Number} id ID пользователя
 * @returns {Boolean}
 */
function isDiscountID(id) {
  return DISCOUNT_IDS.indexOf(parseInt(id)) != -1;
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

/**
 * @description Проверяет папку skills в cache
 */
function checkSkills() {
  if (!fs.existsSync('./cache/skills')) fs.mkdirSync('./cache/skills');
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
app.use('/modules', expressStaticGzip(__dirname.concat('/node_modules')));
app.use('/tests', expressStaticGzip(__dirname.concat('/cache/tests')));

// Включаем парсер body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use('/', bodyParser.text({ type: '*/text' }));


// ====================================================





// Публичная версия приложения (стабильная)
app.get('/', (req, res) => {res.sendStatus(200)});
app.get(URI_PREFIX.concat('/vk_app'), (req, res) => {
  const signStatus = req.query.sign == getSign(req.query);
  if (!signStatus) return res.sendStatus(404);

  getUserByID(req.query.vk_user_id).then(([[user_info]]) => {
    var key;
    if (user_info == undefined) {
      key = insertUserIntoDB(req.query);
    } else {
      updateUser(req.query);
      key = user_info.ukey;
    }

    let balance = isDiscountID(req.query.vk_user_id) ? DISCOUNT_SUM : REQUIRED_SUM;
    if (user_info != undefined) {
      balance = user_info.balance;
    }

    /**TODO */
    if (user_info == undefined || user_info.balance > 1000) {
      res.render("welcome", { prefix: URI_PREFIX, key, uid: req.query.vk_user_id, money: balance });
    } else if (user_info.balance <= 1000) {
      res.render("plug", { dev: IS_DEV, prefix: URI_PREFIX, key, uid: req.query.vk_user_id });
    }
  })
});

/**
 * Обработка оплаты
 */
app.post('/callback', (req, res) => {
  if (req.body.type == "vkpay_transaction") {
    pool.execute(`UPDATE users SET balance = balance - ${ req.body.object.amount } WHERE uid=${ req.body.object.from_id };`);
  }
  res.sendStatus(200);
})

const statsCache = new Object();


/**
 * Обработка API
 */
 app.post(URI_PREFIX.concat('/api'), async (req, res) => {
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
  
  const result = await getUserByID(parseInt(req.body.uid).toString());
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

    case 'is-paid': {
      let [[info]] = await pool.execute(`SELECT \`balance\` FROM \`users\` WHERE \`uid\`=${ req.body.uid }`);
      response.status = true;
      response.result = info.balance <= 1000;
      break;
    }

    default: {
      return sendError("Не указан параметр action");
    }
  }

  res.send(JSON.stringify(response));
});

if (IS_DEV) {
  for (let i = 0; i < 10; ++i) {
    console.log("SERVER IS WORKING IN DEV MODE!!!!!!!!!!!!!!!!!!!!!!!!!!");
  }
}

// Запуск сервера
const server = http.createServer(app);
server.listen(PORT);
console.log(`Server is started at port ${ PORT }`)