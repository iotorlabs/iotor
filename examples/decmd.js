"use strict";

var decmd = require('../lib/decmd');

var pattern = '"/Applications/Arduino.app/Contents/Java/hardware/tools/arm/bin/bin/arm-none-eabi-g++" -Os -Wl,--gc-sections -mcpu=cortex-m3 "-T/Users/taoyuan/Documents/Arduino/hardware/Arduino_STM32/STM32F1/variants/maple_mini/ld/flash.ld" "-Wl,-Map,{build.path}/{build.project_name}.map" "-L/Users/taoyuan/Documents/Arduino/hardware/Arduino_STM32/STM32F1/variants/maple_mini/ld" -o "{build.path}/{build.project_name}.elf" "-L{build.path}" -lm -lgcc -mthumb -Wl,--cref -Wl,--check-sections -Wl,--gc-sections -Wl,--unresolved-symbols=report-all -Wl,--warn-common -Wl,--warn-section-align -Wl,--warn-unresolved-symbols -Wl,--start-group {object_files} "{build.path}/{archive_file}" -Wl,--end-group -o hello -c';

console.log(decmd(pattern));
