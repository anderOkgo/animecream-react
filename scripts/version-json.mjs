import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Output of a git command, or null where git or the repo is not available. */
function git(args) {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}

/**
 * Vite plugin: writes `version.json` into the build output (playbook v2.11, D.1), so "what does
 * production run" is one request to `/version.json`: the commit, the branch, whether the tree had
 * uncommitted changes, and the build time. Check it with `curl`, not by opening it in the app's
 * browser: the service worker would handle that navigation.
 */
export default function versionJson() {
  let outDir;
  return {
    name: 'version-json',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const status = git('status --porcelain');
      const version = {
        commit: git('rev-parse HEAD'),
        branch: git('rev-parse --abbrev-ref HEAD'),
        dirty: status === null ? null : status !== '',
        builtAt: new Date().toISOString(),
      };
      writeFileSync(join(outDir, 'version.json'), `${JSON.stringify(version, null, 2)}\n`);
    },
  };
}
