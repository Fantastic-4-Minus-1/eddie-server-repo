const redis = require('redis');
const path = require('path');

const client = redis.createClient(process.env.REDIS_PORT || 6379);

const save = (key, value) => {
  client.setex(key, 60, value);
};

const cache = (req, res, next) => {
  client.get(path.basename(req.url), (error, data) => {
    if (error) { res.status('401').send(error); }
    if (data !== null) {
      save(req.params.companyAbbr, JSON.stringify(data));
      res.send(data);
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
