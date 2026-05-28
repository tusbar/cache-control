import xoBizon from 'eslint-config-xo-bizon'

export default [
  ...xoBizon,
  {
    rules: {
      // HTTP headers are strictly ASCII per RFC 9110, so Unicode regex flags add no value.
      'require-unicode-regexp': 'off',
    },
  },
]
