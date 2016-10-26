const SimpleGit = require('simple-git')();
const HTTP = 'http://';
const HTTPS = 'https://';
const REPOS_DIR = 'repositories/';


var cloneRepo = (repoUrl) => {
  let repoPath = REPOS_DIR + getRepoName(repoUrl);
  SimpleGit.clone(repoUrl, repoPath, (error, data) => {

    if(error){
      if(isRepoExist(error)){
        SimpleGit.cwd(repoPath);
        showGitLog();
      }
      return;
    }

    SimpleGit.cwd(repoPath);
    showGitLog();
  });

}


var showGitLog = () => {
  SimpleGit.log({ },(error, data) => {
    if (!error) {
      console.log(data);
    }
  });
  // SimpleGit.log(["--pretty=format:%H %ai %s%d %aN %ae"],(error, data) => {
  //   if (!error) {
  //     console.log(data);
  //   }
  // });
}

var showGitBlame = () => {


}

var getRepoName = (repoUrl) => {
  let repoName = repoUrl;

    if(repoName.startsWith(HTTPS, 0)){
      repoName = repoName.replace(HTTPS, '');
    }

    if(repoName.startsWith(HTTP, 0)){
      repoName = repoName.replace(HTTP, '');
    }

  console.log(`repoUrl: ${repoUrl}`);
  console.log(`RepoName: ${repoName}`);

  return repoName;
}

/*this method is a hack. may fail if the library api changes its error message*/
var isRepoExist = (reasonForFailure) => {
  let errorMessage = reasonForFailure.toString();
  return errorMessage.includes('exists and is not an empty directory');
}

cloneRepo('https://github.com/scrapy/scrapy.git');
