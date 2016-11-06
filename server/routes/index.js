var express = require('express');
var gitfunctions = require('../js/gitfunctions');
var router = express.Router();

/* GET all authors */
router.get('/authors', function (req, res, next) {
  let repoUrl = req.query.repo

  // this equality check is not safe
  if (repoUrl != null) {
    gitfunctions.getAuthors(repoUrl, (error, data) => {
      res.status(200)
        .send(data);
    });

  } else {
    res.status(200)
      .send('{}');
  }
});

/* GET all authors addition deletion */
router.get('/authorsAdditionsDeletions', function (req, res, next) {
  let repoUrl = req.query.repo

  // this equality check is not safe
  if (repoUrl != null) {
    gitfunctions.getAuthorsAdditionsDeletions(repoUrl, (error, data) => {
      res.status(200)
        .send(data);
    });

  } else {
    res.status(200)
      .send('{}');
  }


});

/* GET all authors stability */
router.get('/authorsStability', function (req, res, next) {
  let repoUrl = req.query.repo

  // this equality check is not safe
  if (repoUrl != null) {
    gitfunctions.getAuthorsStability(repoUrl, (error, data) => {
      res.status(200)
        .send(data);
    });

  } else {
    res.status(200)
      .send('{}');
  }

});

/* GET all authors stability */
router.get('/commits', function (req, res, next) {
  let repoUrl = req.query.repo
  let authorName = req.query.author

  // this equality check is not safe
  if (repoUrl != null && authorName != null) {
    console.log(repoUrl)
    console.log(authorName)
    gitfunctions.getAuthorsCommits(repoUrl, authorName, (error, data) => {
      res.status(200)
        .send(data);
    });
  } else {
    res.status(200)
      .send('{}');
  }


});

module.exports = router;
