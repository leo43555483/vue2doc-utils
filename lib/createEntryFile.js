const { relative } = require('path');
const { memfs } = require('./fileSystem');
const { isArray, parsePath } = require('./utils');

const formatComponentName = (name) => {
  let component = name.replace(name[0], name[0].toUpperCase());
  component = component.replace(/-\w/g, (s) => s.slice(1).toUpperCase());
  return component;
};

const createIndexFile = (entry) => {
  const map = {};
  Object.keys(entry).forEach((entryPath) => {
    const filePath = entry[entryPath];
    const { name, dir } = parsePath(filePath);
    const fileDir = `${dir}/${name}/docs`;
    const realPath = `${fileDir}/index.js`;

    map[entryPath] = `./${relative(process.cwd(), realPath)}`;
    if (memfs.existsSync(realPath)) {
      memfs.rmdirSync(fileDir);
    }
    memfs.mkdirpSync(fileDir);

    const componentName = formatComponentName(name);
    memfs.writeFileSync(realPath,
      `
      import Vue from 'vue';
      import ${componentName} from '${filePath}/index.js';
      Vue.config.productionTip = false;
      Vue.config.debug = false;
      Vue.config.silent = true;
      Vue.config.errorHandler = function (err, vm, info) {
        // console.log('err>>>>',err)
      }

      const createApp = (instance) => {

        return new Vue({
          render: (h) => h(${componentName}),
          created() {
            const vm = this;
            instance.push({app:vm, component: ${componentName}});
          },
        }).$mount('#app');
      };
      createApp(instance);
    `, 'utf8');
  });
  return map;
};
module.exports = function (entryMap) {
  return new Promise((resovle, reject) => {
    try {
      let freshEntry;
      if (isArray(entryMap)) {
        freshEntry = entryMap.map((entry) => createIndexFile(entry));
      } else {
        freshEntry = createIndexFile(entryMap);
      }
      resovle(freshEntry);
    } catch (error) {
      reject(new Error(100));
    }
  });
};
