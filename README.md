# vite-plugin-linker

On **win32** environment **npm link** has some issues due the lack of file system link. This plugin resolves this issue and restart _Vite_ server after module update for smooth development.

## Install

Install directly from the repository (until any release):

```sh
$ npm i -D github:SubZtep/vite-plugin-linker
```

## Workflow

1. Detect source code changes.
2. Run build command.
3. Copy built files into the project.
4. Clean node module cache.
5. Restart _Vite_ server.

## Configuration

Example `vite.config.js` from the test project of `vite-plugin-pug`:

```js
import { defineConfig } from "vite"
import Pug from "vite-plugin-pug"
import Watcher from "vite-plugin-watcher"

export default defineConfig({
  plugins: [
    Pug(),
    Watcher({
      watch: "../vite-plugin-pug/src",
      exec: "cd ../vite-plugin-pug && npm run build",
      dist: "../vite-plugin-pug/dist",
      target: "./node_modules/vite-plugin-pug/dist",
    }),
  ],
})
```

## Options

| Name   | Description                                    |
| ------ | ---------------------------------------------- |
| watch  | Directory to watch for changes to run command. |
| exec   | Bash command to run after changes (eg: build). |
| dist   | Directory of `exec` output.                    |
| target | Directory to copy files from `dist`.           |

## License

[Unlicense](LICENSE)

> Restart _Vite_ server is a copycat from [vite-plugin-restart](https://github.com/antfu/vite-plugin-restart) (MIT).
