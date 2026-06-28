// VBook Plugin — Truyện VN All-in-One (Common Libs)
// Compatibility layer: String.format, String.formatUnicorn, type checker, etc.

// String.format polyfill
if (!String.format) {
  String.format = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/\{(\d+)\}/g, function (match, number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

// String prototype extensions
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
  function () {
    var str = this.toString();
    if (arguments.length) {
      var t = typeof arguments[0];
      var key;
      var args = (t === 'string' || t === 'number') ?
        Array.prototype.slice.call(arguments) : arguments[0];
      for (key in args) {
        str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), args[key]);
      }
    }
    return str;
  };

String.prototype.append = function (w) {
  if (this.endsWith(w)) return this;
  return this + w;
};

String.prototype.prepend = function (w) {
  if (this.startsWith(w)) return this;
  return w + this;
};

String.prototype.rtrim = function (s) {
  if (s == undefined) s = '\\s';
  return this.replace(new RegExp('[' + s + ']*$'), '');
};

String.prototype.ltrim = function (s) {
  if (s == undefined) s = '\\s';
  return this.replace(new RegExp('^[' + s + ']*'), '');
};

String.prototype.mayBeFillHost = function (host) {
  var url = this.trim();
  if (!url) return '';
  if (url.startsWith(host)) return url;
  if (url.startsWith('//')) return host.split('//')[0] + url;
  return host.rtrim('/') + '/' + url.ltrim('/');
};

// Clean HTML helper (loại bỏ ads, duplicate br, junk)
function cleanHtml(html) {
  if (!html) return '';
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/(<br>\s*){2,}/gm, '<br>');
  html = html.replace(/<!--[^>]*-->/gm, '');
  html = html.replace(/&nbsp;/g, '');
  html = html.replace(/(^(\s*<br>\s*)+|(<br>\s*)+$)/gm, '');
  return html.trim();
}

// Type checker
var TypeChecker = {
  isString: function (o) {
    return typeof o == 'string' || (typeof o == 'object' && o.constructor === String);
  },
  isNumber: function (o) {
    return typeof o == 'number' || (typeof o == 'object' && o.constructor === Number);
  },
  isArray: function (o) {
    return o instanceof Array;
  },
  isFunction: function (o) {
    return o && {}.toString.call(o) === '[object Function]';
  },
  isObject: function (o) {
    return typeof o === 'object' && o !== null;
  }
};