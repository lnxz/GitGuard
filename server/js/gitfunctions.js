const HTTP = 'http://';
const HTTPS = 'https://';
const REPOS_DIR = 'repositories/';
let repoPath = REPOS_DIR + '';

const CHILD_PROCESS = require('child_process');
const execSeries = require('exec-series');
const executive = require('executive');

// const shortlog = spawn('git', ['shortlog', '-n'], { stdio: ['inherit'] });
//
// ls.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
//   console.log(typeof data);
// });
//
// ls.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`);
// });
//
// ls.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });



var gitClone = (repoUrl, callback) => {
  let repoPath = REPOS_DIR + getRepoName(repoUrl);
  // start executing
  let command = CHILD_PROCESS.exec(`git clone ${repoUrl} ${repoPath}`, function (error, stdout, stderr) {
    if (error) {
      // console.log(error.stack);
      // console.log('Error code: ' + error.code);
      // console.log('Signal received: ' + error.signal);
    }
    callback(error, stdout, repoPath);
  });

  command.on('exit', function (code) {
    console.log('Child process exited with exit code ' + code);
  });

}

var gitLog = (repoPath, arguments, callback) => {
  // start executing
  let command = CHILD_PROCESS.exec(`cd ${repoPath} && git log ${arguments}`, function (error, stdout, stderr) {
    if (error) {
      // console.log(error.stack);
      // console.log('Error code: ' + error.code);
      // console.log('Signal received: ' + error.signal);
    }
    // success case
    callback(error, stdout);
  });

  command.on('exit', function (code) {
    console.log('Child process exited with exit code ' + code);
  });

}

//git log --shortstat --author="Bevin" | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {print "additions: ", inserted, "deletions: ", deleted }'
//With a given author name, return me a json obj in this format {name: "name1", additions:"40", deletions:"30"}
//insert into data.members array

// var data = {
//   "members": [
//     {name: "name1", additions:"40", deletions:"30"},
//     {name: "name2", additions:"30", deletions:"20"},
//     {name: "name3", additions:"20", deletions:"30"},
//     {name: "name4", additions:"30", deletions:"60"},
//     {name: "name5", additions:"40", deletions:"40"},
//     {name: "name6", additions:"10", deletions:"20"},
//     {name: "name7", additions:"30", deletions:"40"}
//   ]
// };



exports.getAuthors = (repoUrl, callback) => {
  console.log('[getAuthors]');
  let arguments = "--format='%aN' | sort -u";
  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[getAuthors]: [gitClone]');
    let json = '';
    if (error) {
      console.log('[getAuthors]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[getAuthors]: [gitClone] [error] [isRepoExist(error)]');
        gitLog(repoPath, arguments, (error, data) => {
          json = stringToJsonArray(data);
        });
      }
    } else {
      gitLog(repoPath, arguments, (error, data) => {
        json = stringToJsonArray(data);
      });
    }

    callback(error, json);

  });
}

exports.getAuthorsAdditionsDeletions = (repoUrl, callback) => {
  console.log('[getAuthorsAdditionsDeletions');
  let arguments = "--format='%aN' | sort -u";
  let json = '[';

  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[getAuthorsAdditionsDeletions]: [gitClone]');

    if (error) {

      if (isRepoExist(error)) {

        gitLog(repoPath, arguments, (error, data) => {
          let authors = data.split('\n');
          let commandArray = [];

          for (var i = 0; i < authors.length; i++) {

            //hopefull the first author isn't an empty line
            if (authors[i].length === 0) {
              break;
            }

            let command = `git log --shortstat --author="${authors[i]}" | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf "\\"additions\\":%s,\\"deletions\\":%s\\n", inserted, deleted}'`;
            console.log(command);
            commandArray.push(command);
          }

          executive.quiet(commandArray, (err, stdout, stderr) => {
            if (err) {
              throw err;
            }

            console.log(stdout);
            // for (var stats of stdouts) {
            //   console.log(stats);
            // }

          });
          // execSeries(commandArray, (err, stdouts, stderrs) => {
          //   if (err) {
          //     throw err;
          //   }
          //
          //
          //   for (var stats of stdouts) {
          //     console.log(stats);
          //   }
          //
          // });

        });
      }
    } else {
      console.log('[getAuthorsAdditionsDeletions]: [gitClone]: [isRepoExist true]');

      gitLog(repoPath, arguments, (error, data) => {
        let authors = data.split('\n');

        for (var i = 0; i < authors.length; i++) {
          arguments = `--shortstat --author='${authors[i]}' | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {print "additions: ", inserted, "deletions: ", deleted }'`;
          console.log(arguments);
          //hopefull the first author isn't an empty line
          if (authors[i].length === 0) {
            break;
          }

          if (i) { //only append when it is not the first. hacky yet genius. credits to SO
            json += (',');
          }

          gitLog(repoPath, arguments, (error, data) => {
            json += `{name:${authors[i]} , ${data}}`;
          });
        }

        json += ']';
      });
    }
    console.log(json);
    callback(error, json);

  });
}


/*only accept \n delimited string*/
var stringToJsonArray = (string) => {
  let arrayOfData = string.split('\n');
  let json = '[';
  for (var i = 0; i < arrayOfData.length; i++) {

    //if every stdout produce a trailing empty line, then this equality check would have to stay
    if (arrayOfData[i].length === 0) {
      break;
    }

    if (i) { //only append when it is not the first. hacky yet genius. credits to SO
      json += (',');
    }

    console.log(arrayOfData[i]);
    json += `{${arrayOfData[i]}}`;
  }
  json += ']';
  return json;
}



exports.gitBlame = (repoUrl, callback) => {
  var childProcess = require('child_process'),
    gitblame;

  gitblame = childProcess.exec(`cd ${REPOS_DIR+getRepoName(repoUrl)} && git blame -L:"Slot" scrapy/core/engine.py`, function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log('Error code: ' + error.code);
      console.log('Signal received: ' + error.signal);
    }
    // console.log( 'Child Process STDOUT: ' + stdout );
    //console.log( 'Child Process STDERR: ' + stderr );
    callback(stdout);
  });

  gitblame.on('exit', function (code) {
    console.log('Child process exited with exit code ' + code);
  });
}



var showGitLog = () => {
  exec(`cd repositories/github.com/vuejs/awesome-vue.git && git shortlog`, function (err, stdout, stderr) {
    console.log(err);
    console.log(stdout);
    console.log(stderr);
  });
}

var showGitBlame = () => {


}

var getRepoName = (repoUrl) => {
  let repoName = repoUrl;

  if (repoName.startsWith(HTTPS, 0)) {
    repoName = repoName.replace(HTTPS, '');
  }

  if (repoName.startsWith(HTTP, 0)) {
    repoName = repoName.replace(HTTP, '');
  }

  console.log(`repoUrl: ${repoUrl}`);
  console.log(`RepoName: ${repoName}`);

  return repoName;
}

// TODO: create a few more helper functions to determine download failure

/*this method is a hack. may fail if the library api changes its error message*/
var isRepoExist = (reasonForFailure) => {
  let errorMessage = reasonForFailure.toString();
  return errorMessage.includes('exists and is not an empty directory');
}

// this.gitBlame( 'https://github.com/scrapy/scrapy.git' );
// cloneRepo('https://github.com/scrapy/scrapy.git');
// cloneRepo('https://github.com/vuejs/awesome-vue.git');
// showGitLog();
