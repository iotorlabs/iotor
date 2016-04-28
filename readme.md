# ano

> An arduino library manager and toolchain generator based on CMake developed by NodeJS.

ANO is a generic arduino cmake generator  and generic arduino library manager.

## Features

* Suppose to support all boards that arduino supported including 3rd party ARM boards
* Config board and port by an interactive command
* No manual operation required unless you want to
* No additional cmake file in your project like [Arduino CMake](https://github.com/queezythegreat/arduino-cmake)
* Manage 3rd party or own libraries in [Bower](https://bower.io) way
* No system wide dependencies
* No dependencies are shared between different apps
* Using a flat dependency tree  model to manage the dependences between libraries
* Support Arduino type libraries
* Install library from Git/Github, local file system and an url
* Manage library version in project scope
* Support library project including examples targets
* Using any editor or ide that you like and compile, build and upload with CMake
* Cross-platform: Windows, Linux, Mac

## Requirements

* Base requirements:
  * Make - [http://www.cmake.org/cmake/resources/software.html](http://www.cmake.org/cmake/resources/software.html)
  * Arduino SDK - [http://www.arduino.cc/en/Main/Software](http://www.arduino.cc/en/Main/Software)
  * NodeJS - https://nodejs.org/
* Linux requirements:
  * `gcc-avr` - AVR GNU GCC compiler
  * `binutils-avr` - AVR binary tools
  * `avr-libc` - AVR C library
  * `avrdude` - Firmware uploader
  * `[arm-none-eabi-gcc]` - ARM cross compile toolchain

## Thanks

I would like to thank all the people that contributed to the following great project:

* [Arduino CMake](https://github.com/queezythegreat/arduino-cmake)
* [Bower](https://gihub.com/bower/bower)

## Installation

```sh
> npm i -g ano
```

## Usage

See complete command line reference at [Commands](COMMANDS.md)

### Developing firmware
...

#### Creating firmware project
...

#### Installing libraries and dependencies

```sh
# install dependencies listed in ano.json
$ ano install

# install a library and add it to ano.json
$ ano install <library> --save

# install specific version of a library and add it to ano.json
$ ano install <library>#<version> --save
```

#### Using libraries
...

#### Uninstalling libraries
...

### Developing libraries
...

#### Creating library project
...

#### Creating an example
...

Resources
---------

Here are some resources you might find useful in getting started.

* CMake:
  * [Offical CMake Tutorial](http://www.cmake.org/cmake/help/cmake_tutorial.html)
  * [CMake Tutorial](http://mathnathan.com/2010/07/11/getting-started-with-cmake/)
  * [CMake Reference](http://www.cmake.org/cmake/help/cmake-2-8-docs.html)


* Arduino:
  * [Getting Started](http://www.arduino.cc/en/Guide/HomePage) - Introduction to Arduino
  * [Playground](http://www.arduino.cc/playground/) - User contributed documentation and help
  * [Arduino Forums](http://www.arduino.cc/forum/) - Official forums
  * [Arduino Reference](http://www.arduino.cc/en/Reference/HomePage) - Official reference manual

## License

MIT © [Yuan Tao](http://github.com/taoyuan)
