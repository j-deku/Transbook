// i18next-parser.config.js
export default {
    locales: ['en', 'es'],
    output: 'src/locales/{{lng}}/translation.json',
    input: ['src/**/*.{js,jsx}'],
    defaultValue: '',
    keySeparator: false,
    namespaceSeparator: false,
  };
  