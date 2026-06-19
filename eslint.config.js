import neostandard from 'neostandard';

// Lints the Node build/validate/generate scripts. The WAB has its own
// config under wab/ (React + TypeScript).
export default [
  {
    // wab/ has its own config; samples/ are self-contained apps with their own.
    ignores: ['dist', 'node_modules', 'wab', 'samples']
  },
  ...neostandard({ semi: true }),
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  }
];
