
## Options

[TOC]

### force
```
-f, --force
```
Makes various commands more forceful

* `iotor install --force` re-installs all installed components. It also forces installation even when there are non-iotor directories with the same name in the components directory. Adding --force also bypasses the cache, and writes to the cache anyway.
* `iotor uninstall <package> --force` continues uninstallation even after a dependency conflict
* `iotor register <package> --force` bypasses confirmation. Login is still needed.

### json
```
-j, --json
```
Output consumable JSON

### loglevel
```
-l, --loglevel
```
What level of logs to report. Possible values: error, conflict, warn, action, info, debug

### offline
```
-o, --offline
```
Do not use network connection

### quiet
```
-q, --quiet
```
Only output important information. It is an alias for `--loglevel=warn`.

### silent
```
-s, --silent
```
Do not output anything, besides errors. It is an alias for `--loglevel=error`. Silent is also useful if you have private components that might leak credentials to your CI environment.

### verbose
```
-V, --verbose
```
Makes output more verbose. It is an alias for `--loglevel=debug`.

### allow-root
```
--allow-root
```
Allows running commands as root. iotor is a user command, there is no need to execute it with superuser permissions. However, if you still want to run commands with sudo, use `--allow-root` option.
