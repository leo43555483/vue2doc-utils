const { join } = require('path');
const glob = require('glob');

const FILE_CONTEXT = 'vue2docs';
const {
  isExpectedFile,
  getFileNameFromUrl,
  getParentPathFromFile,
  hasOwnProperty,
  isFile,
  parsePath,
  isString,
} = require('./utils');

function parseEntryUrl(file, output, map) {
  const urlPayload = getFileNameFromUrl(file);
  let filename = urlPayload.base;
  // webpack entry key
  let key;
  if (output.path === 'self') {
    if (!isFile(file)) {
      key = `${filename}/${FILE_CONTEXT}/${filename}.doc`;
    } else {
      key = `${FILE_CONTEXT}/${filename}.doc`;
    }
  }
  if (output.path !== 'self') {
    filename = isFile(filename) ? filename : parsePath(filename).base;
    key = join(process.cwd, output.path, `./${FILE_CONTEXT}`, `${filename}.doc`);
  }
  map[key] = file;
}

function getFilesMap(token, mimes, config) {
  const { entry } = token;
  const outputConfig = token.output || config.output;
  const ignore = token.ignore || config.ignore;
  const map = {};
  if (isString(entry) && entry) {
    if (!isExpectedFile(entry, mimes)) {
      const path = join(`${process.cwd()}`, entry);
      let entryFiles = glob.sync(`${path}/*`);

      entryFiles = entryFiles.filter((filePath) => {
        // The path is a folder
        const lastFileName = parsePath(filePath).base;
        if (ignore.length > 0) {
          return ignore.indexOf(lastFileName) < 0 && lastFileName !== FILE_CONTEXT;
        }
        return true;
      });
      entryFiles.forEach((file) => {
        parseEntryUrl(file, outputConfig, map);
      });
    } else if (!hasOwnProperty(map, entry)) {
      const path = getParentPathFromFile(entry);
      map[path] = entry;
    }
  }
  return map;
}
module.exports = { getFilesMap, parseEntryUrl, FILE_CONTEXT };
