import type { Plugin } from "vite"
import type { FSWatcher } from "chokidar"
import type { FileHandle } from "fs/promises"
import { accessSync, constants } from "fs"
import { open, utimes } from "fs/promises"
import { exec } from "child_process"
import { resolve } from "path"
import { copy } from "fs-extra"
import chokidar from "chokidar"
import chalk from "chalk"

interface Options {
  /**
   * File, directory or glob to watch for changes to run command.
   */
  watch: string | string[]

  /**
   * Bash command to run after changes (eg: build).
   */
  exec: string

  /**
   * Directory of `exec` output.
   */
  dist: string

  /**
   * Directory to copy files from `dist`.
   */
  target: string
}

/**
 * Possible plugin states.
 */
enum State {
  Watching,
  Executing,
  Revamping,
}

const state = {
  _state: State.Watching,
  set current(state: State) {
    switch (state) {
      case State.Executing:
        if (this._state === State.Executing) {
          throw new Error("Already executing.")
        }
      case State.Revamping:
        if (this._state === State.Revamping) {
          throw new Error("Copy etc, don’t turn off your server machine.")
        }
    }
    this._state = state
    console.log(chalk`{green State {greenBright is}} {cyan ${State[this._state].toLowerCase()}}{green ...}`)
  },
}

const restartViteServer = () => {
  let file: FileHandle
  let time: Date
  let path: string
  const base = "vite.config"

  try {
    accessSync(`${base}.ts`, constants.R_OK)
    path = `${base}.ts`
  } catch {
    path = `${base}.js`
  }

  return async () => {
    time = new Date()
    try {
      await utimes(path, time, time)
    } catch {
      file = await open(path, "w")
      await file.close()
    }
  }
}

const deleteResolvedCache = (target: string) => {
  const targetResolved = resolve(target)
  return (key: string) => {
    if (key.startsWith(targetResolved)) {
      delete require.cache[key]
    }
  }
}

export default function watcherPlugin(options: Options): Plugin {
  let restartDevServer: () => Promise<void>
  let clearRequireCache: (key: string) => void
  let watcher: FSWatcher

  const revampTarget = async () => {
    try {
      state.current = State.Revamping
      await copy(options.dist, options.target, { overwrite: true })
    } catch (err) {
      console.log(chalk.red(err.message))
      state.current = State.Watching
      return
    }

    Object.keys(require.cache).forEach(clearRequireCache)
    await restartDevServer()

    state.current = State.Watching
  }

  const fileChangeListener = () => {
    try {
      state.current = State.Executing
    } catch (err) {
      console.log(chalk.red(err.message))
      // TODO: kill child 🔪process
      return
    }
    exec(options.exec, revampTarget)
  }

  return {
    name: "vite-plugin-watcher",
    apply: "serve",

    buildStart() {
      restartDevServer = restartViteServer()
      clearRequireCache = deleteResolvedCache(options.target)
      watcher = chokidar.watch(options.watch, { ignoreInitial: true })
      watcher.on("all", fileChangeListener)
    },

    closeWatcher() {
      watcher.close()
    },
  }
}
