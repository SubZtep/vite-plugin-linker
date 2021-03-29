# vite-plugin-linker

On **win32** environment [**npm link**](https://docs.npmjs.com/cli/v7/commands/npm-link) has some issues due the lack of file system link. This plugin resolves this issue and restart _Vite_ server after module update for smooth development.

## Install

```sh
$ npm i -D vite-plugin-linker
```

## Workflow

There are two projects, one is the module you develop, the other one is the test _Vite_ project. This plugin is running on the test project.

1. Detect source code changes in the module.
2. Run its build command.
3. Copy built files into the test project.
4. Clean node module cache in the test project.
5. Restart test project _Vite_ server.

## Configuration

Example `vite.config.ts` of the test project where `vite-plugin-pug` module is under development. Both projects are based on the same working directory.

```js
import { defineConfig } from "vite"
import Pug from "vite-plugin-pug"
import Linker from "vite-plugin-linker"

export default defineConfig({
  plugins: [
    Pug(),
    Linker({
      watch: "../vite-plugin-pug/src",
      exec: "cd ../vite-plugin-pug && npm run build",
      dist: "../vite-plugin-pug/dist",
      target: "./node_modules/vite-plugin-pug/dist",
    }),
  ],
})
```

## Options

| Name   | Description                                   |
| ------ | --------------------------------------------- |
| watch  | Directory to watch for source code changes.   |
| exec   | Command to execute after a file change event. |
| dist   | Build directory, the result of `exec`.        |
| target | Directory to copy files from `dist`.          |

## FAQ

### Why does this plugin run the build command?

One terminal window is enough to run test server and builds.

## License

[Unlicense](LICENSE)

> Restart _Vite_ server method is from [vite-plugin-restart](https://github.com/antfu/vite-plugin-restart) (MIT).
