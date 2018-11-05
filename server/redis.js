require('newrelic');

const express = require('express');
const parser = require('body-parser');
const compression = require('compression');
const path = require('path');
const axios = require('axios');
const proxy = require('express-http-proxy');
const morgan = require('morgan');

const { save, cache } = require('../database/redis');
const app = express();

app.use(compression());
app.use(morgan('dev'));
app.use(parser.json());

app.set('PORT', process.env.PORT || 3000);

app.use('/:companyAbbr', express.static('public'));

const url = 'http://ec2-54-67-37-21.us-west-1.compute.amazonaws.com';

app.get('/api/people-also-bought/:abbrOrId', cache, (req, res) => {
  console.log(url + req.url);
  axios.get(url + req.url)
    .then(({ data }) => {
      console.log('---------------------', data);
      save(path.basename(req.url), JSON.stringify(data));
      res.send(data);
    })
    .catch(error => res.status('400').send(error));
});

app.use('/', proxy(url));

app.listen(app.get('PORT'), () => {
  console.log(`Server is connected to ${app.get('PORT')}!`);
});
