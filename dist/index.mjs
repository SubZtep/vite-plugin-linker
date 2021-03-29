// src/index.ts
import fs from "fs";
import {resolve} from "path";
import {exec} from "child_process";
import {copy} from "fs-extra";
function touch(path) {
  const time = new Date();
  try {
    fs.utimesSync(path, time, time);
  } catch (err) {
    fs.closeSync(fs.openSync(path, "w"));
  }
}
function watcherPlugin(options) {
  const configFile = fs.existsSync("vite.config.ts") ? "vite.config.ts" : "vite.config.js";
  const targetResolved = resolve(options.target);
  (async () => {
    let lock = false;
    const watcher = fs.watch(options.watch, () => {
      if (lock)
        return;
      lock = true;
      watcher.close();
      console.log("Watched changed");
      setTimeout(() => {
        console.log("Executing");
        exec(options.exec, async () => {
          console.log("Copying");
          try {
            await copy(options.dist, options.target, {overwrite: true});
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
export {
  watcherPlugin as default
};
