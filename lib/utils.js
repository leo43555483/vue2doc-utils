// const chalk = require('chalk');
const { join } = require('path');
const { parse } = require('path');

const hasOwnProperty = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

function parsePath(path) {
  return parse(path);
}
function getFileNameFromUrl(path) {
  return parsePath(path);
}
function getParentPathFromFile(entry) {
  let folder = entry.split('/');
  folder.pop();
  folder = folder.join('/');
  return folder;
}
function isExpectedFile(path, mimes) {
  return mimes.some((mime) => {
    const re = new RegExp(`.${mime}$`);
    return re.test(path);
  });
}

function isFunction(value) {
  return typeof value === 'function';
}
function isFile(path) {
  return /\.[A-Za-z]+$/.test(path);
}
function isArray(value) {
  return Array.isArray(value);
}
function isString(value) {
  return typeof value === 'string';
}

function unDef(value) {
  return value === null || value === undefined;
}
function handleWebpackError(err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return true;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error(info.errors);
    return true;
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }
  return false;
}
function getOutPut(config, rootPath, output) {
  if ((config.output && config.output.path === 'self') || output.path === 'self') return join(rootPath, config.entry);
  if (isString(config.output.path)) return join(rootPath, config.output.path);
  return rootPath;
}
function stringify(value) {
  return JSON.stringify(value);
}
module.exports = {
  isExpectedFile,
  isArray,
  isString,
  hasOwnProperty,
  getParentPathFromFile,
  getFileNameFromUrl,
  isFile,
  handleWebpackError,
  getOutPut,
  parsePath,
  stringify,
  unDef,
  isFunction,
};
