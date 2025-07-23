import antfu from '@antfu/eslint-config'

export default antfu({
  svelte: true,
  rules: {
    'unicorn/throw-new-error': 'off', // clashes with effect's Data.TaggedError()
  },
})
