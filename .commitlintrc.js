module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'cleanup',
        'init',
        'remove',
        'raw',
      ],
    ],
    'type-empty': [0, 'never'], // Allows commits without enforcing strict type check.
    'subject-empty': [2, 'never'], // Ensures the subject is present after type.
    'subject-case': [0], // Disables subject case enforcement to allow emojis.
    'header-max-length': [2, 'always', 72],
  },
  parserPreset: {
    parserOpts: {
      // Regex pattern: allows optional emoji at the start, followed by type and subject
      headerPattern: /^(:\w+:)?\s*(\w+)(?:\(([^)]+)\))?: (.+)$/,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
};
