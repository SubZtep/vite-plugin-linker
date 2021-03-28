// src/index.ts
import {watch} from "fs/promises";
import {exec} from "child_process";
import {copy} from "fs-extra";
function watcherPlugin(options) {
  ;
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
          console.log("Watching...");
        });
      }, 100);
    }
  })();
  return {
    name: "vite-plugin-watcher"
  };
}
export {
  watcherPlugin as default
};
