#include <assert.h>
#include <bare.h>
#include <js.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include <url.h>
#include <utf.h>
#include <utf/string.h>

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
    if (err < 0) {
      free(input);

      url_destroy(&base);

      js_throw_error(env, NULL, "Invalid base URL");

      return NULL;
    }

    free(input);
  }

  size_t len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &len);
  assert(err == 0);

  utf8_t *input = malloc(len);
  err = js_get_value_string_utf8(env, argv[0], input, len, NULL);
  assert(err == 0);

  uint32_t *components;
  err = js_get_typedarray_info(env, argv[2], NULL, (void **) &components, NULL, NULL, NULL);
  assert(err == 0);

  js_value_t *handle;

  url_t url;
  url_init(&url);

  err = url_parse(&url, input, len, has_base ? &base : NULL);
  if (err < 0) {
    free(input);

    url_destroy(&base);
    url_destroy(&url);

    js_throw_error(env, NULL, "Invalid URL");

    return NULL;
  }

  free(input);

  js_value_t *href;
  err = js_create_string_utf8(env, url.href.data, url.href.len, &href);
  assert(err == 0);

  memcpy(components, &url.components, sizeof(url.components));

  url_destroy(&url);

  return href;
}

static js_value_t *
init (js_env_t *env, js_value_t *exports) {
  int err;

  {
    js_value_t *fn;
    err = js_create_function(env, "parse", -1, bare_url_parse, NULL, &fn);
    assert(err == 0);

    err = js_set_named_property(env, exports, "parse", fn);
    assert(err == 0);
  }

  return exports;
}

BARE_MODULE(bare_url, init)
