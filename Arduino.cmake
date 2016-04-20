cmake_minimum_required(VERSION 2.8.5)
include(CMakeParseArguments)

#=============================================================================#
# [PUBLIC/USER]
# see documentation at top
#=============================================================================#
function(GENERATE_ARDUINO_FIRMWARE INPUT_NAME)
  message(STATUS "Generating ${INPUT_NAME}")
  parse_generator_arguments(${INPUT_NAME} INPUT
      "NO_AUTOLIBS;MANUAL"                  # Options
      "BOARD;PORT;SKETCH;PROGRAMMER"        # One Value Keywords
      "SERIAL;SRCS;HDRS;LIBS;ARDLIBS;AFLAGS"  # Multi Value Keywords
      ${ARGN})

  if (NOT INPUT_PORT)
    set(INPUT_PORT ${ARDUINO_DEFAULT_PORT})
  endif ()
  if (NOT INPUT_SERIAL)
    set(INPUT_SERIAL ${ARDUINO_DEFAULT_SERIAL})
  endif ()
  if (NOT INPUT_PROGRAMMER)
    set(INPUT_PROGRAMMER ${ARDUINO_DEFAULT_PROGRAMMER})
  endif ()
  if (NOT INPUT_MANUAL)
    set(INPUT_MANUAL FALSE)
  endif ()

  set(ALL_LIBS)
  set(ALL_SRCS ${INPUT_SRCS} ${INPUT_HDRS})
  set(LIB_DEP_INCLUDES)

  if (NOT INPUT_MANUAL)
    setup_arduino_core(CORE_LIB ${BOARD_ID})
  endif ()

  if (NOT "${INPUT_SKETCH}" STREQUAL "")
    get_filename_component(INPUT_SKETCH "${INPUT_SKETCH}" ABSOLUTE)
    setup_arduino_sketch(${INPUT_NAME} ${INPUT_SKETCH} ALL_SRCS)
    if (IS_DIRECTORY "${INPUT_SKETCH}")
      set(LIB_DEP_INCLUDES "${LIB_DEP_INCLUDES} -I\"${INPUT_SKETCH}\"")
    else ()
      get_filename_component(INPUT_SKETCH_PATH "${INPUT_SKETCH}" PATH)
      set(LIB_DEP_INCLUDES "${LIB_DEP_INCLUDES} -I\"${INPUT_SKETCH_PATH}\"")
    endif ()
  endif ()

  required_variables(VARS ALL_SRCS MSG "must define SRCS or SKETCH for target ${INPUT_NAME}")

  find_arduino_libraries(TARGET_LIBS "${ALL_SRCS}" "${INPUT_ARDLIBS}")
  foreach (LIB_DEP ${TARGET_LIBS})
    arduino_debug_msg("Arduino Library: ${LIB_DEP}")
    set(LIB_DEP_INCLUDES "${LIB_DEP_INCLUDES} -I\"${LIB_DEP}\" -I\"${LIB_DEP}/src\"")
  endforeach ()

  if (NOT INPUT_NO_AUTOLIBS)
    setup_arduino_libraries(ALL_LIBS ${BOARD_ID} "${ALL_SRCS}" "${INPUT_ARDLIBS}" "${LIB_DEP_INCLUDES}" "")
    foreach (LIB_INCLUDES ${ALL_LIBS_INCLUDES})
      arduino_debug_msg("Arduino Library Includes: ${LIB_INCLUDES}")
      set(LIB_DEP_INCLUDES "${LIB_DEP_INCLUDES} ${LIB_INCLUDES}")
    endforeach ()
  endif ()

  list(APPEND ALL_LIBS ${CORE_LIB} ${INPUT_LIBS})

  setup_arduino_target(${INPUT_NAME} ${BOARD_ID} "${ALL_SRCS}" "${ALL_LIBS}" "${LIB_DEP_INCLUDES}" "" "${INPUT_MANUAL}")

  if (INPUT_PORT)
    setup_arduino_upload(${BOARD_ID} ${INPUT_NAME} ${INPUT_PORT} "${INPUT_PROGRAMMER}" "${INPUT_AFLAGS}")
  endif ()

  if (INPUT_SERIAL)
    setup_serial_target(${INPUT_NAME} "${INPUT_SERIAL}" "${INPUT_PORT}")
  endif ()

