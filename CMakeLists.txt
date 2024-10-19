cmake_minimum_required(VERSION 3.25)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)

project(bare_url C)

if(NOT TARGET utf)
  add_subdirectory(vendor/libutf EXCLUDE_FROM_ALL)
endif()

if(NOT TARGET url)
  add_subdirectory(vendor/liburl EXCLUDE_FROM_ALL)
endif()

add_bare_module(bare_url)

target_sources(
  ${bare_url}
  PUBLIC
    $<TARGET_OBJECTS:url>
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_url}
  PUBLIC
    url
)
