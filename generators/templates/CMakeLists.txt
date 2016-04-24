cmake_minimum_required(VERSION 2.8.5)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")
include(Arduino)

# Set a variable for commands below
set(PROJECT_NAME {{name}})

# Define your project and language
project(${PROJECT_NAME} C CXX ASM)

# Define the source code
set(${PROJECT_NAME}_SRCS ${PROJECT_NAME}.cpp)

# Command to generate code arduino firmware (.hex file)
generate_arduino_@type@(${PROJECT_NAME})
