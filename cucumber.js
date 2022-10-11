const common = [
  'features/**/*.feature',
  '--require-module ts-node/register',
  '--require features/step_definitions/**/*.ts',
  '--format progress-bar',
  '--format @cucumber/pretty-formatter',
  '--publish-quiet',
].join(' ');

module.exports = {
  default: common,
};
