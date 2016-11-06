const HTTP = 'http://';
const HTTPS = 'https://';
const REPOS_DIR = 'repositories/';
let repoPath = REPOS_DIR + '';

const CHILD_PROCESS = require('child_process');
const executive = require('executive');

// turn off limits by default (BE CAREFUL)
require('events')
  .EventEmitter.prototype._maxListeners = 1000;

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
          callback(error, json);
        });
      }
    } else {
      gitLog(repoPath, arguments, (error, data) => {
        json = stringToJsonArray(data);
        callback(error, json);
      });
    }
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
          // commandArray.push(`cd ${repoPath}`) //need to get into the repo first

          for (var i = 0; i < authors.length; i++) {

            //hopefull the first author isn't an empty line
            if (authors[i].length === 0) {
              break;
            }
            // if (i) {
            //   command += '&&'
            // }
            // command += `git log --shortstat --author="${authors[i]}" | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf ""additions":%s,"deletions":%s\\n", inserted, deleted}'`;

            let command = `git log --shortstat --author="${authors[i]}" | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf "\\"name\\":\\"${authors[i]}\\",\\"additions\\":%i,\\"deletions\\":%i\\n", inserted, deleted}'`;
            commandArray.push(command);
          }


          // // console.log(commandArray);
          executive.parallel(commandArray, {
            cwd: repoPath
          }, (err, stdout, stderr) => {
            if (err) {
              console.log(err)
              throw err;
            }

            // console.log(stdout);
            // let stats = stdout.split('\n')


            let json = stringToJsonArray(stdout)
            callback(error, json);


          });

        });
      }
    } else {
      console.log('[getAuthorsAdditionsDeletions]: [gitClone]: [isRepoExist true]');

      gitLog(repoPath, arguments, (error, data) => {
        let authors = data.split('\n');

        let commandArray = [];
        // commandArray.push(`cd ${repoPath}`) //need to get into the repo first

        for (var i = 0; i < authors.length; i++) {

          //hopefull the first author isn't an empty line
          if (authors[i].length === 0) {
            break;
          }
          // if (i) {
          //   command += '&&'
          // }
          // command += `git log --shortstat --author="${authors[i]}" | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf ""additions":%s,"deletions":%s\\n", inserted, deleted}'`;

          let command = `git log --shortstat --author="${authors[i]}" | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf "\\"name\\":\\"${authors[i]}\\",\\"additions\\":%i,\\"deletions\\":%i\\n", inserted, deleted}'`;
          commandArray.push(command);
        }

        executive.parallel(commandArray, {
          cwd: repoPath
        }, (err, stdout, stderr) => {
          if (err) {
            console.log(err)
            throw err;
          }

          let json = stringToJsonArray(stdout)
          callback(error, json);

        });
      });
    }
  });
}

exports.getAuthorsStability = (repoUrl, callback) => {
  console.log('[getAuthorsStability]');
  let command = ` git ls-files -z | xargs -0n1 git blame -w | perl -n -e '/^.*?\\((.*?)\\s+[\\d]{4}/; print $1,"\\n"' | sort -f | uniq -c | sort -n | awk '{ printf "\\"lines\\":\\"%s\\",\\"name\\":\\"%s\\"\\n", $1, $2}'`

  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[getAuthorsStability]: [gitClone]');

    if (error) {
      console.log('[getAuthorsStability]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[getAuthorsStability]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, data) => {
          let json = stringToJsonArray(data)
          callback(error, json);
        })
      } else {
        callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        let json = stringToJsonArray(data)
        callback(error, json);
      })
    }
  })
}

exports.getAuthorsCommits = (repoUrl, authorName, callback) => {
  console.log('[getAuthorsCommits]');
  let command = ` git --no-pager log --author=${authorName} --date=short  --pretty=format:\'{%n  111555commit666222: 111555%H666222,%n  111555author666222: 111555%an <%ae>666222,%n  111555date666222: 111555%ad666222},\'     $@ | sed \'s\/\"\/\\\\\"\/g\' |  sed \'s\/111555\/\"\/g\' | sed \'s\/666222\/\"\/g\' | perl -pe \'BEGIN{print \"[\"}; END{print \"]\\n\"}\' | perl -pe \'s\/},]\/}]\/\'\r\n`

  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[getAuthorsCommits]: [gitClone]');

    if (error) {
      console.log('[getAuthorsCommits]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[getAuthorsCommits]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, json) => {
          // jiafeng's command already format swee swee
          callback(error, json);
        })
      } else {
        callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, json) => {
        // jiafeng's command already format swee swee
        callback(error, json);
      })
    }
  })
}

exports.getRepoFiles = (repoUrl, callback) => {
  console.log('[getRepoFiles]');
  let command = `git ls-files | awk \'{ printf \"\\\"file\\\":\\\"%s\\\"\\n\", $0}\'`
  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[getRepoFiles]: [gitClone]');

    if (error) {
      console.log('[getRepoFiles]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[getRepoFiles]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, data) => {
          // jiafeng's command already format swee swee
          let json = stringToJsonArray(data)
          callback(error, json);
        })
      } else {
        callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        // jiafeng's command already format swee swee
        let json = stringToJsonArray(data)
        callback(error, json);
      })
    }
  })
}


var executeCommand = (command, repoPath, callback) => {
  console.log(`[executeCommand]: ${command}`)
  executive.quiet(command, {
    cwd: repoPath
  }, (error, stdout, stderr) => {
    if (error) {
      console.log(error)
      throw error;
    }
    callback(error, stdout);
  })
}

/*only accept \n delimited string*/
var stringToJsonArray = (string) => {
  let arrayOfData = string.split('\n');
  let json = '[';
  json += `{${arrayOfData[0]}}`

  for (var i = 1; i < arrayOfData.length; i++) {

    //if every stdout produce a trailing empty line, then this equality check would have to stay
    if (arrayOfData[i].length === 0) {
      break;
    }

    json += (',');

    // console.log(arrayOfData[i]);
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
