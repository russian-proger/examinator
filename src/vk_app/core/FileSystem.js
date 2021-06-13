export default function FileSystem() {
  var cache = new Object();

  /**
   * 
   * @param {string} url 
   * @param {*} value 
   */
  this.keep = (url, value) => {
    cache[url] = value;
  }

  this.has = (url) => {
    return cache.hasOwnProperty(url);
  }

  this.getFromCache = (key) => cache[key];

  /**
   * 
   * @param {string} url path to file
   * @param {Boolean} toCache file will be cached if `toCache` is true
   */
  this.loadFromURL = (url, json = false, fromCache=true, toCache=true) => {
    return new Promise((resolve, reject) => {
      // Смотрим, хранится ли файл в кэше и возвращаем его в случае `fromCache`
      if (fromCache && cache.hasOwnProperty(url)) {
        resolve(cache[url]);
      } else {
        // Запрашиваем файл по `url`-адресу
        fetch(url).then(response => {
          if (!response.ok) {
            // Файл не удалось получить
            console.warn(`The file (${ url }) wasn't loaded`);
            reject("The file doesn't exists");
          
          } else {
            // Файл был получен успешно
            const handler = (text) => {
    
              // Загоняем файл в кэш
              if (toCache) cache[url] = text;
  
              resolve(text);
            };
            if (json) {
              response.json().then(handler);
            } else {
              response.text().then(handler);
            }
          }
        }).catch(reason => {
          // Файл не удалось получить
          console.warn(reason);
          resolve(null);
        });
      }
    });
  }
}