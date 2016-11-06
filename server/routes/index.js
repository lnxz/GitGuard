var express = require('express');
var gitfunctions = require('../js/gitfunctions');
var router = express.Router();

var validUrl = require('valid-url');
var nodeUrl = require('url')

const NodeCache = require("node-cache");
const myCache = new NodeCache();

/* GET all authors */
router.get('/authors', function (req, res, next) {
  let repoUrl = req.query.repo

  if (repoUrl == null) {
    res.status(200)
      .send('{}');
    return;
  }

  // this equality check may not be enough. not too sure if there's a need to sanitize
  if (isValidUrl(repoUrl)) {

    gitfunctions.isRepoLatest(repoUrl, (isLatest) => {
      if (!isLatest) {
        console.log('[isNOTLatest]')
        gitfunctions.getAuthors(repoUrl, (error, data) => {
          myCache.set(req.url, data)
          res.status(200)
            .send(data);
          return;
        });
      }

      console.log('[isLatest]')
      let data = myCache.get(req.url)

      if (data == null){
        console.log('[isLatest]: [cache is empty]')
        gitfunctions.getAuthors(repoUrl, (error, data) => {
          myCache.set(req.url, data)
          console.log(req.url)
          console.log(myCache.keys())
          res.status(200)
            .send(data);
        });
      } else {
        console.log('[isLatest]: [cache is NOT empty]')
        res.status(200)
          .send(data);
      }

    })
  } else {
    res.status(200)
      .send('{}');
  }

});

/* GET all authors addition deletion */
router.get('/authorsAdditionsDeletions', function (req, res, next) {
  let repoUrl = req.query.repo

  if (repoUrl == null) {
    res.status(200)
      .send('{}');
    return;
  }

  // this equality check is not safe
  if (isValidUrl(repoUrl)) {
    gitfunctions.isRepoLatest(repoUrl, (isLatest) => {
      if (!isLatest) {
        console.log('[isNOTLatest]')
        gitfunctions.getAuthorsAdditionsDeletions(repoUrl, (error, data) => {
          myCache.set(req.url, data)
          res.status(200)
            .send(data);
          return;
        });
      }

      console.log('[isLatest]')
      let data = myCache.get(req.url)

      if (data == null){
        console.log('[isLatest]: [cache is empty]')
        gitfunctions.getAuthorsAdditionsDeletions(repoUrl, (error, data) => {
          myCache.set(req.url, data)
          console.log(req.url)
          console.log(myCache.keys())
          res.status(200)
            .send(data);
        });
      } else {
        console.log('[isLatest]: [cache is NOT empty]')
        res.status(200)
          .send(data);
      }

    })
  } else {
    res.status(200)
      .send('{}');
  }


});

/* GET all authors stability */
router.get('/authorsStability', function (req, res, next) {
  let repoUrl = req.query.repo

  if (repoUrl == null) {
    res.status(200)
      .send('{}');
    return;
  }

  // this equality check is not safe
  if (isValidUrl(repoUrl)) {
  
    gitfunctions.isRepoLatest(repoUrl, (isLatest) => {
      if (!isLatest) {
        console.log('[isNOTLatest]')
        gitfunctions.getAuthorsStability(repoUrl, (error, data) => {
          myCache.set(req.url, data)
          res.status(200)
            .send(data);
          return;
        });
      }

      console.log('[isLatest]')
      let data = myCache.get(req.url)

      if (data == null){
        console.log('[isLatest]: [cache is empty]')
        gitfunctions.getAuthorsStability(repoUrl, (error, data) => {
          myCache.set(req.url, data)
          console.log(req.url)
          console.log(myCache.keys())
          res.status(200)
            .send(data);
        });
      } else {
        console.log('[isLatest]: [cache is NOT empty]')
        res.status(200)
          .send(data);
      }

    })

  } else {
    res.status(200)
      .send('{}');
  }

});

/* GET all authors stability */
router.get('/commits', function (req, res, next) {
  let repoUrl = req.query.repo
  let authorName = req.query.author

  if (repoUrl == null || authorName == null) {
    res.status(200)
      .send('{}');
    return;
  }

  // this equality check is not safe
  if (isValidUrl(repoUrl)) {
    gitfunctions.getAuthorsCommits(repoUrl, authorName, (error, data) => {
      res.status(200)
        .send(data);
    });
  } else {
    res.status(200)
      .send('{}');
  }


});

router.get('/files', function (req, res, next) {
  let repoUrl = req.query.repo

  if (repoUrl == null) {
    res.status(200)
      .send('{}');
    return;
  }

  // this equality check is not safe
  if (isValidUrl(repoUrl)) {
    gitfunctions.getRepoFiles(repoUrl, (error, data) => {
      res.status(200)
        .send(data);
    });
  } else {
    res.status(200)
      .send('{}');
  }
});

router.get('/codes', function (req, res, next) {
  let repoUrl = req.query.repo
  let repoBranch = req.query.branch
  let repoFile = req.query.file

  if (repoUrl == null || repoBranch == null || repoFile == null) {
    res.status(200)
      .send('{}');
    return;
  }

  // this equality check is not safe
  if (isValidUrl(repoUrl)) {
    gitfunctions.getCodes(repoUrl, repoBranch, repoFile, (error, data) => {
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
