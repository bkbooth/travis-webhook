var crypto = require('crypto');

/**
 * Subclass of built-in Error
 *
 * @param {string} message Message describing the error
 * @param {string} status  HTTP status code
 *
 * @constructor
 */
function HttpError(message, status) {
  this.message = message;
  this.status = status || 500;
  this.stack = new Error().stack;
}
HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.name = 'HttpError';

/**
 * Validate the incoming request Authorization header
 *
 * @param {string} authorize   Contents of the Authorization header
 * @param {string} repoSlug    GitHub repo slug (eg. username/repository)
 * @param {string} travisToken User token from Travis CI
 *
 * @returns {boolean}
 */
function validateRequestAuth(authorize, repoSlug, travisToken) {
  return authorize && repoSlug && travisToken &&
    authorize === crypto.createHash('sha256').update(repoSlug + travisToken).digest('hex');
}

module.exports = {
  HttpError: HttpError,
  validateRequestAuth: validateRequestAuth
};
