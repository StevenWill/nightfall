import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // --- Type constraints ---
            // feature libs can use data-access, ui, util (and other feature libs within the same scope)
            { sourceTag: 'type:feature', onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:util'] },
            // data-access libs only use other data-access or util
            { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:data-access', 'type:util'] },
            // ui libs only use other ui or util
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
            // util libs are leaf nodes
            { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
            // --- Scope constraints ---
            // each domain can only import from its own scope or shared
            { sourceTag: 'scope:auth', onlyDependOnLibsWithTags: ['scope:auth', 'scope:shared'] },
            { sourceTag: 'scope:user-profile', onlyDependOnLibsWithTags: ['scope:user-profile', 'scope:shared'] },
            { sourceTag: 'scope:investments', onlyDependOnLibsWithTags: ['scope:investments', 'scope:shared'] },
            { sourceTag: 'scope:settings', onlyDependOnLibsWithTags: ['scope:settings', 'scope:shared'] },
            // shared can only depend on other shared libs
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
