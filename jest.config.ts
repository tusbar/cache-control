import {type Config} from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['lcov', 'text-summary'],
}

export default config
