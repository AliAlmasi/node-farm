'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');

const replaceTemplate = require('./modules/replaceTemplate');

const responseHeaders = {
  'content-type': 'text/html',
};

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const temp404 = fs.readFileSync(
  `${__dirname}/templates/template-404.html`,
  'utf-8'
);
const css = fs.readFileSync(`${__dirname}/styles/style.css`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const server = http.createServer((request, response) => {
  const { query, pathname } = url.parse(request.url.toLowerCase(), true);

  if (pathname == '/overview' || pathname == '/') {
    response.writeHead(200, responseHeaders);
    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);
    response.end(output);
  } else if (pathname == '/product') {
    if (query.id >= dataObj.length) {
      response.writeHead(404, responseHeaders);
      const output = temp404.replace(/{%PAGE%}/g, request.url.toLowerCase());
      response.end(output);
    } else {
      response.writeHead(200, responseHeaders);
      const product = dataObj[query.id];
      const output = replaceTemplate(tempProduct, product);
      response.end(output);
    }
  } else if (pathname == '/api') {
    response.writeHead(200, { 'content-type': 'application/json' });
    if (query.id) response.end(JSON.stringify(dataObj[query.id]));
    else response.end(data);
  } else if (pathname == '/style.css') {
    response.writeHead(200, { 'content-type': 'text/css' });
    response.end(css);
  } else {
    response.writeHead(404, responseHeaders);
    const output = temp404.replace(/{%PAGE%}/g, pathname);
    response.end(output);
  }
});

server.listen(4000, '0.0.0.0', () =>
  console.log('Listening to requests on port 4000\n\thttp://localhost:4000')
);
