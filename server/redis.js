require('newrelic');

const express = require('express');
const parser = require('body-parser');
const compression = require('compression');
const proxy = require('express-http-proxy');

const { cache } = require('../database/redis');
const app = express();

app.use(compression());
app.use(parser.json());

app.set('PORT', process.env.PORT || 3000);

app.use('/:companyAbbr', express.static('public'));

app.use('/', cache , proxy('http://ec2-54-173-182-247.compute-1.amazonaws.com'));

app.listen(app.get('PORT'), () => {
  console.log(`Server is connected to ${app.get('PORT')}!`);
});
