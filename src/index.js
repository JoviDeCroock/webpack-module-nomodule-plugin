'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs-extra');

const ID = 'html-webpack-esmodules-plugin';
const safariFix = `(function(){var d=document;var c=d.createElement('script');if(!('noModule' in c)&&'onbeforeload' in c){var s=!1;d.addEventListener('beforeload',function(e){if(e.target===c){s=!0}else if(!e.target.hasAttribute('nomodule')||!s){return}e.preventDefault()},!0);c.type='module';c.src='.';d.head.appendChild(c);c.remove()}}())`;

class HtmlWebpackEsmodulesPlugin {
  constructor(mode = 'modern', async = false) {
    this.async = async;
    switch (mode) {
      case 'module':
      case 'modern':
        this.mode = 'modern';
        break;
      case 'nomodule':
      case 'legacy':
        this.mode = 'legacy';
        break;
      default:
        throw new Error(`The mode has to be one of: [modern, legacy, module, nomodule], you provided ${mode}.`);
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(ID, compilation => {
      if (HtmlWebpackPlugin.getHooks) {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          ID,
          this.alterAssetTagGroups.bind(this, compiler)
        );
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(ID, this.beforeEmitHtml.bind(this));
      } else {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
          ID,
          this.alterAssetTagGroups.bind(this, compiler)
        );
        compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(ID, this.beforeEmitHtml.bind(this));
      }
    });
  }

  beforeEmitHtml(data) {
    data.html = data.html.replace(/\snomodule="">/g, ' nomodule>');
    if (this.async) {
      data.html = data.html.replace(/\sasync=""/g, ' async');
    }
    // TODO: replace async if needed
  }

  alterAssetTagGroups(compiler, { plugin, bodyTags: body, ...rest }, cb) {
    if (!body) {
      body = rest.body;
    }
    const targetDir = compiler.options.output.path;
    // get stats, write to disk
    const htmlName = path.basename(plugin.options.filename);
    // Watch out for output files in sub directories
    const htmlPath = path.dirname(plugin.options.filename);
    // Make the temporairy html to store the scripts in
    const tempFilename = path.join(
      targetDir,
      htmlPath,
      `assets-${htmlName}.json`
    );
    // If this file does not exist we are in iteration 1
    if (!fs.existsSync(tempFilename)) {
      fs.mkdirpSync(path.dirname(tempFilename));
      // Only keep the scripts so we can't add css etc twice.
      const newBody = body.filter(
        a => a.tagName === 'script' && a.attributes
      );
      if (this.mode === 'legacy') {
        // Empty nomodule in legacy build
        newBody.forEach(a => (a.attributes.nomodule = ''));
      } else {
        // Module in the new build
        newBody.forEach(a => {
          a.attributes.type = 'module';
          if (this.async) tag.attributes.async = '';
        });
      }
      // Write it!
      fs.writeFileSync(tempFilename, JSON.stringify(newBody));
      // Tell the compiler to continue.
      return cb();
    }
    // Draw the existing html because we are in iteration 2.
    const existingAssets = JSON.parse(
      fs.readFileSync(tempFilename, 'utf-8')
    );

    if (this.mode === 'modern') {
      // If we are in modern make the type a module.
      body.forEach(tag => {
        if (tag.tagName === 'script' && tag.attributes) {
          tag.attributes.type = 'module';
          if (this.async) tag.attributes.async = '';
        }
      });
    } else {
      // If we are in legacy fill nomodule.
      body.forEach(tag => {
        if (tag.tagName === 'script' && tag.attributes) {
          tag.attributes.nomodule = '';
        }
      });
    }

    const safariFixScript = {
      tagName: 'script',
      closeTag: true,
      innerHTML: safariFix,
    }

    body.push(safariFixScript);
    body.push(...existingAssets);

    // Make our array look like [modern, script, legacy]
    if (this.mode === 'legacy') {
      body.reverse();
    }
    fs.removeSync(tempFilename);
    cb();
  }
}

module.exports = HtmlWebpackEsmodulesPlugin;
