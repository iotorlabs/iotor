# iotor

> An Arduino compatible cross-platform build system and library manager.

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
  * CMake - [http://www.cmake.org/cmake/resources/software.html](http://www.cmake.org/cmake/resources/software.html)
  * Arduino SDK - [http://www.arduino.cc/en/Main/Software](http://www.arduino.cc/en/Main/Software)
  * NodeJS - https://nodejs.org/
* Linux requirements:
  * `gcc-avr` - AVR GNU GCC compiler
  * `binutils-avr` - AVR binary tools
  * `avr-libc` - AVR C library
  * `avrdude` - Firmware uploader
  * `arm-none-eabi-gcc` - ARM cross compile toolchain

## Thanks

I would like to thank all the people that contributed to the following great project:

* [Arduino CMake](https://github.com/queezythegreat/arduino-cmake)
* [Bower](https://gihub.com/bower/bower)

## Installation

```sh
> npm i -g iotor
```

## Getting Started

The following instructions are for ***nix** type systems, specifically this is a Linux example.

In short you can get up and running using the following commands:

```
mkdir build
cd build
cmake ..
make
make upload        # to upload all firmware images             [optional]
make blink-serial  # to get a serial terminal to wire_serial   [optional]
```

For a more detailed explanation.

### 1. Initializing firmware project

```sh
# Initializing project
$ iotor init
```

Interactively initializing project by select `firmware` for the first prompt in a empty folder or existing project dir.

When `init` in an existing project dir, it will skip all existing files and create the necessary files that not exists. So we can apply `iotor` to any existing arduino project easily.

Firmware project structure:

```
Project
+-- iotor.yml
+-- library.json
+-- CMakeLists.txt
+-- <Project>.ino
```

- `iotor.yml` is the project user settings file. Boards and Port settings defined in there.
- `library.json` is the iotor config file to define project's name, version and dependencies.
- `CMakeLists.txt` is the cmake main file
- `<Project>.ino` it the main `ino` source file. `<Project>` name is depended on the parent folder name.

### 2. Select the board

`init` command will generate a default `iotor.yml` using current Arduino board and serial port settings. If that is not match the real situation, just run `iotor config` to change it interactively.

### 3. Creating a build directory

CMake has a great feature called out-of-source builds, what this means is the building is done in a completely separate directory from where the sources are. The benefit of this is you don't have any clutter in your source directory and you won't accidentally commit something that is auto-generated.

So let's create that build directory:

```
mkdir build
cd build
```

### 4. Creating the build system

Now let's create the build system that will create our firmware:

```
cmake ..

```

If you rather use a GUI, use:

```
cmake-gui ..
```

### 5. Building

Next we will build everything:

```
make
```

### 6. Uploading

Once everything built correctly we can upload. Depending on your Arduino you will have to update the serial port used for uploading the firmware. To change the port  just run `iotor config` to change it interactively.

Ok lets do a upload of all firmware images:

```
make upload

```

If you have an upload sync error then try resetting/ power cycling the board before starting the upload process.

__NOTE__ Of cause, you can use any ide as you like, such as [CLion](https://www.jetbrains.com/clion/) (Unfortunately, there is no free version)

## Usage

>  See complete command line reference at [Commands](docs/COMMANDS.md) and [Options](docs/OPTIONS.md)

`iotor` support firmware and library project.

A `firmware` project is the project that contains the main `.ino` and other `.h` and `.cpp` files. `iotor` will generate a upload target for firmware project.

A `library` project is the project that contains the `<Library>.h` and all source files. `iotor` will build an examples auto load tool for  sub `examples` folder.

### Installing libraries and dependencies

```sh
# install dependencies listed in library.json
$ iotor install

# install a library and add it to library.json
$ iotor install <library> --save

# install specific version of a library and add it to library.json
$ iotor install <library>#<version> --save
```

### Using libraries

As soon as creating an `iotor` project, we can use it as a generic cmake project. We can use arduino library as usual.

And also, we can `iotor install` a 3rd party library from git, local or an url to `ano_libraries`. Use it just in `<Project>.ino`:

```c++
#include <Arduino.h>
#include "Library.h" // The 3rd party library installed by "iotor install"

void setup() {
  ...
}

void loop() {
  ...
}
```

### Uninstalling libraries
To uninstall a locally installed library:

```shell
# Uninstall library from iotor-libraries
$ iotor uninstall <library-name>

# Uninstall library from iotor-libraries and remove from library.json
$ iotor uninstall <library-name> --save
```

### Creating library
Interactively initializing project by select `library` for the first prompt in a empty folder or existing project dir.

### Creating examples of library
* Create `examples` folder in library dir if not exists.


* Create an example folder in `examples`
* Create the main `ino` file with the same name as the parent folder

Finally `cmake` and `make`

## Why not PlatformIO
PlatformIO suppose to create an open source ecosystem for IoT development, cross-platform build system and library manager.It has built a lot of great tools, especially `PlatformIO IDE for Atom`, support so may series boards.
However, due to its characteristics of hardware support, we can not use Arduino compatible board the first time, such as [Arduino_STM32](https://github.com/rogerclarkmelbourne/Arduino_STM32).

There are some advantages compared to PlatformIO.

* `iotor` support [CLion](https://www.jetbrains.com/clion/) in CMake way. So the code auto-completion will work out of box.
* `iotor` suppose to support arduino compatible boards without customize for `iotor`. Such as [Arduino_STM32](https://github.com/rogerclarkmelbourne/Arduino_STM32).
* `iotor` has more easier way to install library from github, local file and an url (more info see [Here](docs/COMMANDS.md#install)).

## Resources

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
