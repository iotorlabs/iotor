cmake_minimum_required(VERSION 2.8)

include(Arduino.cmake)

project(HelloWorld C CXX ASM)

set(${PROJECT_NAME}_SRCS hello.cpp)
generate_arduino_firmware(${PROJECT_NAME})
