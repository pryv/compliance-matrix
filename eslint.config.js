import neostandard from 'neostandard';

// Lints the Node build/validate/generate scripts. The WAB has its own
// config under wab/ (React + TypeScript).
export default [
  {
    // wab/ has its own config. The three one-off maintenance scripts below
    // predate this linter config and carry their own pre-existing style debt;
    // they are excluded here so the linter gates the active pipeline cleanly.
    ignores: [
      'dist', 'node_modules', 'wab', 'samples',
      'scripts/backfill-pryv-effort-saved.js',
      'scripts/migrate-facilitation-to-fields.js',
      'scripts/sync-backlogs-to-gh.js'
    ]
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
