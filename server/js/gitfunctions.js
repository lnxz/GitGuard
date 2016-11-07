require('events')
  .EventEmitter.defaultMaxListeners = Infinity;
const HTTP = 'http://';
const HTTPS = 'https://';
const REPOS_DIR = 'repositories/';
let repoPath = REPOS_DIR + '';

const CHILD_PROCESS = require('child_process');
const executive = require('executive');
const Base64 = require('js-base64')
  .Base64;

var gitClone = (repoUrl, callback) => {
  let repoPath = REPOS_DIR + getRepoName(repoUrl);
  // start executing
  let command = CHILD_PROCESS.exec(`git clone ${repoUrl} ${repoPath}`, function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log('Error code: ' + error.code);
      console.log('Signal received: ' + error.signal);
    }
    return callback(error, stdout, repoPath);
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
    return callback(error, stdout);
  });

  command.on('exit', function (code) {
    console.log('Child process exited with exit code ' + code);
  });

}

exports.isRepoLatest = (repoUrl, callback) => {
  let command = `git pull origin master`

  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[isRepoLatest]: [gitClone]');

    if (error) {
      console.log('[isRepoLatest]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[isRepoLatest]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, data) => {
          let isLatest = data.includes('Already up-to-date.')
          return callback(isLatest);
        })
      } else {
        return callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        let isLatest = data.includes('Already up-to-date.')
        return callback(isLatest);
      })
    }
  })
}

exports.getAuthors = (repoUrl, callback) => {
  console.log('[getAuthors]');
  let command = `git --no-pager log --pretty=format:\"\\\"name\\\":\\\"%an\\\",\\\"email\\\":\\\"%ae\\\"\" | sort -u`;
  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[getAuthors]: [gitClone]');
    let json = '';
    if (error) {
      console.log('[getAuthors]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[getAuthors]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, data) => {
          let json = stringToJsonArray(data)
          return callback(error, json);
        })
      }
    } else {
      gitLog(repoPath, arguments, (error, data) => {
        json = stringToJsonArray(data);
        return callback(error, json);
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

          for (var i = 0; i < authors.length; i++) {

            //hopefull the first author isn't an empty line
            if (authors[i].length === 0) {
              break;
            }

            let command = `git log --shortstat --author="${authors[i]}" | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf "\\"name\\":\\"${authors[i]}\\",\\"additions\\":%i,\\"deletions\\":%i\\n", inserted, deleted}'`;
            commandArray.push(command);
          }

          executive.parallel(commandArray, {
            cwd: repoPath
          }, (err, stdout, stderr) => {
            if (err) {
              console.log(err)
            }

            let json = stringToJsonArray(stdout)
            return callback(error, json);
          });

        });
      }
    } else {
      console.log('[getAuthorsAdditionsDeletions]: [gitClone]: [isRepoExist true]');

      gitLog(repoPath, arguments, (error, data) => {
        let authors = data.split('\n');

        let commandArray = [];

        for (var i = 0; i < authors.length; i++) {

          //hopefull the first author isn't an empty line
          if (authors[i].length === 0) {
            break;
          }

          let command = `git log --shortstat --author="${authors[i]}" | grep -E "fil(e|es) changed" | awk '{inserted+=$4; deleted+=$6} END {printf "\\"name\\":\\"${authors[i]}\\",\\"additions\\":%i,\\"deletions\\":%i\\n", inserted, deleted}'`;
          commandArray.push(command);
        }

        executive.parallel(commandArray, {
          cwd: repoPath
        }, (err, stdout, stderr) => {
          if (err) {
            console.log(err)
          }

          let json = stringToJsonArray(stdout)
          return callback(error, json);
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
          return callback(error, json);
        })
      } else {
        return callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        let json = stringToJsonArray(data)
        return callback(error, json);
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
          return callback(error, json);
        })
      } else {
        return callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, json) => {
        // jiafeng's command already format swee swee
        return callback(error, json);
      })
    }
  })
}

