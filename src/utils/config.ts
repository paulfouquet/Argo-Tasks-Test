import prettier from 'prettier';

/**
 * Config copied from `@linzjs/style/.prettierrc.cjs`
 */
export const DEFAULT_PRETTIER_FORMAT: prettier.Options = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  useTabs: false,
  tabWidth: 2,
};
