var config = require('./config'),
    express = require('express'),
    app = express(),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    _ = require('lodash'),
    async = require('async'),
    exec = require('child_process').exec;

var HttpError = require('./utils').HttpError,
    validateRequestAuth = require('./utils').validateRequestAuth;

// Configure express application
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

// Setup a route for each hook
var router = express.Router();
_.each(config.hooks, function(hook) {
  router.post('/' + hook.repository, function(req, res, next) {
    if (!validateRequestAuth(req.get('Authorization'), hook.repository, hook.travis_token)) {
      return next(new HttpError('Invalid Authorization header', 401));
    }

    // Attempt to parse the JSON
    try {
      var payload = JSON.parse(req.body.payload);
    } catch (err) {
      return next(new HttpError(err.message || 'Failed parsing JSON', 400));
    }

    // Did the build pass and do we care about this branch?
    var branches = _.has(hook, 'branches') && _.isArray(hook.branches) ? hook.branches : ['master'];
    if (payload.status !== 0 || branches.indexOf(payload.branch) === -1) {
      // Build failed or invalid branch, return with no effect
      res.status(204).send();
    }

    // Get actions from hook or use defaults
    var actions = _.has(hook, 'actions') && _.isArray(hook.actions) ? hook.actions : [
      'git fetch',
      'get reset --hard origin/master'
    ];

    // Run each of the actions in series
    async.series(
      _.map(actions, function(action) {
        return function(done) {
          exec(action, { cwd: hook.path }, function(err) {
            if (err) { return done(err); }

            done(null);
          });
        };
      }),
      function(err) {
        if (err) {
          return next(new HttpError(err.message || 'Failed running actions', 400));
        }

        // All actions completed
        res.status(204).send();
      }
    );
  });
});

// Use express router
app.use('/', router);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(new HttpError('Not Found', 404));
});

// Response handler
app.use(function(err, req, res, next) {
  // Send error code and message
  res.status(err.status || 400).json({
    code: err.status || 400,
    message: err.message,
    stack: app.get('env') === 'development' ? err.stack : {}
  });
});

module.exports = app;
