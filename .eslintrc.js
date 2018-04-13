module.exports = {
  extends: 'airbnb',
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'linebreak-style': 0,
    'arrow-parens': 0,
    'arrow-body-style': 0,
    'function-paren-newline': 0,
    'comma-dangle': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/require-default-props': [0],
    'react/no-unused-prop-types': [
      2,
      {
        skipShapeProps: true
      }
    ],
    'react/no-multi-comp': [0],
    'no-bitwise': [0]
  }
};