endfunction()

#=============================================================================#
#                        Internal Functions
#=============================================================================#

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# parse_generator_arguments(TARGET_NAME PREFIX OPTIONS ARGS MULTI_ARGS [ARG1 ARG2 .. ARGN])
#
#         PREFIX     - Parsed options prefix
#         OPTIONS    - List of options
#         ARGS       - List of one value keyword arguments
#         MULTI_ARGS - List of multi value keyword arguments
#         [ARG1 ARG2 .. ARGN] - command arguments [optional]
#
# Parses generator options from either variables or command arguments
#
#=============================================================================#
macro(PARSE_GENERATOR_ARGUMENTS TARGET_NAME PREFIX OPTIONS ARGS MULTI_ARGS)
  cmake_parse_arguments(${PREFIX} "${OPTIONS}" "${ARGS}" "${MULTI_ARGS}" ${ARGN})
  error_for_unparsed(${PREFIX})
  load_generator_settings(${TARGET_NAME} ${PREFIX} ${OPTIONS} ${ARGS} ${MULTI_ARGS})
endmacro()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# load_generator_settings(TARGET_NAME PREFIX [SUFFIX_1 SUFFIX_2 .. SUFFIX_N])
#
#         TARGET_NAME - The base name of the user settings
#         PREFIX      - The prefix name used for generator settings
#         SUFFIX_XX   - List of suffixes to load
#
#  Loads a list of user settings into the generators scope. User settings have
#  the following syntax:
#
#      ${BASE_NAME}${SUFFIX}
#
#  The BASE_NAME is the target name and the suffix is a specific generator settings.
#
#  For every user setting found a generator setting is created of the follwoing fromat:
#
#      ${PREFIX}${SUFFIX}
#
#  The purpose of loading the settings into the generator is to not modify user settings
#  and to have a generic naming of the settings within the generator.
#
#=============================================================================#
function(LOAD_GENERATOR_SETTINGS TARGET_NAME PREFIX)
  foreach (GEN_SUFFIX ${ARGN})
    if (${TARGET_NAME}_${GEN_SUFFIX} AND NOT ${PREFIX}_${GEN_SUFFIX})
      set(${PREFIX}_${GEN_SUFFIX} ${${TARGET_NAME}_${GEN_SUFFIX}} PARENT_SCOPE)
    endif ()
  endforeach ()
