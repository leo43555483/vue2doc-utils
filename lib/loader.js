const chalk = require('chalk');
const { parse } = require('@vue/component-compiler-utils');
const path = require('path');

const index = 0;
function loadTemplateCompiler(loaderContext) {
  try {
    return require('vue-template-compiler');
  } catch (e) {
    if (/version mismatch/.test(e.toString())) {
      loaderContext.emitError(e);
    } else {
      loaderContext.emitError(new Error(
        '[vue2doc] vue-template-compiler must be installed as a peer dependency, '
        + 'or a compatible compiler implementation must be passed via options.',
      ));
    }
  }
  return null;
}
module.exports = function (source) {
  console.log('loader???');
  // if (index < 20 && index > 30) return source;
  // index += 1;
  // const { sourceMap, resourcePath, rootContext } = this;
  // console.log(chalk.green('source'), {
  //   sourceMap, resourcePath, rootContext,
  // });
  // const filename = path.basename(resourcePath);
  // const context = rootContext || process.cwd();
  // const sourceRoot = path.dirname(path.relative(context, resourcePath));
  // const descriptor = parse({
  //   source,
  //   compiler: loadTemplateCompiler(this),
  //   filename,
  //   sourceRoot,
  //   needMap: sourceMap,
  // });
  // console.log(chalk.green('source descriptor'), descriptor.script);
  // console.log(chalk.green('source descriptor'), source);
  return source;
};
