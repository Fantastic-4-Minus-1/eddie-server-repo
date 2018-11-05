const queries = require('../database');

const model = {
  peopleAlsoBought: {
    get: (abbrevationOrId) => {
      const getAlsoBought = Number.isNaN(Number(abbrevationOrId))
        ? 'getAlsoBoughtByAbbreviation'
        : 'getAlsoBoughtById';
      return queries[getAlsoBought](abbrevationOrId)
        .then((data) => {
          const numOfPricePerEntry = data.length / 12;
          const companies = data
            .filter((_company, idx) => idx % numOfPricePerEntry === 0)
            .map(company => ({
              id: company.id,
              companyAbbr: company.company_abbr,
              company: company.company,
              percentage: company.percentage,
            }));
          const prices = data.map(company => ({
            currentPrice: company.current_price.slice(1),
          }));
          for (let i = 0; i < 12; i += 1) {
            companies[i].currentDay = prices
              .slice(numOfPricePerEntry * i, numOfPricePerEntry * (i + 1));
          }
          return companies;
        });
    },
  },
  company: {
    get: companyAbbreviation => queries.getCompanyByAbbreviation(companyAbbreviation)
      .then((data) => {
        const company = data[0];
        const alsoBought = data
          .filter((_company, idx) => idx % (data.length / 12) === 0)
          .map(entry => entry.alsobought_id);
        const currentDay = data
          .filter((_company, idx) => idx % 12 === 0)
          .map(entry => ({
            currentPrice: entry.current_price.slice(1),
          }));
        return Object.assign(company, { alsoBought }, { currentDay });
      }),
    post: body => queries.insertCompany(body)
      .then((data) => {
        const insert = [
          queries.insertAlsoBought(data[0].id, body.alsoBought),
          queries.insertPrices(data[0].id, body.currentDay),
        ];
        return Promise.all(insert);
      }),
    put: () => {},
    delete: companyAbbr => queries.deleteCompany(companyAbbr)
      .then((data) => {
        console.log(data[0].id);
        const remove = [
          queries.deleteAlsoBought(data[0].id),
          queries.deletePrices(data[0].id),
        ];
        return Promise.all(remove);
      }),
    prices: {
      post: (companyId, body) => queries.insertPrice(companyId, body.currentPrice),
      delete: companyId => queries.deletePrices(companyId),
    },
  },
};

module.exports = model;
