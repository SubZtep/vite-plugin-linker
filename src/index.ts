// @ts-ignore
import { watch } from "fs/promises"
import * as fs from "fs"
import { exec } from "child_process"
import { copy } from "fs-extra"
import type { Plugin, ViteDevServer } from "vite"

function touch(path: string) {
  const time = new Date()

  try {
    fs.utimesSync(path, time, time)
  } catch (err) {
    fs.closeSync(fs.openSync(path, "w"))
  }
}

/**
 * @param watch Directory to watch for changes to run command.
 * @param exec Bash command to run after changes (eg: build)
 * @param dist Directory of `exec` output
 * @param target Directory to copy files from dist
 */
interface Options {
  watch: string
  exec: string
  dist: string
  target: string
}

export default function watcherPlugin(options: Options): Plugin {
  let s: ViteDevServer
  let configFile = fs.existsSync("vite.config.ts") ? "vite.config.ts" : "vite.config.js"

  ;(async () => {
    const watcher = watch(options.watch)
    let lock = false
    for await (const { eventType } of watcher) {
      if (lock || eventType !== "change") continue

      console.log("Watched changed")
      lock = true
      setTimeout(() => {
        console.log("Executing")
        exec(options.exec, async () => {
          console.log("Copying")
          try {
            await copy(options.dist, options.target, { overwrite: true })
          } catch (err) {
            console.error(err.message)
          }
          lock = false

          // restart server
          touch(configFile)

          console.log("Watching...")
        })
      }, 500)
    }
  })()

  return {
    name: "vite-plugin-watcher",
    apply: "serve",
    configureServer(server) {
      s = server
    },
  }
}
