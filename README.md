# Webpack module-nomodule plugin

[![npm version](https://badge.fury.io/js/webpack-module-nomodule-plugin.svg)](https://badge.fury.io/js/webpack-module-nomodule-plugin)


## Installation

`npm install --save-dev webpack-module-nomodule-plugin`

or

`yarn add -D webpack-module-nomodule-plugin`

## Why

This automates the generation of module-nomodule scripts.

This project relies on [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin).

[module-nomodule](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/) explained.

## How to use

The only thing you need to do is return two build steps in your webpack and forward
this to this plugin like this:

- for legacy new WebpackModuleNomodulePlugin({ mode: 'legacy' });
- for modern new WebpackModuleNomodulePlugin({ mode: 'modern' });

The rest will be handled for you!

## Example

https://github.com/JoviDeCroock/POC-ModularLegacyBuild

This example uses multiple techniques to guarantee the best size, like using [native-url](https://github.com/GoogleChromeLabs/native-url) in modern browsers, ...
