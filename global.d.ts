import * as url from '.'

declare global {
  interface URL extends url.URL {}

  class URL extends url.URL {}
}
