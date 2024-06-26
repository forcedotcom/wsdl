module.exports = {
  extends: ['eslint-config-salesforce-typescript', 'eslint-config-salesforce-license', 'plugin:sf-plugin/library'],
  rules: {
    'no-console': 'off',
    'sf-plugin/no-missing-messages': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
