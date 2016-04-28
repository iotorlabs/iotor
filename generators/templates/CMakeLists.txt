cmake_minimum_required(VERSION 2.8.5)

list(APPEND CMAKE_MODULE_PATH "{{root}}/cmake")
include(Arduino)

# Define your project and language
project({{name}} C CXX ASM)

{{#if library}}
# Command to generate code arduino library
generate_arduino_library({{name}}
  HDRS {{name}}.h
  SRCS {{name}}.cpp)
{{else}}
# Command to generate code arduino firmware (.hex file)
generate_arduino_firmware({{name}}
  SKETCH {{name}}.ino)
{{/if}}
