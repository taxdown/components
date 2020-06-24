'use strict';

const utils = require('./cli/utils');
const minimist = require('minimist');
const {
  utils: { isChinaUser },
} = require('@serverless/platform-client-china');

// These keywords should route to components CLI, not sls cli.
const componentKeywords = new Set(['registry', 'init', 'publish']);

const runningComponents = () => {
  const args = minimist(process.argv.slice(2));

  let componentConfig;
  let instanceConfig;

  // load components if user runs a keyword command, or "sls --all" or "sls --target" (that last one for china)
  if (componentKeywords.has(process.argv[2]) || args.all || args.target) {
    return true;
  }

  try {
    componentConfig = utils.legacyLoadComponentConfig(process.cwd());
  } catch (e) {
    // ignore
  }
  try {
    instanceConfig = utils.legacyLoadInstanceConfig(process.cwd());
  } catch (e) {
    // ignore
  }

  if (!componentConfig && !instanceConfig) {
    // load components if trying to login inside a template directory
    if (
      process.argv.length === 3 &&
      process.argv[2] === 'login' &&
      utils.runningTemplate(process.cwd())
    ) {
      return true;
    }
    // When no in service context and plain `serverless` command, return true when user in China
    // It's to enable interactive CLI components onboarding for Chinese users
    return process.argv.length === 2 && isChinaUser();
  }

  if (instanceConfig && !instanceConfig.component) {
    return false;
  }

  return true;
};

module.exports = { runningComponents };
