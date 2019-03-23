# Webpack module-nomodule plugin

[![npm version](https://badge.fury.io/js/webpack-module-nomodule-plugin.svg)](https://badge.fury.io/js/webpack-module-nomodule-plugin)

## Why

This automates the generation of module-nomodule scripts aswell as the safari fix.

This project relies on [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

[Safari fix](https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc)

[module-nomodule](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)

## How to use

The only thing you need to do is return two build steps in your webpack and forward
this to this plugin like this:

- for legacy new WebpackModuleNomodulePlugin({ mode: 'legacy' });
- for modern new WebpackModuleNomodulePlugin({ mode: 'modern' });

The rest will be handled for you!

## Example

https://github.com/JoviDeCroock/POC-ModularLegacyBuild

## Installation

`npm install --save-dev webpack-module-nomodule-plugin`
