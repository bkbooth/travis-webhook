var config = require('./config'),
    express = require('express'),
    app = express(),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    crypto = require('crypto');

// Configure express application
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

// Configure express route
var router = express.Router();
router.post('/', function(req, res, next) {
  if (!validRequest(req.get('Authorization'), config.repository, config.travis_token)) {
    console.log('invalid request', req.get('Authorization'), config.repository, config.travis_token);
    return res.status(401).json({ code: 401, message: 'Invalid Authorization header' });
  }
  console.log('valid reqest');
  console.log(req.body);
  return res.status(201).json({});
});

function validRequest(authorize, repoSlug, travisToken) {
  var hash = crypto.createHash('sha256').update(repoSlug + travisToken).digest('hex');
  return authorize === hash;
}

// Use express route
app.use('/', router);

module.exports = app;