endfunction()

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
      find_s_sources(CORE_S_FILES ${BOARD_CORE_PATH} True)

      # Debian/Ubuntu fix
      list(REMOVE_ITEM CORE_CXX_FILES "${BOARD_CORE_PATH}/main.cxx")

      add_library(${CORE_LIB_NAME}
          ${CORE_C_FILES}
          ${CORE_CXX_FILES}
          ${CORE_S_FILES})

      get_arduino_flags(ARDUINO_C_FLAGS ARDUINO_CXX_FLAGS ARDUINO_LINK_FLAGS ${BOARD_ID} FALSE)
      set_source_files_properties(${CORE_C_FILES}
          PROPERTIES COMPILE_FLAGS ${ARDUINO_C_FLAGS})
      set_source_files_properties(${CORE_CXX_FILES}
          PROPERTIES COMPILE_FLAGS ${ARDUINO_CXX_FLAGS})

      # S Files
      get_arduino_s_flags(ARDUINO_S_FLAGS)
      set_source_files_properties(${CORE_S_FILES}
          PROPERTIES LANGUAGE C COMPILE_FLAGS ${ARDUINO_S_FLAGS})

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
#       COMPILE_C_FLAGS_VAR -Variable holding compiler C flags
#       COMPILE_CXX_FLAGS_VAR -Variable holding compiler C++ flags
#       LINK_FLAGS_VAR - Variable holding linker flags
#       BOARD_ID - The board id name
#       MANUAL - (Advanced) Only use AVR Libc/Includes
#
# Configures the the build settings for the specified Arduino Board.
#
#=============================================================================#
function(get_arduino_flags COMPILE_C_FLAGS_VAR COMPILE_CXX_FLAGS_VAR LINK_FLAGS_VAR BOARD_ID MANUAL)
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

    get_arduino_c_flags(ARDUINO_C_FLAGS)
    get_arduino_cxx_flags(ARDUINO_CXX_FLAGS)
    get_arduino_linker_flags(ARDUINO_LINKER_FLAGS)

    # output
    set(${COMPILE_C_FLAGS_VAR} "${ARDUINO_C_FLAGS} ${COMPILE_FLAGS}" PARENT_SCOPE)
    set(${COMPILE_CXX_FLAGS_VAR} "${ARDUINO_CXX_FLAGS} ${COMPILE_FLAGS}" PARENT_SCOPE)
    set(${LINK_FLAGS_VAR} "${ARDUINO_LINKER_FLAGS} ${LINK_FLAGS}" PARENT_SCOPE)
  else ()
    message(FATAL_ERROR "No board core path has been set (${BOARD_CORE_PATH}), aborting.")
  endif ()
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
# find_sources(VAR_NAME PATTERNS LIB_PATHS RECURSE)
#
#        VAR_NAME - Variable name that will hold the detected sources
#        PATTERNS - The file patterns
#        PATHS - The base paths
#        RECURSE  - Whether or not to recurse
#
# Finds all C/C++ sources located at the specified path.
#
#=============================================================================#
function(find_sources VAR_NAME PATTERNS PATHS RECURSE)
  list(APPEND LIB_PATHS ${PATHS})
  list(APPEND LIB_PATTERNS ${PATTERNS})

  set(LIB_FILES)
  foreach (LIB_PATH ${LIB_PATHS})
    if (RECURSE)
      #      message(==== "${LIB_PATH}")

      file(GLOB_RECURSE FILES RELATIVE ${LIB_PATH} ${LIB_PATTERNS})
    else ()
      file(GLOB FILES RELATIVE ${LIB_PATH} ${LIB_PATTERNS})
    endif ()
    set(LIB_FILES ${LIB_FILES} ${FILES})
  endforeach ()

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
# find_s_sources(VAR_NAME LIB_PATH RECURSE)
#
#        VAR_NAME - Variable name that will hold the detected sources
#        LIB_PATH - The base path
#        RECURSE  - Whether or not to recurse
#
# Finds all S sources located at the specified path.
#
#=============================================================================#
function(find_s_sources VAR_NAME LIB_PATH RECURSE)
  set(FILE_SEARCH_LIST
      ${LIB_PATH}/*.s)

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
# find_arduino_libraries(VAR_NAME SRCS ARDLIBS)
#
#      VAR_NAME - Variable name which will hold the results
#      SRCS     - Sources that will be analized
#      ARDLIBS  - Arduino libraries identified by name (e.g., Wire, SPI, Servo)
#
#     returns a list of paths to libraries found.
#
#  Finds all Arduino type libraries included in sources. Available libraries
#  are ${ARDUINO_SDK_PATH}/libraries and ${CMAKE_CURRENT_SOURCE_DIR}.
#
#  Also adds Arduino libraries specifically names in ALIBS.  We add ".h" to the
#  names and then process them just like the Arduino libraries found in the sources.
#
#  A Arduino library is a folder that has the same name as the include header.
#  For example, if we have a include "#include <LibraryName.h>" then the following
#  directory structure is considered a Arduino library:
#
#     LibraryName/
#          |- LibraryName.h
#          `- LibraryName.c
#
#  If such a directory is found then all sources within that directory are considred
#  to be part of that Arduino library.
#
#=============================================================================#
function(find_arduino_libraries VAR_NAME SRCS ARDLIBS)
  get_property(include_dirs DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY INCLUDE_DIRECTORIES)

  set(ARDUINO_LIBS)
  foreach (SRC ${SRCS})

    # Skipping generated files. They are, probably, not exist yet.
    # TODO: Maybe it's possible to skip only really nonexisting files,
    # but then it wiil be less deterministic.
    get_source_file_property(_srcfile_generated ${SRC} GENERATED)
    # Workaround for sketches, which are marked as generated
    get_source_file_property(_sketch_generated ${SRC} GENERATED_SKETCH)

    if (NOT ${_srcfile_generated} OR ${_sketch_generated})
      if (NOT (EXISTS ${SRC} OR
          EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/${SRC} OR
          EXISTS ${CMAKE_CURRENT_BINARY_DIR}/${SRC}))
        message(FATAL_ERROR "Invalid source file: ${SRC}")
      endif ()
      file(STRINGS ${SRC} SRC_CONTENTS)

      foreach (LIBNAME ${ARDLIBS})
        list(APPEND SRC_CONTENTS "#include <${LIBNAME}.h>")
      endforeach ()

      foreach (SRC_LINE ${SRC_CONTENTS})
        if ("#${SRC_LINE}#" MATCHES "^#[ \t]*#[ \t]*include[ \t]*[<\"]([^>\"]*)[>\"]#")
          get_filename_component(INCLUDE_NAME ${CMAKE_MATCH_1} NAME_WE)
          get_property(LIBRARY_SEARCH_PATH
              DIRECTORY     # Property Scope
              PROPERTY LINK_DIRECTORIES)
          foreach (LIB_SEARCH_PATH ${include_dirs} ${LIBRARY_SEARCH_PATH} ${ARDUINO_LIBRARIES_PATHS} ${CMAKE_CURRENT_SOURCE_DIR} ${CMAKE_CURRENT_SOURCE_DIR}/libraries ${ARDUINO_EXTRA_LIBRARIES_PATH})
            if (EXISTS ${LIB_SEARCH_PATH}/${INCLUDE_NAME}/${CMAKE_MATCH_1})
              list(APPEND ARDUINO_LIBS ${LIB_SEARCH_PATH}/${INCLUDE_NAME})
              break()
            endif ()
            if (EXISTS ${LIB_SEARCH_PATH}/${INCLUDE_NAME}/src/${CMAKE_MATCH_1})
              list(APPEND ARDUINO_LIBS ${LIB_SEARCH_PATH}/${INCLUDE_NAME})
              break()
            endif ()
            #            get_source_file_property(_header_generated ${LIB_SEARCH_PATH}/${CMAKE_MATCH_1} GENERATED)
            #            if((EXISTS ${LIB_SEARCH_PATH}/${CMAKE_MATCH_1}) OR ${_header_generated})
            #              message(*** " ${LIB_SEARCH_PATH}/${INCLUDE_NAME}")
            #              list(APPEND ARDUINO_LIBS ${LIB_SEARCH_PATH}/${INCLUDE_NAME})
            #              break()
            #            endif()
          endforeach ()
        endif ()
      endforeach ()
    endif ()
  endforeach ()

  if (ARDUINO_LIBS)
    list(REMOVE_DUPLICATES ARDUINO_LIBS)
  endif ()
  set(${VAR_NAME} ${ARDUINO_LIBS} PARENT_SCOPE)
  #  message(@@ ${ARDUINO_LIBS})
endfunction()

function(setup_arduino_library VAR_NAME BOARD_ID LIB_PATH COMPILE_FLAGS LINK_FLAGS)
  set(LIB_TARGETS)
  set(LIB_INCLUDES)

  get_filename_component(LIB_NAME ${LIB_PATH} NAME)
  set(TARGET_LIB_NAME ${BOARD_ID}_${LIB_NAME})
  if (NOT TARGET ${TARGET_LIB_NAME})
    string(REGEX REPLACE ".*/" "" LIB_SHORT_NAME ${LIB_NAME})

    # Detect if recursion is needed
    if (NOT DEFINED ${LIB_SHORT_NAME}_RECURSE)
      set(${LIB_SHORT_NAME}_RECURSE False)
    endif ()

    find_c_sources(LIB_C_FILES ${LIB_PATH} ${${LIB_SHORT_NAME}_RECURSE})
    find_cxx_sources(LIB_CXX_FILES ${LIB_PATH} ${${LIB_SHORT_NAME}_RECURSE})
    set(LIB_SRCS ${LIB_C_FILES} ${LIB_CXX_FILES})
    #    find_sources(LIB_SRCS ${LIB_PATH} ${${LIB_SHORT_NAME}_RECURSE})
    if (LIB_SRCS)
      message(STATUS "Generating ${TARGET_LIB_NAME} for library ${LIB_NAME}")
      arduino_debug_msg("Generating Arduino ${LIB_NAME} library")
      add_library(${TARGET_LIB_NAME} STATIC ${LIB_SRCS})
      include_directories(${LIB_PATH})
      include_directories(${LIB_PATH}/src)
      include_directories(${LIB_PATH}/utility)

      get_arduino_flags(ARDUINO_COMPILE_C_FLAGS ARDUINO_COMPILE_CXX_FLAGS ARDUINO_LINK_FLAGS ${BOARD_ID} FALSE)
      #      get_arduino_flags(ARDUINO_COMPILE_FLAGS ARDUINO_LINK_FLAGS ${BOARD_ID} FALSE)

      find_arduino_libraries(LIB_DEPS "${LIB_SRCS}" "")

      foreach (LIB_DEP ${LIB_DEPS})
        if (NOT DEP_LIB_SRCS STREQUAL TARGET_LIB_NAME AND DEP_LIB_SRCS)
          message(STATUS "Found library ${LIB_NAME} needs ${DEP_LIB_SRCS}")
        endif ()

        setup_arduino_library(DEP_LIB_SRCS ${BOARD_ID} ${LIB_DEP} "${COMPILE_FLAGS}" "${LINK_FLAGS}")
        # Do not link to this library. DEP_LIB_SRCS will always be only one entry
        # if we are looking at the same library.
        if (NOT DEP_LIB_SRCS STREQUAL TARGET_LIB_NAME)
          list(APPEND LIB_TARGETS ${DEP_LIB_SRCS})
          list(APPEND LIB_INCLUDES ${DEP_LIB_SRCS_INCLUDES})
        endif ()
      endforeach ()

      if (LIB_INCLUDES)
        string(REPLACE ";" " " LIB_INCLUDES "${LIB_INCLUDES}")
      endif ()

      set(ADDITIONAL_COMPILER_FLAGS "${LIB_INCLUDES} -I\"${LIB_PATH}\" -I\"${LIB_PATH}/src\" -I\"${LIB_PATH}/utility\" ${COMPILE_FLAGS}")

      set_source_files_properties(${LIB_C_FILES}
          PROPERTIES COMPILE_FLAGS "${ARDUINO_COMPILE_C_FLAGS} ${ADDITIONAL_COMPILER_FLAGS}")
      set_source_files_properties(${LIB_CXX_FILES}
          PROPERTIES COMPILE_FLAGS "${ARDUINO_COMPILE_CXX_FLAGS} ${ADDITIONAL_COMPILER_FLAGS}")
      set_target_properties(${TARGET_LIB_NAME} PROPERTIES
          LINK_FLAGS "${ARDUINO_LINK_FLAGS} ${LINK_FLAGS}")

      list(APPEND LIB_INCLUDES "-I\"${LIB_PATH}\" -I\"${LIB_PATH}/src\" -I\"${LIB_PATH}/utility\"")

      target_link_libraries(${TARGET_LIB_NAME} ${BOARD_ID}_CORE)
      list(APPEND LIB_TARGETS ${TARGET_LIB_NAME})

    endif ()
  else ()
    # Target already exists, skiping creating
    list(APPEND LIB_TARGETS ${TARGET_LIB_NAME})
  endif ()
  if (LIB_TARGETS)
    list(REMOVE_DUPLICATES LIB_TARGETS)
  endif ()
  set(${VAR_NAME} ${LIB_TARGETS} PARENT_SCOPE)
  set(${VAR_NAME}_INCLUDES ${LIB_INCLUDES} PARENT_SCOPE)
endfunction()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# setup_arduino_libraries(VAR_NAME BOARD_ID SRCS COMPILE_FLAGS LINK_FLAGS)
#
#        VAR_NAME    - Vairable wich will hold the generated library names
#        BOARD_ID    - Board ID
#        SRCS        - source files
#        COMPILE_FLAGS - Compile flags
#        LINK_FLAGS    - Linker flags
#
# Finds and creates all dependency libraries based on sources.
#
#=============================================================================#
function(setup_arduino_libraries VAR_NAME BOARD_ID SRCS ARDLIBS COMPILE_FLAGS LINK_FLAGS)
  set(LIB_TARGETS)
  set(LIB_INCLUDES)

  find_arduino_libraries(TARGET_LIBS "${SRCS}" ARDLIBS)
  foreach (TARGET_LIB ${TARGET_LIBS})
    # Create static library instead of returning sources
    setup_arduino_library(LIB_DEPS ${BOARD_ID} ${TARGET_LIB} "${COMPILE_FLAGS}" "${LINK_FLAGS}")
    list(APPEND LIB_TARGETS ${LIB_DEPS})
    list(APPEND LIB_INCLUDES ${LIB_DEPS_INCLUDES})
  endforeach ()

  set(${VAR_NAME} ${LIB_TARGETS} PARENT_SCOPE)
  set(${VAR_NAME}_INCLUDES ${LIB_INCLUDES} PARENT_SCOPE)
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
# setup_arduino_target(TARGET_NAME ALL_SRCS ALL_LIBS COMPILE_FLAGS LINK_FLAGS MANUAL)
#
#        TARGET_NAME - Target name
#        BOARD_ID    - Arduino board ID
#        ALL_SRCS    - All sources
#        ALL_LIBS    - All libraries
#        COMPILE_FLAGS - Compile flags
#        LINK_FLAGS    - Linker flags
#        MANUAL - (Advanced) Only use AVR Libc/Includes
#
# Creates an Arduino firmware target.
#
#=============================================================================#
function(setup_arduino_target TARGET_NAME BOARD_ID ALL_SRCS ALL_LIBS COMPILE_FLAGS LINK_FLAGS MANUAL)

  find_s_sources(S_FILES ${BOARD_VARIANT_PATH} True)

  if (S_FILES)
    get_arduino_s_flags(ARDUINO_S_FLAGS)
    set_source_files_properties(${S_FILES} PROPERTIES COMPILE_FLAGS ${ARDUINO_S_FLAGS})
    set(ALL_SRCS ${S_FILES} ${ALL_SRCS})
    print_list(ALL_SRCS)
  endif ()

  add_executable(${TARGET_NAME} ${ALL_SRCS})
  set_target_properties(${TARGET_NAME} PROPERTIES SUFFIX ".elf")

  get_arduino_flags(ARDUINO_COMPILE_C_FLAGS ARDUINO_COMPILE_CXX_FLAGS ARDUINO_LINK_FLAGS ${BOARD_ID} ${MANUAL})

  #  message(${ARDUINO_COMPILE_CXX_FLAGS} ${COMPILE_FLAGS})

  set_target_properties(${TARGET_NAME} PROPERTIES
      COMPILE_FLAGS "${ARDUINO_COMPILE_CXX_FLAGS} ${COMPILE_FLAGS}"
      LINK_FLAGS "${ARDUINO_LINK_FLAGS} ${LINK_FLAGS}")
  target_link_libraries(${TARGET_NAME} ${ALL_LIBS} "-lc -lm")

  if (NOT EXECUTABLE_OUTPUT_PATH)
    set(EXECUTABLE_OUTPUT_PATH ${CMAKE_CURRENT_BINARY_DIR})
  endif ()
  set(TARGET_PATH ${EXECUTABLE_OUTPUT_PATH}/${TARGET_NAME})

  message(STATUS "Using ${CMAKE_OBJCOPY} for converting firmware image to hex")
  add_custom_command(TARGET ${TARGET_NAME} POST_BUILD
      COMMAND ${CMAKE_OBJCOPY}
      ARGS ${ARDUINO_OBJCOPY_EEP_FLAGS}
      ${TARGET_PATH}.elf
      ${TARGET_PATH}.eep
      COMMENT "Generating EEP image"
      VERBATIM)

  # Convert firmware image to ASCII HEX format
  add_custom_command(TARGET ${TARGET_NAME} POST_BUILD
      COMMAND ${CMAKE_OBJCOPY}
      ARGS ${ARDUINO_OBJCOPY_HEX_FLAGS}
      ${TARGET_PATH}.elf
      ${TARGET_PATH}.hex
      COMMENT "Generating HEX image"
      VERBATIM)

  #  # Display target size
  #  add_custom_command(TARGET ${TARGET_NAME} POST_BUILD
  #      COMMAND ${CMAKE_COMMAND}
  #      ARGS    -DFIRMWARE_IMAGE=${TARGET_PATH}.elf
  #      -DMCU=${${BOARD_ID}${ARDUINO_CPUMENU}.build.mcu}
  #      -DEEPROM_IMAGE=${TARGET_PATH}.eep
  #      -P ${ARDUINO_SIZE_SCRIPT}
  #      COMMENT "Calculating image size"
  #      VERBATIM)
  #
  #  # Create ${TARGET_NAME}-size target
  #  add_custom_target(${TARGET_NAME}-size
  #      COMMAND ${CMAKE_COMMAND}
  #      -DFIRMWARE_IMAGE=${TARGET_PATH}.elf
  #      -DMCU=${${BOARD_ID}${ARDUINO_CPUMENU}.build.mcu}
  #      -DEEPROM_IMAGE=${TARGET_PATH}.eep
  #      -P ${ARDUINO_SIZE_SCRIPT}
  #      DEPENDS ${TARGET_NAME}
  #      COMMENT "Calculating ${TARGET_NAME} image size")

endfunction()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# setup_arduino_upload(BOARD_ID TARGET_NAME PORT)
#
#        BOARD_ID    - Arduino board id
#        TARGET_NAME - Target name
#        PORT        - Serial port for upload
#        PROGRAMMER_ID - Programmer ID
#        AVRDUDE_FLAGS - avrdude flags
#
# Create an upload target (${TARGET_NAME}-upload) for the specified Arduino target.
#
#=============================================================================#
function(setup_arduino_upload BOARD_ID TARGET_NAME PORT PROGRAMMER_ID AVRDUDE_FLAGS)
  setup_arduino_bootloader_upload(${TARGET_NAME} ${BOARD_ID} ${PORT} "${AVRDUDE_FLAGS}")

  # Add programmer support if defined
  if (PROGRAMMER_ID AND ${PROGRAMMER_ID}.protocol)
    setup_arduino_programmer_burn(${TARGET_NAME} ${BOARD_ID} ${PROGRAMMER_ID} ${PORT} "${AVRDUDE_FLAGS}")
    setup_arduino_bootloader_burn(${TARGET_NAME} ${BOARD_ID} ${PROGRAMMER_ID} ${PORT} "${AVRDUDE_FLAGS}")
  endif ()
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
# setup_arduino_bootloader_upload(TARGET_NAME BOARD_ID PORT)
#
#      TARGET_NAME - target name
#      BOARD_ID    - board id
#      PORT        - serial port
#      AVRDUDE_FLAGS - avrdude flags (override)
#
# Set up target for upload firmware via the bootloader.
#
# The target for uploading the firmware is ${TARGET_NAME}-upload .
#
#=============================================================================#
function(setup_arduino_bootloader_upload TARGET_NAME BOARD_ID PORT AVRDUDE_FLAGS)
  set(UPLOAD_TARGET ${TARGET_NAME}-upload)
  set(AVRDUDE_ARGS)

  setup_arduino_bootloader_args(${BOARD_ID} ${TARGET_NAME} ${PORT} "${AVRDUDE_FLAGS}" AVRDUDE_ARGS)

  if (NOT AVRDUDE_ARGS)
    message("Could not generate default avrdude bootloader args, aborting!")
    return()
  endif ()

  if (NOT EXECUTABLE_OUTPUT_PATH)
    set(EXECUTABLE_OUTPUT_PATH ${CMAKE_CURRENT_BINARY_DIR})
  endif ()
  set(TARGET_PATH ${EXECUTABLE_OUTPUT_PATH}/${TARGET_NAME})

  list(APPEND AVRDUDE_ARGS "-Uflash:w:${TARGET_PATH}.hex:i")
  list(APPEND AVRDUDE_ARGS "-Ueeprom:w:${TARGET_PATH}.eep:i")
  add_custom_target(${UPLOAD_TARGET}
      ${ARDUINO_AVRDUDE_PROGRAM}
      ${AVRDUDE_ARGS}
      DEPENDS ${TARGET_NAME})

  # Global upload target
  if (NOT TARGET upload)
    add_custom_target(upload)
  endif ()

  add_dependencies(upload ${UPLOAD_TARGET})
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
  if (ARDUINO_DEBUG)
    message("## ${MSG}")
  endif ()
endfunction()


#=============================================================================#
# [PRIVATE/INTERNAL]
#
# remove_comments(SRC_VAR OUT_VAR)
#
#        SRC_VAR - variable holding sources
#        OUT_VAR - variable holding sources with no comments
#
# Removes all comments from the source code.
#=============================================================================#
function(REMOVE_COMMENTS SRC_VAR OUT_VAR)
  string(REGEX REPLACE "[\\./\\\\]" "_" FILE "${NAME}")

  set(SRC ${${SRC_VAR}})

  #message(STATUS "removing comments from: ${FILE}")
  #file(WRITE "${CMAKE_BINARY_DIR}/${FILE}_pre_remove_comments.txt" ${SRC})
  #message(STATUS "\n${SRC}")

  # remove all comments
  string(REGEX REPLACE "([/][/][^\n]*)|([/][\\*]([^\\*]|([\\*]+[^/\\*]))*[\\*]+[/])" "" OUT "${SRC}")

  #file(WRITE "${CMAKE_BINARY_DIR}/${FILE}_post_remove_comments.txt" ${SRC})
  #message(STATUS "\n${SRC}")

  set(${OUT_VAR} ${OUT} PARENT_SCOPE)

endfunction()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# get_num_lines(DOCUMENT OUTPUT_VAR)
#
#        DOCUMENT   - Document contents
#        OUTPUT_VAR - Variable which will hold the line number count
#
# Counts the line number of the document.
#=============================================================================#
function(GET_NUM_LINES DOCUMENT OUTPUT_VAR)
  string(REGEX MATCHALL "[\n]" MATCH_LIST "${DOCUMENT}")
  list(LENGTH MATCH_LIST NUM)
  set(${OUTPUT_VAR} ${NUM} PARENT_SCOPE)
endfunction()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# required_variables(MSG msg VARS var1 var2 .. varN)
#
#        MSG  - Message to be displayed in case of error
#        VARS - List of variables names to check
#
# Ensure the specified variables are not empty, otherwise a fatal error is emmited.
#=============================================================================#
function(REQUIRED_VARIABLES)
  cmake_parse_arguments(INPUT "" "MSG" "VARS" ${ARGN})
  error_for_unparsed(INPUT)
  foreach (VAR ${INPUT_VARS})
    if ("${${VAR}}" STREQUAL "")
      message(FATAL_ERROR "${VAR} not set: ${INPUT_MSG}")
    endif ()
  endforeach ()
endfunction()

#=============================================================================#
# [PRIVATE/INTERNAL]
#
# error_for_unparsed(PREFIX)
#
#        PREFIX - Prefix name
#
# Emit fatal error if there are unparsed argument from cmake_parse_arguments().
#=============================================================================#
function(ERROR_FOR_UNPARSED PREFIX)
  set(ARGS "${${PREFIX}_UNPARSED_ARGUMENTS}")
  if (NOT ("${ARGS}" STREQUAL ""))
    message(FATAL_ERROR "unparsed argument: ${ARGS}")
  endif ()
endfunction()

#=============================================================================#
#                          Initialization
#=============================================================================#
if (NOT ARDUINO_INITIALIZED)

  # Setup Toolchain
  set(NACO_PROGRAM "naco")
  if (NOT MMANUAL_SETUP)
    set(TOOLCHAIN_FILE_PATH ${CMAKE_BINARY_DIR}/CMakeFiles/ArduinoToolchain.cmake)
    execute_process(COMMAND "${NACO_PROGRAM}" "gen" "-o${TOOLCHAIN_FILE_PATH}"
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
    include(${TOOLCHAIN_FILE_PATH})
  endif ()

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
