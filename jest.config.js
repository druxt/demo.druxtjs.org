// One configuration for the front end's unit tests, kept at the repository
// root where the standard's coverage-floor check reads it. rootDir is nuxt/,
// so every path below is relative to the application.
module.exports = {
  rootDir: 'nuxt',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
  },
  moduleFileExtensions: ['js', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': '@vue/vue2-jest',
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.nuxt/', '/dist/'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/components/**/*.vue', '<rootDir>/plugins/**/*.js'],
  // cobertura feeds GitLab's merge request coverage view, clover feeds
  // Codecov on GitHub, text feeds the coverage regex both pipelines read.
  coverageReporters: ['clover', 'cobertura', 'lcov', 'text'],
  // A floor set from the measured baseline, which is everything the front end
  // has of its own: two components and one plugin. Never lower it to make a
  // change pass; a new component arrives with its test.
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
}
