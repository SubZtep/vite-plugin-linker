import type { Plugin } from "vite"
import fs from "fs"
import { resolve } from "path"
import { exec } from "child_process"
import { copy } from "fs-extra"

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
 * @param exec Bash command to run after changes (eg: build).
 * @param dist Directory of `exec` output.
 * @param target Directory to copy files from `dist`.
 */
interface Options {
  watch: string
  exec: string
  dist: string
  target: string
}

export default function watcherPlugin(options: Options): Plugin {
  const configFile = fs.existsSync("vite.config.ts") ? "vite.config.ts" : "vite.config.js"
  const targetResolved = resolve(options.target)

  ;(async () => {
    let lock = false

    const watcher = fs.watch(options.watch, () => {
      if (lock) return
      lock = true
      watcher.close()
      console.log("Watched changed")

      setTimeout(() => {
        console.log("Executing")
        exec(options.exec, async () => {
          console.log("Copying")
          try {
            await copy(options.dist, options.target, { overwrite: true })
          } catch (err) {
            console.error(err.message)
          }

          Object.keys(require.cache).forEach(id => {
            if (id.startsWith(targetResolved)) {
              console.log("Clear cache", id)
              delete require.cache[id]
            }
          })

          // restart server
          touch(configFile)

          lock = false
        })
      }, 500)
    })
  })()

  return {
    name: "vite-plugin-watcher",
    apply: "serve",
  }
}
