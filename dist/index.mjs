// src/index.ts
import {watch} from "fs/promises";
import {
  closeSync,
  existsSync,
  openSync,
  utimesSync
} from "fs";
import {resolve} from "path";
import {exec} from "child_process";
import {copy} from "fs-extra";
function touch(path) {
  const time = new Date();
  try {
    utimesSync(path, time, time);
  } catch (err) {
    closeSync(openSync(path, "w"));
  }
}
function watcherPlugin(options) {
  const configFile = existsSync("vite.config.ts") ? "vite.config.ts" : "vite.config.js";
  const targetResolved = resolve(options.target);
  (async () => {
    const watcher = watch(options.watch);
    let lock = false;
    for await (const {eventType} of watcher) {
      if (lock || eventType !== "change")
        continue;
      console.log("Watched changed");
      lock = true;
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
          console.log("Watching...");
        });
      }, 500);
    }
  })();
  return {
    name: "vite-plugin-watcher",
    apply: "serve"
  };
}
export {
  watcherPlugin as default
};
