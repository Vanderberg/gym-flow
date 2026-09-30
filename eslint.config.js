const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = [
  ...expoConfig,
  { ignores: ['node_modules/', '.expo/', 'dist/', '.worktrees/', 'docs/', 'specs/'] },
  { files: ['scripts/**/*.js'], languageOptions: { globals: globals.node } },
];
