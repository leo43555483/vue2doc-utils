/* eslint-disable class-methods-use-this */
const chalk = require('chalk');
const jsdom = require('jsdom');
// const { serializeDocument } = require('jsdom');
const { Script } = require('vm');
const MdRender = require('../mdRender');
const {
  hasOwnProperty, isArray, isFunction, parsePath,
} = require('../utils');
const DEFAULT_MD_OPTION = require('./config');
const { FILE_CONTEXT } = require('../getFilesMap');

const MODULE_CONTEXT = '@vue2docEvents';
class TransformSFC {
  constructor(option = DEFAULT_MD_OPTION) {
    this.instance = [];
    this._target = null;
    const { md, ...config } = option;
    this.option = { ...DEFAULT_MD_OPTION.output, ...config.output };
    this.mdRenderOption = this.mergeOption(md, DEFAULT_MD_OPTION.md);
    this.requestUrlMap = {};
  }

  apply(compiler) {
    compiler.hooks.entryOption.tap('mountEntry', (context, entry) => {
      this.genRequestMap(entry);
    });

    compiler.hooks.compilation.tap('TransformCompilation', (compilation) => {
      const context = this;
      compilation.hooks.seal.tap('readAssets', () => {
        compilation.modules.forEach((module) => {
          context.mountEvenProperty(module);
        });
      });
    });

    compiler.hooks.emit.tapAsync('emitMarkDown', (compilation, callback) => {
      const { instance, mdRenderOption } = this;
      let eventList = this.genEvenList(compilation);

      compilation.chunks.forEach((chunk) => {
        eventList = eventList.filter((item) => item);

        chunk.files.forEach((filename) => {
          const source = compilation.assets[filename].source();
          const { JSDOM } = jsdom;
          // prerender
          const dom = new JSDOM('<body id="app"></body>', {
            url: 'http://localhost',
            runScripts: 'dangerously',
          });
          const vmContext = dom.getInternalVMContext();
          const script = new Script(`
          const vueConstructor = new Function(this.source)(this.instance);
        `);
          script.runInContext(Object.assign(vmContext, { source, instance }));

          this._target = this.instance.pop();

          const [eventMap] = eventList.filter((e) => e.name === filename);
          const { name, ...properties } = this.getPropertyFromInstance(eventMap);
          if (properties) {
            const mdRender = new MdRender({ ...mdRenderOption, title: name });
            const mdContent = mdRender.renderToMd(properties);
            const outputFileName = this.parseFileName(name, filename);
            compilation.assets[outputFileName] = {
              source() {
                return mdContent;
              },
              size() {
                return mdContent.length;
              },
            };
          }
        });
      });

      callback();
    });
  }

  mergeOption(origin, target) {
    if ((origin === target) || !origin) return target;
    const result = {};
    Object.keys(origin).forEach((key) => {
      if (hasOwnProperty(target, key)) {
        result[key] = {
          ...target[key],
          ...origin[key],
        };
      }
    });
    return result;
  }

  findIssuerModule(issuer) {
    let module = issuer;
    let result = null;
    while (module && module.rawRequest) {
      const { rawRequest } = module;
      if (!hasOwnProperty(this.requestUrlMap, rawRequest)) {
        module = module.issuer;
      } else {
        result = this.requestUrlMap[rawRequest];
        break;
      }
    }
    return result;
  }

  mountEvenProperty(module) {
    if (module._source._value) {
      let emits = module._source._value.match(/this\.\$emit\((.*?)\)/g);
      if (emits) {
        const name = this.findIssuerModule(module);
        if (name) {
          emits = emits.map((emit) => {
            const result = /this\.\$emit\((.*?)\)/g.exec(emit)[1];
            return result.split(',')[0].replace(/[\\']/g, '');
          });
          module[MODULE_CONTEXT] = { name, event: emits };
        }
      }
    }
  }

  genEvenList(compilation) {
    const eventList = [];
    compilation._modules.forEach((module) => {
      // console.log('rawRequest<<<<<,', module[MODULE_CONTEXT]);
      if (hasOwnProperty(module, MODULE_CONTEXT)) {
        eventList.push(module[MODULE_CONTEXT]);
      }
    });
    return eventList;
  }

  genRequestMap(entry) {
    const context = this;
    Object.keys(entry).forEach((key) => {
      const fileName = /\.js$/.test(key) ? key : `${key}.js`;
      context.requestUrlMap[entry[key]] = fileName;
    });
  }

  parseFileName(name, assetFileName) {
    const { filename, dirname } = this.option;
    let basename;
    if (filename === '[name]') {
      basename = name;
    } else {
      basename = filename;
    }
    const path = parsePath(assetFileName).dir.replace(FILE_CONTEXT, '');
    return `${path}${dirname}${basename}.md`;
  }

  getProps(component) {
    const getType = (value) => {
      if (!value) return '';
      if (isArray(value)) return value.map((type) => type.name).join(' ');
      return value.name;
    };
    if (component.props) {
      const keys = Object.keys(component.props);
      return keys.map((key) => {
        const payload = { ...component.props[key] };
        const { type, ...values } = payload;
        let defaultvalue = payload.default;
        if (isFunction(defaultvalue) && getType(type) !== 'Function') {
          defaultvalue = defaultvalue();
        }

        return {
          key,
          ...values,
          default: defaultvalue,
          type: getType(type),
        };
      });
    }
    return [];
  }

  getMethods(component) {
    if (component.methods) {
      return Object.keys(component.methods).map((key) => ({ key }));
    }
    return [];
  }

  getPropertyFromInstance(eventList = {}) {
    const { _target, mdRenderOption } = this;
    if (!_target) return null;
    const props = this.getProps(_target.component);
    const methods = this.getMethods(_target.component);
    let events = [];
    if (hasOwnProperty(eventList, 'event')) {
      events = eventList.event.map((event) => ({ key: event }));
    }

    const { name } = _target.component;
    const format = (mdConfig, value) => ({ ...mdConfig, value });
    return {
      props: format(mdRenderOption.props, props),
      methods: format(mdRenderOption.methods, methods),
      events: format(mdRenderOption.events, events),
      name,
    };
  }
}

module.exports = TransformSFC;
