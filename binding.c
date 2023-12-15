#include <assert.h>
#include <bare.h>
#include <js.h>
#include <stddef.h>
#include <stdlib.h>
#include <url.h>
#include <utf.h>
#include <utf/string.h>

static js_value_t *
bare_url_parse (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  size_t len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &len);
  assert(err == 0);

  utf8_t *input = malloc(len);
  err = js_get_value_string_utf8(env, argv[0], input, len, NULL);
  assert(err == 0);

  bool has_base;
  err = js_is_arraybuffer(env, argv[1], &has_base);
  assert(err == 0);

  url_t *base = NULL;

  if (has_base) {
    err = js_get_arraybuffer_info(env, argv[1], (void **) &base, NULL);
    assert(err == 0);
  }

  js_value_t *handle;

  url_t *url;
  err = js_create_arraybuffer(env, sizeof(url_t), (void **) &url, &handle);
  assert(err == 0);

  url_init(url);

  err = url_parse(url, input, len, base);
  if (err < 0) {
    free(input);

    url_destroy(url);

    js_throw_error(env, NULL, "Invalid URL");

    return NULL;
  }

  free(input);

  js_value_t *result;
  err = js_create_object(env, &result);
  assert(err == 0);

  err = js_set_named_property(env, result, "handle", handle);
  assert(err == 0);

  js_value_t *flags;
  err = js_create_uint32(env, url->flags, &flags);
  assert(err == 0);

  err = js_set_named_property(env, result, "flags", flags);
  assert(err == 0);

  js_value_t *type;
  err = js_create_uint32(env, url->type, &type);
  assert(err == 0);

  err = js_set_named_property(env, result, "type", type);
  assert(err == 0);

  js_value_t *href;
  err = js_create_string_utf8(env, url->href.data, url->href.len, &href);
  assert(err == 0);

  err = js_set_named_property(env, result, "href", href);
  assert(err == 0);

  js_value_t *components;
  err = js_create_typedarray(env, js_uint32_array, 8, handle, offsetof(url_t, components), &components);
  assert(err == 0);

  err = js_set_named_property(env, result, "components", components);
  assert(err == 0);

  return result;
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

  js_value_t *constants;
  err = js_create_object(env, &constants);
  assert(err == 0);

  err = js_set_named_property(env, exports, "constants", constants);
  assert(err == 0);

  {
    js_value_t *val;
    err = js_create_uint32(env, url_has_opaque_path, &val);
    assert(err == 0);

    err = js_set_named_property(env, constants, "HAS_OPAQUE_PATH", val);
    assert(err == 0);
  }

  return exports;
}

BARE_MODULE(bare_url, init)
