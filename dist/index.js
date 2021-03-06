// src/index.ts
import {accessSync, constants} from "fs";
import {open, utimes} from "fs/promises";
import {exec} from "child_process";
import {resolve} from "path";
import {copy} from "fs-extra";
import chokidar from "chokidar";
import chalk from "chalk";
var State;
(function(State2) {
  State2[State2["Watching"] = 0] = "Watching";
  State2[State2["Executing"] = 1] = "Executing";
  State2[State2["Revamping"] = 2] = "Revamping";
})(State || (State = {}));
var state = {
  _state: 0,
  set current(state2) {
    switch (state2) {
      case 1:
        if (this._state === 1) {
          throw new Error("Already executing.");
        }
      case 2:
        if (this._state === 2) {
          throw new Error("Copy etc, don\u2019t turn off your server machine.");
        }
    }
    this._state = state2;
    console.log(chalk`{green State {greenBright is}} {cyan ${State[this._state].toLowerCase()}}{green ...}`);
  }
};
var restartViteServer = () => {
  let file;
  let time;
  let path;
  const base = "vite.config";
  try {
    accessSync(`${base}.ts`, constants.R_OK);
    path = `${base}.ts`;
  } catch {
    path = `${base}.js`;
  }
  return async () => {
    time = new Date();
    try {
      await utimes(path, time, time);
    } catch {
      file = await open(path, "w");
      await file.close();
    }
  };
};
var deleteResolvedCache = (target) => {
  const targetResolved = resolve(target);
  return (key) => {
    if (key.startsWith(targetResolved)) {
      delete require.cache[key];
    }
  };
};
function watcherPlugin(options) {
  let restartDevServer;
  let clearRequireCache;
  let watcher;
  const revampTarget = async () => {
    try {
      state.current = 2;
      await copy(options.dist, options.target, {overwrite: true});
    } catch (err) {
      console.log(chalk.red(err.message));
      state.current = 0;
      return;
    }
    Object.keys(require.cache).forEach(clearRequireCache);
    await restartDevServer();
    state.current = 0;
  };
  const fileChangeListener = () => {
    try {
      state.current = 1;
    } catch (err) {
      console.log(chalk.red(err.message));
      return;
    }
    exec(options.exec, revampTarget);
  };
  return {
    name: "vite-plugin-watcher",
    apply: "serve",
    buildStart() {
      restartDevServer = restartViteServer();
      clearRequireCache = deleteResolvedCache(options.target);
      watcher = chokidar.watch(options.watch, {ignoreInitial: true});
      watcher.on("all", fileChangeListener);
    },
    closeWatcher() {
      watcher.close();
    }
  };
}
export {
  watcherPlugin as default
};
