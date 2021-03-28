import type { Plugin } from "vite";
/**
 * @param watch Directory to watch for changes to run command.
 * @param exec Bash command to run after changes (eg: build)
 * @param dist Directory of `exec` output
 * @param target Directory to copy files from dist
 */
interface WatcherOptions {
    watch: string;
    exec: string;
    dist: string;
    target: string;
}
export default function watcherPlugin(options: WatcherOptions): Promise<Plugin>;
export {};
