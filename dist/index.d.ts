import { Plugin } from 'vite';

/**
 * @param watch Directory to watch for changes to run command.
 * @param exec Bash command to run after changes (eg: build).
 * @param dist Directory of `exec` output.
 * @param target Directory to copy files from `dist`.
 */
interface Options {
    watch: string;
    exec: string;
    dist: string;
    target: string;
}
declare function watcherPlugin(options: Options): Plugin;

export default watcherPlugin;
