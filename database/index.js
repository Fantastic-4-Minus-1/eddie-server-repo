const Promise = require('bluebird');

const initOptions = {
  promiseLib: Promise,
  // query(event) {
  //   console.log('QUERY:', event.query);
  // },
  error(error, event) {
    if (event.cn) {
      console.log('CN:', event.cn);
      console.log('EVENT:', error.message || error);
    }
  },
};
const pgp = require('pg-promise')(initOptions);

const cn = {
  host: 'ec2-54-145-32-83.compute-1.amazonaws.com',
  user: 'power_user',
  password: '$nopass106',
  database: 'robinhood',
};

const db = pgp(cn);

const queries = {
  getAlsoBoughtByAbbreviation: companyAbbreviation => db.any(
    `SELECT comp_a.*, prices.current_price FROM companies AS comp_a
      INNER JOIN alsobought ON comp_a.id = alsobought.alsobought_id
      INNER JOIN companies AS comp_b ON comp_b.company_abbr = '${companyAbbreviation}'
      AND comp_b.id = alsobought.company_id
      INNER JOIN prices ON alsobought.alsobought_id = prices.company_id;`,
  ),
  getAlsoBoughtById: companyId => db.any(
    `SELECT companies.*, prices.current_price FROM companies, alsobought, prices
      WHERE alsobought.company_id = ${companyId}
      AND companies.id = alsobought.alsobought_id
      AND companies.id = prices.company_id;`,
  ),
  getCompanyByAbbreviation: companyAbbreviation => db.any(
    `SELECT companies.*, alsobought.alsobought_id, prices.current_price
      FROM companies, alsobought, prices
      WHERE companies.company_abbr = '${companyAbbreviation}'
      AND alsobought.company_id = companies.id
      AND prices.company_id = companies.id`,
  ),
  getCompanyById: companyId => db.any(
    `SELECT companies.*, alsobought.alsobought_id, prices.current_price
      FROM companies, alsobought, prices
      WHERE companies.id = '${companyId}'
      AND alsobought.company_id = companies.id
      AND prices.company_id = companies.id`,
  ),
  insertCompany: ({ companyAbbr, company, percentage }) => db.any(
    `INSERT INTO companies (company_abbr, company, percentage)
      VALUES ('${companyAbbr}', '${company}', ${percentage})
      RETURNING id`,
  ),
  insertAlsoBought: (companyId, alsoBought) => Promise.all(alsoBought
    .map(alsoBoughtId => db.any(
      `INSERT INTO alsobought (company_id, alsobought_id)
        VALUES (${companyId}, ${alsoBoughtId})`,
    ))),
  insertPrices: (companyId, currentDay) => Promise.all(currentDay
    .map(({ currentPrice }) => db.any(
      `INSERT INTO prices (company_id, current_price)
        VALUES (${companyId}, ${currentPrice})`,
    ))),
  insertPrice: (companyId, currentPrice) => db.any(
    `INSERT INTO prices (company_id, current_price)
      VALUES (${companyId}, ${currentPrice})`,
  ),
  deleteCompany: companyAbbr => db.any(
    `DELETE FROM companies
      WHERE company_abbr = '${companyAbbr}'
      RETURNING id`,
  ),
  deleteAlsoBought: companyId => db.any(`DELETE FROM alsobought WHERE company_id = '${companyId}'`),
  deletePrices: companyId => db.any(`DELETE FROM prices WHERE company_id = '${companyId}'`),
};

module.exports = queries;
