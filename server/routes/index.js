var express = require('express');
var gitfunctions = require('../js/gitfunctions');
var router = express.Router();

/* GET home page. */
router.get('/getAuthors', function (req, res, next) {
  gitfunctions.getAuthors('https://github.com/scrapy/scrapy.git', (error, data) => {

    res.status(200)
      .send(data);
  });

});

module.exports = router;
