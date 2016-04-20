cmake_minimum_required(VERSION 2.8.5)
include(CMakeParseArguments)


#=============================================================================#
# [PRIVATE/INTERNAL]
#
# setup_arduino_core(VAR_NAME BOARD_ID)
#
#        VAR_NAME    - Variable name that will hold the generated library name
#
# Creates the Arduino Core library for the specified board,
# each board gets it's own version of the library.
#
#=============================================================================#
function(setup_arduino_core VAR_NAME)
  set(CORE_LIB_NAME ${BOARD_ID}_CORE)
  if (BOARD_CORE_PATH)
    if (NOT TARGET ${CORE_LIB_NAME})
      find_c_sources(CORE_C_FILES ${BOARD_CORE_PATH} True)
      find_cxx_sources(CORE_CXX_FILES ${BOARD_CORE_PATH} True)

      # Debian/Ubuntu fix
      list(REMOVE_ITEM CORE_CXX_FILES "${BOARD_CORE_PATH}/main.cxx")

      add_library(${CORE_LIB_NAME}
          ${CORE_C_FILES}
          ${CORE_CXX_FILES})

      get_arduino_flags(ARDUINO_COMPILE_FLAGS ARDUINO_LINK_FLAGS FALSE)

      get_arduino_c_flags(ARDUINO_C_FLAGS)
      set(ARDUINO_C_FLAGS "${ARDUINO_C_FLAGS} ${ARDUINO_COMPILE_FLAGS}")
      get_arduino_cxx_flags(ARDUINO_CXX_FLAGS)
      set(ARDUINO_CXX_FLAGS "${ARDUINO_CXX_FLAGS} ${ARDUINO_COMPILE_FLAGS}")
      get_arduino_linker_flags(ARDUINO_LINK_FLAGS)
      set(ARDUINO_LINK_FLAGS "${ARDUINO_LINK_FLAGS} ${ARDUINO_LINK_FLAGS}")

      set_source_files_properties(${CORE_C_FILES}
          PROPERTIES COMPILE_FLAGS ${ARDUINO_C_FLAGS})

      set_source_files_properties(${CORE_CXX_FILES}
          PROPERTIES COMPILE_FLAGS ${ARDUINO_CXX_FLAGS})

      set_target_properties(${CORE_LIB_NAME} PROPERTIES
          LINK_FLAGS "${ARDUINO_LINK_FLAGS}")
    endif ()
    set(${VAR_NAME} ${CORE_LIB_NAME} PARENT_SCOPE)
  endif ()
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
# get_arduino_flags(COMPILE_FLAGS LINK_FLAGS BOARD_ID MANUAL)
#
#       COMPILE_FLAGS_VAR -Variable holding compiler flags
#       LINK_FLAGS_VAR - Variable holding linker flags
#       MANUAL - (Advanced) Only use AVR Libc/Includes
#
# Configures the the build settings for the specified Arduino Board.
#
#=============================================================================#
function(get_arduino_flags COMPILE_FLAGS_VAR LINK_FLAGS_VAR MANUAL)
  if (BOARD_CORE_PATH)
    # output
    set(COMPILE_FLAGS "")

    if (DEFINED BUILD_VID)
      set(COMPILE_FLAGS "${COMPILE_FLAGS} -DUSB_VID=${BUILD_VID}")
    endif ()
    if (DEFINED BUILD_PID)
      set(COMPILE_FLAGS "${COMPILE_FLAGS} -DUSB_PID=${BUILD_PID}")
    endif ()
    if (NOT MANUAL)
      set(COMPILE_FLAGS "${COMPILE_FLAGS} -I\"${BOARD_CORE_PATH}\"")
      foreach (LIB_PATH ${ARDUINO_LIBRARIES_PATHS})
        set(COMPILE_FLAGS "${COMPILE_FLAGS} -I\"${LIB_PATH}\"")
      endforeach ()

      if (BOARD_VARIANT_PATH)
        set(COMPILE_FLAGS "${COMPILE_FLAGS} -I\"${BOARD_VARIANT_PATH}\"")
      endif ()
    endif ()
    set(LINK_FLAGS "")

    # output
    set(${COMPILE_FLAGS_VAR} "${COMPILE_FLAGS}" PARENT_SCOPE)
    set(${LINK_FLAGS_VAR} "${LINK_FLAGS}" PARENT_SCOPE)

  else ()
    message(FATAL_ERROR "No board core path has been set (${BOARD_CORE_PATH}), aborting.")
  endif ()
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
# find_all_sources(VAR_NAME LIB_PATH RECURSE)
#
#        VAR_NAME - Variable name that will hold the detected sources
#        LIB_PATH - The base path
#        RECURSE  - Whether or not to recurse
#
# Finds all C/C++ sources located at the specified path.
#
#=============================================================================#
function(find_all_sources VAR_NAME LIB_PATH RECURSE)
  set(FILE_SEARCH_LIST
      ${LIB_PATH}/*.cpp
      ${LIB_PATH}/*.c
      ${LIB_PATH}/*.cc
      ${LIB_PATH}/*.cxx
      ${LIB_PATH}/*.h
      ${LIB_PATH}/*.hh
      ${LIB_PATH}/*.hxx)

  if (RECURSE)
    file(GLOB_RECURSE LIB_FILES ${FILE_SEARCH_LIST})
  else ()
    file(GLOB LIB_FILES ${FILE_SEARCH_LIST})
  endif ()

  if (LIB_FILES)
    set(${VAR_NAME} ${LIB_FILES} PARENT_SCOPE)
  endif ()
endfunction()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# find_c_sources(VAR_NAME LIB_PATH RECURSE)
#
#        VAR_NAME - Variable name that will hold the detected sources
#        LIB_PATH - The base path
#        RECURSE  - Whether or not to recurse
#
# Finds all C sources located at the specified path.
#
#=============================================================================#
function(find_c_sources VAR_NAME LIB_PATH RECURSE)
  set(FILE_SEARCH_LIST
      ${LIB_PATH}/*.c
      ${LIB_PATH}/*.h)

  if (RECURSE)
    file(GLOB_RECURSE LIB_FILES ${FILE_SEARCH_LIST})
  else ()
    file(GLOB LIB_FILES ${FILE_SEARCH_LIST})
  endif ()

  if (LIB_FILES)
    set(${VAR_NAME} ${LIB_FILES} PARENT_SCOPE)
  endif ()
endfunction()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# find_c_sources(VAR_NAME LIB_PATH RECURSE)
#
#        VAR_NAME - Variable name that will hold the detected sources
#        LIB_PATH - The base path
#        RECURSE  - Whether or not to recurse
#
# Finds all C++ sources located at the specified path.
#
#=============================================================================#
function(find_cxx_sources VAR_NAME LIB_PATH RECURSE)
  set(FILE_SEARCH_LIST
      ${LIB_PATH}/*.cpp
      ${LIB_PATH}/*.cc
      ${LIB_PATH}/*.cxx
      ${LIB_PATH}/*.hh
      ${LIB_PATH}/*.hxx)

  if (RECURSE)
    file(GLOB_RECURSE LIB_FILES ${FILE_SEARCH_LIST})
  else ()
    file(GLOB LIB_FILES ${FILE_SEARCH_LIST})
  endif ()

  if (LIB_FILES)
    set(${VAR_NAME} ${LIB_FILES} PARENT_SCOPE)
  endif ()
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
#  arduino_debug_on()
#
# Enables Arduino module debugging.
#=============================================================================#
function(ARDUINO_DEBUG_ON)
    set(ARDUINO_DEBUG True PARENT_SCOPE)
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
#  arduino_debug_off()
#
# Disables Arduino module debugging.
#=============================================================================#
function(ARDUINO_DEBUG_OFF)
    set(ARDUINO_DEBUG False PARENT_SCOPE)
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
# arduino_debug_msg(MSG)
#
#        MSG - Message to print
#
# Print Arduino debugging information. In order to enable printing
# use arduino_debug_on() and to disable use arduino_debug_off().
#=============================================================================#
function(ARDUINO_DEBUG_MSG MSG)
    if(ARDUINO_DEBUG)
        message("## ${MSG}")
    endif()
endfunction()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# print_list(SETTINGS_LIST)
#
#      SETTINGS_LIST - Variables name of settings list
#
# Print list settings and names (see load_arduino_syle_settings()).
#=============================================================================#
function(PRINT_LIST SETTINGS_LIST)
  if (${SETTINGS_LIST})
    set(MAX_LENGTH 0)
    foreach (ENTRY_NAME ${${SETTINGS_LIST}})
      string(LENGTH "${ENTRY_NAME}" CURRENT_LENGTH)
      if (CURRENT_LENGTH GREATER MAX_LENGTH)
        set(MAX_LENGTH ${CURRENT_LENGTH})
      endif ()
    endforeach ()
    foreach (ENTRY_NAME ${${SETTINGS_LIST}})
      string(LENGTH "${ENTRY_NAME}" CURRENT_LENGTH)
      math(EXPR PADDING_LENGTH "${MAX_LENGTH}-${CURRENT_LENGTH}")
      set(PADDING "")
      foreach (X RANGE ${PADDING_LENGTH})
        set(PADDING "${PADDING} ")
      endforeach ()
      message(STATUS "   ${PADDING}${ENTRY_NAME}: ${${ENTRY_NAME}.name}")
    endforeach ()
  endif ()
endfunction()


#=============================================================================#
#                          Initialization
#=============================================================================#
if (NOT ARDUINO_INITIALIZED)
  set(ARDUINO_LIBRARIES_PATHS)

  find_file(ARDUINO_BUILTIN_LIBRARIES_PATH
      NAMES libraries
      PATHS ${ARDUINO_SDK_PATH}
      DOC "Path to directory containing the Arduino builtin libraries."
      NO_SYSTEM_ENVIRONMENT_PATH)

  if (ARDUINO_BUILTIN_LIBRARIES_PATH)
    list(APPEND ARDUINO_LIBRARIES_PATHS ${ARDUINO_BUILTIN_LIBRARIES_PATH})
  endif ()

  find_file(ARDUINO_DOC_LIBRARIES_PATH
      NAMES libraries
      PATHS ${ARDUINO_DOC_PATH}
      DOC "Path to directory containing the Arduino custom libraries."
      NO_SYSTEM_ENVIRONMENT_PATH)

  if (ARDUINO_DOC_LIBRARIES_PATH)
    list(APPEND ARDUINO_LIBRARIES_PATHS ${ARDUINO_DOC_LIBRARIES_PATH})
  endif ()

  find_file(ARDUINO_PLATFORM_LIBRARIES_PATH
      NAMES libraries
      PATHS ${RUNTIME_PLATFORM_PATH}
      DOC "Path to directory containing the Arduino platform libraries."
      NO_SYSTEM_ENVIRONMENT_PATH)

  if (ARDUINO_PLATFORM_LIBRARIES_PATH)
    list(APPEND ARDUINO_LIBRARIES_PATHS ${ARDUINO_PLATFORM_LIBRARIES_PATH})
  endif ()

  set(ARDUINO_INITIALIZED True)
  mark_as_advanced(
      ARDUINO_BUILTIN_LIBRARIES_PATH
      ARDUINO_DOC_LIBRARIES_PATH
      ARDUINO_PLATFORM_LIBRARIES_PATH
      ARDUINO_LIBRARIES_PATHS)
endif ()
