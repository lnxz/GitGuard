const HTTP = 'http://';
const HTTPS = 'https://';
const REPOS_DIR = 'repositories/';
let repoPath = REPOS_DIR + '';

const spawn = require( 'child_process' )
    .spawn;
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



var cloneRepo = ( repoUrl ) => {
    const clone = spawn( 'git', [ 'clone', repoUrl, REPOS_DIR + getRepoName( repoUrl ) ], {
        stdio: [ 'inherit' ]
    } );

    clone.stdout.on( 'data', ( data ) => {
        console.log( `stdout: ${data}` );
        console.log( typeof data );
    } );

    clone.stderr.on( 'data', ( data ) => {
        console.log( `stderr: ${data}` );
    } );

    clone.on( 'close', ( code ) => {
        console.log( `child process exited with code ${code}` );
    } );

}

exports.gitBlame = ( repoUrl, callback ) => {
    var childProcess = require( 'child_process' ),
        gitblame;

    gitblame = childProcess.exec( `cd ${REPOS_DIR+getRepoName(repoUrl)} && git blame -L:"Slot" scrapy/core/engine.py`, function( error, stdout, stderr ) {
        if ( error ) {
            console.log( error.stack );
            console.log( 'Error code: ' + error.code );
            console.log( 'Signal received: ' + error.signal );
        }
        // console.log( 'Child Process STDOUT: ' + stdout );
        //console.log( 'Child Process STDERR: ' + stderr );
        callback( stdout );
    } );

    gitblame.on( 'exit', function( code ) {
        console.log( 'Child process exited with exit code ' + code );
    } );
}



var showGitLog = () => {
    exec( `cd repositories/github.com/vuejs/awesome-vue.git && git shortlog`, function( err, stdout, stderr ) {
        console.log( err );
        console.log( stdout );
        console.log( stderr );
    } );
}

var showGitBlame = () => {


}

var getRepoName = ( repoUrl ) => {
    let repoName = repoUrl;

    if ( repoName.startsWith( HTTPS, 0 ) ) {
        repoName = repoName.replace( HTTPS, '' );
    }

    if ( repoName.startsWith( HTTP, 0 ) ) {
        repoName = repoName.replace( HTTP, '' );
    }

    console.log( `repoUrl: ${repoUrl}` );
    console.log( `RepoName: ${repoName}` );

    return repoName;
}

/*this method is a hack. may fail if the library api changes its error message*/
var isRepoExist = ( reasonForFailure ) => {
    let errorMessage = reasonForFailure.toString();
    return errorMessage.includes( 'exists and is not an empty directory' );
}

// this.gitBlame( 'https://github.com/scrapy/scrapy.git' );
// cloneRepo('https://github.com/scrapy/scrapy.git');
// cloneRepo('https://github.com/vuejs/awesome-vue.git');
// showGitLog();
