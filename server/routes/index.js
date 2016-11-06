var express = require('express');
var gitfunctions = require('../js/gitfunctions');
var router = express.Router();

var validUrl = require('valid-url');
var nodeUrl = require('url')

/* GET all authors */
router.get('/authors', function (req, res, next) {
  let repoUrl = req.query.repo

  // this equality check may not be enough. not too sure if there's a need to sanitize
  if (isValidUrl(repoUrl)) {
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
  if (isValidUrl(repoUrl)) {
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
  if (isValidUrl(repoUrl)) {
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
  if (isValidUrl(repoUrl) && authorName != null) {
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

var isValidUrl = (url) => {
  let urlObject = nodeUrl.parse(url)
  let hostname = urlObject.host
  let pathname = urlObject.pathname
  console.log(`[Checking repo URL]: ${hostname} ${pathname}`)

  return validUrl.isUri(url) && hostname != null && pathname != null
}

module.exports = router;
