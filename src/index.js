'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs-extra');
const { OUTPUT_MODES, selfScript, safariFixScript, ID } = require('./constants');
const { makeLoadScript } = require('./utils');

class HtmlWebpackEsmodulesPlugin {
  constructor(mode = 'modern', outputMode = OUTPUT_MODES.EFFICIENT) {
    this.outputMode = outputMode;
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
      // Support newest and oldest version.
      if (HtmlWebpackPlugin.getHooks) {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          ID,
          this.alterAssetTagGroups.bind(this, compiler)
        );
        if (this.outputMode === OUTPUT_MODES.MINIMAL) {
          HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(ID, this.beforeEmitHtml.bind(this));
        }
      } else {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
          ID,
          this.alterAssetTagGroups.bind(this, compiler)
        );
        if (this.outputMode === OUTPUT_MODES.MINIMAL) {
          compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(ID, this.beforeEmitHtml.bind(this));
        }
      }
    });
  }

  alterAssetTagGroups(compiler, { plugin, bodyTags: body, headTags: head, ...rest }, cb) {
    // Older webpack compat
    if (!body) body = rest.body;
    if (!head) head = rest.head;

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
        newBody.forEach(a => {
          a.attributes.nomodule = '';
        });
      } else {
        // Module in the new build
        newBody.forEach(a => {
          a.attributes.type = 'module';
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

    if (this.outputMode === OUTPUT_MODES.MINIMAL) {
      this.sizeEfficient(existingAssets, body);
    } else if (this.outputMode === OUTPUT_MODES.EFFICIENT) {
      this.downloadEfficient(existingAssets, body, head);
    }

    fs.removeSync(tempFilename);
    cb();
  }

  beforeEmitHtml(data) {
    data.html = data.html.replace(/\snomodule="">/g, ' nomodule>');
  }

  downloadEfficient(existingAssets, body, head) {
    const isModern = this.mode === 'modern';
    const legacyScripts = (isModern ? existingAssets : body).filter(tag => tag.tagName === 'script' && tag.attributes.type !== 'module');
    const modernScripts = (isModern ? body : existingAssets).filter(tag => tag.tagName === 'script' && tag.attributes.type === 'module');
    const scripts = body.filter(tag => tag.tagName === 'script');
    scripts.forEach(s => {
      body.splice(body.indexOf(s), 1);
    })

    modernScripts.forEach(modernScript => {
      head.push({ tagName: 'link', attributes: { rel: 'modulepreload', href: modernScript.attributes.src } });
    });

    const loadScript = makeLoadScript(modernScripts, legacyScripts);
    head.push({ tagName: 'script', attributes: { type: 'module' }, innerHTML: selfScript, voidTag: false });
    head.push({ tagName: 'script', innerHTML: loadScript, voidTag: false });
  }

  sizeEfficient(existingAssets, body) {
    const safariFixScriptTag = {
      tagName: 'script',
      closeTag: true,
      innerHTML: safariFixScript,
    }

    body.push(safariFixScriptTag);
    body.push(...existingAssets);

    // Make our array look like [modern, script, legacy]
    if (this.mode === 'legacy') {
      body.reverse();
    }
  }
}

exports.OUTPUT_MODES = OUTPUT_MODES;
module.exports = HtmlWebpackEsmodulesPlugin;
