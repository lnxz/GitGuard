var express = require('express');
var gitfunctions = require('../js/gitfunctions');
var router = express.Router();

/* GET all authors */
router.get('/authors', function (req, res, next) {
  gitfunctions.getAuthors('https://github.com/scrapy/scrapy.git', (error, data) => {

    res.status(200)
      .send(data);
  });

});

/* GET all authors addition deletion */
router.get('/authorsAdditionsDeletions', function (req, res, next) {
  gitfunctions.getAuthorsAdditionsDeletions('https://github.com/scrapy/scrapy.git', (error, data) => {

    res.status(200)
      .send(data);
  });

});

/* GET all authors addition deletion */
router.get('/authorsStability', function (req, res, next) {
  gitfunctions.getAuthorsStability('https://github.com/scrapy/scrapy.git', (error, data) => {

    res.status(200)
      .send(data);
  });

});

module.exports = router;
