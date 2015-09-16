// Travis CI webhook command runner config
// Copy to config.js

module.exports = {

  hooks: [
    {
      repository: 'username/repository',
      travis_token: 'YOUR_TRAVIS_CI_TOKEN',
      path: '/path/to/local/repository',

      // Branches to listen for pushes
      // Optional, this is the default
      branches: [
        'master'
      ],

      // Set of actions to run on a successful push
      // Optional, these are the defaults
      actions: [
        'git fetch',
        'get reset --hard origin/master'
      ]
    }
  ]

};
