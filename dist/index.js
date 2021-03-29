"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/index.ts
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path');
var _child_process = require('child_process');
var _fsextra = require('fs-extra');
function touch(path) {
  const time = new Date();
  try {
    _fs2.default.utimesSync(path, time, time);
  } catch (err) {
    _fs2.default.closeSync(_fs2.default.openSync(path, "w"));
  }
}
function watcherPlugin(options) {
  const configFile = _fs2.default.existsSync("vite.config.ts") ? "vite.config.ts" : "vite.config.js";
  const targetResolved = _path.resolve.call(void 0, options.target);
  (async () => {
    let lock = false;
    const watcher = _fs2.default.watch(options.watch, () => {
      if (lock)
        return;
      lock = true;
      watcher.close();
      console.log("Watched changed");
      setTimeout(() => {
        console.log("Executing");
        _child_process.exec.call(void 0, options.exec, async () => {
          console.log("Copying");
          try {
            await _fsextra.copy.call(void 0, options.dist, options.target, {overwrite: true});
          } catch (err) {
            console.error(err.message);
          }
          Object.keys(require.cache).forEach((id) => {
            if (id.startsWith(targetResolved)) {
              console.log("Clear cache", id);
              delete require.cache[id];
            }
          });
          touch(configFile);
          lock = false;
        });
      }, 500);
    });
  })();
  return {
    name: "vite-plugin-watcher",
    apply: "serve"
  };
}


exports.default = watcherPlugin;
