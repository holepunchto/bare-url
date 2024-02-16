cmake_minimum_required(VERSION 3.25)

project(bare_url C)

include(bare)

if(NOT TARGET utf)
  add_subdirectory(vendor/libutf EXCLUDE_FROM_ALL)
endif()

if(NOT TARGET url)
  add_subdirectory(vendor/liburl EXCLUDE_FROM_ALL)
endif()

add_bare_module(bare_url)

target_sources(
  ${bare_url}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_url}
  PUBLIC
    url_static
)
