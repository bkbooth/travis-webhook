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
    return res.status(401).json({ code: 401, message: 'Invalid Authorization header' });
  }

  try {
    var payload = JSON.parse(req.body.payload);
  } catch(error) {
    console.log('Failed parsing JSON. ' + error.message);
    return res.status(400).json({ code: 400, message: 'Failed parsing JSON.' });
  }

  if (payload.status === 0 && payload.branch === 'master') {
    console.log('Let\'s do something crazy, like pulling the latest version...');
  } else {
    console.log(payload);
  }

  return res.status(204).json({});
});

function validRequest(authorize, repoSlug, travisToken) {
  var hash = crypto.createHash('sha256').update(repoSlug + travisToken).digest('hex');
  return authorize === hash;
}

// Use express route
app.use('/', router);

module.exports = app;
