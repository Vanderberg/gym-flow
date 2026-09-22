module.exports = {
  preset: 'jest-expo',
  // testRegex (e não testMatch): o caminho do worktree contém ".worktrees", ignorado por globs.
  testRegex: '/tests/.*\\.test\\.tsx?$',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
