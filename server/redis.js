require('newrelic');

const express = require('express');
const parser = require('body-parser');
const compression = require('compression');
const axios = require('axios');
require('./index');

const { save, cache } = require('../database/redis');
const app = express();

app.use(compression());
app.use(parser.json());

app.set('PORT', process.env.PORT || 3000);

app.use('/:companyAbbr', express.static('public'));

app.get('/api/people-also-bought/:companyAbbr', cache, (req, res) => {
  const loadBalancerURL = '';
  return axios.get(loadBalancerURL + req.url)
    .then(({ data }) => {
      save(data);
      res.send(data);
    })
    .catch(error => res.status('400').send(error));
});

app.listen(app.get('PORT'), () => {
  console.log(`Server is connected to ${app.get('PORT')}!`);
});
