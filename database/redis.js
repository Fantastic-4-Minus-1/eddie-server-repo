const redis = require('redis');
const path = require('path');
const model = require('../server/model');

const client = redis.createClient(process.env.REDIS_PORT || 6379);

const save = (key, value) => {
  client.setex(key, 5, value);
};

const cache = (req, res, next) => {
  client.get(path.basename(req.url), (error, data) => {
    if (error) { res.status('401').send(error); }
    if (data !== null && req.method === 'GET') {
      res.send(data);
      model.peopleAlsoBought.get(req.params.abbrOrId)
        .then(data => save(path.basename(req.url), data))
        .catch(err => console.log(err.stack));
    } else {
      next();
    }
  });
};

module.exports = {
  save,
  cache,
};

client.on('connect', () => {
  console.log('Redis is connected!');
});
