var express = require( 'express' );
var gitfunctions = require( '../js/gitfunctions' );
var router = express.Router();

/* GET home page. */
router.get( '/gitblame', function( req, res, next ) {
    gitfunctions.gitBlame( 'https://github.com/scrapy/scrapy.git', ( result ) => {
        res.status( 200 )
            .send( result );
    } );

} );

module.exports = router;
