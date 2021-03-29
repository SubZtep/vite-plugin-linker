import { Plugin } from 'vite';

interface Options {
    /**
     * File, directory or glob to watch for changes to run command.
     */
    watch: string | string[];
    /**
     * Bash command to run after changes (eg: build).
     */
    exec: string;
    /**
     * Directory of `exec` output.
     */
    dist: string;
    /**
     * Directory to copy files from `dist`.
     */
    target: string;
}
declare function watcherPlugin(options: Options): Plugin;

export default watcherPlugin;
