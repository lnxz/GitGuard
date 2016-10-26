const Git = require('nodegit');
const HTTP = 'http://';
const HTTPS = 'https://';
const REPOS_DIR = 'repositories/';

let additionAndDeletion = [0 , 0];
let additions = [];
let deletions = [];

var cloneRepo = (repoUrl) => {
  let repoName = getRepoName(repoUrl);
  let repoPath = REPOS_DIR + repoName;
  //useless for now
  let cloneOptions = {};
  cloneOptions.fetchOpts = {
    callbacks: {
      certificateCheck: function() { return 1; }
    }
  };

  Git.Clone(repoUrl, repoPath, cloneOptions)
        // Promises will swallow errors and not report them unless you have supplied
        // a second function to the `.then` or end the chain with either a `.catch` or
        // a `.done`
      .then((repository) => {
        openRepo(repoPath);
      })
      .catch((reasonForFailure) => {
        // You can also provide a catch function which will contain the reason why
        // any above promises that weren't handled have failed
        console.log(`catch: ${reasonForFailure}`);

        if(isRepoExist(reasonForFailure)){
          openRepo(repoPath);
        }

      });

  //     cloneRepository.catch(errorAndAttemptOpen)
  //     .then(function(repository) {
  //   // Access any repository methods here.
  //   console.log("Is the repository bare? %s", Boolean(repository.isBare()));
  // });
}

var openRepo = (repoName) => {
  console.log('yo');
  Git.Repository.open(repoName)
    .then(getMostRecentCommit)
    .then(getCommitMessage);
}
var getMostRecentCommit = (repository) => {
  return repository.getBranchCommit('master');
};

var getCommitMessage = (commit) => {
  let commitHistory = commit.history();

  commitHistory.on('commit', (commit) => {
    // Use commit
    // printCommitMessage(commit);



  });

  commitHistory.on('end', (commits) => {
    // Use commits
      // console.log(additionAndDeletion);
      // console.log(additions.length);
      // additionAndDeletion = [0 , 0];
      // additions.forEach((value) => {
      //   console.log(value);
      //   // additionAndDeletion[0] += value;
      // });
      // deletions.forEach((value) => {
      //   // additionAndDeletion[1] += value;
      // });
      // console.log(additionAndDeletion);

      commits.forEach((commit) => {
        printCommitMessage(commit);
        // getDiff(commit)
        // .then((diffs) => {
        //     return diffs[0].patches();
        //   })
        //   .then((convenientPatches) => {
        //     let stats = [];
        //     convenientPatches.forEach((patches) => {
        //       stats.push(patches.lineStats());
        //     });
        //     return stats;
        // }).then((stats)=>{
        //   let total_additions = stats.total_additions;
        //   let total_deletions = stats.total_deletions;
        //
        //   additionAndDeletion[0] += total_additions;
        //   additionAndDeletion[1] += total_deletions;
        //   console.log(additionAndDeletion);
          // additions.push(total_additions);
          // deletions.push(total_deletions);
        // });
      });



  });

  commitHistory.on('error', (error) => {
    // Use error
  });

  commitHistory.start()
};

var printCommitMessage = (commit) => {
  console.log(commit.message());
}

var getDiff = (commit) => {
  return commit.getDiff();
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
// cloneRepo('https://github.com/pixelducky/cs2106-labs.git'); //private repo
