require('newrelic');

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

const url = ['http://ec2-107-22-16-227.compute-1.amazonaws.com'];
const index = 0;

app.use('/', (request) => {
  if (request.method === 'GET') {
    app.get('api/people-also-bought/:companyAbbr', cache, (req, res) => {
      return axios.get(url[index] + req.url)
        .then(({ data }) => {
          save(path.basename(req.url), JSON.stringify(data));
          res.send(data);
        })
        .catch(error => res.status('400').send(error));
    });
  } else {
    app.use('/', proxy(url[index]));
  }
  index = (index + 1) % url.length;
});

app.listen(app.get('PORT'), () => {
  console.log(`Server is connected to ${app.get('PORT')}!`);
});
