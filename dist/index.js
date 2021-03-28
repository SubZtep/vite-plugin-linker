"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/index.ts
var _promises = require('fs/promises');





var _fs = require('fs');
var _child_process = require('child_process');
var _fsextra = require('fs-extra');
function touch(path) {
  const time = new Date();
  try {
    _fs.utimesSync.call(void 0, path, time, time);
  } catch (err) {
    _fs.closeSync.call(void 0, _fs.openSync.call(void 0, path, "w"));
  }
}
function watcherPlugin(options) {
  let s;
  let configFile = _fs.existsSync.call(void 0, "vite.config.ts") ? "vite.config.ts" : "vite.config.js";
  (async () => {
    const watcher = _promises.watch.call(void 0, options.watch);
    let lock = false;
    for await (const {eventType} of watcher) {
      if (lock || eventType !== "change")
        continue;
      console.log("Watched changed");
      lock = true;
      setTimeout(() => {
        console.log("Executing");
        _child_process.exec.call(void 0, options.exec, async () => {
          console.log("Copying");
          try {
            await _fsextra.copy.call(void 0, options.dist, options.target, {overwrite: true});
          } catch (err) {
            console.error(err.message);
          }
          lock = false;
          touch(configFile);
          console.log("Watching...");
        });
      }, 500);
    }
  })();
  return {
    name: "vite-plugin-watcher",
    apply: "serve",
    configureServer(server) {
      s = server;
    }
  };
}


exports.default = watcherPlugin;
