const redis = require('redis');
const path = require('path');

const client = redis.createClient(process.env.REDIS_PORT || 6379);

const cache = (req, res, next) => {
  client.get(path.basename(req.url), (error, data) => {
    if (error) { res.status('401').send(error); }
    if (data !== null) {
      res.send(data);
    } else {
      next();
    }
  });
};

module.exports = {
  client,
  cache,
};

client.on('connect', () => {
  console.log('Redis is connected!');
});
