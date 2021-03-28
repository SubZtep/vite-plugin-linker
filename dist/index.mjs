// src/index.ts
import {watch} from "fs/promises";
import {
  closeSync,
  existsSync,
  openSync,
  utimesSync
} from "fs";
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
  let s;
  let configFile = existsSync("vite.config.ts") ? "vite.config.ts" : "vite.config.js";
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
export {
  watcherPlugin as default
};
