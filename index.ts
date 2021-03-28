// @ts-ignore
import { watch } from "fs/promises"
import { exec } from "child_process"
import { copy } from "fs-extra"
import type { Plugin } from "vite"

/**
 * @param watch Directory to watch for changes to run command.
 * @param exec Bash command to run after changes (eg: build)
 * @param dist Directory of `exec` output
 * @param target Directory to copy files from dist
 */
interface WatcherOptions {
  watch: string
  exec: string
  dist: string
  target: string
}

export default function watcherPlugin(options: WatcherOptions): Plugin {
  const watcher = watch(options.watch)

  ;(async () => {
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
          console.log("Watching...")
        })
      }, 100)
    }
  })()

  return {
    name: "vite-plugin-watcher",
  }
}
