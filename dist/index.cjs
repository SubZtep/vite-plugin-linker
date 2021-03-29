"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/index.ts
var _fs = require('fs');
var _promises = require('fs/promises');
var _child_process = require('child_process');
var _path = require('path');
var _fsextra = require('fs-extra');
var _chokidar = require('chokidar'); var _chokidar2 = _interopRequireDefault(_chokidar);
var _chalk = require('chalk'); var _chalk2 = _interopRequireDefault(_chalk);
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
    console.log(_chalk2.default`{green State {greenBright is}} {cyan ${State[this._state].toLowerCase()}}{green ...}`);
  }
};
var restartViteServer = () => {
  let file;
  let time;
  let path;
  const base = "vite.config";
  try {
    _fs.accessSync.call(void 0, `${base}.ts`, _fs.constants.R_OK);
    path = `${base}.ts`;
  } catch (e) {
    path = `${base}.js`;
  }
  return async () => {
    time = new Date();
    try {
      await _promises.utimes.call(void 0, path, time, time);
    } catch (e2) {
      file = await _promises.open.call(void 0, path, "w");
      await file.close();
    }
  };
};
var deleteResolvedCache = (target) => {
  const targetResolved = _path.resolve.call(void 0, target);
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
      await _fsextra.copy.call(void 0, options.dist, options.target, {overwrite: true});
    } catch (err) {
      console.log(_chalk2.default.red(err.message));
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
      console.log(_chalk2.default.red(err.message));
      return;
    }
    _child_process.exec.call(void 0, options.exec, revampTarget);
  };
  return {
    name: "vite-plugin-watcher",
    apply: "serve",
    buildStart() {
      restartDevServer = restartViteServer();
      clearRequireCache = deleteResolvedCache(options.target);
      watcher = _chokidar2.default.watch(options.watch, {ignoreInitial: true});
      watcher.on("all", fileChangeListener);
    },
    closeWatcher() {
      watcher.close();
    }
  };
}


exports.default = watcherPlugin;
