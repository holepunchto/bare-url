#include <assert.h>
#include <bare.h>
#include <js.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include <url.h>
#include <utf.h>
#include <utf/string.h>

static js_type_tag_t bare_url__tag = {0x6f1fd92f476698b0, 0x93b59c349143ee50};

static js_value_t *
bare_url_parse (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 3;
  js_value_t *argv[3];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 3);

  bool has_base;
  err = js_is_string(env, argv[1], &has_base);
  assert(err == 0);

  url_t base;
  url_init(&base);

  if (has_base) {
    size_t len;
    err = js_get_value_string_utf8(env, argv[1], NULL, 0, &len);
    assert(err == 0);

    utf8_t *input = malloc(len);
    err = js_get_value_string_utf8(env, argv[1], input, len, NULL);
    assert(err == 0);

    err = url_parse(&base, input, len, NULL);

    free(input);

    if (err < 0) {
      url_destroy(&base);

      js_throw_error(env, NULL, "Invalid base URL");

      return NULL;
    }
  }

  size_t len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &len);
  assert(err == 0);

  utf8_t *input = malloc(len);
  err = js_get_value_string_utf8(env, argv[0], input, len, NULL);
  assert(err == 0);

  js_value_t *handle;

  url_t url;
  url_init(&url);

  err = url_parse(&url, input, len, has_base ? &base : NULL);

  free(input);

  if (err < 0) {
    url_destroy(&base);
    url_destroy(&url);

    js_throw_error(env, NULL, "Invalid URL");

    return NULL;
  }

  js_value_t *href;
  err = js_create_string_utf8(env, url.href.data, url.href.len, &href);
  assert(err == 0);

  uint32_t *components;
  err = js_get_typedarray_info(env, argv[2], NULL, (void **) &components, NULL, NULL, NULL);
  assert(err == 0);

  memcpy(components, &url.components, sizeof(url.components));

  url_destroy(&base);
  url_destroy(&url);

  return href;
}

static js_value_t *
bare_url_can_parse (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  bool has_base;
  err = js_is_string(env, argv[1], &has_base);
  assert(err == 0);

  url_t base;
  url_init(&base);

  if (has_base) {
    size_t len;
    err = js_get_value_string_utf8(env, argv[1], NULL, 0, &len);
    assert(err == 0);

    utf8_t *input = malloc(len);
    err = js_get_value_string_utf8(env, argv[1], input, len, NULL);
    assert(err == 0);

    err = url_parse(&base, input, len, NULL);

    free(input);

    if (err < 0) {
      url_destroy(&base);

      js_value_t *result;
      err = js_get_boolean(env, false, &result);
      assert(err == 0);

      return result;
    }
  }

  size_t len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &len);
  assert(err == 0);

  utf8_t *input = malloc(len);
  err = js_get_value_string_utf8(env, argv[0], input, len, NULL);
  assert(err == 0);

  url_t url;
  url_init(&url);

  err = url_parse(&url, input, len, has_base ? &base : NULL);

  free(input);

  url_destroy(&base);
  url_destroy(&url);

  js_value_t *result;
  err = js_get_boolean(env, err == 0, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_url_tag (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  err = js_add_type_tag(env, argv[0], &bare_url__tag);
  assert(err == 0);

  return NULL;
}

static js_value_t *
bare_url_is_tagged (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  bool is_url;
  err = js_check_type_tag(env, argv[0], &bare_url__tag, &is_url);
  assert(err == 0);

  js_value_t *result;
  err = js_get_boolean(env, is_url, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_url_exports (js_env_t *env, js_value_t *exports) {
  int err;

#define V(name, fn) \
  { \
    js_value_t *val; \
    err = js_create_function(env, name, -1, fn, NULL, &val); \
    assert(err == 0); \
    err = js_set_named_property(env, exports, name, val); \
    assert(err == 0); \
  }

  V("parse", bare_url_parse)
  V("canParse", bare_url_can_parse)
  V("tag", bare_url_tag)
  V("isTagged", bare_url_is_tagged)
#undef V

  return exports;
}

BARE_MODULE(bare_url, bare_url_exports)
