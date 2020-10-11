## 1.0.0

- Set alterAssetTagGroups hook execution order. [#17](https://github.com/JoviDeCroock/webpack-module-nomodule-plugin/pull/17)
- Keep initial chunks order in html file. [#18](https://github.com/JoviDeCroock/webpack-module-nomodule-plugin/pull/18)
- Inline self-script [link](https://github.com/JoviDeCroock/webpack-module-nomodule-plugin/commit/4894bbd505f29a08c6fd5f1452b6257af672c881)

## 0.4.0

- use `DOMContentLoaded` rather than `loaded` for efficient-mode

## 0.3.0

Add a second argument allowing the user to specify:

- minimal: adds the least possible html but downloads twice on IE11
- efficient: this never downloads twice but adds a bit more html
