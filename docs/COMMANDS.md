## Commands

Command line reference

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

```shell
$ ano install [<options>]
$ ano install <endpoint> [<endpoint> ..] [<options>]
```

Installs project dependencies recursively.

Project dependencies consist of:

1. `dependencies` specified in `ano.json` of project
2. All “external” dependencies not specified in`ano.json`, but present in `ano_libraries`
3. Any additional `<endpoint>` passed as an argument to this command

When `--save` flag is used, all additional endpoint are saved to `dependencies` in `ano.json`.

Bower recommends to always use `--save` flag to achieve reproducible installs between machines.

Endpoints can have multiple forms:

- `<library>`
- `<library>#<version>`
- `<name>=<library>#<version>`

Where:

- `<library>` is a library URL, physical location or registry name
- `<version>` is a valid range, commit, branch, etc.
- `<name>` is the name it should have locally.

`<library>` can be any one of the following:

|                                |                                          |
| ------------------------------ | ---------------------------------------- |
| * Registered library name      | `Firmata``ArduinoJson`                   |
| Git endpoint                   | `https://github.com/user/library.git`<br>`git@github.com:user/library.git` |
| Git endpoint without .git      | `git+https://github.com/user/library`<br>`git+ssh://git@github.com/user/library` |
| Local folder                   | `my/local/folder/`                       |
| Public Subversion endpoint     | `svn+http://library.googlecode.com/svn/` |
| Private Subversion endpoint    | `svn+ssh://library.googlecode.com/svn/`<br>`svn+https://library.googlecode.com/svn/` |
| Shorthand (defaults to GitHub) | `user/library`                           |
| URL                            | `http://example.com/library.zip` (contents will be extracted)<br>`http://example.com/library.tar` (contents will be extracted) |

A version can be:

|   |   |
| ------------------- | --------------------------------------- |
| semver version      | `#1.2.3`                                |
| version range       | `#1.2`<br>`#~1.2.3`<br>`#^1.2.3`<br>`#>=1.2.3 <2.0` |
| Git tag             | `#<tag>`                                |
| Git commit SHA      | `#<sha>`                                |
| Git branch          | `#<branch>`                             |
| Subversion revision | `#<revision>`                           |


#### install options

* -F, --force-latest: Force latest version on conflict
* -p, --production: Do not install project devDependencies
* -S, --save: Save installed libraries into the project’s ano.json dependencies
* -D, --save-dev: Save installed libraries into the project’s ano.json devDependencies
* -E, --save-exact: Configure installed libraries with an exact version rather than semver

### uninstall

__TBD__

### update

__TBD__
