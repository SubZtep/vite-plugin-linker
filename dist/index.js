"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/index.ts
var _promises = require('fs/promises');
var _child_process = require('child_process');
var _fsextra = require('fs-extra');
function watcherPlugin(options) {
  ;
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
          console.log("Watching...");
        });
      }, 100);
    }
  })();
  return {
    name: "vite-plugin-watcher"
  };
}


exports.default = watcherPlugin;
