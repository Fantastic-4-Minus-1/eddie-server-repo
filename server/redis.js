// require('newrelic');

const express = require('express');
const parser = require('body-parser');
const compression = require('compression');
const axios = require('axios');
const proxy = require('express-http-proxy');
const path = require('path');

const { save, cache } = require('../database/redis');
const app = express();

app.use(compression());
app.use(parser.json());

app.set('PORT', process.env.PORT || 3000);

app.use('/:companyAbbr', express.static('public'));

const url = [
  'http://ec2-107-22-16-227.compute-1.amazonaws.com',
  'http://ec2-34-239-45-224.compute-1.amazonaws.com',
];
let index = 0;

app.use('/', cache ,(req, res, next) => {
  if (req.method === 'GET') {
    index = (index + 1) % url.length;
    return axios.get(url[index] + req.url)
      .then(({ data }) => {
        console.log('SEND')
        save(path.basename(req.url), JSON.stringify(data));
        res.json(data);
      })
      .catch(error => res.status('400').send(error));
  } else {
    index = (index + 1) % url.length;
    next();
  }
}, proxy(url[index]));

app.listen(app.get('PORT'), () => {
  console.log(`Server is connected to ${app.get('PORT')}!`);
});
