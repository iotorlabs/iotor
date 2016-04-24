# ano

> Arduino library manager and toolchain generator based on CMake developed by NodeJS.

## Main purpose

* Using `CLion` to develop arduino project elegantly and less manuel config.
* Include libraries locally like `npm` and `bower` from `github`.

## Pre-installation

* [Arduino](http://arduino.cc/)
* [NodeJS](https://nodejs.org/)
* [CMake](https://cmake.org/)

## Installation

```sh
> npm i ano -g
```

## Status

`ano` implemented basic features to compile, calculate size and upload based on CMake.

* [x] `init` command to create a firmware arduino cmake project.
* [x] `config` command to config board, board options and serial port for project.
* [x] Compile and upload based on [arduino-cmake](https://github.com/queezythegreat/arduino-cmake)
* [ ] Library manager like [bower](http://bower.io)
* [ ] Refactor code to use node.js to hold main work, so we can generate some other toolchain files like eclipse, visual studio.
...

## Usage

### `ano init`

Create an arduino cmake project. Using arduino board and port preference as default.

```sh
> ano init
```

### `ano config`

Config board, board options and port for project

```sh
> ano config
```

## License

MIT © [Yuan Tao](http://github.com/taoyuan)
