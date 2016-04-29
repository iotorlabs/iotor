## Commands

Command line reference

[TOC]

### cache

```sh
$ ano cache <command> [<args>]
```

Manage ano cache

#### cache clean
```sh
$ ano cache clean
$ ano cache clean <name> [<name> ...]
$ ano cache clean <name>#<version> [<name>#<version> ..]
```
Cleans cached packages

#### cache list

```sh
$ ano cache list
$ ano cache list <name> [<name> ...]
```
Lists cached packages

### home

```sh
$ ano home
$ ano home <package>
$ ano home <package>#<version>
```

Opens a package homepage into your favorite browser.

If no <package> is passed, opens the homepage of the local package.

### info
```
$ ano info <package>
$ ano info <package> [<property>]
$ ano info <package>#<version> [<property>]
```

Displays overall information of a package or of a particular version.

### init

```sh
$ ano init
```

Interactively create a firmware or library project.

### config

```sh
$ ano config
```

Interactively config project's board and port settings.

### install

```sh
$ ano install [<options>]
$ ano install <endpoint> [<endpoint> ..] [<options>]
```

Installs project dependencies recursively.

Project dependencies consist of:

1. `dependencies` specified in `ano.json` of project
2. All “external” dependencies not specified in`ano.json`, but present in `ano_libraries`
3. Any additional `<endpoint>` passed as an argument to this command

When `--save` flag is used, all additional endpoint are saved to `dependencies` in `ano.json`.

ano recommends to always use `--save` flag to achieve reproducible installs between machines.

Endpoints can have multiple forms:

- `<library>`
- `<library>#<version>`
- `<name>=<library>#<version>`

Where:

- `<library>` is a library URL, physical location or registry name
- `<version>` is a valid range, commit, branch, etc.
- `<name>` is the name it should have locally.

`<library>` can be any one of the following:

| Type                           | Examples                                 |
| ------------------------------ | ---------------------------------------- |
| *Registered library name*      | `Firmata``ArduinoJson`                   |
| Git endpoint                   | `https://github.com/user/library.git`<br>`git@github.com:user/library.git` |
| Git endpoint without .git      | `git+https://github.com/user/library`<br>`git+ssh://git@github.com/user/library` |
| Local folder                   | `my/local/folder/`                       |
| Public Subversion endpoint     | `svn+http://library.googlecode.com/svn/` |
| Private Subversion endpoint    | `svn+ssh://library.googlecode.com/svn/`<br>`svn+https://library.googlecode.com/svn/` |
| Shorthand (defaults to GitHub) | `user/library`                           |
| URL                            | `http://example.com/library.zip` (contents will be extracted)<br>`http://example.com/library.tar` (contents will be extracted) |

A version can be:

| Type  				  | Examples                                |
| ------------------- | --------------------------------------- |
| semver version      | `#1.2.3`                                |
| version range       | `#1.2`<br>`#~1.2.3`<br>`#^1.2.3`<br>`#>=1.2.3 <2.0` |
| Git tag             | `#<tag>`                                |
| Git commit SHA      | `#<sha>`                                |
| Git branch          | `#<branch>`                             |
| Subversion revision | `#<revision>`                           |


**install options**

* -F, --force-latest: Force latest version on conflict
* -p, --production: Do not install project devDependencies
* -S, --save: Save installed libraries into the project’s ano.json dependencies
* -D, --save-dev: Save installed libraries into the project’s ano.json devDependencies
* -E, --save-exact: Configure installed libraries with an exact version rather than semver

### link

```sh
$ ano link
$ ano link <name> [<local name>]
```
The link functionality allows developers to easily test their packages. Linking is a two-step process.

Using ‘ano link’ in a project folder will create a global link. Then, in some other package, ano link <name> will create a link in the components folder pointing to the previously created link.

This allows you to easily test a package because changes will be reflected immediately. When the link is no longer necessary, simply remove it with ano uninstall <name>.

### list

```sh
$ ano list [<options>]
```
List local packages and possible updates.

**list options**

* -p, --paths: Generates a simple JSON source mapping
* -r, --relative: Make paths relative to the directory config property, which defaults to ano_components
lookup

```sh
$ ano lookup <name>
```
Look up a package URL by name

### prune

```sh
$ ano prune
```
Uninstalls local extraneous packages

### update

```sh
$ ano update <name> [<name> ..] [<options>]
```

Updates installed packages to their newest version according to ano.json.

**update options**

* -F, --force-latest: Force latest version on conflict
* -p, --production: Do not install project devDependencies
* -S, --save: Update dependencies in ano.json
* -D, --save-dev: Update devDependencies in ano.json

### uninstall

```sh
$ ano uninstall <name> [<name> ..] [<options>]
```

Uninstalls a package locally from your ano_components directory

**uninstall options**

* -S, --save: Remove uninstalled packages from the project’s ano.json dependencies
* -D, --save-dev: Remove uninstalled packages from the project’s ano.json devDependencies

### version

```sh
$ ano version [<newversion> | major | minor | patch]
```

Run this in a package directory to bump the version and write the new data back to the ano.json file.

The newversion argument should be a valid semver string, or a valid second argument to semver.inc (one of “build”, “patch”, “minor”, or “major”). In the second case, the existing version will be incremented by 1 in the specified field.

If run in a git repo, it will also create a version commit and tag, and fail if the repo is not clean.

**version options**

* `-m, --message`: Custom git commit and tag message
If supplied with `--message` (shorthand: `-m`) config option, ano will use it as a commit message when creating a version commit. If the message config contains %s then that will be replaced with the resulting version number. For example:

```sh
$ ano version patch -m "Upgrade to %s for reasons"
```
