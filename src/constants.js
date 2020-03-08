exports.selfScript = `self.m=1`;
exports.loadScript = 'function $l(e,d,c){c=document.createElement("script"),self.m?(e && (c.src=e,c.type="module")):d && (c.src=d),c.src && document.head.appendChild(c)}';
exports.safariFixScript = `(function(){var d=document;var c=d.createElement('script');if(!('noModule' in c)&&'onbeforeload' in c){var s=!1;d.addEventListener('beforeload',function(e){if(e.target===c){s=!0}else if(!e.target.hasAttribute('nomodule')||!s){return}e.preventDefault()},!0);c.type='module';c.src='.';d.head.appendChild(c);c.remove()}}())`;
exports.ID = 'html-webpack-esmodules-plugin';
exports.OUTPUT_MODES = {
  EFFICIENT: 'efficient',
  MINIMAL: 'minimal',
}