exports.getCommitCount = (repoUrl, callback) => {
  console.log('[getCommitCount]');
  let command = `git --no-pager log --pretty=format:\"%ad\" --date=format:%d-%B-%y | awk \'{print $1}\' | uniq -c | awk \'{printf \"\\\"date\\\":\\\"%s\\\",\\\"commit_count\\\":\\\"%s\\\"\\n\",$2,$1}\'`
  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[getCommitCount]: [gitClone]');

    if (error) {
      console.log('[getCommitCount]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[getCommitCount]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, data) => {
          let json = stringToJsonArray(data)
          return callback(error, json);
        })
      } else {
        return callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        let json = stringToJsonArray(data)
        return callback(error, json);
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
          let json = stringToJsonArray(data)
          return callback(error, json);
        })
      } else {
        return callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        let json = stringToJsonArray(data)
        return callback(error, json);
      })
    }
  })
}

exports.getCodes = (repoUrl, branch, file, callback) => {
  console.log('[getCodes]');
  let command = `git --no-pager show ${branch}:${file}`
  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[getCodes]: [gitClone]');

    if (error) {
      console.log('[getCodes]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[getCodes]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, data) => {
          return callback(error, Base64.encode(data));
        })
      } else {
        return callback(error, ''); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        return callback(error, Base64.encode(data));
      })
    }
  })
}


exports.whosYourDaddy = (repoUrl, lineStart, lineEnd, file, callback) => {
  console.log('[whosYourDaddy]');
  let command = `git --no-pager log -L ${lineStart},${lineEnd}:${file} --date=short --pretty=format:\"\\\"commit\\\":\\\"%H\\\",\\\"author\\\":\\\"%aN\\\",\\\"date\\\":\\\"%ad\\\"\" | grep \\\"commit\\\":\\\".*`
  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[whosYourDaddy]: [gitClone]');

    if (error) {
      console.log('[whosYourDaddy]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[whosYourDaddy]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, data) => {
          if (error) {
            return callback(error, '{}')
          }
          let json = stringToJsonArray(data)
          return callback(error, json);
        })
      } else {
        return callback(error, '{}'); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        let json = stringToJsonArray(data)
        return callback(error, json);
      })
    }
  })
}

exports.getFileStats = (repoUrl, topN, callback) => {
  console.log('[getFileStats]');
  let command = `git ls-tree -r -l master | sort -n -k 4 | tail -n ${topN} | cut -d\\  -f4- | tr -s \\ | awk \'{printf \"\\\"file\\\":\\\"%s\\\",\\\"size\\\":\\\"%s\\\"\\n\",substr($0, index($0, $2)),$1}\'`
  gitClone(repoUrl, (error, data, repoPath) => {
    console.log('[whosYourDaddy]: [gitClone]');

    if (error) {
      console.log('[getFileStats]: [gitClone] [error]');
      if (isRepoExist(error)) {
        console.log('[getFileStats]: [gitClone] [error] [isRepoExist(error)]');

        executeCommand(command, repoPath, (error, data) => {
          if (error) {
            return callback(error, '{}')
          }
          let json = stringToJsonArray(data)
          return callback(error, json);
        })
      } else {
        return callback(error, '{}'); //sends nothin
      }

    } else {
      executeCommand(command, repoPath, (error, data) => {
        let json = stringToJsonArray(data)
        return callback(error, json);
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
    }
    return callback(error, stdout);
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

var codeStringToJsonArray = (string) => {

  let arrayOfData = string.split('\n');
  let json = '[';
  let double_quotes = '\"'
  let key = `${double_quotes}code${double_quotes}`
  json += `{${key}:${double_quotes}${string_escape(arrayOfData[0])}${double_quotes}}`

  for (var i = 1; i < arrayOfData.length; i++) {
    json += (',');

    // console.log(arrayOfData[i]);
    json += `{${key}:${double_quotes}${arrayOfData[i]}${double_quotes}}`;
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
    return callback(stdout);
  });

  gitblame.on('exit', function (code) {
    console.log('Child process exited with exit code ' + code);
  });
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
