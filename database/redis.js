const Promise = require('bluebird');
const redis = Promise.promisifyAll(require('redis'));
const path = require('path');
const model = require('../server/model');

const client = redis.createClient(process.env.REDIS_PORT || 6379);

const save = (key, value) => {
  return client.setexAsync(key, 5, value);
};

const cache = (req, res, next) => {
  return client.getAsync(path.basename(req.url))
    .then(data => {
      if (data !== null && req.method === 'GET') {
        res.send(data);
        return model.peopleAlsoBought.get(path.basename(req.url))
          .then(data => save(path.basename(req.url), JSON.stringify(data)))
          .catch(err => console.log(err.stack));
      } else {
        next();
      }
    })
    .catch(error => res.status('401').send(error));
};

module.exports = {
  save,
  cache,
};

client.on('connect', () => {
  console.log('Redis is connected!');
});
