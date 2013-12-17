
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-cookie/index.js", Function("exports, require, module",
"/**\n\
 * Encode.\n\
 */\n\
\n\
var encode = encodeURIComponent;\n\
\n\
/**\n\
 * Decode.\n\
 */\n\
\n\
var decode = decodeURIComponent;\n\
\n\
/**\n\
 * Set or get cookie `name` with `value` and `options` object.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} value\n\
 * @param {Object} options\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(name, value, options){\n\
  switch (arguments.length) {\n\
    case 3:\n\
    case 2:\n\
      return set(name, value, options);\n\
    case 1:\n\
      return get(name);\n\
    default:\n\
      return all();\n\
  }\n\
};\n\
\n\
/**\n\
 * Set cookie `name` to `value`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} value\n\
 * @param {Object} options\n\
 * @api private\n\
 */\n\
\n\
function set(name, value, options) {\n\
  options = options || {};\n\
  var str = encode(name) + '=' + encode(value);\n\
\n\
  if (null == value) options.maxage = -1;\n\
\n\
  if (options.maxage) {\n\
    options.expires = new Date(+new Date + options.maxage);\n\
  }\n\
\n\
  if (options.path) str += '; path=' + options.path;\n\
  if (options.domain) str += '; domain=' + options.domain;\n\
  if (options.expires) str += '; expires=' + options.expires.toGMTString();\n\
  if (options.secure) str += '; secure';\n\
\n\
  document.cookie = str;\n\
}\n\
\n\
/**\n\
 * Return all cookies.\n\
 *\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function all() {\n\
  return parse(document.cookie);\n\
}\n\
\n\
/**\n\
 * Get cookie `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function get(name) {\n\
  return all()[name];\n\
}\n\
\n\
/**\n\
 * Parse cookie `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parse(str) {\n\
  var obj = {};\n\
  var pairs = str.split(/ *; */);\n\
  var pair;\n\
  if ('' == pairs[0]) return obj;\n\
  for (var i = 0; i < pairs.length; ++i) {\n\
    pair = pairs[i].split('=');\n\
    obj[decode(pair[0])] = decode(pair[1]);\n\
  }\n\
  return obj;\n\
}\n\
//@ sourceURL=component-cookie/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\"\n\
  return new Function('_', 'return _.' + str);\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("component-enumerable/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function')\n\
  , proto = {};\n\
\n\
/**\n\
 * Expose `Enumerable`.\n\
 */\n\
\n\
module.exports = Enumerable;\n\
\n\
/**\n\
 * Mixin to `obj`.\n\
 *\n\
 *    var Enumerable = require('enumerable');\n\
 *    Enumerable(Something.prototype);\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object} obj\n\
 */\n\
\n\
function mixin(obj){\n\
  for (var key in proto) obj[key] = proto[key];\n\
  obj.__iterate__ = obj.__iterate__ || defaultIterator;\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Initialize a new `Enumerable` with the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @api private\n\
 */\n\
\n\
function Enumerable(obj) {\n\
  if (!(this instanceof Enumerable)) {\n\
    if (Array.isArray(obj)) return new Enumerable(obj);\n\
    return mixin(obj);\n\
  }\n\
  this.obj = obj;\n\
}\n\
\n\
/*!\n\
 * Default iterator utilizing `.length` and subscripts.\n\
 */\n\
\n\
function defaultIterator() {\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.length },\n\
    get: function(i){ return self[i] }\n\
  }\n\
}\n\
\n\
/**\n\
 * Return a string representation of this enumerable.\n\
 *\n\
 *    [Enumerable [1,2,3]]\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Enumerable.prototype.inspect =\n\
Enumerable.prototype.toString = function(){\n\
  return '[Enumerable ' + JSON.stringify(this.obj) + ']';\n\
};\n\
\n\
/**\n\
 * Iterate enumerable.\n\
 *\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
Enumerable.prototype.__iterate__ = function(){\n\
  var obj = this.obj;\n\
  obj.__iterate__ = obj.__iterate__ || defaultIterator;\n\
  return obj.__iterate__();\n\
};\n\
\n\
/**\n\
 * Iterate each value and invoke `fn(val, i)`.\n\
 *\n\
 *    users.each(function(val, i){\n\
 *\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
proto.forEach =\n\
proto.each = function(fn){\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    fn(vals.get(i), i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Map each return value from `fn(val, i)`.\n\
 *\n\
 * Passing a callback function:\n\
 *\n\
 *    users.map(function(user){\n\
 *      return user.name.first\n\
 *    })\n\
 *\n\
 * Passing a property string:\n\
 *\n\
 *    users.map('name.first')\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.map = function(fn){\n\
  fn = toFunction(fn);\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  var arr = [];\n\
  for (var i = 0; i < len; ++i) {\n\
    arr.push(fn(vals.get(i), i));\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Select all values that return a truthy value of `fn(val, i)`.\n\
 *\n\
 *    users.select(function(user){\n\
 *      return user.age > 20\n\
 *    })\n\
 *\n\
 *  With a property:\n\
 *\n\
 *    items.select('complete')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.filter =\n\
proto.select = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) arr.push(val);\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Select all unique values.\n\
 *\n\
 *    nums.unique()\n\
 *\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.unique = function(){\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (~arr.indexOf(val)) continue;\n\
    arr.push(val);\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Reject all values that return a truthy value of `fn(val, i)`.\n\
 *\n\
 * Rejecting using a callback:\n\
 *\n\
 *    users.reject(function(user){\n\
 *      return user.age < 20\n\
 *    })\n\
 *\n\
 * Rejecting with a property:\n\
 *\n\
 *    items.reject('complete')\n\
 *\n\
 * Rejecting values via `==`:\n\
 *\n\
 *    data.reject(null)\n\
 *    users.reject(tobi)\n\
 *\n\
 * @param {Function|String|Mixed} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.reject = function(fn){\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if ('string' == typeof fn) fn = toFunction(fn);\n\
\n\
  if (fn) {\n\
    for (var i = 0; i < len; ++i) {\n\
      val = vals.get(i);\n\
      if (!fn(val, i)) arr.push(val);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      val = vals.get(i);\n\
      if (val != fn) arr.push(val);\n\
    }\n\
  }\n\
\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Reject `null` and `undefined`.\n\
 *\n\
 *    [1, null, 5, undefined].compact()\n\
 *    // => [1,5]\n\
 *\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
\n\
proto.compact = function(){\n\
  return this.reject(null);\n\
};\n\
\n\
/**\n\
 * Return the first value when `fn(val, i)` is truthy,\n\
 * otherwise return `undefined`.\n\
 *\n\
 *    users.find(function(user){\n\
 *      return user.role == 'admin'\n\
 *    })\n\
 *\n\
 * With a property string:\n\
 *\n\
 *    users.find('age > 20')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.find = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Return the last value when `fn(val, i)` is truthy,\n\
 * otherwise return `undefined`.\n\
 *\n\
 *    users.findLast(function(user){\n\
 *      return user.role == 'admin'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.findLast = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = len - 1; i > -1; --i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Assert that all invocations of `fn(val, i)` are truthy.\n\
 *\n\
 * For example ensuring that all pets are ferrets:\n\
 *\n\
 *    pets.all(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 *    users.all('admin')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.all =\n\
proto.every = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (!fn(val, i)) return false;\n\
  }\n\
  return true;\n\
};\n\
\n\
/**\n\
 * Assert that none of the invocations of `fn(val, i)` are truthy.\n\
 *\n\
 * For example ensuring that no pets are admins:\n\
 *\n\
 *    pets.none(function(p){ return p.admin })\n\
 *    pets.none('admin')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.none = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return false;\n\
  }\n\
  return true;\n\
};\n\
\n\
/**\n\
 * Assert that at least one invocation of `fn(val, i)` is truthy.\n\
 *\n\
 * For example checking to see if any pets are ferrets:\n\
 *\n\
 *    pets.any(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.any = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return true;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Count the number of times `fn(val, i)` returns true.\n\
 *\n\
 *    var n = pets.count(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.count = function(fn){\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  var n = 0;\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) ++n;\n\
  }\n\
  return n;\n\
};\n\
\n\
/**\n\
 * Determine the indexof `obj` or return `-1`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.indexOf = function(obj){\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (val === obj) return i;\n\
  }\n\
  return -1;\n\
};\n\
\n\
/**\n\
 * Check if `obj` is present in this enumerable.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.has = function(obj){\n\
  return !! ~this.indexOf(obj);\n\
};\n\
\n\
/**\n\
 * Reduce with `fn(accumulator, val, i)` using\n\
 * optional `init` value defaulting to the first\n\
 * enumerable value.\n\
 *\n\
 * @param {Function} fn\n\
 * @param {Mixed} [val]\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.reduce = function(fn, init){\n\
  var val;\n\
  var i = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  val = null == init\n\
    ? vals.get(i++)\n\
    : init;\n\
\n\
  for (; i < len; ++i) {\n\
    val = fn(val, vals.get(i), i);\n\
  }\n\
\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Determine the max value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.max(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.max('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.max()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.max = function(fn){\n\
  var val;\n\
  var n = 0;\n\
  var max = -Infinity;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n = fn(vals.get(i), i);\n\
      max = n > max ? n : max;\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n = vals.get(i);\n\
      max = n > max ? n : max;\n\
    }\n\
  }\n\
\n\
  return max;\n\
};\n\
\n\
/**\n\
 * Determine the min value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.min(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.min('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.min()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.min = function(fn){\n\
  var val;\n\
  var n = 0;\n\
  var min = Infinity;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n = fn(vals.get(i), i);\n\
      min = n < min ? n : min;\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n = vals.get(i);\n\
      min = n < min ? n : min;\n\
    }\n\
  }\n\
\n\
  return min;\n\
};\n\
\n\
/**\n\
 * Determine the sum.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.sum(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.sum('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.sum()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.sum = function(fn){\n\
  var ret;\n\
  var n = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n += fn(vals.get(i), i);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n += vals.get(i);\n\
    }\n\
  }\n\
\n\
  return n;\n\
};\n\
\n\
/**\n\
 * Determine the average value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.avg(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.avg('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.avg()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.avg =\n\
proto.mean = function(fn){\n\
  var ret;\n\
  var n = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n += fn(vals.get(i), i);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n += vals.get(i);\n\
    }\n\
  }\n\
\n\
  return n / len;\n\
};\n\
\n\
/**\n\
 * Return the first value, or first `n` values.\n\
 *\n\
 * @param {Number|Function} [n]\n\
 * @return {Array|Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.first = function(n){\n\
  if ('function' == typeof n) return this.find(n);\n\
  var vals = this.__iterate__();\n\
\n\
  if (n) {\n\
    var len = Math.min(n, vals.length());\n\
    var arr = new Array(len);\n\
    for (var i = 0; i < len; ++i) {\n\
      arr[i] = vals.get(i);\n\
    }\n\
    return arr;\n\
  }\n\
\n\
  return vals.get(0);\n\
};\n\
\n\
/**\n\
 * Return the last value, or last `n` values.\n\
 *\n\
 * @param {Number|Function} [n]\n\
 * @return {Array|Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.last = function(n){\n\
  if ('function' == typeof n) return this.findLast(n);\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (n) {\n\
    var i = Math.max(0, len - n);\n\
    var arr = [];\n\
    for (; i < len; ++i) {\n\
      arr.push(vals.get(i));\n\
    }\n\
    return arr;\n\
  }\n\
\n\
  return vals.get(len - 1);\n\
};\n\
\n\
/**\n\
 * Return values in groups of `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.inGroupsOf = function(n){\n\
  var arr = [];\n\
  var group = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    group.push(vals.get(i));\n\
    if ((i + 1) % n == 0) {\n\
      arr.push(group);\n\
      group = [];\n\
    }\n\
  }\n\
\n\
  if (group.length) arr.push(group);\n\
\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Return the value at the given index.\n\
 *\n\
 * @param {Number} i\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.at = function(i){\n\
  return this.__iterate__().get(i);\n\
};\n\
\n\
/**\n\
 * Return a regular `Array`.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
proto.toJSON =\n\
proto.array = function(){\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    arr.push(vals.get(i));\n\
  }\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Return the enumerable value.\n\
 *\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.value = function(){\n\
  return this.obj;\n\
};\n\
\n\
/**\n\
 * Mixin enumerable.\n\
 */\n\
\n\
mixin(Enumerable.prototype);\n\
//@ sourceURL=component-enumerable/index.js"
));
require.register("component-collection/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Enumerable = require('enumerable');\n\
\n\
/**\n\
 * Expose `Collection`.\n\
 */\n\
\n\
module.exports = Collection;\n\
\n\
/**\n\
 * Initialize a new collection with the given `models`.\n\
 *\n\
 * @param {Array} models\n\
 * @api public\n\
 */\n\
\n\
function Collection(models) {\n\
  this.models = models || [];\n\
}\n\
\n\
/**\n\
 * Mixin enumerable.\n\
 */\n\
\n\
Enumerable(Collection.prototype);\n\
\n\
/**\n\
 * Iterator implementation.\n\
 */\n\
\n\
Collection.prototype.__iterate__ = function(){\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.length() },\n\
    get: function(i){ return self.models[i] }\n\
  }\n\
};\n\
\n\
/**\n\
 * Return the collection length.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.length = function(){\n\
  return this.models.length;\n\
};\n\
\n\
/**\n\
 * Add `model` to the collection and return the index.\n\
 *\n\
 * @param {Object} model\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.push = function(model){\n\
  return this.models.push(model);\n\
};\n\
//@ sourceURL=component-collection/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // Note: when moving children, don't rely on el.children\n\
  // being 'live' to support Polymer's broken behaviour.\n\
  // See: https://github.com/component/domify/pull/23\n\
  if (1 == el.children.length) {\n\
    return el.removeChild(el.children[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.children.length) {\n\
    fragment.appendChild(el.removeChild(el.children[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n\
/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Function]': return 'function';\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object String]': return 'string';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val && val.nodeType === 1) return 'element';\n\
  if (val === Object(val)) return 'object';\n\
\n\
  return typeof val;\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function');\n\
var type;\n\
\n\
try {\n\
  type = require('type-component');\n\
} catch (e) {\n\
  type = require('type');\n\
}\n\
\n\
/**\n\
 * HOP reference.\n\
 */\n\
\n\
var has = Object.prototype.hasOwnProperty;\n\
\n\
/**\n\
 * Iterate the given `obj` and invoke `fn(val, i)`.\n\
 *\n\
 * @param {String|Array|Object} obj\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  fn = toFunction(fn);\n\
  switch (type(obj)) {\n\
    case 'array':\n\
      return array(obj, fn);\n\
    case 'object':\n\
      if ('number' == typeof obj.length) return array(obj, fn);\n\
      return object(obj, fn);\n\
    case 'string':\n\
      return string(obj, fn);\n\
  }\n\
};\n\
\n\
/**\n\
 * Iterate string chars.\n\
 *\n\
 * @param {String} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function string(obj, fn) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn(obj.charAt(i), i);\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate object keys.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function object(obj, fn) {\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      fn(key, obj[key]);\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate array-ish.\n\
 *\n\
 * @param {Array|Object} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function array(obj, fn) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn(obj[i], i);\n\
  }\n\
}\n\
//@ sourceURL=component-each/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',\n\
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',\n\
    prefix = bind !== 'addEventListener' ? 'on' : '';\n\
\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  el[bind](prefix + type, fn, capture || false);\n\
\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  el[unbind](prefix + type, fn, capture || false);\n\
\n\
  return fn;\n\
};//@ sourceURL=component-event/index.js"
));
require.register("component-trim/index.js", Function("exports, require, module",
"\n\
exports = module.exports = trim;\n\
\n\
function trim(str){\n\
  if (str.trim) return str.trim();\n\
  return str.replace(/^\\s*|\\s*$/g, '');\n\
}\n\
\n\
exports.left = function(str){\n\
  if (str.trimLeft) return str.trimLeft();\n\
  return str.replace(/^\\s*/, '');\n\
};\n\
\n\
exports.right = function(str){\n\
  if (str.trimRight) return str.trimRight();\n\
  return str.replace(/\\s*$/, '');\n\
};\n\
//@ sourceURL=component-trim/index.js"
));
require.register("component-querystring/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var trim = require('trim');\n\
\n\
/**\n\
 * Parse the given query `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
exports.parse = function(str){\n\
  if ('string' != typeof str) return {};\n\
\n\
  str = trim(str);\n\
  if ('' == str) return {};\n\
  if ('?' == str.charAt(0)) str = str.slice(1);\n\
\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  for (var i = 0; i < pairs.length; i++) {\n\
    var parts = pairs[i].split('=');\n\
    obj[parts[0]] = null == parts[1]\n\
      ? ''\n\
      : decodeURIComponent(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
};\n\
\n\
/**\n\
 * Stringify the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.stringify = function(obj){\n\
  if (!obj) return '';\n\
  var pairs = [];\n\
  for (var key in obj) {\n\
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));\n\
  }\n\
  return pairs.join('&');\n\
};\n\
//@ sourceURL=component-querystring/index.js"
));

require.register("component-jquery/index.js", Function("exports, require, module",
"/*!\n\
 * jQuery JavaScript Library v1.9.1\n\
 * http://jquery.com/\n\
 *\n\
 * Includes Sizzle.js\n\
 * http://sizzlejs.com/\n\
 *\n\
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors\n\
 * Released under the MIT license\n\
 * http://jquery.org/license\n\
 *\n\
 * Date: 2013-2-4\n\
 */\n\
(function( window, undefined ) {\n\
\n\
// Can't do this because several apps including ASP.NET trace\n\
// the stack via arguments.caller.callee and Firefox dies if\n\
// you try to trace through \"use strict\" call chains. (#13335)\n\
// Support: Firefox 18+\n\
//\"use strict\";\n\
var\n\
\t// The deferred used on DOM ready\n\
\treadyList,\n\
\n\
\t// A central reference to the root jQuery(document)\n\
\trootjQuery,\n\
\n\
\t// Support: IE<9\n\
\t// For `typeof node.method` instead of `node.method !== undefined`\n\
\tcore_strundefined = typeof undefined,\n\
\n\
\t// Use the correct document accordingly with window argument (sandbox)\n\
\tdocument = window.document,\n\
\tlocation = window.location,\n\
\n\
\t// Map over jQuery in case of overwrite\n\
\t_jQuery = window.jQuery,\n\
\n\
\t// Map over the $ in case of overwrite\n\
\t_$ = window.$,\n\
\n\
\t// [[Class]] -> type pairs\n\
\tclass2type = {},\n\
\n\
\t// List of deleted data cache ids, so we can reuse them\n\
\tcore_deletedIds = [],\n\
\n\
\tcore_version = \"1.9.1\",\n\
\n\
\t// Save a reference to some core methods\n\
\tcore_concat = core_deletedIds.concat,\n\
\tcore_push = core_deletedIds.push,\n\
\tcore_slice = core_deletedIds.slice,\n\
\tcore_indexOf = core_deletedIds.indexOf,\n\
\tcore_toString = class2type.toString,\n\
\tcore_hasOwn = class2type.hasOwnProperty,\n\
\tcore_trim = core_version.trim,\n\
\n\
\t// Define a local copy of jQuery\n\
\tjQuery = function( selector, context ) {\n\
\t\t// The jQuery object is actually just the init constructor 'enhanced'\n\
\t\treturn new jQuery.fn.init( selector, context, rootjQuery );\n\
\t},\n\
\n\
\t// Used for matching numbers\n\
\tcore_pnum = /[+-]?(?:\\d*\\.|)\\d+(?:[eE][+-]?\\d+|)/.source,\n\
\n\
\t// Used for splitting on whitespace\n\
\tcore_rnotwhite = /\\S+/g,\n\
\n\
\t// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)\n\
\trtrim = /^[\\s\\uFEFF\\xA0]+|[\\s\\uFEFF\\xA0]+$/g,\n\
\n\
\t// A simple way to check for HTML strings\n\
\t// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)\n\
\t// Strict HTML recognition (#11290: must start with <)\n\
\trquickExpr = /^(?:(<[\\w\\W]+>)[^>]*|#([\\w-]*))$/,\n\
\n\
\t// Match a standalone tag\n\
\trsingleTag = /^<(\\w+)\\s*\\/?>(?:<\\/\\1>|)$/,\n\
\n\
\t// JSON RegExp\n\
\trvalidchars = /^[\\],:{}\\s]*$/,\n\
\trvalidbraces = /(?:^|:|,)(?:\\s*\\[)+/g,\n\
\trvalidescape = /\\\\(?:[\"\\\\\\/bfnrt]|u[\\da-fA-F]{4})/g,\n\
\trvalidtokens = /\"[^\"\\\\\\r\\n\
]*\"|true|false|null|-?(?:\\d+\\.|)\\d+(?:[eE][+-]?\\d+|)/g,\n\
\n\
\t// Matches dashed string for camelizing\n\
\trmsPrefix = /^-ms-/,\n\
\trdashAlpha = /-([\\da-z])/gi,\n\
\n\
\t// Used by jQuery.camelCase as callback to replace()\n\
\tfcamelCase = function( all, letter ) {\n\
\t\treturn letter.toUpperCase();\n\
\t},\n\
\n\
\t// The ready event handler\n\
\tcompleted = function( event ) {\n\
\n\
\t\t// readyState === \"complete\" is good enough for us to call the dom ready in oldIE\n\
\t\tif ( document.addEventListener || event.type === \"load\" || document.readyState === \"complete\" ) {\n\
\t\t\tdetach();\n\
\t\t\tjQuery.ready();\n\
\t\t}\n\
\t},\n\
\t// Clean-up method for dom ready events\n\
\tdetach = function() {\n\
\t\tif ( document.addEventListener ) {\n\
\t\t\tdocument.removeEventListener( \"DOMContentLoaded\", completed, false );\n\
\t\t\twindow.removeEventListener( \"load\", completed, false );\n\
\n\
\t\t} else {\n\
\t\t\tdocument.detachEvent( \"onreadystatechange\", completed );\n\
\t\t\twindow.detachEvent( \"onload\", completed );\n\
\t\t}\n\
\t};\n\
\n\
jQuery.fn = jQuery.prototype = {\n\
\t// The current version of jQuery being used\n\
\tjquery: core_version,\n\
\n\
\tconstructor: jQuery,\n\
\tinit: function( selector, context, rootjQuery ) {\n\
\t\tvar match, elem;\n\
\n\
\t\t// HANDLE: $(\"\"), $(null), $(undefined), $(false)\n\
\t\tif ( !selector ) {\n\
\t\t\treturn this;\n\
\t\t}\n\
\n\
\t\t// Handle HTML strings\n\
\t\tif ( typeof selector === \"string\" ) {\n\
\t\t\tif ( selector.charAt(0) === \"<\" && selector.charAt( selector.length - 1 ) === \">\" && selector.length >= 3 ) {\n\
\t\t\t\t// Assume that strings that start and end with <> are HTML and skip the regex check\n\
\t\t\t\tmatch = [ null, selector, null ];\n\
\n\
\t\t\t} else {\n\
\t\t\t\tmatch = rquickExpr.exec( selector );\n\
\t\t\t}\n\
\n\
\t\t\t// Match html or make sure no context is specified for #id\n\
\t\t\tif ( match && (match[1] || !context) ) {\n\
\n\
\t\t\t\t// HANDLE: $(html) -> $(array)\n\
\t\t\t\tif ( match[1] ) {\n\
\t\t\t\t\tcontext = context instanceof jQuery ? context[0] : context;\n\
\n\
\t\t\t\t\t// scripts is true for back-compat\n\
\t\t\t\t\tjQuery.merge( this, jQuery.parseHTML(\n\
\t\t\t\t\t\tmatch[1],\n\
\t\t\t\t\t\tcontext && context.nodeType ? context.ownerDocument || context : document,\n\
\t\t\t\t\t\ttrue\n\
\t\t\t\t\t) );\n\
\n\
\t\t\t\t\t// HANDLE: $(html, props)\n\
\t\t\t\t\tif ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {\n\
\t\t\t\t\t\tfor ( match in context ) {\n\
\t\t\t\t\t\t\t// Properties of context are called as methods if possible\n\
\t\t\t\t\t\t\tif ( jQuery.isFunction( this[ match ] ) ) {\n\
\t\t\t\t\t\t\t\tthis[ match ]( context[ match ] );\n\
\n\
\t\t\t\t\t\t\t// ...and otherwise set as attributes\n\
\t\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\t\tthis.attr( match, context[ match ] );\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\treturn this;\n\
\n\
\t\t\t\t// HANDLE: $(#id)\n\
\t\t\t\t} else {\n\
\t\t\t\t\telem = document.getElementById( match[2] );\n\
\n\
\t\t\t\t\t// Check parentNode to catch when Blackberry 4.6 returns\n\
\t\t\t\t\t// nodes that are no longer in the document #6963\n\
\t\t\t\t\tif ( elem && elem.parentNode ) {\n\
\t\t\t\t\t\t// Handle the case where IE and Opera return items\n\
\t\t\t\t\t\t// by name instead of ID\n\
\t\t\t\t\t\tif ( elem.id !== match[2] ) {\n\
\t\t\t\t\t\t\treturn rootjQuery.find( selector );\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t// Otherwise, we inject the element directly into the jQuery object\n\
\t\t\t\t\t\tthis.length = 1;\n\
\t\t\t\t\t\tthis[0] = elem;\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\tthis.context = document;\n\
\t\t\t\t\tthis.selector = selector;\n\
\t\t\t\t\treturn this;\n\
\t\t\t\t}\n\
\n\
\t\t\t// HANDLE: $(expr, $(...))\n\
\t\t\t} else if ( !context || context.jquery ) {\n\
\t\t\t\treturn ( context || rootjQuery ).find( selector );\n\
\n\
\t\t\t// HANDLE: $(expr, context)\n\
\t\t\t// (which is just equivalent to: $(context).find(expr)\n\
\t\t\t} else {\n\
\t\t\t\treturn this.constructor( context ).find( selector );\n\
\t\t\t}\n\
\n\
\t\t// HANDLE: $(DOMElement)\n\
\t\t} else if ( selector.nodeType ) {\n\
\t\t\tthis.context = this[0] = selector;\n\
\t\t\tthis.length = 1;\n\
\t\t\treturn this;\n\
\n\
\t\t// HANDLE: $(function)\n\
\t\t// Shortcut for document ready\n\
\t\t} else if ( jQuery.isFunction( selector ) ) {\n\
\t\t\treturn rootjQuery.ready( selector );\n\
\t\t}\n\
\n\
\t\tif ( selector.selector !== undefined ) {\n\
\t\t\tthis.selector = selector.selector;\n\
\t\t\tthis.context = selector.context;\n\
\t\t}\n\
\n\
\t\treturn jQuery.makeArray( selector, this );\n\
\t},\n\
\n\
\t// Start with an empty selector\n\
\tselector: \"\",\n\
\n\
\t// The default length of a jQuery object is 0\n\
\tlength: 0,\n\
\n\
\t// The number of elements contained in the matched element set\n\
\tsize: function() {\n\
\t\treturn this.length;\n\
\t},\n\
\n\
\ttoArray: function() {\n\
\t\treturn core_slice.call( this );\n\
\t},\n\
\n\
\t// Get the Nth element in the matched element set OR\n\
\t// Get the whole matched element set as a clean array\n\
\tget: function( num ) {\n\
\t\treturn num == null ?\n\
\n\
\t\t\t// Return a 'clean' array\n\
\t\t\tthis.toArray() :\n\
\n\
\t\t\t// Return just the object\n\
\t\t\t( num < 0 ? this[ this.length + num ] : this[ num ] );\n\
\t},\n\
\n\
\t// Take an array of elements and push it onto the stack\n\
\t// (returning the new matched element set)\n\
\tpushStack: function( elems ) {\n\
\n\
\t\t// Build a new jQuery matched element set\n\
\t\tvar ret = jQuery.merge( this.constructor(), elems );\n\
\n\
\t\t// Add the old object onto the stack (as a reference)\n\
\t\tret.prevObject = this;\n\
\t\tret.context = this.context;\n\
\n\
\t\t// Return the newly-formed element set\n\
\t\treturn ret;\n\
\t},\n\
\n\
\t// Execute a callback for every element in the matched set.\n\
\t// (You can seed the arguments with an array of args, but this is\n\
\t// only used internally.)\n\
\teach: function( callback, args ) {\n\
\t\treturn jQuery.each( this, callback, args );\n\
\t},\n\
\n\
\tready: function( fn ) {\n\
\t\t// Add the callback\n\
\t\tjQuery.ready.promise().done( fn );\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\tslice: function() {\n\
\t\treturn this.pushStack( core_slice.apply( this, arguments ) );\n\
\t},\n\
\n\
\tfirst: function() {\n\
\t\treturn this.eq( 0 );\n\
\t},\n\
\n\
\tlast: function() {\n\
\t\treturn this.eq( -1 );\n\
\t},\n\
\n\
\teq: function( i ) {\n\
\t\tvar len = this.length,\n\
\t\t\tj = +i + ( i < 0 ? len : 0 );\n\
\t\treturn this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );\n\
\t},\n\
\n\
\tmap: function( callback ) {\n\
\t\treturn this.pushStack( jQuery.map(this, function( elem, i ) {\n\
\t\t\treturn callback.call( elem, i, elem );\n\
\t\t}));\n\
\t},\n\
\n\
\tend: function() {\n\
\t\treturn this.prevObject || this.constructor(null);\n\
\t},\n\
\n\
\t// For internal use only.\n\
\t// Behaves like an Array's method, not like a jQuery method.\n\
\tpush: core_push,\n\
\tsort: [].sort,\n\
\tsplice: [].splice\n\
};\n\
\n\
// Give the init function the jQuery prototype for later instantiation\n\
jQuery.fn.init.prototype = jQuery.fn;\n\
\n\
jQuery.extend = jQuery.fn.extend = function() {\n\
\tvar src, copyIsArray, copy, name, options, clone,\n\
\t\ttarget = arguments[0] || {},\n\
\t\ti = 1,\n\
\t\tlength = arguments.length,\n\
\t\tdeep = false;\n\
\n\
\t// Handle a deep copy situation\n\
\tif ( typeof target === \"boolean\" ) {\n\
\t\tdeep = target;\n\
\t\ttarget = arguments[1] || {};\n\
\t\t// skip the boolean and the target\n\
\t\ti = 2;\n\
\t}\n\
\n\
\t// Handle case when target is a string or something (possible in deep copy)\n\
\tif ( typeof target !== \"object\" && !jQuery.isFunction(target) ) {\n\
\t\ttarget = {};\n\
\t}\n\
\n\
\t// extend jQuery itself if only one argument is passed\n\
\tif ( length === i ) {\n\
\t\ttarget = this;\n\
\t\t--i;\n\
\t}\n\
\n\
\tfor ( ; i < length; i++ ) {\n\
\t\t// Only deal with non-null/undefined values\n\
\t\tif ( (options = arguments[ i ]) != null ) {\n\
\t\t\t// Extend the base object\n\
\t\t\tfor ( name in options ) {\n\
\t\t\t\tsrc = target[ name ];\n\
\t\t\t\tcopy = options[ name ];\n\
\n\
\t\t\t\t// Prevent never-ending loop\n\
\t\t\t\tif ( target === copy ) {\n\
\t\t\t\t\tcontinue;\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// Recurse if we're merging plain objects or arrays\n\
\t\t\t\tif ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {\n\
\t\t\t\t\tif ( copyIsArray ) {\n\
\t\t\t\t\t\tcopyIsArray = false;\n\
\t\t\t\t\t\tclone = src && jQuery.isArray(src) ? src : [];\n\
\n\
\t\t\t\t\t} else {\n\
\t\t\t\t\t\tclone = src && jQuery.isPlainObject(src) ? src : {};\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Never move original objects, clone them\n\
\t\t\t\t\ttarget[ name ] = jQuery.extend( deep, clone, copy );\n\
\n\
\t\t\t\t// Don't bring in undefined values\n\
\t\t\t\t} else if ( copy !== undefined ) {\n\
\t\t\t\t\ttarget[ name ] = copy;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\t// Return the modified object\n\
\treturn target;\n\
};\n\
\n\
jQuery.extend({\n\
\tnoConflict: function( deep ) {\n\
\t\tif ( window.$ === jQuery ) {\n\
\t\t\twindow.$ = _$;\n\
\t\t}\n\
\n\
\t\tif ( deep && window.jQuery === jQuery ) {\n\
\t\t\twindow.jQuery = _jQuery;\n\
\t\t}\n\
\n\
\t\treturn jQuery;\n\
\t},\n\
\n\
\t// Is the DOM ready to be used? Set to true once it occurs.\n\
\tisReady: false,\n\
\n\
\t// A counter to track how many items to wait for before\n\
\t// the ready event fires. See #6781\n\
\treadyWait: 1,\n\
\n\
\t// Hold (or release) the ready event\n\
\tholdReady: function( hold ) {\n\
\t\tif ( hold ) {\n\
\t\t\tjQuery.readyWait++;\n\
\t\t} else {\n\
\t\t\tjQuery.ready( true );\n\
\t\t}\n\
\t},\n\
\n\
\t// Handle when the DOM is ready\n\
\tready: function( wait ) {\n\
\n\
\t\t// Abort if there are pending holds or we're already ready\n\
\t\tif ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).\n\
\t\tif ( !document.body ) {\n\
\t\t\treturn setTimeout( jQuery.ready );\n\
\t\t}\n\
\n\
\t\t// Remember that the DOM is ready\n\
\t\tjQuery.isReady = true;\n\
\n\
\t\t// If a normal DOM Ready event fired, decrement, and wait if need be\n\
\t\tif ( wait !== true && --jQuery.readyWait > 0 ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// If there are functions bound, to execute\n\
\t\treadyList.resolveWith( document, [ jQuery ] );\n\
\n\
\t\t// Trigger any bound ready events\n\
\t\tif ( jQuery.fn.trigger ) {\n\
\t\t\tjQuery( document ).trigger(\"ready\").off(\"ready\");\n\
\t\t}\n\
\t},\n\
\n\
\t// See test/unit/core.js for details concerning isFunction.\n\
\t// Since version 1.3, DOM methods and functions like alert\n\
\t// aren't supported. They return false on IE (#2968).\n\
\tisFunction: function( obj ) {\n\
\t\treturn jQuery.type(obj) === \"function\";\n\
\t},\n\
\n\
\tisArray: Array.isArray || function( obj ) {\n\
\t\treturn jQuery.type(obj) === \"array\";\n\
\t},\n\
\n\
\tisWindow: function( obj ) {\n\
\t\treturn obj != null && obj == obj.window;\n\
\t},\n\
\n\
\tisNumeric: function( obj ) {\n\
\t\treturn !isNaN( parseFloat(obj) ) && isFinite( obj );\n\
\t},\n\
\n\
\ttype: function( obj ) {\n\
\t\tif ( obj == null ) {\n\
\t\t\treturn String( obj );\n\
\t\t}\n\
\t\treturn typeof obj === \"object\" || typeof obj === \"function\" ?\n\
\t\t\tclass2type[ core_toString.call(obj) ] || \"object\" :\n\
\t\t\ttypeof obj;\n\
\t},\n\
\n\
\tisPlainObject: function( obj ) {\n\
\t\t// Must be an Object.\n\
\t\t// Because of IE, we also have to check the presence of the constructor property.\n\
\t\t// Make sure that DOM nodes and window objects don't pass through, as well\n\
\t\tif ( !obj || jQuery.type(obj) !== \"object\" || obj.nodeType || jQuery.isWindow( obj ) ) {\n\
\t\t\treturn false;\n\
\t\t}\n\
\n\
\t\ttry {\n\
\t\t\t// Not own constructor property must be Object\n\
\t\t\tif ( obj.constructor &&\n\
\t\t\t\t!core_hasOwn.call(obj, \"constructor\") &&\n\
\t\t\t\t!core_hasOwn.call(obj.constructor.prototype, \"isPrototypeOf\") ) {\n\
\t\t\t\treturn false;\n\
\t\t\t}\n\
\t\t} catch ( e ) {\n\
\t\t\t// IE8,9 Will throw exceptions on certain host objects #9897\n\
\t\t\treturn false;\n\
\t\t}\n\
\n\
\t\t// Own properties are enumerated firstly, so to speed up,\n\
\t\t// if last one is own, then all properties are own.\n\
\n\
\t\tvar key;\n\
\t\tfor ( key in obj ) {}\n\
\n\
\t\treturn key === undefined || core_hasOwn.call( obj, key );\n\
\t},\n\
\n\
\tisEmptyObject: function( obj ) {\n\
\t\tvar name;\n\
\t\tfor ( name in obj ) {\n\
\t\t\treturn false;\n\
\t\t}\n\
\t\treturn true;\n\
\t},\n\
\n\
\terror: function( msg ) {\n\
\t\tthrow new Error( msg );\n\
\t},\n\
\n\
\t// data: string of html\n\
\t// context (optional): If specified, the fragment will be created in this context, defaults to document\n\
\t// keepScripts (optional): If true, will include scripts passed in the html string\n\
\tparseHTML: function( data, context, keepScripts ) {\n\
\t\tif ( !data || typeof data !== \"string\" ) {\n\
\t\t\treturn null;\n\
\t\t}\n\
\t\tif ( typeof context === \"boolean\" ) {\n\
\t\t\tkeepScripts = context;\n\
\t\t\tcontext = false;\n\
\t\t}\n\
\t\tcontext = context || document;\n\
\n\
\t\tvar parsed = rsingleTag.exec( data ),\n\
\t\t\tscripts = !keepScripts && [];\n\
\n\
\t\t// Single tag\n\
\t\tif ( parsed ) {\n\
\t\t\treturn [ context.createElement( parsed[1] ) ];\n\
\t\t}\n\
\n\
\t\tparsed = jQuery.buildFragment( [ data ], context, scripts );\n\
\t\tif ( scripts ) {\n\
\t\t\tjQuery( scripts ).remove();\n\
\t\t}\n\
\t\treturn jQuery.merge( [], parsed.childNodes );\n\
\t},\n\
\n\
\tparseJSON: function( data ) {\n\
\t\t// Attempt to parse using the native JSON parser first\n\
\t\tif ( window.JSON && window.JSON.parse ) {\n\
\t\t\treturn window.JSON.parse( data );\n\
\t\t}\n\
\n\
\t\tif ( data === null ) {\n\
\t\t\treturn data;\n\
\t\t}\n\
\n\
\t\tif ( typeof data === \"string\" ) {\n\
\n\
\t\t\t// Make sure leading/trailing whitespace is removed (IE can't handle it)\n\
\t\t\tdata = jQuery.trim( data );\n\
\n\
\t\t\tif ( data ) {\n\
\t\t\t\t// Make sure the incoming data is actual JSON\n\
\t\t\t\t// Logic borrowed from http://json.org/json2.js\n\
\t\t\t\tif ( rvalidchars.test( data.replace( rvalidescape, \"@\" )\n\
\t\t\t\t\t.replace( rvalidtokens, \"]\" )\n\
\t\t\t\t\t.replace( rvalidbraces, \"\")) ) {\n\
\n\
\t\t\t\t\treturn ( new Function( \"return \" + data ) )();\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\tjQuery.error( \"Invalid JSON: \" + data );\n\
\t},\n\
\n\
\t// Cross-browser xml parsing\n\
\tparseXML: function( data ) {\n\
\t\tvar xml, tmp;\n\
\t\tif ( !data || typeof data !== \"string\" ) {\n\
\t\t\treturn null;\n\
\t\t}\n\
\t\ttry {\n\
\t\t\tif ( window.DOMParser ) { // Standard\n\
\t\t\t\ttmp = new DOMParser();\n\
\t\t\t\txml = tmp.parseFromString( data , \"text/xml\" );\n\
\t\t\t} else { // IE\n\
\t\t\t\txml = new ActiveXObject( \"Microsoft.XMLDOM\" );\n\
\t\t\t\txml.async = \"false\";\n\
\t\t\t\txml.loadXML( data );\n\
\t\t\t}\n\
\t\t} catch( e ) {\n\
\t\t\txml = undefined;\n\
\t\t}\n\
\t\tif ( !xml || !xml.documentElement || xml.getElementsByTagName( \"parsererror\" ).length ) {\n\
\t\t\tjQuery.error( \"Invalid XML: \" + data );\n\
\t\t}\n\
\t\treturn xml;\n\
\t},\n\
\n\
\tnoop: function() {},\n\
\n\
\t// Evaluates a script in a global context\n\
\t// Workarounds based on findings by Jim Driscoll\n\
\t// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context\n\
\tglobalEval: function( data ) {\n\
\t\tif ( data && jQuery.trim( data ) ) {\n\
\t\t\t// We use execScript on Internet Explorer\n\
\t\t\t// We use an anonymous function so that context is window\n\
\t\t\t// rather than jQuery in Firefox\n\
\t\t\t( window.execScript || function( data ) {\n\
\t\t\t\twindow[ \"eval\" ].call( window, data );\n\
\t\t\t} )( data );\n\
\t\t}\n\
\t},\n\
\n\
\t// Convert dashed to camelCase; used by the css and data modules\n\
\t// Microsoft forgot to hump their vendor prefix (#9572)\n\
\tcamelCase: function( string ) {\n\
\t\treturn string.replace( rmsPrefix, \"ms-\" ).replace( rdashAlpha, fcamelCase );\n\
\t},\n\
\n\
\tnodeName: function( elem, name ) {\n\
\t\treturn elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();\n\
\t},\n\
\n\
\t// args is for internal usage only\n\
\teach: function( obj, callback, args ) {\n\
\t\tvar value,\n\
\t\t\ti = 0,\n\
\t\t\tlength = obj.length,\n\
\t\t\tisArray = isArraylike( obj );\n\
\n\
\t\tif ( args ) {\n\
\t\t\tif ( isArray ) {\n\
\t\t\t\tfor ( ; i < length; i++ ) {\n\
\t\t\t\t\tvalue = callback.apply( obj[ i ], args );\n\
\n\
\t\t\t\t\tif ( value === false ) {\n\
\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t} else {\n\
\t\t\t\tfor ( i in obj ) {\n\
\t\t\t\t\tvalue = callback.apply( obj[ i ], args );\n\
\n\
\t\t\t\t\tif ( value === false ) {\n\
\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t// A special, fast, case for the most common use of each\n\
\t\t} else {\n\
\t\t\tif ( isArray ) {\n\
\t\t\t\tfor ( ; i < length; i++ ) {\n\
\t\t\t\t\tvalue = callback.call( obj[ i ], i, obj[ i ] );\n\
\n\
\t\t\t\t\tif ( value === false ) {\n\
\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t} else {\n\
\t\t\t\tfor ( i in obj ) {\n\
\t\t\t\t\tvalue = callback.call( obj[ i ], i, obj[ i ] );\n\
\n\
\t\t\t\t\tif ( value === false ) {\n\
\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn obj;\n\
\t},\n\
\n\
\t// Use native String.trim function wherever possible\n\
\ttrim: core_trim && !core_trim.call(\"\\uFEFF\\xA0\") ?\n\
\t\tfunction( text ) {\n\
\t\t\treturn text == null ?\n\
\t\t\t\t\"\" :\n\
\t\t\t\tcore_trim.call( text );\n\
\t\t} :\n\
\n\
\t\t// Otherwise use our own trimming functionality\n\
\t\tfunction( text ) {\n\
\t\t\treturn text == null ?\n\
\t\t\t\t\"\" :\n\
\t\t\t\t( text + \"\" ).replace( rtrim, \"\" );\n\
\t\t},\n\
\n\
\t// results is for internal usage only\n\
\tmakeArray: function( arr, results ) {\n\
\t\tvar ret = results || [];\n\
\n\
\t\tif ( arr != null ) {\n\
\t\t\tif ( isArraylike( Object(arr) ) ) {\n\
\t\t\t\tjQuery.merge( ret,\n\
\t\t\t\t\ttypeof arr === \"string\" ?\n\
\t\t\t\t\t[ arr ] : arr\n\
\t\t\t\t);\n\
\t\t\t} else {\n\
\t\t\t\tcore_push.call( ret, arr );\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn ret;\n\
\t},\n\
\n\
\tinArray: function( elem, arr, i ) {\n\
\t\tvar len;\n\
\n\
\t\tif ( arr ) {\n\
\t\t\tif ( core_indexOf ) {\n\
\t\t\t\treturn core_indexOf.call( arr, elem, i );\n\
\t\t\t}\n\
\n\
\t\t\tlen = arr.length;\n\
\t\t\ti = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;\n\
\n\
\t\t\tfor ( ; i < len; i++ ) {\n\
\t\t\t\t// Skip accessing in sparse arrays\n\
\t\t\t\tif ( i in arr && arr[ i ] === elem ) {\n\
\t\t\t\t\treturn i;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn -1;\n\
\t},\n\
\n\
\tmerge: function( first, second ) {\n\
\t\tvar l = second.length,\n\
\t\t\ti = first.length,\n\
\t\t\tj = 0;\n\
\n\
\t\tif ( typeof l === \"number\" ) {\n\
\t\t\tfor ( ; j < l; j++ ) {\n\
\t\t\t\tfirst[ i++ ] = second[ j ];\n\
\t\t\t}\n\
\t\t} else {\n\
\t\t\twhile ( second[j] !== undefined ) {\n\
\t\t\t\tfirst[ i++ ] = second[ j++ ];\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\tfirst.length = i;\n\
\n\
\t\treturn first;\n\
\t},\n\
\n\
\tgrep: function( elems, callback, inv ) {\n\
\t\tvar retVal,\n\
\t\t\tret = [],\n\
\t\t\ti = 0,\n\
\t\t\tlength = elems.length;\n\
\t\tinv = !!inv;\n\
\n\
\t\t// Go through the array, only saving the items\n\
\t\t// that pass the validator function\n\
\t\tfor ( ; i < length; i++ ) {\n\
\t\t\tretVal = !!callback( elems[ i ], i );\n\
\t\t\tif ( inv !== retVal ) {\n\
\t\t\t\tret.push( elems[ i ] );\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn ret;\n\
\t},\n\
\n\
\t// arg is for internal usage only\n\
\tmap: function( elems, callback, arg ) {\n\
\t\tvar value,\n\
\t\t\ti = 0,\n\
\t\t\tlength = elems.length,\n\
\t\t\tisArray = isArraylike( elems ),\n\
\t\t\tret = [];\n\
\n\
\t\t// Go through the array, translating each of the items to their\n\
\t\tif ( isArray ) {\n\
\t\t\tfor ( ; i < length; i++ ) {\n\
\t\t\t\tvalue = callback( elems[ i ], i, arg );\n\
\n\
\t\t\t\tif ( value != null ) {\n\
\t\t\t\t\tret[ ret.length ] = value;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t// Go through every key on the object,\n\
\t\t} else {\n\
\t\t\tfor ( i in elems ) {\n\
\t\t\t\tvalue = callback( elems[ i ], i, arg );\n\
\n\
\t\t\t\tif ( value != null ) {\n\
\t\t\t\t\tret[ ret.length ] = value;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Flatten any nested arrays\n\
\t\treturn core_concat.apply( [], ret );\n\
\t},\n\
\n\
\t// A global GUID counter for objects\n\
\tguid: 1,\n\
\n\
\t// Bind a function to a context, optionally partially applying any\n\
\t// arguments.\n\
\tproxy: function( fn, context ) {\n\
\t\tvar args, proxy, tmp;\n\
\n\
\t\tif ( typeof context === \"string\" ) {\n\
\t\t\ttmp = fn[ context ];\n\
\t\t\tcontext = fn;\n\
\t\t\tfn = tmp;\n\
\t\t}\n\
\n\
\t\t// Quick check to determine if target is callable, in the spec\n\
\t\t// this throws a TypeError, but we will just return undefined.\n\
\t\tif ( !jQuery.isFunction( fn ) ) {\n\
\t\t\treturn undefined;\n\
\t\t}\n\
\n\
\t\t// Simulated bind\n\
\t\targs = core_slice.call( arguments, 2 );\n\
\t\tproxy = function() {\n\
\t\t\treturn fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );\n\
\t\t};\n\
\n\
\t\t// Set the guid of unique handler to the same of original handler, so it can be removed\n\
\t\tproxy.guid = fn.guid = fn.guid || jQuery.guid++;\n\
\n\
\t\treturn proxy;\n\
\t},\n\
\n\
\t// Multifunctional method to get and set values of a collection\n\
\t// The value/s can optionally be executed if it's a function\n\
\taccess: function( elems, fn, key, value, chainable, emptyGet, raw ) {\n\
\t\tvar i = 0,\n\
\t\t\tlength = elems.length,\n\
\t\t\tbulk = key == null;\n\
\n\
\t\t// Sets many values\n\
\t\tif ( jQuery.type( key ) === \"object\" ) {\n\
\t\t\tchainable = true;\n\
\t\t\tfor ( i in key ) {\n\
\t\t\t\tjQuery.access( elems, fn, i, key[i], true, emptyGet, raw );\n\
\t\t\t}\n\
\n\
\t\t// Sets one value\n\
\t\t} else if ( value !== undefined ) {\n\
\t\t\tchainable = true;\n\
\n\
\t\t\tif ( !jQuery.isFunction( value ) ) {\n\
\t\t\t\traw = true;\n\
\t\t\t}\n\
\n\
\t\t\tif ( bulk ) {\n\
\t\t\t\t// Bulk operations run against the entire set\n\
\t\t\t\tif ( raw ) {\n\
\t\t\t\t\tfn.call( elems, value );\n\
\t\t\t\t\tfn = null;\n\
\n\
\t\t\t\t// ...except when executing function values\n\
\t\t\t\t} else {\n\
\t\t\t\t\tbulk = fn;\n\
\t\t\t\t\tfn = function( elem, key, value ) {\n\
\t\t\t\t\t\treturn bulk.call( jQuery( elem ), value );\n\
\t\t\t\t\t};\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\tif ( fn ) {\n\
\t\t\t\tfor ( ; i < length; i++ ) {\n\
\t\t\t\t\tfn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn chainable ?\n\
\t\t\telems :\n\
\n\
\t\t\t// Gets\n\
\t\t\tbulk ?\n\
\t\t\t\tfn.call( elems ) :\n\
\t\t\t\tlength ? fn( elems[0], key ) : emptyGet;\n\
\t},\n\
\n\
\tnow: function() {\n\
\t\treturn ( new Date() ).getTime();\n\
\t}\n\
});\n\
\n\
jQuery.ready.promise = function( obj ) {\n\
\tif ( !readyList ) {\n\
\n\
\t\treadyList = jQuery.Deferred();\n\
\n\
\t\t// Catch cases where $(document).ready() is called after the browser event has already occurred.\n\
\t\t// we once tried to use readyState \"interactive\" here, but it caused issues like the one\n\
\t\t// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15\n\
\t\tif ( document.readyState === \"complete\" ) {\n\
\t\t\t// Handle it asynchronously to allow scripts the opportunity to delay ready\n\
\t\t\tsetTimeout( jQuery.ready );\n\
\n\
\t\t// Standards-based browsers support DOMContentLoaded\n\
\t\t} else if ( document.addEventListener ) {\n\
\t\t\t// Use the handy event callback\n\
\t\t\tdocument.addEventListener( \"DOMContentLoaded\", completed, false );\n\
\n\
\t\t\t// A fallback to window.onload, that will always work\n\
\t\t\twindow.addEventListener( \"load\", completed, false );\n\
\n\
\t\t// If IE event model is used\n\
\t\t} else {\n\
\t\t\t// Ensure firing before onload, maybe late but safe also for iframes\n\
\t\t\tdocument.attachEvent( \"onreadystatechange\", completed );\n\
\n\
\t\t\t// A fallback to window.onload, that will always work\n\
\t\t\twindow.attachEvent( \"onload\", completed );\n\
\n\
\t\t\t// If IE and not a frame\n\
\t\t\t// continually check to see if the document is ready\n\
\t\t\tvar top = false;\n\
\n\
\t\t\ttry {\n\
\t\t\t\ttop = window.frameElement == null && document.documentElement;\n\
\t\t\t} catch(e) {}\n\
\n\
\t\t\tif ( top && top.doScroll ) {\n\
\t\t\t\t(function doScrollCheck() {\n\
\t\t\t\t\tif ( !jQuery.isReady ) {\n\
\n\
\t\t\t\t\t\ttry {\n\
\t\t\t\t\t\t\t// Use the trick by Diego Perini\n\
\t\t\t\t\t\t\t// http://javascript.nwbox.com/IEContentLoaded/\n\
\t\t\t\t\t\t\ttop.doScroll(\"left\");\n\
\t\t\t\t\t\t} catch(e) {\n\
\t\t\t\t\t\t\treturn setTimeout( doScrollCheck, 50 );\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t// detach all dom ready events\n\
\t\t\t\t\t\tdetach();\n\
\n\
\t\t\t\t\t\t// and execute any waiting functions\n\
\t\t\t\t\t\tjQuery.ready();\n\
\t\t\t\t\t}\n\
\t\t\t\t})();\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\treturn readyList.promise( obj );\n\
};\n\
\n\
// Populate the class2type map\n\
jQuery.each(\"Boolean Number String Function Array Date RegExp Object Error\".split(\" \"), function(i, name) {\n\
\tclass2type[ \"[object \" + name + \"]\" ] = name.toLowerCase();\n\
});\n\
\n\
function isArraylike( obj ) {\n\
\tvar length = obj.length,\n\
\t\ttype = jQuery.type( obj );\n\
\n\
\tif ( jQuery.isWindow( obj ) ) {\n\
\t\treturn false;\n\
\t}\n\
\n\
\tif ( obj.nodeType === 1 && length ) {\n\
\t\treturn true;\n\
\t}\n\
\n\
\treturn type === \"array\" || type !== \"function\" &&\n\
\t\t( length === 0 ||\n\
\t\ttypeof length === \"number\" && length > 0 && ( length - 1 ) in obj );\n\
}\n\
\n\
// All jQuery objects should point back to these\n\
rootjQuery = jQuery(document);\n\
// String to Object options format cache\n\
var optionsCache = {};\n\
\n\
// Convert String-formatted options into Object-formatted ones and store in cache\n\
function createOptions( options ) {\n\
\tvar object = optionsCache[ options ] = {};\n\
\tjQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {\n\
\t\tobject[ flag ] = true;\n\
\t});\n\
\treturn object;\n\
}\n\
\n\
/*\n\
 * Create a callback list using the following parameters:\n\
 *\n\
 *\toptions: an optional list of space-separated options that will change how\n\
 *\t\t\tthe callback list behaves or a more traditional option object\n\
 *\n\
 * By default a callback list will act like an event callback list and can be\n\
 * \"fired\" multiple times.\n\
 *\n\
 * Possible options:\n\
 *\n\
 *\tonce:\t\t\twill ensure the callback list can only be fired once (like a Deferred)\n\
 *\n\
 *\tmemory:\t\t\twill keep track of previous values and will call any callback added\n\
 *\t\t\t\t\tafter the list has been fired right away with the latest \"memorized\"\n\
 *\t\t\t\t\tvalues (like a Deferred)\n\
 *\n\
 *\tunique:\t\t\twill ensure a callback can only be added once (no duplicate in the list)\n\
 *\n\
 *\tstopOnFalse:\tinterrupt callings when a callback returns false\n\
 *\n\
 */\n\
jQuery.Callbacks = function( options ) {\n\
\n\
\t// Convert options from String-formatted to Object-formatted if needed\n\
\t// (we check in cache first)\n\
\toptions = typeof options === \"string\" ?\n\
\t\t( optionsCache[ options ] || createOptions( options ) ) :\n\
\t\tjQuery.extend( {}, options );\n\
\n\
\tvar // Flag to know if list is currently firing\n\
\t\tfiring,\n\
\t\t// Last fire value (for non-forgettable lists)\n\
\t\tmemory,\n\
\t\t// Flag to know if list was already fired\n\
\t\tfired,\n\
\t\t// End of the loop when firing\n\
\t\tfiringLength,\n\
\t\t// Index of currently firing callback (modified by remove if needed)\n\
\t\tfiringIndex,\n\
\t\t// First callback to fire (used internally by add and fireWith)\n\
\t\tfiringStart,\n\
\t\t// Actual callback list\n\
\t\tlist = [],\n\
\t\t// Stack of fire calls for repeatable lists\n\
\t\tstack = !options.once && [],\n\
\t\t// Fire callbacks\n\
\t\tfire = function( data ) {\n\
\t\t\tmemory = options.memory && data;\n\
\t\t\tfired = true;\n\
\t\t\tfiringIndex = firingStart || 0;\n\
\t\t\tfiringStart = 0;\n\
\t\t\tfiringLength = list.length;\n\
\t\t\tfiring = true;\n\
\t\t\tfor ( ; list && firingIndex < firingLength; firingIndex++ ) {\n\
\t\t\t\tif ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {\n\
\t\t\t\t\tmemory = false; // To prevent further calls using add\n\
\t\t\t\t\tbreak;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t\tfiring = false;\n\
\t\t\tif ( list ) {\n\
\t\t\t\tif ( stack ) {\n\
\t\t\t\t\tif ( stack.length ) {\n\
\t\t\t\t\t\tfire( stack.shift() );\n\
\t\t\t\t\t}\n\
\t\t\t\t} else if ( memory ) {\n\
\t\t\t\t\tlist = [];\n\
\t\t\t\t} else {\n\
\t\t\t\t\tself.disable();\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t},\n\
\t\t// Actual Callbacks object\n\
\t\tself = {\n\
\t\t\t// Add a callback or a collection of callbacks to the list\n\
\t\t\tadd: function() {\n\
\t\t\t\tif ( list ) {\n\
\t\t\t\t\t// First, we save the current length\n\
\t\t\t\t\tvar start = list.length;\n\
\t\t\t\t\t(function add( args ) {\n\
\t\t\t\t\t\tjQuery.each( args, function( _, arg ) {\n\
\t\t\t\t\t\t\tvar type = jQuery.type( arg );\n\
\t\t\t\t\t\t\tif ( type === \"function\" ) {\n\
\t\t\t\t\t\t\t\tif ( !options.unique || !self.has( arg ) ) {\n\
\t\t\t\t\t\t\t\t\tlist.push( arg );\n\
\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t} else if ( arg && arg.length && type !== \"string\" ) {\n\
\t\t\t\t\t\t\t\t// Inspect recursively\n\
\t\t\t\t\t\t\t\tadd( arg );\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t});\n\
\t\t\t\t\t})( arguments );\n\
\t\t\t\t\t// Do we need to add the callbacks to the\n\
\t\t\t\t\t// current firing batch?\n\
\t\t\t\t\tif ( firing ) {\n\
\t\t\t\t\t\tfiringLength = list.length;\n\
\t\t\t\t\t// With memory, if we're not firing then\n\
\t\t\t\t\t// we should call right away\n\
\t\t\t\t\t} else if ( memory ) {\n\
\t\t\t\t\t\tfiringStart = start;\n\
\t\t\t\t\t\tfire( memory );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t\treturn this;\n\
\t\t\t},\n\
\t\t\t// Remove a callback from the list\n\
\t\t\tremove: function() {\n\
\t\t\t\tif ( list ) {\n\
\t\t\t\t\tjQuery.each( arguments, function( _, arg ) {\n\
\t\t\t\t\t\tvar index;\n\
\t\t\t\t\t\twhile( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {\n\
\t\t\t\t\t\t\tlist.splice( index, 1 );\n\
\t\t\t\t\t\t\t// Handle firing indexes\n\
\t\t\t\t\t\t\tif ( firing ) {\n\
\t\t\t\t\t\t\t\tif ( index <= firingLength ) {\n\
\t\t\t\t\t\t\t\t\tfiringLength--;\n\
\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t\tif ( index <= firingIndex ) {\n\
\t\t\t\t\t\t\t\t\tfiringIndex--;\n\
\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t});\n\
\t\t\t\t}\n\
\t\t\t\treturn this;\n\
\t\t\t},\n\
\t\t\t// Check if a given callback is in the list.\n\
\t\t\t// If no argument is given, return whether or not list has callbacks attached.\n\
\t\t\thas: function( fn ) {\n\
\t\t\t\treturn fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );\n\
\t\t\t},\n\
\t\t\t// Remove all callbacks from the list\n\
\t\t\tempty: function() {\n\
\t\t\t\tlist = [];\n\
\t\t\t\treturn this;\n\
\t\t\t},\n\
\t\t\t// Have the list do nothing anymore\n\
\t\t\tdisable: function() {\n\
\t\t\t\tlist = stack = memory = undefined;\n\
\t\t\t\treturn this;\n\
\t\t\t},\n\
\t\t\t// Is it disabled?\n\
\t\t\tdisabled: function() {\n\
\t\t\t\treturn !list;\n\
\t\t\t},\n\
\t\t\t// Lock the list in its current state\n\
\t\t\tlock: function() {\n\
\t\t\t\tstack = undefined;\n\
\t\t\t\tif ( !memory ) {\n\
\t\t\t\t\tself.disable();\n\
\t\t\t\t}\n\
\t\t\t\treturn this;\n\
\t\t\t},\n\
\t\t\t// Is it locked?\n\
\t\t\tlocked: function() {\n\
\t\t\t\treturn !stack;\n\
\t\t\t},\n\
\t\t\t// Call all callbacks with the given context and arguments\n\
\t\t\tfireWith: function( context, args ) {\n\
\t\t\t\targs = args || [];\n\
\t\t\t\targs = [ context, args.slice ? args.slice() : args ];\n\
\t\t\t\tif ( list && ( !fired || stack ) ) {\n\
\t\t\t\t\tif ( firing ) {\n\
\t\t\t\t\t\tstack.push( args );\n\
\t\t\t\t\t} else {\n\
\t\t\t\t\t\tfire( args );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t\treturn this;\n\
\t\t\t},\n\
\t\t\t// Call all the callbacks with the given arguments\n\
\t\t\tfire: function() {\n\
\t\t\t\tself.fireWith( this, arguments );\n\
\t\t\t\treturn this;\n\
\t\t\t},\n\
\t\t\t// To know if the callbacks have already been called at least once\n\
\t\t\tfired: function() {\n\
\t\t\t\treturn !!fired;\n\
\t\t\t}\n\
\t\t};\n\
\n\
\treturn self;\n\
};\n\
jQuery.extend({\n\
\n\
\tDeferred: function( func ) {\n\
\t\tvar tuples = [\n\
\t\t\t\t// action, add listener, listener list, final state\n\
\t\t\t\t[ \"resolve\", \"done\", jQuery.Callbacks(\"once memory\"), \"resolved\" ],\n\
\t\t\t\t[ \"reject\", \"fail\", jQuery.Callbacks(\"once memory\"), \"rejected\" ],\n\
\t\t\t\t[ \"notify\", \"progress\", jQuery.Callbacks(\"memory\") ]\n\
\t\t\t],\n\
\t\t\tstate = \"pending\",\n\
\t\t\tpromise = {\n\
\t\t\t\tstate: function() {\n\
\t\t\t\t\treturn state;\n\
\t\t\t\t},\n\
\t\t\t\talways: function() {\n\
\t\t\t\t\tdeferred.done( arguments ).fail( arguments );\n\
\t\t\t\t\treturn this;\n\
\t\t\t\t},\n\
\t\t\t\tthen: function( /* fnDone, fnFail, fnProgress */ ) {\n\
\t\t\t\t\tvar fns = arguments;\n\
\t\t\t\t\treturn jQuery.Deferred(function( newDefer ) {\n\
\t\t\t\t\t\tjQuery.each( tuples, function( i, tuple ) {\n\
\t\t\t\t\t\t\tvar action = tuple[ 0 ],\n\
\t\t\t\t\t\t\t\tfn = jQuery.isFunction( fns[ i ] ) && fns[ i ];\n\
\t\t\t\t\t\t\t// deferred[ done | fail | progress ] for forwarding actions to newDefer\n\
\t\t\t\t\t\t\tdeferred[ tuple[1] ](function() {\n\
\t\t\t\t\t\t\t\tvar returned = fn && fn.apply( this, arguments );\n\
\t\t\t\t\t\t\t\tif ( returned && jQuery.isFunction( returned.promise ) ) {\n\
\t\t\t\t\t\t\t\t\treturned.promise()\n\
\t\t\t\t\t\t\t\t\t\t.done( newDefer.resolve )\n\
\t\t\t\t\t\t\t\t\t\t.fail( newDefer.reject )\n\
\t\t\t\t\t\t\t\t\t\t.progress( newDefer.notify );\n\
\t\t\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\t\t\tnewDefer[ action + \"With\" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );\n\
\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t});\n\
\t\t\t\t\t\t});\n\
\t\t\t\t\t\tfns = null;\n\
\t\t\t\t\t}).promise();\n\
\t\t\t\t},\n\
\t\t\t\t// Get a promise for this deferred\n\
\t\t\t\t// If obj is provided, the promise aspect is added to the object\n\
\t\t\t\tpromise: function( obj ) {\n\
\t\t\t\t\treturn obj != null ? jQuery.extend( obj, promise ) : promise;\n\
\t\t\t\t}\n\
\t\t\t},\n\
\t\t\tdeferred = {};\n\
\n\
\t\t// Keep pipe for back-compat\n\
\t\tpromise.pipe = promise.then;\n\
\n\
\t\t// Add list-specific methods\n\
\t\tjQuery.each( tuples, function( i, tuple ) {\n\
\t\t\tvar list = tuple[ 2 ],\n\
\t\t\t\tstateString = tuple[ 3 ];\n\
\n\
\t\t\t// promise[ done | fail | progress ] = list.add\n\
\t\t\tpromise[ tuple[1] ] = list.add;\n\
\n\
\t\t\t// Handle state\n\
\t\t\tif ( stateString ) {\n\
\t\t\t\tlist.add(function() {\n\
\t\t\t\t\t// state = [ resolved | rejected ]\n\
\t\t\t\t\tstate = stateString;\n\
\n\
\t\t\t\t// [ reject_list | resolve_list ].disable; progress_list.lock\n\
\t\t\t\t}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );\n\
\t\t\t}\n\
\n\
\t\t\t// deferred[ resolve | reject | notify ]\n\
\t\t\tdeferred[ tuple[0] ] = function() {\n\
\t\t\t\tdeferred[ tuple[0] + \"With\" ]( this === deferred ? promise : this, arguments );\n\
\t\t\t\treturn this;\n\
\t\t\t};\n\
\t\t\tdeferred[ tuple[0] + \"With\" ] = list.fireWith;\n\
\t\t});\n\
\n\
\t\t// Make the deferred a promise\n\
\t\tpromise.promise( deferred );\n\
\n\
\t\t// Call given func if any\n\
\t\tif ( func ) {\n\
\t\t\tfunc.call( deferred, deferred );\n\
\t\t}\n\
\n\
\t\t// All done!\n\
\t\treturn deferred;\n\
\t},\n\
\n\
\t// Deferred helper\n\
\twhen: function( subordinate /* , ..., subordinateN */ ) {\n\
\t\tvar i = 0,\n\
\t\t\tresolveValues = core_slice.call( arguments ),\n\
\t\t\tlength = resolveValues.length,\n\
\n\
\t\t\t// the count of uncompleted subordinates\n\
\t\t\tremaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,\n\
\n\
\t\t\t// the master Deferred. If resolveValues consist of only a single Deferred, just use that.\n\
\t\t\tdeferred = remaining === 1 ? subordinate : jQuery.Deferred(),\n\
\n\
\t\t\t// Update function for both resolve and progress values\n\
\t\t\tupdateFunc = function( i, contexts, values ) {\n\
\t\t\t\treturn function( value ) {\n\
\t\t\t\t\tcontexts[ i ] = this;\n\
\t\t\t\t\tvalues[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;\n\
\t\t\t\t\tif( values === progressValues ) {\n\
\t\t\t\t\t\tdeferred.notifyWith( contexts, values );\n\
\t\t\t\t\t} else if ( !( --remaining ) ) {\n\
\t\t\t\t\t\tdeferred.resolveWith( contexts, values );\n\
\t\t\t\t\t}\n\
\t\t\t\t};\n\
\t\t\t},\n\
\n\
\t\t\tprogressValues, progressContexts, resolveContexts;\n\
\n\
\t\t// add listeners to Deferred subordinates; treat others as resolved\n\
\t\tif ( length > 1 ) {\n\
\t\t\tprogressValues = new Array( length );\n\
\t\t\tprogressContexts = new Array( length );\n\
\t\t\tresolveContexts = new Array( length );\n\
\t\t\tfor ( ; i < length; i++ ) {\n\
\t\t\t\tif ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {\n\
\t\t\t\t\tresolveValues[ i ].promise()\n\
\t\t\t\t\t\t.done( updateFunc( i, resolveContexts, resolveValues ) )\n\
\t\t\t\t\t\t.fail( deferred.reject )\n\
\t\t\t\t\t\t.progress( updateFunc( i, progressContexts, progressValues ) );\n\
\t\t\t\t} else {\n\
\t\t\t\t\t--remaining;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// if we're not waiting on anything, resolve the master\n\
\t\tif ( !remaining ) {\n\
\t\t\tdeferred.resolveWith( resolveContexts, resolveValues );\n\
\t\t}\n\
\n\
\t\treturn deferred.promise();\n\
\t}\n\
});\n\
jQuery.support = (function() {\n\
\n\
\tvar support, all, a,\n\
\t\tinput, select, fragment,\n\
\t\topt, eventName, isSupported, i,\n\
\t\tdiv = document.createElement(\"div\");\n\
\n\
\t// Setup\n\
\tdiv.setAttribute( \"className\", \"t\" );\n\
\tdiv.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\
\n\
\t// Support tests won't run in some limited or non-browser environments\n\
\tall = div.getElementsByTagName(\"*\");\n\
\ta = div.getElementsByTagName(\"a\")[ 0 ];\n\
\tif ( !all || !a || !all.length ) {\n\
\t\treturn {};\n\
\t}\n\
\n\
\t// First batch of tests\n\
\tselect = document.createElement(\"select\");\n\
\topt = select.appendChild( document.createElement(\"option\") );\n\
\tinput = div.getElementsByTagName(\"input\")[ 0 ];\n\
\n\
\ta.style.cssText = \"top:1px;float:left;opacity:.5\";\n\
\tsupport = {\n\
\t\t// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)\n\
\t\tgetSetAttribute: div.className !== \"t\",\n\
\n\
\t\t// IE strips leading whitespace when .innerHTML is used\n\
\t\tleadingWhitespace: div.firstChild.nodeType === 3,\n\
\n\
\t\t// Make sure that tbody elements aren't automatically inserted\n\
\t\t// IE will insert them into empty tables\n\
\t\ttbody: !div.getElementsByTagName(\"tbody\").length,\n\
\n\
\t\t// Make sure that link elements get serialized correctly by innerHTML\n\
\t\t// This requires a wrapper element in IE\n\
\t\thtmlSerialize: !!div.getElementsByTagName(\"link\").length,\n\
\n\
\t\t// Get the style information from getAttribute\n\
\t\t// (IE uses .cssText instead)\n\
\t\tstyle: /top/.test( a.getAttribute(\"style\") ),\n\
\n\
\t\t// Make sure that URLs aren't manipulated\n\
\t\t// (IE normalizes it by default)\n\
\t\threfNormalized: a.getAttribute(\"href\") === \"/a\",\n\
\n\
\t\t// Make sure that element opacity exists\n\
\t\t// (IE uses filter instead)\n\
\t\t// Use a regex to work around a WebKit issue. See #5145\n\
\t\topacity: /^0.5/.test( a.style.opacity ),\n\
\n\
\t\t// Verify style float existence\n\
\t\t// (IE uses styleFloat instead of cssFloat)\n\
\t\tcssFloat: !!a.style.cssFloat,\n\
\n\
\t\t// Check the default checkbox/radio value (\"\" on WebKit; \"on\" elsewhere)\n\
\t\tcheckOn: !!input.value,\n\
\n\
\t\t// Make sure that a selected-by-default option has a working selected property.\n\
\t\t// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)\n\
\t\toptSelected: opt.selected,\n\
\n\
\t\t// Tests for enctype support on a form (#6743)\n\
\t\tenctype: !!document.createElement(\"form\").enctype,\n\
\n\
\t\t// Makes sure cloning an html5 element does not cause problems\n\
\t\t// Where outerHTML is undefined, this still works\n\
\t\thtml5Clone: document.createElement(\"nav\").cloneNode( true ).outerHTML !== \"<:nav></:nav>\",\n\
\n\
\t\t// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode\n\
\t\tboxModel: document.compatMode === \"CSS1Compat\",\n\
\n\
\t\t// Will be defined later\n\
\t\tdeleteExpando: true,\n\
\t\tnoCloneEvent: true,\n\
\t\tinlineBlockNeedsLayout: false,\n\
\t\tshrinkWrapBlocks: false,\n\
\t\treliableMarginRight: true,\n\
\t\tboxSizingReliable: true,\n\
\t\tpixelPosition: false\n\
\t};\n\
\n\
\t// Make sure checked status is properly cloned\n\
\tinput.checked = true;\n\
\tsupport.noCloneChecked = input.cloneNode( true ).checked;\n\
\n\
\t// Make sure that the options inside disabled selects aren't marked as disabled\n\
\t// (WebKit marks them as disabled)\n\
\tselect.disabled = true;\n\
\tsupport.optDisabled = !opt.disabled;\n\
\n\
\t// Support: IE<9\n\
\ttry {\n\
\t\tdelete div.test;\n\
\t} catch( e ) {\n\
\t\tsupport.deleteExpando = false;\n\
\t}\n\
\n\
\t// Check if we can trust getAttribute(\"value\")\n\
\tinput = document.createElement(\"input\");\n\
\tinput.setAttribute( \"value\", \"\" );\n\
\tsupport.input = input.getAttribute( \"value\" ) === \"\";\n\
\n\
\t// Check if an input maintains its value after becoming a radio\n\
\tinput.value = \"t\";\n\
\tinput.setAttribute( \"type\", \"radio\" );\n\
\tsupport.radioValue = input.value === \"t\";\n\
\n\
\t// #11217 - WebKit loses check when the name is after the checked attribute\n\
\tinput.setAttribute( \"checked\", \"t\" );\n\
\tinput.setAttribute( \"name\", \"t\" );\n\
\n\
\tfragment = document.createDocumentFragment();\n\
\tfragment.appendChild( input );\n\
\n\
\t// Check if a disconnected checkbox will retain its checked\n\
\t// value of true after appended to the DOM (IE6/7)\n\
\tsupport.appendChecked = input.checked;\n\
\n\
\t// WebKit doesn't clone checked state correctly in fragments\n\
\tsupport.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;\n\
\n\
\t// Support: IE<9\n\
\t// Opera does not clone events (and typeof div.attachEvent === undefined).\n\
\t// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()\n\
\tif ( div.attachEvent ) {\n\
\t\tdiv.attachEvent( \"onclick\", function() {\n\
\t\t\tsupport.noCloneEvent = false;\n\
\t\t});\n\
\n\
\t\tdiv.cloneNode( true ).click();\n\
\t}\n\
\n\
\t// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)\n\
\t// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php\n\
\tfor ( i in { submit: true, change: true, focusin: true }) {\n\
\t\tdiv.setAttribute( eventName = \"on\" + i, \"t\" );\n\
\n\
\t\tsupport[ i + \"Bubbles\" ] = eventName in window || div.attributes[ eventName ].expando === false;\n\
\t}\n\
\n\
\tdiv.style.backgroundClip = \"content-box\";\n\
\tdiv.cloneNode( true ).style.backgroundClip = \"\";\n\
\tsupport.clearCloneStyle = div.style.backgroundClip === \"content-box\";\n\
\n\
\t// Run tests that need a body at doc ready\n\
\tjQuery(function() {\n\
\t\tvar container, marginDiv, tds,\n\
\t\t\tdivReset = \"padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;\",\n\
\t\t\tbody = document.getElementsByTagName(\"body\")[0];\n\
\n\
\t\tif ( !body ) {\n\
\t\t\t// Return for frameset docs that don't have a body\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tcontainer = document.createElement(\"div\");\n\
\t\tcontainer.style.cssText = \"border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px\";\n\
\n\
\t\tbody.appendChild( container ).appendChild( div );\n\
\n\
\t\t// Support: IE8\n\
\t\t// Check if table cells still have offsetWidth/Height when they are set\n\
\t\t// to display:none and there are still other visible table cells in a\n\
\t\t// table row; if so, offsetWidth/Height are not reliable for use when\n\
\t\t// determining if an element has been hidden directly using\n\
\t\t// display:none (it is still safe to use offsets if a parent element is\n\
\t\t// hidden; don safety goggles and see bug #4512 for more information).\n\
\t\tdiv.innerHTML = \"<table><tr><td></td><td>t</td></tr></table>\";\n\
\t\ttds = div.getElementsByTagName(\"td\");\n\
\t\ttds[ 0 ].style.cssText = \"padding:0;margin:0;border:0;display:none\";\n\
\t\tisSupported = ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\ttds[ 0 ].style.display = \"\";\n\
\t\ttds[ 1 ].style.display = \"none\";\n\
\n\
\t\t// Support: IE8\n\
\t\t// Check if empty table cells still have offsetWidth/Height\n\
\t\tsupport.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\t// Check box-sizing and margin behavior\n\
\t\tdiv.innerHTML = \"\";\n\
\t\tdiv.style.cssText = \"box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;\";\n\
\t\tsupport.boxSizing = ( div.offsetWidth === 4 );\n\
\t\tsupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );\n\
\n\
\t\t// Use window.getComputedStyle because jsdom on node.js will break without it.\n\
\t\tif ( window.getComputedStyle ) {\n\
\t\t\tsupport.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== \"1%\";\n\
\t\t\tsupport.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: \"4px\" } ).width === \"4px\";\n\
\n\
\t\t\t// Check if div with explicit width and no margin-right incorrectly\n\
\t\t\t// gets computed margin-right based on width of container. (#3333)\n\
\t\t\t// Fails in WebKit before Feb 2011 nightlies\n\
\t\t\t// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
\t\t\tmarginDiv = div.appendChild( document.createElement(\"div\") );\n\
\t\t\tmarginDiv.style.cssText = div.style.cssText = divReset;\n\
\t\t\tmarginDiv.style.marginRight = marginDiv.style.width = \"0\";\n\
\t\t\tdiv.style.width = \"1px\";\n\
\n\
\t\t\tsupport.reliableMarginRight =\n\
\t\t\t\t!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );\n\
\t\t}\n\
\n\
\t\tif ( typeof div.style.zoom !== core_strundefined ) {\n\
\t\t\t// Support: IE<8\n\
\t\t\t// Check if natively block-level elements act like inline-block\n\
\t\t\t// elements when setting their display to 'inline' and giving\n\
\t\t\t// them layout\n\
\t\t\tdiv.innerHTML = \"\";\n\
\t\t\tdiv.style.cssText = divReset + \"width:1px;padding:1px;display:inline;zoom:1\";\n\
\t\t\tsupport.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );\n\
\n\
\t\t\t// Support: IE6\n\
\t\t\t// Check if elements with layout shrink-wrap their children\n\
\t\t\tdiv.style.display = \"block\";\n\
\t\t\tdiv.innerHTML = \"<div></div>\";\n\
\t\t\tdiv.firstChild.style.width = \"5px\";\n\
\t\t\tsupport.shrinkWrapBlocks = ( div.offsetWidth !== 3 );\n\
\n\
\t\t\tif ( support.inlineBlockNeedsLayout ) {\n\
\t\t\t\t// Prevent IE 6 from affecting layout for positioned elements #11048\n\
\t\t\t\t// Prevent IE from shrinking the body in IE 7 mode #12869\n\
\t\t\t\t// Support: IE<8\n\
\t\t\t\tbody.style.zoom = 1;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\tbody.removeChild( container );\n\
\n\
\t\t// Null elements to avoid leaks in IE\n\
\t\tcontainer = div = tds = marginDiv = null;\n\
\t});\n\
\n\
\t// Null elements to avoid leaks in IE\n\
\tall = select = fragment = opt = a = input = null;\n\
\n\
\treturn support;\n\
})();\n\
\n\
var rbrace = /(?:\\{[\\s\\S]*\\}|\\[[\\s\\S]*\\])$/,\n\
\trmultiDash = /([A-Z])/g;\n\
\n\
function internalData( elem, name, data, pvt /* Internal Use Only */ ){\n\
\tif ( !jQuery.acceptData( elem ) ) {\n\
\t\treturn;\n\
\t}\n\
\n\
\tvar thisCache, ret,\n\
\t\tinternalKey = jQuery.expando,\n\
\t\tgetByName = typeof name === \"string\",\n\
\n\
\t\t// We have to handle DOM nodes and JS objects differently because IE6-7\n\
\t\t// can't GC object references properly across the DOM-JS boundary\n\
\t\tisNode = elem.nodeType,\n\
\n\
\t\t// Only DOM nodes need the global jQuery cache; JS object data is\n\
\t\t// attached directly to the object so GC can occur automatically\n\
\t\tcache = isNode ? jQuery.cache : elem,\n\
\n\
\t\t// Only defining an ID for JS objects if its cache already exists allows\n\
\t\t// the code to shortcut on the same path as a DOM node with no cache\n\
\t\tid = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;\n\
\n\
\t// Avoid doing any more work than we need to when trying to get data on an\n\
\t// object that has no data at all\n\
\tif ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {\n\
\t\treturn;\n\
\t}\n\
\n\
\tif ( !id ) {\n\
\t\t// Only DOM nodes need a new unique ID for each element since their data\n\
\t\t// ends up in the global cache\n\
\t\tif ( isNode ) {\n\
\t\t\telem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;\n\
\t\t} else {\n\
\t\t\tid = internalKey;\n\
\t\t}\n\
\t}\n\
\n\
\tif ( !cache[ id ] ) {\n\
\t\tcache[ id ] = {};\n\
\n\
\t\t// Avoids exposing jQuery metadata on plain JS objects when the object\n\
\t\t// is serialized using JSON.stringify\n\
\t\tif ( !isNode ) {\n\
\t\t\tcache[ id ].toJSON = jQuery.noop;\n\
\t\t}\n\
\t}\n\
\n\
\t// An object can be passed to jQuery.data instead of a key/value pair; this gets\n\
\t// shallow copied over onto the existing cache\n\
\tif ( typeof name === \"object\" || typeof name === \"function\" ) {\n\
\t\tif ( pvt ) {\n\
\t\t\tcache[ id ] = jQuery.extend( cache[ id ], name );\n\
\t\t} else {\n\
\t\t\tcache[ id ].data = jQuery.extend( cache[ id ].data, name );\n\
\t\t}\n\
\t}\n\
\n\
\tthisCache = cache[ id ];\n\
\n\
\t// jQuery data() is stored in a separate object inside the object's internal data\n\
\t// cache in order to avoid key collisions between internal data and user-defined\n\
\t// data.\n\
\tif ( !pvt ) {\n\
\t\tif ( !thisCache.data ) {\n\
\t\t\tthisCache.data = {};\n\
\t\t}\n\
\n\
\t\tthisCache = thisCache.data;\n\
\t}\n\
\n\
\tif ( data !== undefined ) {\n\
\t\tthisCache[ jQuery.camelCase( name ) ] = data;\n\
\t}\n\
\n\
\t// Check for both converted-to-camel and non-converted data property names\n\
\t// If a data property was specified\n\
\tif ( getByName ) {\n\
\n\
\t\t// First Try to find as-is property data\n\
\t\tret = thisCache[ name ];\n\
\n\
\t\t// Test for null|undefined property data\n\
\t\tif ( ret == null ) {\n\
\n\
\t\t\t// Try to find the camelCased property\n\
\t\t\tret = thisCache[ jQuery.camelCase( name ) ];\n\
\t\t}\n\
\t} else {\n\
\t\tret = thisCache;\n\
\t}\n\
\n\
\treturn ret;\n\
}\n\
\n\
function internalRemoveData( elem, name, pvt ) {\n\
\tif ( !jQuery.acceptData( elem ) ) {\n\
\t\treturn;\n\
\t}\n\
\n\
\tvar i, l, thisCache,\n\
\t\tisNode = elem.nodeType,\n\
\n\
\t\t// See jQuery.data for more information\n\
\t\tcache = isNode ? jQuery.cache : elem,\n\
\t\tid = isNode ? elem[ jQuery.expando ] : jQuery.expando;\n\
\n\
\t// If there is already no cache entry for this object, there is no\n\
\t// purpose in continuing\n\
\tif ( !cache[ id ] ) {\n\
\t\treturn;\n\
\t}\n\
\n\
\tif ( name ) {\n\
\n\
\t\tthisCache = pvt ? cache[ id ] : cache[ id ].data;\n\
\n\
\t\tif ( thisCache ) {\n\
\n\
\t\t\t// Support array or space separated string names for data keys\n\
\t\t\tif ( !jQuery.isArray( name ) ) {\n\
\n\
\t\t\t\t// try the string as a key before any manipulation\n\
\t\t\t\tif ( name in thisCache ) {\n\
\t\t\t\t\tname = [ name ];\n\
\t\t\t\t} else {\n\
\n\
\t\t\t\t\t// split the camel cased version by spaces unless a key with the spaces exists\n\
\t\t\t\t\tname = jQuery.camelCase( name );\n\
\t\t\t\t\tif ( name in thisCache ) {\n\
\t\t\t\t\t\tname = [ name ];\n\
\t\t\t\t\t} else {\n\
\t\t\t\t\t\tname = name.split(\" \");\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t} else {\n\
\t\t\t\t// If \"name\" is an array of keys...\n\
\t\t\t\t// When data is initially created, via (\"key\", \"val\") signature,\n\
\t\t\t\t// keys will be converted to camelCase.\n\
\t\t\t\t// Since there is no way to tell _how_ a key was added, remove\n\
\t\t\t\t// both plain key and camelCase key. #12786\n\
\t\t\t\t// This will only penalize the array argument path.\n\
\t\t\t\tname = name.concat( jQuery.map( name, jQuery.camelCase ) );\n\
\t\t\t}\n\
\n\
\t\t\tfor ( i = 0, l = name.length; i < l; i++ ) {\n\
\t\t\t\tdelete thisCache[ name[i] ];\n\
\t\t\t}\n\
\n\
\t\t\t// If there is no data left in the cache, we want to continue\n\
\t\t\t// and let the cache object itself get destroyed\n\
\t\t\tif ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {\n\
\t\t\t\treturn;\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\t// See jQuery.data for more information\n\
\tif ( !pvt ) {\n\
\t\tdelete cache[ id ].data;\n\
\n\
\t\t// Don't destroy the parent cache unless the internal data object\n\
\t\t// had been the only thing left in it\n\
\t\tif ( !isEmptyDataObject( cache[ id ] ) ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\t}\n\
\n\
\t// Destroy the cache\n\
\tif ( isNode ) {\n\
\t\tjQuery.cleanData( [ elem ], true );\n\
\n\
\t// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)\n\
\t} else if ( jQuery.support.deleteExpando || cache != cache.window ) {\n\
\t\tdelete cache[ id ];\n\
\n\
\t// When all else fails, null\n\
\t} else {\n\
\t\tcache[ id ] = null;\n\
\t}\n\
}\n\
\n\
jQuery.extend({\n\
\tcache: {},\n\
\n\
\t// Unique for each copy of jQuery on the page\n\
\t// Non-digits removed to match rinlinejQuery\n\
\texpando: \"jQuery\" + ( core_version + Math.random() ).replace( /\\D/g, \"\" ),\n\
\n\
\t// The following elements throw uncatchable exceptions if you\n\
\t// attempt to add expando properties to them.\n\
\tnoData: {\n\
\t\t\"embed\": true,\n\
\t\t// Ban all objects except for Flash (which handle expandos)\n\
\t\t\"object\": \"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\",\n\
\t\t\"applet\": true\n\
\t},\n\
\n\
\thasData: function( elem ) {\n\
\t\telem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];\n\
\t\treturn !!elem && !isEmptyDataObject( elem );\n\
\t},\n\
\n\
\tdata: function( elem, name, data ) {\n\
\t\treturn internalData( elem, name, data );\n\
\t},\n\
\n\
\tremoveData: function( elem, name ) {\n\
\t\treturn internalRemoveData( elem, name );\n\
\t},\n\
\n\
\t// For internal use only.\n\
\t_data: function( elem, name, data ) {\n\
\t\treturn internalData( elem, name, data, true );\n\
\t},\n\
\n\
\t_removeData: function( elem, name ) {\n\
\t\treturn internalRemoveData( elem, name, true );\n\
\t},\n\
\n\
\t// A method for determining if a DOM node can handle the data expando\n\
\tacceptData: function( elem ) {\n\
\t\t// Do not set data on non-element because it will not be cleared (#8335).\n\
\t\tif ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {\n\
\t\t\treturn false;\n\
\t\t}\n\
\n\
\t\tvar noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];\n\
\n\
\t\t// nodes accept data unless otherwise specified; rejection can be conditional\n\
\t\treturn !noData || noData !== true && elem.getAttribute(\"classid\") === noData;\n\
\t}\n\
});\n\
\n\
jQuery.fn.extend({\n\
\tdata: function( key, value ) {\n\
\t\tvar attrs, name,\n\
\t\t\telem = this[0],\n\
\t\t\ti = 0,\n\
\t\t\tdata = null;\n\
\n\
\t\t// Gets all values\n\
\t\tif ( key === undefined ) {\n\
\t\t\tif ( this.length ) {\n\
\t\t\t\tdata = jQuery.data( elem );\n\
\n\
\t\t\t\tif ( elem.nodeType === 1 && !jQuery._data( elem, \"parsedAttrs\" ) ) {\n\
\t\t\t\t\tattrs = elem.attributes;\n\
\t\t\t\t\tfor ( ; i < attrs.length; i++ ) {\n\
\t\t\t\t\t\tname = attrs[i].name;\n\
\n\
\t\t\t\t\t\tif ( !name.indexOf( \"data-\" ) ) {\n\
\t\t\t\t\t\t\tname = jQuery.camelCase( name.slice(5) );\n\
\n\
\t\t\t\t\t\t\tdataAttr( elem, name, data[ name ] );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t\tjQuery._data( elem, \"parsedAttrs\", true );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\treturn data;\n\
\t\t}\n\
\n\
\t\t// Sets multiple values\n\
\t\tif ( typeof key === \"object\" ) {\n\
\t\t\treturn this.each(function() {\n\
\t\t\t\tjQuery.data( this, key );\n\
\t\t\t});\n\
\t\t}\n\
\n\
\t\treturn jQuery.access( this, function( value ) {\n\
\n\
\t\t\tif ( value === undefined ) {\n\
\t\t\t\t// Try to fetch any internally stored data first\n\
\t\t\t\treturn elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;\n\
\t\t\t}\n\
\n\
\t\t\tthis.each(function() {\n\
\t\t\t\tjQuery.data( this, key, value );\n\
\t\t\t});\n\
\t\t}, null, value, arguments.length > 1, null, true );\n\
\t},\n\
\n\
\tremoveData: function( key ) {\n\
\t\treturn this.each(function() {\n\
\t\t\tjQuery.removeData( this, key );\n\
\t\t});\n\
\t}\n\
});\n\
\n\
function dataAttr( elem, key, data ) {\n\
\t// If nothing was found internally, try to fetch any\n\
\t// data from the HTML5 data-* attribute\n\
\tif ( data === undefined && elem.nodeType === 1 ) {\n\
\n\
\t\tvar name = \"data-\" + key.replace( rmultiDash, \"-$1\" ).toLowerCase();\n\
\n\
\t\tdata = elem.getAttribute( name );\n\
\n\
\t\tif ( typeof data === \"string\" ) {\n\
\t\t\ttry {\n\
\t\t\t\tdata = data === \"true\" ? true :\n\
\t\t\t\t\tdata === \"false\" ? false :\n\
\t\t\t\t\tdata === \"null\" ? null :\n\
\t\t\t\t\t// Only convert to a number if it doesn't change the string\n\
\t\t\t\t\t+data + \"\" === data ? +data :\n\
\t\t\t\t\trbrace.test( data ) ? jQuery.parseJSON( data ) :\n\
\t\t\t\t\t\tdata;\n\
\t\t\t} catch( e ) {}\n\
\n\
\t\t\t// Make sure we set the data so it isn't changed later\n\
\t\t\tjQuery.data( elem, key, data );\n\
\n\
\t\t} else {\n\
\t\t\tdata = undefined;\n\
\t\t}\n\
\t}\n\
\n\
\treturn data;\n\
}\n\
\n\
// checks a cache object for emptiness\n\
function isEmptyDataObject( obj ) {\n\
\tvar name;\n\
\tfor ( name in obj ) {\n\
\n\
\t\t// if the public data object is empty, the private is still empty\n\
\t\tif ( name === \"data\" && jQuery.isEmptyObject( obj[name] ) ) {\n\
\t\t\tcontinue;\n\
\t\t}\n\
\t\tif ( name !== \"toJSON\" ) {\n\
\t\t\treturn false;\n\
\t\t}\n\
\t}\n\
\n\
\treturn true;\n\
}\n\
jQuery.extend({\n\
\tqueue: function( elem, type, data ) {\n\
\t\tvar queue;\n\
\n\
\t\tif ( elem ) {\n\
\t\t\ttype = ( type || \"fx\" ) + \"queue\";\n\
\t\t\tqueue = jQuery._data( elem, type );\n\
\n\
\t\t\t// Speed up dequeue by getting out quickly if this is just a lookup\n\
\t\t\tif ( data ) {\n\
\t\t\t\tif ( !queue || jQuery.isArray(data) ) {\n\
\t\t\t\t\tqueue = jQuery._data( elem, type, jQuery.makeArray(data) );\n\
\t\t\t\t} else {\n\
\t\t\t\t\tqueue.push( data );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t\treturn queue || [];\n\
\t\t}\n\
\t},\n\
\n\
\tdequeue: function( elem, type ) {\n\
\t\ttype = type || \"fx\";\n\
\n\
\t\tvar queue = jQuery.queue( elem, type ),\n\
\t\t\tstartLength = queue.length,\n\
\t\t\tfn = queue.shift(),\n\
\t\t\thooks = jQuery._queueHooks( elem, type ),\n\
\t\t\tnext = function() {\n\
\t\t\t\tjQuery.dequeue( elem, type );\n\
\t\t\t};\n\
\n\
\t\t// If the fx queue is dequeued, always remove the progress sentinel\n\
\t\tif ( fn === \"inprogress\" ) {\n\
\t\t\tfn = queue.shift();\n\
\t\t\tstartLength--;\n\
\t\t}\n\
\n\
\t\thooks.cur = fn;\n\
\t\tif ( fn ) {\n\
\n\
\t\t\t// Add a progress sentinel to prevent the fx queue from being\n\
\t\t\t// automatically dequeued\n\
\t\t\tif ( type === \"fx\" ) {\n\
\t\t\t\tqueue.unshift( \"inprogress\" );\n\
\t\t\t}\n\
\n\
\t\t\t// clear up the last queue stop function\n\
\t\t\tdelete hooks.stop;\n\
\t\t\tfn.call( elem, next, hooks );\n\
\t\t}\n\
\n\
\t\tif ( !startLength && hooks ) {\n\
\t\t\thooks.empty.fire();\n\
\t\t}\n\
\t},\n\
\n\
\t// not intended for public consumption - generates a queueHooks object, or returns the current one\n\
\t_queueHooks: function( elem, type ) {\n\
\t\tvar key = type + \"queueHooks\";\n\
\t\treturn jQuery._data( elem, key ) || jQuery._data( elem, key, {\n\
\t\t\tempty: jQuery.Callbacks(\"once memory\").add(function() {\n\
\t\t\t\tjQuery._removeData( elem, type + \"queue\" );\n\
\t\t\t\tjQuery._removeData( elem, key );\n\
\t\t\t})\n\
\t\t});\n\
\t}\n\
});\n\
\n\
jQuery.fn.extend({\n\
\tqueue: function( type, data ) {\n\
\t\tvar setter = 2;\n\
\n\
\t\tif ( typeof type !== \"string\" ) {\n\
\t\t\tdata = type;\n\
\t\t\ttype = \"fx\";\n\
\t\t\tsetter--;\n\
\t\t}\n\
\n\
\t\tif ( arguments.length < setter ) {\n\
\t\t\treturn jQuery.queue( this[0], type );\n\
\t\t}\n\
\n\
\t\treturn data === undefined ?\n\
\t\t\tthis :\n\
\t\t\tthis.each(function() {\n\
\t\t\t\tvar queue = jQuery.queue( this, type, data );\n\
\n\
\t\t\t\t// ensure a hooks for this queue\n\
\t\t\t\tjQuery._queueHooks( this, type );\n\
\n\
\t\t\t\tif ( type === \"fx\" && queue[0] !== \"inprogress\" ) {\n\
\t\t\t\t\tjQuery.dequeue( this, type );\n\
\t\t\t\t}\n\
\t\t\t});\n\
\t},\n\
\tdequeue: function( type ) {\n\
\t\treturn this.each(function() {\n\
\t\t\tjQuery.dequeue( this, type );\n\
\t\t});\n\
\t},\n\
\t// Based off of the plugin by Clint Helfers, with permission.\n\
\t// http://blindsignals.com/index.php/2009/07/jquery-delay/\n\
\tdelay: function( time, type ) {\n\
\t\ttime = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;\n\
\t\ttype = type || \"fx\";\n\
\n\
\t\treturn this.queue( type, function( next, hooks ) {\n\
\t\t\tvar timeout = setTimeout( next, time );\n\
\t\t\thooks.stop = function() {\n\
\t\t\t\tclearTimeout( timeout );\n\
\t\t\t};\n\
\t\t});\n\
\t},\n\
\tclearQueue: function( type ) {\n\
\t\treturn this.queue( type || \"fx\", [] );\n\
\t},\n\
\t// Get a promise resolved when queues of a certain type\n\
\t// are emptied (fx is the type by default)\n\
\tpromise: function( type, obj ) {\n\
\t\tvar tmp,\n\
\t\t\tcount = 1,\n\
\t\t\tdefer = jQuery.Deferred(),\n\
\t\t\telements = this,\n\
\t\t\ti = this.length,\n\
\t\t\tresolve = function() {\n\
\t\t\t\tif ( !( --count ) ) {\n\
\t\t\t\t\tdefer.resolveWith( elements, [ elements ] );\n\
\t\t\t\t}\n\
\t\t\t};\n\
\n\
\t\tif ( typeof type !== \"string\" ) {\n\
\t\t\tobj = type;\n\
\t\t\ttype = undefined;\n\
\t\t}\n\
\t\ttype = type || \"fx\";\n\
\n\
\t\twhile( i-- ) {\n\
\t\t\ttmp = jQuery._data( elements[ i ], type + \"queueHooks\" );\n\
\t\t\tif ( tmp && tmp.empty ) {\n\
\t\t\t\tcount++;\n\
\t\t\t\ttmp.empty.add( resolve );\n\
\t\t\t}\n\
\t\t}\n\
\t\tresolve();\n\
\t\treturn defer.promise( obj );\n\
\t}\n\
});\n\
var nodeHook, boolHook,\n\
\trclass = /[\\t\\r\\n\
]/g,\n\
\trreturn = /\\r/g,\n\
\trfocusable = /^(?:input|select|textarea|button|object)$/i,\n\
\trclickable = /^(?:a|area)$/i,\n\
\trboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,\n\
\truseDefault = /^(?:checked|selected)$/i,\n\
\tgetSetAttribute = jQuery.support.getSetAttribute,\n\
\tgetSetInput = jQuery.support.input;\n\
\n\
jQuery.fn.extend({\n\
\tattr: function( name, value ) {\n\
\t\treturn jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );\n\
\t},\n\
\n\
\tremoveAttr: function( name ) {\n\
\t\treturn this.each(function() {\n\
\t\t\tjQuery.removeAttr( this, name );\n\
\t\t});\n\
\t},\n\
\n\
\tprop: function( name, value ) {\n\
\t\treturn jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );\n\
\t},\n\
\n\
\tremoveProp: function( name ) {\n\
\t\tname = jQuery.propFix[ name ] || name;\n\
\t\treturn this.each(function() {\n\
\t\t\t// try/catch handles cases where IE balks (such as removing a property on window)\n\
\t\t\ttry {\n\
\t\t\t\tthis[ name ] = undefined;\n\
\t\t\t\tdelete this[ name ];\n\
\t\t\t} catch( e ) {}\n\
\t\t});\n\
\t},\n\
\n\
\taddClass: function( value ) {\n\
\t\tvar classes, elem, cur, clazz, j,\n\
\t\t\ti = 0,\n\
\t\t\tlen = this.length,\n\
\t\t\tproceed = typeof value === \"string\" && value;\n\
\n\
\t\tif ( jQuery.isFunction( value ) ) {\n\
\t\t\treturn this.each(function( j ) {\n\
\t\t\t\tjQuery( this ).addClass( value.call( this, j, this.className ) );\n\
\t\t\t});\n\
\t\t}\n\
\n\
\t\tif ( proceed ) {\n\
\t\t\t// The disjunction here is for better compressibility (see removeClass)\n\
\t\t\tclasses = ( value || \"\" ).match( core_rnotwhite ) || [];\n\
\n\
\t\t\tfor ( ; i < len; i++ ) {\n\
\t\t\t\telem = this[ i ];\n\
\t\t\t\tcur = elem.nodeType === 1 && ( elem.className ?\n\
\t\t\t\t\t( \" \" + elem.className + \" \" ).replace( rclass, \" \" ) :\n\
\t\t\t\t\t\" \"\n\
\t\t\t\t);\n\
\n\
\t\t\t\tif ( cur ) {\n\
\t\t\t\t\tj = 0;\n\
\t\t\t\t\twhile ( (clazz = classes[j++]) ) {\n\
\t\t\t\t\t\tif ( cur.indexOf( \" \" + clazz + \" \" ) < 0 ) {\n\
\t\t\t\t\t\t\tcur += clazz + \" \";\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t\telem.className = jQuery.trim( cur );\n\
\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\tremoveClass: function( value ) {\n\
\t\tvar classes, elem, cur, clazz, j,\n\
\t\t\ti = 0,\n\
\t\t\tlen = this.length,\n\
\t\t\tproceed = arguments.length === 0 || typeof value === \"string\" && value;\n\
\n\
\t\tif ( jQuery.isFunction( value ) ) {\n\
\t\t\treturn this.each(function( j ) {\n\
\t\t\t\tjQuery( this ).removeClass( value.call( this, j, this.className ) );\n\
\t\t\t});\n\
\t\t}\n\
\t\tif ( proceed ) {\n\
\t\t\tclasses = ( value || \"\" ).match( core_rnotwhite ) || [];\n\
\n\
\t\t\tfor ( ; i < len; i++ ) {\n\
\t\t\t\telem = this[ i ];\n\
\t\t\t\t// This expression is here for better compressibility (see addClass)\n\
\t\t\t\tcur = elem.nodeType === 1 && ( elem.className ?\n\
\t\t\t\t\t( \" \" + elem.className + \" \" ).replace( rclass, \" \" ) :\n\
\t\t\t\t\t\"\"\n\
\t\t\t\t);\n\
\n\
\t\t\t\tif ( cur ) {\n\
\t\t\t\t\tj = 0;\n\
\t\t\t\t\twhile ( (clazz = classes[j++]) ) {\n\
\t\t\t\t\t\t// Remove *all* instances\n\
\t\t\t\t\t\twhile ( cur.indexOf( \" \" + clazz + \" \" ) >= 0 ) {\n\
\t\t\t\t\t\t\tcur = cur.replace( \" \" + clazz + \" \", \" \" );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t\telem.className = value ? jQuery.trim( cur ) : \"\";\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\ttoggleClass: function( value, stateVal ) {\n\
\t\tvar type = typeof value,\n\
\t\t\tisBool = typeof stateVal === \"boolean\";\n\
\n\
\t\tif ( jQuery.isFunction( value ) ) {\n\
\t\t\treturn this.each(function( i ) {\n\
\t\t\t\tjQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );\n\
\t\t\t});\n\
\t\t}\n\
\n\
\t\treturn this.each(function() {\n\
\t\t\tif ( type === \"string\" ) {\n\
\t\t\t\t// toggle individual class names\n\
\t\t\t\tvar className,\n\
\t\t\t\t\ti = 0,\n\
\t\t\t\t\tself = jQuery( this ),\n\
\t\t\t\t\tstate = stateVal,\n\
\t\t\t\t\tclassNames = value.match( core_rnotwhite ) || [];\n\
\n\
\t\t\t\twhile ( (className = classNames[ i++ ]) ) {\n\
\t\t\t\t\t// check each className given, space separated list\n\
\t\t\t\t\tstate = isBool ? state : !self.hasClass( className );\n\
\t\t\t\t\tself[ state ? \"addClass\" : \"removeClass\" ]( className );\n\
\t\t\t\t}\n\
\n\
\t\t\t// Toggle whole class name\n\
\t\t\t} else if ( type === core_strundefined || type === \"boolean\" ) {\n\
\t\t\t\tif ( this.className ) {\n\
\t\t\t\t\t// store className if set\n\
\t\t\t\t\tjQuery._data( this, \"__className__\", this.className );\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// If the element has a class name or if we're passed \"false\",\n\
\t\t\t\t// then remove the whole classname (if there was one, the above saved it).\n\
\t\t\t\t// Otherwise bring back whatever was previously saved (if anything),\n\
\t\t\t\t// falling back to the empty string if nothing was stored.\n\
\t\t\t\tthis.className = this.className || value === false ? \"\" : jQuery._data( this, \"__className__\" ) || \"\";\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\n\
\thasClass: function( selector ) {\n\
\t\tvar className = \" \" + selector + \" \",\n\
\t\t\ti = 0,\n\
\t\t\tl = this.length;\n\
\t\tfor ( ; i < l; i++ ) {\n\
\t\t\tif ( this[i].nodeType === 1 && (\" \" + this[i].className + \" \").replace(rclass, \" \").indexOf( className ) >= 0 ) {\n\
\t\t\t\treturn true;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn false;\n\
\t},\n\
\n\
\tval: function( value ) {\n\
\t\tvar ret, hooks, isFunction,\n\
\t\t\telem = this[0];\n\
\n\
\t\tif ( !arguments.length ) {\n\
\t\t\tif ( elem ) {\n\
\t\t\t\thooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];\n\
\n\
\t\t\t\tif ( hooks && \"get\" in hooks && (ret = hooks.get( elem, \"value\" )) !== undefined ) {\n\
\t\t\t\t\treturn ret;\n\
\t\t\t\t}\n\
\n\
\t\t\t\tret = elem.value;\n\
\n\
\t\t\t\treturn typeof ret === \"string\" ?\n\
\t\t\t\t\t// handle most common string cases\n\
\t\t\t\t\tret.replace(rreturn, \"\") :\n\
\t\t\t\t\t// handle cases where value is null/undef or number\n\
\t\t\t\t\tret == null ? \"\" : ret;\n\
\t\t\t}\n\
\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tisFunction = jQuery.isFunction( value );\n\
\n\
\t\treturn this.each(function( i ) {\n\
\t\t\tvar val,\n\
\t\t\t\tself = jQuery(this);\n\
\n\
\t\t\tif ( this.nodeType !== 1 ) {\n\
\t\t\t\treturn;\n\
\t\t\t}\n\
\n\
\t\t\tif ( isFunction ) {\n\
\t\t\t\tval = value.call( this, i, self.val() );\n\
\t\t\t} else {\n\
\t\t\t\tval = value;\n\
\t\t\t}\n\
\n\
\t\t\t// Treat null/undefined as \"\"; convert numbers to string\n\
\t\t\tif ( val == null ) {\n\
\t\t\t\tval = \"\";\n\
\t\t\t} else if ( typeof val === \"number\" ) {\n\
\t\t\t\tval += \"\";\n\
\t\t\t} else if ( jQuery.isArray( val ) ) {\n\
\t\t\t\tval = jQuery.map(val, function ( value ) {\n\
\t\t\t\t\treturn value == null ? \"\" : value + \"\";\n\
\t\t\t\t});\n\
\t\t\t}\n\
\n\
\t\t\thooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];\n\
\n\
\t\t\t// If set returns undefined, fall back to normal setting\n\
\t\t\tif ( !hooks || !(\"set\" in hooks) || hooks.set( this, val, \"value\" ) === undefined ) {\n\
\t\t\t\tthis.value = val;\n\
\t\t\t}\n\
\t\t});\n\
\t}\n\
});\n\
\n\
jQuery.extend({\n\
\tvalHooks: {\n\
\t\toption: {\n\
\t\t\tget: function( elem ) {\n\
\t\t\t\t// attributes.value is undefined in Blackberry 4.7 but\n\
\t\t\t\t// uses .value. See #6932\n\
\t\t\t\tvar val = elem.attributes.value;\n\
\t\t\t\treturn !val || val.specified ? elem.value : elem.text;\n\
\t\t\t}\n\
\t\t},\n\
\t\tselect: {\n\
\t\t\tget: function( elem ) {\n\
\t\t\t\tvar value, option,\n\
\t\t\t\t\toptions = elem.options,\n\
\t\t\t\t\tindex = elem.selectedIndex,\n\
\t\t\t\t\tone = elem.type === \"select-one\" || index < 0,\n\
\t\t\t\t\tvalues = one ? null : [],\n\
\t\t\t\t\tmax = one ? index + 1 : options.length,\n\
\t\t\t\t\ti = index < 0 ?\n\
\t\t\t\t\t\tmax :\n\
\t\t\t\t\t\tone ? index : 0;\n\
\n\
\t\t\t\t// Loop through all the selected options\n\
\t\t\t\tfor ( ; i < max; i++ ) {\n\
\t\t\t\t\toption = options[ i ];\n\
\n\
\t\t\t\t\t// oldIE doesn't update selected after form reset (#2551)\n\
\t\t\t\t\tif ( ( option.selected || i === index ) &&\n\
\t\t\t\t\t\t\t// Don't return options that are disabled or in a disabled optgroup\n\
\t\t\t\t\t\t\t( jQuery.support.optDisabled ? !option.disabled : option.getAttribute(\"disabled\") === null ) &&\n\
\t\t\t\t\t\t\t( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, \"optgroup\" ) ) ) {\n\
\n\
\t\t\t\t\t\t// Get the specific value for the option\n\
\t\t\t\t\t\tvalue = jQuery( option ).val();\n\
\n\
\t\t\t\t\t\t// We don't need an array for one selects\n\
\t\t\t\t\t\tif ( one ) {\n\
\t\t\t\t\t\t\treturn value;\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t// Multi-Selects return an array\n\
\t\t\t\t\t\tvalues.push( value );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\n\
\t\t\t\treturn values;\n\
\t\t\t},\n\
\n\
\t\t\tset: function( elem, value ) {\n\
\t\t\t\tvar values = jQuery.makeArray( value );\n\
\n\
\t\t\t\tjQuery(elem).find(\"option\").each(function() {\n\
\t\t\t\t\tthis.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;\n\
\t\t\t\t});\n\
\n\
\t\t\t\tif ( !values.length ) {\n\
\t\t\t\t\telem.selectedIndex = -1;\n\
\t\t\t\t}\n\
\t\t\t\treturn values;\n\
\t\t\t}\n\
\t\t}\n\
\t},\n\
\n\
\tattr: function( elem, name, value ) {\n\
\t\tvar hooks, notxml, ret,\n\
\t\t\tnType = elem.nodeType;\n\
\n\
\t\t// don't get/set attributes on text, comment and attribute nodes\n\
\t\tif ( !elem || nType === 3 || nType === 8 || nType === 2 ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// Fallback to prop when attributes are not supported\n\
\t\tif ( typeof elem.getAttribute === core_strundefined ) {\n\
\t\t\treturn jQuery.prop( elem, name, value );\n\
\t\t}\n\
\n\
\t\tnotxml = nType !== 1 || !jQuery.isXMLDoc( elem );\n\
\n\
\t\t// All attributes are lowercase\n\
\t\t// Grab necessary hook if one is defined\n\
\t\tif ( notxml ) {\n\
\t\t\tname = name.toLowerCase();\n\
\t\t\thooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );\n\
\t\t}\n\
\n\
\t\tif ( value !== undefined ) {\n\
\n\
\t\t\tif ( value === null ) {\n\
\t\t\t\tjQuery.removeAttr( elem, name );\n\
\n\
\t\t\t} else if ( hooks && notxml && \"set\" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {\n\
\t\t\t\treturn ret;\n\
\n\
\t\t\t} else {\n\
\t\t\t\telem.setAttribute( name, value + \"\" );\n\
\t\t\t\treturn value;\n\
\t\t\t}\n\
\n\
\t\t} else if ( hooks && notxml && \"get\" in hooks && (ret = hooks.get( elem, name )) !== null ) {\n\
\t\t\treturn ret;\n\
\n\
\t\t} else {\n\
\n\
\t\t\t// In IE9+, Flash objects don't have .getAttribute (#12945)\n\
\t\t\t// Support: IE9+\n\
\t\t\tif ( typeof elem.getAttribute !== core_strundefined ) {\n\
\t\t\t\tret =  elem.getAttribute( name );\n\
\t\t\t}\n\
\n\
\t\t\t// Non-existent attributes return null, we normalize to undefined\n\
\t\t\treturn ret == null ?\n\
\t\t\t\tundefined :\n\
\t\t\t\tret;\n\
\t\t}\n\
\t},\n\
\n\
\tremoveAttr: function( elem, value ) {\n\
\t\tvar name, propName,\n\
\t\t\ti = 0,\n\
\t\t\tattrNames = value && value.match( core_rnotwhite );\n\
\n\
\t\tif ( attrNames && elem.nodeType === 1 ) {\n\
\t\t\twhile ( (name = attrNames[i++]) ) {\n\
\t\t\t\tpropName = jQuery.propFix[ name ] || name;\n\
\n\
\t\t\t\t// Boolean attributes get special treatment (#10870)\n\
\t\t\t\tif ( rboolean.test( name ) ) {\n\
\t\t\t\t\t// Set corresponding property to false for boolean attributes\n\
\t\t\t\t\t// Also clear defaultChecked/defaultSelected (if appropriate) for IE<8\n\
\t\t\t\t\tif ( !getSetAttribute && ruseDefault.test( name ) ) {\n\
\t\t\t\t\t\telem[ jQuery.camelCase( \"default-\" + name ) ] =\n\
\t\t\t\t\t\t\telem[ propName ] = false;\n\
\t\t\t\t\t} else {\n\
\t\t\t\t\t\telem[ propName ] = false;\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t// See #9699 for explanation of this approach (setting first, then removal)\n\
\t\t\t\t} else {\n\
\t\t\t\t\tjQuery.attr( elem, name, \"\" );\n\
\t\t\t\t}\n\
\n\
\t\t\t\telem.removeAttribute( getSetAttribute ? name : propName );\n\
\t\t\t}\n\
\t\t}\n\
\t},\n\
\n\
\tattrHooks: {\n\
\t\ttype: {\n\
\t\t\tset: function( elem, value ) {\n\
\t\t\t\tif ( !jQuery.support.radioValue && value === \"radio\" && jQuery.nodeName(elem, \"input\") ) {\n\
\t\t\t\t\t// Setting the type on a radio button after the value resets the value in IE6-9\n\
\t\t\t\t\t// Reset value to default in case type is set after value during creation\n\
\t\t\t\t\tvar val = elem.value;\n\
\t\t\t\t\telem.setAttribute( \"type\", value );\n\
\t\t\t\t\tif ( val ) {\n\
\t\t\t\t\t\telem.value = val;\n\
\t\t\t\t\t}\n\
\t\t\t\t\treturn value;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t},\n\
\n\
\tpropFix: {\n\
\t\ttabindex: \"tabIndex\",\n\
\t\treadonly: \"readOnly\",\n\
\t\t\"for\": \"htmlFor\",\n\
\t\t\"class\": \"className\",\n\
\t\tmaxlength: \"maxLength\",\n\
\t\tcellspacing: \"cellSpacing\",\n\
\t\tcellpadding: \"cellPadding\",\n\
\t\trowspan: \"rowSpan\",\n\
\t\tcolspan: \"colSpan\",\n\
\t\tusemap: \"useMap\",\n\
\t\tframeborder: \"frameBorder\",\n\
\t\tcontenteditable: \"contentEditable\"\n\
\t},\n\
\n\
\tprop: function( elem, name, value ) {\n\
\t\tvar ret, hooks, notxml,\n\
\t\t\tnType = elem.nodeType;\n\
\n\
\t\t// don't get/set properties on text, comment and attribute nodes\n\
\t\tif ( !elem || nType === 3 || nType === 8 || nType === 2 ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tnotxml = nType !== 1 || !jQuery.isXMLDoc( elem );\n\
\n\
\t\tif ( notxml ) {\n\
\t\t\t// Fix name and attach hooks\n\
\t\t\tname = jQuery.propFix[ name ] || name;\n\
\t\t\thooks = jQuery.propHooks[ name ];\n\
\t\t}\n\
\n\
\t\tif ( value !== undefined ) {\n\
\t\t\tif ( hooks && \"set\" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {\n\
\t\t\t\treturn ret;\n\
\n\
\t\t\t} else {\n\
\t\t\t\treturn ( elem[ name ] = value );\n\
\t\t\t}\n\
\n\
\t\t} else {\n\
\t\t\tif ( hooks && \"get\" in hooks && (ret = hooks.get( elem, name )) !== null ) {\n\
\t\t\t\treturn ret;\n\
\n\
\t\t\t} else {\n\
\t\t\t\treturn elem[ name ];\n\
\t\t\t}\n\
\t\t}\n\
\t},\n\
\n\
\tpropHooks: {\n\
\t\ttabIndex: {\n\
\t\t\tget: function( elem ) {\n\
\t\t\t\t// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set\n\
\t\t\t\t// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/\n\
\t\t\t\tvar attributeNode = elem.getAttributeNode(\"tabindex\");\n\
\n\
\t\t\t\treturn attributeNode && attributeNode.specified ?\n\
\t\t\t\t\tparseInt( attributeNode.value, 10 ) :\n\
\t\t\t\t\trfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?\n\
\t\t\t\t\t\t0 :\n\
\t\t\t\t\t\tundefined;\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
});\n\
\n\
// Hook for boolean attributes\n\
boolHook = {\n\
\tget: function( elem, name ) {\n\
\t\tvar\n\
\t\t\t// Use .prop to determine if this attribute is understood as boolean\n\
\t\t\tprop = jQuery.prop( elem, name ),\n\
\n\
\t\t\t// Fetch it accordingly\n\
\t\t\tattr = typeof prop === \"boolean\" && elem.getAttribute( name ),\n\
\t\t\tdetail = typeof prop === \"boolean\" ?\n\
\n\
\t\t\t\tgetSetInput && getSetAttribute ?\n\
\t\t\t\t\tattr != null :\n\
\t\t\t\t\t// oldIE fabricates an empty string for missing boolean attributes\n\
\t\t\t\t\t// and conflates checked/selected into attroperties\n\
\t\t\t\t\truseDefault.test( name ) ?\n\
\t\t\t\t\t\telem[ jQuery.camelCase( \"default-\" + name ) ] :\n\
\t\t\t\t\t\t!!attr :\n\
\n\
\t\t\t\t// fetch an attribute node for properties not recognized as boolean\n\
\t\t\t\telem.getAttributeNode( name );\n\
\n\
\t\treturn detail && detail.value !== false ?\n\
\t\t\tname.toLowerCase() :\n\
\t\t\tundefined;\n\
\t},\n\
\tset: function( elem, value, name ) {\n\
\t\tif ( value === false ) {\n\
\t\t\t// Remove boolean attributes when set to false\n\
\t\t\tjQuery.removeAttr( elem, name );\n\
\t\t} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {\n\
\t\t\t// IE<8 needs the *property* name\n\
\t\t\telem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );\n\
\n\
\t\t// Use defaultChecked and defaultSelected for oldIE\n\
\t\t} else {\n\
\t\t\telem[ jQuery.camelCase( \"default-\" + name ) ] = elem[ name ] = true;\n\
\t\t}\n\
\n\
\t\treturn name;\n\
\t}\n\
};\n\
\n\
// fix oldIE value attroperty\n\
if ( !getSetInput || !getSetAttribute ) {\n\
\tjQuery.attrHooks.value = {\n\
\t\tget: function( elem, name ) {\n\
\t\t\tvar ret = elem.getAttributeNode( name );\n\
\t\t\treturn jQuery.nodeName( elem, \"input\" ) ?\n\
\n\
\t\t\t\t// Ignore the value *property* by using defaultValue\n\
\t\t\t\telem.defaultValue :\n\
\n\
\t\t\t\tret && ret.specified ? ret.value : undefined;\n\
\t\t},\n\
\t\tset: function( elem, value, name ) {\n\
\t\t\tif ( jQuery.nodeName( elem, \"input\" ) ) {\n\
\t\t\t\t// Does not return so that setAttribute is also used\n\
\t\t\t\telem.defaultValue = value;\n\
\t\t\t} else {\n\
\t\t\t\t// Use nodeHook if defined (#1954); otherwise setAttribute is fine\n\
\t\t\t\treturn nodeHook && nodeHook.set( elem, value, name );\n\
\t\t\t}\n\
\t\t}\n\
\t};\n\
}\n\
\n\
// IE6/7 do not support getting/setting some attributes with get/setAttribute\n\
if ( !getSetAttribute ) {\n\
\n\
\t// Use this for any attribute in IE6/7\n\
\t// This fixes almost every IE6/7 issue\n\
\tnodeHook = jQuery.valHooks.button = {\n\
\t\tget: function( elem, name ) {\n\
\t\t\tvar ret = elem.getAttributeNode( name );\n\
\t\t\treturn ret && ( name === \"id\" || name === \"name\" || name === \"coords\" ? ret.value !== \"\" : ret.specified ) ?\n\
\t\t\t\tret.value :\n\
\t\t\t\tundefined;\n\
\t\t},\n\
\t\tset: function( elem, value, name ) {\n\
\t\t\t// Set the existing or create a new attribute node\n\
\t\t\tvar ret = elem.getAttributeNode( name );\n\
\t\t\tif ( !ret ) {\n\
\t\t\t\telem.setAttributeNode(\n\
\t\t\t\t\t(ret = elem.ownerDocument.createAttribute( name ))\n\
\t\t\t\t);\n\
\t\t\t}\n\
\n\
\t\t\tret.value = value += \"\";\n\
\n\
\t\t\t// Break association with cloned elements by also using setAttribute (#9646)\n\
\t\t\treturn name === \"value\" || value === elem.getAttribute( name ) ?\n\
\t\t\t\tvalue :\n\
\t\t\t\tundefined;\n\
\t\t}\n\
\t};\n\
\n\
\t// Set contenteditable to false on removals(#10429)\n\
\t// Setting to empty string throws an error as an invalid value\n\
\tjQuery.attrHooks.contenteditable = {\n\
\t\tget: nodeHook.get,\n\
\t\tset: function( elem, value, name ) {\n\
\t\t\tnodeHook.set( elem, value === \"\" ? false : value, name );\n\
\t\t}\n\
\t};\n\
\n\
\t// Set width and height to auto instead of 0 on empty string( Bug #8150 )\n\
\t// This is for removals\n\
\tjQuery.each([ \"width\", \"height\" ], function( i, name ) {\n\
\t\tjQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {\n\
\t\t\tset: function( elem, value ) {\n\
\t\t\t\tif ( value === \"\" ) {\n\
\t\t\t\t\telem.setAttribute( name, \"auto\" );\n\
\t\t\t\t\treturn value;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t});\n\
\t});\n\
}\n\
\n\
\n\
// Some attributes require a special call on IE\n\
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx\n\
if ( !jQuery.support.hrefNormalized ) {\n\
\tjQuery.each([ \"href\", \"src\", \"width\", \"height\" ], function( i, name ) {\n\
\t\tjQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {\n\
\t\t\tget: function( elem ) {\n\
\t\t\t\tvar ret = elem.getAttribute( name, 2 );\n\
\t\t\t\treturn ret == null ? undefined : ret;\n\
\t\t\t}\n\
\t\t});\n\
\t});\n\
\n\
\t// href/src property should get the full normalized URL (#10299/#12915)\n\
\tjQuery.each([ \"href\", \"src\" ], function( i, name ) {\n\
\t\tjQuery.propHooks[ name ] = {\n\
\t\t\tget: function( elem ) {\n\
\t\t\t\treturn elem.getAttribute( name, 4 );\n\
\t\t\t}\n\
\t\t};\n\
\t});\n\
}\n\
\n\
if ( !jQuery.support.style ) {\n\
\tjQuery.attrHooks.style = {\n\
\t\tget: function( elem ) {\n\
\t\t\t// Return undefined in the case of empty string\n\
\t\t\t// Note: IE uppercases css property names, but if we were to .toLowerCase()\n\
\t\t\t// .cssText, that would destroy case senstitivity in URL's, like in \"background\"\n\
\t\t\treturn elem.style.cssText || undefined;\n\
\t\t},\n\
\t\tset: function( elem, value ) {\n\
\t\t\treturn ( elem.style.cssText = value + \"\" );\n\
\t\t}\n\
\t};\n\
}\n\
\n\
// Safari mis-reports the default selected property of an option\n\
// Accessing the parent's selectedIndex property fixes it\n\
if ( !jQuery.support.optSelected ) {\n\
\tjQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {\n\
\t\tget: function( elem ) {\n\
\t\t\tvar parent = elem.parentNode;\n\
\n\
\t\t\tif ( parent ) {\n\
\t\t\t\tparent.selectedIndex;\n\
\n\
\t\t\t\t// Make sure that it also works with optgroups, see #5701\n\
\t\t\t\tif ( parent.parentNode ) {\n\
\t\t\t\t\tparent.parentNode.selectedIndex;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t\treturn null;\n\
\t\t}\n\
\t});\n\
}\n\
\n\
// IE6/7 call enctype encoding\n\
if ( !jQuery.support.enctype ) {\n\
\tjQuery.propFix.enctype = \"encoding\";\n\
}\n\
\n\
// Radios and checkboxes getter/setter\n\
if ( !jQuery.support.checkOn ) {\n\
\tjQuery.each([ \"radio\", \"checkbox\" ], function() {\n\
\t\tjQuery.valHooks[ this ] = {\n\
\t\t\tget: function( elem ) {\n\
\t\t\t\t// Handle the case where in Webkit \"\" is returned instead of \"on\" if a value isn't specified\n\
\t\t\t\treturn elem.getAttribute(\"value\") === null ? \"on\" : elem.value;\n\
\t\t\t}\n\
\t\t};\n\
\t});\n\
}\n\
jQuery.each([ \"radio\", \"checkbox\" ], function() {\n\
\tjQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {\n\
\t\tset: function( elem, value ) {\n\
\t\t\tif ( jQuery.isArray( value ) ) {\n\
\t\t\t\treturn ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );\n\
\t\t\t}\n\
\t\t}\n\
\t});\n\
});\n\
var rformElems = /^(?:input|select|textarea)$/i,\n\
\trkeyEvent = /^key/,\n\
\trmouseEvent = /^(?:mouse|contextmenu)|click/,\n\
\trfocusMorph = /^(?:focusinfocus|focusoutblur)$/,\n\
\trtypenamespace = /^([^.]*)(?:\\.(.+)|)$/;\n\
\n\
function returnTrue() {\n\
\treturn true;\n\
}\n\
\n\
function returnFalse() {\n\
\treturn false;\n\
}\n\
\n\
/*\n\
 * Helper functions for managing events -- not part of the public interface.\n\
 * Props to Dean Edwards' addEvent library for many of the ideas.\n\
 */\n\
jQuery.event = {\n\
\n\
\tglobal: {},\n\
\n\
\tadd: function( elem, types, handler, data, selector ) {\n\
\t\tvar tmp, events, t, handleObjIn,\n\
\t\t\tspecial, eventHandle, handleObj,\n\
\t\t\thandlers, type, namespaces, origType,\n\
\t\t\telemData = jQuery._data( elem );\n\
\n\
\t\t// Don't attach events to noData or text/comment nodes (but allow plain objects)\n\
\t\tif ( !elemData ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// Caller can pass in an object of custom data in lieu of the handler\n\
\t\tif ( handler.handler ) {\n\
\t\t\thandleObjIn = handler;\n\
\t\t\thandler = handleObjIn.handler;\n\
\t\t\tselector = handleObjIn.selector;\n\
\t\t}\n\
\n\
\t\t// Make sure that the handler has a unique ID, used to find/remove it later\n\
\t\tif ( !handler.guid ) {\n\
\t\t\thandler.guid = jQuery.guid++;\n\
\t\t}\n\
\n\
\t\t// Init the element's event structure and main handler, if this is the first\n\
\t\tif ( !(events = elemData.events) ) {\n\
\t\t\tevents = elemData.events = {};\n\
\t\t}\n\
\t\tif ( !(eventHandle = elemData.handle) ) {\n\
\t\t\teventHandle = elemData.handle = function( e ) {\n\
\t\t\t\t// Discard the second event of a jQuery.event.trigger() and\n\
\t\t\t\t// when an event is called after a page has unloaded\n\
\t\t\t\treturn typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?\n\
\t\t\t\t\tjQuery.event.dispatch.apply( eventHandle.elem, arguments ) :\n\
\t\t\t\t\tundefined;\n\
\t\t\t};\n\
\t\t\t// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events\n\
\t\t\teventHandle.elem = elem;\n\
\t\t}\n\
\n\
\t\t// Handle multiple events separated by a space\n\
\t\t// jQuery(...).bind(\"mouseover mouseout\", fn);\n\
\t\ttypes = ( types || \"\" ).match( core_rnotwhite ) || [\"\"];\n\
\t\tt = types.length;\n\
\t\twhile ( t-- ) {\n\
\t\t\ttmp = rtypenamespace.exec( types[t] ) || [];\n\
\t\t\ttype = origType = tmp[1];\n\
\t\t\tnamespaces = ( tmp[2] || \"\" ).split( \".\" ).sort();\n\
\n\
\t\t\t// If event changes its type, use the special event handlers for the changed type\n\
\t\t\tspecial = jQuery.event.special[ type ] || {};\n\
\n\
\t\t\t// If selector defined, determine special event api type, otherwise given type\n\
\t\t\ttype = ( selector ? special.delegateType : special.bindType ) || type;\n\
\n\
\t\t\t// Update special based on newly reset type\n\
\t\t\tspecial = jQuery.event.special[ type ] || {};\n\
\n\
\t\t\t// handleObj is passed to all event handlers\n\
\t\t\thandleObj = jQuery.extend({\n\
\t\t\t\ttype: type,\n\
\t\t\t\torigType: origType,\n\
\t\t\t\tdata: data,\n\
\t\t\t\thandler: handler,\n\
\t\t\t\tguid: handler.guid,\n\
\t\t\t\tselector: selector,\n\
\t\t\t\tneedsContext: selector && jQuery.expr.match.needsContext.test( selector ),\n\
\t\t\t\tnamespace: namespaces.join(\".\")\n\
\t\t\t}, handleObjIn );\n\
\n\
\t\t\t// Init the event handler queue if we're the first\n\
\t\t\tif ( !(handlers = events[ type ]) ) {\n\
\t\t\t\thandlers = events[ type ] = [];\n\
\t\t\t\thandlers.delegateCount = 0;\n\
\n\
\t\t\t\t// Only use addEventListener/attachEvent if the special events handler returns false\n\
\t\t\t\tif ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {\n\
\t\t\t\t\t// Bind the global event handler to the element\n\
\t\t\t\t\tif ( elem.addEventListener ) {\n\
\t\t\t\t\t\telem.addEventListener( type, eventHandle, false );\n\
\n\
\t\t\t\t\t} else if ( elem.attachEvent ) {\n\
\t\t\t\t\t\telem.attachEvent( \"on\" + type, eventHandle );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\tif ( special.add ) {\n\
\t\t\t\tspecial.add.call( elem, handleObj );\n\
\n\
\t\t\t\tif ( !handleObj.handler.guid ) {\n\
\t\t\t\t\thandleObj.handler.guid = handler.guid;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// Add to the element's handler list, delegates in front\n\
\t\t\tif ( selector ) {\n\
\t\t\t\thandlers.splice( handlers.delegateCount++, 0, handleObj );\n\
\t\t\t} else {\n\
\t\t\t\thandlers.push( handleObj );\n\
\t\t\t}\n\
\n\
\t\t\t// Keep track of which events have ever been used, for event optimization\n\
\t\t\tjQuery.event.global[ type ] = true;\n\
\t\t}\n\
\n\
\t\t// Nullify elem to prevent memory leaks in IE\n\
\t\telem = null;\n\
\t},\n\
\n\
\t// Detach an event or set of events from an element\n\
\tremove: function( elem, types, handler, selector, mappedTypes ) {\n\
\t\tvar j, handleObj, tmp,\n\
\t\t\torigCount, t, events,\n\
\t\t\tspecial, handlers, type,\n\
\t\t\tnamespaces, origType,\n\
\t\t\telemData = jQuery.hasData( elem ) && jQuery._data( elem );\n\
\n\
\t\tif ( !elemData || !(events = elemData.events) ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// Once for each type.namespace in types; type may be omitted\n\
\t\ttypes = ( types || \"\" ).match( core_rnotwhite ) || [\"\"];\n\
\t\tt = types.length;\n\
\t\twhile ( t-- ) {\n\
\t\t\ttmp = rtypenamespace.exec( types[t] ) || [];\n\
\t\t\ttype = origType = tmp[1];\n\
\t\t\tnamespaces = ( tmp[2] || \"\" ).split( \".\" ).sort();\n\
\n\
\t\t\t// Unbind all events (on this namespace, if provided) for the element\n\
\t\t\tif ( !type ) {\n\
\t\t\t\tfor ( type in events ) {\n\
\t\t\t\t\tjQuery.event.remove( elem, type + types[ t ], handler, selector, true );\n\
\t\t\t\t}\n\
\t\t\t\tcontinue;\n\
\t\t\t}\n\
\n\
\t\t\tspecial = jQuery.event.special[ type ] || {};\n\
\t\t\ttype = ( selector ? special.delegateType : special.bindType ) || type;\n\
\t\t\thandlers = events[ type ] || [];\n\
\t\t\ttmp = tmp[2] && new RegExp( \"(^|\\\\.)\" + namespaces.join(\"\\\\.(?:.*\\\\.|)\") + \"(\\\\.|$)\" );\n\
\n\
\t\t\t// Remove matching events\n\
\t\t\torigCount = j = handlers.length;\n\
\t\t\twhile ( j-- ) {\n\
\t\t\t\thandleObj = handlers[ j ];\n\
\n\
\t\t\t\tif ( ( mappedTypes || origType === handleObj.origType ) &&\n\
\t\t\t\t\t( !handler || handler.guid === handleObj.guid ) &&\n\
\t\t\t\t\t( !tmp || tmp.test( handleObj.namespace ) ) &&\n\
\t\t\t\t\t( !selector || selector === handleObj.selector || selector === \"**\" && handleObj.selector ) ) {\n\
\t\t\t\t\thandlers.splice( j, 1 );\n\
\n\
\t\t\t\t\tif ( handleObj.selector ) {\n\
\t\t\t\t\t\thandlers.delegateCount--;\n\
\t\t\t\t\t}\n\
\t\t\t\t\tif ( special.remove ) {\n\
\t\t\t\t\t\tspecial.remove.call( elem, handleObj );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// Remove generic event handler if we removed something and no more handlers exist\n\
\t\t\t// (avoids potential for endless recursion during removal of special event handlers)\n\
\t\t\tif ( origCount && !handlers.length ) {\n\
\t\t\t\tif ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {\n\
\t\t\t\t\tjQuery.removeEvent( elem, type, elemData.handle );\n\
\t\t\t\t}\n\
\n\
\t\t\t\tdelete events[ type ];\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Remove the expando if it's no longer used\n\
\t\tif ( jQuery.isEmptyObject( events ) ) {\n\
\t\t\tdelete elemData.handle;\n\
\n\
\t\t\t// removeData also checks for emptiness and clears the expando if empty\n\
\t\t\t// so use it instead of delete\n\
\t\t\tjQuery._removeData( elem, \"events\" );\n\
\t\t}\n\
\t},\n\
\n\
\ttrigger: function( event, data, elem, onlyHandlers ) {\n\
\t\tvar handle, ontype, cur,\n\
\t\t\tbubbleType, special, tmp, i,\n\
\t\t\teventPath = [ elem || document ],\n\
\t\t\ttype = core_hasOwn.call( event, \"type\" ) ? event.type : event,\n\
\t\t\tnamespaces = core_hasOwn.call( event, \"namespace\" ) ? event.namespace.split(\".\") : [];\n\
\n\
\t\tcur = tmp = elem = elem || document;\n\
\n\
\t\t// Don't do events on text and comment nodes\n\
\t\tif ( elem.nodeType === 3 || elem.nodeType === 8 ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// focus/blur morphs to focusin/out; ensure we're not firing them right now\n\
\t\tif ( rfocusMorph.test( type + jQuery.event.triggered ) ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tif ( type.indexOf(\".\") >= 0 ) {\n\
\t\t\t// Namespaced trigger; create a regexp to match event type in handle()\n\
\t\t\tnamespaces = type.split(\".\");\n\
\t\t\ttype = namespaces.shift();\n\
\t\t\tnamespaces.sort();\n\
\t\t}\n\
\t\tontype = type.indexOf(\":\") < 0 && \"on\" + type;\n\
\n\
\t\t// Caller can pass in a jQuery.Event object, Object, or just an event type string\n\
\t\tevent = event[ jQuery.expando ] ?\n\
\t\t\tevent :\n\
\t\t\tnew jQuery.Event( type, typeof event === \"object\" && event );\n\
\n\
\t\tevent.isTrigger = true;\n\
\t\tevent.namespace = namespaces.join(\".\");\n\
\t\tevent.namespace_re = event.namespace ?\n\
\t\t\tnew RegExp( \"(^|\\\\.)\" + namespaces.join(\"\\\\.(?:.*\\\\.|)\") + \"(\\\\.|$)\" ) :\n\
\t\t\tnull;\n\
\n\
\t\t// Clean up the event in case it is being reused\n\
\t\tevent.result = undefined;\n\
\t\tif ( !event.target ) {\n\
\t\t\tevent.target = elem;\n\
\t\t}\n\
\n\
\t\t// Clone any incoming data and prepend the event, creating the handler arg list\n\
\t\tdata = data == null ?\n\
\t\t\t[ event ] :\n\
\t\t\tjQuery.makeArray( data, [ event ] );\n\
\n\
\t\t// Allow special events to draw outside the lines\n\
\t\tspecial = jQuery.event.special[ type ] || {};\n\
\t\tif ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// Determine event propagation path in advance, per W3C events spec (#9951)\n\
\t\t// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)\n\
\t\tif ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {\n\
\n\
\t\t\tbubbleType = special.delegateType || type;\n\
\t\t\tif ( !rfocusMorph.test( bubbleType + type ) ) {\n\
\t\t\t\tcur = cur.parentNode;\n\
\t\t\t}\n\
\t\t\tfor ( ; cur; cur = cur.parentNode ) {\n\
\t\t\t\teventPath.push( cur );\n\
\t\t\t\ttmp = cur;\n\
\t\t\t}\n\
\n\
\t\t\t// Only add window if we got to document (e.g., not plain obj or detached DOM)\n\
\t\t\tif ( tmp === (elem.ownerDocument || document) ) {\n\
\t\t\t\teventPath.push( tmp.defaultView || tmp.parentWindow || window );\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Fire handlers on the event path\n\
\t\ti = 0;\n\
\t\twhile ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {\n\
\n\
\t\t\tevent.type = i > 1 ?\n\
\t\t\t\tbubbleType :\n\
\t\t\t\tspecial.bindType || type;\n\
\n\
\t\t\t// jQuery handler\n\
\t\t\thandle = ( jQuery._data( cur, \"events\" ) || {} )[ event.type ] && jQuery._data( cur, \"handle\" );\n\
\t\t\tif ( handle ) {\n\
\t\t\t\thandle.apply( cur, data );\n\
\t\t\t}\n\
\n\
\t\t\t// Native handler\n\
\t\t\thandle = ontype && cur[ ontype ];\n\
\t\t\tif ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {\n\
\t\t\t\tevent.preventDefault();\n\
\t\t\t}\n\
\t\t}\n\
\t\tevent.type = type;\n\
\n\
\t\t// If nobody prevented the default action, do it now\n\
\t\tif ( !onlyHandlers && !event.isDefaultPrevented() ) {\n\
\n\
\t\t\tif ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&\n\
\t\t\t\t!(type === \"click\" && jQuery.nodeName( elem, \"a\" )) && jQuery.acceptData( elem ) ) {\n\
\n\
\t\t\t\t// Call a native DOM method on the target with the same name name as the event.\n\
\t\t\t\t// Can't use an .isFunction() check here because IE6/7 fails that test.\n\
\t\t\t\t// Don't do default actions on window, that's where global variables be (#6170)\n\
\t\t\t\tif ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {\n\
\n\
\t\t\t\t\t// Don't re-trigger an onFOO event when we call its FOO() method\n\
\t\t\t\t\ttmp = elem[ ontype ];\n\
\n\
\t\t\t\t\tif ( tmp ) {\n\
\t\t\t\t\t\telem[ ontype ] = null;\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Prevent re-triggering of the same event, since we already bubbled it above\n\
\t\t\t\t\tjQuery.event.triggered = type;\n\
\t\t\t\t\ttry {\n\
\t\t\t\t\t\telem[ type ]();\n\
\t\t\t\t\t} catch ( e ) {\n\
\t\t\t\t\t\t// IE<9 dies on focus/blur to hidden element (#1486,#12518)\n\
\t\t\t\t\t\t// only reproducible on winXP IE8 native, not IE9 in IE8 mode\n\
\t\t\t\t\t}\n\
\t\t\t\t\tjQuery.event.triggered = undefined;\n\
\n\
\t\t\t\t\tif ( tmp ) {\n\
\t\t\t\t\t\telem[ ontype ] = tmp;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn event.result;\n\
\t},\n\
\n\
\tdispatch: function( event ) {\n\
\n\
\t\t// Make a writable jQuery.Event from the native event object\n\
\t\tevent = jQuery.event.fix( event );\n\
\n\
\t\tvar i, ret, handleObj, matched, j,\n\
\t\t\thandlerQueue = [],\n\
\t\t\targs = core_slice.call( arguments ),\n\
\t\t\thandlers = ( jQuery._data( this, \"events\" ) || {} )[ event.type ] || [],\n\
\t\t\tspecial = jQuery.event.special[ event.type ] || {};\n\
\n\
\t\t// Use the fix-ed jQuery.Event rather than the (read-only) native event\n\
\t\targs[0] = event;\n\
\t\tevent.delegateTarget = this;\n\
\n\
\t\t// Call the preDispatch hook for the mapped type, and let it bail if desired\n\
\t\tif ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// Determine handlers\n\
\t\thandlerQueue = jQuery.event.handlers.call( this, event, handlers );\n\
\n\
\t\t// Run delegates first; they may want to stop propagation beneath us\n\
\t\ti = 0;\n\
\t\twhile ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {\n\
\t\t\tevent.currentTarget = matched.elem;\n\
\n\
\t\t\tj = 0;\n\
\t\t\twhile ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {\n\
\n\
\t\t\t\t// Triggered event must either 1) have no namespace, or\n\
\t\t\t\t// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).\n\
\t\t\t\tif ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {\n\
\n\
\t\t\t\t\tevent.handleObj = handleObj;\n\
\t\t\t\t\tevent.data = handleObj.data;\n\
\n\
\t\t\t\t\tret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )\n\
\t\t\t\t\t\t\t.apply( matched.elem, args );\n\
\n\
\t\t\t\t\tif ( ret !== undefined ) {\n\
\t\t\t\t\t\tif ( (event.result = ret) === false ) {\n\
\t\t\t\t\t\t\tevent.preventDefault();\n\
\t\t\t\t\t\t\tevent.stopPropagation();\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Call the postDispatch hook for the mapped type\n\
\t\tif ( special.postDispatch ) {\n\
\t\t\tspecial.postDispatch.call( this, event );\n\
\t\t}\n\
\n\
\t\treturn event.result;\n\
\t},\n\
\n\
\thandlers: function( event, handlers ) {\n\
\t\tvar sel, handleObj, matches, i,\n\
\t\t\thandlerQueue = [],\n\
\t\t\tdelegateCount = handlers.delegateCount,\n\
\t\t\tcur = event.target;\n\
\n\
\t\t// Find delegate handlers\n\
\t\t// Black-hole SVG <use> instance trees (#13180)\n\
\t\t// Avoid non-left-click bubbling in Firefox (#3861)\n\
\t\tif ( delegateCount && cur.nodeType && (!event.button || event.type !== \"click\") ) {\n\
\n\
\t\t\tfor ( ; cur != this; cur = cur.parentNode || this ) {\n\
\n\
\t\t\t\t// Don't check non-elements (#13208)\n\
\t\t\t\t// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)\n\
\t\t\t\tif ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== \"click\") ) {\n\
\t\t\t\t\tmatches = [];\n\
\t\t\t\t\tfor ( i = 0; i < delegateCount; i++ ) {\n\
\t\t\t\t\t\thandleObj = handlers[ i ];\n\
\n\
\t\t\t\t\t\t// Don't conflict with Object.prototype properties (#13203)\n\
\t\t\t\t\t\tsel = handleObj.selector + \" \";\n\
\n\
\t\t\t\t\t\tif ( matches[ sel ] === undefined ) {\n\
\t\t\t\t\t\t\tmatches[ sel ] = handleObj.needsContext ?\n\
\t\t\t\t\t\t\t\tjQuery( sel, this ).index( cur ) >= 0 :\n\
\t\t\t\t\t\t\t\tjQuery.find( sel, this, null, [ cur ] ).length;\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t\tif ( matches[ sel ] ) {\n\
\t\t\t\t\t\t\tmatches.push( handleObj );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t\tif ( matches.length ) {\n\
\t\t\t\t\t\thandlerQueue.push({ elem: cur, handlers: matches });\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Add the remaining (directly-bound) handlers\n\
\t\tif ( delegateCount < handlers.length ) {\n\
\t\t\thandlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });\n\
\t\t}\n\
\n\
\t\treturn handlerQueue;\n\
\t},\n\
\n\
\tfix: function( event ) {\n\
\t\tif ( event[ jQuery.expando ] ) {\n\
\t\t\treturn event;\n\
\t\t}\n\
\n\
\t\t// Create a writable copy of the event object and normalize some properties\n\
\t\tvar i, prop, copy,\n\
\t\t\ttype = event.type,\n\
\t\t\toriginalEvent = event,\n\
\t\t\tfixHook = this.fixHooks[ type ];\n\
\n\
\t\tif ( !fixHook ) {\n\
\t\t\tthis.fixHooks[ type ] = fixHook =\n\
\t\t\t\trmouseEvent.test( type ) ? this.mouseHooks :\n\
\t\t\t\trkeyEvent.test( type ) ? this.keyHooks :\n\
\t\t\t\t{};\n\
\t\t}\n\
\t\tcopy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;\n\
\n\
\t\tevent = new jQuery.Event( originalEvent );\n\
\n\
\t\ti = copy.length;\n\
\t\twhile ( i-- ) {\n\
\t\t\tprop = copy[ i ];\n\
\t\t\tevent[ prop ] = originalEvent[ prop ];\n\
\t\t}\n\
\n\
\t\t// Support: IE<9\n\
\t\t// Fix target property (#1925)\n\
\t\tif ( !event.target ) {\n\
\t\t\tevent.target = originalEvent.srcElement || document;\n\
\t\t}\n\
\n\
\t\t// Support: Chrome 23+, Safari?\n\
\t\t// Target should not be a text node (#504, #13143)\n\
\t\tif ( event.target.nodeType === 3 ) {\n\
\t\t\tevent.target = event.target.parentNode;\n\
\t\t}\n\
\n\
\t\t// Support: IE<9\n\
\t\t// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)\n\
\t\tevent.metaKey = !!event.metaKey;\n\
\n\
\t\treturn fixHook.filter ? fixHook.filter( event, originalEvent ) : event;\n\
\t},\n\
\n\
\t// Includes some event props shared by KeyEvent and MouseEvent\n\
\tprops: \"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which\".split(\" \"),\n\
\n\
\tfixHooks: {},\n\
\n\
\tkeyHooks: {\n\
\t\tprops: \"char charCode key keyCode\".split(\" \"),\n\
\t\tfilter: function( event, original ) {\n\
\n\
\t\t\t// Add which for key events\n\
\t\t\tif ( event.which == null ) {\n\
\t\t\t\tevent.which = original.charCode != null ? original.charCode : original.keyCode;\n\
\t\t\t}\n\
\n\
\t\t\treturn event;\n\
\t\t}\n\
\t},\n\
\n\
\tmouseHooks: {\n\
\t\tprops: \"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement\".split(\" \"),\n\
\t\tfilter: function( event, original ) {\n\
\t\t\tvar body, eventDoc, doc,\n\
\t\t\t\tbutton = original.button,\n\
\t\t\t\tfromElement = original.fromElement;\n\
\n\
\t\t\t// Calculate pageX/Y if missing and clientX/Y available\n\
\t\t\tif ( event.pageX == null && original.clientX != null ) {\n\
\t\t\t\teventDoc = event.target.ownerDocument || document;\n\
\t\t\t\tdoc = eventDoc.documentElement;\n\
\t\t\t\tbody = eventDoc.body;\n\
\n\
\t\t\t\tevent.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );\n\
\t\t\t\tevent.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );\n\
\t\t\t}\n\
\n\
\t\t\t// Add relatedTarget, if necessary\n\
\t\t\tif ( !event.relatedTarget && fromElement ) {\n\
\t\t\t\tevent.relatedTarget = fromElement === event.target ? original.toElement : fromElement;\n\
\t\t\t}\n\
\n\
\t\t\t// Add which for click: 1 === left; 2 === middle; 3 === right\n\
\t\t\t// Note: button is not normalized, so don't use it\n\
\t\t\tif ( !event.which && button !== undefined ) {\n\
\t\t\t\tevent.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );\n\
\t\t\t}\n\
\n\
\t\t\treturn event;\n\
\t\t}\n\
\t},\n\
\n\
\tspecial: {\n\
\t\tload: {\n\
\t\t\t// Prevent triggered image.load events from bubbling to window.load\n\
\t\t\tnoBubble: true\n\
\t\t},\n\
\t\tclick: {\n\
\t\t\t// For checkbox, fire native event so checked state will be right\n\
\t\t\ttrigger: function() {\n\
\t\t\t\tif ( jQuery.nodeName( this, \"input\" ) && this.type === \"checkbox\" && this.click ) {\n\
\t\t\t\t\tthis.click();\n\
\t\t\t\t\treturn false;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t},\n\
\t\tfocus: {\n\
\t\t\t// Fire native event if possible so blur/focus sequence is correct\n\
\t\t\ttrigger: function() {\n\
\t\t\t\tif ( this !== document.activeElement && this.focus ) {\n\
\t\t\t\t\ttry {\n\
\t\t\t\t\t\tthis.focus();\n\
\t\t\t\t\t\treturn false;\n\
\t\t\t\t\t} catch ( e ) {\n\
\t\t\t\t\t\t// Support: IE<9\n\
\t\t\t\t\t\t// If we error on focus to hidden element (#1486, #12518),\n\
\t\t\t\t\t\t// let .trigger() run the handlers\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t},\n\
\t\t\tdelegateType: \"focusin\"\n\
\t\t},\n\
\t\tblur: {\n\
\t\t\ttrigger: function() {\n\
\t\t\t\tif ( this === document.activeElement && this.blur ) {\n\
\t\t\t\t\tthis.blur();\n\
\t\t\t\t\treturn false;\n\
\t\t\t\t}\n\
\t\t\t},\n\
\t\t\tdelegateType: \"focusout\"\n\
\t\t},\n\
\n\
\t\tbeforeunload: {\n\
\t\t\tpostDispatch: function( event ) {\n\
\n\
\t\t\t\t// Even when returnValue equals to undefined Firefox will still show alert\n\
\t\t\t\tif ( event.result !== undefined ) {\n\
\t\t\t\t\tevent.originalEvent.returnValue = event.result;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t},\n\
\n\
\tsimulate: function( type, elem, event, bubble ) {\n\
\t\t// Piggyback on a donor event to simulate a different one.\n\
\t\t// Fake originalEvent to avoid donor's stopPropagation, but if the\n\
\t\t// simulated event prevents default then we do the same on the donor.\n\
\t\tvar e = jQuery.extend(\n\
\t\t\tnew jQuery.Event(),\n\
\t\t\tevent,\n\
\t\t\t{ type: type,\n\
\t\t\t\tisSimulated: true,\n\
\t\t\t\toriginalEvent: {}\n\
\t\t\t}\n\
\t\t);\n\
\t\tif ( bubble ) {\n\
\t\t\tjQuery.event.trigger( e, null, elem );\n\
\t\t} else {\n\
\t\t\tjQuery.event.dispatch.call( elem, e );\n\
\t\t}\n\
\t\tif ( e.isDefaultPrevented() ) {\n\
\t\t\tevent.preventDefault();\n\
\t\t}\n\
\t}\n\
};\n\
\n\
jQuery.removeEvent = document.removeEventListener ?\n\
\tfunction( elem, type, handle ) {\n\
\t\tif ( elem.removeEventListener ) {\n\
\t\t\telem.removeEventListener( type, handle, false );\n\
\t\t}\n\
\t} :\n\
\tfunction( elem, type, handle ) {\n\
\t\tvar name = \"on\" + type;\n\
\n\
\t\tif ( elem.detachEvent ) {\n\
\n\
\t\t\t// #8545, #7054, preventing memory leaks for custom events in IE6-8\n\
\t\t\t// detachEvent needed property on element, by name of that event, to properly expose it to GC\n\
\t\t\tif ( typeof elem[ name ] === core_strundefined ) {\n\
\t\t\t\telem[ name ] = null;\n\
\t\t\t}\n\
\n\
\t\t\telem.detachEvent( name, handle );\n\
\t\t}\n\
\t};\n\
\n\
jQuery.Event = function( src, props ) {\n\
\t// Allow instantiation without the 'new' keyword\n\
\tif ( !(this instanceof jQuery.Event) ) {\n\
\t\treturn new jQuery.Event( src, props );\n\
\t}\n\
\n\
\t// Event object\n\
\tif ( src && src.type ) {\n\
\t\tthis.originalEvent = src;\n\
\t\tthis.type = src.type;\n\
\n\
\t\t// Events bubbling up the document may have been marked as prevented\n\
\t\t// by a handler lower down the tree; reflect the correct value.\n\
\t\tthis.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||\n\
\t\t\tsrc.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;\n\
\n\
\t// Event type\n\
\t} else {\n\
\t\tthis.type = src;\n\
\t}\n\
\n\
\t// Put explicitly provided properties onto the event object\n\
\tif ( props ) {\n\
\t\tjQuery.extend( this, props );\n\
\t}\n\
\n\
\t// Create a timestamp if incoming event doesn't have one\n\
\tthis.timeStamp = src && src.timeStamp || jQuery.now();\n\
\n\
\t// Mark it as fixed\n\
\tthis[ jQuery.expando ] = true;\n\
};\n\
\n\
// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding\n\
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html\n\
jQuery.Event.prototype = {\n\
\tisDefaultPrevented: returnFalse,\n\
\tisPropagationStopped: returnFalse,\n\
\tisImmediatePropagationStopped: returnFalse,\n\
\n\
\tpreventDefault: function() {\n\
\t\tvar e = this.originalEvent;\n\
\n\
\t\tthis.isDefaultPrevented = returnTrue;\n\
\t\tif ( !e ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// If preventDefault exists, run it on the original event\n\
\t\tif ( e.preventDefault ) {\n\
\t\t\te.preventDefault();\n\
\n\
\t\t// Support: IE\n\
\t\t// Otherwise set the returnValue property of the original event to false\n\
\t\t} else {\n\
\t\t\te.returnValue = false;\n\
\t\t}\n\
\t},\n\
\tstopPropagation: function() {\n\
\t\tvar e = this.originalEvent;\n\
\n\
\t\tthis.isPropagationStopped = returnTrue;\n\
\t\tif ( !e ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\t\t// If stopPropagation exists, run it on the original event\n\
\t\tif ( e.stopPropagation ) {\n\
\t\t\te.stopPropagation();\n\
\t\t}\n\
\n\
\t\t// Support: IE\n\
\t\t// Set the cancelBubble property of the original event to true\n\
\t\te.cancelBubble = true;\n\
\t},\n\
\tstopImmediatePropagation: function() {\n\
\t\tthis.isImmediatePropagationStopped = returnTrue;\n\
\t\tthis.stopPropagation();\n\
\t}\n\
};\n\
\n\
// Create mouseenter/leave events using mouseover/out and event-time checks\n\
jQuery.each({\n\
\tmouseenter: \"mouseover\",\n\
\tmouseleave: \"mouseout\"\n\
}, function( orig, fix ) {\n\
\tjQuery.event.special[ orig ] = {\n\
\t\tdelegateType: fix,\n\
\t\tbindType: fix,\n\
\n\
\t\thandle: function( event ) {\n\
\t\t\tvar ret,\n\
\t\t\t\ttarget = this,\n\
\t\t\t\trelated = event.relatedTarget,\n\
\t\t\t\thandleObj = event.handleObj;\n\
\n\
\t\t\t// For mousenter/leave call the handler if related is outside the target.\n\
\t\t\t// NB: No relatedTarget if the mouse left/entered the browser window\n\
\t\t\tif ( !related || (related !== target && !jQuery.contains( target, related )) ) {\n\
\t\t\t\tevent.type = handleObj.origType;\n\
\t\t\t\tret = handleObj.handler.apply( this, arguments );\n\
\t\t\t\tevent.type = fix;\n\
\t\t\t}\n\
\t\t\treturn ret;\n\
\t\t}\n\
\t};\n\
});\n\
\n\
// IE submit delegation\n\
if ( !jQuery.support.submitBubbles ) {\n\
\n\
\tjQuery.event.special.submit = {\n\
\t\tsetup: function() {\n\
\t\t\t// Only need this for delegated form submit events\n\
\t\t\tif ( jQuery.nodeName( this, \"form\" ) ) {\n\
\t\t\t\treturn false;\n\
\t\t\t}\n\
\n\
\t\t\t// Lazy-add a submit handler when a descendant form may potentially be submitted\n\
\t\t\tjQuery.event.add( this, \"click._submit keypress._submit\", function( e ) {\n\
\t\t\t\t// Node name check avoids a VML-related crash in IE (#9807)\n\
\t\t\t\tvar elem = e.target,\n\
\t\t\t\t\tform = jQuery.nodeName( elem, \"input\" ) || jQuery.nodeName( elem, \"button\" ) ? elem.form : undefined;\n\
\t\t\t\tif ( form && !jQuery._data( form, \"submitBubbles\" ) ) {\n\
\t\t\t\t\tjQuery.event.add( form, \"submit._submit\", function( event ) {\n\
\t\t\t\t\t\tevent._submit_bubble = true;\n\
\t\t\t\t\t});\n\
\t\t\t\t\tjQuery._data( form, \"submitBubbles\", true );\n\
\t\t\t\t}\n\
\t\t\t});\n\
\t\t\t// return undefined since we don't need an event listener\n\
\t\t},\n\
\n\
\t\tpostDispatch: function( event ) {\n\
\t\t\t// If form was submitted by the user, bubble the event up the tree\n\
\t\t\tif ( event._submit_bubble ) {\n\
\t\t\t\tdelete event._submit_bubble;\n\
\t\t\t\tif ( this.parentNode && !event.isTrigger ) {\n\
\t\t\t\t\tjQuery.event.simulate( \"submit\", this.parentNode, event, true );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t},\n\
\n\
\t\tteardown: function() {\n\
\t\t\t// Only need this for delegated form submit events\n\
\t\t\tif ( jQuery.nodeName( this, \"form\" ) ) {\n\
\t\t\t\treturn false;\n\
\t\t\t}\n\
\n\
\t\t\t// Remove delegated handlers; cleanData eventually reaps submit handlers attached above\n\
\t\t\tjQuery.event.remove( this, \"._submit\" );\n\
\t\t}\n\
\t};\n\
}\n\
\n\
// IE change delegation and checkbox/radio fix\n\
if ( !jQuery.support.changeBubbles ) {\n\
\n\
\tjQuery.event.special.change = {\n\
\n\
\t\tsetup: function() {\n\
\n\
\t\t\tif ( rformElems.test( this.nodeName ) ) {\n\
\t\t\t\t// IE doesn't fire change on a check/radio until blur; trigger it on click\n\
\t\t\t\t// after a propertychange. Eat the blur-change in special.change.handle.\n\
\t\t\t\t// This still fires onchange a second time for check/radio after blur.\n\
\t\t\t\tif ( this.type === \"checkbox\" || this.type === \"radio\" ) {\n\
\t\t\t\t\tjQuery.event.add( this, \"propertychange._change\", function( event ) {\n\
\t\t\t\t\t\tif ( event.originalEvent.propertyName === \"checked\" ) {\n\
\t\t\t\t\t\t\tthis._just_changed = true;\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t});\n\
\t\t\t\t\tjQuery.event.add( this, \"click._change\", function( event ) {\n\
\t\t\t\t\t\tif ( this._just_changed && !event.isTrigger ) {\n\
\t\t\t\t\t\t\tthis._just_changed = false;\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t\t// Allow triggered, simulated change events (#11500)\n\
\t\t\t\t\t\tjQuery.event.simulate( \"change\", this, event, true );\n\
\t\t\t\t\t});\n\
\t\t\t\t}\n\
\t\t\t\treturn false;\n\
\t\t\t}\n\
\t\t\t// Delegated event; lazy-add a change handler on descendant inputs\n\
\t\t\tjQuery.event.add( this, \"beforeactivate._change\", function( e ) {\n\
\t\t\t\tvar elem = e.target;\n\
\n\
\t\t\t\tif ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, \"changeBubbles\" ) ) {\n\
\t\t\t\t\tjQuery.event.add( elem, \"change._change\", function( event ) {\n\
\t\t\t\t\t\tif ( this.parentNode && !event.isSimulated && !event.isTrigger ) {\n\
\t\t\t\t\t\t\tjQuery.event.simulate( \"change\", this.parentNode, event, true );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t});\n\
\t\t\t\t\tjQuery._data( elem, \"changeBubbles\", true );\n\
\t\t\t\t}\n\
\t\t\t});\n\
\t\t},\n\
\n\
\t\thandle: function( event ) {\n\
\t\t\tvar elem = event.target;\n\
\n\
\t\t\t// Swallow native change events from checkbox/radio, we already triggered them above\n\
\t\t\tif ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== \"radio\" && elem.type !== \"checkbox\") ) {\n\
\t\t\t\treturn event.handleObj.handler.apply( this, arguments );\n\
\t\t\t}\n\
\t\t},\n\
\n\
\t\tteardown: function() {\n\
\t\t\tjQuery.event.remove( this, \"._change\" );\n\
\n\
\t\t\treturn !rformElems.test( this.nodeName );\n\
\t\t}\n\
\t};\n\
}\n\
\n\
// Create \"bubbling\" focus and blur events\n\
if ( !jQuery.support.focusinBubbles ) {\n\
\tjQuery.each({ focus: \"focusin\", blur: \"focusout\" }, function( orig, fix ) {\n\
\n\
\t\t// Attach a single capturing handler while someone wants focusin/focusout\n\
\t\tvar attaches = 0,\n\
\t\t\thandler = function( event ) {\n\
\t\t\t\tjQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );\n\
\t\t\t};\n\
\n\
\t\tjQuery.event.special[ fix ] = {\n\
\t\t\tsetup: function() {\n\
\t\t\t\tif ( attaches++ === 0 ) {\n\
\t\t\t\t\tdocument.addEventListener( orig, handler, true );\n\
\t\t\t\t}\n\
\t\t\t},\n\
\t\t\tteardown: function() {\n\
\t\t\t\tif ( --attaches === 0 ) {\n\
\t\t\t\t\tdocument.removeEventListener( orig, handler, true );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t};\n\
\t});\n\
}\n\
\n\
jQuery.fn.extend({\n\
\n\
\ton: function( types, selector, data, fn, /*INTERNAL*/ one ) {\n\
\t\tvar type, origFn;\n\
\n\
\t\t// Types can be a map of types/handlers\n\
\t\tif ( typeof types === \"object\" ) {\n\
\t\t\t// ( types-Object, selector, data )\n\
\t\t\tif ( typeof selector !== \"string\" ) {\n\
\t\t\t\t// ( types-Object, data )\n\
\t\t\t\tdata = data || selector;\n\
\t\t\t\tselector = undefined;\n\
\t\t\t}\n\
\t\t\tfor ( type in types ) {\n\
\t\t\t\tthis.on( type, selector, data, types[ type ], one );\n\
\t\t\t}\n\
\t\t\treturn this;\n\
\t\t}\n\
\n\
\t\tif ( data == null && fn == null ) {\n\
\t\t\t// ( types, fn )\n\
\t\t\tfn = selector;\n\
\t\t\tdata = selector = undefined;\n\
\t\t} else if ( fn == null ) {\n\
\t\t\tif ( typeof selector === \"string\" ) {\n\
\t\t\t\t// ( types, selector, fn )\n\
\t\t\t\tfn = data;\n\
\t\t\t\tdata = undefined;\n\
\t\t\t} else {\n\
\t\t\t\t// ( types, data, fn )\n\
\t\t\t\tfn = data;\n\
\t\t\t\tdata = selector;\n\
\t\t\t\tselector = undefined;\n\
\t\t\t}\n\
\t\t}\n\
\t\tif ( fn === false ) {\n\
\t\t\tfn = returnFalse;\n\
\t\t} else if ( !fn ) {\n\
\t\t\treturn this;\n\
\t\t}\n\
\n\
\t\tif ( one === 1 ) {\n\
\t\t\torigFn = fn;\n\
\t\t\tfn = function( event ) {\n\
\t\t\t\t// Can use an empty set, since event contains the info\n\
\t\t\t\tjQuery().off( event );\n\
\t\t\t\treturn origFn.apply( this, arguments );\n\
\t\t\t};\n\
\t\t\t// Use same guid so caller can remove using origFn\n\
\t\t\tfn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );\n\
\t\t}\n\
\t\treturn this.each( function() {\n\
\t\t\tjQuery.event.add( this, types, fn, data, selector );\n\
\t\t});\n\
\t},\n\
\tone: function( types, selector, data, fn ) {\n\
\t\treturn this.on( types, selector, data, fn, 1 );\n\
\t},\n\
\toff: function( types, selector, fn ) {\n\
\t\tvar handleObj, type;\n\
\t\tif ( types && types.preventDefault && types.handleObj ) {\n\
\t\t\t// ( event )  dispatched jQuery.Event\n\
\t\t\thandleObj = types.handleObj;\n\
\t\t\tjQuery( types.delegateTarget ).off(\n\
\t\t\t\thandleObj.namespace ? handleObj.origType + \".\" + handleObj.namespace : handleObj.origType,\n\
\t\t\t\thandleObj.selector,\n\
\t\t\t\thandleObj.handler\n\
\t\t\t);\n\
\t\t\treturn this;\n\
\t\t}\n\
\t\tif ( typeof types === \"object\" ) {\n\
\t\t\t// ( types-object [, selector] )\n\
\t\t\tfor ( type in types ) {\n\
\t\t\t\tthis.off( type, selector, types[ type ] );\n\
\t\t\t}\n\
\t\t\treturn this;\n\
\t\t}\n\
\t\tif ( selector === false || typeof selector === \"function\" ) {\n\
\t\t\t// ( types [, fn] )\n\
\t\t\tfn = selector;\n\
\t\t\tselector = undefined;\n\
\t\t}\n\
\t\tif ( fn === false ) {\n\
\t\t\tfn = returnFalse;\n\
\t\t}\n\
\t\treturn this.each(function() {\n\
\t\t\tjQuery.event.remove( this, types, fn, selector );\n\
\t\t});\n\
\t},\n\
\n\
\tbind: function( types, data, fn ) {\n\
\t\treturn this.on( types, null, data, fn );\n\
\t},\n\
\tunbind: function( types, fn ) {\n\
\t\treturn this.off( types, null, fn );\n\
\t},\n\
\n\
\tdelegate: function( selector, types, data, fn ) {\n\
\t\treturn this.on( types, selector, data, fn );\n\
\t},\n\
\tundelegate: function( selector, types, fn ) {\n\
\t\t// ( namespace ) or ( selector, types [, fn] )\n\
\t\treturn arguments.length === 1 ? this.off( selector, \"**\" ) : this.off( types, selector || \"**\", fn );\n\
\t},\n\
\n\
\ttrigger: function( type, data ) {\n\
\t\treturn this.each(function() {\n\
\t\t\tjQuery.event.trigger( type, data, this );\n\
\t\t});\n\
\t},\n\
\ttriggerHandler: function( type, data ) {\n\
\t\tvar elem = this[0];\n\
\t\tif ( elem ) {\n\
\t\t\treturn jQuery.event.trigger( type, data, elem, true );\n\
\t\t}\n\
\t}\n\
});\n\
/*!\n\
 * Sizzle CSS Selector Engine\n\
 * Copyright 2012 jQuery Foundation and other contributors\n\
 * Released under the MIT license\n\
 * http://sizzlejs.com/\n\
 */\n\
(function( window, undefined ) {\n\
\n\
var i,\n\
\tcachedruns,\n\
\tExpr,\n\
\tgetText,\n\
\tisXML,\n\
\tcompile,\n\
\thasDuplicate,\n\
\toutermostContext,\n\
\n\
\t// Local document vars\n\
\tsetDocument,\n\
\tdocument,\n\
\tdocElem,\n\
\tdocumentIsXML,\n\
\trbuggyQSA,\n\
\trbuggyMatches,\n\
\tmatches,\n\
\tcontains,\n\
\tsortOrder,\n\
\n\
\t// Instance-specific data\n\
\texpando = \"sizzle\" + -(new Date()),\n\
\tpreferredDoc = window.document,\n\
\tsupport = {},\n\
\tdirruns = 0,\n\
\tdone = 0,\n\
\tclassCache = createCache(),\n\
\ttokenCache = createCache(),\n\
\tcompilerCache = createCache(),\n\
\n\
\t// General-purpose constants\n\
\tstrundefined = typeof undefined,\n\
\tMAX_NEGATIVE = 1 << 31,\n\
\n\
\t// Array methods\n\
\tarr = [],\n\
\tpop = arr.pop,\n\
\tpush = arr.push,\n\
\tslice = arr.slice,\n\
\t// Use a stripped-down indexOf if we can't use a native one\n\
\tindexOf = arr.indexOf || function( elem ) {\n\
\t\tvar i = 0,\n\
\t\t\tlen = this.length;\n\
\t\tfor ( ; i < len; i++ ) {\n\
\t\t\tif ( this[i] === elem ) {\n\
\t\t\t\treturn i;\n\
\t\t\t}\n\
\t\t}\n\
\t\treturn -1;\n\
\t},\n\
\n\
\n\
\t// Regular expressions\n\
\n\
\t// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace\n\
\twhitespace = \"[\\\\x20\\\\t\\\\r\\\\n\
\\\\f]\",\n\
\t// http://www.w3.org/TR/css3-syntax/#characters\n\
\tcharacterEncoding = \"(?:\\\\\\\\.|[\\\\w-]|[^\\\\x00-\\\\xa0])+\",\n\
\n\
\t// Loosely modeled on CSS identifier characters\n\
\t// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors\n\
\t// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier\n\
\tidentifier = characterEncoding.replace( \"w\", \"w#\" ),\n\
\n\
\t// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors\n\
\toperators = \"([*^$|!~]?=)\",\n\
\tattributes = \"\\\\[\" + whitespace + \"*(\" + characterEncoding + \")\" + whitespace +\n\
\t\t\"*(?:\" + operators + whitespace + \"*(?:(['\\\"])((?:\\\\\\\\.|[^\\\\\\\\])*?)\\\\3|(\" + identifier + \")|)|)\" + whitespace + \"*\\\\]\",\n\
\n\
\t// Prefer arguments quoted,\n\
\t//   then not containing pseudos/brackets,\n\
\t//   then attribute selectors/non-parenthetical expressions,\n\
\t//   then anything else\n\
\t// These preferences are here to reduce the number of selectors\n\
\t//   needing tokenize in the PSEUDO preFilter\n\
\tpseudos = \":(\" + characterEncoding + \")(?:\\\\(((['\\\"])((?:\\\\\\\\.|[^\\\\\\\\])*?)\\\\3|((?:\\\\\\\\.|[^\\\\\\\\()[\\\\]]|\" + attributes.replace( 3, 8 ) + \")*)|.*)\\\\)|)\",\n\
\n\
\t// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter\n\
\trtrim = new RegExp( \"^\" + whitespace + \"+|((?:^|[^\\\\\\\\])(?:\\\\\\\\.)*)\" + whitespace + \"+$\", \"g\" ),\n\
\n\
\trcomma = new RegExp( \"^\" + whitespace + \"*,\" + whitespace + \"*\" ),\n\
\trcombinators = new RegExp( \"^\" + whitespace + \"*([\\\\x20\\\\t\\\\r\\\\n\
\\\\f>+~])\" + whitespace + \"*\" ),\n\
\trpseudo = new RegExp( pseudos ),\n\
\tridentifier = new RegExp( \"^\" + identifier + \"$\" ),\n\
\n\
\tmatchExpr = {\n\
\t\t\"ID\": new RegExp( \"^#(\" + characterEncoding + \")\" ),\n\
\t\t\"CLASS\": new RegExp( \"^\\\\.(\" + characterEncoding + \")\" ),\n\
\t\t\"NAME\": new RegExp( \"^\\\\[name=['\\\"]?(\" + characterEncoding + \")['\\\"]?\\\\]\" ),\n\
\t\t\"TAG\": new RegExp( \"^(\" + characterEncoding.replace( \"w\", \"w*\" ) + \")\" ),\n\
\t\t\"ATTR\": new RegExp( \"^\" + attributes ),\n\
\t\t\"PSEUDO\": new RegExp( \"^\" + pseudos ),\n\
\t\t\"CHILD\": new RegExp( \"^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\\\(\" + whitespace +\n\
\t\t\t\"*(even|odd|(([+-]|)(\\\\d*)n|)\" + whitespace + \"*(?:([+-]|)\" + whitespace +\n\
\t\t\t\"*(\\\\d+)|))\" + whitespace + \"*\\\\)|)\", \"i\" ),\n\
\t\t// For use in libraries implementing .is()\n\
\t\t// We use this for POS matching in `select`\n\
\t\t\"needsContext\": new RegExp( \"^\" + whitespace + \"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\\\(\" +\n\
\t\t\twhitespace + \"*((?:-\\\\d)?\\\\d*)\" + whitespace + \"*\\\\)|)(?=[^-]|$)\", \"i\" )\n\
\t},\n\
\n\
\trsibling = /[\\x20\\t\\r\\n\
\\f]*[+~]/,\n\
\n\
\trnative = /^[^{]+\\{\\s*\\[native code/,\n\
\n\
\t// Easily-parseable/retrievable ID or TAG or CLASS selectors\n\
\trquickExpr = /^(?:#([\\w-]+)|(\\w+)|\\.([\\w-]+))$/,\n\
\n\
\trinputs = /^(?:input|select|textarea|button)$/i,\n\
\trheader = /^h\\d$/i,\n\
\n\
\trescape = /'|\\\\/g,\n\
\trattributeQuotes = /\\=[\\x20\\t\\r\\n\
\\f]*([^'\"\\]]*)[\\x20\\t\\r\\n\
\\f]*\\]/g,\n\
\n\
\t// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters\n\
\trunescape = /\\\\([\\da-fA-F]{1,6}[\\x20\\t\\r\\n\
\\f]?|.)/g,\n\
\tfunescape = function( _, escaped ) {\n\
\t\tvar high = \"0x\" + escaped - 0x10000;\n\
\t\t// NaN means non-codepoint\n\
\t\treturn high !== high ?\n\
\t\t\tescaped :\n\
\t\t\t// BMP codepoint\n\
\t\t\thigh < 0 ?\n\
\t\t\t\tString.fromCharCode( high + 0x10000 ) :\n\
\t\t\t\t// Supplemental Plane codepoint (surrogate pair)\n\
\t\t\t\tString.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );\n\
\t};\n\
\n\
// Use a stripped-down slice if we can't use a native one\n\
try {\n\
\tslice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;\n\
} catch ( e ) {\n\
\tslice = function( i ) {\n\
\t\tvar elem,\n\
\t\t\tresults = [];\n\
\t\twhile ( (elem = this[i++]) ) {\n\
\t\t\tresults.push( elem );\n\
\t\t}\n\
\t\treturn results;\n\
\t};\n\
}\n\
\n\
/**\n\
 * For feature detection\n\
 * @param {Function} fn The function to test for native support\n\
 */\n\
function isNative( fn ) {\n\
\treturn rnative.test( fn + \"\" );\n\
}\n\
\n\
/**\n\
 * Create key-value caches of limited size\n\
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with\n\
 *\tproperty name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)\n\
 *\tdeleting the oldest entry\n\
 */\n\
function createCache() {\n\
\tvar cache,\n\
\t\tkeys = [];\n\
\n\
\treturn (cache = function( key, value ) {\n\
\t\t// Use (key + \" \") to avoid collision with native prototype properties (see Issue #157)\n\
\t\tif ( keys.push( key += \" \" ) > Expr.cacheLength ) {\n\
\t\t\t// Only keep the most recent entries\n\
\t\t\tdelete cache[ keys.shift() ];\n\
\t\t}\n\
\t\treturn (cache[ key ] = value);\n\
\t});\n\
}\n\
\n\
/**\n\
 * Mark a function for special use by Sizzle\n\
 * @param {Function} fn The function to mark\n\
 */\n\
function markFunction( fn ) {\n\
\tfn[ expando ] = true;\n\
\treturn fn;\n\
}\n\
\n\
/**\n\
 * Support testing using an element\n\
 * @param {Function} fn Passed the created div and expects a boolean result\n\
 */\n\
function assert( fn ) {\n\
\tvar div = document.createElement(\"div\");\n\
\n\
\ttry {\n\
\t\treturn fn( div );\n\
\t} catch (e) {\n\
\t\treturn false;\n\
\t} finally {\n\
\t\t// release memory in IE\n\
\t\tdiv = null;\n\
\t}\n\
}\n\
\n\
function Sizzle( selector, context, results, seed ) {\n\
\tvar match, elem, m, nodeType,\n\
\t\t// QSA vars\n\
\t\ti, groups, old, nid, newContext, newSelector;\n\
\n\
\tif ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {\n\
\t\tsetDocument( context );\n\
\t}\n\
\n\
\tcontext = context || document;\n\
\tresults = results || [];\n\
\n\
\tif ( !selector || typeof selector !== \"string\" ) {\n\
\t\treturn results;\n\
\t}\n\
\n\
\tif ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {\n\
\t\treturn [];\n\
\t}\n\
\n\
\tif ( !documentIsXML && !seed ) {\n\
\n\
\t\t// Shortcuts\n\
\t\tif ( (match = rquickExpr.exec( selector )) ) {\n\
\t\t\t// Speed-up: Sizzle(\"#ID\")\n\
\t\t\tif ( (m = match[1]) ) {\n\
\t\t\t\tif ( nodeType === 9 ) {\n\
\t\t\t\t\telem = context.getElementById( m );\n\
\t\t\t\t\t// Check parentNode to catch when Blackberry 4.6 returns\n\
\t\t\t\t\t// nodes that are no longer in the document #6963\n\
\t\t\t\t\tif ( elem && elem.parentNode ) {\n\
\t\t\t\t\t\t// Handle the case where IE, Opera, and Webkit return items\n\
\t\t\t\t\t\t// by name instead of ID\n\
\t\t\t\t\t\tif ( elem.id === m ) {\n\
\t\t\t\t\t\t\tresults.push( elem );\n\
\t\t\t\t\t\t\treturn results;\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t} else {\n\
\t\t\t\t\t\treturn results;\n\
\t\t\t\t\t}\n\
\t\t\t\t} else {\n\
\t\t\t\t\t// Context is not a document\n\
\t\t\t\t\tif ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&\n\
\t\t\t\t\t\tcontains( context, elem ) && elem.id === m ) {\n\
\t\t\t\t\t\tresults.push( elem );\n\
\t\t\t\t\t\treturn results;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\n\
\t\t\t// Speed-up: Sizzle(\"TAG\")\n\
\t\t\t} else if ( match[2] ) {\n\
\t\t\t\tpush.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );\n\
\t\t\t\treturn results;\n\
\n\
\t\t\t// Speed-up: Sizzle(\".CLASS\")\n\
\t\t\t} else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {\n\
\t\t\t\tpush.apply( results, slice.call(context.getElementsByClassName( m ), 0) );\n\
\t\t\t\treturn results;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// QSA path\n\
\t\tif ( support.qsa && !rbuggyQSA.test(selector) ) {\n\
\t\t\told = true;\n\
\t\t\tnid = expando;\n\
\t\t\tnewContext = context;\n\
\t\t\tnewSelector = nodeType === 9 && selector;\n\
\n\
\t\t\t// qSA works strangely on Element-rooted queries\n\
\t\t\t// We can work around this by specifying an extra ID on the root\n\
\t\t\t// and working up from there (Thanks to Andrew Dupont for the technique)\n\
\t\t\t// IE 8 doesn't work on object elements\n\
\t\t\tif ( nodeType === 1 && context.nodeName.toLowerCase() !== \"object\" ) {\n\
\t\t\t\tgroups = tokenize( selector );\n\
\n\
\t\t\t\tif ( (old = context.getAttribute(\"id\")) ) {\n\
\t\t\t\t\tnid = old.replace( rescape, \"\\\\$&\" );\n\
\t\t\t\t} else {\n\
\t\t\t\t\tcontext.setAttribute( \"id\", nid );\n\
\t\t\t\t}\n\
\t\t\t\tnid = \"[id='\" + nid + \"'] \";\n\
\n\
\t\t\t\ti = groups.length;\n\
\t\t\t\twhile ( i-- ) {\n\
\t\t\t\t\tgroups[i] = nid + toSelector( groups[i] );\n\
\t\t\t\t}\n\
\t\t\t\tnewContext = rsibling.test( selector ) && context.parentNode || context;\n\
\t\t\t\tnewSelector = groups.join(\",\");\n\
\t\t\t}\n\
\n\
\t\t\tif ( newSelector ) {\n\
\t\t\t\ttry {\n\
\t\t\t\t\tpush.apply( results, slice.call( newContext.querySelectorAll(\n\
\t\t\t\t\t\tnewSelector\n\
\t\t\t\t\t), 0 ) );\n\
\t\t\t\t\treturn results;\n\
\t\t\t\t} catch(qsaError) {\n\
\t\t\t\t} finally {\n\
\t\t\t\t\tif ( !old ) {\n\
\t\t\t\t\t\tcontext.removeAttribute(\"id\");\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\t// All others\n\
\treturn select( selector.replace( rtrim, \"$1\" ), context, results, seed );\n\
}\n\
\n\
/**\n\
 * Detect xml\n\
 * @param {Element|Object} elem An element or a document\n\
 */\n\
isXML = Sizzle.isXML = function( elem ) {\n\
\t// documentElement is verified for cases where it doesn't yet exist\n\
\t// (such as loading iframes in IE - #4833)\n\
\tvar documentElement = elem && (elem.ownerDocument || elem).documentElement;\n\
\treturn documentElement ? documentElement.nodeName !== \"HTML\" : false;\n\
};\n\
\n\
/**\n\
 * Sets document-related variables once based on the current document\n\
 * @param {Element|Object} [doc] An element or document object to use to set the document\n\
 * @returns {Object} Returns the current document\n\
 */\n\
setDocument = Sizzle.setDocument = function( node ) {\n\
\tvar doc = node ? node.ownerDocument || node : preferredDoc;\n\
\n\
\t// If no document and documentElement is available, return\n\
\tif ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {\n\
\t\treturn document;\n\
\t}\n\
\n\
\t// Set our document\n\
\tdocument = doc;\n\
\tdocElem = doc.documentElement;\n\
\n\
\t// Support tests\n\
\tdocumentIsXML = isXML( doc );\n\
\n\
\t// Check if getElementsByTagName(\"*\") returns only elements\n\
\tsupport.tagNameNoComments = assert(function( div ) {\n\
\t\tdiv.appendChild( doc.createComment(\"\") );\n\
\t\treturn !div.getElementsByTagName(\"*\").length;\n\
\t});\n\
\n\
\t// Check if attributes should be retrieved by attribute nodes\n\
\tsupport.attributes = assert(function( div ) {\n\
\t\tdiv.innerHTML = \"<select></select>\";\n\
\t\tvar type = typeof div.lastChild.getAttribute(\"multiple\");\n\
\t\t// IE8 returns a string for some attributes even when not present\n\
\t\treturn type !== \"boolean\" && type !== \"string\";\n\
\t});\n\
\n\
\t// Check if getElementsByClassName can be trusted\n\
\tsupport.getByClassName = assert(function( div ) {\n\
\t\t// Opera can't find a second classname (in 9.6)\n\
\t\tdiv.innerHTML = \"<div class='hidden e'></div><div class='hidden'></div>\";\n\
\t\tif ( !div.getElementsByClassName || !div.getElementsByClassName(\"e\").length ) {\n\
\t\t\treturn false;\n\
\t\t}\n\
\n\
\t\t// Safari 3.2 caches class attributes and doesn't catch changes\n\
\t\tdiv.lastChild.className = \"e\";\n\
\t\treturn div.getElementsByClassName(\"e\").length === 2;\n\
\t});\n\
\n\
\t// Check if getElementById returns elements by name\n\
\t// Check if getElementsByName privileges form controls or returns elements by ID\n\
\tsupport.getByName = assert(function( div ) {\n\
\t\t// Inject content\n\
\t\tdiv.id = expando + 0;\n\
\t\tdiv.innerHTML = \"<a name='\" + expando + \"'></a><div name='\" + expando + \"'></div>\";\n\
\t\tdocElem.insertBefore( div, docElem.firstChild );\n\
\n\
\t\t// Test\n\
\t\tvar pass = doc.getElementsByName &&\n\
\t\t\t// buggy browsers will return fewer than the correct 2\n\
\t\t\tdoc.getElementsByName( expando ).length === 2 +\n\
\t\t\t// buggy browsers will return more than the correct 0\n\
\t\t\tdoc.getElementsByName( expando + 0 ).length;\n\
\t\tsupport.getIdNotName = !doc.getElementById( expando );\n\
\n\
\t\t// Cleanup\n\
\t\tdocElem.removeChild( div );\n\
\n\
\t\treturn pass;\n\
\t});\n\
\n\
\t// IE6/7 return modified attributes\n\
\tExpr.attrHandle = assert(function( div ) {\n\
\t\tdiv.innerHTML = \"<a href='#'></a>\";\n\
\t\treturn div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&\n\
\t\t\tdiv.firstChild.getAttribute(\"href\") === \"#\";\n\
\t}) ?\n\
\t\t{} :\n\
\t\t{\n\
\t\t\t\"href\": function( elem ) {\n\
\t\t\t\treturn elem.getAttribute( \"href\", 2 );\n\
\t\t\t},\n\
\t\t\t\"type\": function( elem ) {\n\
\t\t\t\treturn elem.getAttribute(\"type\");\n\
\t\t\t}\n\
\t\t};\n\
\n\
\t// ID find and filter\n\
\tif ( support.getIdNotName ) {\n\
\t\tExpr.find[\"ID\"] = function( id, context ) {\n\
\t\t\tif ( typeof context.getElementById !== strundefined && !documentIsXML ) {\n\
\t\t\t\tvar m = context.getElementById( id );\n\
\t\t\t\t// Check parentNode to catch when Blackberry 4.6 returns\n\
\t\t\t\t// nodes that are no longer in the document #6963\n\
\t\t\t\treturn m && m.parentNode ? [m] : [];\n\
\t\t\t}\n\
\t\t};\n\
\t\tExpr.filter[\"ID\"] = function( id ) {\n\
\t\t\tvar attrId = id.replace( runescape, funescape );\n\
\t\t\treturn function( elem ) {\n\
\t\t\t\treturn elem.getAttribute(\"id\") === attrId;\n\
\t\t\t};\n\
\t\t};\n\
\t} else {\n\
\t\tExpr.find[\"ID\"] = function( id, context ) {\n\
\t\t\tif ( typeof context.getElementById !== strundefined && !documentIsXML ) {\n\
\t\t\t\tvar m = context.getElementById( id );\n\
\n\
\t\t\t\treturn m ?\n\
\t\t\t\t\tm.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode(\"id\").value === id ?\n\
\t\t\t\t\t\t[m] :\n\
\t\t\t\t\t\tundefined :\n\
\t\t\t\t\t[];\n\
\t\t\t}\n\
\t\t};\n\
\t\tExpr.filter[\"ID\"] =  function( id ) {\n\
\t\t\tvar attrId = id.replace( runescape, funescape );\n\
\t\t\treturn function( elem ) {\n\
\t\t\t\tvar node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode(\"id\");\n\
\t\t\t\treturn node && node.value === attrId;\n\
\t\t\t};\n\
\t\t};\n\
\t}\n\
\n\
\t// Tag\n\
\tExpr.find[\"TAG\"] = support.tagNameNoComments ?\n\
\t\tfunction( tag, context ) {\n\
\t\t\tif ( typeof context.getElementsByTagName !== strundefined ) {\n\
\t\t\t\treturn context.getElementsByTagName( tag );\n\
\t\t\t}\n\
\t\t} :\n\
\t\tfunction( tag, context ) {\n\
\t\t\tvar elem,\n\
\t\t\t\ttmp = [],\n\
\t\t\t\ti = 0,\n\
\t\t\t\tresults = context.getElementsByTagName( tag );\n\
\n\
\t\t\t// Filter out possible comments\n\
\t\t\tif ( tag === \"*\" ) {\n\
\t\t\t\twhile ( (elem = results[i++]) ) {\n\
\t\t\t\t\tif ( elem.nodeType === 1 ) {\n\
\t\t\t\t\t\ttmp.push( elem );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\n\
\t\t\t\treturn tmp;\n\
\t\t\t}\n\
\t\t\treturn results;\n\
\t\t};\n\
\n\
\t// Name\n\
\tExpr.find[\"NAME\"] = support.getByName && function( tag, context ) {\n\
\t\tif ( typeof context.getElementsByName !== strundefined ) {\n\
\t\t\treturn context.getElementsByName( name );\n\
\t\t}\n\
\t};\n\
\n\
\t// Class\n\
\tExpr.find[\"CLASS\"] = support.getByClassName && function( className, context ) {\n\
\t\tif ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {\n\
\t\t\treturn context.getElementsByClassName( className );\n\
\t\t}\n\
\t};\n\
\n\
\t// QSA and matchesSelector support\n\
\n\
\t// matchesSelector(:active) reports false when true (IE9/Opera 11.5)\n\
\trbuggyMatches = [];\n\
\n\
\t// qSa(:focus) reports false when true (Chrome 21),\n\
\t// no need to also add to buggyMatches since matches checks buggyQSA\n\
\t// A support test would require too much code (would include document ready)\n\
\trbuggyQSA = [ \":focus\" ];\n\
\n\
\tif ( (support.qsa = isNative(doc.querySelectorAll)) ) {\n\
\t\t// Build QSA regex\n\
\t\t// Regex strategy adopted from Diego Perini\n\
\t\tassert(function( div ) {\n\
\t\t\t// Select is set to empty string on purpose\n\
\t\t\t// This is to test IE's treatment of not explictly\n\
\t\t\t// setting a boolean content attribute,\n\
\t\t\t// since its presence should be enough\n\
\t\t\t// http://bugs.jquery.com/ticket/12359\n\
\t\t\tdiv.innerHTML = \"<select><option selected=''></option></select>\";\n\
\n\
\t\t\t// IE8 - Some boolean attributes are not treated correctly\n\
\t\t\tif ( !div.querySelectorAll(\"[selected]\").length ) {\n\
\t\t\t\trbuggyQSA.push( \"\\\\[\" + whitespace + \"*(?:checked|disabled|ismap|multiple|readonly|selected|value)\" );\n\
\t\t\t}\n\
\n\
\t\t\t// Webkit/Opera - :checked should return selected option elements\n\
\t\t\t// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked\n\
\t\t\t// IE8 throws error here and will not see later tests\n\
\t\t\tif ( !div.querySelectorAll(\":checked\").length ) {\n\
\t\t\t\trbuggyQSA.push(\":checked\");\n\
\t\t\t}\n\
\t\t});\n\
\n\
\t\tassert(function( div ) {\n\
\n\
\t\t\t// Opera 10-12/IE8 - ^= $= *= and empty values\n\
\t\t\t// Should not select anything\n\
\t\t\tdiv.innerHTML = \"<input type='hidden' i=''/>\";\n\
\t\t\tif ( div.querySelectorAll(\"[i^='']\").length ) {\n\
\t\t\t\trbuggyQSA.push( \"[*^$]=\" + whitespace + \"*(?:\\\"\\\"|'')\" );\n\
\t\t\t}\n\
\n\
\t\t\t// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)\n\
\t\t\t// IE8 throws error here and will not see later tests\n\
\t\t\tif ( !div.querySelectorAll(\":enabled\").length ) {\n\
\t\t\t\trbuggyQSA.push( \":enabled\", \":disabled\" );\n\
\t\t\t}\n\
\n\
\t\t\t// Opera 10-11 does not throw on post-comma invalid pseudos\n\
\t\t\tdiv.querySelectorAll(\"*,:x\");\n\
\t\t\trbuggyQSA.push(\",.*:\");\n\
\t\t});\n\
\t}\n\
\n\
\tif ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||\n\
\t\tdocElem.mozMatchesSelector ||\n\
\t\tdocElem.webkitMatchesSelector ||\n\
\t\tdocElem.oMatchesSelector ||\n\
\t\tdocElem.msMatchesSelector) )) ) {\n\
\n\
\t\tassert(function( div ) {\n\
\t\t\t// Check to see if it's possible to do matchesSelector\n\
\t\t\t// on a disconnected node (IE 9)\n\
\t\t\tsupport.disconnectedMatch = matches.call( div, \"div\" );\n\
\n\
\t\t\t// This should fail with an exception\n\
\t\t\t// Gecko does not error, returns false instead\n\
\t\t\tmatches.call( div, \"[s!='']:x\" );\n\
\t\t\trbuggyMatches.push( \"!=\", pseudos );\n\
\t\t});\n\
\t}\n\
\n\
\trbuggyQSA = new RegExp( rbuggyQSA.join(\"|\") );\n\
\trbuggyMatches = new RegExp( rbuggyMatches.join(\"|\") );\n\
\n\
\t// Element contains another\n\
\t// Purposefully does not implement inclusive descendent\n\
\t// As in, an element does not contain itself\n\
\tcontains = isNative(docElem.contains) || docElem.compareDocumentPosition ?\n\
\t\tfunction( a, b ) {\n\
\t\t\tvar adown = a.nodeType === 9 ? a.documentElement : a,\n\
\t\t\t\tbup = b && b.parentNode;\n\
\t\t\treturn a === bup || !!( bup && bup.nodeType === 1 && (\n\
\t\t\t\tadown.contains ?\n\
\t\t\t\t\tadown.contains( bup ) :\n\
\t\t\t\t\ta.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16\n\
\t\t\t));\n\
\t\t} :\n\
\t\tfunction( a, b ) {\n\
\t\t\tif ( b ) {\n\
\t\t\t\twhile ( (b = b.parentNode) ) {\n\
\t\t\t\t\tif ( b === a ) {\n\
\t\t\t\t\t\treturn true;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t\treturn false;\n\
\t\t};\n\
\n\
\t// Document order sorting\n\
\tsortOrder = docElem.compareDocumentPosition ?\n\
\tfunction( a, b ) {\n\
\t\tvar compare;\n\
\n\
\t\tif ( a === b ) {\n\
\t\t\thasDuplicate = true;\n\
\t\t\treturn 0;\n\
\t\t}\n\
\n\
\t\tif ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {\n\
\t\t\tif ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {\n\
\t\t\t\tif ( a === doc || contains( preferredDoc, a ) ) {\n\
\t\t\t\t\treturn -1;\n\
\t\t\t\t}\n\
\t\t\t\tif ( b === doc || contains( preferredDoc, b ) ) {\n\
\t\t\t\t\treturn 1;\n\
\t\t\t\t}\n\
\t\t\t\treturn 0;\n\
\t\t\t}\n\
\t\t\treturn compare & 4 ? -1 : 1;\n\
\t\t}\n\
\n\
\t\treturn a.compareDocumentPosition ? -1 : 1;\n\
\t} :\n\
\tfunction( a, b ) {\n\
\t\tvar cur,\n\
\t\t\ti = 0,\n\
\t\t\taup = a.parentNode,\n\
\t\t\tbup = b.parentNode,\n\
\t\t\tap = [ a ],\n\
\t\t\tbp = [ b ];\n\
\n\
\t\t// Exit early if the nodes are identical\n\
\t\tif ( a === b ) {\n\
\t\t\thasDuplicate = true;\n\
\t\t\treturn 0;\n\
\n\
\t\t// Parentless nodes are either documents or disconnected\n\
\t\t} else if ( !aup || !bup ) {\n\
\t\t\treturn a === doc ? -1 :\n\
\t\t\t\tb === doc ? 1 :\n\
\t\t\t\taup ? -1 :\n\
\t\t\t\tbup ? 1 :\n\
\t\t\t\t0;\n\
\n\
\t\t// If the nodes are siblings, we can do a quick check\n\
\t\t} else if ( aup === bup ) {\n\
\t\t\treturn siblingCheck( a, b );\n\
\t\t}\n\
\n\
\t\t// Otherwise we need full lists of their ancestors for comparison\n\
\t\tcur = a;\n\
\t\twhile ( (cur = cur.parentNode) ) {\n\
\t\t\tap.unshift( cur );\n\
\t\t}\n\
\t\tcur = b;\n\
\t\twhile ( (cur = cur.parentNode) ) {\n\
\t\t\tbp.unshift( cur );\n\
\t\t}\n\
\n\
\t\t// Walk down the tree looking for a discrepancy\n\
\t\twhile ( ap[i] === bp[i] ) {\n\
\t\t\ti++;\n\
\t\t}\n\
\n\
\t\treturn i ?\n\
\t\t\t// Do a sibling check if the nodes have a common ancestor\n\
\t\t\tsiblingCheck( ap[i], bp[i] ) :\n\
\n\
\t\t\t// Otherwise nodes in our document sort first\n\
\t\t\tap[i] === preferredDoc ? -1 :\n\
\t\t\tbp[i] === preferredDoc ? 1 :\n\
\t\t\t0;\n\
\t};\n\
\n\
\t// Always assume the presence of duplicates if sort doesn't\n\
\t// pass them to our comparison function (as in Google Chrome).\n\
\thasDuplicate = false;\n\
\t[0, 0].sort( sortOrder );\n\
\tsupport.detectDuplicates = hasDuplicate;\n\
\n\
\treturn document;\n\
};\n\
\n\
Sizzle.matches = function( expr, elements ) {\n\
\treturn Sizzle( expr, null, null, elements );\n\
};\n\
\n\
Sizzle.matchesSelector = function( elem, expr ) {\n\
\t// Set document vars if needed\n\
\tif ( ( elem.ownerDocument || elem ) !== document ) {\n\
\t\tsetDocument( elem );\n\
\t}\n\
\n\
\t// Make sure that attribute selectors are quoted\n\
\texpr = expr.replace( rattributeQuotes, \"='$1']\" );\n\
\n\
\t// rbuggyQSA always contains :focus, so no need for an existence check\n\
\tif ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {\n\
\t\ttry {\n\
\t\t\tvar ret = matches.call( elem, expr );\n\
\n\
\t\t\t// IE 9's matchesSelector returns false on disconnected nodes\n\
\t\t\tif ( ret || support.disconnectedMatch ||\n\
\t\t\t\t\t// As well, disconnected nodes are said to be in a document\n\
\t\t\t\t\t// fragment in IE 9\n\
\t\t\t\t\telem.document && elem.document.nodeType !== 11 ) {\n\
\t\t\t\treturn ret;\n\
\t\t\t}\n\
\t\t} catch(e) {}\n\
\t}\n\
\n\
\treturn Sizzle( expr, document, null, [elem] ).length > 0;\n\
};\n\
\n\
Sizzle.contains = function( context, elem ) {\n\
\t// Set document vars if needed\n\
\tif ( ( context.ownerDocument || context ) !== document ) {\n\
\t\tsetDocument( context );\n\
\t}\n\
\treturn contains( context, elem );\n\
};\n\
\n\
Sizzle.attr = function( elem, name ) {\n\
\tvar val;\n\
\n\
\t// Set document vars if needed\n\
\tif ( ( elem.ownerDocument || elem ) !== document ) {\n\
\t\tsetDocument( elem );\n\
\t}\n\
\n\
\tif ( !documentIsXML ) {\n\
\t\tname = name.toLowerCase();\n\
\t}\n\
\tif ( (val = Expr.attrHandle[ name ]) ) {\n\
\t\treturn val( elem );\n\
\t}\n\
\tif ( documentIsXML || support.attributes ) {\n\
\t\treturn elem.getAttribute( name );\n\
\t}\n\
\treturn ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?\n\
\t\tname :\n\
\t\tval && val.specified ? val.value : null;\n\
};\n\
\n\
Sizzle.error = function( msg ) {\n\
\tthrow new Error( \"Syntax error, unrecognized expression: \" + msg );\n\
};\n\
\n\
// Document sorting and removing duplicates\n\
Sizzle.uniqueSort = function( results ) {\n\
\tvar elem,\n\
\t\tduplicates = [],\n\
\t\ti = 1,\n\
\t\tj = 0;\n\
\n\
\t// Unless we *know* we can detect duplicates, assume their presence\n\
\thasDuplicate = !support.detectDuplicates;\n\
\tresults.sort( sortOrder );\n\
\n\
\tif ( hasDuplicate ) {\n\
\t\tfor ( ; (elem = results[i]); i++ ) {\n\
\t\t\tif ( elem === results[ i - 1 ] ) {\n\
\t\t\t\tj = duplicates.push( i );\n\
\t\t\t}\n\
\t\t}\n\
\t\twhile ( j-- ) {\n\
\t\t\tresults.splice( duplicates[ j ], 1 );\n\
\t\t}\n\
\t}\n\
\n\
\treturn results;\n\
};\n\
\n\
function siblingCheck( a, b ) {\n\
\tvar cur = b && a,\n\
\t\tdiff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );\n\
\n\
\t// Use IE sourceIndex if available on both nodes\n\
\tif ( diff ) {\n\
\t\treturn diff;\n\
\t}\n\
\n\
\t// Check if b follows a\n\
\tif ( cur ) {\n\
\t\twhile ( (cur = cur.nextSibling) ) {\n\
\t\t\tif ( cur === b ) {\n\
\t\t\t\treturn -1;\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\treturn a ? 1 : -1;\n\
}\n\
\n\
// Returns a function to use in pseudos for input types\n\
function createInputPseudo( type ) {\n\
\treturn function( elem ) {\n\
\t\tvar name = elem.nodeName.toLowerCase();\n\
\t\treturn name === \"input\" && elem.type === type;\n\
\t};\n\
}\n\
\n\
// Returns a function to use in pseudos for buttons\n\
function createButtonPseudo( type ) {\n\
\treturn function( elem ) {\n\
\t\tvar name = elem.nodeName.toLowerCase();\n\
\t\treturn (name === \"input\" || name === \"button\") && elem.type === type;\n\
\t};\n\
}\n\
\n\
// Returns a function to use in pseudos for positionals\n\
function createPositionalPseudo( fn ) {\n\
\treturn markFunction(function( argument ) {\n\
\t\targument = +argument;\n\
\t\treturn markFunction(function( seed, matches ) {\n\
\t\t\tvar j,\n\
\t\t\t\tmatchIndexes = fn( [], seed.length, argument ),\n\
\t\t\t\ti = matchIndexes.length;\n\
\n\
\t\t\t// Match elements found at the specified indexes\n\
\t\t\twhile ( i-- ) {\n\
\t\t\t\tif ( seed[ (j = matchIndexes[i]) ] ) {\n\
\t\t\t\t\tseed[j] = !(matches[j] = seed[j]);\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t});\n\
\t});\n\
}\n\
\n\
/**\n\
 * Utility function for retrieving the text value of an array of DOM nodes\n\
 * @param {Array|Element} elem\n\
 */\n\
getText = Sizzle.getText = function( elem ) {\n\
\tvar node,\n\
\t\tret = \"\",\n\
\t\ti = 0,\n\
\t\tnodeType = elem.nodeType;\n\
\n\
\tif ( !nodeType ) {\n\
\t\t// If no nodeType, this is expected to be an array\n\
\t\tfor ( ; (node = elem[i]); i++ ) {\n\
\t\t\t// Do not traverse comment nodes\n\
\t\t\tret += getText( node );\n\
\t\t}\n\
\t} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {\n\
\t\t// Use textContent for elements\n\
\t\t// innerText usage removed for consistency of new lines (see #11153)\n\
\t\tif ( typeof elem.textContent === \"string\" ) {\n\
\t\t\treturn elem.textContent;\n\
\t\t} else {\n\
\t\t\t// Traverse its children\n\
\t\t\tfor ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {\n\
\t\t\t\tret += getText( elem );\n\
\t\t\t}\n\
\t\t}\n\
\t} else if ( nodeType === 3 || nodeType === 4 ) {\n\
\t\treturn elem.nodeValue;\n\
\t}\n\
\t// Do not include comment or processing instruction nodes\n\
\n\
\treturn ret;\n\
};\n\
\n\
Expr = Sizzle.selectors = {\n\
\n\
\t// Can be adjusted by the user\n\
\tcacheLength: 50,\n\
\n\
\tcreatePseudo: markFunction,\n\
\n\
\tmatch: matchExpr,\n\
\n\
\tfind: {},\n\
\n\
\trelative: {\n\
\t\t\">\": { dir: \"parentNode\", first: true },\n\
\t\t\" \": { dir: \"parentNode\" },\n\
\t\t\"+\": { dir: \"previousSibling\", first: true },\n\
\t\t\"~\": { dir: \"previousSibling\" }\n\
\t},\n\
\n\
\tpreFilter: {\n\
\t\t\"ATTR\": function( match ) {\n\
\t\t\tmatch[1] = match[1].replace( runescape, funescape );\n\
\n\
\t\t\t// Move the given value to match[3] whether quoted or unquoted\n\
\t\t\tmatch[3] = ( match[4] || match[5] || \"\" ).replace( runescape, funescape );\n\
\n\
\t\t\tif ( match[2] === \"~=\" ) {\n\
\t\t\t\tmatch[3] = \" \" + match[3] + \" \";\n\
\t\t\t}\n\
\n\
\t\t\treturn match.slice( 0, 4 );\n\
\t\t},\n\
\n\
\t\t\"CHILD\": function( match ) {\n\
\t\t\t/* matches from matchExpr[\"CHILD\"]\n\
\t\t\t\t1 type (only|nth|...)\n\
\t\t\t\t2 what (child|of-type)\n\
\t\t\t\t3 argument (even|odd|\\d*|\\d*n([+-]\\d+)?|...)\n\
\t\t\t\t4 xn-component of xn+y argument ([+-]?\\d*n|)\n\
\t\t\t\t5 sign of xn-component\n\
\t\t\t\t6 x of xn-component\n\
\t\t\t\t7 sign of y-component\n\
\t\t\t\t8 y of y-component\n\
\t\t\t*/\n\
\t\t\tmatch[1] = match[1].toLowerCase();\n\
\n\
\t\t\tif ( match[1].slice( 0, 3 ) === \"nth\" ) {\n\
\t\t\t\t// nth-* requires argument\n\
\t\t\t\tif ( !match[3] ) {\n\
\t\t\t\t\tSizzle.error( match[0] );\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// numeric x and y parameters for Expr.filter.CHILD\n\
\t\t\t\t// remember that false/true cast respectively to 0/1\n\
\t\t\t\tmatch[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === \"even\" || match[3] === \"odd\" ) );\n\
\t\t\t\tmatch[5] = +( ( match[7] + match[8] ) || match[3] === \"odd\" );\n\
\n\
\t\t\t// other types prohibit arguments\n\
\t\t\t} else if ( match[3] ) {\n\
\t\t\t\tSizzle.error( match[0] );\n\
\t\t\t}\n\
\n\
\t\t\treturn match;\n\
\t\t},\n\
\n\
\t\t\"PSEUDO\": function( match ) {\n\
\t\t\tvar excess,\n\
\t\t\t\tunquoted = !match[5] && match[2];\n\
\n\
\t\t\tif ( matchExpr[\"CHILD\"].test( match[0] ) ) {\n\
\t\t\t\treturn null;\n\
\t\t\t}\n\
\n\
\t\t\t// Accept quoted arguments as-is\n\
\t\t\tif ( match[4] ) {\n\
\t\t\t\tmatch[2] = match[4];\n\
\n\
\t\t\t// Strip excess characters from unquoted arguments\n\
\t\t\t} else if ( unquoted && rpseudo.test( unquoted ) &&\n\
\t\t\t\t// Get excess from tokenize (recursively)\n\
\t\t\t\t(excess = tokenize( unquoted, true )) &&\n\
\t\t\t\t// advance to the next closing parenthesis\n\
\t\t\t\t(excess = unquoted.indexOf( \")\", unquoted.length - excess ) - unquoted.length) ) {\n\
\n\
\t\t\t\t// excess is a negative index\n\
\t\t\t\tmatch[0] = match[0].slice( 0, excess );\n\
\t\t\t\tmatch[2] = unquoted.slice( 0, excess );\n\
\t\t\t}\n\
\n\
\t\t\t// Return only captures needed by the pseudo filter method (type and argument)\n\
\t\t\treturn match.slice( 0, 3 );\n\
\t\t}\n\
\t},\n\
\n\
\tfilter: {\n\
\n\
\t\t\"TAG\": function( nodeName ) {\n\
\t\t\tif ( nodeName === \"*\" ) {\n\
\t\t\t\treturn function() { return true; };\n\
\t\t\t}\n\
\n\
\t\t\tnodeName = nodeName.replace( runescape, funescape ).toLowerCase();\n\
\t\t\treturn function( elem ) {\n\
\t\t\t\treturn elem.nodeName && elem.nodeName.toLowerCase() === nodeName;\n\
\t\t\t};\n\
\t\t},\n\
\n\
\t\t\"CLASS\": function( className ) {\n\
\t\t\tvar pattern = classCache[ className + \" \" ];\n\
\n\
\t\t\treturn pattern ||\n\
\t\t\t\t(pattern = new RegExp( \"(^|\" + whitespace + \")\" + className + \"(\" + whitespace + \"|$)\" )) &&\n\
\t\t\t\tclassCache( className, function( elem ) {\n\
\t\t\t\t\treturn pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute(\"class\")) || \"\" );\n\
\t\t\t\t});\n\
\t\t},\n\
\n\
\t\t\"ATTR\": function( name, operator, check ) {\n\
\t\t\treturn function( elem ) {\n\
\t\t\t\tvar result = Sizzle.attr( elem, name );\n\
\n\
\t\t\t\tif ( result == null ) {\n\
\t\t\t\t\treturn operator === \"!=\";\n\
\t\t\t\t}\n\
\t\t\t\tif ( !operator ) {\n\
\t\t\t\t\treturn true;\n\
\t\t\t\t}\n\
\n\
\t\t\t\tresult += \"\";\n\
\n\
\t\t\t\treturn operator === \"=\" ? result === check :\n\
\t\t\t\t\toperator === \"!=\" ? result !== check :\n\
\t\t\t\t\toperator === \"^=\" ? check && result.indexOf( check ) === 0 :\n\
\t\t\t\t\toperator === \"*=\" ? check && result.indexOf( check ) > -1 :\n\
\t\t\t\t\toperator === \"$=\" ? check && result.slice( -check.length ) === check :\n\
\t\t\t\t\toperator === \"~=\" ? ( \" \" + result + \" \" ).indexOf( check ) > -1 :\n\
\t\t\t\t\toperator === \"|=\" ? result === check || result.slice( 0, check.length + 1 ) === check + \"-\" :\n\
\t\t\t\t\tfalse;\n\
\t\t\t};\n\
\t\t},\n\
\n\
\t\t\"CHILD\": function( type, what, argument, first, last ) {\n\
\t\t\tvar simple = type.slice( 0, 3 ) !== \"nth\",\n\
\t\t\t\tforward = type.slice( -4 ) !== \"last\",\n\
\t\t\t\tofType = what === \"of-type\";\n\
\n\
\t\t\treturn first === 1 && last === 0 ?\n\
\n\
\t\t\t\t// Shortcut for :nth-*(n)\n\
\t\t\t\tfunction( elem ) {\n\
\t\t\t\t\treturn !!elem.parentNode;\n\
\t\t\t\t} :\n\
\n\
\t\t\t\tfunction( elem, context, xml ) {\n\
\t\t\t\t\tvar cache, outerCache, node, diff, nodeIndex, start,\n\
\t\t\t\t\t\tdir = simple !== forward ? \"nextSibling\" : \"previousSibling\",\n\
\t\t\t\t\t\tparent = elem.parentNode,\n\
\t\t\t\t\t\tname = ofType && elem.nodeName.toLowerCase(),\n\
\t\t\t\t\t\tuseCache = !xml && !ofType;\n\
\n\
\t\t\t\t\tif ( parent ) {\n\
\n\
\t\t\t\t\t\t// :(first|last|only)-(child|of-type)\n\
\t\t\t\t\t\tif ( simple ) {\n\
\t\t\t\t\t\t\twhile ( dir ) {\n\
\t\t\t\t\t\t\t\tnode = elem;\n\
\t\t\t\t\t\t\t\twhile ( (node = node[ dir ]) ) {\n\
\t\t\t\t\t\t\t\t\tif ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {\n\
\t\t\t\t\t\t\t\t\t\treturn false;\n\
\t\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t\t// Reverse direction for :only-* (if we haven't yet done so)\n\
\t\t\t\t\t\t\t\tstart = dir = type === \"only\" && !start && \"nextSibling\";\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\treturn true;\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\tstart = [ forward ? parent.firstChild : parent.lastChild ];\n\
\n\
\t\t\t\t\t\t// non-xml :nth-child(...) stores cache data on `parent`\n\
\t\t\t\t\t\tif ( forward && useCache ) {\n\
\t\t\t\t\t\t\t// Seek `elem` from a previously-cached index\n\
\t\t\t\t\t\t\touterCache = parent[ expando ] || (parent[ expando ] = {});\n\
\t\t\t\t\t\t\tcache = outerCache[ type ] || [];\n\
\t\t\t\t\t\t\tnodeIndex = cache[0] === dirruns && cache[1];\n\
\t\t\t\t\t\t\tdiff = cache[0] === dirruns && cache[2];\n\
\t\t\t\t\t\t\tnode = nodeIndex && parent.childNodes[ nodeIndex ];\n\
\n\
\t\t\t\t\t\t\twhile ( (node = ++nodeIndex && node && node[ dir ] ||\n\
\n\
\t\t\t\t\t\t\t\t// Fallback to seeking `elem` from the start\n\
\t\t\t\t\t\t\t\t(diff = nodeIndex = 0) || start.pop()) ) {\n\
\n\
\t\t\t\t\t\t\t\t// When found, cache indexes on `parent` and break\n\
\t\t\t\t\t\t\t\tif ( node.nodeType === 1 && ++diff && node === elem ) {\n\
\t\t\t\t\t\t\t\t\touterCache[ type ] = [ dirruns, nodeIndex, diff ];\n\
\t\t\t\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t// Use previously-cached element index if available\n\
\t\t\t\t\t\t} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {\n\
\t\t\t\t\t\t\tdiff = cache[1];\n\
\n\
\t\t\t\t\t\t// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)\n\
\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\t// Use the same loop as above to seek `elem` from the start\n\
\t\t\t\t\t\t\twhile ( (node = ++nodeIndex && node && node[ dir ] ||\n\
\t\t\t\t\t\t\t\t(diff = nodeIndex = 0) || start.pop()) ) {\n\
\n\
\t\t\t\t\t\t\t\tif ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {\n\
\t\t\t\t\t\t\t\t\t// Cache the index of each encountered element\n\
\t\t\t\t\t\t\t\t\tif ( useCache ) {\n\
\t\t\t\t\t\t\t\t\t\t(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];\n\
\t\t\t\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t\t\t\tif ( node === elem ) {\n\
\t\t\t\t\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t// Incorporate the offset, then check against cycle size\n\
\t\t\t\t\t\tdiff -= last;\n\
\t\t\t\t\t\treturn diff === first || ( diff % first === 0 && diff / first >= 0 );\n\
\t\t\t\t\t}\n\
\t\t\t\t};\n\
\t\t},\n\
\n\
\t\t\"PSEUDO\": function( pseudo, argument ) {\n\
\t\t\t// pseudo-class names are case-insensitive\n\
\t\t\t// http://www.w3.org/TR/selectors/#pseudo-classes\n\
\t\t\t// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters\n\
\t\t\t// Remember that setFilters inherits from pseudos\n\
\t\t\tvar args,\n\
\t\t\t\tfn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||\n\
\t\t\t\t\tSizzle.error( \"unsupported pseudo: \" + pseudo );\n\
\n\
\t\t\t// The user may use createPseudo to indicate that\n\
\t\t\t// arguments are needed to create the filter function\n\
\t\t\t// just as Sizzle does\n\
\t\t\tif ( fn[ expando ] ) {\n\
\t\t\t\treturn fn( argument );\n\
\t\t\t}\n\
\n\
\t\t\t// But maintain support for old signatures\n\
\t\t\tif ( fn.length > 1 ) {\n\
\t\t\t\targs = [ pseudo, pseudo, \"\", argument ];\n\
\t\t\t\treturn Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?\n\
\t\t\t\t\tmarkFunction(function( seed, matches ) {\n\
\t\t\t\t\t\tvar idx,\n\
\t\t\t\t\t\t\tmatched = fn( seed, argument ),\n\
\t\t\t\t\t\t\ti = matched.length;\n\
\t\t\t\t\t\twhile ( i-- ) {\n\
\t\t\t\t\t\t\tidx = indexOf.call( seed, matched[i] );\n\
\t\t\t\t\t\t\tseed[ idx ] = !( matches[ idx ] = matched[i] );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}) :\n\
\t\t\t\t\tfunction( elem ) {\n\
\t\t\t\t\t\treturn fn( elem, 0, args );\n\
\t\t\t\t\t};\n\
\t\t\t}\n\
\n\
\t\t\treturn fn;\n\
\t\t}\n\
\t},\n\
\n\
\tpseudos: {\n\
\t\t// Potentially complex pseudos\n\
\t\t\"not\": markFunction(function( selector ) {\n\
\t\t\t// Trim the selector passed to compile\n\
\t\t\t// to avoid treating leading and trailing\n\
\t\t\t// spaces as combinators\n\
\t\t\tvar input = [],\n\
\t\t\t\tresults = [],\n\
\t\t\t\tmatcher = compile( selector.replace( rtrim, \"$1\" ) );\n\
\n\
\t\t\treturn matcher[ expando ] ?\n\
\t\t\t\tmarkFunction(function( seed, matches, context, xml ) {\n\
\t\t\t\t\tvar elem,\n\
\t\t\t\t\t\tunmatched = matcher( seed, null, xml, [] ),\n\
\t\t\t\t\t\ti = seed.length;\n\
\n\
\t\t\t\t\t// Match elements unmatched by `matcher`\n\
\t\t\t\t\twhile ( i-- ) {\n\
\t\t\t\t\t\tif ( (elem = unmatched[i]) ) {\n\
\t\t\t\t\t\t\tseed[i] = !(matches[i] = elem);\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t}) :\n\
\t\t\t\tfunction( elem, context, xml ) {\n\
\t\t\t\t\tinput[0] = elem;\n\
\t\t\t\t\tmatcher( input, null, xml, results );\n\
\t\t\t\t\treturn !results.pop();\n\
\t\t\t\t};\n\
\t\t}),\n\
\n\
\t\t\"has\": markFunction(function( selector ) {\n\
\t\t\treturn function( elem ) {\n\
\t\t\t\treturn Sizzle( selector, elem ).length > 0;\n\
\t\t\t};\n\
\t\t}),\n\
\n\
\t\t\"contains\": markFunction(function( text ) {\n\
\t\t\treturn function( elem ) {\n\
\t\t\t\treturn ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;\n\
\t\t\t};\n\
\t\t}),\n\
\n\
\t\t// \"Whether an element is represented by a :lang() selector\n\
\t\t// is based solely on the element's language value\n\
\t\t// being equal to the identifier C,\n\
\t\t// or beginning with the identifier C immediately followed by \"-\".\n\
\t\t// The matching of C against the element's language value is performed case-insensitively.\n\
\t\t// The identifier C does not have to be a valid language name.\"\n\
\t\t// http://www.w3.org/TR/selectors/#lang-pseudo\n\
\t\t\"lang\": markFunction( function( lang ) {\n\
\t\t\t// lang value must be a valid identifider\n\
\t\t\tif ( !ridentifier.test(lang || \"\") ) {\n\
\t\t\t\tSizzle.error( \"unsupported lang: \" + lang );\n\
\t\t\t}\n\
\t\t\tlang = lang.replace( runescape, funescape ).toLowerCase();\n\
\t\t\treturn function( elem ) {\n\
\t\t\t\tvar elemLang;\n\
\t\t\t\tdo {\n\
\t\t\t\t\tif ( (elemLang = documentIsXML ?\n\
\t\t\t\t\t\telem.getAttribute(\"xml:lang\") || elem.getAttribute(\"lang\") :\n\
\t\t\t\t\t\telem.lang) ) {\n\
\n\
\t\t\t\t\t\telemLang = elemLang.toLowerCase();\n\
\t\t\t\t\t\treturn elemLang === lang || elemLang.indexOf( lang + \"-\" ) === 0;\n\
\t\t\t\t\t}\n\
\t\t\t\t} while ( (elem = elem.parentNode) && elem.nodeType === 1 );\n\
\t\t\t\treturn false;\n\
\t\t\t};\n\
\t\t}),\n\
\n\
\t\t// Miscellaneous\n\
\t\t\"target\": function( elem ) {\n\
\t\t\tvar hash = window.location && window.location.hash;\n\
\t\t\treturn hash && hash.slice( 1 ) === elem.id;\n\
\t\t},\n\
\n\
\t\t\"root\": function( elem ) {\n\
\t\t\treturn elem === docElem;\n\
\t\t},\n\
\n\
\t\t\"focus\": function( elem ) {\n\
\t\t\treturn elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);\n\
\t\t},\n\
\n\
\t\t// Boolean properties\n\
\t\t\"enabled\": function( elem ) {\n\
\t\t\treturn elem.disabled === false;\n\
\t\t},\n\
\n\
\t\t\"disabled\": function( elem ) {\n\
\t\t\treturn elem.disabled === true;\n\
\t\t},\n\
\n\
\t\t\"checked\": function( elem ) {\n\
\t\t\t// In CSS3, :checked should return both checked and selected elements\n\
\t\t\t// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked\n\
\t\t\tvar nodeName = elem.nodeName.toLowerCase();\n\
\t\t\treturn (nodeName === \"input\" && !!elem.checked) || (nodeName === \"option\" && !!elem.selected);\n\
\t\t},\n\
\n\
\t\t\"selected\": function( elem ) {\n\
\t\t\t// Accessing this property makes selected-by-default\n\
\t\t\t// options in Safari work properly\n\
\t\t\tif ( elem.parentNode ) {\n\
\t\t\t\telem.parentNode.selectedIndex;\n\
\t\t\t}\n\
\n\
\t\t\treturn elem.selected === true;\n\
\t\t},\n\
\n\
\t\t// Contents\n\
\t\t\"empty\": function( elem ) {\n\
\t\t\t// http://www.w3.org/TR/selectors/#empty-pseudo\n\
\t\t\t// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),\n\
\t\t\t//   not comment, processing instructions, or others\n\
\t\t\t// Thanks to Diego Perini for the nodeName shortcut\n\
\t\t\t//   Greater than \"@\" means alpha characters (specifically not starting with \"#\" or \"?\")\n\
\t\t\tfor ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {\n\
\t\t\t\tif ( elem.nodeName > \"@\" || elem.nodeType === 3 || elem.nodeType === 4 ) {\n\
\t\t\t\t\treturn false;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t\treturn true;\n\
\t\t},\n\
\n\
\t\t\"parent\": function( elem ) {\n\
\t\t\treturn !Expr.pseudos[\"empty\"]( elem );\n\
\t\t},\n\
\n\
\t\t// Element/input types\n\
\t\t\"header\": function( elem ) {\n\
\t\t\treturn rheader.test( elem.nodeName );\n\
\t\t},\n\
\n\
\t\t\"input\": function( elem ) {\n\
\t\t\treturn rinputs.test( elem.nodeName );\n\
\t\t},\n\
\n\
\t\t\"button\": function( elem ) {\n\
\t\t\tvar name = elem.nodeName.toLowerCase();\n\
\t\t\treturn name === \"input\" && elem.type === \"button\" || name === \"button\";\n\
\t\t},\n\
\n\
\t\t\"text\": function( elem ) {\n\
\t\t\tvar attr;\n\
\t\t\t// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)\n\
\t\t\t// use getAttribute instead to test this case\n\
\t\t\treturn elem.nodeName.toLowerCase() === \"input\" &&\n\
\t\t\t\telem.type === \"text\" &&\n\
\t\t\t\t( (attr = elem.getAttribute(\"type\")) == null || attr.toLowerCase() === elem.type );\n\
\t\t},\n\
\n\
\t\t// Position-in-collection\n\
\t\t\"first\": createPositionalPseudo(function() {\n\
\t\t\treturn [ 0 ];\n\
\t\t}),\n\
\n\
\t\t\"last\": createPositionalPseudo(function( matchIndexes, length ) {\n\
\t\t\treturn [ length - 1 ];\n\
\t\t}),\n\
\n\
\t\t\"eq\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\
\t\t\treturn [ argument < 0 ? argument + length : argument ];\n\
\t\t}),\n\
\n\
\t\t\"even\": createPositionalPseudo(function( matchIndexes, length ) {\n\
\t\t\tvar i = 0;\n\
\t\t\tfor ( ; i < length; i += 2 ) {\n\
\t\t\t\tmatchIndexes.push( i );\n\
\t\t\t}\n\
\t\t\treturn matchIndexes;\n\
\t\t}),\n\
\n\
\t\t\"odd\": createPositionalPseudo(function( matchIndexes, length ) {\n\
\t\t\tvar i = 1;\n\
\t\t\tfor ( ; i < length; i += 2 ) {\n\
\t\t\t\tmatchIndexes.push( i );\n\
\t\t\t}\n\
\t\t\treturn matchIndexes;\n\
\t\t}),\n\
\n\
\t\t\"lt\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\
\t\t\tvar i = argument < 0 ? argument + length : argument;\n\
\t\t\tfor ( ; --i >= 0; ) {\n\
\t\t\t\tmatchIndexes.push( i );\n\
\t\t\t}\n\
\t\t\treturn matchIndexes;\n\
\t\t}),\n\
\n\
\t\t\"gt\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\
\t\t\tvar i = argument < 0 ? argument + length : argument;\n\
\t\t\tfor ( ; ++i < length; ) {\n\
\t\t\t\tmatchIndexes.push( i );\n\
\t\t\t}\n\
\t\t\treturn matchIndexes;\n\
\t\t})\n\
\t}\n\
};\n\
\n\
// Add button/input type pseudos\n\
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {\n\
\tExpr.pseudos[ i ] = createInputPseudo( i );\n\
}\n\
for ( i in { submit: true, reset: true } ) {\n\
\tExpr.pseudos[ i ] = createButtonPseudo( i );\n\
}\n\
\n\
function tokenize( selector, parseOnly ) {\n\
\tvar matched, match, tokens, type,\n\
\t\tsoFar, groups, preFilters,\n\
\t\tcached = tokenCache[ selector + \" \" ];\n\
\n\
\tif ( cached ) {\n\
\t\treturn parseOnly ? 0 : cached.slice( 0 );\n\
\t}\n\
\n\
\tsoFar = selector;\n\
\tgroups = [];\n\
\tpreFilters = Expr.preFilter;\n\
\n\
\twhile ( soFar ) {\n\
\n\
\t\t// Comma and first run\n\
\t\tif ( !matched || (match = rcomma.exec( soFar )) ) {\n\
\t\t\tif ( match ) {\n\
\t\t\t\t// Don't consume trailing commas as valid\n\
\t\t\t\tsoFar = soFar.slice( match[0].length ) || soFar;\n\
\t\t\t}\n\
\t\t\tgroups.push( tokens = [] );\n\
\t\t}\n\
\n\
\t\tmatched = false;\n\
\n\
\t\t// Combinators\n\
\t\tif ( (match = rcombinators.exec( soFar )) ) {\n\
\t\t\tmatched = match.shift();\n\
\t\t\ttokens.push( {\n\
\t\t\t\tvalue: matched,\n\
\t\t\t\t// Cast descendant combinators to space\n\
\t\t\t\ttype: match[0].replace( rtrim, \" \" )\n\
\t\t\t} );\n\
\t\t\tsoFar = soFar.slice( matched.length );\n\
\t\t}\n\
\n\
\t\t// Filters\n\
\t\tfor ( type in Expr.filter ) {\n\
\t\t\tif ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||\n\
\t\t\t\t(match = preFilters[ type ]( match ))) ) {\n\
\t\t\t\tmatched = match.shift();\n\
\t\t\t\ttokens.push( {\n\
\t\t\t\t\tvalue: matched,\n\
\t\t\t\t\ttype: type,\n\
\t\t\t\t\tmatches: match\n\
\t\t\t\t} );\n\
\t\t\t\tsoFar = soFar.slice( matched.length );\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\tif ( !matched ) {\n\
\t\t\tbreak;\n\
\t\t}\n\
\t}\n\
\n\
\t// Return the length of the invalid excess\n\
\t// if we're just parsing\n\
\t// Otherwise, throw an error or return tokens\n\
\treturn parseOnly ?\n\
\t\tsoFar.length :\n\
\t\tsoFar ?\n\
\t\t\tSizzle.error( selector ) :\n\
\t\t\t// Cache the tokens\n\
\t\t\ttokenCache( selector, groups ).slice( 0 );\n\
}\n\
\n\
function toSelector( tokens ) {\n\
\tvar i = 0,\n\
\t\tlen = tokens.length,\n\
\t\tselector = \"\";\n\
\tfor ( ; i < len; i++ ) {\n\
\t\tselector += tokens[i].value;\n\
\t}\n\
\treturn selector;\n\
}\n\
\n\
function addCombinator( matcher, combinator, base ) {\n\
\tvar dir = combinator.dir,\n\
\t\tcheckNonElements = base && dir === \"parentNode\",\n\
\t\tdoneName = done++;\n\
\n\
\treturn combinator.first ?\n\
\t\t// Check against closest ancestor/preceding element\n\
\t\tfunction( elem, context, xml ) {\n\
\t\t\twhile ( (elem = elem[ dir ]) ) {\n\
\t\t\t\tif ( elem.nodeType === 1 || checkNonElements ) {\n\
\t\t\t\t\treturn matcher( elem, context, xml );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t} :\n\
\n\
\t\t// Check against all ancestor/preceding elements\n\
\t\tfunction( elem, context, xml ) {\n\
\t\t\tvar data, cache, outerCache,\n\
\t\t\t\tdirkey = dirruns + \" \" + doneName;\n\
\n\
\t\t\t// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching\n\
\t\t\tif ( xml ) {\n\
\t\t\t\twhile ( (elem = elem[ dir ]) ) {\n\
\t\t\t\t\tif ( elem.nodeType === 1 || checkNonElements ) {\n\
\t\t\t\t\t\tif ( matcher( elem, context, xml ) ) {\n\
\t\t\t\t\t\t\treturn true;\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t} else {\n\
\t\t\t\twhile ( (elem = elem[ dir ]) ) {\n\
\t\t\t\t\tif ( elem.nodeType === 1 || checkNonElements ) {\n\
\t\t\t\t\t\touterCache = elem[ expando ] || (elem[ expando ] = {});\n\
\t\t\t\t\t\tif ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {\n\
\t\t\t\t\t\t\tif ( (data = cache[1]) === true || data === cachedruns ) {\n\
\t\t\t\t\t\t\t\treturn data === true;\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\tcache = outerCache[ dir ] = [ dirkey ];\n\
\t\t\t\t\t\t\tcache[1] = matcher( elem, context, xml ) || cachedruns;\n\
\t\t\t\t\t\t\tif ( cache[1] === true ) {\n\
\t\t\t\t\t\t\t\treturn true;\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t};\n\
}\n\
\n\
function elementMatcher( matchers ) {\n\
\treturn matchers.length > 1 ?\n\
\t\tfunction( elem, context, xml ) {\n\
\t\t\tvar i = matchers.length;\n\
\t\t\twhile ( i-- ) {\n\
\t\t\t\tif ( !matchers[i]( elem, context, xml ) ) {\n\
\t\t\t\t\treturn false;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t\treturn true;\n\
\t\t} :\n\
\t\tmatchers[0];\n\
}\n\
\n\
function condense( unmatched, map, filter, context, xml ) {\n\
\tvar elem,\n\
\t\tnewUnmatched = [],\n\
\t\ti = 0,\n\
\t\tlen = unmatched.length,\n\
\t\tmapped = map != null;\n\
\n\
\tfor ( ; i < len; i++ ) {\n\
\t\tif ( (elem = unmatched[i]) ) {\n\
\t\t\tif ( !filter || filter( elem, context, xml ) ) {\n\
\t\t\t\tnewUnmatched.push( elem );\n\
\t\t\t\tif ( mapped ) {\n\
\t\t\t\t\tmap.push( i );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\treturn newUnmatched;\n\
}\n\
\n\
function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {\n\
\tif ( postFilter && !postFilter[ expando ] ) {\n\
\t\tpostFilter = setMatcher( postFilter );\n\
\t}\n\
\tif ( postFinder && !postFinder[ expando ] ) {\n\
\t\tpostFinder = setMatcher( postFinder, postSelector );\n\
\t}\n\
\treturn markFunction(function( seed, results, context, xml ) {\n\
\t\tvar temp, i, elem,\n\
\t\t\tpreMap = [],\n\
\t\t\tpostMap = [],\n\
\t\t\tpreexisting = results.length,\n\
\n\
\t\t\t// Get initial elements from seed or context\n\
\t\t\telems = seed || multipleContexts( selector || \"*\", context.nodeType ? [ context ] : context, [] ),\n\
\n\
\t\t\t// Prefilter to get matcher input, preserving a map for seed-results synchronization\n\
\t\t\tmatcherIn = preFilter && ( seed || !selector ) ?\n\
\t\t\t\tcondense( elems, preMap, preFilter, context, xml ) :\n\
\t\t\t\telems,\n\
\n\
\t\t\tmatcherOut = matcher ?\n\
\t\t\t\t// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,\n\
\t\t\t\tpostFinder || ( seed ? preFilter : preexisting || postFilter ) ?\n\
\n\
\t\t\t\t\t// ...intermediate processing is necessary\n\
\t\t\t\t\t[] :\n\
\n\
\t\t\t\t\t// ...otherwise use results directly\n\
\t\t\t\t\tresults :\n\
\t\t\t\tmatcherIn;\n\
\n\
\t\t// Find primary matches\n\
\t\tif ( matcher ) {\n\
\t\t\tmatcher( matcherIn, matcherOut, context, xml );\n\
\t\t}\n\
\n\
\t\t// Apply postFilter\n\
\t\tif ( postFilter ) {\n\
\t\t\ttemp = condense( matcherOut, postMap );\n\
\t\t\tpostFilter( temp, [], context, xml );\n\
\n\
\t\t\t// Un-match failing elements by moving them back to matcherIn\n\
\t\t\ti = temp.length;\n\
\t\t\twhile ( i-- ) {\n\
\t\t\t\tif ( (elem = temp[i]) ) {\n\
\t\t\t\t\tmatcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\tif ( seed ) {\n\
\t\t\tif ( postFinder || preFilter ) {\n\
\t\t\t\tif ( postFinder ) {\n\
\t\t\t\t\t// Get the final matcherOut by condensing this intermediate into postFinder contexts\n\
\t\t\t\t\ttemp = [];\n\
\t\t\t\t\ti = matcherOut.length;\n\
\t\t\t\t\twhile ( i-- ) {\n\
\t\t\t\t\t\tif ( (elem = matcherOut[i]) ) {\n\
\t\t\t\t\t\t\t// Restore matcherIn since elem is not yet a final match\n\
\t\t\t\t\t\t\ttemp.push( (matcherIn[i] = elem) );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t\tpostFinder( null, (matcherOut = []), temp, xml );\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// Move matched elements from seed to results to keep them synchronized\n\
\t\t\t\ti = matcherOut.length;\n\
\t\t\t\twhile ( i-- ) {\n\
\t\t\t\t\tif ( (elem = matcherOut[i]) &&\n\
\t\t\t\t\t\t(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {\n\
\n\
\t\t\t\t\t\tseed[temp] = !(results[temp] = elem);\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t// Add elements to results, through postFinder if defined\n\
\t\t} else {\n\
\t\t\tmatcherOut = condense(\n\
\t\t\t\tmatcherOut === results ?\n\
\t\t\t\t\tmatcherOut.splice( preexisting, matcherOut.length ) :\n\
\t\t\t\t\tmatcherOut\n\
\t\t\t);\n\
\t\t\tif ( postFinder ) {\n\
\t\t\t\tpostFinder( null, results, matcherOut, xml );\n\
\t\t\t} else {\n\
\t\t\t\tpush.apply( results, matcherOut );\n\
\t\t\t}\n\
\t\t}\n\
\t});\n\
}\n\
\n\
function matcherFromTokens( tokens ) {\n\
\tvar checkContext, matcher, j,\n\
\t\tlen = tokens.length,\n\
\t\tleadingRelative = Expr.relative[ tokens[0].type ],\n\
\t\timplicitRelative = leadingRelative || Expr.relative[\" \"],\n\
\t\ti = leadingRelative ? 1 : 0,\n\
\n\
\t\t// The foundational matcher ensures that elements are reachable from top-level context(s)\n\
\t\tmatchContext = addCombinator( function( elem ) {\n\
\t\t\treturn elem === checkContext;\n\
\t\t}, implicitRelative, true ),\n\
\t\tmatchAnyContext = addCombinator( function( elem ) {\n\
\t\t\treturn indexOf.call( checkContext, elem ) > -1;\n\
\t\t}, implicitRelative, true ),\n\
\t\tmatchers = [ function( elem, context, xml ) {\n\
\t\t\treturn ( !leadingRelative && ( xml || context !== outermostContext ) ) || (\n\
\t\t\t\t(checkContext = context).nodeType ?\n\
\t\t\t\t\tmatchContext( elem, context, xml ) :\n\
\t\t\t\t\tmatchAnyContext( elem, context, xml ) );\n\
\t\t} ];\n\
\n\
\tfor ( ; i < len; i++ ) {\n\
\t\tif ( (matcher = Expr.relative[ tokens[i].type ]) ) {\n\
\t\t\tmatchers = [ addCombinator(elementMatcher( matchers ), matcher) ];\n\
\t\t} else {\n\
\t\t\tmatcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );\n\
\n\
\t\t\t// Return special upon seeing a positional matcher\n\
\t\t\tif ( matcher[ expando ] ) {\n\
\t\t\t\t// Find the next relative operator (if any) for proper handling\n\
\t\t\t\tj = ++i;\n\
\t\t\t\tfor ( ; j < len; j++ ) {\n\
\t\t\t\t\tif ( Expr.relative[ tokens[j].type ] ) {\n\
\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t\treturn setMatcher(\n\
\t\t\t\t\ti > 1 && elementMatcher( matchers ),\n\
\t\t\t\t\ti > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, \"$1\" ),\n\
\t\t\t\t\tmatcher,\n\
\t\t\t\t\ti < j && matcherFromTokens( tokens.slice( i, j ) ),\n\
\t\t\t\t\tj < len && matcherFromTokens( (tokens = tokens.slice( j )) ),\n\
\t\t\t\t\tj < len && toSelector( tokens )\n\
\t\t\t\t);\n\
\t\t\t}\n\
\t\t\tmatchers.push( matcher );\n\
\t\t}\n\
\t}\n\
\n\
\treturn elementMatcher( matchers );\n\
}\n\
\n\
function matcherFromGroupMatchers( elementMatchers, setMatchers ) {\n\
\t// A counter to specify which element is currently being matched\n\
\tvar matcherCachedRuns = 0,\n\
\t\tbySet = setMatchers.length > 0,\n\
\t\tbyElement = elementMatchers.length > 0,\n\
\t\tsuperMatcher = function( seed, context, xml, results, expandContext ) {\n\
\t\t\tvar elem, j, matcher,\n\
\t\t\t\tsetMatched = [],\n\
\t\t\t\tmatchedCount = 0,\n\
\t\t\t\ti = \"0\",\n\
\t\t\t\tunmatched = seed && [],\n\
\t\t\t\toutermost = expandContext != null,\n\
\t\t\t\tcontextBackup = outermostContext,\n\
\t\t\t\t// We must always have either seed elements or context\n\
\t\t\t\telems = seed || byElement && Expr.find[\"TAG\"]( \"*\", expandContext && context.parentNode || context ),\n\
\t\t\t\t// Use integer dirruns iff this is the outermost matcher\n\
\t\t\t\tdirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);\n\
\n\
\t\t\tif ( outermost ) {\n\
\t\t\t\toutermostContext = context !== document && context;\n\
\t\t\t\tcachedruns = matcherCachedRuns;\n\
\t\t\t}\n\
\n\
\t\t\t// Add elements passing elementMatchers directly to results\n\
\t\t\t// Keep `i` a string if there are no elements so `matchedCount` will be \"00\" below\n\
\t\t\tfor ( ; (elem = elems[i]) != null; i++ ) {\n\
\t\t\t\tif ( byElement && elem ) {\n\
\t\t\t\t\tj = 0;\n\
\t\t\t\t\twhile ( (matcher = elementMatchers[j++]) ) {\n\
\t\t\t\t\t\tif ( matcher( elem, context, xml ) ) {\n\
\t\t\t\t\t\t\tresults.push( elem );\n\
\t\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t\tif ( outermost ) {\n\
\t\t\t\t\t\tdirruns = dirrunsUnique;\n\
\t\t\t\t\t\tcachedruns = ++matcherCachedRuns;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// Track unmatched elements for set filters\n\
\t\t\t\tif ( bySet ) {\n\
\t\t\t\t\t// They will have gone through all possible matchers\n\
\t\t\t\t\tif ( (elem = !matcher && elem) ) {\n\
\t\t\t\t\t\tmatchedCount--;\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Lengthen the array for every element, matched or not\n\
\t\t\t\t\tif ( seed ) {\n\
\t\t\t\t\t\tunmatched.push( elem );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// Apply set filters to unmatched elements\n\
\t\t\tmatchedCount += i;\n\
\t\t\tif ( bySet && i !== matchedCount ) {\n\
\t\t\t\tj = 0;\n\
\t\t\t\twhile ( (matcher = setMatchers[j++]) ) {\n\
\t\t\t\t\tmatcher( unmatched, setMatched, context, xml );\n\
\t\t\t\t}\n\
\n\
\t\t\t\tif ( seed ) {\n\
\t\t\t\t\t// Reintegrate element matches to eliminate the need for sorting\n\
\t\t\t\t\tif ( matchedCount > 0 ) {\n\
\t\t\t\t\t\twhile ( i-- ) {\n\
\t\t\t\t\t\t\tif ( !(unmatched[i] || setMatched[i]) ) {\n\
\t\t\t\t\t\t\t\tsetMatched[i] = pop.call( results );\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Discard index placeholder values to get only actual matches\n\
\t\t\t\t\tsetMatched = condense( setMatched );\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// Add matches to results\n\
\t\t\t\tpush.apply( results, setMatched );\n\
\n\
\t\t\t\t// Seedless set matches succeeding multiple successful matchers stipulate sorting\n\
\t\t\t\tif ( outermost && !seed && setMatched.length > 0 &&\n\
\t\t\t\t\t( matchedCount + setMatchers.length ) > 1 ) {\n\
\n\
\t\t\t\t\tSizzle.uniqueSort( results );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// Override manipulation of globals by nested matchers\n\
\t\t\tif ( outermost ) {\n\
\t\t\t\tdirruns = dirrunsUnique;\n\
\t\t\t\toutermostContext = contextBackup;\n\
\t\t\t}\n\
\n\
\t\t\treturn unmatched;\n\
\t\t};\n\
\n\
\treturn bySet ?\n\
\t\tmarkFunction( superMatcher ) :\n\
\t\tsuperMatcher;\n\
}\n\
\n\
compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {\n\
\tvar i,\n\
\t\tsetMatchers = [],\n\
\t\telementMatchers = [],\n\
\t\tcached = compilerCache[ selector + \" \" ];\n\
\n\
\tif ( !cached ) {\n\
\t\t// Generate a function of recursive functions that can be used to check each element\n\
\t\tif ( !group ) {\n\
\t\t\tgroup = tokenize( selector );\n\
\t\t}\n\
\t\ti = group.length;\n\
\t\twhile ( i-- ) {\n\
\t\t\tcached = matcherFromTokens( group[i] );\n\
\t\t\tif ( cached[ expando ] ) {\n\
\t\t\t\tsetMatchers.push( cached );\n\
\t\t\t} else {\n\
\t\t\t\telementMatchers.push( cached );\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Cache the compiled function\n\
\t\tcached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );\n\
\t}\n\
\treturn cached;\n\
};\n\
\n\
function multipleContexts( selector, contexts, results ) {\n\
\tvar i = 0,\n\
\t\tlen = contexts.length;\n\
\tfor ( ; i < len; i++ ) {\n\
\t\tSizzle( selector, contexts[i], results );\n\
\t}\n\
\treturn results;\n\
}\n\
\n\
function select( selector, context, results, seed ) {\n\
\tvar i, tokens, token, type, find,\n\
\t\tmatch = tokenize( selector );\n\
\n\
\tif ( !seed ) {\n\
\t\t// Try to minimize operations if there is only one group\n\
\t\tif ( match.length === 1 ) {\n\
\n\
\t\t\t// Take a shortcut and set the context if the root selector is an ID\n\
\t\t\ttokens = match[0] = match[0].slice( 0 );\n\
\t\t\tif ( tokens.length > 2 && (token = tokens[0]).type === \"ID\" &&\n\
\t\t\t\t\tcontext.nodeType === 9 && !documentIsXML &&\n\
\t\t\t\t\tExpr.relative[ tokens[1].type ] ) {\n\
\n\
\t\t\t\tcontext = Expr.find[\"ID\"]( token.matches[0].replace( runescape, funescape ), context )[0];\n\
\t\t\t\tif ( !context ) {\n\
\t\t\t\t\treturn results;\n\
\t\t\t\t}\n\
\n\
\t\t\t\tselector = selector.slice( tokens.shift().value.length );\n\
\t\t\t}\n\
\n\
\t\t\t// Fetch a seed set for right-to-left matching\n\
\t\t\ti = matchExpr[\"needsContext\"].test( selector ) ? 0 : tokens.length;\n\
\t\t\twhile ( i-- ) {\n\
\t\t\t\ttoken = tokens[i];\n\
\n\
\t\t\t\t// Abort if we hit a combinator\n\
\t\t\t\tif ( Expr.relative[ (type = token.type) ] ) {\n\
\t\t\t\t\tbreak;\n\
\t\t\t\t}\n\
\t\t\t\tif ( (find = Expr.find[ type ]) ) {\n\
\t\t\t\t\t// Search, expanding context for leading sibling combinators\n\
\t\t\t\t\tif ( (seed = find(\n\
\t\t\t\t\t\ttoken.matches[0].replace( runescape, funescape ),\n\
\t\t\t\t\t\trsibling.test( tokens[0].type ) && context.parentNode || context\n\
\t\t\t\t\t)) ) {\n\
\n\
\t\t\t\t\t\t// If seed is empty or no tokens remain, we can return early\n\
\t\t\t\t\t\ttokens.splice( i, 1 );\n\
\t\t\t\t\t\tselector = seed.length && toSelector( tokens );\n\
\t\t\t\t\t\tif ( !selector ) {\n\
\t\t\t\t\t\t\tpush.apply( results, slice.call( seed, 0 ) );\n\
\t\t\t\t\t\t\treturn results;\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\t// Compile and execute a filtering function\n\
\t// Provide `match` to avoid retokenization if we modified the selector above\n\
\tcompile( selector, match )(\n\
\t\tseed,\n\
\t\tcontext,\n\
\t\tdocumentIsXML,\n\
\t\tresults,\n\
\t\trsibling.test( selector )\n\
\t);\n\
\treturn results;\n\
}\n\
\n\
// Deprecated\n\
Expr.pseudos[\"nth\"] = Expr.pseudos[\"eq\"];\n\
\n\
// Easy API for creating new setFilters\n\
function setFilters() {}\n\
Expr.filters = setFilters.prototype = Expr.pseudos;\n\
Expr.setFilters = new setFilters();\n\
\n\
// Initialize with the default document\n\
setDocument();\n\
\n\
// Override sizzle attribute retrieval\n\
Sizzle.attr = jQuery.attr;\n\
jQuery.find = Sizzle;\n\
jQuery.expr = Sizzle.selectors;\n\
jQuery.expr[\":\"] = jQuery.expr.pseudos;\n\
jQuery.unique = Sizzle.uniqueSort;\n\
jQuery.text = Sizzle.getText;\n\
jQuery.isXMLDoc = Sizzle.isXML;\n\
jQuery.contains = Sizzle.contains;\n\
\n\
\n\
})( window );\n\
var runtil = /Until$/,\n\
\trparentsprev = /^(?:parents|prev(?:Until|All))/,\n\
\tisSimple = /^.[^:#\\[\\.,]*$/,\n\
\trneedsContext = jQuery.expr.match.needsContext,\n\
\t// methods guaranteed to produce a unique set when starting from a unique set\n\
\tguaranteedUnique = {\n\
\t\tchildren: true,\n\
\t\tcontents: true,\n\
\t\tnext: true,\n\
\t\tprev: true\n\
\t};\n\
\n\
jQuery.fn.extend({\n\
\tfind: function( selector ) {\n\
\t\tvar i, ret, self,\n\
\t\t\tlen = this.length;\n\
\n\
\t\tif ( typeof selector !== \"string\" ) {\n\
\t\t\tself = this;\n\
\t\t\treturn this.pushStack( jQuery( selector ).filter(function() {\n\
\t\t\t\tfor ( i = 0; i < len; i++ ) {\n\
\t\t\t\t\tif ( jQuery.contains( self[ i ], this ) ) {\n\
\t\t\t\t\t\treturn true;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}) );\n\
\t\t}\n\
\n\
\t\tret = [];\n\
\t\tfor ( i = 0; i < len; i++ ) {\n\
\t\t\tjQuery.find( selector, this[ i ], ret );\n\
\t\t}\n\
\n\
\t\t// Needed because $( selector, context ) becomes $( context ).find( selector )\n\
\t\tret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );\n\
\t\tret.selector = ( this.selector ? this.selector + \" \" : \"\" ) + selector;\n\
\t\treturn ret;\n\
\t},\n\
\n\
\thas: function( target ) {\n\
\t\tvar i,\n\
\t\t\ttargets = jQuery( target, this ),\n\
\t\t\tlen = targets.length;\n\
\n\
\t\treturn this.filter(function() {\n\
\t\t\tfor ( i = 0; i < len; i++ ) {\n\
\t\t\t\tif ( jQuery.contains( this, targets[i] ) ) {\n\
\t\t\t\t\treturn true;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\n\
\tnot: function( selector ) {\n\
\t\treturn this.pushStack( winnow(this, selector, false) );\n\
\t},\n\
\n\
\tfilter: function( selector ) {\n\
\t\treturn this.pushStack( winnow(this, selector, true) );\n\
\t},\n\
\n\
\tis: function( selector ) {\n\
\t\treturn !!selector && (\n\
\t\t\ttypeof selector === \"string\" ?\n\
\t\t\t\t// If this is a positional/relative selector, check membership in the returned set\n\
\t\t\t\t// so $(\"p:first\").is(\"p:last\") won't return true for a doc with two \"p\".\n\
\t\t\t\trneedsContext.test( selector ) ?\n\
\t\t\t\t\tjQuery( selector, this.context ).index( this[0] ) >= 0 :\n\
\t\t\t\t\tjQuery.filter( selector, this ).length > 0 :\n\
\t\t\t\tthis.filter( selector ).length > 0 );\n\
\t},\n\
\n\
\tclosest: function( selectors, context ) {\n\
\t\tvar cur,\n\
\t\t\ti = 0,\n\
\t\t\tl = this.length,\n\
\t\t\tret = [],\n\
\t\t\tpos = rneedsContext.test( selectors ) || typeof selectors !== \"string\" ?\n\
\t\t\t\tjQuery( selectors, context || this.context ) :\n\
\t\t\t\t0;\n\
\n\
\t\tfor ( ; i < l; i++ ) {\n\
\t\t\tcur = this[i];\n\
\n\
\t\t\twhile ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {\n\
\t\t\t\tif ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {\n\
\t\t\t\t\tret.push( cur );\n\
\t\t\t\t\tbreak;\n\
\t\t\t\t}\n\
\t\t\t\tcur = cur.parentNode;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );\n\
\t},\n\
\n\
\t// Determine the position of an element within\n\
\t// the matched set of elements\n\
\tindex: function( elem ) {\n\
\n\
\t\t// No argument, return index in parent\n\
\t\tif ( !elem ) {\n\
\t\t\treturn ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;\n\
\t\t}\n\
\n\
\t\t// index in selector\n\
\t\tif ( typeof elem === \"string\" ) {\n\
\t\t\treturn jQuery.inArray( this[0], jQuery( elem ) );\n\
\t\t}\n\
\n\
\t\t// Locate the position of the desired element\n\
\t\treturn jQuery.inArray(\n\
\t\t\t// If it receives a jQuery object, the first element is used\n\
\t\t\telem.jquery ? elem[0] : elem, this );\n\
\t},\n\
\n\
\tadd: function( selector, context ) {\n\
\t\tvar set = typeof selector === \"string\" ?\n\
\t\t\t\tjQuery( selector, context ) :\n\
\t\t\t\tjQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),\n\
\t\t\tall = jQuery.merge( this.get(), set );\n\
\n\
\t\treturn this.pushStack( jQuery.unique(all) );\n\
\t},\n\
\n\
\taddBack: function( selector ) {\n\
\t\treturn this.add( selector == null ?\n\
\t\t\tthis.prevObject : this.prevObject.filter(selector)\n\
\t\t);\n\
\t}\n\
});\n\
\n\
jQuery.fn.andSelf = jQuery.fn.addBack;\n\
\n\
function sibling( cur, dir ) {\n\
\tdo {\n\
\t\tcur = cur[ dir ];\n\
\t} while ( cur && cur.nodeType !== 1 );\n\
\n\
\treturn cur;\n\
}\n\
\n\
jQuery.each({\n\
\tparent: function( elem ) {\n\
\t\tvar parent = elem.parentNode;\n\
\t\treturn parent && parent.nodeType !== 11 ? parent : null;\n\
\t},\n\
\tparents: function( elem ) {\n\
\t\treturn jQuery.dir( elem, \"parentNode\" );\n\
\t},\n\
\tparentsUntil: function( elem, i, until ) {\n\
\t\treturn jQuery.dir( elem, \"parentNode\", until );\n\
\t},\n\
\tnext: function( elem ) {\n\
\t\treturn sibling( elem, \"nextSibling\" );\n\
\t},\n\
\tprev: function( elem ) {\n\
\t\treturn sibling( elem, \"previousSibling\" );\n\
\t},\n\
\tnextAll: function( elem ) {\n\
\t\treturn jQuery.dir( elem, \"nextSibling\" );\n\
\t},\n\
\tprevAll: function( elem ) {\n\
\t\treturn jQuery.dir( elem, \"previousSibling\" );\n\
\t},\n\
\tnextUntil: function( elem, i, until ) {\n\
\t\treturn jQuery.dir( elem, \"nextSibling\", until );\n\
\t},\n\
\tprevUntil: function( elem, i, until ) {\n\
\t\treturn jQuery.dir( elem, \"previousSibling\", until );\n\
\t},\n\
\tsiblings: function( elem ) {\n\
\t\treturn jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );\n\
\t},\n\
\tchildren: function( elem ) {\n\
\t\treturn jQuery.sibling( elem.firstChild );\n\
\t},\n\
\tcontents: function( elem ) {\n\
\t\treturn jQuery.nodeName( elem, \"iframe\" ) ?\n\
\t\t\telem.contentDocument || elem.contentWindow.document :\n\
\t\t\tjQuery.merge( [], elem.childNodes );\n\
\t}\n\
}, function( name, fn ) {\n\
\tjQuery.fn[ name ] = function( until, selector ) {\n\
\t\tvar ret = jQuery.map( this, fn, until );\n\
\n\
\t\tif ( !runtil.test( name ) ) {\n\
\t\t\tselector = until;\n\
\t\t}\n\
\n\
\t\tif ( selector && typeof selector === \"string\" ) {\n\
\t\t\tret = jQuery.filter( selector, ret );\n\
\t\t}\n\
\n\
\t\tret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;\n\
\n\
\t\tif ( this.length > 1 && rparentsprev.test( name ) ) {\n\
\t\t\tret = ret.reverse();\n\
\t\t}\n\
\n\
\t\treturn this.pushStack( ret );\n\
\t};\n\
});\n\
\n\
jQuery.extend({\n\
\tfilter: function( expr, elems, not ) {\n\
\t\tif ( not ) {\n\
\t\t\texpr = \":not(\" + expr + \")\";\n\
\t\t}\n\
\n\
\t\treturn elems.length === 1 ?\n\
\t\t\tjQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :\n\
\t\t\tjQuery.find.matches(expr, elems);\n\
\t},\n\
\n\
\tdir: function( elem, dir, until ) {\n\
\t\tvar matched = [],\n\
\t\t\tcur = elem[ dir ];\n\
\n\
\t\twhile ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {\n\
\t\t\tif ( cur.nodeType === 1 ) {\n\
\t\t\t\tmatched.push( cur );\n\
\t\t\t}\n\
\t\t\tcur = cur[dir];\n\
\t\t}\n\
\t\treturn matched;\n\
\t},\n\
\n\
\tsibling: function( n, elem ) {\n\
\t\tvar r = [];\n\
\n\
\t\tfor ( ; n; n = n.nextSibling ) {\n\
\t\t\tif ( n.nodeType === 1 && n !== elem ) {\n\
\t\t\t\tr.push( n );\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn r;\n\
\t}\n\
});\n\
\n\
// Implement the identical functionality for filter and not\n\
function winnow( elements, qualifier, keep ) {\n\
\n\
\t// Can't pass null or undefined to indexOf in Firefox 4\n\
\t// Set to 0 to skip string check\n\
\tqualifier = qualifier || 0;\n\
\n\
\tif ( jQuery.isFunction( qualifier ) ) {\n\
\t\treturn jQuery.grep(elements, function( elem, i ) {\n\
\t\t\tvar retVal = !!qualifier.call( elem, i, elem );\n\
\t\t\treturn retVal === keep;\n\
\t\t});\n\
\n\
\t} else if ( qualifier.nodeType ) {\n\
\t\treturn jQuery.grep(elements, function( elem ) {\n\
\t\t\treturn ( elem === qualifier ) === keep;\n\
\t\t});\n\
\n\
\t} else if ( typeof qualifier === \"string\" ) {\n\
\t\tvar filtered = jQuery.grep(elements, function( elem ) {\n\
\t\t\treturn elem.nodeType === 1;\n\
\t\t});\n\
\n\
\t\tif ( isSimple.test( qualifier ) ) {\n\
\t\t\treturn jQuery.filter(qualifier, filtered, !keep);\n\
\t\t} else {\n\
\t\t\tqualifier = jQuery.filter( qualifier, filtered );\n\
\t\t}\n\
\t}\n\
\n\
\treturn jQuery.grep(elements, function( elem ) {\n\
\t\treturn ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;\n\
\t});\n\
}\n\
function createSafeFragment( document ) {\n\
\tvar list = nodeNames.split( \"|\" ),\n\
\t\tsafeFrag = document.createDocumentFragment();\n\
\n\
\tif ( safeFrag.createElement ) {\n\
\t\twhile ( list.length ) {\n\
\t\t\tsafeFrag.createElement(\n\
\t\t\t\tlist.pop()\n\
\t\t\t);\n\
\t\t}\n\
\t}\n\
\treturn safeFrag;\n\
}\n\
\n\
var nodeNames = \"abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|\" +\n\
\t\t\"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video\",\n\
\trinlinejQuery = / jQuery\\d+=\"(?:null|\\d+)\"/g,\n\
\trnoshimcache = new RegExp(\"<(?:\" + nodeNames + \")[\\\\s/>]\", \"i\"),\n\
\trleadingWhitespace = /^\\s+/,\n\
\trxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\\w:]+)[^>]*)\\/>/gi,\n\
\trtagName = /<([\\w:]+)/,\n\
\trtbody = /<tbody/i,\n\
\trhtml = /<|&#?\\w+;/,\n\
\trnoInnerhtml = /<(?:script|style|link)/i,\n\
\tmanipulation_rcheckableType = /^(?:checkbox|radio)$/i,\n\
\t// checked=\"checked\" or checked\n\
\trchecked = /checked\\s*(?:[^=]|=\\s*.checked.)/i,\n\
\trscriptType = /^$|\\/(?:java|ecma)script/i,\n\
\trscriptTypeMasked = /^true\\/(.*)/,\n\
\trcleanScript = /^\\s*<!(?:\\[CDATA\\[|--)|(?:\\]\\]|--)>\\s*$/g,\n\
\n\
\t// We have to close these tags to support XHTML (#13200)\n\
\twrapMap = {\n\
\t\toption: [ 1, \"<select multiple='multiple'>\", \"</select>\" ],\n\
\t\tlegend: [ 1, \"<fieldset>\", \"</fieldset>\" ],\n\
\t\tarea: [ 1, \"<map>\", \"</map>\" ],\n\
\t\tparam: [ 1, \"<object>\", \"</object>\" ],\n\
\t\tthead: [ 1, \"<table>\", \"</table>\" ],\n\
\t\ttr: [ 2, \"<table><tbody>\", \"</tbody></table>\" ],\n\
\t\tcol: [ 2, \"<table><tbody></tbody><colgroup>\", \"</colgroup></table>\" ],\n\
\t\ttd: [ 3, \"<table><tbody><tr>\", \"</tr></tbody></table>\" ],\n\
\n\
\t\t// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,\n\
\t\t// unless wrapped in a div with non-breaking characters in front of it.\n\
\t\t_default: jQuery.support.htmlSerialize ? [ 0, \"\", \"\" ] : [ 1, \"X<div>\", \"</div>\"  ]\n\
\t},\n\
\tsafeFragment = createSafeFragment( document ),\n\
\tfragmentDiv = safeFragment.appendChild( document.createElement(\"div\") );\n\
\n\
wrapMap.optgroup = wrapMap.option;\n\
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;\n\
wrapMap.th = wrapMap.td;\n\
\n\
jQuery.fn.extend({\n\
\ttext: function( value ) {\n\
\t\treturn jQuery.access( this, function( value ) {\n\
\t\t\treturn value === undefined ?\n\
\t\t\t\tjQuery.text( this ) :\n\
\t\t\t\tthis.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );\n\
\t\t}, null, value, arguments.length );\n\
\t},\n\
\n\
\twrapAll: function( html ) {\n\
\t\tif ( jQuery.isFunction( html ) ) {\n\
\t\t\treturn this.each(function(i) {\n\
\t\t\t\tjQuery(this).wrapAll( html.call(this, i) );\n\
\t\t\t});\n\
\t\t}\n\
\n\
\t\tif ( this[0] ) {\n\
\t\t\t// The elements to wrap the target around\n\
\t\t\tvar wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);\n\
\n\
\t\t\tif ( this[0].parentNode ) {\n\
\t\t\t\twrap.insertBefore( this[0] );\n\
\t\t\t}\n\
\n\
\t\t\twrap.map(function() {\n\
\t\t\t\tvar elem = this;\n\
\n\
\t\t\t\twhile ( elem.firstChild && elem.firstChild.nodeType === 1 ) {\n\
\t\t\t\t\telem = elem.firstChild;\n\
\t\t\t\t}\n\
\n\
\t\t\t\treturn elem;\n\
\t\t\t}).append( this );\n\
\t\t}\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\twrapInner: function( html ) {\n\
\t\tif ( jQuery.isFunction( html ) ) {\n\
\t\t\treturn this.each(function(i) {\n\
\t\t\t\tjQuery(this).wrapInner( html.call(this, i) );\n\
\t\t\t});\n\
\t\t}\n\
\n\
\t\treturn this.each(function() {\n\
\t\t\tvar self = jQuery( this ),\n\
\t\t\t\tcontents = self.contents();\n\
\n\
\t\t\tif ( contents.length ) {\n\
\t\t\t\tcontents.wrapAll( html );\n\
\n\
\t\t\t} else {\n\
\t\t\t\tself.append( html );\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\n\
\twrap: function( html ) {\n\
\t\tvar isFunction = jQuery.isFunction( html );\n\
\n\
\t\treturn this.each(function(i) {\n\
\t\t\tjQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );\n\
\t\t});\n\
\t},\n\
\n\
\tunwrap: function() {\n\
\t\treturn this.parent().each(function() {\n\
\t\t\tif ( !jQuery.nodeName( this, \"body\" ) ) {\n\
\t\t\t\tjQuery( this ).replaceWith( this.childNodes );\n\
\t\t\t}\n\
\t\t}).end();\n\
\t},\n\
\n\
\tappend: function() {\n\
\t\treturn this.domManip(arguments, true, function( elem ) {\n\
\t\t\tif ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {\n\
\t\t\t\tthis.appendChild( elem );\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\n\
\tprepend: function() {\n\
\t\treturn this.domManip(arguments, true, function( elem ) {\n\
\t\t\tif ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {\n\
\t\t\t\tthis.insertBefore( elem, this.firstChild );\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\n\
\tbefore: function() {\n\
\t\treturn this.domManip( arguments, false, function( elem ) {\n\
\t\t\tif ( this.parentNode ) {\n\
\t\t\t\tthis.parentNode.insertBefore( elem, this );\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\n\
\tafter: function() {\n\
\t\treturn this.domManip( arguments, false, function( elem ) {\n\
\t\t\tif ( this.parentNode ) {\n\
\t\t\t\tthis.parentNode.insertBefore( elem, this.nextSibling );\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\n\
\t// keepData is for internal use only--do not document\n\
\tremove: function( selector, keepData ) {\n\
\t\tvar elem,\n\
\t\t\ti = 0;\n\
\n\
\t\tfor ( ; (elem = this[i]) != null; i++ ) {\n\
\t\t\tif ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {\n\
\t\t\t\tif ( !keepData && elem.nodeType === 1 ) {\n\
\t\t\t\t\tjQuery.cleanData( getAll( elem ) );\n\
\t\t\t\t}\n\
\n\
\t\t\t\tif ( elem.parentNode ) {\n\
\t\t\t\t\tif ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {\n\
\t\t\t\t\t\tsetGlobalEval( getAll( elem, \"script\" ) );\n\
\t\t\t\t\t}\n\
\t\t\t\t\telem.parentNode.removeChild( elem );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\tempty: function() {\n\
\t\tvar elem,\n\
\t\t\ti = 0;\n\
\n\
\t\tfor ( ; (elem = this[i]) != null; i++ ) {\n\
\t\t\t// Remove element nodes and prevent memory leaks\n\
\t\t\tif ( elem.nodeType === 1 ) {\n\
\t\t\t\tjQuery.cleanData( getAll( elem, false ) );\n\
\t\t\t}\n\
\n\
\t\t\t// Remove any remaining nodes\n\
\t\t\twhile ( elem.firstChild ) {\n\
\t\t\t\telem.removeChild( elem.firstChild );\n\
\t\t\t}\n\
\n\
\t\t\t// If this is a select, ensure that it displays empty (#12336)\n\
\t\t\t// Support: IE<9\n\
\t\t\tif ( elem.options && jQuery.nodeName( elem, \"select\" ) ) {\n\
\t\t\t\telem.options.length = 0;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\tclone: function( dataAndEvents, deepDataAndEvents ) {\n\
\t\tdataAndEvents = dataAndEvents == null ? false : dataAndEvents;\n\
\t\tdeepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;\n\
\n\
\t\treturn this.map( function () {\n\
\t\t\treturn jQuery.clone( this, dataAndEvents, deepDataAndEvents );\n\
\t\t});\n\
\t},\n\
\n\
\thtml: function( value ) {\n\
\t\treturn jQuery.access( this, function( value ) {\n\
\t\t\tvar elem = this[0] || {},\n\
\t\t\t\ti = 0,\n\
\t\t\t\tl = this.length;\n\
\n\
\t\t\tif ( value === undefined ) {\n\
\t\t\t\treturn elem.nodeType === 1 ?\n\
\t\t\t\t\telem.innerHTML.replace( rinlinejQuery, \"\" ) :\n\
\t\t\t\t\tundefined;\n\
\t\t\t}\n\
\n\
\t\t\t// See if we can take a shortcut and just use innerHTML\n\
\t\t\tif ( typeof value === \"string\" && !rnoInnerhtml.test( value ) &&\n\
\t\t\t\t( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&\n\
\t\t\t\t( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&\n\
\t\t\t\t!wrapMap[ ( rtagName.exec( value ) || [\"\", \"\"] )[1].toLowerCase() ] ) {\n\
\n\
\t\t\t\tvalue = value.replace( rxhtmlTag, \"<$1></$2>\" );\n\
\n\
\t\t\t\ttry {\n\
\t\t\t\t\tfor (; i < l; i++ ) {\n\
\t\t\t\t\t\t// Remove element nodes and prevent memory leaks\n\
\t\t\t\t\t\telem = this[i] || {};\n\
\t\t\t\t\t\tif ( elem.nodeType === 1 ) {\n\
\t\t\t\t\t\t\tjQuery.cleanData( getAll( elem, false ) );\n\
\t\t\t\t\t\t\telem.innerHTML = value;\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\telem = 0;\n\
\n\
\t\t\t\t// If using innerHTML throws an exception, use the fallback method\n\
\t\t\t\t} catch(e) {}\n\
\t\t\t}\n\
\n\
\t\t\tif ( elem ) {\n\
\t\t\t\tthis.empty().append( value );\n\
\t\t\t}\n\
\t\t}, null, value, arguments.length );\n\
\t},\n\
\n\
\treplaceWith: function( value ) {\n\
\t\tvar isFunc = jQuery.isFunction( value );\n\
\n\
\t\t// Make sure that the elements are removed from the DOM before they are inserted\n\
\t\t// this can help fix replacing a parent with child elements\n\
\t\tif ( !isFunc && typeof value !== \"string\" ) {\n\
\t\t\tvalue = jQuery( value ).not( this ).detach();\n\
\t\t}\n\
\n\
\t\treturn this.domManip( [ value ], true, function( elem ) {\n\
\t\t\tvar next = this.nextSibling,\n\
\t\t\t\tparent = this.parentNode;\n\
\n\
\t\t\tif ( parent ) {\n\
\t\t\t\tjQuery( this ).remove();\n\
\t\t\t\tparent.insertBefore( elem, next );\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\n\
\tdetach: function( selector ) {\n\
\t\treturn this.remove( selector, true );\n\
\t},\n\
\n\
\tdomManip: function( args, table, callback ) {\n\
\n\
\t\t// Flatten any nested arrays\n\
\t\targs = core_concat.apply( [], args );\n\
\n\
\t\tvar first, node, hasScripts,\n\
\t\t\tscripts, doc, fragment,\n\
\t\t\ti = 0,\n\
\t\t\tl = this.length,\n\
\t\t\tset = this,\n\
\t\t\tiNoClone = l - 1,\n\
\t\t\tvalue = args[0],\n\
\t\t\tisFunction = jQuery.isFunction( value );\n\
\n\
\t\t// We can't cloneNode fragments that contain checked, in WebKit\n\
\t\tif ( isFunction || !( l <= 1 || typeof value !== \"string\" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {\n\
\t\t\treturn this.each(function( index ) {\n\
\t\t\t\tvar self = set.eq( index );\n\
\t\t\t\tif ( isFunction ) {\n\
\t\t\t\t\targs[0] = value.call( this, index, table ? self.html() : undefined );\n\
\t\t\t\t}\n\
\t\t\t\tself.domManip( args, table, callback );\n\
\t\t\t});\n\
\t\t}\n\
\n\
\t\tif ( l ) {\n\
\t\t\tfragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );\n\
\t\t\tfirst = fragment.firstChild;\n\
\n\
\t\t\tif ( fragment.childNodes.length === 1 ) {\n\
\t\t\t\tfragment = first;\n\
\t\t\t}\n\
\n\
\t\t\tif ( first ) {\n\
\t\t\t\ttable = table && jQuery.nodeName( first, \"tr\" );\n\
\t\t\t\tscripts = jQuery.map( getAll( fragment, \"script\" ), disableScript );\n\
\t\t\t\thasScripts = scripts.length;\n\
\n\
\t\t\t\t// Use the original fragment for the last item instead of the first because it can end up\n\
\t\t\t\t// being emptied incorrectly in certain situations (#8070).\n\
\t\t\t\tfor ( ; i < l; i++ ) {\n\
\t\t\t\t\tnode = fragment;\n\
\n\
\t\t\t\t\tif ( i !== iNoClone ) {\n\
\t\t\t\t\t\tnode = jQuery.clone( node, true, true );\n\
\n\
\t\t\t\t\t\t// Keep references to cloned scripts for later restoration\n\
\t\t\t\t\t\tif ( hasScripts ) {\n\
\t\t\t\t\t\t\tjQuery.merge( scripts, getAll( node, \"script\" ) );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\tcallback.call(\n\
\t\t\t\t\t\ttable && jQuery.nodeName( this[i], \"table\" ) ?\n\
\t\t\t\t\t\t\tfindOrAppend( this[i], \"tbody\" ) :\n\
\t\t\t\t\t\t\tthis[i],\n\
\t\t\t\t\t\tnode,\n\
\t\t\t\t\t\ti\n\
\t\t\t\t\t);\n\
\t\t\t\t}\n\
\n\
\t\t\t\tif ( hasScripts ) {\n\
\t\t\t\t\tdoc = scripts[ scripts.length - 1 ].ownerDocument;\n\
\n\
\t\t\t\t\t// Reenable scripts\n\
\t\t\t\t\tjQuery.map( scripts, restoreScript );\n\
\n\
\t\t\t\t\t// Evaluate executable scripts on first document insertion\n\
\t\t\t\t\tfor ( i = 0; i < hasScripts; i++ ) {\n\
\t\t\t\t\t\tnode = scripts[ i ];\n\
\t\t\t\t\t\tif ( rscriptType.test( node.type || \"\" ) &&\n\
\t\t\t\t\t\t\t!jQuery._data( node, \"globalEval\" ) && jQuery.contains( doc, node ) ) {\n\
\n\
\t\t\t\t\t\t\tif ( node.src ) {\n\
\t\t\t\t\t\t\t\t// Hope ajax is available...\n\
\t\t\t\t\t\t\t\tjQuery.ajax({\n\
\t\t\t\t\t\t\t\t\turl: node.src,\n\
\t\t\t\t\t\t\t\t\ttype: \"GET\",\n\
\t\t\t\t\t\t\t\t\tdataType: \"script\",\n\
\t\t\t\t\t\t\t\t\tasync: false,\n\
\t\t\t\t\t\t\t\t\tglobal: false,\n\
\t\t\t\t\t\t\t\t\t\"throws\": true\n\
\t\t\t\t\t\t\t\t});\n\
\t\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\t\tjQuery.globalEval( ( node.text || node.textContent || node.innerHTML || \"\" ).replace( rcleanScript, \"\" ) );\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// Fix #11809: Avoid leaking memory\n\
\t\t\t\tfragment = first = null;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn this;\n\
\t}\n\
});\n\
\n\
function findOrAppend( elem, tag ) {\n\
\treturn elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );\n\
}\n\
\n\
// Replace/restore the type attribute of script elements for safe DOM manipulation\n\
function disableScript( elem ) {\n\
\tvar attr = elem.getAttributeNode(\"type\");\n\
\telem.type = ( attr && attr.specified ) + \"/\" + elem.type;\n\
\treturn elem;\n\
}\n\
function restoreScript( elem ) {\n\
\tvar match = rscriptTypeMasked.exec( elem.type );\n\
\tif ( match ) {\n\
\t\telem.type = match[1];\n\
\t} else {\n\
\t\telem.removeAttribute(\"type\");\n\
\t}\n\
\treturn elem;\n\
}\n\
\n\
// Mark scripts as having already been evaluated\n\
function setGlobalEval( elems, refElements ) {\n\
\tvar elem,\n\
\t\ti = 0;\n\
\tfor ( ; (elem = elems[i]) != null; i++ ) {\n\
\t\tjQuery._data( elem, \"globalEval\", !refElements || jQuery._data( refElements[i], \"globalEval\" ) );\n\
\t}\n\
}\n\
\n\
function cloneCopyEvent( src, dest ) {\n\
\n\
\tif ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {\n\
\t\treturn;\n\
\t}\n\
\n\
\tvar type, i, l,\n\
\t\toldData = jQuery._data( src ),\n\
\t\tcurData = jQuery._data( dest, oldData ),\n\
\t\tevents = oldData.events;\n\
\n\
\tif ( events ) {\n\
\t\tdelete curData.handle;\n\
\t\tcurData.events = {};\n\
\n\
\t\tfor ( type in events ) {\n\
\t\t\tfor ( i = 0, l = events[ type ].length; i < l; i++ ) {\n\
\t\t\t\tjQuery.event.add( dest, type, events[ type ][ i ] );\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\t// make the cloned public data object a copy from the original\n\
\tif ( curData.data ) {\n\
\t\tcurData.data = jQuery.extend( {}, curData.data );\n\
\t}\n\
}\n\
\n\
function fixCloneNodeIssues( src, dest ) {\n\
\tvar nodeName, e, data;\n\
\n\
\t// We do not need to do anything for non-Elements\n\
\tif ( dest.nodeType !== 1 ) {\n\
\t\treturn;\n\
\t}\n\
\n\
\tnodeName = dest.nodeName.toLowerCase();\n\
\n\
\t// IE6-8 copies events bound via attachEvent when using cloneNode.\n\
\tif ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {\n\
\t\tdata = jQuery._data( dest );\n\
\n\
\t\tfor ( e in data.events ) {\n\
\t\t\tjQuery.removeEvent( dest, e, data.handle );\n\
\t\t}\n\
\n\
\t\t// Event data gets referenced instead of copied if the expando gets copied too\n\
\t\tdest.removeAttribute( jQuery.expando );\n\
\t}\n\
\n\
\t// IE blanks contents when cloning scripts, and tries to evaluate newly-set text\n\
\tif ( nodeName === \"script\" && dest.text !== src.text ) {\n\
\t\tdisableScript( dest ).text = src.text;\n\
\t\trestoreScript( dest );\n\
\n\
\t// IE6-10 improperly clones children of object elements using classid.\n\
\t// IE10 throws NoModificationAllowedError if parent is null, #12132.\n\
\t} else if ( nodeName === \"object\" ) {\n\
\t\tif ( dest.parentNode ) {\n\
\t\t\tdest.outerHTML = src.outerHTML;\n\
\t\t}\n\
\n\
\t\t// This path appears unavoidable for IE9. When cloning an object\n\
\t\t// element in IE9, the outerHTML strategy above is not sufficient.\n\
\t\t// If the src has innerHTML and the destination does not,\n\
\t\t// copy the src.innerHTML into the dest.innerHTML. #10324\n\
\t\tif ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {\n\
\t\t\tdest.innerHTML = src.innerHTML;\n\
\t\t}\n\
\n\
\t} else if ( nodeName === \"input\" && manipulation_rcheckableType.test( src.type ) ) {\n\
\t\t// IE6-8 fails to persist the checked state of a cloned checkbox\n\
\t\t// or radio button. Worse, IE6-7 fail to give the cloned element\n\
\t\t// a checked appearance if the defaultChecked value isn't also set\n\
\n\
\t\tdest.defaultChecked = dest.checked = src.checked;\n\
\n\
\t\t// IE6-7 get confused and end up setting the value of a cloned\n\
\t\t// checkbox/radio button to an empty string instead of \"on\"\n\
\t\tif ( dest.value !== src.value ) {\n\
\t\t\tdest.value = src.value;\n\
\t\t}\n\
\n\
\t// IE6-8 fails to return the selected option to the default selected\n\
\t// state when cloning options\n\
\t} else if ( nodeName === \"option\" ) {\n\
\t\tdest.defaultSelected = dest.selected = src.defaultSelected;\n\
\n\
\t// IE6-8 fails to set the defaultValue to the correct value when\n\
\t// cloning other types of input fields\n\
\t} else if ( nodeName === \"input\" || nodeName === \"textarea\" ) {\n\
\t\tdest.defaultValue = src.defaultValue;\n\
\t}\n\
}\n\
\n\
jQuery.each({\n\
\tappendTo: \"append\",\n\
\tprependTo: \"prepend\",\n\
\tinsertBefore: \"before\",\n\
\tinsertAfter: \"after\",\n\
\treplaceAll: \"replaceWith\"\n\
}, function( name, original ) {\n\
\tjQuery.fn[ name ] = function( selector ) {\n\
\t\tvar elems,\n\
\t\t\ti = 0,\n\
\t\t\tret = [],\n\
\t\t\tinsert = jQuery( selector ),\n\
\t\t\tlast = insert.length - 1;\n\
\n\
\t\tfor ( ; i <= last; i++ ) {\n\
\t\t\telems = i === last ? this : this.clone(true);\n\
\t\t\tjQuery( insert[i] )[ original ]( elems );\n\
\n\
\t\t\t// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()\n\
\t\t\tcore_push.apply( ret, elems.get() );\n\
\t\t}\n\
\n\
\t\treturn this.pushStack( ret );\n\
\t};\n\
});\n\
\n\
function getAll( context, tag ) {\n\
\tvar elems, elem,\n\
\t\ti = 0,\n\
\t\tfound = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || \"*\" ) :\n\
\t\t\ttypeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || \"*\" ) :\n\
\t\t\tundefined;\n\
\n\
\tif ( !found ) {\n\
\t\tfor ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {\n\
\t\t\tif ( !tag || jQuery.nodeName( elem, tag ) ) {\n\
\t\t\t\tfound.push( elem );\n\
\t\t\t} else {\n\
\t\t\t\tjQuery.merge( found, getAll( elem, tag ) );\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\treturn tag === undefined || tag && jQuery.nodeName( context, tag ) ?\n\
\t\tjQuery.merge( [ context ], found ) :\n\
\t\tfound;\n\
}\n\
\n\
// Used in buildFragment, fixes the defaultChecked property\n\
function fixDefaultChecked( elem ) {\n\
\tif ( manipulation_rcheckableType.test( elem.type ) ) {\n\
\t\telem.defaultChecked = elem.checked;\n\
\t}\n\
}\n\
\n\
jQuery.extend({\n\
\tclone: function( elem, dataAndEvents, deepDataAndEvents ) {\n\
\t\tvar destElements, node, clone, i, srcElements,\n\
\t\t\tinPage = jQuery.contains( elem.ownerDocument, elem );\n\
\n\
\t\tif ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( \"<\" + elem.nodeName + \">\" ) ) {\n\
\t\t\tclone = elem.cloneNode( true );\n\
\n\
\t\t// IE<=8 does not properly clone detached, unknown element nodes\n\
\t\t} else {\n\
\t\t\tfragmentDiv.innerHTML = elem.outerHTML;\n\
\t\t\tfragmentDiv.removeChild( clone = fragmentDiv.firstChild );\n\
\t\t}\n\
\n\
\t\tif ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&\n\
\t\t\t\t(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {\n\
\n\
\t\t\t// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2\n\
\t\t\tdestElements = getAll( clone );\n\
\t\t\tsrcElements = getAll( elem );\n\
\n\
\t\t\t// Fix all IE cloning issues\n\
\t\t\tfor ( i = 0; (node = srcElements[i]) != null; ++i ) {\n\
\t\t\t\t// Ensure that the destination node is not null; Fixes #9587\n\
\t\t\t\tif ( destElements[i] ) {\n\
\t\t\t\t\tfixCloneNodeIssues( node, destElements[i] );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Copy the events from the original to the clone\n\
\t\tif ( dataAndEvents ) {\n\
\t\t\tif ( deepDataAndEvents ) {\n\
\t\t\t\tsrcElements = srcElements || getAll( elem );\n\
\t\t\t\tdestElements = destElements || getAll( clone );\n\
\n\
\t\t\t\tfor ( i = 0; (node = srcElements[i]) != null; i++ ) {\n\
\t\t\t\t\tcloneCopyEvent( node, destElements[i] );\n\
\t\t\t\t}\n\
\t\t\t} else {\n\
\t\t\t\tcloneCopyEvent( elem, clone );\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Preserve script evaluation history\n\
\t\tdestElements = getAll( clone, \"script\" );\n\
\t\tif ( destElements.length > 0 ) {\n\
\t\t\tsetGlobalEval( destElements, !inPage && getAll( elem, \"script\" ) );\n\
\t\t}\n\
\n\
\t\tdestElements = srcElements = node = null;\n\
\n\
\t\t// Return the cloned set\n\
\t\treturn clone;\n\
\t},\n\
\n\
\tbuildFragment: function( elems, context, scripts, selection ) {\n\
\t\tvar j, elem, contains,\n\
\t\t\ttmp, tag, tbody, wrap,\n\
\t\t\tl = elems.length,\n\
\n\
\t\t\t// Ensure a safe fragment\n\
\t\t\tsafe = createSafeFragment( context ),\n\
\n\
\t\t\tnodes = [],\n\
\t\t\ti = 0;\n\
\n\
\t\tfor ( ; i < l; i++ ) {\n\
\t\t\telem = elems[ i ];\n\
\n\
\t\t\tif ( elem || elem === 0 ) {\n\
\n\
\t\t\t\t// Add nodes directly\n\
\t\t\t\tif ( jQuery.type( elem ) === \"object\" ) {\n\
\t\t\t\t\tjQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );\n\
\n\
\t\t\t\t// Convert non-html into a text node\n\
\t\t\t\t} else if ( !rhtml.test( elem ) ) {\n\
\t\t\t\t\tnodes.push( context.createTextNode( elem ) );\n\
\n\
\t\t\t\t// Convert html into DOM nodes\n\
\t\t\t\t} else {\n\
\t\t\t\t\ttmp = tmp || safe.appendChild( context.createElement(\"div\") );\n\
\n\
\t\t\t\t\t// Deserialize a standard representation\n\
\t\t\t\t\ttag = ( rtagName.exec( elem ) || [\"\", \"\"] )[1].toLowerCase();\n\
\t\t\t\t\twrap = wrapMap[ tag ] || wrapMap._default;\n\
\n\
\t\t\t\t\ttmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, \"<$1></$2>\" ) + wrap[2];\n\
\n\
\t\t\t\t\t// Descend through wrappers to the right content\n\
\t\t\t\t\tj = wrap[0];\n\
\t\t\t\t\twhile ( j-- ) {\n\
\t\t\t\t\t\ttmp = tmp.lastChild;\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Manually add leading whitespace removed by IE\n\
\t\t\t\t\tif ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {\n\
\t\t\t\t\t\tnodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Remove IE's autoinserted <tbody> from table fragments\n\
\t\t\t\t\tif ( !jQuery.support.tbody ) {\n\
\n\
\t\t\t\t\t\t// String was a <table>, *may* have spurious <tbody>\n\
\t\t\t\t\t\telem = tag === \"table\" && !rtbody.test( elem ) ?\n\
\t\t\t\t\t\t\ttmp.firstChild :\n\
\n\
\t\t\t\t\t\t\t// String was a bare <thead> or <tfoot>\n\
\t\t\t\t\t\t\twrap[1] === \"<table>\" && !rtbody.test( elem ) ?\n\
\t\t\t\t\t\t\t\ttmp :\n\
\t\t\t\t\t\t\t\t0;\n\
\n\
\t\t\t\t\t\tj = elem && elem.childNodes.length;\n\
\t\t\t\t\t\twhile ( j-- ) {\n\
\t\t\t\t\t\t\tif ( jQuery.nodeName( (tbody = elem.childNodes[j]), \"tbody\" ) && !tbody.childNodes.length ) {\n\
\t\t\t\t\t\t\t\telem.removeChild( tbody );\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\tjQuery.merge( nodes, tmp.childNodes );\n\
\n\
\t\t\t\t\t// Fix #12392 for WebKit and IE > 9\n\
\t\t\t\t\ttmp.textContent = \"\";\n\
\n\
\t\t\t\t\t// Fix #12392 for oldIE\n\
\t\t\t\t\twhile ( tmp.firstChild ) {\n\
\t\t\t\t\t\ttmp.removeChild( tmp.firstChild );\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Remember the top-level container for proper cleanup\n\
\t\t\t\t\ttmp = safe.lastChild;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Fix #11356: Clear elements from fragment\n\
\t\tif ( tmp ) {\n\
\t\t\tsafe.removeChild( tmp );\n\
\t\t}\n\
\n\
\t\t// Reset defaultChecked for any radios and checkboxes\n\
\t\t// about to be appended to the DOM in IE 6/7 (#8060)\n\
\t\tif ( !jQuery.support.appendChecked ) {\n\
\t\t\tjQuery.grep( getAll( nodes, \"input\" ), fixDefaultChecked );\n\
\t\t}\n\
\n\
\t\ti = 0;\n\
\t\twhile ( (elem = nodes[ i++ ]) ) {\n\
\n\
\t\t\t// #4087 - If origin and destination elements are the same, and this is\n\
\t\t\t// that element, do not do anything\n\
\t\t\tif ( selection && jQuery.inArray( elem, selection ) !== -1 ) {\n\
\t\t\t\tcontinue;\n\
\t\t\t}\n\
\n\
\t\t\tcontains = jQuery.contains( elem.ownerDocument, elem );\n\
\n\
\t\t\t// Append to fragment\n\
\t\t\ttmp = getAll( safe.appendChild( elem ), \"script\" );\n\
\n\
\t\t\t// Preserve script evaluation history\n\
\t\t\tif ( contains ) {\n\
\t\t\t\tsetGlobalEval( tmp );\n\
\t\t\t}\n\
\n\
\t\t\t// Capture executables\n\
\t\t\tif ( scripts ) {\n\
\t\t\t\tj = 0;\n\
\t\t\t\twhile ( (elem = tmp[ j++ ]) ) {\n\
\t\t\t\t\tif ( rscriptType.test( elem.type || \"\" ) ) {\n\
\t\t\t\t\t\tscripts.push( elem );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\ttmp = null;\n\
\n\
\t\treturn safe;\n\
\t},\n\
\n\
\tcleanData: function( elems, /* internal */ acceptData ) {\n\
\t\tvar elem, type, id, data,\n\
\t\t\ti = 0,\n\
\t\t\tinternalKey = jQuery.expando,\n\
\t\t\tcache = jQuery.cache,\n\
\t\t\tdeleteExpando = jQuery.support.deleteExpando,\n\
\t\t\tspecial = jQuery.event.special;\n\
\n\
\t\tfor ( ; (elem = elems[i]) != null; i++ ) {\n\
\n\
\t\t\tif ( acceptData || jQuery.acceptData( elem ) ) {\n\
\n\
\t\t\t\tid = elem[ internalKey ];\n\
\t\t\t\tdata = id && cache[ id ];\n\
\n\
\t\t\t\tif ( data ) {\n\
\t\t\t\t\tif ( data.events ) {\n\
\t\t\t\t\t\tfor ( type in data.events ) {\n\
\t\t\t\t\t\t\tif ( special[ type ] ) {\n\
\t\t\t\t\t\t\t\tjQuery.event.remove( elem, type );\n\
\n\
\t\t\t\t\t\t\t// This is a shortcut to avoid jQuery.event.remove's overhead\n\
\t\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\t\tjQuery.removeEvent( elem, type, data.handle );\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Remove cache only if it was not already removed by jQuery.event.remove\n\
\t\t\t\t\tif ( cache[ id ] ) {\n\
\n\
\t\t\t\t\t\tdelete cache[ id ];\n\
\n\
\t\t\t\t\t\t// IE does not allow us to delete expando properties from nodes,\n\
\t\t\t\t\t\t// nor does it have a removeAttribute function on Document nodes;\n\
\t\t\t\t\t\t// we must handle all of these cases\n\
\t\t\t\t\t\tif ( deleteExpando ) {\n\
\t\t\t\t\t\t\tdelete elem[ internalKey ];\n\
\n\
\t\t\t\t\t\t} else if ( typeof elem.removeAttribute !== core_strundefined ) {\n\
\t\t\t\t\t\t\telem.removeAttribute( internalKey );\n\
\n\
\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\telem[ internalKey ] = null;\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\tcore_deletedIds.push( id );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
});\n\
var iframe, getStyles, curCSS,\n\
\tralpha = /alpha\\([^)]*\\)/i,\n\
\tropacity = /opacity\\s*=\\s*([^)]*)/,\n\
\trposition = /^(top|right|bottom|left)$/,\n\
\t// swappable if display is none or starts with table except \"table\", \"table-cell\", or \"table-caption\"\n\
\t// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display\n\
\trdisplayswap = /^(none|table(?!-c[ea]).+)/,\n\
\trmargin = /^margin/,\n\
\trnumsplit = new RegExp( \"^(\" + core_pnum + \")(.*)$\", \"i\" ),\n\
\trnumnonpx = new RegExp( \"^(\" + core_pnum + \")(?!px)[a-z%]+$\", \"i\" ),\n\
\trrelNum = new RegExp( \"^([+-])=(\" + core_pnum + \")\", \"i\" ),\n\
\telemdisplay = { BODY: \"block\" },\n\
\n\
\tcssShow = { position: \"absolute\", visibility: \"hidden\", display: \"block\" },\n\
\tcssNormalTransform = {\n\
\t\tletterSpacing: 0,\n\
\t\tfontWeight: 400\n\
\t},\n\
\n\
\tcssExpand = [ \"Top\", \"Right\", \"Bottom\", \"Left\" ],\n\
\tcssPrefixes = [ \"Webkit\", \"O\", \"Moz\", \"ms\" ];\n\
\n\
// return a css property mapped to a potentially vendor prefixed property\n\
function vendorPropName( style, name ) {\n\
\n\
\t// shortcut for names that are not vendor prefixed\n\
\tif ( name in style ) {\n\
\t\treturn name;\n\
\t}\n\
\n\
\t// check for vendor prefixed names\n\
\tvar capName = name.charAt(0).toUpperCase() + name.slice(1),\n\
\t\torigName = name,\n\
\t\ti = cssPrefixes.length;\n\
\n\
\twhile ( i-- ) {\n\
\t\tname = cssPrefixes[ i ] + capName;\n\
\t\tif ( name in style ) {\n\
\t\t\treturn name;\n\
\t\t}\n\
\t}\n\
\n\
\treturn origName;\n\
}\n\
\n\
function isHidden( elem, el ) {\n\
\t// isHidden might be called from jQuery#filter function;\n\
\t// in that case, element will be second argument\n\
\telem = el || elem;\n\
\treturn jQuery.css( elem, \"display\" ) === \"none\" || !jQuery.contains( elem.ownerDocument, elem );\n\
}\n\
\n\
function showHide( elements, show ) {\n\
\tvar display, elem, hidden,\n\
\t\tvalues = [],\n\
\t\tindex = 0,\n\
\t\tlength = elements.length;\n\
\n\
\tfor ( ; index < length; index++ ) {\n\
\t\telem = elements[ index ];\n\
\t\tif ( !elem.style ) {\n\
\t\t\tcontinue;\n\
\t\t}\n\
\n\
\t\tvalues[ index ] = jQuery._data( elem, \"olddisplay\" );\n\
\t\tdisplay = elem.style.display;\n\
\t\tif ( show ) {\n\
\t\t\t// Reset the inline display of this element to learn if it is\n\
\t\t\t// being hidden by cascaded rules or not\n\
\t\t\tif ( !values[ index ] && display === \"none\" ) {\n\
\t\t\t\telem.style.display = \"\";\n\
\t\t\t}\n\
\n\
\t\t\t// Set elements which have been overridden with display: none\n\
\t\t\t// in a stylesheet to whatever the default browser style is\n\
\t\t\t// for such an element\n\
\t\t\tif ( elem.style.display === \"\" && isHidden( elem ) ) {\n\
\t\t\t\tvalues[ index ] = jQuery._data( elem, \"olddisplay\", css_defaultDisplay(elem.nodeName) );\n\
\t\t\t}\n\
\t\t} else {\n\
\n\
\t\t\tif ( !values[ index ] ) {\n\
\t\t\t\thidden = isHidden( elem );\n\
\n\
\t\t\t\tif ( display && display !== \"none\" || !hidden ) {\n\
\t\t\t\t\tjQuery._data( elem, \"olddisplay\", hidden ? display : jQuery.css( elem, \"display\" ) );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\t// Set the display of most of the elements in a second loop\n\
\t// to avoid the constant reflow\n\
\tfor ( index = 0; index < length; index++ ) {\n\
\t\telem = elements[ index ];\n\
\t\tif ( !elem.style ) {\n\
\t\t\tcontinue;\n\
\t\t}\n\
\t\tif ( !show || elem.style.display === \"none\" || elem.style.display === \"\" ) {\n\
\t\t\telem.style.display = show ? values[ index ] || \"\" : \"none\";\n\
\t\t}\n\
\t}\n\
\n\
\treturn elements;\n\
}\n\
\n\
jQuery.fn.extend({\n\
\tcss: function( name, value ) {\n\
\t\treturn jQuery.access( this, function( elem, name, value ) {\n\
\t\t\tvar len, styles,\n\
\t\t\t\tmap = {},\n\
\t\t\t\ti = 0;\n\
\n\
\t\t\tif ( jQuery.isArray( name ) ) {\n\
\t\t\t\tstyles = getStyles( elem );\n\
\t\t\t\tlen = name.length;\n\
\n\
\t\t\t\tfor ( ; i < len; i++ ) {\n\
\t\t\t\t\tmap[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );\n\
\t\t\t\t}\n\
\n\
\t\t\t\treturn map;\n\
\t\t\t}\n\
\n\
\t\t\treturn value !== undefined ?\n\
\t\t\t\tjQuery.style( elem, name, value ) :\n\
\t\t\t\tjQuery.css( elem, name );\n\
\t\t}, name, value, arguments.length > 1 );\n\
\t},\n\
\tshow: function() {\n\
\t\treturn showHide( this, true );\n\
\t},\n\
\thide: function() {\n\
\t\treturn showHide( this );\n\
\t},\n\
\ttoggle: function( state ) {\n\
\t\tvar bool = typeof state === \"boolean\";\n\
\n\
\t\treturn this.each(function() {\n\
\t\t\tif ( bool ? state : isHidden( this ) ) {\n\
\t\t\t\tjQuery( this ).show();\n\
\t\t\t} else {\n\
\t\t\t\tjQuery( this ).hide();\n\
\t\t\t}\n\
\t\t});\n\
\t}\n\
});\n\
\n\
jQuery.extend({\n\
\t// Add in style property hooks for overriding the default\n\
\t// behavior of getting and setting a style property\n\
\tcssHooks: {\n\
\t\topacity: {\n\
\t\t\tget: function( elem, computed ) {\n\
\t\t\t\tif ( computed ) {\n\
\t\t\t\t\t// We should always get a number back from opacity\n\
\t\t\t\t\tvar ret = curCSS( elem, \"opacity\" );\n\
\t\t\t\t\treturn ret === \"\" ? \"1\" : ret;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t},\n\
\n\
\t// Exclude the following css properties to add px\n\
\tcssNumber: {\n\
\t\t\"columnCount\": true,\n\
\t\t\"fillOpacity\": true,\n\
\t\t\"fontWeight\": true,\n\
\t\t\"lineHeight\": true,\n\
\t\t\"opacity\": true,\n\
\t\t\"orphans\": true,\n\
\t\t\"widows\": true,\n\
\t\t\"zIndex\": true,\n\
\t\t\"zoom\": true\n\
\t},\n\
\n\
\t// Add in properties whose names you wish to fix before\n\
\t// setting or getting the value\n\
\tcssProps: {\n\
\t\t// normalize float css property\n\
\t\t\"float\": jQuery.support.cssFloat ? \"cssFloat\" : \"styleFloat\"\n\
\t},\n\
\n\
\t// Get and set the style property on a DOM Node\n\
\tstyle: function( elem, name, value, extra ) {\n\
\t\t// Don't set styles on text and comment nodes\n\
\t\tif ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\t// Make sure that we're working with the right name\n\
\t\tvar ret, type, hooks,\n\
\t\t\torigName = jQuery.camelCase( name ),\n\
\t\t\tstyle = elem.style;\n\
\n\
\t\tname = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );\n\
\n\
\t\t// gets hook for the prefixed version\n\
\t\t// followed by the unprefixed version\n\
\t\thooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];\n\
\n\
\t\t// Check if we're setting a value\n\
\t\tif ( value !== undefined ) {\n\
\t\t\ttype = typeof value;\n\
\n\
\t\t\t// convert relative number strings (+= or -=) to relative numbers. #7345\n\
\t\t\tif ( type === \"string\" && (ret = rrelNum.exec( value )) ) {\n\
\t\t\t\tvalue = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );\n\
\t\t\t\t// Fixes bug #9237\n\
\t\t\t\ttype = \"number\";\n\
\t\t\t}\n\
\n\
\t\t\t// Make sure that NaN and null values aren't set. See: #7116\n\
\t\t\tif ( value == null || type === \"number\" && isNaN( value ) ) {\n\
\t\t\t\treturn;\n\
\t\t\t}\n\
\n\
\t\t\t// If a number was passed in, add 'px' to the (except for certain CSS properties)\n\
\t\t\tif ( type === \"number\" && !jQuery.cssNumber[ origName ] ) {\n\
\t\t\t\tvalue += \"px\";\n\
\t\t\t}\n\
\n\
\t\t\t// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,\n\
\t\t\t// but it would mean to define eight (for every problematic property) identical functions\n\
\t\t\tif ( !jQuery.support.clearCloneStyle && value === \"\" && name.indexOf(\"background\") === 0 ) {\n\
\t\t\t\tstyle[ name ] = \"inherit\";\n\
\t\t\t}\n\
\n\
\t\t\t// If a hook was provided, use that value, otherwise just set the specified value\n\
\t\t\tif ( !hooks || !(\"set\" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {\n\
\n\
\t\t\t\t// Wrapped to prevent IE from throwing errors when 'invalid' values are provided\n\
\t\t\t\t// Fixes bug #5509\n\
\t\t\t\ttry {\n\
\t\t\t\t\tstyle[ name ] = value;\n\
\t\t\t\t} catch(e) {}\n\
\t\t\t}\n\
\n\
\t\t} else {\n\
\t\t\t// If a hook was provided get the non-computed value from there\n\
\t\t\tif ( hooks && \"get\" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {\n\
\t\t\t\treturn ret;\n\
\t\t\t}\n\
\n\
\t\t\t// Otherwise just get the value from the style object\n\
\t\t\treturn style[ name ];\n\
\t\t}\n\
\t},\n\
\n\
\tcss: function( elem, name, extra, styles ) {\n\
\t\tvar num, val, hooks,\n\
\t\t\torigName = jQuery.camelCase( name );\n\
\n\
\t\t// Make sure that we're working with the right name\n\
\t\tname = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );\n\
\n\
\t\t// gets hook for the prefixed version\n\
\t\t// followed by the unprefixed version\n\
\t\thooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];\n\
\n\
\t\t// If a hook was provided get the computed value from there\n\
\t\tif ( hooks && \"get\" in hooks ) {\n\
\t\t\tval = hooks.get( elem, true, extra );\n\
\t\t}\n\
\n\
\t\t// Otherwise, if a way to get the computed value exists, use that\n\
\t\tif ( val === undefined ) {\n\
\t\t\tval = curCSS( elem, name, styles );\n\
\t\t}\n\
\n\
\t\t//convert \"normal\" to computed value\n\
\t\tif ( val === \"normal\" && name in cssNormalTransform ) {\n\
\t\t\tval = cssNormalTransform[ name ];\n\
\t\t}\n\
\n\
\t\t// Return, converting to number if forced or a qualifier was provided and val looks numeric\n\
\t\tif ( extra === \"\" || extra ) {\n\
\t\t\tnum = parseFloat( val );\n\
\t\t\treturn extra === true || jQuery.isNumeric( num ) ? num || 0 : val;\n\
\t\t}\n\
\t\treturn val;\n\
\t},\n\
\n\
\t// A method for quickly swapping in/out CSS properties to get correct calculations\n\
\tswap: function( elem, options, callback, args ) {\n\
\t\tvar ret, name,\n\
\t\t\told = {};\n\
\n\
\t\t// Remember the old values, and insert the new ones\n\
\t\tfor ( name in options ) {\n\
\t\t\told[ name ] = elem.style[ name ];\n\
\t\t\telem.style[ name ] = options[ name ];\n\
\t\t}\n\
\n\
\t\tret = callback.apply( elem, args || [] );\n\
\n\
\t\t// Revert the old values\n\
\t\tfor ( name in options ) {\n\
\t\t\telem.style[ name ] = old[ name ];\n\
\t\t}\n\
\n\
\t\treturn ret;\n\
\t}\n\
});\n\
\n\
// NOTE: we've included the \"window\" in window.getComputedStyle\n\
// because jsdom on node.js will break without it.\n\
if ( window.getComputedStyle ) {\n\
\tgetStyles = function( elem ) {\n\
\t\treturn window.getComputedStyle( elem, null );\n\
\t};\n\
\n\
\tcurCSS = function( elem, name, _computed ) {\n\
\t\tvar width, minWidth, maxWidth,\n\
\t\t\tcomputed = _computed || getStyles( elem ),\n\
\n\
\t\t\t// getPropertyValue is only needed for .css('filter') in IE9, see #12537\n\
\t\t\tret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,\n\
\t\t\tstyle = elem.style;\n\
\n\
\t\tif ( computed ) {\n\
\n\
\t\t\tif ( ret === \"\" && !jQuery.contains( elem.ownerDocument, elem ) ) {\n\
\t\t\t\tret = jQuery.style( elem, name );\n\
\t\t\t}\n\
\n\
\t\t\t// A tribute to the \"awesome hack by Dean Edwards\"\n\
\t\t\t// Chrome < 17 and Safari 5.0 uses \"computed value\" instead of \"used value\" for margin-right\n\
\t\t\t// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels\n\
\t\t\t// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values\n\
\t\t\tif ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {\n\
\n\
\t\t\t\t// Remember the original values\n\
\t\t\t\twidth = style.width;\n\
\t\t\t\tminWidth = style.minWidth;\n\
\t\t\t\tmaxWidth = style.maxWidth;\n\
\n\
\t\t\t\t// Put in the new values to get a computed value out\n\
\t\t\t\tstyle.minWidth = style.maxWidth = style.width = ret;\n\
\t\t\t\tret = computed.width;\n\
\n\
\t\t\t\t// Revert the changed values\n\
\t\t\t\tstyle.width = width;\n\
\t\t\t\tstyle.minWidth = minWidth;\n\
\t\t\t\tstyle.maxWidth = maxWidth;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn ret;\n\
\t};\n\
} else if ( document.documentElement.currentStyle ) {\n\
\tgetStyles = function( elem ) {\n\
\t\treturn elem.currentStyle;\n\
\t};\n\
\n\
\tcurCSS = function( elem, name, _computed ) {\n\
\t\tvar left, rs, rsLeft,\n\
\t\t\tcomputed = _computed || getStyles( elem ),\n\
\t\t\tret = computed ? computed[ name ] : undefined,\n\
\t\t\tstyle = elem.style;\n\
\n\
\t\t// Avoid setting ret to empty string here\n\
\t\t// so we don't default to auto\n\
\t\tif ( ret == null && style && style[ name ] ) {\n\
\t\t\tret = style[ name ];\n\
\t\t}\n\
\n\
\t\t// From the awesome hack by Dean Edwards\n\
\t\t// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291\n\
\n\
\t\t// If we're not dealing with a regular pixel number\n\
\t\t// but a number that has a weird ending, we need to convert it to pixels\n\
\t\t// but not position css attributes, as those are proportional to the parent element instead\n\
\t\t// and we can't measure the parent instead because it might trigger a \"stacking dolls\" problem\n\
\t\tif ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {\n\
\n\
\t\t\t// Remember the original values\n\
\t\t\tleft = style.left;\n\
\t\t\trs = elem.runtimeStyle;\n\
\t\t\trsLeft = rs && rs.left;\n\
\n\
\t\t\t// Put in the new values to get a computed value out\n\
\t\t\tif ( rsLeft ) {\n\
\t\t\t\trs.left = elem.currentStyle.left;\n\
\t\t\t}\n\
\t\t\tstyle.left = name === \"fontSize\" ? \"1em\" : ret;\n\
\t\t\tret = style.pixelLeft + \"px\";\n\
\n\
\t\t\t// Revert the changed values\n\
\t\t\tstyle.left = left;\n\
\t\t\tif ( rsLeft ) {\n\
\t\t\t\trs.left = rsLeft;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn ret === \"\" ? \"auto\" : ret;\n\
\t};\n\
}\n\
\n\
function setPositiveNumber( elem, value, subtract ) {\n\
\tvar matches = rnumsplit.exec( value );\n\
\treturn matches ?\n\
\t\t// Guard against undefined \"subtract\", e.g., when used as in cssHooks\n\
\t\tMath.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || \"px\" ) :\n\
\t\tvalue;\n\
}\n\
\n\
function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {\n\
\tvar i = extra === ( isBorderBox ? \"border\" : \"content\" ) ?\n\
\t\t// If we already have the right measurement, avoid augmentation\n\
\t\t4 :\n\
\t\t// Otherwise initialize for horizontal or vertical properties\n\
\t\tname === \"width\" ? 1 : 0,\n\
\n\
\t\tval = 0;\n\
\n\
\tfor ( ; i < 4; i += 2 ) {\n\
\t\t// both box models exclude margin, so add it if we want it\n\
\t\tif ( extra === \"margin\" ) {\n\
\t\t\tval += jQuery.css( elem, extra + cssExpand[ i ], true, styles );\n\
\t\t}\n\
\n\
\t\tif ( isBorderBox ) {\n\
\t\t\t// border-box includes padding, so remove it if we want content\n\
\t\t\tif ( extra === \"content\" ) {\n\
\t\t\t\tval -= jQuery.css( elem, \"padding\" + cssExpand[ i ], true, styles );\n\
\t\t\t}\n\
\n\
\t\t\t// at this point, extra isn't border nor margin, so remove border\n\
\t\t\tif ( extra !== \"margin\" ) {\n\
\t\t\t\tval -= jQuery.css( elem, \"border\" + cssExpand[ i ] + \"Width\", true, styles );\n\
\t\t\t}\n\
\t\t} else {\n\
\t\t\t// at this point, extra isn't content, so add padding\n\
\t\t\tval += jQuery.css( elem, \"padding\" + cssExpand[ i ], true, styles );\n\
\n\
\t\t\t// at this point, extra isn't content nor padding, so add border\n\
\t\t\tif ( extra !== \"padding\" ) {\n\
\t\t\t\tval += jQuery.css( elem, \"border\" + cssExpand[ i ] + \"Width\", true, styles );\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\treturn val;\n\
}\n\
\n\
function getWidthOrHeight( elem, name, extra ) {\n\
\n\
\t// Start with offset property, which is equivalent to the border-box value\n\
\tvar valueIsBorderBox = true,\n\
\t\tval = name === \"width\" ? elem.offsetWidth : elem.offsetHeight,\n\
\t\tstyles = getStyles( elem ),\n\
\t\tisBorderBox = jQuery.support.boxSizing && jQuery.css( elem, \"boxSizing\", false, styles ) === \"border-box\";\n\
\n\
\t// some non-html elements return undefined for offsetWidth, so check for null/undefined\n\
\t// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285\n\
\t// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668\n\
\tif ( val <= 0 || val == null ) {\n\
\t\t// Fall back to computed then uncomputed css if necessary\n\
\t\tval = curCSS( elem, name, styles );\n\
\t\tif ( val < 0 || val == null ) {\n\
\t\t\tval = elem.style[ name ];\n\
\t\t}\n\
\n\
\t\t// Computed unit is not pixels. Stop here and return.\n\
\t\tif ( rnumnonpx.test(val) ) {\n\
\t\t\treturn val;\n\
\t\t}\n\
\n\
\t\t// we need the check for style in case a browser which returns unreliable values\n\
\t\t// for getComputedStyle silently falls back to the reliable elem.style\n\
\t\tvalueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );\n\
\n\
\t\t// Normalize \"\", auto, and prepare for extra\n\
\t\tval = parseFloat( val ) || 0;\n\
\t}\n\
\n\
\t// use the active box-sizing model to add/subtract irrelevant styles\n\
\treturn ( val +\n\
\t\taugmentWidthOrHeight(\n\
\t\t\telem,\n\
\t\t\tname,\n\
\t\t\textra || ( isBorderBox ? \"border\" : \"content\" ),\n\
\t\t\tvalueIsBorderBox,\n\
\t\t\tstyles\n\
\t\t)\n\
\t) + \"px\";\n\
}\n\
\n\
// Try to determine the default display value of an element\n\
function css_defaultDisplay( nodeName ) {\n\
\tvar doc = document,\n\
\t\tdisplay = elemdisplay[ nodeName ];\n\
\n\
\tif ( !display ) {\n\
\t\tdisplay = actualDisplay( nodeName, doc );\n\
\n\
\t\t// If the simple way fails, read from inside an iframe\n\
\t\tif ( display === \"none\" || !display ) {\n\
\t\t\t// Use the already-created iframe if possible\n\
\t\t\tiframe = ( iframe ||\n\
\t\t\t\tjQuery(\"<iframe frameborder='0' width='0' height='0'/>\")\n\
\t\t\t\t.css( \"cssText\", \"display:block !important\" )\n\
\t\t\t).appendTo( doc.documentElement );\n\
\n\
\t\t\t// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse\n\
\t\t\tdoc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;\n\
\t\t\tdoc.write(\"<!doctype html><html><body>\");\n\
\t\t\tdoc.close();\n\
\n\
\t\t\tdisplay = actualDisplay( nodeName, doc );\n\
\t\t\tiframe.detach();\n\
\t\t}\n\
\n\
\t\t// Store the correct default display\n\
\t\telemdisplay[ nodeName ] = display;\n\
\t}\n\
\n\
\treturn display;\n\
}\n\
\n\
// Called ONLY from within css_defaultDisplay\n\
function actualDisplay( name, doc ) {\n\
\tvar elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),\n\
\t\tdisplay = jQuery.css( elem[0], \"display\" );\n\
\telem.remove();\n\
\treturn display;\n\
}\n\
\n\
jQuery.each([ \"height\", \"width\" ], function( i, name ) {\n\
\tjQuery.cssHooks[ name ] = {\n\
\t\tget: function( elem, computed, extra ) {\n\
\t\t\tif ( computed ) {\n\
\t\t\t\t// certain elements can have dimension info if we invisibly show them\n\
\t\t\t\t// however, it must have a current display style that would benefit from this\n\
\t\t\t\treturn elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, \"display\" ) ) ?\n\
\t\t\t\t\tjQuery.swap( elem, cssShow, function() {\n\
\t\t\t\t\t\treturn getWidthOrHeight( elem, name, extra );\n\
\t\t\t\t\t}) :\n\
\t\t\t\t\tgetWidthOrHeight( elem, name, extra );\n\
\t\t\t}\n\
\t\t},\n\
\n\
\t\tset: function( elem, value, extra ) {\n\
\t\t\tvar styles = extra && getStyles( elem );\n\
\t\t\treturn setPositiveNumber( elem, value, extra ?\n\
\t\t\t\taugmentWidthOrHeight(\n\
\t\t\t\t\telem,\n\
\t\t\t\t\tname,\n\
\t\t\t\t\textra,\n\
\t\t\t\t\tjQuery.support.boxSizing && jQuery.css( elem, \"boxSizing\", false, styles ) === \"border-box\",\n\
\t\t\t\t\tstyles\n\
\t\t\t\t) : 0\n\
\t\t\t);\n\
\t\t}\n\
\t};\n\
});\n\
\n\
if ( !jQuery.support.opacity ) {\n\
\tjQuery.cssHooks.opacity = {\n\
\t\tget: function( elem, computed ) {\n\
\t\t\t// IE uses filters for opacity\n\
\t\t\treturn ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || \"\" ) ?\n\
\t\t\t\t( 0.01 * parseFloat( RegExp.$1 ) ) + \"\" :\n\
\t\t\t\tcomputed ? \"1\" : \"\";\n\
\t\t},\n\
\n\
\t\tset: function( elem, value ) {\n\
\t\t\tvar style = elem.style,\n\
\t\t\t\tcurrentStyle = elem.currentStyle,\n\
\t\t\t\topacity = jQuery.isNumeric( value ) ? \"alpha(opacity=\" + value * 100 + \")\" : \"\",\n\
\t\t\t\tfilter = currentStyle && currentStyle.filter || style.filter || \"\";\n\
\n\
\t\t\t// IE has trouble with opacity if it does not have layout\n\
\t\t\t// Force it by setting the zoom level\n\
\t\t\tstyle.zoom = 1;\n\
\n\
\t\t\t// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652\n\
\t\t\t// if value === \"\", then remove inline opacity #12685\n\
\t\t\tif ( ( value >= 1 || value === \"\" ) &&\n\
\t\t\t\t\tjQuery.trim( filter.replace( ralpha, \"\" ) ) === \"\" &&\n\
\t\t\t\t\tstyle.removeAttribute ) {\n\
\n\
\t\t\t\t// Setting style.filter to null, \"\" & \" \" still leave \"filter:\" in the cssText\n\
\t\t\t\t// if \"filter:\" is present at all, clearType is disabled, we want to avoid this\n\
\t\t\t\t// style.removeAttribute is IE Only, but so apparently is this code path...\n\
\t\t\t\tstyle.removeAttribute( \"filter\" );\n\
\n\
\t\t\t\t// if there is no filter style applied in a css rule or unset inline opacity, we are done\n\
\t\t\t\tif ( value === \"\" || currentStyle && !currentStyle.filter ) {\n\
\t\t\t\t\treturn;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// otherwise, set new filter values\n\
\t\t\tstyle.filter = ralpha.test( filter ) ?\n\
\t\t\t\tfilter.replace( ralpha, opacity ) :\n\
\t\t\t\tfilter + \" \" + opacity;\n\
\t\t}\n\
\t};\n\
}\n\
\n\
// These hooks cannot be added until DOM ready because the support test\n\
// for it is not run until after DOM ready\n\
jQuery(function() {\n\
\tif ( !jQuery.support.reliableMarginRight ) {\n\
\t\tjQuery.cssHooks.marginRight = {\n\
\t\t\tget: function( elem, computed ) {\n\
\t\t\t\tif ( computed ) {\n\
\t\t\t\t\t// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
\t\t\t\t\t// Work around by temporarily setting element display to inline-block\n\
\t\t\t\t\treturn jQuery.swap( elem, { \"display\": \"inline-block\" },\n\
\t\t\t\t\t\tcurCSS, [ elem, \"marginRight\" ] );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t};\n\
\t}\n\
\n\
\t// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084\n\
\t// getComputedStyle returns percent when specified for top/left/bottom/right\n\
\t// rather than make the css module depend on the offset module, we just check for it here\n\
\tif ( !jQuery.support.pixelPosition && jQuery.fn.position ) {\n\
\t\tjQuery.each( [ \"top\", \"left\" ], function( i, prop ) {\n\
\t\t\tjQuery.cssHooks[ prop ] = {\n\
\t\t\t\tget: function( elem, computed ) {\n\
\t\t\t\t\tif ( computed ) {\n\
\t\t\t\t\t\tcomputed = curCSS( elem, prop );\n\
\t\t\t\t\t\t// if curCSS returns percentage, fallback to offset\n\
\t\t\t\t\t\treturn rnumnonpx.test( computed ) ?\n\
\t\t\t\t\t\t\tjQuery( elem ).position()[ prop ] + \"px\" :\n\
\t\t\t\t\t\t\tcomputed;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t};\n\
\t\t});\n\
\t}\n\
\n\
});\n\
\n\
if ( jQuery.expr && jQuery.expr.filters ) {\n\
\tjQuery.expr.filters.hidden = function( elem ) {\n\
\t\t// Support: Opera <= 12.12\n\
\t\t// Opera reports offsetWidths and offsetHeights less than zero on some elements\n\
\t\treturn elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||\n\
\t\t\t(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, \"display\" )) === \"none\");\n\
\t};\n\
\n\
\tjQuery.expr.filters.visible = function( elem ) {\n\
\t\treturn !jQuery.expr.filters.hidden( elem );\n\
\t};\n\
}\n\
\n\
// These hooks are used by animate to expand properties\n\
jQuery.each({\n\
\tmargin: \"\",\n\
\tpadding: \"\",\n\
\tborder: \"Width\"\n\
}, function( prefix, suffix ) {\n\
\tjQuery.cssHooks[ prefix + suffix ] = {\n\
\t\texpand: function( value ) {\n\
\t\t\tvar i = 0,\n\
\t\t\t\texpanded = {},\n\
\n\
\t\t\t\t// assumes a single number if not a string\n\
\t\t\t\tparts = typeof value === \"string\" ? value.split(\" \") : [ value ];\n\
\n\
\t\t\tfor ( ; i < 4; i++ ) {\n\
\t\t\t\texpanded[ prefix + cssExpand[ i ] + suffix ] =\n\
\t\t\t\t\tparts[ i ] || parts[ i - 2 ] || parts[ 0 ];\n\
\t\t\t}\n\
\n\
\t\t\treturn expanded;\n\
\t\t}\n\
\t};\n\
\n\
\tif ( !rmargin.test( prefix ) ) {\n\
\t\tjQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;\n\
\t}\n\
});\n\
var r20 = /%20/g,\n\
\trbracket = /\\[\\]$/,\n\
\trCRLF = /\\r?\\n\
/g,\n\
\trsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,\n\
\trsubmittable = /^(?:input|select|textarea|keygen)/i;\n\
\n\
jQuery.fn.extend({\n\
\tserialize: function() {\n\
\t\treturn jQuery.param( this.serializeArray() );\n\
\t},\n\
\tserializeArray: function() {\n\
\t\treturn this.map(function(){\n\
\t\t\t// Can add propHook for \"elements\" to filter or add form elements\n\
\t\t\tvar elements = jQuery.prop( this, \"elements\" );\n\
\t\t\treturn elements ? jQuery.makeArray( elements ) : this;\n\
\t\t})\n\
\t\t.filter(function(){\n\
\t\t\tvar type = this.type;\n\
\t\t\t// Use .is(\":disabled\") so that fieldset[disabled] works\n\
\t\t\treturn this.name && !jQuery( this ).is( \":disabled\" ) &&\n\
\t\t\t\trsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&\n\
\t\t\t\t( this.checked || !manipulation_rcheckableType.test( type ) );\n\
\t\t})\n\
\t\t.map(function( i, elem ){\n\
\t\t\tvar val = jQuery( this ).val();\n\
\n\
\t\t\treturn val == null ?\n\
\t\t\t\tnull :\n\
\t\t\t\tjQuery.isArray( val ) ?\n\
\t\t\t\t\tjQuery.map( val, function( val ){\n\
\t\t\t\t\t\treturn { name: elem.name, value: val.replace( rCRLF, \"\\r\\n\
\" ) };\n\
\t\t\t\t\t}) :\n\
\t\t\t\t\t{ name: elem.name, value: val.replace( rCRLF, \"\\r\\n\
\" ) };\n\
\t\t}).get();\n\
\t}\n\
});\n\
\n\
//Serialize an array of form elements or a set of\n\
//key/values into a query string\n\
jQuery.param = function( a, traditional ) {\n\
\tvar prefix,\n\
\t\ts = [],\n\
\t\tadd = function( key, value ) {\n\
\t\t\t// If value is a function, invoke it and return its value\n\
\t\t\tvalue = jQuery.isFunction( value ) ? value() : ( value == null ? \"\" : value );\n\
\t\t\ts[ s.length ] = encodeURIComponent( key ) + \"=\" + encodeURIComponent( value );\n\
\t\t};\n\
\n\
\t// Set traditional to true for jQuery <= 1.3.2 behavior.\n\
\tif ( traditional === undefined ) {\n\
\t\ttraditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;\n\
\t}\n\
\n\
\t// If an array was passed in, assume that it is an array of form elements.\n\
\tif ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {\n\
\t\t// Serialize the form elements\n\
\t\tjQuery.each( a, function() {\n\
\t\t\tadd( this.name, this.value );\n\
\t\t});\n\
\n\
\t} else {\n\
\t\t// If traditional, encode the \"old\" way (the way 1.3.2 or older\n\
\t\t// did it), otherwise encode params recursively.\n\
\t\tfor ( prefix in a ) {\n\
\t\t\tbuildParams( prefix, a[ prefix ], traditional, add );\n\
\t\t}\n\
\t}\n\
\n\
\t// Return the resulting serialization\n\
\treturn s.join( \"&\" ).replace( r20, \"+\" );\n\
};\n\
\n\
function buildParams( prefix, obj, traditional, add ) {\n\
\tvar name;\n\
\n\
\tif ( jQuery.isArray( obj ) ) {\n\
\t\t// Serialize array item.\n\
\t\tjQuery.each( obj, function( i, v ) {\n\
\t\t\tif ( traditional || rbracket.test( prefix ) ) {\n\
\t\t\t\t// Treat each array item as a scalar.\n\
\t\t\t\tadd( prefix, v );\n\
\n\
\t\t\t} else {\n\
\t\t\t\t// Item is non-scalar (array or object), encode its numeric index.\n\
\t\t\t\tbuildParams( prefix + \"[\" + ( typeof v === \"object\" ? i : \"\" ) + \"]\", v, traditional, add );\n\
\t\t\t}\n\
\t\t});\n\
\n\
\t} else if ( !traditional && jQuery.type( obj ) === \"object\" ) {\n\
\t\t// Serialize object item.\n\
\t\tfor ( name in obj ) {\n\
\t\t\tbuildParams( prefix + \"[\" + name + \"]\", obj[ name ], traditional, add );\n\
\t\t}\n\
\n\
\t} else {\n\
\t\t// Serialize scalar item.\n\
\t\tadd( prefix, obj );\n\
\t}\n\
}\n\
jQuery.each( (\"blur focus focusin focusout load resize scroll unload click dblclick \" +\n\
\t\"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave \" +\n\
\t\"change select submit keydown keypress keyup error contextmenu\").split(\" \"), function( i, name ) {\n\
\n\
\t// Handle event binding\n\
\tjQuery.fn[ name ] = function( data, fn ) {\n\
\t\treturn arguments.length > 0 ?\n\
\t\t\tthis.on( name, null, data, fn ) :\n\
\t\t\tthis.trigger( name );\n\
\t};\n\
});\n\
\n\
jQuery.fn.hover = function( fnOver, fnOut ) {\n\
\treturn this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );\n\
};\n\
var\n\
\t// Document location\n\
\tajaxLocParts,\n\
\tajaxLocation,\n\
\tajax_nonce = jQuery.now(),\n\
\n\
\tajax_rquery = /\\?/,\n\
\trhash = /#.*$/,\n\
\trts = /([?&])_=[^&]*/,\n\
\trheaders = /^(.*?):[ \\t]*([^\\r\\n\
]*)\\r?$/mg, // IE leaves an \\r character at EOL\n\
\t// #7653, #8125, #8152: local protocol detection\n\
\trlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,\n\
\trnoContent = /^(?:GET|HEAD)$/,\n\
\trprotocol = /^\\/\\//,\n\
\trurl = /^([\\w.+-]+:)(?:\\/\\/([^\\/?#:]*)(?::(\\d+)|)|)/,\n\
\n\
\t// Keep a copy of the old load method\n\
\t_load = jQuery.fn.load,\n\
\n\
\t/* Prefilters\n\
\t * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)\n\
\t * 2) These are called:\n\
\t *    - BEFORE asking for a transport\n\
\t *    - AFTER param serialization (s.data is a string if s.processData is true)\n\
\t * 3) key is the dataType\n\
\t * 4) the catchall symbol \"*\" can be used\n\
\t * 5) execution will start with transport dataType and THEN continue down to \"*\" if needed\n\
\t */\n\
\tprefilters = {},\n\
\n\
\t/* Transports bindings\n\
\t * 1) key is the dataType\n\
\t * 2) the catchall symbol \"*\" can be used\n\
\t * 3) selection will start with transport dataType and THEN go to \"*\" if needed\n\
\t */\n\
\ttransports = {},\n\
\n\
\t// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression\n\
\tallTypes = \"*/\".concat(\"*\");\n\
\n\
// #8138, IE may throw an exception when accessing\n\
// a field from window.location if document.domain has been set\n\
try {\n\
\tajaxLocation = location.href;\n\
} catch( e ) {\n\
\t// Use the href attribute of an A element\n\
\t// since IE will modify it given document.location\n\
\tajaxLocation = document.createElement( \"a\" );\n\
\tajaxLocation.href = \"\";\n\
\tajaxLocation = ajaxLocation.href;\n\
}\n\
\n\
// Segment location into parts\n\
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];\n\
\n\
// Base \"constructor\" for jQuery.ajaxPrefilter and jQuery.ajaxTransport\n\
function addToPrefiltersOrTransports( structure ) {\n\
\n\
\t// dataTypeExpression is optional and defaults to \"*\"\n\
\treturn function( dataTypeExpression, func ) {\n\
\n\
\t\tif ( typeof dataTypeExpression !== \"string\" ) {\n\
\t\t\tfunc = dataTypeExpression;\n\
\t\t\tdataTypeExpression = \"*\";\n\
\t\t}\n\
\n\
\t\tvar dataType,\n\
\t\t\ti = 0,\n\
\t\t\tdataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];\n\
\n\
\t\tif ( jQuery.isFunction( func ) ) {\n\
\t\t\t// For each dataType in the dataTypeExpression\n\
\t\t\twhile ( (dataType = dataTypes[i++]) ) {\n\
\t\t\t\t// Prepend if requested\n\
\t\t\t\tif ( dataType[0] === \"+\" ) {\n\
\t\t\t\t\tdataType = dataType.slice( 1 ) || \"*\";\n\
\t\t\t\t\t(structure[ dataType ] = structure[ dataType ] || []).unshift( func );\n\
\n\
\t\t\t\t// Otherwise append\n\
\t\t\t\t} else {\n\
\t\t\t\t\t(structure[ dataType ] = structure[ dataType ] || []).push( func );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t};\n\
}\n\
\n\
// Base inspection function for prefilters and transports\n\
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {\n\
\n\
\tvar inspected = {},\n\
\t\tseekingTransport = ( structure === transports );\n\
\n\
\tfunction inspect( dataType ) {\n\
\t\tvar selected;\n\
\t\tinspected[ dataType ] = true;\n\
\t\tjQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {\n\
\t\t\tvar dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );\n\
\t\t\tif( typeof dataTypeOrTransport === \"string\" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {\n\
\t\t\t\toptions.dataTypes.unshift( dataTypeOrTransport );\n\
\t\t\t\tinspect( dataTypeOrTransport );\n\
\t\t\t\treturn false;\n\
\t\t\t} else if ( seekingTransport ) {\n\
\t\t\t\treturn !( selected = dataTypeOrTransport );\n\
\t\t\t}\n\
\t\t});\n\
\t\treturn selected;\n\
\t}\n\
\n\
\treturn inspect( options.dataTypes[ 0 ] ) || !inspected[ \"*\" ] && inspect( \"*\" );\n\
}\n\
\n\
// A special extend for ajax options\n\
// that takes \"flat\" options (not to be deep extended)\n\
// Fixes #9887\n\
function ajaxExtend( target, src ) {\n\
\tvar deep, key,\n\
\t\tflatOptions = jQuery.ajaxSettings.flatOptions || {};\n\
\n\
\tfor ( key in src ) {\n\
\t\tif ( src[ key ] !== undefined ) {\n\
\t\t\t( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];\n\
\t\t}\n\
\t}\n\
\tif ( deep ) {\n\
\t\tjQuery.extend( true, target, deep );\n\
\t}\n\
\n\
\treturn target;\n\
}\n\
\n\
jQuery.fn.load = function( url, params, callback ) {\n\
\tif ( typeof url !== \"string\" && _load ) {\n\
\t\treturn _load.apply( this, arguments );\n\
\t}\n\
\n\
\tvar selector, response, type,\n\
\t\tself = this,\n\
\t\toff = url.indexOf(\" \");\n\
\n\
\tif ( off >= 0 ) {\n\
\t\tselector = url.slice( off, url.length );\n\
\t\turl = url.slice( 0, off );\n\
\t}\n\
\n\
\t// If it's a function\n\
\tif ( jQuery.isFunction( params ) ) {\n\
\n\
\t\t// We assume that it's the callback\n\
\t\tcallback = params;\n\
\t\tparams = undefined;\n\
\n\
\t// Otherwise, build a param string\n\
\t} else if ( params && typeof params === \"object\" ) {\n\
\t\ttype = \"POST\";\n\
\t}\n\
\n\
\t// If we have elements to modify, make the request\n\
\tif ( self.length > 0 ) {\n\
\t\tjQuery.ajax({\n\
\t\t\turl: url,\n\
\n\
\t\t\t// if \"type\" variable is undefined, then \"GET\" method will be used\n\
\t\t\ttype: type,\n\
\t\t\tdataType: \"html\",\n\
\t\t\tdata: params\n\
\t\t}).done(function( responseText ) {\n\
\n\
\t\t\t// Save response for use in complete callback\n\
\t\t\tresponse = arguments;\n\
\n\
\t\t\tself.html( selector ?\n\
\n\
\t\t\t\t// If a selector was specified, locate the right elements in a dummy div\n\
\t\t\t\t// Exclude scripts to avoid IE 'Permission Denied' errors\n\
\t\t\t\tjQuery(\"<div>\").append( jQuery.parseHTML( responseText ) ).find( selector ) :\n\
\n\
\t\t\t\t// Otherwise use the full result\n\
\t\t\t\tresponseText );\n\
\n\
\t\t}).complete( callback && function( jqXHR, status ) {\n\
\t\t\tself.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );\n\
\t\t});\n\
\t}\n\
\n\
\treturn this;\n\
};\n\
\n\
// Attach a bunch of functions for handling common AJAX events\n\
jQuery.each( [ \"ajaxStart\", \"ajaxStop\", \"ajaxComplete\", \"ajaxError\", \"ajaxSuccess\", \"ajaxSend\" ], function( i, type ){\n\
\tjQuery.fn[ type ] = function( fn ){\n\
\t\treturn this.on( type, fn );\n\
\t};\n\
});\n\
\n\
jQuery.each( [ \"get\", \"post\" ], function( i, method ) {\n\
\tjQuery[ method ] = function( url, data, callback, type ) {\n\
\t\t// shift arguments if data argument was omitted\n\
\t\tif ( jQuery.isFunction( data ) ) {\n\
\t\t\ttype = type || callback;\n\
\t\t\tcallback = data;\n\
\t\t\tdata = undefined;\n\
\t\t}\n\
\n\
\t\treturn jQuery.ajax({\n\
\t\t\turl: url,\n\
\t\t\ttype: method,\n\
\t\t\tdataType: type,\n\
\t\t\tdata: data,\n\
\t\t\tsuccess: callback\n\
\t\t});\n\
\t};\n\
});\n\
\n\
jQuery.extend({\n\
\n\
\t// Counter for holding the number of active queries\n\
\tactive: 0,\n\
\n\
\t// Last-Modified header cache for next request\n\
\tlastModified: {},\n\
\tetag: {},\n\
\n\
\tajaxSettings: {\n\
\t\turl: ajaxLocation,\n\
\t\ttype: \"GET\",\n\
\t\tisLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),\n\
\t\tglobal: true,\n\
\t\tprocessData: true,\n\
\t\tasync: true,\n\
\t\tcontentType: \"application/x-www-form-urlencoded; charset=UTF-8\",\n\
\t\t/*\n\
\t\ttimeout: 0,\n\
\t\tdata: null,\n\
\t\tdataType: null,\n\
\t\tusername: null,\n\
\t\tpassword: null,\n\
\t\tcache: null,\n\
\t\tthrows: false,\n\
\t\ttraditional: false,\n\
\t\theaders: {},\n\
\t\t*/\n\
\n\
\t\taccepts: {\n\
\t\t\t\"*\": allTypes,\n\
\t\t\ttext: \"text/plain\",\n\
\t\t\thtml: \"text/html\",\n\
\t\t\txml: \"application/xml, text/xml\",\n\
\t\t\tjson: \"application/json, text/javascript\"\n\
\t\t},\n\
\n\
\t\tcontents: {\n\
\t\t\txml: /xml/,\n\
\t\t\thtml: /html/,\n\
\t\t\tjson: /json/\n\
\t\t},\n\
\n\
\t\tresponseFields: {\n\
\t\t\txml: \"responseXML\",\n\
\t\t\ttext: \"responseText\"\n\
\t\t},\n\
\n\
\t\t// Data converters\n\
\t\t// Keys separate source (or catchall \"*\") and destination types with a single space\n\
\t\tconverters: {\n\
\n\
\t\t\t// Convert anything to text\n\
\t\t\t\"* text\": window.String,\n\
\n\
\t\t\t// Text to html (true = no transformation)\n\
\t\t\t\"text html\": true,\n\
\n\
\t\t\t// Evaluate text as a json expression\n\
\t\t\t\"text json\": jQuery.parseJSON,\n\
\n\
\t\t\t// Parse text as xml\n\
\t\t\t\"text xml\": jQuery.parseXML\n\
\t\t},\n\
\n\
\t\t// For options that shouldn't be deep extended:\n\
\t\t// you can add your own custom options here if\n\
\t\t// and when you create one that shouldn't be\n\
\t\t// deep extended (see ajaxExtend)\n\
\t\tflatOptions: {\n\
\t\t\turl: true,\n\
\t\t\tcontext: true\n\
\t\t}\n\
\t},\n\
\n\
\t// Creates a full fledged settings object into target\n\
\t// with both ajaxSettings and settings fields.\n\
\t// If target is omitted, writes into ajaxSettings.\n\
\tajaxSetup: function( target, settings ) {\n\
\t\treturn settings ?\n\
\n\
\t\t\t// Building a settings object\n\
\t\t\tajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :\n\
\n\
\t\t\t// Extending ajaxSettings\n\
\t\t\tajaxExtend( jQuery.ajaxSettings, target );\n\
\t},\n\
\n\
\tajaxPrefilter: addToPrefiltersOrTransports( prefilters ),\n\
\tajaxTransport: addToPrefiltersOrTransports( transports ),\n\
\n\
\t// Main method\n\
\tajax: function( url, options ) {\n\
\n\
\t\t// If url is an object, simulate pre-1.5 signature\n\
\t\tif ( typeof url === \"object\" ) {\n\
\t\t\toptions = url;\n\
\t\t\turl = undefined;\n\
\t\t}\n\
\n\
\t\t// Force options to be an object\n\
\t\toptions = options || {};\n\
\n\
\t\tvar // Cross-domain detection vars\n\
\t\t\tparts,\n\
\t\t\t// Loop variable\n\
\t\t\ti,\n\
\t\t\t// URL without anti-cache param\n\
\t\t\tcacheURL,\n\
\t\t\t// Response headers as string\n\
\t\t\tresponseHeadersString,\n\
\t\t\t// timeout handle\n\
\t\t\ttimeoutTimer,\n\
\n\
\t\t\t// To know if global events are to be dispatched\n\
\t\t\tfireGlobals,\n\
\n\
\t\t\ttransport,\n\
\t\t\t// Response headers\n\
\t\t\tresponseHeaders,\n\
\t\t\t// Create the final options object\n\
\t\t\ts = jQuery.ajaxSetup( {}, options ),\n\
\t\t\t// Callbacks context\n\
\t\t\tcallbackContext = s.context || s,\n\
\t\t\t// Context for global events is callbackContext if it is a DOM node or jQuery collection\n\
\t\t\tglobalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?\n\
\t\t\t\tjQuery( callbackContext ) :\n\
\t\t\t\tjQuery.event,\n\
\t\t\t// Deferreds\n\
\t\t\tdeferred = jQuery.Deferred(),\n\
\t\t\tcompleteDeferred = jQuery.Callbacks(\"once memory\"),\n\
\t\t\t// Status-dependent callbacks\n\
\t\t\tstatusCode = s.statusCode || {},\n\
\t\t\t// Headers (they are sent all at once)\n\
\t\t\trequestHeaders = {},\n\
\t\t\trequestHeadersNames = {},\n\
\t\t\t// The jqXHR state\n\
\t\t\tstate = 0,\n\
\t\t\t// Default abort message\n\
\t\t\tstrAbort = \"canceled\",\n\
\t\t\t// Fake xhr\n\
\t\t\tjqXHR = {\n\
\t\t\t\treadyState: 0,\n\
\n\
\t\t\t\t// Builds headers hashtable if needed\n\
\t\t\t\tgetResponseHeader: function( key ) {\n\
\t\t\t\t\tvar match;\n\
\t\t\t\t\tif ( state === 2 ) {\n\
\t\t\t\t\t\tif ( !responseHeaders ) {\n\
\t\t\t\t\t\t\tresponseHeaders = {};\n\
\t\t\t\t\t\t\twhile ( (match = rheaders.exec( responseHeadersString )) ) {\n\
\t\t\t\t\t\t\t\tresponseHeaders[ match[1].toLowerCase() ] = match[ 2 ];\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t\tmatch = responseHeaders[ key.toLowerCase() ];\n\
\t\t\t\t\t}\n\
\t\t\t\t\treturn match == null ? null : match;\n\
\t\t\t\t},\n\
\n\
\t\t\t\t// Raw string\n\
\t\t\t\tgetAllResponseHeaders: function() {\n\
\t\t\t\t\treturn state === 2 ? responseHeadersString : null;\n\
\t\t\t\t},\n\
\n\
\t\t\t\t// Caches the header\n\
\t\t\t\tsetRequestHeader: function( name, value ) {\n\
\t\t\t\t\tvar lname = name.toLowerCase();\n\
\t\t\t\t\tif ( !state ) {\n\
\t\t\t\t\t\tname = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;\n\
\t\t\t\t\t\trequestHeaders[ name ] = value;\n\
\t\t\t\t\t}\n\
\t\t\t\t\treturn this;\n\
\t\t\t\t},\n\
\n\
\t\t\t\t// Overrides response content-type header\n\
\t\t\t\toverrideMimeType: function( type ) {\n\
\t\t\t\t\tif ( !state ) {\n\
\t\t\t\t\t\ts.mimeType = type;\n\
\t\t\t\t\t}\n\
\t\t\t\t\treturn this;\n\
\t\t\t\t},\n\
\n\
\t\t\t\t// Status-dependent callbacks\n\
\t\t\t\tstatusCode: function( map ) {\n\
\t\t\t\t\tvar code;\n\
\t\t\t\t\tif ( map ) {\n\
\t\t\t\t\t\tif ( state < 2 ) {\n\
\t\t\t\t\t\t\tfor ( code in map ) {\n\
\t\t\t\t\t\t\t\t// Lazy-add the new callback in a way that preserves old ones\n\
\t\t\t\t\t\t\t\tstatusCode[ code ] = [ statusCode[ code ], map[ code ] ];\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\t// Execute the appropriate callbacks\n\
\t\t\t\t\t\t\tjqXHR.always( map[ jqXHR.status ] );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t\treturn this;\n\
\t\t\t\t},\n\
\n\
\t\t\t\t// Cancel the request\n\
\t\t\t\tabort: function( statusText ) {\n\
\t\t\t\t\tvar finalText = statusText || strAbort;\n\
\t\t\t\t\tif ( transport ) {\n\
\t\t\t\t\t\ttransport.abort( finalText );\n\
\t\t\t\t\t}\n\
\t\t\t\t\tdone( 0, finalText );\n\
\t\t\t\t\treturn this;\n\
\t\t\t\t}\n\
\t\t\t};\n\
\n\
\t\t// Attach deferreds\n\
\t\tdeferred.promise( jqXHR ).complete = completeDeferred.add;\n\
\t\tjqXHR.success = jqXHR.done;\n\
\t\tjqXHR.error = jqXHR.fail;\n\
\n\
\t\t// Remove hash character (#7531: and string promotion)\n\
\t\t// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)\n\
\t\t// Handle falsy url in the settings object (#10093: consistency with old signature)\n\
\t\t// We also use the url parameter if available\n\
\t\ts.url = ( ( url || s.url || ajaxLocation ) + \"\" ).replace( rhash, \"\" ).replace( rprotocol, ajaxLocParts[ 1 ] + \"//\" );\n\
\n\
\t\t// Alias method option to type as per ticket #12004\n\
\t\ts.type = options.method || options.type || s.method || s.type;\n\
\n\
\t\t// Extract dataTypes list\n\
\t\ts.dataTypes = jQuery.trim( s.dataType || \"*\" ).toLowerCase().match( core_rnotwhite ) || [\"\"];\n\
\n\
\t\t// A cross-domain request is in order when we have a protocol:host:port mismatch\n\
\t\tif ( s.crossDomain == null ) {\n\
\t\t\tparts = rurl.exec( s.url.toLowerCase() );\n\
\t\t\ts.crossDomain = !!( parts &&\n\
\t\t\t\t( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||\n\
\t\t\t\t\t( parts[ 3 ] || ( parts[ 1 ] === \"http:\" ? 80 : 443 ) ) !=\n\
\t\t\t\t\t\t( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === \"http:\" ? 80 : 443 ) ) )\n\
\t\t\t);\n\
\t\t}\n\
\n\
\t\t// Convert data if not already a string\n\
\t\tif ( s.data && s.processData && typeof s.data !== \"string\" ) {\n\
\t\t\ts.data = jQuery.param( s.data, s.traditional );\n\
\t\t}\n\
\n\
\t\t// Apply prefilters\n\
\t\tinspectPrefiltersOrTransports( prefilters, s, options, jqXHR );\n\
\n\
\t\t// If request was aborted inside a prefilter, stop there\n\
\t\tif ( state === 2 ) {\n\
\t\t\treturn jqXHR;\n\
\t\t}\n\
\n\
\t\t// We can fire global events as of now if asked to\n\
\t\tfireGlobals = s.global;\n\
\n\
\t\t// Watch for a new set of requests\n\
\t\tif ( fireGlobals && jQuery.active++ === 0 ) {\n\
\t\t\tjQuery.event.trigger(\"ajaxStart\");\n\
\t\t}\n\
\n\
\t\t// Uppercase the type\n\
\t\ts.type = s.type.toUpperCase();\n\
\n\
\t\t// Determine if request has content\n\
\t\ts.hasContent = !rnoContent.test( s.type );\n\
\n\
\t\t// Save the URL in case we're toying with the If-Modified-Since\n\
\t\t// and/or If-None-Match header later on\n\
\t\tcacheURL = s.url;\n\
\n\
\t\t// More options handling for requests with no content\n\
\t\tif ( !s.hasContent ) {\n\
\n\
\t\t\t// If data is available, append data to url\n\
\t\t\tif ( s.data ) {\n\
\t\t\t\tcacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? \"&\" : \"?\" ) + s.data );\n\
\t\t\t\t// #9682: remove data so that it's not used in an eventual retry\n\
\t\t\t\tdelete s.data;\n\
\t\t\t}\n\
\n\
\t\t\t// Add anti-cache in url if needed\n\
\t\t\tif ( s.cache === false ) {\n\
\t\t\t\ts.url = rts.test( cacheURL ) ?\n\
\n\
\t\t\t\t\t// If there is already a '_' parameter, set its value\n\
\t\t\t\t\tcacheURL.replace( rts, \"$1_=\" + ajax_nonce++ ) :\n\
\n\
\t\t\t\t\t// Otherwise add one to the end\n\
\t\t\t\t\tcacheURL + ( ajax_rquery.test( cacheURL ) ? \"&\" : \"?\" ) + \"_=\" + ajax_nonce++;\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.\n\
\t\tif ( s.ifModified ) {\n\
\t\t\tif ( jQuery.lastModified[ cacheURL ] ) {\n\
\t\t\t\tjqXHR.setRequestHeader( \"If-Modified-Since\", jQuery.lastModified[ cacheURL ] );\n\
\t\t\t}\n\
\t\t\tif ( jQuery.etag[ cacheURL ] ) {\n\
\t\t\t\tjqXHR.setRequestHeader( \"If-None-Match\", jQuery.etag[ cacheURL ] );\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Set the correct header, if data is being sent\n\
\t\tif ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {\n\
\t\t\tjqXHR.setRequestHeader( \"Content-Type\", s.contentType );\n\
\t\t}\n\
\n\
\t\t// Set the Accepts header for the server, depending on the dataType\n\
\t\tjqXHR.setRequestHeader(\n\
\t\t\t\"Accept\",\n\
\t\t\ts.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?\n\
\t\t\t\ts.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== \"*\" ? \", \" + allTypes + \"; q=0.01\" : \"\" ) :\n\
\t\t\t\ts.accepts[ \"*\" ]\n\
\t\t);\n\
\n\
\t\t// Check for headers option\n\
\t\tfor ( i in s.headers ) {\n\
\t\t\tjqXHR.setRequestHeader( i, s.headers[ i ] );\n\
\t\t}\n\
\n\
\t\t// Allow custom headers/mimetypes and early abort\n\
\t\tif ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {\n\
\t\t\t// Abort if not done already and return\n\
\t\t\treturn jqXHR.abort();\n\
\t\t}\n\
\n\
\t\t// aborting is no longer a cancellation\n\
\t\tstrAbort = \"abort\";\n\
\n\
\t\t// Install callbacks on deferreds\n\
\t\tfor ( i in { success: 1, error: 1, complete: 1 } ) {\n\
\t\t\tjqXHR[ i ]( s[ i ] );\n\
\t\t}\n\
\n\
\t\t// Get transport\n\
\t\ttransport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );\n\
\n\
\t\t// If no transport, we auto-abort\n\
\t\tif ( !transport ) {\n\
\t\t\tdone( -1, \"No Transport\" );\n\
\t\t} else {\n\
\t\t\tjqXHR.readyState = 1;\n\
\n\
\t\t\t// Send global event\n\
\t\t\tif ( fireGlobals ) {\n\
\t\t\t\tglobalEventContext.trigger( \"ajaxSend\", [ jqXHR, s ] );\n\
\t\t\t}\n\
\t\t\t// Timeout\n\
\t\t\tif ( s.async && s.timeout > 0 ) {\n\
\t\t\t\ttimeoutTimer = setTimeout(function() {\n\
\t\t\t\t\tjqXHR.abort(\"timeout\");\n\
\t\t\t\t}, s.timeout );\n\
\t\t\t}\n\
\n\
\t\t\ttry {\n\
\t\t\t\tstate = 1;\n\
\t\t\t\ttransport.send( requestHeaders, done );\n\
\t\t\t} catch ( e ) {\n\
\t\t\t\t// Propagate exception as error if not done\n\
\t\t\t\tif ( state < 2 ) {\n\
\t\t\t\t\tdone( -1, e );\n\
\t\t\t\t// Simply rethrow otherwise\n\
\t\t\t\t} else {\n\
\t\t\t\t\tthrow e;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\t// Callback for when everything is done\n\
\t\tfunction done( status, nativeStatusText, responses, headers ) {\n\
\t\t\tvar isSuccess, success, error, response, modified,\n\
\t\t\t\tstatusText = nativeStatusText;\n\
\n\
\t\t\t// Called once\n\
\t\t\tif ( state === 2 ) {\n\
\t\t\t\treturn;\n\
\t\t\t}\n\
\n\
\t\t\t// State is \"done\" now\n\
\t\t\tstate = 2;\n\
\n\
\t\t\t// Clear timeout if it exists\n\
\t\t\tif ( timeoutTimer ) {\n\
\t\t\t\tclearTimeout( timeoutTimer );\n\
\t\t\t}\n\
\n\
\t\t\t// Dereference transport for early garbage collection\n\
\t\t\t// (no matter how long the jqXHR object will be used)\n\
\t\t\ttransport = undefined;\n\
\n\
\t\t\t// Cache response headers\n\
\t\t\tresponseHeadersString = headers || \"\";\n\
\n\
\t\t\t// Set readyState\n\
\t\t\tjqXHR.readyState = status > 0 ? 4 : 0;\n\
\n\
\t\t\t// Get response data\n\
\t\t\tif ( responses ) {\n\
\t\t\t\tresponse = ajaxHandleResponses( s, jqXHR, responses );\n\
\t\t\t}\n\
\n\
\t\t\t// If successful, handle type chaining\n\
\t\t\tif ( status >= 200 && status < 300 || status === 304 ) {\n\
\n\
\t\t\t\t// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.\n\
\t\t\t\tif ( s.ifModified ) {\n\
\t\t\t\t\tmodified = jqXHR.getResponseHeader(\"Last-Modified\");\n\
\t\t\t\t\tif ( modified ) {\n\
\t\t\t\t\t\tjQuery.lastModified[ cacheURL ] = modified;\n\
\t\t\t\t\t}\n\
\t\t\t\t\tmodified = jqXHR.getResponseHeader(\"etag\");\n\
\t\t\t\t\tif ( modified ) {\n\
\t\t\t\t\t\tjQuery.etag[ cacheURL ] = modified;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// if no content\n\
\t\t\t\tif ( status === 204 ) {\n\
\t\t\t\t\tisSuccess = true;\n\
\t\t\t\t\tstatusText = \"nocontent\";\n\
\n\
\t\t\t\t// if not modified\n\
\t\t\t\t} else if ( status === 304 ) {\n\
\t\t\t\t\tisSuccess = true;\n\
\t\t\t\t\tstatusText = \"notmodified\";\n\
\n\
\t\t\t\t// If we have data, let's convert it\n\
\t\t\t\t} else {\n\
\t\t\t\t\tisSuccess = ajaxConvert( s, response );\n\
\t\t\t\t\tstatusText = isSuccess.state;\n\
\t\t\t\t\tsuccess = isSuccess.data;\n\
\t\t\t\t\terror = isSuccess.error;\n\
\t\t\t\t\tisSuccess = !error;\n\
\t\t\t\t}\n\
\t\t\t} else {\n\
\t\t\t\t// We extract error from statusText\n\
\t\t\t\t// then normalize statusText and status for non-aborts\n\
\t\t\t\terror = statusText;\n\
\t\t\t\tif ( status || !statusText ) {\n\
\t\t\t\t\tstatusText = \"error\";\n\
\t\t\t\t\tif ( status < 0 ) {\n\
\t\t\t\t\t\tstatus = 0;\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// Set data for the fake xhr object\n\
\t\t\tjqXHR.status = status;\n\
\t\t\tjqXHR.statusText = ( nativeStatusText || statusText ) + \"\";\n\
\n\
\t\t\t// Success/Error\n\
\t\t\tif ( isSuccess ) {\n\
\t\t\t\tdeferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );\n\
\t\t\t} else {\n\
\t\t\t\tdeferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );\n\
\t\t\t}\n\
\n\
\t\t\t// Status-dependent callbacks\n\
\t\t\tjqXHR.statusCode( statusCode );\n\
\t\t\tstatusCode = undefined;\n\
\n\
\t\t\tif ( fireGlobals ) {\n\
\t\t\t\tglobalEventContext.trigger( isSuccess ? \"ajaxSuccess\" : \"ajaxError\",\n\
\t\t\t\t\t[ jqXHR, s, isSuccess ? success : error ] );\n\
\t\t\t}\n\
\n\
\t\t\t// Complete\n\
\t\t\tcompleteDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );\n\
\n\
\t\t\tif ( fireGlobals ) {\n\
\t\t\t\tglobalEventContext.trigger( \"ajaxComplete\", [ jqXHR, s ] );\n\
\t\t\t\t// Handle the global AJAX counter\n\
\t\t\t\tif ( !( --jQuery.active ) ) {\n\
\t\t\t\t\tjQuery.event.trigger(\"ajaxStop\");\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\treturn jqXHR;\n\
\t},\n\
\n\
\tgetScript: function( url, callback ) {\n\
\t\treturn jQuery.get( url, undefined, callback, \"script\" );\n\
\t},\n\
\n\
\tgetJSON: function( url, data, callback ) {\n\
\t\treturn jQuery.get( url, data, callback, \"json\" );\n\
\t}\n\
});\n\
\n\
/* Handles responses to an ajax request:\n\
 * - sets all responseXXX fields accordingly\n\
 * - finds the right dataType (mediates between content-type and expected dataType)\n\
 * - returns the corresponding response\n\
 */\n\
function ajaxHandleResponses( s, jqXHR, responses ) {\n\
\tvar firstDataType, ct, finalDataType, type,\n\
\t\tcontents = s.contents,\n\
\t\tdataTypes = s.dataTypes,\n\
\t\tresponseFields = s.responseFields;\n\
\n\
\t// Fill responseXXX fields\n\
\tfor ( type in responseFields ) {\n\
\t\tif ( type in responses ) {\n\
\t\t\tjqXHR[ responseFields[type] ] = responses[ type ];\n\
\t\t}\n\
\t}\n\
\n\
\t// Remove auto dataType and get content-type in the process\n\
\twhile( dataTypes[ 0 ] === \"*\" ) {\n\
\t\tdataTypes.shift();\n\
\t\tif ( ct === undefined ) {\n\
\t\t\tct = s.mimeType || jqXHR.getResponseHeader(\"Content-Type\");\n\
\t\t}\n\
\t}\n\
\n\
\t// Check if we're dealing with a known content-type\n\
\tif ( ct ) {\n\
\t\tfor ( type in contents ) {\n\
\t\t\tif ( contents[ type ] && contents[ type ].test( ct ) ) {\n\
\t\t\t\tdataTypes.unshift( type );\n\
\t\t\t\tbreak;\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\t// Check to see if we have a response for the expected dataType\n\
\tif ( dataTypes[ 0 ] in responses ) {\n\
\t\tfinalDataType = dataTypes[ 0 ];\n\
\t} else {\n\
\t\t// Try convertible dataTypes\n\
\t\tfor ( type in responses ) {\n\
\t\t\tif ( !dataTypes[ 0 ] || s.converters[ type + \" \" + dataTypes[0] ] ) {\n\
\t\t\t\tfinalDataType = type;\n\
\t\t\t\tbreak;\n\
\t\t\t}\n\
\t\t\tif ( !firstDataType ) {\n\
\t\t\t\tfirstDataType = type;\n\
\t\t\t}\n\
\t\t}\n\
\t\t// Or just use first one\n\
\t\tfinalDataType = finalDataType || firstDataType;\n\
\t}\n\
\n\
\t// If we found a dataType\n\
\t// We add the dataType to the list if needed\n\
\t// and return the corresponding response\n\
\tif ( finalDataType ) {\n\
\t\tif ( finalDataType !== dataTypes[ 0 ] ) {\n\
\t\t\tdataTypes.unshift( finalDataType );\n\
\t\t}\n\
\t\treturn responses[ finalDataType ];\n\
\t}\n\
}\n\
\n\
// Chain conversions given the request and the original response\n\
function ajaxConvert( s, response ) {\n\
\tvar conv2, current, conv, tmp,\n\
\t\tconverters = {},\n\
\t\ti = 0,\n\
\t\t// Work with a copy of dataTypes in case we need to modify it for conversion\n\
\t\tdataTypes = s.dataTypes.slice(),\n\
\t\tprev = dataTypes[ 0 ];\n\
\n\
\t// Apply the dataFilter if provided\n\
\tif ( s.dataFilter ) {\n\
\t\tresponse = s.dataFilter( response, s.dataType );\n\
\t}\n\
\n\
\t// Create converters map with lowercased keys\n\
\tif ( dataTypes[ 1 ] ) {\n\
\t\tfor ( conv in s.converters ) {\n\
\t\t\tconverters[ conv.toLowerCase() ] = s.converters[ conv ];\n\
\t\t}\n\
\t}\n\
\n\
\t// Convert to each sequential dataType, tolerating list modification\n\
\tfor ( ; (current = dataTypes[++i]); ) {\n\
\n\
\t\t// There's only work to do if current dataType is non-auto\n\
\t\tif ( current !== \"*\" ) {\n\
\n\
\t\t\t// Convert response if prev dataType is non-auto and differs from current\n\
\t\t\tif ( prev !== \"*\" && prev !== current ) {\n\
\n\
\t\t\t\t// Seek a direct converter\n\
\t\t\t\tconv = converters[ prev + \" \" + current ] || converters[ \"* \" + current ];\n\
\n\
\t\t\t\t// If none found, seek a pair\n\
\t\t\t\tif ( !conv ) {\n\
\t\t\t\t\tfor ( conv2 in converters ) {\n\
\n\
\t\t\t\t\t\t// If conv2 outputs current\n\
\t\t\t\t\t\ttmp = conv2.split(\" \");\n\
\t\t\t\t\t\tif ( tmp[ 1 ] === current ) {\n\
\n\
\t\t\t\t\t\t\t// If prev can be converted to accepted input\n\
\t\t\t\t\t\t\tconv = converters[ prev + \" \" + tmp[ 0 ] ] ||\n\
\t\t\t\t\t\t\t\tconverters[ \"* \" + tmp[ 0 ] ];\n\
\t\t\t\t\t\t\tif ( conv ) {\n\
\t\t\t\t\t\t\t\t// Condense equivalence converters\n\
\t\t\t\t\t\t\t\tif ( conv === true ) {\n\
\t\t\t\t\t\t\t\t\tconv = converters[ conv2 ];\n\
\n\
\t\t\t\t\t\t\t\t// Otherwise, insert the intermediate dataType\n\
\t\t\t\t\t\t\t\t} else if ( converters[ conv2 ] !== true ) {\n\
\t\t\t\t\t\t\t\t\tcurrent = tmp[ 0 ];\n\
\t\t\t\t\t\t\t\t\tdataTypes.splice( i--, 0, current );\n\
\t\t\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t\t\tbreak;\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// Apply converter (if not an equivalence)\n\
\t\t\t\tif ( conv !== true ) {\n\
\n\
\t\t\t\t\t// Unless errors are allowed to bubble, catch and return them\n\
\t\t\t\t\tif ( conv && s[\"throws\"] ) {\n\
\t\t\t\t\t\tresponse = conv( response );\n\
\t\t\t\t\t} else {\n\
\t\t\t\t\t\ttry {\n\
\t\t\t\t\t\t\tresponse = conv( response );\n\
\t\t\t\t\t\t} catch ( e ) {\n\
\t\t\t\t\t\t\treturn { state: \"parsererror\", error: conv ? e : \"No conversion from \" + prev + \" to \" + current };\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// Update prev for next iteration\n\
\t\t\tprev = current;\n\
\t\t}\n\
\t}\n\
\n\
\treturn { state: \"success\", data: response };\n\
}\n\
// Install script dataType\n\
jQuery.ajaxSetup({\n\
\taccepts: {\n\
\t\tscript: \"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript\"\n\
\t},\n\
\tcontents: {\n\
\t\tscript: /(?:java|ecma)script/\n\
\t},\n\
\tconverters: {\n\
\t\t\"text script\": function( text ) {\n\
\t\t\tjQuery.globalEval( text );\n\
\t\t\treturn text;\n\
\t\t}\n\
\t}\n\
});\n\
\n\
// Handle cache's special case and global\n\
jQuery.ajaxPrefilter( \"script\", function( s ) {\n\
\tif ( s.cache === undefined ) {\n\
\t\ts.cache = false;\n\
\t}\n\
\tif ( s.crossDomain ) {\n\
\t\ts.type = \"GET\";\n\
\t\ts.global = false;\n\
\t}\n\
});\n\
\n\
// Bind script tag hack transport\n\
jQuery.ajaxTransport( \"script\", function(s) {\n\
\n\
\t// This transport only deals with cross domain requests\n\
\tif ( s.crossDomain ) {\n\
\n\
\t\tvar script,\n\
\t\t\thead = document.head || jQuery(\"head\")[0] || document.documentElement;\n\
\n\
\t\treturn {\n\
\n\
\t\t\tsend: function( _, callback ) {\n\
\n\
\t\t\t\tscript = document.createElement(\"script\");\n\
\n\
\t\t\t\tscript.async = true;\n\
\n\
\t\t\t\tif ( s.scriptCharset ) {\n\
\t\t\t\t\tscript.charset = s.scriptCharset;\n\
\t\t\t\t}\n\
\n\
\t\t\t\tscript.src = s.url;\n\
\n\
\t\t\t\t// Attach handlers for all browsers\n\
\t\t\t\tscript.onload = script.onreadystatechange = function( _, isAbort ) {\n\
\n\
\t\t\t\t\tif ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {\n\
\n\
\t\t\t\t\t\t// Handle memory leak in IE\n\
\t\t\t\t\t\tscript.onload = script.onreadystatechange = null;\n\
\n\
\t\t\t\t\t\t// Remove the script\n\
\t\t\t\t\t\tif ( script.parentNode ) {\n\
\t\t\t\t\t\t\tscript.parentNode.removeChild( script );\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t// Dereference the script\n\
\t\t\t\t\t\tscript = null;\n\
\n\
\t\t\t\t\t\t// Callback if not abort\n\
\t\t\t\t\t\tif ( !isAbort ) {\n\
\t\t\t\t\t\t\tcallback( 200, \"success\" );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\t\t\t\t};\n\
\n\
\t\t\t\t// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending\n\
\t\t\t\t// Use native DOM manipulation to avoid our domManip AJAX trickery\n\
\t\t\t\thead.insertBefore( script, head.firstChild );\n\
\t\t\t},\n\
\n\
\t\t\tabort: function() {\n\
\t\t\t\tif ( script ) {\n\
\t\t\t\t\tscript.onload( undefined, true );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t};\n\
\t}\n\
});\n\
var oldCallbacks = [],\n\
\trjsonp = /(=)\\?(?=&|$)|\\?\\?/;\n\
\n\
// Default jsonp settings\n\
jQuery.ajaxSetup({\n\
\tjsonp: \"callback\",\n\
\tjsonpCallback: function() {\n\
\t\tvar callback = oldCallbacks.pop() || ( jQuery.expando + \"_\" + ( ajax_nonce++ ) );\n\
\t\tthis[ callback ] = true;\n\
\t\treturn callback;\n\
\t}\n\
});\n\
\n\
// Detect, normalize options and install callbacks for jsonp requests\n\
jQuery.ajaxPrefilter( \"json jsonp\", function( s, originalSettings, jqXHR ) {\n\
\n\
\tvar callbackName, overwritten, responseContainer,\n\
\t\tjsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?\n\
\t\t\t\"url\" :\n\
\t\t\ttypeof s.data === \"string\" && !( s.contentType || \"\" ).indexOf(\"application/x-www-form-urlencoded\") && rjsonp.test( s.data ) && \"data\"\n\
\t\t);\n\
\n\
\t// Handle iff the expected data type is \"jsonp\" or we have a parameter to set\n\
\tif ( jsonProp || s.dataTypes[ 0 ] === \"jsonp\" ) {\n\
\n\
\t\t// Get callback name, remembering preexisting value associated with it\n\
\t\tcallbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?\n\
\t\t\ts.jsonpCallback() :\n\
\t\t\ts.jsonpCallback;\n\
\n\
\t\t// Insert callback into url or form data\n\
\t\tif ( jsonProp ) {\n\
\t\t\ts[ jsonProp ] = s[ jsonProp ].replace( rjsonp, \"$1\" + callbackName );\n\
\t\t} else if ( s.jsonp !== false ) {\n\
\t\t\ts.url += ( ajax_rquery.test( s.url ) ? \"&\" : \"?\" ) + s.jsonp + \"=\" + callbackName;\n\
\t\t}\n\
\n\
\t\t// Use data converter to retrieve json after script execution\n\
\t\ts.converters[\"script json\"] = function() {\n\
\t\t\tif ( !responseContainer ) {\n\
\t\t\t\tjQuery.error( callbackName + \" was not called\" );\n\
\t\t\t}\n\
\t\t\treturn responseContainer[ 0 ];\n\
\t\t};\n\
\n\
\t\t// force json dataType\n\
\t\ts.dataTypes[ 0 ] = \"json\";\n\
\n\
\t\t// Install callback\n\
\t\toverwritten = window[ callbackName ];\n\
\t\twindow[ callbackName ] = function() {\n\
\t\t\tresponseContainer = arguments;\n\
\t\t};\n\
\n\
\t\t// Clean-up function (fires after converters)\n\
\t\tjqXHR.always(function() {\n\
\t\t\t// Restore preexisting value\n\
\t\t\twindow[ callbackName ] = overwritten;\n\
\n\
\t\t\t// Save back as free\n\
\t\t\tif ( s[ callbackName ] ) {\n\
\t\t\t\t// make sure that re-using the options doesn't screw things around\n\
\t\t\t\ts.jsonpCallback = originalSettings.jsonpCallback;\n\
\n\
\t\t\t\t// save the callback name for future use\n\
\t\t\t\toldCallbacks.push( callbackName );\n\
\t\t\t}\n\
\n\
\t\t\t// Call if it was a function and we have a response\n\
\t\t\tif ( responseContainer && jQuery.isFunction( overwritten ) ) {\n\
\t\t\t\toverwritten( responseContainer[ 0 ] );\n\
\t\t\t}\n\
\n\
\t\t\tresponseContainer = overwritten = undefined;\n\
\t\t});\n\
\n\
\t\t// Delegate to script\n\
\t\treturn \"script\";\n\
\t}\n\
});\n\
var xhrCallbacks, xhrSupported,\n\
\txhrId = 0,\n\
\t// #5280: Internet Explorer will keep connections alive if we don't abort on unload\n\
\txhrOnUnloadAbort = window.ActiveXObject && function() {\n\
\t\t// Abort all pending requests\n\
\t\tvar key;\n\
\t\tfor ( key in xhrCallbacks ) {\n\
\t\t\txhrCallbacks[ key ]( undefined, true );\n\
\t\t}\n\
\t};\n\
\n\
// Functions to create xhrs\n\
function createStandardXHR() {\n\
\ttry {\n\
\t\treturn new window.XMLHttpRequest();\n\
\t} catch( e ) {}\n\
}\n\
\n\
function createActiveXHR() {\n\
\ttry {\n\
\t\treturn new window.ActiveXObject(\"Microsoft.XMLHTTP\");\n\
\t} catch( e ) {}\n\
}\n\
\n\
// Create the request object\n\
// (This is still attached to ajaxSettings for backward compatibility)\n\
jQuery.ajaxSettings.xhr = window.ActiveXObject ?\n\
\t/* Microsoft failed to properly\n\
\t * implement the XMLHttpRequest in IE7 (can't request local files),\n\
\t * so we use the ActiveXObject when it is available\n\
\t * Additionally XMLHttpRequest can be disabled in IE7/IE8 so\n\
\t * we need a fallback.\n\
\t */\n\
\tfunction() {\n\
\t\treturn !this.isLocal && createStandardXHR() || createActiveXHR();\n\
\t} :\n\
\t// For all other browsers, use the standard XMLHttpRequest object\n\
\tcreateStandardXHR;\n\
\n\
// Determine support properties\n\
xhrSupported = jQuery.ajaxSettings.xhr();\n\
jQuery.support.cors = !!xhrSupported && ( \"withCredentials\" in xhrSupported );\n\
xhrSupported = jQuery.support.ajax = !!xhrSupported;\n\
\n\
// Create transport if the browser can provide an xhr\n\
if ( xhrSupported ) {\n\
\n\
\tjQuery.ajaxTransport(function( s ) {\n\
\t\t// Cross domain only allowed if supported through XMLHttpRequest\n\
\t\tif ( !s.crossDomain || jQuery.support.cors ) {\n\
\n\
\t\t\tvar callback;\n\
\n\
\t\t\treturn {\n\
\t\t\t\tsend: function( headers, complete ) {\n\
\n\
\t\t\t\t\t// Get a new xhr\n\
\t\t\t\t\tvar handle, i,\n\
\t\t\t\t\t\txhr = s.xhr();\n\
\n\
\t\t\t\t\t// Open the socket\n\
\t\t\t\t\t// Passing null username, generates a login popup on Opera (#2865)\n\
\t\t\t\t\tif ( s.username ) {\n\
\t\t\t\t\t\txhr.open( s.type, s.url, s.async, s.username, s.password );\n\
\t\t\t\t\t} else {\n\
\t\t\t\t\t\txhr.open( s.type, s.url, s.async );\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Apply custom fields if provided\n\
\t\t\t\t\tif ( s.xhrFields ) {\n\
\t\t\t\t\t\tfor ( i in s.xhrFields ) {\n\
\t\t\t\t\t\t\txhr[ i ] = s.xhrFields[ i ];\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Override mime type if needed\n\
\t\t\t\t\tif ( s.mimeType && xhr.overrideMimeType ) {\n\
\t\t\t\t\t\txhr.overrideMimeType( s.mimeType );\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// X-Requested-With header\n\
\t\t\t\t\t// For cross-domain requests, seeing as conditions for a preflight are\n\
\t\t\t\t\t// akin to a jigsaw puzzle, we simply never set it to be sure.\n\
\t\t\t\t\t// (it can always be set on a per-request basis or even using ajaxSetup)\n\
\t\t\t\t\t// For same-domain requests, won't change header if already provided.\n\
\t\t\t\t\tif ( !s.crossDomain && !headers[\"X-Requested-With\"] ) {\n\
\t\t\t\t\t\theaders[\"X-Requested-With\"] = \"XMLHttpRequest\";\n\
\t\t\t\t\t}\n\
\n\
\t\t\t\t\t// Need an extra try/catch for cross domain requests in Firefox 3\n\
\t\t\t\t\ttry {\n\
\t\t\t\t\t\tfor ( i in headers ) {\n\
\t\t\t\t\t\t\txhr.setRequestHeader( i, headers[ i ] );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t} catch( err ) {}\n\
\n\
\t\t\t\t\t// Do send the request\n\
\t\t\t\t\t// This may raise an exception which is actually\n\
\t\t\t\t\t// handled in jQuery.ajax (so no try/catch here)\n\
\t\t\t\t\txhr.send( ( s.hasContent && s.data ) || null );\n\
\n\
\t\t\t\t\t// Listener\n\
\t\t\t\t\tcallback = function( _, isAbort ) {\n\
\t\t\t\t\t\tvar status, responseHeaders, statusText, responses;\n\
\n\
\t\t\t\t\t\t// Firefox throws exceptions when accessing properties\n\
\t\t\t\t\t\t// of an xhr when a network error occurred\n\
\t\t\t\t\t\t// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)\n\
\t\t\t\t\t\ttry {\n\
\n\
\t\t\t\t\t\t\t// Was never called and is aborted or complete\n\
\t\t\t\t\t\t\tif ( callback && ( isAbort || xhr.readyState === 4 ) ) {\n\
\n\
\t\t\t\t\t\t\t\t// Only called once\n\
\t\t\t\t\t\t\t\tcallback = undefined;\n\
\n\
\t\t\t\t\t\t\t\t// Do not keep as active anymore\n\
\t\t\t\t\t\t\t\tif ( handle ) {\n\
\t\t\t\t\t\t\t\t\txhr.onreadystatechange = jQuery.noop;\n\
\t\t\t\t\t\t\t\t\tif ( xhrOnUnloadAbort ) {\n\
\t\t\t\t\t\t\t\t\t\tdelete xhrCallbacks[ handle ];\n\
\t\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t\t\t// If it's an abort\n\
\t\t\t\t\t\t\t\tif ( isAbort ) {\n\
\t\t\t\t\t\t\t\t\t// Abort it manually if needed\n\
\t\t\t\t\t\t\t\t\tif ( xhr.readyState !== 4 ) {\n\
\t\t\t\t\t\t\t\t\t\txhr.abort();\n\
\t\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t\t} else {\n\
\t\t\t\t\t\t\t\t\tresponses = {};\n\
\t\t\t\t\t\t\t\t\tstatus = xhr.status;\n\
\t\t\t\t\t\t\t\t\tresponseHeaders = xhr.getAllResponseHeaders();\n\
\n\
\t\t\t\t\t\t\t\t\t// When requesting binary data, IE6-9 will throw an exception\n\
\t\t\t\t\t\t\t\t\t// on any attempt to access responseText (#11426)\n\
\t\t\t\t\t\t\t\t\tif ( typeof xhr.responseText === \"string\" ) {\n\
\t\t\t\t\t\t\t\t\t\tresponses.text = xhr.responseText;\n\
\t\t\t\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t\t\t\t// Firefox throws an exception when accessing\n\
\t\t\t\t\t\t\t\t\t// statusText for faulty cross-domain requests\n\
\t\t\t\t\t\t\t\t\ttry {\n\
\t\t\t\t\t\t\t\t\t\tstatusText = xhr.statusText;\n\
\t\t\t\t\t\t\t\t\t} catch( e ) {\n\
\t\t\t\t\t\t\t\t\t\t// We normalize with Webkit giving an empty statusText\n\
\t\t\t\t\t\t\t\t\t\tstatusText = \"\";\n\
\t\t\t\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t\t\t\t// Filter status for non standard behaviors\n\
\n\
\t\t\t\t\t\t\t\t\t// If the request is local and we have data: assume a success\n\
\t\t\t\t\t\t\t\t\t// (success with no data won't get notified, that's the best we\n\
\t\t\t\t\t\t\t\t\t// can do given current implementations)\n\
\t\t\t\t\t\t\t\t\tif ( !status && s.isLocal && !s.crossDomain ) {\n\
\t\t\t\t\t\t\t\t\t\tstatus = responses.text ? 200 : 404;\n\
\t\t\t\t\t\t\t\t\t// IE - #1450: sometimes returns 1223 when it should be 204\n\
\t\t\t\t\t\t\t\t\t} else if ( status === 1223 ) {\n\
\t\t\t\t\t\t\t\t\t\tstatus = 204;\n\
\t\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t} catch( firefoxAccessException ) {\n\
\t\t\t\t\t\t\tif ( !isAbort ) {\n\
\t\t\t\t\t\t\t\tcomplete( -1, firefoxAccessException );\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t}\n\
\n\
\t\t\t\t\t\t// Call complete if needed\n\
\t\t\t\t\t\tif ( responses ) {\n\
\t\t\t\t\t\t\tcomplete( status, statusText, responses, responseHeaders );\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t};\n\
\n\
\t\t\t\t\tif ( !s.async ) {\n\
\t\t\t\t\t\t// if we're in sync mode we fire the callback\n\
\t\t\t\t\t\tcallback();\n\
\t\t\t\t\t} else if ( xhr.readyState === 4 ) {\n\
\t\t\t\t\t\t// (IE6 & IE7) if it's in cache and has been\n\
\t\t\t\t\t\t// retrieved directly we need to fire the callback\n\
\t\t\t\t\t\tsetTimeout( callback );\n\
\t\t\t\t\t} else {\n\
\t\t\t\t\t\thandle = ++xhrId;\n\
\t\t\t\t\t\tif ( xhrOnUnloadAbort ) {\n\
\t\t\t\t\t\t\t// Create the active xhrs callbacks list if needed\n\
\t\t\t\t\t\t\t// and attach the unload handler\n\
\t\t\t\t\t\t\tif ( !xhrCallbacks ) {\n\
\t\t\t\t\t\t\t\txhrCallbacks = {};\n\
\t\t\t\t\t\t\t\tjQuery( window ).unload( xhrOnUnloadAbort );\n\
\t\t\t\t\t\t\t}\n\
\t\t\t\t\t\t\t// Add to list of active xhrs callbacks\n\
\t\t\t\t\t\t\txhrCallbacks[ handle ] = callback;\n\
\t\t\t\t\t\t}\n\
\t\t\t\t\t\txhr.onreadystatechange = callback;\n\
\t\t\t\t\t}\n\
\t\t\t\t},\n\
\n\
\t\t\t\tabort: function() {\n\
\t\t\t\t\tif ( callback ) {\n\
\t\t\t\t\t\tcallback( undefined, true );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t};\n\
\t\t}\n\
\t});\n\
}\n\
var fxNow, timerId,\n\
\trfxtypes = /^(?:toggle|show|hide)$/,\n\
\trfxnum = new RegExp( \"^(?:([+-])=|)(\" + core_pnum + \")([a-z%]*)$\", \"i\" ),\n\
\trrun = /queueHooks$/,\n\
\tanimationPrefilters = [ defaultPrefilter ],\n\
\ttweeners = {\n\
\t\t\"*\": [function( prop, value ) {\n\
\t\t\tvar end, unit,\n\
\t\t\t\ttween = this.createTween( prop, value ),\n\
\t\t\t\tparts = rfxnum.exec( value ),\n\
\t\t\t\ttarget = tween.cur(),\n\
\t\t\t\tstart = +target || 0,\n\
\t\t\t\tscale = 1,\n\
\t\t\t\tmaxIterations = 20;\n\
\n\
\t\t\tif ( parts ) {\n\
\t\t\t\tend = +parts[2];\n\
\t\t\t\tunit = parts[3] || ( jQuery.cssNumber[ prop ] ? \"\" : \"px\" );\n\
\n\
\t\t\t\t// We need to compute starting value\n\
\t\t\t\tif ( unit !== \"px\" && start ) {\n\
\t\t\t\t\t// Iteratively approximate from a nonzero starting point\n\
\t\t\t\t\t// Prefer the current property, because this process will be trivial if it uses the same units\n\
\t\t\t\t\t// Fallback to end or a simple constant\n\
\t\t\t\t\tstart = jQuery.css( tween.elem, prop, true ) || end || 1;\n\
\n\
\t\t\t\t\tdo {\n\
\t\t\t\t\t\t// If previous iteration zeroed out, double until we get *something*\n\
\t\t\t\t\t\t// Use a string for doubling factor so we don't accidentally see scale as unchanged below\n\
\t\t\t\t\t\tscale = scale || \".5\";\n\
\n\
\t\t\t\t\t\t// Adjust and apply\n\
\t\t\t\t\t\tstart = start / scale;\n\
\t\t\t\t\t\tjQuery.style( tween.elem, prop, start + unit );\n\
\n\
\t\t\t\t\t// Update scale, tolerating zero or NaN from tween.cur()\n\
\t\t\t\t\t// And breaking the loop if scale is unchanged or perfect, or if we've just had enough\n\
\t\t\t\t\t} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );\n\
\t\t\t\t}\n\
\n\
\t\t\t\ttween.unit = unit;\n\
\t\t\t\ttween.start = start;\n\
\t\t\t\t// If a +=/-= token was provided, we're doing a relative animation\n\
\t\t\t\ttween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;\n\
\t\t\t}\n\
\t\t\treturn tween;\n\
\t\t}]\n\
\t};\n\
\n\
// Animations created synchronously will run synchronously\n\
function createFxNow() {\n\
\tsetTimeout(function() {\n\
\t\tfxNow = undefined;\n\
\t});\n\
\treturn ( fxNow = jQuery.now() );\n\
}\n\
\n\
function createTweens( animation, props ) {\n\
\tjQuery.each( props, function( prop, value ) {\n\
\t\tvar collection = ( tweeners[ prop ] || [] ).concat( tweeners[ \"*\" ] ),\n\
\t\t\tindex = 0,\n\
\t\t\tlength = collection.length;\n\
\t\tfor ( ; index < length; index++ ) {\n\
\t\t\tif ( collection[ index ].call( animation, prop, value ) ) {\n\
\n\
\t\t\t\t// we're done with this property\n\
\t\t\t\treturn;\n\
\t\t\t}\n\
\t\t}\n\
\t});\n\
}\n\
\n\
function Animation( elem, properties, options ) {\n\
\tvar result,\n\
\t\tstopped,\n\
\t\tindex = 0,\n\
\t\tlength = animationPrefilters.length,\n\
\t\tdeferred = jQuery.Deferred().always( function() {\n\
\t\t\t// don't match elem in the :animated selector\n\
\t\t\tdelete tick.elem;\n\
\t\t}),\n\
\t\ttick = function() {\n\
\t\t\tif ( stopped ) {\n\
\t\t\t\treturn false;\n\
\t\t\t}\n\
\t\t\tvar currentTime = fxNow || createFxNow(),\n\
\t\t\t\tremaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),\n\
\t\t\t\t// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)\n\
\t\t\t\ttemp = remaining / animation.duration || 0,\n\
\t\t\t\tpercent = 1 - temp,\n\
\t\t\t\tindex = 0,\n\
\t\t\t\tlength = animation.tweens.length;\n\
\n\
\t\t\tfor ( ; index < length ; index++ ) {\n\
\t\t\t\tanimation.tweens[ index ].run( percent );\n\
\t\t\t}\n\
\n\
\t\t\tdeferred.notifyWith( elem, [ animation, percent, remaining ]);\n\
\n\
\t\t\tif ( percent < 1 && length ) {\n\
\t\t\t\treturn remaining;\n\
\t\t\t} else {\n\
\t\t\t\tdeferred.resolveWith( elem, [ animation ] );\n\
\t\t\t\treturn false;\n\
\t\t\t}\n\
\t\t},\n\
\t\tanimation = deferred.promise({\n\
\t\t\telem: elem,\n\
\t\t\tprops: jQuery.extend( {}, properties ),\n\
\t\t\topts: jQuery.extend( true, { specialEasing: {} }, options ),\n\
\t\t\toriginalProperties: properties,\n\
\t\t\toriginalOptions: options,\n\
\t\t\tstartTime: fxNow || createFxNow(),\n\
\t\t\tduration: options.duration,\n\
\t\t\ttweens: [],\n\
\t\t\tcreateTween: function( prop, end ) {\n\
\t\t\t\tvar tween = jQuery.Tween( elem, animation.opts, prop, end,\n\
\t\t\t\t\t\tanimation.opts.specialEasing[ prop ] || animation.opts.easing );\n\
\t\t\t\tanimation.tweens.push( tween );\n\
\t\t\t\treturn tween;\n\
\t\t\t},\n\
\t\t\tstop: function( gotoEnd ) {\n\
\t\t\t\tvar index = 0,\n\
\t\t\t\t\t// if we are going to the end, we want to run all the tweens\n\
\t\t\t\t\t// otherwise we skip this part\n\
\t\t\t\t\tlength = gotoEnd ? animation.tweens.length : 0;\n\
\t\t\t\tif ( stopped ) {\n\
\t\t\t\t\treturn this;\n\
\t\t\t\t}\n\
\t\t\t\tstopped = true;\n\
\t\t\t\tfor ( ; index < length ; index++ ) {\n\
\t\t\t\t\tanimation.tweens[ index ].run( 1 );\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// resolve when we played the last frame\n\
\t\t\t\t// otherwise, reject\n\
\t\t\t\tif ( gotoEnd ) {\n\
\t\t\t\t\tdeferred.resolveWith( elem, [ animation, gotoEnd ] );\n\
\t\t\t\t} else {\n\
\t\t\t\t\tdeferred.rejectWith( elem, [ animation, gotoEnd ] );\n\
\t\t\t\t}\n\
\t\t\t\treturn this;\n\
\t\t\t}\n\
\t\t}),\n\
\t\tprops = animation.props;\n\
\n\
\tpropFilter( props, animation.opts.specialEasing );\n\
\n\
\tfor ( ; index < length ; index++ ) {\n\
\t\tresult = animationPrefilters[ index ].call( animation, elem, props, animation.opts );\n\
\t\tif ( result ) {\n\
\t\t\treturn result;\n\
\t\t}\n\
\t}\n\
\n\
\tcreateTweens( animation, props );\n\
\n\
\tif ( jQuery.isFunction( animation.opts.start ) ) {\n\
\t\tanimation.opts.start.call( elem, animation );\n\
\t}\n\
\n\
\tjQuery.fx.timer(\n\
\t\tjQuery.extend( tick, {\n\
\t\t\telem: elem,\n\
\t\t\tanim: animation,\n\
\t\t\tqueue: animation.opts.queue\n\
\t\t})\n\
\t);\n\
\n\
\t// attach callbacks from options\n\
\treturn animation.progress( animation.opts.progress )\n\
\t\t.done( animation.opts.done, animation.opts.complete )\n\
\t\t.fail( animation.opts.fail )\n\
\t\t.always( animation.opts.always );\n\
}\n\
\n\
function propFilter( props, specialEasing ) {\n\
\tvar value, name, index, easing, hooks;\n\
\n\
\t// camelCase, specialEasing and expand cssHook pass\n\
\tfor ( index in props ) {\n\
\t\tname = jQuery.camelCase( index );\n\
\t\teasing = specialEasing[ name ];\n\
\t\tvalue = props[ index ];\n\
\t\tif ( jQuery.isArray( value ) ) {\n\
\t\t\teasing = value[ 1 ];\n\
\t\t\tvalue = props[ index ] = value[ 0 ];\n\
\t\t}\n\
\n\
\t\tif ( index !== name ) {\n\
\t\t\tprops[ name ] = value;\n\
\t\t\tdelete props[ index ];\n\
\t\t}\n\
\n\
\t\thooks = jQuery.cssHooks[ name ];\n\
\t\tif ( hooks && \"expand\" in hooks ) {\n\
\t\t\tvalue = hooks.expand( value );\n\
\t\t\tdelete props[ name ];\n\
\n\
\t\t\t// not quite $.extend, this wont overwrite keys already present.\n\
\t\t\t// also - reusing 'index' from above because we have the correct \"name\"\n\
\t\t\tfor ( index in value ) {\n\
\t\t\t\tif ( !( index in props ) ) {\n\
\t\t\t\t\tprops[ index ] = value[ index ];\n\
\t\t\t\t\tspecialEasing[ index ] = easing;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t} else {\n\
\t\t\tspecialEasing[ name ] = easing;\n\
\t\t}\n\
\t}\n\
}\n\
\n\
jQuery.Animation = jQuery.extend( Animation, {\n\
\n\
\ttweener: function( props, callback ) {\n\
\t\tif ( jQuery.isFunction( props ) ) {\n\
\t\t\tcallback = props;\n\
\t\t\tprops = [ \"*\" ];\n\
\t\t} else {\n\
\t\t\tprops = props.split(\" \");\n\
\t\t}\n\
\n\
\t\tvar prop,\n\
\t\t\tindex = 0,\n\
\t\t\tlength = props.length;\n\
\n\
\t\tfor ( ; index < length ; index++ ) {\n\
\t\t\tprop = props[ index ];\n\
\t\t\ttweeners[ prop ] = tweeners[ prop ] || [];\n\
\t\t\ttweeners[ prop ].unshift( callback );\n\
\t\t}\n\
\t},\n\
\n\
\tprefilter: function( callback, prepend ) {\n\
\t\tif ( prepend ) {\n\
\t\t\tanimationPrefilters.unshift( callback );\n\
\t\t} else {\n\
\t\t\tanimationPrefilters.push( callback );\n\
\t\t}\n\
\t}\n\
});\n\
\n\
function defaultPrefilter( elem, props, opts ) {\n\
\t/*jshint validthis:true */\n\
\tvar prop, index, length,\n\
\t\tvalue, dataShow, toggle,\n\
\t\ttween, hooks, oldfire,\n\
\t\tanim = this,\n\
\t\tstyle = elem.style,\n\
\t\torig = {},\n\
\t\thandled = [],\n\
\t\thidden = elem.nodeType && isHidden( elem );\n\
\n\
\t// handle queue: false promises\n\
\tif ( !opts.queue ) {\n\
\t\thooks = jQuery._queueHooks( elem, \"fx\" );\n\
\t\tif ( hooks.unqueued == null ) {\n\
\t\t\thooks.unqueued = 0;\n\
\t\t\toldfire = hooks.empty.fire;\n\
\t\t\thooks.empty.fire = function() {\n\
\t\t\t\tif ( !hooks.unqueued ) {\n\
\t\t\t\t\toldfire();\n\
\t\t\t\t}\n\
\t\t\t};\n\
\t\t}\n\
\t\thooks.unqueued++;\n\
\n\
\t\tanim.always(function() {\n\
\t\t\t// doing this makes sure that the complete handler will be called\n\
\t\t\t// before this completes\n\
\t\t\tanim.always(function() {\n\
\t\t\t\thooks.unqueued--;\n\
\t\t\t\tif ( !jQuery.queue( elem, \"fx\" ).length ) {\n\
\t\t\t\t\thooks.empty.fire();\n\
\t\t\t\t}\n\
\t\t\t});\n\
\t\t});\n\
\t}\n\
\n\
\t// height/width overflow pass\n\
\tif ( elem.nodeType === 1 && ( \"height\" in props || \"width\" in props ) ) {\n\
\t\t// Make sure that nothing sneaks out\n\
\t\t// Record all 3 overflow attributes because IE does not\n\
\t\t// change the overflow attribute when overflowX and\n\
\t\t// overflowY are set to the same value\n\
\t\topts.overflow = [ style.overflow, style.overflowX, style.overflowY ];\n\
\n\
\t\t// Set display property to inline-block for height/width\n\
\t\t// animations on inline elements that are having width/height animated\n\
\t\tif ( jQuery.css( elem, \"display\" ) === \"inline\" &&\n\
\t\t\t\tjQuery.css( elem, \"float\" ) === \"none\" ) {\n\
\n\
\t\t\t// inline-level elements accept inline-block;\n\
\t\t\t// block-level elements need to be inline with layout\n\
\t\t\tif ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === \"inline\" ) {\n\
\t\t\t\tstyle.display = \"inline-block\";\n\
\n\
\t\t\t} else {\n\
\t\t\t\tstyle.zoom = 1;\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\n\
\tif ( opts.overflow ) {\n\
\t\tstyle.overflow = \"hidden\";\n\
\t\tif ( !jQuery.support.shrinkWrapBlocks ) {\n\
\t\t\tanim.always(function() {\n\
\t\t\t\tstyle.overflow = opts.overflow[ 0 ];\n\
\t\t\t\tstyle.overflowX = opts.overflow[ 1 ];\n\
\t\t\t\tstyle.overflowY = opts.overflow[ 2 ];\n\
\t\t\t});\n\
\t\t}\n\
\t}\n\
\n\
\n\
\t// show/hide pass\n\
\tfor ( index in props ) {\n\
\t\tvalue = props[ index ];\n\
\t\tif ( rfxtypes.exec( value ) ) {\n\
\t\t\tdelete props[ index ];\n\
\t\t\ttoggle = toggle || value === \"toggle\";\n\
\t\t\tif ( value === ( hidden ? \"hide\" : \"show\" ) ) {\n\
\t\t\t\tcontinue;\n\
\t\t\t}\n\
\t\t\thandled.push( index );\n\
\t\t}\n\
\t}\n\
\n\
\tlength = handled.length;\n\
\tif ( length ) {\n\
\t\tdataShow = jQuery._data( elem, \"fxshow\" ) || jQuery._data( elem, \"fxshow\", {} );\n\
\t\tif ( \"hidden\" in dataShow ) {\n\
\t\t\thidden = dataShow.hidden;\n\
\t\t}\n\
\n\
\t\t// store state if its toggle - enables .stop().toggle() to \"reverse\"\n\
\t\tif ( toggle ) {\n\
\t\t\tdataShow.hidden = !hidden;\n\
\t\t}\n\
\t\tif ( hidden ) {\n\
\t\t\tjQuery( elem ).show();\n\
\t\t} else {\n\
\t\t\tanim.done(function() {\n\
\t\t\t\tjQuery( elem ).hide();\n\
\t\t\t});\n\
\t\t}\n\
\t\tanim.done(function() {\n\
\t\t\tvar prop;\n\
\t\t\tjQuery._removeData( elem, \"fxshow\" );\n\
\t\t\tfor ( prop in orig ) {\n\
\t\t\t\tjQuery.style( elem, prop, orig[ prop ] );\n\
\t\t\t}\n\
\t\t});\n\
\t\tfor ( index = 0 ; index < length ; index++ ) {\n\
\t\t\tprop = handled[ index ];\n\
\t\t\ttween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );\n\
\t\t\torig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );\n\
\n\
\t\t\tif ( !( prop in dataShow ) ) {\n\
\t\t\t\tdataShow[ prop ] = tween.start;\n\
\t\t\t\tif ( hidden ) {\n\
\t\t\t\t\ttween.end = tween.start;\n\
\t\t\t\t\ttween.start = prop === \"width\" || prop === \"height\" ? 1 : 0;\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
}\n\
\n\
function Tween( elem, options, prop, end, easing ) {\n\
\treturn new Tween.prototype.init( elem, options, prop, end, easing );\n\
}\n\
jQuery.Tween = Tween;\n\
\n\
Tween.prototype = {\n\
\tconstructor: Tween,\n\
\tinit: function( elem, options, prop, end, easing, unit ) {\n\
\t\tthis.elem = elem;\n\
\t\tthis.prop = prop;\n\
\t\tthis.easing = easing || \"swing\";\n\
\t\tthis.options = options;\n\
\t\tthis.start = this.now = this.cur();\n\
\t\tthis.end = end;\n\
\t\tthis.unit = unit || ( jQuery.cssNumber[ prop ] ? \"\" : \"px\" );\n\
\t},\n\
\tcur: function() {\n\
\t\tvar hooks = Tween.propHooks[ this.prop ];\n\
\n\
\t\treturn hooks && hooks.get ?\n\
\t\t\thooks.get( this ) :\n\
\t\t\tTween.propHooks._default.get( this );\n\
\t},\n\
\trun: function( percent ) {\n\
\t\tvar eased,\n\
\t\t\thooks = Tween.propHooks[ this.prop ];\n\
\n\
\t\tif ( this.options.duration ) {\n\
\t\t\tthis.pos = eased = jQuery.easing[ this.easing ](\n\
\t\t\t\tpercent, this.options.duration * percent, 0, 1, this.options.duration\n\
\t\t\t);\n\
\t\t} else {\n\
\t\t\tthis.pos = eased = percent;\n\
\t\t}\n\
\t\tthis.now = ( this.end - this.start ) * eased + this.start;\n\
\n\
\t\tif ( this.options.step ) {\n\
\t\t\tthis.options.step.call( this.elem, this.now, this );\n\
\t\t}\n\
\n\
\t\tif ( hooks && hooks.set ) {\n\
\t\t\thooks.set( this );\n\
\t\t} else {\n\
\t\t\tTween.propHooks._default.set( this );\n\
\t\t}\n\
\t\treturn this;\n\
\t}\n\
};\n\
\n\
Tween.prototype.init.prototype = Tween.prototype;\n\
\n\
Tween.propHooks = {\n\
\t_default: {\n\
\t\tget: function( tween ) {\n\
\t\t\tvar result;\n\
\n\
\t\t\tif ( tween.elem[ tween.prop ] != null &&\n\
\t\t\t\t(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {\n\
\t\t\t\treturn tween.elem[ tween.prop ];\n\
\t\t\t}\n\
\n\
\t\t\t// passing an empty string as a 3rd parameter to .css will automatically\n\
\t\t\t// attempt a parseFloat and fallback to a string if the parse fails\n\
\t\t\t// so, simple values such as \"10px\" are parsed to Float.\n\
\t\t\t// complex values such as \"rotate(1rad)\" are returned as is.\n\
\t\t\tresult = jQuery.css( tween.elem, tween.prop, \"\" );\n\
\t\t\t// Empty strings, null, undefined and \"auto\" are converted to 0.\n\
\t\t\treturn !result || result === \"auto\" ? 0 : result;\n\
\t\t},\n\
\t\tset: function( tween ) {\n\
\t\t\t// use step hook for back compat - use cssHook if its there - use .style if its\n\
\t\t\t// available and use plain properties where available\n\
\t\t\tif ( jQuery.fx.step[ tween.prop ] ) {\n\
\t\t\t\tjQuery.fx.step[ tween.prop ]( tween );\n\
\t\t\t} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {\n\
\t\t\t\tjQuery.style( tween.elem, tween.prop, tween.now + tween.unit );\n\
\t\t\t} else {\n\
\t\t\t\ttween.elem[ tween.prop ] = tween.now;\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
};\n\
\n\
// Remove in 2.0 - this supports IE8's panic based approach\n\
// to setting things on disconnected nodes\n\
\n\
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {\n\
\tset: function( tween ) {\n\
\t\tif ( tween.elem.nodeType && tween.elem.parentNode ) {\n\
\t\t\ttween.elem[ tween.prop ] = tween.now;\n\
\t\t}\n\
\t}\n\
};\n\
\n\
jQuery.each([ \"toggle\", \"show\", \"hide\" ], function( i, name ) {\n\
\tvar cssFn = jQuery.fn[ name ];\n\
\tjQuery.fn[ name ] = function( speed, easing, callback ) {\n\
\t\treturn speed == null || typeof speed === \"boolean\" ?\n\
\t\t\tcssFn.apply( this, arguments ) :\n\
\t\t\tthis.animate( genFx( name, true ), speed, easing, callback );\n\
\t};\n\
});\n\
\n\
jQuery.fn.extend({\n\
\tfadeTo: function( speed, to, easing, callback ) {\n\
\n\
\t\t// show any hidden elements after setting opacity to 0\n\
\t\treturn this.filter( isHidden ).css( \"opacity\", 0 ).show()\n\
\n\
\t\t\t// animate to the value specified\n\
\t\t\t.end().animate({ opacity: to }, speed, easing, callback );\n\
\t},\n\
\tanimate: function( prop, speed, easing, callback ) {\n\
\t\tvar empty = jQuery.isEmptyObject( prop ),\n\
\t\t\toptall = jQuery.speed( speed, easing, callback ),\n\
\t\t\tdoAnimation = function() {\n\
\t\t\t\t// Operate on a copy of prop so per-property easing won't be lost\n\
\t\t\t\tvar anim = Animation( this, jQuery.extend( {}, prop ), optall );\n\
\t\t\t\tdoAnimation.finish = function() {\n\
\t\t\t\t\tanim.stop( true );\n\
\t\t\t\t};\n\
\t\t\t\t// Empty animations, or finishing resolves immediately\n\
\t\t\t\tif ( empty || jQuery._data( this, \"finish\" ) ) {\n\
\t\t\t\t\tanim.stop( true );\n\
\t\t\t\t}\n\
\t\t\t};\n\
\t\t\tdoAnimation.finish = doAnimation;\n\
\n\
\t\treturn empty || optall.queue === false ?\n\
\t\t\tthis.each( doAnimation ) :\n\
\t\t\tthis.queue( optall.queue, doAnimation );\n\
\t},\n\
\tstop: function( type, clearQueue, gotoEnd ) {\n\
\t\tvar stopQueue = function( hooks ) {\n\
\t\t\tvar stop = hooks.stop;\n\
\t\t\tdelete hooks.stop;\n\
\t\t\tstop( gotoEnd );\n\
\t\t};\n\
\n\
\t\tif ( typeof type !== \"string\" ) {\n\
\t\t\tgotoEnd = clearQueue;\n\
\t\t\tclearQueue = type;\n\
\t\t\ttype = undefined;\n\
\t\t}\n\
\t\tif ( clearQueue && type !== false ) {\n\
\t\t\tthis.queue( type || \"fx\", [] );\n\
\t\t}\n\
\n\
\t\treturn this.each(function() {\n\
\t\t\tvar dequeue = true,\n\
\t\t\t\tindex = type != null && type + \"queueHooks\",\n\
\t\t\t\ttimers = jQuery.timers,\n\
\t\t\t\tdata = jQuery._data( this );\n\
\n\
\t\t\tif ( index ) {\n\
\t\t\t\tif ( data[ index ] && data[ index ].stop ) {\n\
\t\t\t\t\tstopQueue( data[ index ] );\n\
\t\t\t\t}\n\
\t\t\t} else {\n\
\t\t\t\tfor ( index in data ) {\n\
\t\t\t\t\tif ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {\n\
\t\t\t\t\t\tstopQueue( data[ index ] );\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\tfor ( index = timers.length; index--; ) {\n\
\t\t\t\tif ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {\n\
\t\t\t\t\ttimers[ index ].anim.stop( gotoEnd );\n\
\t\t\t\t\tdequeue = false;\n\
\t\t\t\t\ttimers.splice( index, 1 );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// start the next in the queue if the last step wasn't forced\n\
\t\t\t// timers currently will call their complete callbacks, which will dequeue\n\
\t\t\t// but only if they were gotoEnd\n\
\t\t\tif ( dequeue || !gotoEnd ) {\n\
\t\t\t\tjQuery.dequeue( this, type );\n\
\t\t\t}\n\
\t\t});\n\
\t},\n\
\tfinish: function( type ) {\n\
\t\tif ( type !== false ) {\n\
\t\t\ttype = type || \"fx\";\n\
\t\t}\n\
\t\treturn this.each(function() {\n\
\t\t\tvar index,\n\
\t\t\t\tdata = jQuery._data( this ),\n\
\t\t\t\tqueue = data[ type + \"queue\" ],\n\
\t\t\t\thooks = data[ type + \"queueHooks\" ],\n\
\t\t\t\ttimers = jQuery.timers,\n\
\t\t\t\tlength = queue ? queue.length : 0;\n\
\n\
\t\t\t// enable finishing flag on private data\n\
\t\t\tdata.finish = true;\n\
\n\
\t\t\t// empty the queue first\n\
\t\t\tjQuery.queue( this, type, [] );\n\
\n\
\t\t\tif ( hooks && hooks.cur && hooks.cur.finish ) {\n\
\t\t\t\thooks.cur.finish.call( this );\n\
\t\t\t}\n\
\n\
\t\t\t// look for any active animations, and finish them\n\
\t\t\tfor ( index = timers.length; index--; ) {\n\
\t\t\t\tif ( timers[ index ].elem === this && timers[ index ].queue === type ) {\n\
\t\t\t\t\ttimers[ index ].anim.stop( true );\n\
\t\t\t\t\ttimers.splice( index, 1 );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// look for any animations in the old queue and finish them\n\
\t\t\tfor ( index = 0; index < length; index++ ) {\n\
\t\t\t\tif ( queue[ index ] && queue[ index ].finish ) {\n\
\t\t\t\t\tqueue[ index ].finish.call( this );\n\
\t\t\t\t}\n\
\t\t\t}\n\
\n\
\t\t\t// turn off finishing flag\n\
\t\t\tdelete data.finish;\n\
\t\t});\n\
\t}\n\
});\n\
\n\
// Generate parameters to create a standard animation\n\
function genFx( type, includeWidth ) {\n\
\tvar which,\n\
\t\tattrs = { height: type },\n\
\t\ti = 0;\n\
\n\
\t// if we include width, step value is 1 to do all cssExpand values,\n\
\t// if we don't include width, step value is 2 to skip over Left and Right\n\
\tincludeWidth = includeWidth? 1 : 0;\n\
\tfor( ; i < 4 ; i += 2 - includeWidth ) {\n\
\t\twhich = cssExpand[ i ];\n\
\t\tattrs[ \"margin\" + which ] = attrs[ \"padding\" + which ] = type;\n\
\t}\n\
\n\
\tif ( includeWidth ) {\n\
\t\tattrs.opacity = attrs.width = type;\n\
\t}\n\
\n\
\treturn attrs;\n\
}\n\
\n\
// Generate shortcuts for custom animations\n\
jQuery.each({\n\
\tslideDown: genFx(\"show\"),\n\
\tslideUp: genFx(\"hide\"),\n\
\tslideToggle: genFx(\"toggle\"),\n\
\tfadeIn: { opacity: \"show\" },\n\
\tfadeOut: { opacity: \"hide\" },\n\
\tfadeToggle: { opacity: \"toggle\" }\n\
}, function( name, props ) {\n\
\tjQuery.fn[ name ] = function( speed, easing, callback ) {\n\
\t\treturn this.animate( props, speed, easing, callback );\n\
\t};\n\
});\n\
\n\
jQuery.speed = function( speed, easing, fn ) {\n\
\tvar opt = speed && typeof speed === \"object\" ? jQuery.extend( {}, speed ) : {\n\
\t\tcomplete: fn || !fn && easing ||\n\
\t\t\tjQuery.isFunction( speed ) && speed,\n\
\t\tduration: speed,\n\
\t\teasing: fn && easing || easing && !jQuery.isFunction( easing ) && easing\n\
\t};\n\
\n\
\topt.duration = jQuery.fx.off ? 0 : typeof opt.duration === \"number\" ? opt.duration :\n\
\t\topt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;\n\
\n\
\t// normalize opt.queue - true/undefined/null -> \"fx\"\n\
\tif ( opt.queue == null || opt.queue === true ) {\n\
\t\topt.queue = \"fx\";\n\
\t}\n\
\n\
\t// Queueing\n\
\topt.old = opt.complete;\n\
\n\
\topt.complete = function() {\n\
\t\tif ( jQuery.isFunction( opt.old ) ) {\n\
\t\t\topt.old.call( this );\n\
\t\t}\n\
\n\
\t\tif ( opt.queue ) {\n\
\t\t\tjQuery.dequeue( this, opt.queue );\n\
\t\t}\n\
\t};\n\
\n\
\treturn opt;\n\
};\n\
\n\
jQuery.easing = {\n\
\tlinear: function( p ) {\n\
\t\treturn p;\n\
\t},\n\
\tswing: function( p ) {\n\
\t\treturn 0.5 - Math.cos( p*Math.PI ) / 2;\n\
\t}\n\
};\n\
\n\
jQuery.timers = [];\n\
jQuery.fx = Tween.prototype.init;\n\
jQuery.fx.tick = function() {\n\
\tvar timer,\n\
\t\ttimers = jQuery.timers,\n\
\t\ti = 0;\n\
\n\
\tfxNow = jQuery.now();\n\
\n\
\tfor ( ; i < timers.length; i++ ) {\n\
\t\ttimer = timers[ i ];\n\
\t\t// Checks the timer has not already been removed\n\
\t\tif ( !timer() && timers[ i ] === timer ) {\n\
\t\t\ttimers.splice( i--, 1 );\n\
\t\t}\n\
\t}\n\
\n\
\tif ( !timers.length ) {\n\
\t\tjQuery.fx.stop();\n\
\t}\n\
\tfxNow = undefined;\n\
};\n\
\n\
jQuery.fx.timer = function( timer ) {\n\
\tif ( timer() && jQuery.timers.push( timer ) ) {\n\
\t\tjQuery.fx.start();\n\
\t}\n\
};\n\
\n\
jQuery.fx.interval = 13;\n\
\n\
jQuery.fx.start = function() {\n\
\tif ( !timerId ) {\n\
\t\ttimerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );\n\
\t}\n\
};\n\
\n\
jQuery.fx.stop = function() {\n\
\tclearInterval( timerId );\n\
\ttimerId = null;\n\
};\n\
\n\
jQuery.fx.speeds = {\n\
\tslow: 600,\n\
\tfast: 200,\n\
\t// Default speed\n\
\t_default: 400\n\
};\n\
\n\
// Back Compat <1.8 extension point\n\
jQuery.fx.step = {};\n\
\n\
if ( jQuery.expr && jQuery.expr.filters ) {\n\
\tjQuery.expr.filters.animated = function( elem ) {\n\
\t\treturn jQuery.grep(jQuery.timers, function( fn ) {\n\
\t\t\treturn elem === fn.elem;\n\
\t\t}).length;\n\
\t};\n\
}\n\
jQuery.fn.offset = function( options ) {\n\
\tif ( arguments.length ) {\n\
\t\treturn options === undefined ?\n\
\t\t\tthis :\n\
\t\t\tthis.each(function( i ) {\n\
\t\t\t\tjQuery.offset.setOffset( this, options, i );\n\
\t\t\t});\n\
\t}\n\
\n\
\tvar docElem, win,\n\
\t\tbox = { top: 0, left: 0 },\n\
\t\telem = this[ 0 ],\n\
\t\tdoc = elem && elem.ownerDocument;\n\
\n\
\tif ( !doc ) {\n\
\t\treturn;\n\
\t}\n\
\n\
\tdocElem = doc.documentElement;\n\
\n\
\t// Make sure it's not a disconnected DOM node\n\
\tif ( !jQuery.contains( docElem, elem ) ) {\n\
\t\treturn box;\n\
\t}\n\
\n\
\t// If we don't have gBCR, just use 0,0 rather than error\n\
\t// BlackBerry 5, iOS 3 (original iPhone)\n\
\tif ( typeof elem.getBoundingClientRect !== core_strundefined ) {\n\
\t\tbox = elem.getBoundingClientRect();\n\
\t}\n\
\twin = getWindow( doc );\n\
\treturn {\n\
\t\ttop: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),\n\
\t\tleft: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )\n\
\t};\n\
};\n\
\n\
jQuery.offset = {\n\
\n\
\tsetOffset: function( elem, options, i ) {\n\
\t\tvar position = jQuery.css( elem, \"position\" );\n\
\n\
\t\t// set position first, in-case top/left are set even on static elem\n\
\t\tif ( position === \"static\" ) {\n\
\t\t\telem.style.position = \"relative\";\n\
\t\t}\n\
\n\
\t\tvar curElem = jQuery( elem ),\n\
\t\t\tcurOffset = curElem.offset(),\n\
\t\t\tcurCSSTop = jQuery.css( elem, \"top\" ),\n\
\t\t\tcurCSSLeft = jQuery.css( elem, \"left\" ),\n\
\t\t\tcalculatePosition = ( position === \"absolute\" || position === \"fixed\" ) && jQuery.inArray(\"auto\", [curCSSTop, curCSSLeft]) > -1,\n\
\t\t\tprops = {}, curPosition = {}, curTop, curLeft;\n\
\n\
\t\t// need to be able to calculate position if either top or left is auto and position is either absolute or fixed\n\
\t\tif ( calculatePosition ) {\n\
\t\t\tcurPosition = curElem.position();\n\
\t\t\tcurTop = curPosition.top;\n\
\t\t\tcurLeft = curPosition.left;\n\
\t\t} else {\n\
\t\t\tcurTop = parseFloat( curCSSTop ) || 0;\n\
\t\t\tcurLeft = parseFloat( curCSSLeft ) || 0;\n\
\t\t}\n\
\n\
\t\tif ( jQuery.isFunction( options ) ) {\n\
\t\t\toptions = options.call( elem, i, curOffset );\n\
\t\t}\n\
\n\
\t\tif ( options.top != null ) {\n\
\t\t\tprops.top = ( options.top - curOffset.top ) + curTop;\n\
\t\t}\n\
\t\tif ( options.left != null ) {\n\
\t\t\tprops.left = ( options.left - curOffset.left ) + curLeft;\n\
\t\t}\n\
\n\
\t\tif ( \"using\" in options ) {\n\
\t\t\toptions.using.call( elem, props );\n\
\t\t} else {\n\
\t\t\tcurElem.css( props );\n\
\t\t}\n\
\t}\n\
};\n\
\n\
\n\
jQuery.fn.extend({\n\
\n\
\tposition: function() {\n\
\t\tif ( !this[ 0 ] ) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tvar offsetParent, offset,\n\
\t\t\tparentOffset = { top: 0, left: 0 },\n\
\t\t\telem = this[ 0 ];\n\
\n\
\t\t// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent\n\
\t\tif ( jQuery.css( elem, \"position\" ) === \"fixed\" ) {\n\
\t\t\t// we assume that getBoundingClientRect is available when computed position is fixed\n\
\t\t\toffset = elem.getBoundingClientRect();\n\
\t\t} else {\n\
\t\t\t// Get *real* offsetParent\n\
\t\t\toffsetParent = this.offsetParent();\n\
\n\
\t\t\t// Get correct offsets\n\
\t\t\toffset = this.offset();\n\
\t\t\tif ( !jQuery.nodeName( offsetParent[ 0 ], \"html\" ) ) {\n\
\t\t\t\tparentOffset = offsetParent.offset();\n\
\t\t\t}\n\
\n\
\t\t\t// Add offsetParent borders\n\
\t\t\tparentOffset.top  += jQuery.css( offsetParent[ 0 ], \"borderTopWidth\", true );\n\
\t\t\tparentOffset.left += jQuery.css( offsetParent[ 0 ], \"borderLeftWidth\", true );\n\
\t\t}\n\
\n\
\t\t// Subtract parent offsets and element margins\n\
\t\t// note: when an element has margin: auto the offsetLeft and marginLeft\n\
\t\t// are the same in Safari causing offset.left to incorrectly be 0\n\
\t\treturn {\n\
\t\t\ttop:  offset.top  - parentOffset.top - jQuery.css( elem, \"marginTop\", true ),\n\
\t\t\tleft: offset.left - parentOffset.left - jQuery.css( elem, \"marginLeft\", true)\n\
\t\t};\n\
\t},\n\
\n\
\toffsetParent: function() {\n\
\t\treturn this.map(function() {\n\
\t\t\tvar offsetParent = this.offsetParent || document.documentElement;\n\
\t\t\twhile ( offsetParent && ( !jQuery.nodeName( offsetParent, \"html\" ) && jQuery.css( offsetParent, \"position\") === \"static\" ) ) {\n\
\t\t\t\toffsetParent = offsetParent.offsetParent;\n\
\t\t\t}\n\
\t\t\treturn offsetParent || document.documentElement;\n\
\t\t});\n\
\t}\n\
});\n\
\n\
\n\
// Create scrollLeft and scrollTop methods\n\
jQuery.each( {scrollLeft: \"pageXOffset\", scrollTop: \"pageYOffset\"}, function( method, prop ) {\n\
\tvar top = /Y/.test( prop );\n\
\n\
\tjQuery.fn[ method ] = function( val ) {\n\
\t\treturn jQuery.access( this, function( elem, method, val ) {\n\
\t\t\tvar win = getWindow( elem );\n\
\n\
\t\t\tif ( val === undefined ) {\n\
\t\t\t\treturn win ? (prop in win) ? win[ prop ] :\n\
\t\t\t\t\twin.document.documentElement[ method ] :\n\
\t\t\t\t\telem[ method ];\n\
\t\t\t}\n\
\n\
\t\t\tif ( win ) {\n\
\t\t\t\twin.scrollTo(\n\
\t\t\t\t\t!top ? val : jQuery( win ).scrollLeft(),\n\
\t\t\t\t\ttop ? val : jQuery( win ).scrollTop()\n\
\t\t\t\t);\n\
\n\
\t\t\t} else {\n\
\t\t\t\telem[ method ] = val;\n\
\t\t\t}\n\
\t\t}, method, val, arguments.length, null );\n\
\t};\n\
});\n\
\n\
function getWindow( elem ) {\n\
\treturn jQuery.isWindow( elem ) ?\n\
\t\telem :\n\
\t\telem.nodeType === 9 ?\n\
\t\t\telem.defaultView || elem.parentWindow :\n\
\t\t\tfalse;\n\
}\n\
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods\n\
jQuery.each( { Height: \"height\", Width: \"width\" }, function( name, type ) {\n\
\tjQuery.each( { padding: \"inner\" + name, content: type, \"\": \"outer\" + name }, function( defaultExtra, funcName ) {\n\
\t\t// margin is only for outerHeight, outerWidth\n\
\t\tjQuery.fn[ funcName ] = function( margin, value ) {\n\
\t\t\tvar chainable = arguments.length && ( defaultExtra || typeof margin !== \"boolean\" ),\n\
\t\t\t\textra = defaultExtra || ( margin === true || value === true ? \"margin\" : \"border\" );\n\
\n\
\t\t\treturn jQuery.access( this, function( elem, type, value ) {\n\
\t\t\t\tvar doc;\n\
\n\
\t\t\t\tif ( jQuery.isWindow( elem ) ) {\n\
\t\t\t\t\t// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there\n\
\t\t\t\t\t// isn't a whole lot we can do. See pull request at this URL for discussion:\n\
\t\t\t\t\t// https://github.com/jquery/jquery/pull/764\n\
\t\t\t\t\treturn elem.document.documentElement[ \"client\" + name ];\n\
\t\t\t\t}\n\
\n\
\t\t\t\t// Get document width or height\n\
\t\t\t\tif ( elem.nodeType === 9 ) {\n\
\t\t\t\t\tdoc = elem.documentElement;\n\
\n\
\t\t\t\t\t// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest\n\
\t\t\t\t\t// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.\n\
\t\t\t\t\treturn Math.max(\n\
\t\t\t\t\t\telem.body[ \"scroll\" + name ], doc[ \"scroll\" + name ],\n\
\t\t\t\t\t\telem.body[ \"offset\" + name ], doc[ \"offset\" + name ],\n\
\t\t\t\t\t\tdoc[ \"client\" + name ]\n\
\t\t\t\t\t);\n\
\t\t\t\t}\n\
\n\
\t\t\t\treturn value === undefined ?\n\
\t\t\t\t\t// Get width or height on the element, requesting but not forcing parseFloat\n\
\t\t\t\t\tjQuery.css( elem, type, extra ) :\n\
\n\
\t\t\t\t\t// Set width or height on the element\n\
\t\t\t\t\tjQuery.style( elem, type, value, extra );\n\
\t\t\t}, type, chainable ? margin : undefined, chainable, null );\n\
\t\t};\n\
\t});\n\
});\n\
// Limit scope pollution from any deprecated API\n\
// (function() {\n\
\n\
// })();\n\
\n\
// Expose for component\n\
module.exports = jQuery;\n\
\n\
// Expose jQuery to the global object\n\
//window.jQuery = window.$ = jQuery;\n\
\n\
// Expose jQuery as an AMD module, but only for AMD loaders that\n\
// understand the issues with loading multiple versions of jQuery\n\
// in a page that all might call define(). The loader will indicate\n\
// they have special allowances for multiple jQuery versions by\n\
// specifying define.amd.jQuery = true. Register as a named module,\n\
// since jQuery can be concatenated with other files that may use define,\n\
// but not use a proper concatenation script that understands anonymous\n\
// AMD modules. A named AMD is safest and most robust way to register.\n\
// Lowercase jquery is used because AMD module names are derived from\n\
// file names, and jQuery is normally delivered in a lowercase file name.\n\
// Do this after creating the global so that if an AMD module wants to call\n\
// noConflict to hide this version of jQuery, it will work.\n\
if ( typeof define === \"function\" && define.amd && define.amd.jQuery ) {\n\
\tdefine( \"jquery\", [], function () { return jQuery; } );\n\
}\n\
\n\
})( window );\n\
//@ sourceURL=component-jquery/index.js"
));
require.register("component-inherit/index.js", Function("exports, require, module",
"\n\
module.exports = function(a, b){\n\
  var fn = function(){};\n\
  fn.prototype = b.prototype;\n\
  a.prototype = new fn;\n\
  a.prototype.constructor = a;\n\
};//@ sourceURL=component-inherit/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  on.fn = fn;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var cb;\n\
  for (var i = 0; i < callbacks.length; i++) {\n\
    cb = callbacks[i];\n\
    if (cb === fn || cb.fn === fn) {\n\
      callbacks.splice(i, 1);\n\
      break;\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("stagas-viewport/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
var Emitter = require('emitter'),\n\
    win = window,\n\
    doc = win.document,\n\
    docEl = doc.documentElement,\n\
    on = win.addEventListener || win.attachEvent,\n\
    RESIZE = (win.attachEvent) ? 'onresize' : 'resize',\n\
    SCROLL = (win.attachEvent) ? 'onscroll' : 'scroll',\n\
    resized = false,\n\
    scrolled = false;\n\
\n\
function update() {\n\
    // No changing, exit\n\
    if (!resized && !scrolled) { return; }\n\
\n\
    var eve = resized ? 'resize' : 'scroll';\n\
\n\
    // Updates viewport\n\
    this.refresh();\n\
\n\
    // Change status\n\
    resized = false;\n\
    scrolled = false;\n\
\n\
    // Emits the current event\n\
    this.emit(eve);\n\
}\n\
\n\
/**\n\
 * Events\n\
 */\n\
on(RESIZE, function () { resized = true; });\n\
on(SCROLL, function () { scrolled = true; });\n\
\n\
/**\n\
 * Viewport class\n\
 */\n\
function Viewport() {\n\
\n\
    // Singleton pattern\n\
    if (!(this instanceof Viewport) && Viewport.getInstance === undefined) {\n\
        return new Viewport();\n\
    }\n\
\n\
    if (Viewport.getInstance) {\n\
        return Viewport.getInstance;\n\
    }\n\
\n\
    this.init();\n\
}\n\
\n\
Emitter(Viewport.prototype);\n\
\n\
Viewport.prototype.init = function () {\n\
    var that = this;\n\
\n\
    that.refresh();\n\
    that.calculateDeviceDimensions();\n\
\n\
    win.setInterval(function () {\n\
        update.call(that);\n\
    }, 350);\n\
\n\
    Viewport.getInstance = this;\n\
};\n\
\n\
Viewport.prototype.device = {};\n\
\n\
Viewport.prototype.calculateDimensions = function () {\n\
    this.height = docEl.clientHeight;\n\
    this.width = docEl.clientWidth;\n\
};\n\
\n\
Viewport.prototype.calculateDeviceDimensions = function () {\n\
    this.device.height = win.screen.height;\n\
    this.device.width = win.screen.width;\n\
};\n\
\n\
Viewport.prototype.calculateScroll = function () {\n\
    var cachedTop = this.scrollY,\n\
        cachedBottom = this.height + cachedTop,\n\
        bottom;\n\
\n\
    this.scrollY = win.pageYOffset || docEl.scrollTop;\n\
    this.scrollX = win.pageXOffset || docEl.scrollLeft;\n\
    bottom = this.height + this.scrollY;\n\
\n\
    if (cachedTop !== this.scrollY && this.scrollY === 0) {\n\
        this.emit('top');\n\
\n\
    } else if (cachedBottom !== bottom && bottom >= doc.body.scrollHeight) {\n\
        this.emit('bottom');\n\
    }\n\
};\n\
\n\
Viewport.prototype.calculateOffset = function () {\n\
    this.top = this.scrollY;\n\
    this.right = this.scrollX + this.width;\n\
    this.bottom = this.scrollY + this.height;\n\
    this.left = this.scrollX;\n\
};\n\
\n\
Viewport.prototype.calculateMousePostition = function (eve) {\n\
    // add support for touch events ==> eve.changedTouches;\n\
    var coordX = 0,\n\
        coordY = 0;\n\
\n\
    eve = eve || window.event;\n\
\n\
    if (eve.pageX || eve.pageY) {\n\
        coordX = eve.pageX;\n\
        coordY = eve.pageY;\n\
\n\
    } else {\n\
        coordX = eve.clientX + doc.body.scrollLeft + docEl.scrollLeft;\n\
        coordY = eve.clientY + doc.body.scrollTop + docEl.scrollTop;\n\
    }\n\
\n\
    return {\n\
        'posX': coordX,\n\
        'posY': coordY\n\
    };\n\
};\n\
\n\
Viewport.prototype.calculateOrientation = function () {\n\
    this.orientation = (Math.abs(win.orientation) === 90)\n\
        ? 'landscape'\n\
        : 'portrait';\n\
};\n\
\n\
Viewport.prototype.inViewport = function (el) {\n\
    var r = el.getBoundingClientRect();\n\
\n\
    return (r.top > 0) && (r.right < this.width)\n\
        && (r.bottom < this.height) && (r.left > 0);\n\
};\n\
\n\
Viewport.prototype.isVisible = function (el) {\n\
    var r = el.getBoundingClientRect();\n\
\n\
    return (r.height >= this.top);\n\
};\n\
\n\
Viewport.prototype.refresh = function () {\n\
    this.calculateDimensions();\n\
    this.calculateScroll();\n\
    this.calculateOffset();\n\
    this.calculateOrientation();\n\
};\n\
\n\
/**\n\
 * Expose Viewport singleton instance\n\
 */\n\
exports = module.exports = new Viewport();\n\
\n\
/**\n\
 * Expose Viewport class\n\
 */\n\
exports.Viewport = Viewport;\n\
//@ sourceURL=stagas-viewport/index.js"
));
require.register("stagas-menu/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
  , viewport = require('viewport')\n\
  , o = require('jquery');\n\
\n\
/**\n\
 * Expose `Menu`.\n\
 */\n\
\n\
module.exports = Menu;\n\
\n\
/**\n\
 * Initialize a new `Menu`.\n\
 *\n\
 * ```js\n\
 * var Menu = require('menu');\n\
 * var menu = new Menu();\n\
 * var menu = Menu();\n\
 * ```\n\
 *\n\
 * Emits:\n\
 *\n\
 * - \"show\" when shown\n\
 * - \"hide\" when hidden\n\
 * - \"remove\" with the item name when an item is removed\n\
 * - \"select\" (item) when an item is selected\n\
 * - * menu item events are emitted when clicked\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Menu() {\n\
  if (!(this instanceof Menu)) return new Menu;\n\
  Emitter.call(this);\n\
  this.items = [];\n\
  this.el = o('<ul class=menu>').hide().appendTo('body');\n\
  this.on('show', this.bindEvents.bind(this));\n\
  this.on('hide', this.unbindEvents.bind(this));\n\
  this._isOpen = false;\n\
}\n\
\n\
/**\n\
 * Inherit from `Emitter.prototype`.\n\
 */\n\
\n\
Menu.prototype = new Emitter;\n\
\n\
/**\n\
 * Deselect selected menu items.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.deselect = function(ev){\n\
  if (!this.selected) return;\n\
  this.selected.el.removeClass('selected');\n\
  this.selected = null;\n\
};\n\
\n\
/**\n\
 * Bind event listeners.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.bindEvents = function(){\n\
  this.bindKeyboardEvents();\n\
  this.bindMouseEvents();\n\
};\n\
\n\
/**\n\
 * Unbind event listeners.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.unbindEvents = function(){\n\
  this.unbindKeyboardEvents();\n\
  this.unbindMouseEvents();\n\
};\n\
\n\
/**\n\
 * Bind mouse events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.bindMouseEvents = function(){\n\
  this.onbodyclickBound = this.onbodyclick.bind(this)\n\
  this.deselectBound = this.deselect.bind(this);\n\
  var self = this;\n\
  setTimeout(function () {\n\
    o('html').bind('mouseup', self.onbodyclickBound);\n\
  }, 0)\n\
  this.el.one('mouseover', 'a', this.deselectBound);\n\
};\n\
\n\
/**\n\
 * Unbind mouse events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.unbindMouseEvents = function(){\n\
  o('html').unbind('mouseup', this.onbodyclickBound);\n\
};\n\
\n\
/**\n\
 * Bind keyboard events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.bindKeyboardEvents = function(){\n\
  this.onkeydownBound = this.onkeydown.bind(this);\n\
  o('html').bind('keydown', this.onkeydownBound);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind keyboard events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.unbindKeyboardEvents = function(){\n\
  o('html').unbind('keydown', this.onkeydownBound);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit selected if any.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.emitSelected = function(){\n\
  if (this.selected) {\n\
    this.emit('select', this.selected);\n\
    this.emit(this.selected.slug, this.selected);\n\
    this.emit(this.selected.text, this.selected);\n\
    this.selected.fn && this.selected.fn();\n\
  }\n\
};\n\
\n\
/**\n\
 * Handle keydown events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.onkeydown = function(e){\n\
  switch (e.keyCode) {\n\
    case 39: // right\n\
    case 9: // tab\n\
      this.emitSelected();\n\
      this.hide();\n\
    break;\n\
\n\
    case 13: // enter\n\
      e.preventDefault();\n\
      this.emitSelected();\n\
      this.hide();\n\
      return false;\n\
    break;\n\
\n\
    case 27: // tab\n\
    case 37: // left\n\
      this.deselect();\n\
      this.hide();\n\
    break;\n\
\n\
    case 38: // up\n\
      e.preventDefault();\n\
      this.move('prev');\n\
      this._isSelecting = true;\n\
    break;\n\
\n\
    case 40: // down\n\
      e.preventDefault();\n\
      this.move('next');\n\
      this._isSelecting = true;\n\
    break;\n\
  }\n\
};\n\
\n\
/**\n\
 * Handle body click event.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.onbodyclick = function() {\n\
  if (this.isOpen()) this.hide();\n\
};\n\
\n\
/**\n\
 * Select (highlight) an item.\n\
 *\n\
 * @param {MenuItem} item\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.select = function(item){\n\
  this.selected = item;\n\
  this.selected.el.addClass('selected');\n\
  this.selected.el.find('a').focus();\n\
};\n\
\n\
/**\n\
 * Focus on the next menu item in `direction`.\n\
 *\n\
 * @param {String} direction \"prev\" or \"next\"\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.move = function(direction){\n\
  var sel = this.selected;\n\
\n\
  var items = this.items.slice();\n\
  items = items.filter(function (item) {\n\
    return ! item.hidden;\n\
  });\n\
\n\
  if (!sel) {\n\
    if ('next' == direction)\n\
      sel = items[items.length-1];\n\
    else sel = items[0];\n\
  }\n\
  else {\n\
    sel.el.removeClass('selected');\n\
  }\n\
\n\
  var index = items.indexOf(sel);\n\
\n\
  if ('next' == direction){\n\
    if (++index >= items.length) index = 0;\n\
    sel = items[index];\n\
  }\n\
  else if ('prev' == direction){\n\
    if (--index < 0) index = items.length-1;\n\
    sel = items[index];\n\
  }\n\
\n\
  this.select(sel);\n\
};\n\
\n\
/**\n\
 * Gets a menu item named `slug`.\n\
 *\n\
 * @param {String} slug\n\
 * @return {MenuItem}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.get = function(slug){\n\
  slug = createSlug(slug);\n\
  var item = this.items.filter(function(item){\n\
    return item.slug === slug;\n\
  })[0];\n\
  return item;\n\
};\n\
\n\
/**\n\
 * Add a new menu item with the given `text`, optional `slug` and callback `fn`.\n\
 *\n\
 * When the item is clicked `fn()` will be invoked\n\
 * and the `Menu` is immediately closed. When clicked\n\
 * an event of the name `text` is emitted regardless of\n\
 * the callback function being present.\n\
 *\n\
 * Using events to handle selection:\n\
 *\n\
 * ```js\n\
 * menu.add('Hello');\n\
 *\n\
 * menu.on('Hello', function(){\n\
 *   console.log('clicked hello');\n\
 * });\n\
 * ```\n\
 *\n\
 * Using callbacks:\n\
 *\n\
 * ```js\n\
 * menu.add('Hello', function(){\n\
 *   console.log('clicked hello');\n\
 * });\n\
 * ```\n\
 *\n\
 * Using a custom slug, otherwise \"hello\" is generated\n\
 * from the `text` given, which may conflict with \"rich\"\n\
 * styling like icons within menu items, or i18n.\n\
 *\n\
 * ```js\n\
 * menu.add('add-item', 'Add Item');\n\
 *\n\
 * menu.on('add-item', function(){\n\
 *   console.log('clicked \"Add Item\"');\n\
 * });\n\
 *\n\
 * menu.add('add-item', 'Add Item', function(){\n\
 *   console.log('clicked \"Add Item\"');\n\
 * });\n\
 * ```\n\
 *\n\
 * @param {String} text\n\
 * @param {Function} fn\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.add = function(text, fn){\n\
  var slug, meta;\n\
\n\
  // slug, text, [fn]\n\
  if ('string' == typeof fn) {\n\
    slug = text;\n\
    text = fn;\n\
    fn = arguments[2];\n\
    if ('function' != typeof fn) {\n\
      meta = fn;\n\
      fn = arguments[3];\n\
    }\n\
  } else {\n\
    slug = createSlug(text);\n\
  }\n\
\n\
  if ('object' == typeof fn) {\n\
    meta = fn;\n\
    fn = arguments[2];\n\
  }\n\
\n\
  var self = this\n\
    , el = o('<li><a href=\"#\">' + text + '</a></li>');\n\
\n\
  el\n\
  .addClass('menu-item-' + slug)\n\
  .appendTo(this.el)\n\
  .on('click', function(e){\n\
    e.preventDefault();\n\
  })\n\
  .on('mousedown', function(e){\n\
    self._isSelecting = true;\n\
  })\n\
  .on('mouseup', function(e){\n\
    e.preventDefault();\n\
    self.select(item);\n\
    self.emitSelected();\n\
  });\n\
\n\
  var item = new MenuItem({\n\
    el: el\n\
  , text: text\n\
  , slug: slug\n\
  , meta: meta\n\
  , fn: fn\n\
  });\n\
\n\
  if (this.has(slug)) {\n\
    this.hideItem(item);\n\
  }\n\
\n\
  this.items.push(item);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove an item by the given `slug`:\n\
 *\n\
 * ```js\n\
 * menu.add('Add item');\n\
 * menu.remove('Add item');\n\
 * ```\n\
 *\n\
 * Or with custom slugs:\n\
 *\n\
 * ```js\n\
 * menu.add('add-item', 'Add item');\n\
 * menu.remove('add-item');\n\
 * ```\n\
 *\n\
 * @param {String} slug\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.remove = function(slug){\n\
  var item = this.get(slug);\n\
  if (!(item instanceof MenuItem)) {\n\
    throw new Error('Not a MenuItem: \"'+slug+'\"');\n\
  }\n\
  var i = this.indexOf(item);\n\
  if (!~i) {\n\
    throw new Error('Not in Menu.items: \"'+slug+'\"');\n\
  }\n\
  item.el.remove();\n\
  this.emit('remove', this.items.splice(i, 1));\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Change menu item with `slug`.\n\
 *\n\
 * @param {String} slug\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.change = function(slug){\n\
  this.add.apply(this, [].slice.call(arguments, 1));\n\
  var item = this.items.pop();\n\
  var old = this.get(slug);\n\
  this.el[0].insertBefore(item.el[0], old.el[0]);\n\
  old.el.remove()\n\
  this.items.splice(this.indexOf(old), 1, item);\n\
  this.select(item);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Clear menu.\n\
 *\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.clear = function(){\n\
  this.el.empty();\n\
  this.items.length = 0;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if a menu item is present.\n\
 *\n\
 * ```js\n\
 * menu.add('Add item');\n\
 *\n\
 * menu.has('Add item');\n\
 * // => true\n\
 *\n\
 * menu.has('add-item');\n\
 * // => true\n\
 *\n\
 * menu.has('Foo');\n\
 * // => false\n\
 * ```\n\
 *\n\
 * @param {MenuItem} item\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.has = function(item){\n\
  return !!~this.items.indexOf(item);\n\
}\n\
\n\
/**\n\
 * Find index of menu `item`.\n\
 *\n\
 * @param {MenuItem} item\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.indexOf = function(item){\n\
  return this.items.indexOf(item);\n\
}\n\
\n\
/**\n\
 * Move context menu to `(x, y)`.\n\
 *\n\
 * @param {Number} x\n\
 * @param {Number} y\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.moveTo = function(x, y){\n\
  var width = o(this.el).outerWidth();\n\
\n\
  viewport.refresh();\n\
\n\
  if (x+width > viewport.right) {\n\
    x = viewport.right-width;\n\
  }\n\
\n\
  if (x < viewport.left) {\n\
    x = viewport.left;\n\
  }\n\
\n\
  this.el.css({\n\
    left: x\n\
  });\n\
\n\
  viewport.refresh();\n\
\n\
  var height = o(this.el).outerHeight();\n\
\n\
  if (y+height > viewport.bottom) {\n\
    y = viewport.bottom-height;\n\
  }\n\
\n\
  if (y < viewport.top) {\n\
    y = viewport.top;\n\
  }\n\
\n\
  this.el.css({\n\
    top: y\n\
  });\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Move context menu to `(x, y)`.\n\
 *\n\
 * @param {Number} x\n\
 * @param {Number} y\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.moveToCenter = function(x, y){\n\
  y -= this.el.outerHeight(true)/2\n\
  this.moveTo(x, y);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show the menu.\n\
 *\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.show = function(){\n\
  if (this.isOpen()) return this;\n\
\n\
  if (!this.hasVisibleItems()) return this;\n\
\n\
  this.el.show();\n\
  this._isOpen = true;\n\
\n\
  this.emit('show');\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Hide the menu.\n\
 *\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.hide = function(){\n\
  if (!this.isOpen()) return this;\n\
\n\
  this.emit('hide');\n\
\n\
  this.el.hide();\n\
  this._isOpen = false;\n\
\n\
  this._isSelecting = false\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show a menu item.\n\
 *\n\
 * @param {MenuItem} item\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.showItem = function(item){\n\
  item.hidden = false;\n\
  item.el.css({ display: 'block' });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Hide a menu item.\n\
 *\n\
 * @param {MenuItem} item\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.hideItem = function(item){\n\
  item.hidden = true;\n\
  item.el.css({ display: 'none' });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unhide all items.\n\
 *\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.unhideAll = function(){\n\
  var self = this;\n\
  this.items.forEach(function(item){\n\
    self.showItem(item);\n\
  });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle the menu.\n\
 *\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.toggle = function(){\n\
  if (this.isOpen()) this.hide();\n\
  else this.show();\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Filter menu using `fn`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Menu}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.filter = function(fn){\n\
  var self = this;\n\
\n\
  this.items.forEach(function (item) {\n\
    if (fn(item)) {\n\
      self.showItem(item);\n\
    }\n\
    else {\n\
      self.hideItem(item);\n\
    }\n\
  });\n\
\n\
  if (!this.hasVisibleItems()) this.hide();\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if there are visible items.\n\
 *\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
Menu.prototype.hasVisibleItems = function(){\n\
  return this.items.filter(function (item) {\n\
    return !item.hidden;\n\
  }).length!=0\n\
};\n\
\n\
/**\n\
 * Check if menu is visible.\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.isOpen = function(){\n\
  return this._isOpen;\n\
};\n\
\n\
/**\n\
 * Check if user is selecting.\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Menu.prototype.isSelecting = function(){\n\
  return this._isSelecting;\n\
};\n\
\n\
/**\n\
 * MenuItem class.\n\
 *\n\
 * @param {Object} item\n\
 * @api public\n\
 */\n\
\n\
function MenuItem(item) {\n\
  this.el = item.el\n\
  this.text = item.text\n\
  this.slug = item.slug\n\
  this.meta = item.meta\n\
  this.fn = item.fn\n\
}\n\
\n\
/**\n\
 * Generate a slug from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function createSlug(str) {\n\
  return String(str)\n\
    .toLowerCase()\n\
    .replace(/ +/g, '-')\n\
    .replace(/[^a-z0-9-]/g, '');\n\
}\n\
//@ sourceURL=stagas-menu/index.js"
));
require.register("stagas-dropdown/index.js", Function("exports, require, module",
"\n\
/*!\n\
 *\n\
 * Dropdown\n\
 *\n\
 * MIT\n\
 *\n\
 */\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var o = require('jquery')\n\
var inherit = require('inherit')\n\
var viewport = require('viewport')\n\
var Menu = require('menu')\n\
\n\
/**\n\
 * Exports.\n\
 */\n\
\n\
module.exports = Dropdown\n\
\n\
/**\n\
 * Dropdown class.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Dropdown (ref) {\n\
  if (!(this instanceof Dropdown)) return new Dropdown(ref)\n\
  Menu.call(this, this.dropdown)\n\
\n\
  this.el.addClass('dropdown')\n\
  this.ref = o(ref)\n\
  this.bindRefEvents()\n\
  this.reposition()\n\
}\n\
\n\
/**\n\
 * Inherit from Menu.\n\
 */\n\
\n\
inherit(Dropdown, Menu)\n\
\n\
/**\n\
 * Bind reference element event handlers.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Dropdown.prototype.bindRefEvents = function () {\n\
  var self = this\n\
\n\
  var noShow = false\n\
\n\
  function onfocusRef (ev) {\n\
    ev.preventDefault()\n\
    ev.stopPropagation()\n\
\n\
    if (!noShow) self.show()\n\
    noShow = false\n\
  }\n\
\n\
  function onclickRef (ev) {\n\
    onfocusRef(ev)\n\
  }\n\
\n\
  function onblurRef (ev) {\n\
    if (!self.isSelecting()) {\n\
      setTimeout(function () {\n\
        self.hide()\n\
      }, 0)\n\
    }\n\
  }\n\
\n\
  function onkeydownRef (ev) {\n\
    switch (ev.which) {\n\
      case 9: // tab\n\
        self.hide()\n\
      break\n\
\n\
      case 39: // right\n\
        ev.stopPropagation()\n\
      break\n\
\n\
      case 27: // esc\n\
        if (!self.isOpen()) this.blur()\n\
      break\n\
\n\
      default: // typing anything\n\
        self._isSelecting = true\n\
        self.show()\n\
      break\n\
    }\n\
  }\n\
\n\
  function onmouseupRef (ev) {\n\
    self.toggle()\n\
  }\n\
\n\
  function onkeydownEl (ev) {\n\
    if (37 === ev.which) {\n\
      noShow = true\n\
    }\n\
    self.ref[0].focus()\n\
  }\n\
\n\
  function onmouseupBody (ev) {\n\
    ev.preventDefault()\n\
    ev.stopPropagation()\n\
  }\n\
\n\
  this.ref.on('keydown', onkeydownRef)\n\
  this.ref.on('mouseup', onmouseupRef)\n\
  this.ref.on('focus', onfocusRef)\n\
  this.ref.on('click', onclickRef)\n\
  this.ref.on('blur', onblurRef)\n\
\n\
  this.on('show', function () {\n\
    this.reposition()\n\
    setTimeout(function () {\n\
      this.reposition()\n\
    }.bind(this), 0)\n\
    this.el.on('keydown', onkeydownEl)\n\
  })\n\
\n\
  this.on('hide', function () {\n\
    this.el.off('keydown', onkeydownEl)\n\
  })\n\
\n\
  this.unbindRefEvents = function () {\n\
    this.ref.off('focus', onfocusRef)\n\
    this.ref.off('click', onclickRef)\n\
    this.ref.off('blur', onblurRef)\n\
    this.ref.off('keydown', onkeydownRef)\n\
    this.ref.off('mouseup', onmouseupRef)\n\
  }.bind(this)\n\
}\n\
\n\
/**\n\
 * Reposition dropdown relative to reference\n\
 * element.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Dropdown.prototype.reposition = function () {\n\
  var offset = this.ref[0].getBoundingClientRect()\n\
  viewport.refresh()\n\
  var x = offset.left+viewport.left\n\
  var y = offset.top+offset.height+viewport.top\n\
  var eh = this.el.outerHeight(true)\n\
  // show from above if below visible\n\
  if (y + eh > viewport.bottom) {\n\
    y = offset.top - eh + viewport.top\n\
  }\n\
  var w = offset.width\n\
  this.moveTo(x, y)\n\
  this.el.css({\n\
    maxWidth: w\n\
  , minWidth: w\n\
  , width: w\n\
  })\n\
}\n\
//@ sourceURL=stagas-dropdown/index.js"
));
require.register("stagas-autocomplete/index.js", Function("exports, require, module",
"\n\
/*!\n\
 *\n\
 * autocomplete\n\
 *\n\
 * MIT\n\
 *\n\
 */\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Dropdown = require('dropdown')\n\
\n\
/**\n\
 * Exports.\n\
 */\n\
\n\
module.exports = autocomplete\n\
\n\
/**\n\
 * autocomplete\n\
 *\n\
 * Attach autocomplete to an input element.\n\
 *\n\
 * @param {Element} input\n\
 * @param {Array} [items]\n\
 * @param {Function} [fn]\n\
 * @return {Dropdown} autocomplete\n\
 * @api public\n\
 */\n\
\n\
function autocomplete (input, items, fn) {\n\
  // parse arguments\n\
  if ('function' == typeof items) {\n\
    fn = items\n\
    items = []\n\
  }\n\
\n\
  // create dropdown\n\
  var dropdown = Dropdown(input)\n\
\n\
  // remember last value\n\
  var lastValue = null\n\
\n\
  // add items\n\
  items.forEach(function (item) {\n\
    dropdown.add(item)\n\
  })\n\
\n\
  // remember latest fn\n\
  var latest\n\
\n\
  dropdown._maxItems = 5\n\
  dropdown.maxItems = function (n) {\n\
    this._maxItems = n\n\
    return this\n\
  }\n\
\n\
  // get input value on keyup\n\
  input.onkeyup = input.onfocus = function (ev) {\n\
    var val = input.value\n\
    if (val === lastValue) return\n\
    lastValue = val\n\
\n\
    // filter already inserted items\n\
    dropdown.filter(both(match(val), limit(dropdown._maxItems)))\n\
    dropdown.show()\n\
\n\
    // fetch async\n\
    if (fn) {\n\
      latest = function me (res) {\n\
        // only run if it's the latest\n\
        if (latest !== me) return\n\
        if (!res.length) return\n\
        dropdown.items.slice().forEach(function (item) {\n\
          var index = res.indexOf(item.text)\n\
          if (!~index) {\n\
            dropdown.remove(item.text)\n\
          }\n\
          else {\n\
            res.splice(index, 1)\n\
          }\n\
        })\n\
        res.forEach(function (item) {\n\
          dropdown.add(item)\n\
        })\n\
        dropdown.filter(both(match(val), limit(dropdown._maxItems)))\n\
        dropdown.show()\n\
      }\n\
      fn(val, latest)\n\
    }\n\
  }\n\
\n\
  // replace value in input on select\n\
  dropdown.on('select', function (item) {\n\
    if (!item) return\n\
    if (input.value != item.text) {\n\
      input.focus()\n\
      input.value = lastValue = item.text\n\
    }\n\
  })\n\
\n\
  return dropdown\n\
}\n\
\n\
/**\n\
 * Match helper.\n\
 *\n\
 * Creates a filter function.\n\
 *\n\
 * @param {String} val\n\
 * @return {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function match (val) {\n\
  val = val.toLowerCase()\n\
  return function (item) {\n\
    return !val.length || !!~item.text.toString().toLowerCase().indexOf(val)\n\
  }\n\
}\n\
\n\
/**\n\
 * Limit helper.\n\
 *\n\
 * Creates a filter function.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function limit (n) {\n\
  var i = 0\n\
  return function (item) {\n\
    return i++ < n\n\
  }\n\
}\n\
\n\
/**\n\
 * Combines two filter functions.\n\
 *\n\
 * Creates a new filter function\n\
 * which evaluates when both encapsulated\n\
 * functions are truthy.\n\
 *\n\
 * @param {Function} a\n\
 * @param {Function} b\n\
 * @return {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function both (a, b) {\n\
  return function (item) {\n\
    return a(item) && b(item)\n\
  }\n\
}//@ sourceURL=stagas-autocomplete/index.js"
));
require.register("heavyk-format/index.js", Function("exports, require, module",
"//\n\
// format, printf-like string formatting for JavaScript\n\
// github.com/samsonjs/format\n\
//\n\
// Copyright 2010 - 2011 Sami Samhuri <sami@samhuri.net>\n\
// ISC license\n\
//\n\
\n\
exports.printf = function(/* ... */) {\n\
    console.log(exports.format.apply(this, arguments));\n\
};\n\
\n\
exports.format = function(format) {\n\
    var argIndex = 1 // skip initial format argument\n\
      , args = [].slice.call(arguments)\n\
      , i = 0\n\
      , n = format.length\n\
      , result = ''\n\
      , c\n\
      , escaped = false\n\
      , arg\n\
      , precision\n\
      , nextArg = function() { return args[argIndex++]; }\n\
      , slurpNumber = function() {\n\
              var digits = '';\n\
              while (format[i].match(/\\d/))\n\
                  digits += format[i++];\n\
              return digits.length > 0 ? parseInt(digits) : null;\n\
          }\n\
      ;\n\
    for (; i < n; ++i) {\n\
        c = format[i];\n\
        if (escaped) {\n\
            escaped = false;\n\
            precision = slurpNumber();\n\
            switch (c) {\n\
            case 'b': // number in binary\n\
                result += parseInt(nextArg(), 10).toString(2);\n\
                break;\n\
            case 'c': // character\n\
                arg = nextArg();\n\
                if (typeof arg === 'string' || arg instanceof String)\n\
                    result += arg;\n\
                else\n\
                    result += String.fromCharCode(parseInt(arg, 10));\n\
                break;\n\
            case 'd': // number in decimal\n\
                result += parseInt(nextArg(), 10);\n\
                break;\n\
            case 'f': // floating point number\n\
                result += parseFloat(nextArg()).toFixed(precision || 6);\n\
                break;\n\
            case 'o': // number in octal\n\
                result += '0' + parseInt(nextArg(), 10).toString(8);\n\
                break;\n\
            case 's': // string\n\
                result += nextArg();\n\
                break;\n\
            case 'x': // lowercase hexadecimal\n\
                result += '0x' + parseInt(nextArg(), 10).toString(16);\n\
                break;\n\
            case 'X': // uppercase hexadecimal\n\
                result += '0x' + parseInt(nextArg(), 10).toString(16).toUpperCase();\n\
                break;\n\
            default:\n\
                result += c;\n\
                break;\n\
            }\n\
        } else if (c === '%') {\n\
            escaped = true;\n\
        } else {\n\
            result += c;\n\
        }\n\
    }\n\
    return result;\n\
};\n\
\n\
exports.vsprintf = function(format, replacements) {\n\
    return exports.format.apply(this, [format].concat(replacements));\n\
};\n\
\n\
exports.sprintf = exports.format;\n\
//@ sourceURL=heavyk-format/index.js"
));
require.register("RedVentures-reduce/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Reduce `arr` with `fn`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} fn\n\
 * @param {Mixed} initial\n\
 *\n\
 * TODO: combatible error handling?\n\
 */\n\
\n\
module.exports = function(arr, fn, initial){  \n\
  var idx = 0;\n\
  var len = arr.length;\n\
  var curr = arguments.length == 3\n\
    ? initial\n\
    : arr[idx++];\n\
\n\
  while (idx < len) {\n\
    curr = fn.call(null, curr, arr[idx], ++idx, arr);\n\
  }\n\
  \n\
  return curr;\n\
};//@ sourceURL=RedVentures-reduce/index.js"
));
require.register("visionmedia-superagent/lib/client.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var reduce = require('reduce');\n\
\n\
/**\n\
 * Root reference for iframes.\n\
 */\n\
\n\
var root = 'undefined' == typeof window\n\
  ? this\n\
  : window;\n\
\n\
/**\n\
 * Noop.\n\
 */\n\
\n\
function noop(){};\n\
\n\
/**\n\
 * Check if `obj` is a host object,\n\
 * we don't want to serialize these :)\n\
 *\n\
 * TODO: future proof, move to compoent land\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isHost(obj) {\n\
  var str = {}.toString.call(obj);\n\
\n\
  switch (str) {\n\
    case '[object File]':\n\
    case '[object Blob]':\n\
    case '[object FormData]':\n\
      return true;\n\
    default:\n\
      return false;\n\
  }\n\
}\n\
\n\
/**\n\
 * Determine XHR.\n\
 */\n\
\n\
function getXHR() {\n\
  if (root.XMLHttpRequest\n\
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {\n\
    return new XMLHttpRequest;\n\
  } else {\n\
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}\n\
  }\n\
  return false;\n\
}\n\
\n\
/**\n\
 * Removes leading and trailing whitespace, added to support IE.\n\
 *\n\
 * @param {String} s\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
var trim = ''.trim\n\
  ? function(s) { return s.trim(); }\n\
  : function(s) { return s.replace(/(^\\s*|\\s*$)/g, ''); };\n\
\n\
/**\n\
 * Check if `obj` is an object.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isObject(obj) {\n\
  return obj === Object(obj);\n\
}\n\
\n\
/**\n\
 * Serialize the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function serialize(obj) {\n\
  if (!isObject(obj)) return obj;\n\
  var pairs = [];\n\
  for (var key in obj) {\n\
    pairs.push(encodeURIComponent(key)\n\
      + '=' + encodeURIComponent(obj[key]));\n\
  }\n\
  return pairs.join('&');\n\
}\n\
\n\
/**\n\
 * Expose serialization method.\n\
 */\n\
\n\
 request.serializeObject = serialize;\n\
\n\
 /**\n\
  * Parse the given x-www-form-urlencoded `str`.\n\
  *\n\
  * @param {String} str\n\
  * @return {Object}\n\
  * @api private\n\
  */\n\
\n\
function parseString(str) {\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  var parts;\n\
  var pair;\n\
\n\
  for (var i = 0, len = pairs.length; i < len; ++i) {\n\
    pair = pairs[i];\n\
    parts = pair.split('=');\n\
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Expose parser.\n\
 */\n\
\n\
request.parseString = parseString;\n\
\n\
/**\n\
 * Default MIME type map.\n\
 *\n\
 *     superagent.types.xml = 'application/xml';\n\
 *\n\
 */\n\
\n\
request.types = {\n\
  html: 'text/html',\n\
  json: 'application/json',\n\
  urlencoded: 'application/x-www-form-urlencoded',\n\
  'form': 'application/x-www-form-urlencoded',\n\
  'form-data': 'application/x-www-form-urlencoded'\n\
};\n\
\n\
/**\n\
 * Default serialization map.\n\
 *\n\
 *     superagent.serialize['application/xml'] = function(obj){\n\
 *       return 'generated xml here';\n\
 *     };\n\
 *\n\
 */\n\
\n\
 request.serialize = {\n\
   'application/x-www-form-urlencoded': serialize,\n\
   'application/json': JSON.stringify\n\
 };\n\
\n\
 /**\n\
  * Default parsers.\n\
  *\n\
  *     superagent.parse['application/xml'] = function(str){\n\
  *       return { object parsed from str };\n\
  *     };\n\
  *\n\
  */\n\
\n\
request.parse = {\n\
  'application/x-www-form-urlencoded': parseString,\n\
  'application/json': JSON.parse\n\
};\n\
\n\
/**\n\
 * Parse the given header `str` into\n\
 * an object containing the mapped fields.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parseHeader(str) {\n\
  var lines = str.split(/\\r?\\n\
/);\n\
  var fields = {};\n\
  var index;\n\
  var line;\n\
  var field;\n\
  var val;\n\
\n\
  lines.pop(); // trailing CRLF\n\
\n\
  for (var i = 0, len = lines.length; i < len; ++i) {\n\
    line = lines[i];\n\
    index = line.indexOf(':');\n\
    field = line.slice(0, index).toLowerCase();\n\
    val = trim(line.slice(index + 1));\n\
    fields[field] = val;\n\
  }\n\
\n\
  return fields;\n\
}\n\
\n\
/**\n\
 * Return the mime type for the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function type(str){\n\
  return str.split(/ *; */).shift();\n\
};\n\
\n\
/**\n\
 * Return header field parameters.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function params(str){\n\
  return reduce(str.split(/ *; */), function(obj, str){\n\
    var parts = str.split(/ *= */)\n\
      , key = parts.shift()\n\
      , val = parts.shift();\n\
\n\
    if (key && val) obj[key] = val;\n\
    return obj;\n\
  }, {});\n\
};\n\
\n\
/**\n\
 * Initialize a new `Response` with the given `xhr`.\n\
 *\n\
 *  - set flags (.ok, .error, etc)\n\
 *  - parse header\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Aliasing `superagent` as `request` is nice:\n\
 *\n\
 *      request = superagent;\n\
 *\n\
 *  We can use the promise-like API, or pass callbacks:\n\
 *\n\
 *      request.get('/').end(function(res){});\n\
 *      request.get('/', function(res){});\n\
 *\n\
 *  Sending data can be chained:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 *  Or passed to `.send()`:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' }, function(res){});\n\
 *\n\
 *  Or passed to `.post()`:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 * Or further reduced to a single call for simple cases:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' }, function(res){});\n\
 *\n\
 * @param {XMLHTTPRequest} xhr\n\
 * @param {Object} options\n\
 * @api private\n\
 */\n\
\n\
function Response(req, options) {\n\
  options = options || {};\n\
  this.req = req;\n\
  this.xhr = this.req.xhr;\n\
  this.text = this.xhr.responseText;\n\
  this.setStatusProperties(this.xhr.status);\n\
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());\n\
  // getAllResponseHeaders sometimes falsely returns \"\" for CORS requests, but\n\
  // getResponseHeader still works. so we get content-type even if getting\n\
  // other headers fails.\n\
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');\n\
  this.setHeaderProperties(this.header);\n\
  this.body = this.req.method != 'HEAD'\n\
    ? this.parseBody(this.text)\n\
    : null;\n\
}\n\
\n\
/**\n\
 * Get case-insensitive `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.get = function(field){\n\
  return this.header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set header related properties:\n\
 *\n\
 *   - `.type` the content type without params\n\
 *\n\
 * A response of \"Content-Type: text/plain; charset=utf-8\"\n\
 * will provide you with a `.type` of \"text/plain\".\n\
 *\n\
 * @param {Object} header\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setHeaderProperties = function(header){\n\
  // content-type\n\
  var ct = this.header['content-type'] || '';\n\
  this.type = type(ct);\n\
\n\
  // params\n\
  var obj = params(ct);\n\
  for (var key in obj) this[key] = obj[key];\n\
};\n\
\n\
/**\n\
 * Parse the given body `str`.\n\
 *\n\
 * Used for auto-parsing of bodies. Parsers\n\
 * are defined on the `superagent.parse` object.\n\
 *\n\
 * @param {String} str\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.parseBody = function(str){\n\
  var parse = request.parse[this.type];\n\
  return parse\n\
    ? parse(str)\n\
    : null;\n\
};\n\
\n\
/**\n\
 * Set flags such as `.ok` based on `status`.\n\
 *\n\
 * For example a 2xx response will give you a `.ok` of __true__\n\
 * whereas 5xx will be __false__ and `.error` will be __true__. The\n\
 * `.clientError` and `.serverError` are also available to be more\n\
 * specific, and `.statusType` is the class of error ranging from 1..5\n\
 * sometimes useful for mapping respond colors etc.\n\
 *\n\
 * \"sugar\" properties are also defined for common cases. Currently providing:\n\
 *\n\
 *   - .noContent\n\
 *   - .badRequest\n\
 *   - .unauthorized\n\
 *   - .notAcceptable\n\
 *   - .notFound\n\
 *\n\
 * @param {Number} status\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setStatusProperties = function(status){\n\
  var type = status / 100 | 0;\n\
\n\
  // status / class\n\
  this.status = status;\n\
  this.statusType = type;\n\
\n\
  // basics\n\
  this.info = 1 == type;\n\
  this.ok = 2 == type;\n\
  this.clientError = 4 == type;\n\
  this.serverError = 5 == type;\n\
  this.error = (4 == type || 5 == type)\n\
    ? this.toError()\n\
    : false;\n\
\n\
  // sugar\n\
  this.accepted = 202 == status;\n\
  this.noContent = 204 == status || 1223 == status;\n\
  this.badRequest = 400 == status;\n\
  this.unauthorized = 401 == status;\n\
  this.notAcceptable = 406 == status;\n\
  this.notFound = 404 == status;\n\
  this.forbidden = 403 == status;\n\
};\n\
\n\
/**\n\
 * Return an `Error` representative of this response.\n\
 *\n\
 * @return {Error}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.toError = function(){\n\
  var req = this.req;\n\
  var method = req.method;\n\
  var path = req.path;\n\
\n\
  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';\n\
  var err = new Error(msg);\n\
  err.status = this.status;\n\
  err.method = method;\n\
  err.path = path;\n\
\n\
  return err;\n\
};\n\
\n\
/**\n\
 * Expose `Response`.\n\
 */\n\
\n\
request.Response = Response;\n\
\n\
/**\n\
 * Initialize a new `Request` with the given `method` and `url`.\n\
 *\n\
 * @param {String} method\n\
 * @param {String} url\n\
 * @api public\n\
 */\n\
\n\
function Request(method, url) {\n\
  var self = this;\n\
  Emitter.call(this);\n\
  this._query = this._query || [];\n\
  this.method = method;\n\
  this.url = url;\n\
  this.header = {};\n\
  this._header = {};\n\
  this.on('end', function(){\n\
    var res = new Response(self);\n\
    if ('HEAD' == method) res.text = null;\n\
    self.callback(null, res);\n\
  });\n\
}\n\
\n\
/**\n\
 * Mixin `Emitter`.\n\
 */\n\
\n\
Emitter(Request.prototype);\n\
\n\
/**\n\
 * Set timeout to `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.timeout = function(ms){\n\
  this._timeout = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Clear previous timeout.\n\
 *\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.clearTimeout = function(){\n\
  this._timeout = 0;\n\
  clearTimeout(this._timer);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Abort the request, and clear potential timeout.\n\
 *\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.abort = function(){\n\
  if (this.aborted) return;\n\
  this.aborted = true;\n\
  this.xhr.abort();\n\
  this.clearTimeout();\n\
  this.emit('abort');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set header `field` to `val`, or multiple fields with one object.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      req.get('/')\n\
 *        .set('Accept', 'application/json')\n\
 *        .set('X-API-Key', 'foobar')\n\
 *        .end(callback);\n\
 *\n\
 *      req.get('/')\n\
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })\n\
 *        .end(callback);\n\
 *\n\
 * @param {String|Object} field\n\
 * @param {String} val\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.set = function(field, val){\n\
  if (isObject(field)) {\n\
    for (var key in field) {\n\
      this.set(key, field[key]);\n\
    }\n\
    return this;\n\
  }\n\
  this._header[field.toLowerCase()] = val;\n\
  this.header[field] = val;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get case-insensitive header `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.getHeader = function(field){\n\
  return this._header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set Content-Type to `type`, mapping values from `request.types`.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      superagent.types.xml = 'application/xml';\n\
 *\n\
 *      request.post('/')\n\
 *        .type('xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 *      request.post('/')\n\
 *        .type('application/xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 * @param {String} type\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.type = function(type){\n\
  this.set('Content-Type', request.types[type] || type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set Authorization field value with `user` and `pass`.\n\
 *\n\
 * @param {String} user\n\
 * @param {String} pass\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.auth = function(user, pass){\n\
  var str = btoa(user + ':' + pass);\n\
  this.set('Authorization', 'Basic ' + str);\n\
  return this;\n\
};\n\
\n\
/**\n\
* Add query-string `val`.\n\
*\n\
* Examples:\n\
*\n\
*   request.get('/shoes')\n\
*     .query('size=10')\n\
*     .query({ color: 'blue' })\n\
*\n\
* @param {Object|String} val\n\
* @return {Request} for chaining\n\
* @api public\n\
*/\n\
\n\
Request.prototype.query = function(val){\n\
  if ('string' != typeof val) val = serialize(val);\n\
  if (val) this._query.push(val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Send `data`, defaulting the `.type()` to \"json\" when\n\
 * an object is given.\n\
 *\n\
 * Examples:\n\
 *\n\
 *       // querystring\n\
 *       request.get('/search')\n\
 *         .end(callback)\n\
 *\n\
 *       // multiple data \"writes\"\n\
 *       request.get('/search')\n\
 *         .send({ search: 'query' })\n\
 *         .send({ range: '1..5' })\n\
 *         .send({ order: 'desc' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual json\n\
 *       request.post('/user')\n\
 *         .type('json')\n\
 *         .send('{\"name\":\"tj\"})\n\
 *         .end(callback)\n\
 *\n\
 *       // auto json\n\
 *       request.post('/user')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send('name=tj')\n\
 *         .end(callback)\n\
 *\n\
 *       // auto x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // defaults to x-www-form-urlencoded\n\
  *      request.post('/user')\n\
  *        .send('name=tobi')\n\
  *        .send('species=ferret')\n\
  *        .end(callback)\n\
 *\n\
 * @param {String|Object} data\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.send = function(data){\n\
  var obj = isObject(data);\n\
  var type = this.getHeader('Content-Type');\n\
\n\
  // merge\n\
  if (obj && isObject(this._data)) {\n\
    for (var key in data) {\n\
      this._data[key] = data[key];\n\
    }\n\
  } else if ('string' == typeof data) {\n\
    if (!type) this.type('form');\n\
    type = this.getHeader('Content-Type');\n\
    if ('application/x-www-form-urlencoded' == type) {\n\
      this._data = this._data\n\
        ? this._data + '&' + data\n\
        : data;\n\
    } else {\n\
      this._data = (this._data || '') + data;\n\
    }\n\
  } else {\n\
    this._data = data;\n\
  }\n\
\n\
  if (!obj) return this;\n\
  if (!type) this.type('json');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Invoke the callback with `err` and `res`\n\
 * and handle arity check.\n\
 *\n\
 * @param {Error} err\n\
 * @param {Response} res\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.callback = function(err, res){\n\
  var fn = this._callback;\n\
  if (2 == fn.length) return fn(err, res);\n\
  if (err) return this.emit('error', err);\n\
  fn(res);\n\
};\n\
\n\
/**\n\
 * Invoke callback with x-domain error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.crossDomainError = function(){\n\
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');\n\
  err.crossDomain = true;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Invoke callback with timeout error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.timeoutError = function(){\n\
  var timeout = this._timeout;\n\
  var err = new Error('timeout of ' + timeout + 'ms exceeded');\n\
  err.timeout = timeout;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Enable transmission of cookies with x-domain requests.\n\
 *\n\
 * Note that for this to work the origin must not be\n\
 * using \"Access-Control-Allow-Origin\" with a wildcard,\n\
 * and also must set \"Access-Control-Allow-Credentials\"\n\
 * to \"true\".\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.withCredentials = function(){\n\
  this._withCredentials = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Initiate request, invoking callback `fn(res)`\n\
 * with an instanceof `Response`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.end = function(fn){\n\
  var self = this;\n\
  var xhr = this.xhr = getXHR();\n\
  var query = this._query.join('&');\n\
  var timeout = this._timeout;\n\
  var data = this._data;\n\
\n\
  // store callback\n\
  this._callback = fn || noop;\n\
\n\
  // CORS\n\
  if (this._withCredentials) xhr.withCredentials = true;\n\
\n\
  // state change\n\
  xhr.onreadystatechange = function(){\n\
    if (4 != xhr.readyState) return;\n\
    if (0 == xhr.status) {\n\
      if (self.aborted) return self.timeoutError();\n\
      return self.crossDomainError();\n\
    }\n\
    self.emit('end');\n\
  };\n\
\n\
  // progress\n\
  if (xhr.upload) {\n\
    xhr.upload.onprogress = function(e){\n\
      e.percent = e.loaded / e.total * 100;\n\
      self.emit('progress', e);\n\
    };\n\
  }\n\
\n\
  // timeout\n\
  if (timeout && !this._timer) {\n\
    this._timer = setTimeout(function(){\n\
      self.abort();\n\
    }, timeout);\n\
  }\n\
\n\
  // querystring\n\
  if (query) {\n\
    query = request.serializeObject(query);\n\
    this.url += ~this.url.indexOf('?')\n\
      ? '&' + query\n\
      : '?' + query;\n\
  }\n\
\n\
  // initiate request\n\
  xhr.open(this.method, this.url, true);\n\
\n\
  // body\n\
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {\n\
    // serialize stuff\n\
    var serialize = request.serialize[this.getHeader('Content-Type')];\n\
    if (serialize) data = serialize(data);\n\
  }\n\
\n\
  // set header fields\n\
  for (var field in this.header) {\n\
    if (null == this.header[field]) continue;\n\
    xhr.setRequestHeader(field, this.header[field]);\n\
  }\n\
\n\
  // send stuff\n\
  xhr.send(data);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Expose `Request`.\n\
 */\n\
\n\
request.Request = Request;\n\
\n\
/**\n\
 * Issue a request:\n\
 *\n\
 * Examples:\n\
 *\n\
 *    request('GET', '/users').end(callback)\n\
 *    request('/users').end(callback)\n\
 *    request('/users', callback)\n\
 *\n\
 * @param {String} method\n\
 * @param {String|Function} url or callback\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
function request(method, url) {\n\
  // callback\n\
  if ('function' == typeof url) {\n\
    return new Request('GET', method).end(url);\n\
  }\n\
\n\
  // url first\n\
  if (1 == arguments.length) {\n\
    return new Request('GET', method);\n\
  }\n\
\n\
  return new Request(method, url);\n\
}\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.get = function(url, data, fn){\n\
  var req = request('GET', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.query(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * HEAD `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.head = function(url, data, fn){\n\
  var req = request('HEAD', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * DELETE `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.del = function(url, fn){\n\
  var req = request('DELETE', url);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PATCH `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.patch = function(url, data, fn){\n\
  var req = request('PATCH', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * POST `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.post = function(url, data, fn){\n\
  var req = request('POST', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PUT `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.put = function(url, data, fn){\n\
  var req = request('PUT', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * Expose `request`.\n\
 */\n\
\n\
module.exports = request;\n\
//@ sourceURL=visionmedia-superagent/lib/client.js"
));
require.register("component-model/lib/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var proto = require('./proto');\n\
var statics = require('./static');\n\
var Emitter = require('emitter');\n\
\n\
/**\n\
 * Expose `createModel`.\n\
 */\n\
\n\
module.exports = createModel;\n\
\n\
/**\n\
 * Create a new model constructor with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
function createModel(name) {\n\
  if ('string' != typeof name) throw new TypeError('model name required');\n\
\n\
  /**\n\
   * Initialize a new model with the given `attrs`.\n\
   *\n\
   * @param {Object} attrs\n\
   * @api public\n\
   */\n\
\n\
  function model(attrs) {\n\
    if (!(this instanceof model)) return new model(attrs);\n\
    attrs = attrs || {};\n\
    this._callbacks = {};\n\
    this.attrs = attrs;\n\
    this.dirty = attrs;\n\
    this.model.emit('construct', this, attrs);\n\
  }\n\
\n\
  // mixin emitter\n\
\n\
  Emitter(model);\n\
\n\
  // statics\n\
\n\
  model.modelName = name;\n\
  model._base = '/' + name.toLowerCase() + 's';\n\
  model.attrs = {};\n\
  model.validators = [];\n\
  model._headers = {};\n\
  for (var key in statics) model[key] = statics[key];\n\
\n\
  // prototype\n\
\n\
  model.prototype = {};\n\
  model.prototype.model = model;\n\
  for (var key in proto) model.prototype[key] = proto[key];\n\
\n\
  return model;\n\
}\n\
\n\
//@ sourceURL=component-model/lib/index.js"
));
require.register("component-model/lib/static.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Collection = require('collection');\n\
var request = require('superagent');\n\
var noop = function(){};\n\
\n\
/**\n\
 * Expose request for configuration\n\
 */\n\
\n\
exports.request = request;\n\
\n\
/**\n\
 * Construct a url to the given `path`.\n\
 *\n\
 * Example:\n\
 *\n\
 *    User.url('add')\n\
 *    // => \"/users/add\"\n\
 *\n\
 * @param {String} path\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.url = function(path){\n\
  var url = this._base;\n\
  if (0 == arguments.length) return url;\n\
  return url + '/' + path;\n\
};\n\
\n\
/**\n\
 * Set base path for urls.\n\
 * Note this is defaulted to '/' + modelName.toLowerCase() + 's'\n\
 *\n\
 * Example:\n\
 *\n\
 *   User.route('/api/u')\n\
 *\n\
 * @param {String} path \n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.route = function(path){\n\
  this._base = path;\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Add custom http headers to all requests.\n\
 *\n\
 * Example:\n\
 *\n\
 *   User.headers({\n\
 *    'X-CSRF-Token': 'some token',\n\
 *    'X-API-Token': 'api token \n\
 *   });\n\
 *\n\
 * @param {String|Object} header(s)\n\
 * @param {String} value\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.headers = function(headers){\n\
  for(var i in headers){\n\
    this._headers[i] = headers[i];\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add validation `fn()`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.validate = function(fn){\n\
  this.validators.push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Use the given plugin `fn()`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.use = function(fn){\n\
  fn(this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Define attr with the given `name` and `options`.\n\
 *\n\
 * @param {String} name\n\
 * @param {Object} options\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.attr = function(name, options){\n\
  this.attrs[name] = options || {};\n\
\n\
  // implied pk\n\
  if ('_id' == name || 'id' == name) {\n\
    this.attrs[name].primaryKey = true;\n\
    this.primaryKey = name;\n\
  }\n\
\n\
  // getter / setter method\n\
  this.prototype[name] = function(val){\n\
    if (0 == arguments.length) return this.attrs[name];\n\
    var prev = this.attrs[name];\n\
    this.dirty[name] = val;\n\
    this.attrs[name] = val;\n\
    this.model.emit('change', this, name, val, prev);\n\
    this.model.emit('change ' + name, this, val, prev);\n\
    this.emit('change', name, val, prev);\n\
    this.emit('change ' + name, val, prev);\n\
    return this;\n\
  };\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.destroyAll = function(fn){\n\
  fn = fn || noop;\n\
  var self = this;\n\
  var url = this.url('');\n\
  this.request\n\
    .del(url)\n\
    .set(this._headers)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), null, res);\n\
      fn(null, [], res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Get all and invoke `fn(err, array)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.all = function(fn){\n\
  var self = this;\n\
  var url = this.url('');\n\
  this.request\n\
    .get(url)\n\
    .set(this._headers)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), null, res);\n\
      var col = new Collection;\n\
      for (var i = 0, len = res.body.length; i < len; ++i) {\n\
        col.push(new self(res.body[i]));\n\
      }\n\
      fn(null, col, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Get `id` and invoke `fn(err, model)`.\n\
 *\n\
 * @param {Mixed} id\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(id, fn){\n\
  var self = this;\n\
  var url = this.url(id);\n\
  this.request\n\
    .get(url)\n\
    .set(this._headers)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), null, res);\n\
      var model = new self(res.body);\n\
      fn(null, model, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Response error helper.\n\
 *\n\
 * @param {Response} er\n\
 * @return {Error}\n\
 * @api private\n\
 */\n\
\n\
function error(res) {\n\
  return new Error('got ' + res.status + ' response');\n\
}\n\
//@ sourceURL=component-model/lib/static.js"
));
require.register("component-model/lib/proto.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var request = require('superagent');\n\
var each = require('each');\n\
var noop = function(){};\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(exports);\n\
\n\
/**\n\
 * Expose request for configuration\n\
 */\n\
exports.request = request;\n\
\n\
/**\n\
 * Register an error `msg` on `attr`.\n\
 *\n\
 * @param {String} attr\n\
 * @param {String} msg\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
exports.error = function(attr, msg){\n\
  this.errors.push({\n\
    attr: attr,\n\
    message: msg\n\
  });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if this model is new.\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isNew = function(){\n\
  var key = this.model.primaryKey;\n\
  return ! this.has(key);\n\
};\n\
\n\
/**\n\
 * Get / set the primary key.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
exports.primary = function(val){\n\
  var key = this.model.primaryKey;\n\
  if (0 == arguments.length) return this[key]();\n\
  return this[key](val);\n\
};\n\
\n\
/**\n\
 * Validate the model and return a boolean.\n\
 *\n\
 * Example:\n\
 *\n\
 *    user.isValid()\n\
 *    // => false\n\
 *\n\
 *    user.errors\n\
 *    // => [{ attr: ..., message: ... }]\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isValid = function(){\n\
  this.validate();\n\
  return 0 == this.errors.length;\n\
};\n\
\n\
/**\n\
 * Return `false` or an object\n\
 * containing the \"dirty\" attributes.\n\
 *\n\
 * Optionally check for a specific `attr`.\n\
 *\n\
 * @param {String} [attr]\n\
 * @return {Object|Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.changed = function(attr){\n\
  var dirty = this.dirty;\n\
  if (Object.keys(dirty).length) {\n\
    if (attr) return !! dirty[attr];\n\
    return dirty;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Perform validations.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
exports.validate = function(){\n\
  var self = this;\n\
  var fns = this.model.validators;\n\
  this.errors = [];\n\
  each(fns, function(fn){ fn(self) });\n\
};\n\
\n\
/**\n\
 * Destroy the model and mark it as `.destroyed`\n\
 * and invoke `fn(err)`.\n\
 *\n\
 * Events:\n\
 *\n\
 *  - `destroying` before deletion\n\
 *  - `destroy` on deletion\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.destroy = function(fn){\n\
  fn = fn || noop;\n\
  if (this.isNew()) return fn(new Error('not saved'));\n\
  var self = this;\n\
  var url = this.url();\n\
  this.model.emit('destroying', this);\n\
  this.emit('destroying');\n\
  this.request\n\
    .del(url)\n\
    .set(this.model._headers)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), res);\n\
      self.destroyed = true;\n\
      self.model.emit('destroy', self, res);\n\
      self.emit('destroy');\n\
      fn(null, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Save and invoke `fn(err)`.\n\
 *\n\
 * Events:\n\
 *\n\
 *  - `saving` pre-update or save, after validation\n\
 *  - `save` on updates and saves\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.save = function(fn){\n\
  if (!this.isNew()) return this.update(fn);\n\
  var self = this;\n\
  var url = this.model.url();\n\
  var key = this.model.primaryKey;\n\
  fn = fn || noop;\n\
  if (!this.isValid()) return fn(new Error('validation failed'));\n\
  this.model.emit('saving', this);\n\
  this.emit('saving');\n\
  this.request\n\
    .post(url)\n\
    .set(this.model._headers)\n\
    .send(self)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), res);\n\
      if (res.body) self.primary(res.body[key]);\n\
      self.dirty = {};\n\
      self.model.emit('save', self, res);\n\
      self.emit('save');\n\
      fn(null, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Update and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api private\n\
 */\n\
\n\
exports.update = function(fn){\n\
  var self = this;\n\
  var url = this.url();\n\
  fn = fn || noop;\n\
  if (!this.isValid()) return fn(new Error('validation failed'));\n\
  this.model.emit('saving', this);\n\
  this.emit('saving');\n\
  this.request\n\
    .put(url)\n\
    .set(this.model._headers)\n\
    .send(self)\n\
    .end(function(res){\n\
      if (res.error) return fn(error(res), res);\n\
      self.dirty = {};\n\
      self.model.emit('save', self, res);\n\
      self.emit('save');\n\
      fn(null, res);\n\
    });\n\
};\n\
\n\
/**\n\
 * Return a url for `path` relative to this model.\n\
 *\n\
 * Example:\n\
 *\n\
 *    var user = new User({ id: 5 });\n\
 *    user.url('edit');\n\
 *    // => \"/users/5/edit\"\n\
 *\n\
 * @param {String} path\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.url = function(path){\n\
  var model = this.model;\n\
  var url = model._base;\n\
  var id = this.primary();\n\
  if (0 == arguments.length) return url + '/' + id;\n\
  return url + '/' + id + '/' + path;\n\
};\n\
\n\
/**\n\
 * Set multiple `attrs`.\n\
 *\n\
 * @param {Object} attrs\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
exports.set = function(attrs){\n\
  for (var key in attrs) {\n\
    this[key](attrs[key]);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get `attr` value.\n\
 *\n\
 * @param {String} attr\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(attr){\n\
  return this.attrs[attr];\n\
};\n\
\n\
/**\n\
 * Check if `attr` is present (not `null` or `undefined`).\n\
 *\n\
 * @param {String} attr\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.has = function(attr){\n\
  return null != this.attrs[attr];\n\
};\n\
\n\
/**\n\
 * Return the JSON representation of the model.\n\
 *\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
exports.toJSON = function(){\n\
  return this.attrs;\n\
};\n\
\n\
/**\n\
 * Response error helper.\n\
 *\n\
 * @param {Response} er\n\
 * @return {Error}\n\
 * @api private\n\
 */\n\
\n\
function error(res) {\n\
  return new Error('got ' + res.status + ' response');\n\
}\n\
//@ sourceURL=component-model/lib/proto.js"
));
require.register("hkjels-story-model/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var model = require('model')\n\
  , Collection = require('collection');\n\
\n\
/**\n\
 * Story model.\n\
 */\n\
\n\
var Story = model('Story')\n\
  .attr('id', { type: 'number' })\n\
  .attr('title', { required: true, type: 'string' })\n\
  .attr('timeTotal', { type: 'number' })\n\
  .attr('timeClosed', { type: 'number' });\n\
\n\
/**\n\
 * Tasks will be stored as a collection\n\
 * in each story.\n\
 */\n\
\n\
Story.prototype.tasks = new Collection();\n\
\n\
/**\n\
 * Time left until story is completed.\n\
 */\n\
\n\
Story.prototype.timeOpen = function() {\n\
  return this.timeTotal() - this.timeClosed();\n\
};\n\
\n\
/**\n\
 * Add task to collection.\n\
 */\n\
\n\
Story.prototype.addTask = function(task) {\n\
  if (!'Task' instanceof task) {\n\
    throw new Error('You must supply a valid Task');\n\
  }\n\
  this.timeTotal(this.timeTotal + task.estimate());\n\
  if ('done' == task.state()) {\n\
    this.timeClosed(this.timeClosed() + task.estimate());\n\
  }\n\
  this.tasks.push(task);\n\
};\n\
\n\
/**\n\
 * Expose `Story`.\n\
 */\n\
\n\
module.exports = Story;\n\
\n\
//@ sourceURL=hkjels-story-model/index.js"
));
require.register("hkjels-fibonacci/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `fibonacci`.\n\
 */\n\
\n\
module.exports = fibonacci;\n\
\n\
/**\n\
 * Fibonacci sequence.\n\
 */\n\
\n\
function fibonacci(n) {\n\
  return Array.apply(0, Array(n)).reduce(function(x, y, z) {\n\
    return x.concat((z < 2) ? z : x[z-1] + x[z-2]);\n\
  }, []);\n\
}\n\
\n\
//@ sourceURL=hkjels-fibonacci/index.js"
));
require.register("KenanY-isInteger/index.js", Function("exports, require, module",
"/**\n\
 * Check if a Number is an integer\n\
 *\n\
 * @param {Number} x\n\
 * @return {Boolean} is integer\n\
 * @api public\n\
 */\n\
module.exports = function(x) {\n\
  return (x == Math.round(x));\n\
};//@ sourceURL=KenanY-isInteger/index.js"
));
require.register("hkjels-is-fibonacci/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var isInteger = require('isInteger')\n\
  , sequence = require('fibonacci')(20);\n\
\n\
/**\n\
 * Expose `isFibonacci`.\n\
 */\n\
\n\
module.exports = isFibonacci;\n\
\n\
/**\n\
 * Is Fibonacci\n\
 *\n\
 * Check if a number is within the Fibonacci sequence.\n\
 *\n\
 * @param {Integer} num\n\
 * @return {Boolean}\n\
 */\n\
\n\
function isFibonacci(num) {\n\
  return sequence.indexOf(num) != -1;\n\
}\n\
\n\
//@ sourceURL=hkjels-is-fibonacci/index.js"
));
require.register("enyo-md5/index.js", Function("exports, require, module",
"/*\n\
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message\n\
 * Digest Algorithm, as defined in RFC 1321.\n\
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009\n\
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet\n\
 * Distributed under the BSD License\n\
 * See http://pajhome.org.uk/crypt/md5 for more info.\n\
 */\n\
\n\
/*\n\
 * Configurable variables. You may need to tweak these to be compatible with\n\
 * the server-side, but the defaults work in most cases.\n\
 */\n\
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */\n\
var b64pad  = \"\";  /* base-64 pad character. \"=\" for strict RFC compliance   */\n\
\n\
/*\n\
 * These are the functions you'll usually want to call\n\
 * They take string arguments and return either hex or base-64 encoded strings\n\
 */\n\
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }\n\
function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }\n\
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }\n\
function hex_hmac_md5(k, d)\n\
  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }\n\
function b64_hmac_md5(k, d)\n\
  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }\n\
function any_hmac_md5(k, d, e)\n\
  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }\n\
\n\
\n\
module.exports = hex_md5;\n\
module.exports.hex = hex_md5;\n\
module.exports.b64 = b64_md5;\n\
module.exports.any = any_md5;\n\
\n\
module.exports.hmac = hex_hmac_md5;\n\
module.exports.hmac.hex = hex_hmac_md5;\n\
module.exports.hmac.b64 = b64_hmac_md5;\n\
module.exports.hmac.any = any_hmac_md5;\n\
\n\
\n\
/*\n\
 * Perform a simple self-test to see if the VM is working\n\
 */\n\
function md5_vm_test()\n\
{\n\
  return hex_md5(\"abc\").toLowerCase() == \"900150983cd24fb0d6963f7d28e17f72\";\n\
}\n\
\n\
/*\n\
 * Calculate the MD5 of a raw string\n\
 */\n\
function rstr_md5(s)\n\
{\n\
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));\n\
}\n\
\n\
/*\n\
 * Calculate the HMAC-MD5, of a key and some data (raw strings)\n\
 */\n\
function rstr_hmac_md5(key, data)\n\
{\n\
  var bkey = rstr2binl(key);\n\
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);\n\
\n\
  var ipad = Array(16), opad = Array(16);\n\
  for(var i = 0; i < 16; i++)\n\
  {\n\
    ipad[i] = bkey[i] ^ 0x36363636;\n\
    opad[i] = bkey[i] ^ 0x5C5C5C5C;\n\
  }\n\
\n\
  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);\n\
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));\n\
}\n\
\n\
/*\n\
 * Convert a raw string to a hex string\n\
 */\n\
function rstr2hex(input)\n\
{\n\
  try { hexcase } catch(e) { hexcase=0; }\n\
  var hex_tab = hexcase ? \"0123456789ABCDEF\" : \"0123456789abcdef\";\n\
  var output = \"\";\n\
  var x;\n\
  for(var i = 0; i < input.length; i++)\n\
  {\n\
    x = input.charCodeAt(i);\n\
    output += hex_tab.charAt((x >>> 4) & 0x0F)\n\
           +  hex_tab.charAt( x        & 0x0F);\n\
  }\n\
  return output;\n\
}\n\
\n\
/*\n\
 * Convert a raw string to a base-64 string\n\
 */\n\
function rstr2b64(input)\n\
{\n\
  try { b64pad } catch(e) { b64pad=''; }\n\
  var tab = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\";\n\
  var output = \"\";\n\
  var len = input.length;\n\
  for(var i = 0; i < len; i += 3)\n\
  {\n\
    var triplet = (input.charCodeAt(i) << 16)\n\
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)\n\
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);\n\
    for(var j = 0; j < 4; j++)\n\
    {\n\
      if(i * 8 + j * 6 > input.length * 8) output += b64pad;\n\
      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);\n\
    }\n\
  }\n\
  return output;\n\
}\n\
\n\
/*\n\
 * Convert a raw string to an arbitrary string encoding\n\
 */\n\
function rstr2any(input, encoding)\n\
{\n\
  var divisor = encoding.length;\n\
  var i, j, q, x, quotient;\n\
\n\
  /* Convert to an array of 16-bit big-endian values, forming the dividend */\n\
  var dividend = Array(Math.ceil(input.length / 2));\n\
  for(i = 0; i < dividend.length; i++)\n\
  {\n\
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);\n\
  }\n\
\n\
  /*\n\
   * Repeatedly perform a long division. The binary array forms the dividend,\n\
   * the length of the encoding is the divisor. Once computed, the quotient\n\
   * forms the dividend for the next step. All remainders are stored for later\n\
   * use.\n\
   */\n\
  var full_length = Math.ceil(input.length * 8 /\n\
                                    (Math.log(encoding.length) / Math.log(2)));\n\
  var remainders = Array(full_length);\n\
  for(j = 0; j < full_length; j++)\n\
  {\n\
    quotient = Array();\n\
    x = 0;\n\
    for(i = 0; i < dividend.length; i++)\n\
    {\n\
      x = (x << 16) + dividend[i];\n\
      q = Math.floor(x / divisor);\n\
      x -= q * divisor;\n\
      if(quotient.length > 0 || q > 0)\n\
        quotient[quotient.length] = q;\n\
    }\n\
    remainders[j] = x;\n\
    dividend = quotient;\n\
  }\n\
\n\
  /* Convert the remainders to the output string */\n\
  var output = \"\";\n\
  for(i = remainders.length - 1; i >= 0; i--)\n\
    output += encoding.charAt(remainders[i]);\n\
\n\
  return output;\n\
}\n\
\n\
/*\n\
 * Encode a string as utf-8.\n\
 * For efficiency, this assumes the input is valid utf-16.\n\
 */\n\
function str2rstr_utf8(input)\n\
{\n\
  var output = \"\";\n\
  var i = -1;\n\
  var x, y;\n\
\n\
  while(++i < input.length)\n\
  {\n\
    /* Decode utf-16 surrogate pairs */\n\
    x = input.charCodeAt(i);\n\
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;\n\
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)\n\
    {\n\
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);\n\
      i++;\n\
    }\n\
\n\
    /* Encode output as utf-8 */\n\
    if(x <= 0x7F)\n\
      output += String.fromCharCode(x);\n\
    else if(x <= 0x7FF)\n\
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),\n\
                                    0x80 | ( x         & 0x3F));\n\
    else if(x <= 0xFFFF)\n\
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),\n\
                                    0x80 | ((x >>> 6 ) & 0x3F),\n\
                                    0x80 | ( x         & 0x3F));\n\
    else if(x <= 0x1FFFFF)\n\
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),\n\
                                    0x80 | ((x >>> 12) & 0x3F),\n\
                                    0x80 | ((x >>> 6 ) & 0x3F),\n\
                                    0x80 | ( x         & 0x3F));\n\
  }\n\
  return output;\n\
}\n\
\n\
/*\n\
 * Encode a string as utf-16\n\
 */\n\
function str2rstr_utf16le(input)\n\
{\n\
  var output = \"\";\n\
  for(var i = 0; i < input.length; i++)\n\
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,\n\
                                  (input.charCodeAt(i) >>> 8) & 0xFF);\n\
  return output;\n\
}\n\
\n\
function str2rstr_utf16be(input)\n\
{\n\
  var output = \"\";\n\
  for(var i = 0; i < input.length; i++)\n\
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,\n\
                                   input.charCodeAt(i)        & 0xFF);\n\
  return output;\n\
}\n\
\n\
/*\n\
 * Convert a raw string to an array of little-endian words\n\
 * Characters >255 have their high-byte silently ignored.\n\
 */\n\
function rstr2binl(input)\n\
{\n\
  var output = Array(input.length >> 2);\n\
  for(var i = 0; i < output.length; i++)\n\
    output[i] = 0;\n\
  for(var i = 0; i < input.length * 8; i += 8)\n\
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);\n\
  return output;\n\
}\n\
\n\
/*\n\
 * Convert an array of little-endian words to a string\n\
 */\n\
function binl2rstr(input)\n\
{\n\
  var output = \"\";\n\
  for(var i = 0; i < input.length * 32; i += 8)\n\
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);\n\
  return output;\n\
}\n\
\n\
/*\n\
 * Calculate the MD5 of an array of little-endian words, and a bit length.\n\
 */\n\
function binl_md5(x, len)\n\
{\n\
  /* append padding */\n\
  x[len >> 5] |= 0x80 << ((len) % 32);\n\
  x[(((len + 64) >>> 9) << 4) + 14] = len;\n\
\n\
  var a =  1732584193;\n\
  var b = -271733879;\n\
  var c = -1732584194;\n\
  var d =  271733878;\n\
\n\
  for(var i = 0; i < x.length; i += 16)\n\
  {\n\
    var olda = a;\n\
    var oldb = b;\n\
    var oldc = c;\n\
    var oldd = d;\n\
\n\
    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);\n\
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);\n\
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);\n\
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);\n\
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);\n\
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);\n\
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);\n\
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);\n\
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);\n\
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);\n\
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);\n\
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);\n\
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);\n\
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);\n\
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);\n\
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);\n\
\n\
    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);\n\
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);\n\
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);\n\
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);\n\
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);\n\
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);\n\
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);\n\
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);\n\
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);\n\
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);\n\
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);\n\
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);\n\
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);\n\
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);\n\
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);\n\
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);\n\
\n\
    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);\n\
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);\n\
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);\n\
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);\n\
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);\n\
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);\n\
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);\n\
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);\n\
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);\n\
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);\n\
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);\n\
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);\n\
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);\n\
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);\n\
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);\n\
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);\n\
\n\
    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);\n\
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);\n\
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);\n\
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);\n\
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);\n\
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);\n\
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);\n\
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);\n\
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);\n\
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);\n\
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);\n\
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);\n\
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);\n\
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);\n\
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);\n\
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);\n\
\n\
    a = safe_add(a, olda);\n\
    b = safe_add(b, oldb);\n\
    c = safe_add(c, oldc);\n\
    d = safe_add(d, oldd);\n\
  }\n\
  return Array(a, b, c, d);\n\
}\n\
\n\
/*\n\
 * These functions implement the four basic operations the algorithm uses.\n\
 */\n\
function md5_cmn(q, a, b, x, s, t)\n\
{\n\
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);\n\
}\n\
function md5_ff(a, b, c, d, x, s, t)\n\
{\n\
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);\n\
}\n\
function md5_gg(a, b, c, d, x, s, t)\n\
{\n\
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);\n\
}\n\
function md5_hh(a, b, c, d, x, s, t)\n\
{\n\
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);\n\
}\n\
function md5_ii(a, b, c, d, x, s, t)\n\
{\n\
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);\n\
}\n\
\n\
/*\n\
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally\n\
 * to work around bugs in some JS interpreters.\n\
 */\n\
function safe_add(x, y)\n\
{\n\
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);\n\
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);\n\
  return (msw << 16) | (lsw & 0xFFFF);\n\
}\n\
\n\
/*\n\
 * Bitwise rotate a 32-bit number to the left.\n\
 */\n\
function bit_rol(num, cnt)\n\
{\n\
  return (num << cnt) | (num >>> (32 - cnt));\n\
}\n\
//@ sourceURL=enyo-md5/index.js"
));
require.register("visionmedia-debug/index.js", Function("exports, require, module",
"if ('undefined' == typeof window) {\n\
  module.exports = require('./lib/debug');\n\
} else {\n\
  module.exports = require('./debug');\n\
}\n\
//@ sourceURL=visionmedia-debug/index.js"
));
require.register("visionmedia-debug/debug.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
module.exports = debug;\n\
\n\
/**\n\
 * Create a debugger with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Type}\n\
 * @api public\n\
 */\n\
\n\
function debug(name) {\n\
  if (!debug.enabled(name)) return function(){};\n\
\n\
  return function(fmt){\n\
    fmt = coerce(fmt);\n\
\n\
    var curr = new Date;\n\
    var ms = curr - (debug[name] || curr);\n\
    debug[name] = curr;\n\
\n\
    fmt = name\n\
      + ' '\n\
      + fmt\n\
      + ' +' + debug.humanize(ms);\n\
\n\
    // This hackery is required for IE8\n\
    // where `console.log` doesn't have 'apply'\n\
    window.console\n\
      && console.log\n\
      && Function.prototype.apply.call(console.log, console, arguments);\n\
  }\n\
}\n\
\n\
/**\n\
 * The currently active debug mode names.\n\
 */\n\
\n\
debug.names = [];\n\
debug.skips = [];\n\
\n\
/**\n\
 * Enables a debug mode by name. This can include modes\n\
 * separated by a colon and wildcards.\n\
 *\n\
 * @param {String} name\n\
 * @api public\n\
 */\n\
\n\
debug.enable = function(name) {\n\
  try {\n\
    localStorage.debug = name;\n\
  } catch(e){}\n\
\n\
  var split = (name || '').split(/[\\s,]+/)\n\
    , len = split.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    name = split[i].replace('*', '.*?');\n\
    if (name[0] === '-') {\n\
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));\n\
    }\n\
    else {\n\
      debug.names.push(new RegExp('^' + name + '$'));\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Disable debug output.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
debug.disable = function(){\n\
  debug.enable('');\n\
};\n\
\n\
/**\n\
 * Humanize the given `ms`.\n\
 *\n\
 * @param {Number} m\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
debug.humanize = function(ms) {\n\
  var sec = 1000\n\
    , min = 60 * 1000\n\
    , hour = 60 * min;\n\
\n\
  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';\n\
  if (ms >= min) return (ms / min).toFixed(1) + 'm';\n\
  if (ms >= sec) return (ms / sec | 0) + 's';\n\
  return ms + 'ms';\n\
};\n\
\n\
/**\n\
 * Returns true if the given mode name is enabled, false otherwise.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
debug.enabled = function(name) {\n\
  for (var i = 0, len = debug.skips.length; i < len; i++) {\n\
    if (debug.skips[i].test(name)) {\n\
      return false;\n\
    }\n\
  }\n\
  for (var i = 0, len = debug.names.length; i < len; i++) {\n\
    if (debug.names[i].test(name)) {\n\
      return true;\n\
    }\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Coerce `val`.\n\
 */\n\
\n\
function coerce(val) {\n\
  if (val instanceof Error) return val.stack || val.message;\n\
  return val;\n\
}\n\
\n\
// persist\n\
\n\
try {\n\
  if (window.localStorage) debug.enable(localStorage.debug);\n\
} catch(e){}\n\
//@ sourceURL=visionmedia-debug/debug.js"
));
require.register("learnboost-jsonp/jsonp.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies\n\
 */\n\
\n\
var debug = require('debug')('jsonp')\n\
\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
module.exports = jsonp;\n\
\n\
/**\n\
 * Callback index.\n\
 */\n\
\n\
var count = 0;\n\
\n\
/**\n\
 * Noop function.\n\
 */\n\
\n\
function noop () {};\n\
\n\
/**\n\
 * JSONP handler\n\
 *\n\
 * Options:\n\
 *  - param {String} qs parameter (`callback`)\n\
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)\n\
 *\n\
 * @param {String} url\n\
 * @param {Object|Function} optional options / callback\n\
 * @param {Function} optional callback\n\
 */\n\
\n\
function jsonp (url, opts, fn) {\n\
  if ('function' == typeof opts) {\n\
    fn = opts;\n\
    opts = {};\n\
  }\n\
\n\
  var opts = opts || {}\n\
    , callback = opts.callback || 'callback'\n\
    , timeout = null != opts.timeout ? opts.timeout : 60000\n\
    , enc = encodeURIComponent\n\
    , script\n\
    , timer\n\
\n\
  // generate a hash of the url\n\
  var id = 0\n\
  for (var i = 0, l = url.length; i < l; i++) {\n\
    id += url.charCodeAt(i);\n\
  }\n\
\n\
  if (timeout) {\n\
    timer = setTimeout(function () {\n\
      cleanup();\n\
      fn && fn(new Error('Timeout'));\n\
    }, timeout);\n\
  }\n\
\n\
  function cleanup () {\n\
    document.head.removeChild(script);\n\
    window['__jp' + id] = noop;\n\
  }\n\
\n\
  window['__jp' + id] = function (data) {\n\
    debug('jsonp got', data);\n\
    if (timer) clearTimeout(timer);\n\
    cleanup();\n\
    fn && fn(null, data);\n\
  };\n\
\n\
  // add qs component\n\
  url += (~url.indexOf('?') ? '&' : '?') + 'callback=' + enc('__jp' + id + '');\n\
  url = url.replace('?&', '?');\n\
\n\
  debug('jsonp req \"%s\"', url);\n\
\n\
  // create script\n\
  script = document.createElement('script');\n\
  script.src = url;\n\
  document.head.appendChild(script);\n\
};\n\
//@ sourceURL=learnboost-jsonp/jsonp.js"
));
require.register("LearnBoost-gravatar-component/gravatar.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var md5 = require('md5');\n\
var jsonp = require('jsonp');\n\
var querystring = require('querystring');\n\
\n\
/**\n\
 * Creates an avatar url\n\
 *\n\
 * @param {String} email\n\
 * @param {Number} size (20)\n\
 * @return {String} gravatar url\n\
 * @api public\n\
 */\n\
\n\
exports.url = function (email, config) {\n\
  config = config || {};\n\
  var qs = querystring.stringify(config);\n\
  var qs = qs === '' ? '' : '?' + qs;\n\
  var url = 'https://secure.gravatar.com/avatar/' + md5(email) + qs;\n\
  return url;\n\
};\n\
\n\
/**\n\
 * Creates an avatar <img> element\n\
 *\n\
 * @param {String} email\n\
 * @param {Number} size (80)\n\
 * @return {Image} image dom\n\
 * @api public\n\
 */\n\
\n\
exports.img = function (email, config) {\n\
  config = config || {};\n\
  var size = config.s || config.size;\n\
  var url = exports.url(email, config);\n\
  var el = document.createElement('img');\n\
  el.setAttribute('src', url);\n\
  if (size) {\n\
    el.setAttribute('width', size);\n\
    el.setAttribute('height', size);\n\
  }\n\
  return el;\n\
};\n\
\n\
/**\n\
 * Looks up a profile.\n\
 *\n\
 * @param {String} email\n\
 * @param {Function} callback\n\
 * @api public\n\
 */\n\
\n\
exports.profile = function (email, fn) {\n\
  var url = 'https://secure.gravatar.com/' + md5(email);\n\
  jsonp(url + '.json', function (err, obj) {\n\
    if (err) return fn(err);\n\
    if (obj && obj.entry) {\n\
      fn(null, obj.entry[0]);\n\
    } else {\n\
      fn(new Error('Bad response'));\n\
    }\n\
  });\n\
};\n\
\n\
/**\n\
 * Shortcut to produce a username from an email.\n\
 *\n\
 * @param {String} email\n\
 * @param {Function} callback\n\
 * @api public\n\
 */\n\
\n\
exports.username = function (email, fn) {\n\
  exports.profile(email, function (err, prof) {\n\
    if (err) return fn(err);\n\
    if (prof && prof.preferredUsername) {\n\
      fn(null, prof.preferredUsername);\n\
    } else {\n\
      fn(null, '');\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=LearnBoost-gravatar-component/gravatar.js"
));
require.register("hkjels-task-model/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var model = require('model')\n\
  , gravatar = require('gravatar')\n\
  , isFibonacci = require('is-fibonacci');\n\
\n\
/**\n\
 * Check if string is a priority-string.\n\
 *\n\
 * @param {String} str\n\
 */\n\
\n\
function isPriority(str) {\n\
  var priorities = ['very-low', 'low', 'medium', 'high', 'very-high'];\n\
  return priorities.indexOf(str) != -1;\n\
}\n\
\n\
/**\n\
 * Check if string is a status-string.\n\
 *\n\
 * @param {String} str\n\
 */\n\
\n\
function isState(str) {\n\
  var states = ['todo', 'progress', 'done'];\n\
  return states.indexOf(str) != -1;\n\
}\n\
\n\
/**\n\
 * Task.\n\
 */\n\
\n\
var Task = model('Task')\n\
  .attr('id', { required: true, type: 'number' })\n\
  .attr('title', { required: true, type: 'string' })\n\
  .attr('assignee', { type: 'string' })\n\
  .attr('email', { type: 'string' })\n\
  .attr('priority', { type: 'string', validate: isPriority })\n\
  .attr('estimate', { type: 'number', min: 0, max: 13, validate: isFibonacci })\n\
  .attr('state', { type: 'string', validate: isState });\n\
\n\
/**\n\
 * Assignee photo.\n\
 */\n\
\n\
Task.prototype.photo = function() {\n\
  var url = gravatar.url(this.email() || \"\", {\n\
    \"d\": \"retro\",\n\
    \"r\": \"g\"\n\
  });\n\
  return url;\n\
};\n\
\n\
/**\n\
 * Expose `Task`.\n\
 */\n\
\n\
module.exports = Task;\n\
\n\
//@ sourceURL=hkjels-task-model/index.js"
));
require.register("component-format-parser/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Parse the given format `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str){\n\
\treturn str.split(/ *\\| */).map(function(call){\n\
\t\tvar parts = call.split(':');\n\
\t\tvar name = parts.shift();\n\
\t\tvar args = parseArgs(parts.join(':'));\n\
\n\
\t\treturn {\n\
\t\t\tname: name,\n\
\t\t\targs: args\n\
\t\t};\n\
\t});\n\
};\n\
\n\
/**\n\
 * Parse args `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parseArgs(str) {\n\
\tvar args = [];\n\
\tvar re = /\"([^\"]*)\"|'([^']*)'|([^ \\t,]+)/g;\n\
\tvar m;\n\
\t\n\
\twhile (m = re.exec(str)) {\n\
\t\targs.push(m[2] || m[1] || m[0]);\n\
\t}\n\
\t\n\
\treturn args;\n\
}\n\
//@ sourceURL=component-format-parser/index.js"
));
require.register("component-props/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Return immediate identifiers parsed from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str, prefix){\n\
  var p = unique(props(str));\n\
  if (prefix) return prefixed(str, p, prefix);\n\
  return p;\n\
};\n\
\n\
/**\n\
 * Return immediate identifiers in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function props(str) {\n\
  return str\n\
    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .match(/[a-zA-Z_]\\w*/g)\n\
    || [];\n\
}\n\
\n\
/**\n\
 * Return `str` with `props` prefixed with `prefix`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Array} props\n\
 * @param {String} prefix\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function prefixed(str, props, prefix) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  return str.replace(re, function(_){\n\
    if ('(' == _[_.length - 1]) return prefix + _;\n\
    if (!~props.indexOf(_)) return _;\n\
    return prefix + _;\n\
  });\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=component-props/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
  return exports;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("yields-merge-attrs/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Export `merge`\n\
 */\n\
\n\
module.exports = merge;\n\
\n\
/**\n\
 * Merge `b`'s attrs into `a`.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @api public\n\
 */\n\
\n\
function merge(a, b){\n\
  for (var i = 0; i < b.attributes.length; ++i) {\n\
    var attr = b.attributes[i];\n\
    if (ignore(a, attr)) continue;\n\
    a.setAttribute(attr.name, attr.value);\n\
  }\n\
}\n\
\n\
/**\n\
 * Check if `attr` should be ignored.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Attr} attr\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function ignore(a, attr){\n\
  return !attr.specified\n\
    || 'class' == attr.name\n\
    || 'id' == attr.name\n\
    || a.hasAttribute(attr.name);\n\
}\n\
//@ sourceURL=yields-merge-attrs/index.js"
));
require.register("yields-uniq/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies\n\
 */\n\
\n\
try {\n\
  var indexOf = require('indexof');\n\
} catch(e){\n\
  var indexOf = require('indexof-component');\n\
}\n\
\n\
/**\n\
 * Create duplicate free array\n\
 * from the provided `arr`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Array} select\n\
 * @return {Array}\n\
 */\n\
\n\
module.exports = function (arr, select) {\n\
  var len = arr.length, ret = [], v;\n\
  select = select ? (select instanceof Array ? select : [select]) : false;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    v = arr[i];\n\
    if (select && !~indexOf(select, v)) {\n\
      ret.push(v);\n\
    } else if (!~indexOf(ret, v)) {\n\
      ret.push(v);\n\
    }\n\
  }\n\
  return ret;\n\
};\n\
//@ sourceURL=yields-uniq/index.js"
));
require.register("yields-carry/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies\n\
 */\n\
\n\
var merge = require('merge-attrs')\n\
  , classes = require('classes')\n\
  , uniq = require('uniq');\n\
\n\
/**\n\
 * Export `carry`\n\
 */\n\
\n\
module.exports = carry;\n\
\n\
/**\n\
 * Carry over attrs and classes\n\
 * from `b` to `a`.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
function carry(a, b){\n\
  if (!a) return b.cloneNode();\n\
  carry.attrs(a, b);\n\
  carry.classes(a, b);\n\
  return a;\n\
}\n\
\n\
/**\n\
 * Carry attributes.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @return {Element} a\n\
 * @api public\n\
 */\n\
\n\
carry.attrs = function(a, b){\n\
  merge(a, b);\n\
  return a;\n\
};\n\
\n\
/**\n\
 * Carry over classes.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @return {Element} a\n\
 * @api public\n\
 */\n\
\n\
carry.classes = function(a, b){\n\
  if (a.className == b.className) return a;\n\
  var blist = classes(b).array();\n\
  var alist = classes(a).array();\n\
  var list = alist.concat(blist);\n\
  a.className = uniq(list).join(' ');\n\
  return a;\n\
};\n\
//@ sourceURL=yields-carry/index.js"
));
require.register("component-reactive/lib/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var adapter = require('./adapter');\n\
var AttrBinding = require('./attr-binding');\n\
var TextBinding = require('./text-binding');\n\
var debug = require('debug')('reactive');\n\
var bindings = require('./bindings');\n\
var Binding = require('./binding');\n\
var utils = require('./utils');\n\
var query = require('query');\n\
\n\
/**\n\
 * Expose `Reactive`.\n\
 */\n\
\n\
exports = module.exports = Reactive;\n\
\n\
/**\n\
 * Bindings.\n\
 */\n\
\n\
exports.bindings = {};\n\
\n\
/**\n\
 * Define subscription function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.subscribe = function(fn){\n\
  adapter.subscribe = fn;\n\
};\n\
\n\
/**\n\
 * Define unsubscribe function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.unsubscribe = function(fn){\n\
  adapter.unsubscribe = fn;\n\
};\n\
\n\
/**\n\
 * Define a get function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(fn) {\n\
  adapter.get = fn;\n\
};\n\
\n\
/**\n\
 * Define a set function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.set = function(fn) {\n\
  adapter.set = fn;\n\
};\n\
\n\
/**\n\
 * Expose adapter\n\
 */\n\
\n\
exports.adapter = adapter;\n\
\n\
/**\n\
 * Define binding `name` with callback `fn(el, val)`.\n\
 *\n\
 * @param {String} name or object\n\
 * @param {String|Object} name\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(name, fn){\n\
  if ('object' == typeof name) {\n\
    for (var key in name) {\n\
      exports.bind(key, name[key]);\n\
    }\n\
    return;\n\
  }\n\
\n\
  exports.bindings[name] = fn;\n\
};\n\
\n\
/**\n\
 * Middleware\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.use = function(fn) {\n\
  fn(exports);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Initialize a reactive template for `el` and `obj`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Element} obj\n\
 * @param {Object} options\n\
 * @api public\n\
 */\n\
\n\
function Reactive(el, model, view) {\n\
  if (!(this instanceof Reactive)) return new Reactive(el, model, view);\n\
  this.adapter = exports.adapter;\n\
  this.el = el;\n\
  this.model = model;\n\
  this.els = [];\n\
  this.view = view || {};\n\
  this.bindAll();\n\
  this.bindInterpolation(this.el, []);\n\
}\n\
\n\
/**\n\
 * Subscribe to changes on `prop`.\n\
 *\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.sub = function(prop, fn){\n\
  this.adapter.subscribe(this.model, prop, fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unsubscribe to changes from `prop`.\n\
 *\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.unsub = function(prop, fn){\n\
  this.adapter.unsubscribe(this.model, prop, fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get a `prop`\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.get = function(prop) {\n\
  return this.adapter.get(this.model, prop);\n\
};\n\
\n\
/**\n\
 * Set a `prop`\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.set = function(prop, val) {\n\
  this.adapter.set(this.model, prop, val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Traverse and bind all interpolation within attributes and text.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.bindInterpolation = function(el, els){\n\
\n\
  // element\n\
  if (el.nodeType == 1) {\n\
    for (var i = 0; i < el.attributes.length; i++) {\n\
      var attr = el.attributes[i];\n\
      if (utils.hasInterpolation(attr.value)) {\n\
        new AttrBinding(this, el, attr);\n\
      }\n\
    }\n\
  }\n\
\n\
  // text node\n\
  if (el.nodeType == 3) {\n\
    if (utils.hasInterpolation(el.data)) {\n\
      debug('bind text \"%s\"', el.data);\n\
      new TextBinding(this, el);\n\
    }\n\
  }\n\
\n\
  // walk nodes\n\
  for (var i = 0; i < el.childNodes.length; i++) {\n\
    var node = el.childNodes[i];\n\
    this.bindInterpolation(node, els);\n\
  }\n\
};\n\
\n\
/**\n\
 * Apply all bindings.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.bindAll = function() {\n\
  for (var name in exports.bindings) {\n\
    this.bind(name, exports.bindings[name]);\n\
  }\n\
};\n\
\n\
/**\n\
 * Bind `name` to `fn`.\n\
 *\n\
 * @param {String|Object} name or object\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Reactive.prototype.bind = function(name, fn) {\n\
  if ('object' == typeof name) {\n\
    for (var key in name) {\n\
      this.bind(key, name[key]);\n\
    }\n\
    return;\n\
  }\n\
\n\
  var els = query.all('[' + name + ']', this.el);\n\
  if (this.el.hasAttribute && this.el.hasAttribute(name)) {\n\
    els = [].slice.call(els);\n\
    els.unshift(this.el);\n\
  }\n\
  if (!els.length) return;\n\
\n\
  debug('bind [%s] (%d elements)', name, els.length);\n\
  for (var i = 0; i < els.length; i++) {\n\
    var binding = new Binding(name, this, els[i], fn);\n\
    binding.bind();\n\
  }\n\
};\n\
\n\
/**\n\
 * Use middleware\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Reactive.prototype.use = function(fn) {\n\
  fn(this);\n\
  return this;\n\
};\n\
\n\
// bundled bindings\n\
\n\
exports.use(bindings);\n\
//@ sourceURL=component-reactive/lib/index.js"
));
require.register("component-reactive/lib/utils.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:utils');\n\
var props = require('props');\n\
var adapter = require('./adapter');\n\
\n\
/**\n\
 * Function cache.\n\
 */\n\
\n\
var cache = {};\n\
\n\
/**\n\
 * Return interpolation property names in `str`,\n\
 * for example \"{foo} and {bar}\" would return\n\
 * ['foo', 'bar'].\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
exports.interpolationProps = function(str) {\n\
  var m;\n\
  var arr = [];\n\
  var re = /\\{([^}]+)\\}/g;\n\
\n\
  while (m = re.exec(str)) {\n\
    var expr = m[1];\n\
    arr = arr.concat(props(expr));\n\
  }\n\
\n\
  return unique(arr);\n\
};\n\
\n\
/**\n\
 * Interpolate `str` with the given `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.interpolate = function(str, fn){\n\
  return str.replace(/\\{([^}]+)\\}/g, function(_, expr){\n\
    var cb = cache[expr];\n\
    if (!cb) cb = cache[expr] = compile(expr);\n\
    var val = fn(expr.trim(), cb);\n\
    return val == null ? '' : val;\n\
  });\n\
};\n\
\n\
/**\n\
 * Check if `str` has interpolation.\n\
 *\n\
 * @param {String} str\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
exports.hasInterpolation = function(str) {\n\
  return ~str.indexOf('{');\n\
};\n\
\n\
/**\n\
 * Remove computed properties notation from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.clean = function(str) {\n\
  return str.split('<')[0].trim();\n\
};\n\
\n\
/**\n\
 * Call `prop` on `model` or `view`.\n\
 *\n\
 * @param {Object} model\n\
 * @param {Object} view\n\
 * @param {String} prop\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
exports.call = function(model, view, prop){\n\
  // view method\n\
  if ('function' == typeof view[prop]) {\n\
    return view[prop]();\n\
  }\n\
\n\
  // view value\n\
  if (view.hasOwnProperty(prop)) {\n\
    return view[prop];\n\
  }\n\
\n\
  // get property from model\n\
  return adapter.get(model, prop);\n\
};\n\
\n\
/**\n\
 * Compile `expr` to a `Function`.\n\
 *\n\
 * @param {String} expr\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function compile(expr) {\n\
  // TODO: use props() callback instead\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  var p = props(expr);\n\
\n\
  var body = expr.replace(re, function(_) {\n\
    if ('(' == _[_.length - 1]) return access(_);\n\
    if (!~p.indexOf(_)) return _;\n\
    return call(_);\n\
  });\n\
\n\
  debug('compile `%s`', body);\n\
  return new Function('model', 'view', 'call', 'return ' + body);\n\
}\n\
\n\
/**\n\
 * Access a method `prop` with dot notation.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function access(prop) {\n\
  prop = prop.replace('(', '');\n\
  return '(view.' + prop + ' '\n\
    + '? view '\n\
    + ': model).' + prop + '(';\n\
}\n\
\n\
/**\n\
 * Call `prop` on view, model, or access the model's property.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function call(prop) {\n\
  return 'call(model, view, \"' + prop + '\")';\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=component-reactive/lib/utils.js"
));
require.register("component-reactive/lib/text-binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:text-binding');\n\
var utils = require('./utils');\n\
\n\
/**\n\
 * Expose `TextBinding`.\n\
 */\n\
\n\
module.exports = TextBinding;\n\
\n\
/**\n\
 * Initialize a new text binding.\n\
 *\n\
 * @param {Reactive} view\n\
 * @param {Element} node\n\
 * @param {Attribute} attr\n\
 * @api private\n\
 */\n\
\n\
function TextBinding(reactive, node) {\n\
  this.reactive = reactive;\n\
  this.text = node.data;\n\
  this.node = node;\n\
  this.props = utils.interpolationProps(this.text);\n\
  this.subscribe();\n\
  this.render();\n\
}\n\
\n\
/**\n\
 * Subscribe to changes.\n\
 */\n\
\n\
TextBinding.prototype.subscribe = function(){\n\
  var self = this;\n\
  var reactive = this.reactive;\n\
  this.props.forEach(function(prop){\n\
    reactive.sub(prop, function(){\n\
      self.render();\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Render text.\n\
 */\n\
\n\
TextBinding.prototype.render = function(){\n\
  var node = this.node;\n\
  var text = this.text;\n\
  var reactive = this.reactive;\n\
  var model = reactive.model;\n\
\n\
  // TODO: delegate most of this to `Reactive`\n\
  debug('render \"%s\"', text);\n\
  node.data = utils.interpolate(text, function(prop, fn){\n\
    if (fn) {\n\
      return fn(model, reactive.view, utils.call);\n\
    } else {\n\
      return reactive.get(model, prop);\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=component-reactive/lib/text-binding.js"
));
require.register("component-reactive/lib/attr-binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:attr-binding');\n\
var utils = require('./utils');\n\
\n\
/**\n\
 * Expose `AttrBinding`.\n\
 */\n\
\n\
module.exports = AttrBinding;\n\
\n\
/**\n\
 * Initialize a new attribute binding.\n\
 *\n\
 * @param {Reactive} view\n\
 * @param {Element} node\n\
 * @param {Attribute} attr\n\
 * @api private\n\
 */\n\
\n\
function AttrBinding(reactive, node, attr) {\n\
  var self = this;\n\
  this.reactive = reactive;\n\
  this.node = node;\n\
  this.attr = attr;\n\
  this.text = attr.value;\n\
  this.props = utils.interpolationProps(this.text);\n\
  this.subscribe();\n\
  this.render();\n\
}\n\
\n\
/**\n\
 * Subscribe to changes.\n\
 */\n\
\n\
AttrBinding.prototype.subscribe = function(){\n\
  var self = this;\n\
  var reactive = this.reactive;\n\
  this.props.forEach(function(prop){\n\
    reactive.sub(prop, function(){\n\
      self.render();\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Render the value.\n\
 */\n\
\n\
AttrBinding.prototype.render = function(){\n\
  var attr = this.attr;\n\
  var text = this.text;\n\
  var reactive = this.reactive;\n\
  var model = reactive.model;\n\
\n\
  // TODO: delegate most of this to `Reactive`\n\
  debug('render %s \"%s\"', attr.name, text);\n\
  attr.value = utils.interpolate(text, function(prop, fn){\n\
    if (fn) {\n\
      return fn(model, reactive.view, utils.call);\n\
    } else {\n\
      return reactive.get(model, prop);\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=component-reactive/lib/attr-binding.js"
));
require.register("component-reactive/lib/binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var parse = require('format-parser');\n\
\n\
/**\n\
 * Expose `Binding`.\n\
 */\n\
\n\
module.exports = Binding;\n\
\n\
/**\n\
 * Initialize a binding.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function Binding(name, reactive, el, fn) {\n\
  this.name = name;\n\
  this.reactive = reactive;\n\
  this.model = reactive.model;\n\
  this.view = reactive.view;\n\
  this.el = el;\n\
  this.fn = fn;\n\
}\n\
\n\
/**\n\
 * Apply the binding.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Binding.prototype.bind = function() {\n\
  var val = this.el.getAttribute(this.name);\n\
  this.fn(this.el, val, this.model);\n\
};\n\
\n\
/**\n\
 * Perform interpolation on `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.interpolate = function(name) {\n\
  var self = this;\n\
  name = clean(name);\n\
\n\
  if (~name.indexOf('{')) {\n\
    return name.replace(/{([^}]+)}/g, function(_, name){\n\
      return self.value(name);\n\
    });\n\
  }\n\
\n\
  return this.formatted(name);\n\
};\n\
\n\
/**\n\
 * Return value for property `name`.\n\
 *\n\
 *  - check if the \"view\" has a `name` method\n\
 *  - check if the \"model\" has a `name` method\n\
 *  - check if the \"model\" has a `name` property\n\
 *\n\
 * @param {String} name\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.value = function(name) {\n\
  var view = this.view;\n\
  name = clean(name);\n\
\n\
  // view method\n\
  if ('function' == typeof view[name]) {\n\
    return view[name]();\n\
  }\n\
\n\
  // view value\n\
  if (view.hasOwnProperty(name)) {\n\
    return view[name];\n\
  }\n\
\n\
  return this.reactive.get(name);\n\
};\n\
\n\
/**\n\
 * Return formatted property.\n\
 *\n\
 * @param {String} fmt\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.formatted = function(fmt) {\n\
  var calls = parse(clean(fmt));\n\
  var name = calls[0].name;\n\
  var val = this.value(name);\n\
\n\
  for (var i = 1; i < calls.length; ++i) {\n\
    var call = calls[i];\n\
    call.args.unshift(val);\n\
    var fn = this.view[call.name];\n\
    val = fn.apply(this.view, call.args);\n\
  }\n\
\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Invoke `fn` on changes.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.change = function(fn) {\n\
  fn.call(this);\n\
\n\
  var self = this;\n\
  var reactive = this.reactive;\n\
  var val = this.el.getAttribute(this.name);\n\
\n\
  // computed props\n\
  var parts = val.split('<');\n\
  val = parts[0];\n\
  var computed = parts[1];\n\
  if (computed) computed = computed.trim().split(/\\s+/);\n\
\n\
  // interpolation\n\
  if (hasInterpolation(val)) {\n\
    var props = interpolationProps(val);\n\
    props.forEach(function(prop){\n\
      reactive.sub(prop, fn.bind(self));\n\
    });\n\
    return;\n\
  }\n\
\n\
  // formatting\n\
  var calls = parse(val);\n\
  var prop = calls[0].name;\n\
\n\
  // computed props\n\
  if (computed) {\n\
    computed.forEach(function(prop){\n\
      reactive.sub(prop, fn.bind(self));\n\
    });\n\
    return;\n\
  }\n\
\n\
  // bind to prop\n\
  reactive.sub(prop, fn.bind(this));\n\
};\n\
\n\
/**\n\
 * Return interpolation property names in `str`,\n\
 * for example \"{foo} and {bar}\" would return\n\
 * ['foo', 'bar'].\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function interpolationProps(str) {\n\
  var m;\n\
  var arr = [];\n\
  var re = /\\{([^}]+)\\}/g;\n\
  while (m = re.exec(str)) {\n\
    arr.push(m[1]);\n\
  }\n\
  return arr;\n\
}\n\
\n\
/**\n\
 * Check if `str` has interpolation.\n\
 *\n\
 * @param {String} str\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function hasInterpolation(str) {\n\
  return ~str.indexOf('{');\n\
}\n\
\n\
/**\n\
 * Remove computed properties notation from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function clean(str) {\n\
  return str.split('<')[0].trim();\n\
}\n\
//@ sourceURL=component-reactive/lib/binding.js"
));
require.register("component-reactive/lib/bindings.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var carry = require('carry');\n\
var classes = require('classes');\n\
var event = require('event');\n\
\n\
/**\n\
 * Attributes supported.\n\
 */\n\
\n\
var attrs = [\n\
  'id',\n\
  'src',\n\
  'rel',\n\
  'cols',\n\
  'rows',\n\
  'name',\n\
  'href',\n\
  'title',\n\
  'class',\n\
  'style',\n\
  'width',\n\
  'value',\n\
  'height',\n\
  'tabindex',\n\
  'placeholder'\n\
];\n\
\n\
/**\n\
 * Events supported.\n\
 */\n\
\n\
var events = [\n\
  'change',\n\
  'click',\n\
  'dblclick',\n\
  'mousedown',\n\
  'mouseup',\n\
  'blur',\n\
  'focus',\n\
  'input',\n\
  'submit',\n\
  'keydown',\n\
  'keypress',\n\
  'keyup'\n\
];\n\
\n\
/**\n\
 * Apply bindings.\n\
 */\n\
\n\
module.exports = function(reactive){\n\
\n\
  /**\n\
   * Generate attribute bindings.\n\
   */\n\
\n\
  attrs.forEach(function(attr){\n\
    reactive.bind('data-' + attr, function(el, name, obj){\n\
      this.change(function(){\n\
        el.setAttribute(attr, this.interpolate(name));\n\
      });\n\
    });\n\
  });\n\
\n\
/**\n\
 * Append child element.\n\
 */\n\
\n\
  reactive.bind('data-append', function(el, name){\n\
    var other = this.value(name);\n\
    el.appendChild(other);\n\
  });\n\
\n\
/**\n\
 * Replace element, carrying over its attributes.\n\
 */\n\
\n\
  reactive.bind('data-replace', function(el, name){\n\
    var other = carry(this.value(name), el);\n\
    el.parentNode.replaceChild(other, el);\n\
  });\n\
\n\
  /**\n\
   * Show binding.\n\
   */\n\
\n\
  reactive.bind('data-visible', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        classes(el).add('visible').remove('hidden');\n\
      } else {\n\
        classes(el).remove('visible').add('hidden');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Hide binding.\n\
   */\n\
\n\
  reactive.bind('data-hidden', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        classes(el).remove('visible').add('hidden');\n\
      } else {\n\
        classes(el).add('visible').remove('hidden');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Checked binding.\n\
   */\n\
\n\
  reactive.bind('data-checked', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        el.setAttribute('checked', 'checked');\n\
      } else {\n\
        el.removeAttribute('checked');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Text binding.\n\
   */\n\
\n\
  reactive.bind('data-text', function(el, name){\n\
    this.change(function(){\n\
      el.textContent = this.interpolate(name);\n\
    });\n\
  });\n\
\n\
  /**\n\
   * HTML binding.\n\
   */\n\
\n\
  reactive.bind('data-html', function(el, name){\n\
    this.change(function(){\n\
      el.innerHTML = this.formatted(name);\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Generate event bindings.\n\
   */\n\
\n\
  events.forEach(function(name){\n\
    reactive.bind('on-' + name, function(el, method){\n\
      var view = this.reactive.view;\n\
      event.bind(el, name, function(e){\n\
        var fn = view[method];\n\
        if (!fn) throw new Error('method .' + method + '() missing');\n\
        view[method](e);\n\
      });\n\
    });\n\
  });\n\
};\n\
//@ sourceURL=component-reactive/lib/bindings.js"
));
require.register("component-reactive/lib/adapter.js", Function("exports, require, module",
"/**\n\
 * Default subscription method.\n\
 * Subscribe to changes on the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 */\n\
\n\
exports.subscribe = function(obj, prop, fn) {\n\
  if (!obj.on) return;\n\
  obj.on('change ' + prop, fn);\n\
};\n\
\n\
/**\n\
 * Default unsubscription method.\n\
 * Unsubscribe from changes on the model.\n\
 */\n\
\n\
exports.unsubscribe = function(obj, prop, fn) {\n\
  if (!obj.off) return;\n\
  obj.off('change ' + prop, fn);\n\
};\n\
\n\
/**\n\
 * Default setter method.\n\
 * Set a property on the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 */\n\
\n\
exports.set = function(obj, prop, val) {\n\
  if ('function' == typeof obj[prop]) {\n\
    obj[prop](val);\n\
  }\n\
  else if ('function' == typeof obj.set) {\n\
    obj.set(prop, val);\n\
  }\n\
  else {\n\
    obj[prop] = val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Default getter method.\n\
 * Get a property from the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @return {Mixed}\n\
 */\n\
\n\
exports.get = function(obj, prop) {\n\
  if ('function' == typeof obj[prop]) {\n\
    return obj[prop]();\n\
  }\n\
  else if ('function' == typeof obj.get) {\n\
    return obj.get(prop);\n\
  }\n\
  else {\n\
    return obj[prop];\n\
  }\n\
};\n\
//@ sourceURL=component-reactive/lib/adapter.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matches\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("discore-closest/index.js", Function("exports, require, module",
"var matches = require('matches-selector')\n\
\n\
module.exports = function (element, selector, checkYoSelf, root) {\n\
  element = checkYoSelf ? {parentNode: element} : element\n\
\n\
  root = root || document\n\
\n\
  // Make sure `element !== document` and `element != null`\n\
  // otherwise we get an illegal invocation\n\
  while ((element = element.parentNode) && element !== document) {\n\
    if (matches(element, selector))\n\
      return element\n\
    // After `matches` on the edge case that\n\
    // the selector matches the root\n\
    // (when the root is not the document)\n\
    if (element === root)\n\
      return  \n\
  }\n\
}//@ sourceURL=discore-closest/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var closest = require('closest')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    var target = e.target || e.srcElement;\n\
    e.delegateTarget = closest(target, selector, true, el);\n\
    if (e.delegateTarget) fn.call(el, e);\n\
  }, capture);\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("component-object/index.js", Function("exports, require, module",
"\n\
/**\n\
 * HOP ref.\n\
 */\n\
\n\
var has = Object.prototype.hasOwnProperty;\n\
\n\
/**\n\
 * Return own keys in `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
exports.keys = Object.keys || function(obj){\n\
  var keys = [];\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      keys.push(key);\n\
    }\n\
  }\n\
  return keys;\n\
};\n\
\n\
/**\n\
 * Return own values in `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
exports.values = function(obj){\n\
  var vals = [];\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      vals.push(obj[key]);\n\
    }\n\
  }\n\
  return vals;\n\
};\n\
\n\
/**\n\
 * Merge `b` into `a`.\n\
 *\n\
 * @param {Object} a\n\
 * @param {Object} b\n\
 * @return {Object} a\n\
 * @api public\n\
 */\n\
\n\
exports.merge = function(a, b){\n\
  for (var key in b) {\n\
    if (has.call(b, key)) {\n\
      a[key] = b[key];\n\
    }\n\
  }\n\
  return a;\n\
};\n\
\n\
/**\n\
 * Return length of `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
exports.length = function(obj){\n\
  return exports.keys(obj).length;\n\
};\n\
\n\
/**\n\
 * Check if `obj` is empty.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isEmpty = function(obj){\n\
  return 0 == exports.length(obj);\n\
};//@ sourceURL=component-object/index.js"
));
require.register("component-view/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var reactive = require('reactive')\n\
  , delegate = require('delegate')\n\
  , object = require('object')\n\
  , keys = object.keys;\n\
\n\
/**\n\
 * Expose `View`.\n\
 */\n\
\n\
module.exports = View;\n\
\n\
/**\n\
 * Initialize a view with the given `obj` / `el`.\n\
 *\n\
 *    function ItemView(item) {\n\
 *      View.call(this, item, tmpl.cloneNode(true));\n\
 *    }\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Element} el\n\
 * @api public\n\
 */\n\
\n\
function View(obj, el) {\n\
  this.el = el;\n\
  this.obj = obj;\n\
  this.view = reactive(el, obj, this);\n\
  this.bindings = {};\n\
}\n\
\n\
/**\n\
 * Bind to an event with the given `str`, and invoke `method`:\n\
 *\n\
 *    this.bind('click .remove', 'remove')\n\
 *    this.bind('click .complete', 'complete')\n\
 *    this.bind('dblclick .info a', 'showDetails')\n\
 *\n\
 * @param {String} str\n\
 * @param {String} method\n\
 * @api public\n\
 */\n\
\n\
View.prototype.bind = function(str, method){\n\
  var parts = str.split(' ');\n\
  var event = parts.shift();\n\
  var selector = parts.join(' ');\n\
  var meth = this[method];\n\
  if (!meth) throw new TypeError('method \"' + method + '\" is not defined');\n\
  var fn = delegate.bind(this.el, selector, event, meth.bind(this));\n\
  this.bindings[str] = fn;\n\
};\n\
\n\
/**\n\
 * Unbind all listeners, all for a specific event, or \n\
 * a specific combination of event / selector.\n\
 *\n\
 *    view.unbind()\n\
 *    view.unbind('click')\n\
 *    view.unbind('click .remove')\n\
 *    view.unbind('click .details')\n\
 *\n\
 * @param {String} [str]\n\
 * @api public\n\
 */\n\
\n\
View.prototype.unbind = function(str){\n\
  if (str) {\n\
    var fn = this.bindings[str];\n\
    if (!fn) return;\n\
    var parts = str.split(' ');\n\
    var event = parts.shift();\n\
    delegate.unbind(this.el, event, fn);\n\
  } else {\n\
    keys(this.bindings).forEach(this.unbind.bind(this));\n\
  }\n\
};\n\
//@ sourceURL=component-view/index.js"
));
require.register("hkjels-scrumcard-view/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var View = require('view')\n\
  , domify = require('domify')\n\
  , templ = domify(require('./template.html'));\n\
\n\
/**\n\
 * Expose `ScrumcardView`.\n\
 */\n\
\n\
module.exports = ScrumcardView;\n\
\n\
/**\n\
 * ScrumcardView.\n\
 *\n\
 * @param {Model} task.\n\
 */\n\
\n\
function ScrumcardView(task) {\n\
  View.call(this, task, templ.cloneNode(true));\n\
}\n\
\n\
/**\n\
 * Inherit from `View.prototype`.\n\
 */\n\
\n\
ScrumcardView.prototype.__proto__ = View.prototype;\n\
\n\
/**\n\
 * Mark task as completed.\n\
 */\n\
\n\
ScrumcardView.prototype.complete = function(){\n\
  this.obj.complete = true;\n\
  this.el.classList.add('complete');\n\
};\n\
\n\
//@ sourceURL=hkjels-scrumcard-view/index.js"
));
require.register("hkjels-story-view/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Card = require('scrumcard')\n\
  , View = require('view')\n\
  , domify = require('domify')\n\
  , templ = domify(require('./template'));\n\
\n\
\n\
/**\n\
 * Expose `StoryView`.\n\
 */\n\
\n\
module.exports = StoryView;\n\
\n\
\n\
function StoryView(story) {\n\
  View.call(this, story, templ.cloneNode(true));\n\
  this.obj.tasks.forEach(function(task) {\n\
    this.addCard(task);\n\
  }.bind(this));\n\
}\n\
\n\
StoryView.prototype.__proto__ = View.prototype;\n\
\n\
StoryView.prototype.addCard = function(task) {\n\
  var card = new Card(task);\n\
  var section = this.el.querySelector(\".\" + task.state());\n\
  section.appendChild(card.el);\n\
};\n\
\n\
//@ sourceURL=hkjels-story-view/index.js"
));
require.register("hkjels-story-view/template.js", Function("exports, require, module",
"module.exports = '<div class=\"story\" data-title=\"title\">\\n\
  <section class=\"todo\"></section>\\n\
  <section class=\"progress\"></section>\\n\
  <section class=\"done\"></section>\\n\
</div>\\n\
';//@ sourceURL=hkjels-story-view/template.js"
));
require.register("hkjels-storyboard-view/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var StoryView = require('story-view')\n\
  , each = require('each')\n\
  , domify = require('domify')\n\
  , board = domify(require('./board.html'));\n\
\n\
/**\n\
 * Expose `StoryboardView`.\n\
 */\n\
\n\
module.exports = StoryboardView;\n\
\n\
/**\n\
 * StoryboardView.\n\
 */\n\
\n\
function StoryboardView(stories) {\n\
  var self = this;\n\
  this.el = board;\n\
  each(stories, function(i, story) {\n\
    self.addStory(story);\n\
  });\n\
}\n\
\n\
\n\
StoryboardView.prototype.addStory = function(story) {\n\
  var el = this.el.querySelector('.stories')\n\
    , view = new StoryView(story);\n\
  el.appendChild(view.el);\n\
};\n\
\n\
//@ sourceURL=hkjels-storyboard-view/index.js"
));
require.register("yields-before/index.js", Function("exports, require, module",
"\n\
/**\n\
 * insert `b` before `a`.\n\
 *\n\
 * @param {Element} a\n\
 * @param {Element} b\n\
 * @return {Element} b\n\
 */\n\
\n\
module.exports = function(a, b){\n\
  if (a.parentNode) {\n\
    return a.parentNode.insertBefore(b, a);\n\
  }\n\
};\n\
//@ sourceURL=yields-before/index.js"
));
require.register("yields-wrap/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies.\n\
 */\n\
\n\
var before = require('before');\n\
\n\
/**\n\
 * Wrap the given element with `el`.\n\
 * \n\
 * @param {Element} el\n\
 * @param {Element} wrap\n\
 */\n\
\n\
module.exports = function(el, wrap){\n\
  before(el, wrap);\n\
  el = el.firstElementChild || el;\n\
  wrap.appendChild(el);\n\
};\n\
//@ sourceURL=yields-wrap/index.js"
));
require.register("hkjels-input-search/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var domify = require('domify')\n\
  , events = require('event')\n\
  , wrap = require('wrap');\n\
\n\
/**\n\
 * Magnified search input.\n\
 */\n\
\n\
module.exports = function(el) {\n\
  var handle = domify('<div class=\"magnifier '+el.className+'\">')\n\
    , width = el.style.width;\n\
\n\
  // Need to wrap input to add the handle\n\
\n\
  el.className = 'magnifier-input';\n\
  wrap(el, handle);\n\
\n\
  // Events\n\
\n\
  function onfocus() {\n\
    var parentWidth = getComputedStyle(this.parentNode.parentNode).width;\n\
    handle.classList.add('focus');\n\
    el.style.width = parentWidth;\n\
  }\n\
  function onblur() {\n\
    if (el.value == '') {\n\
      handle.classList.remove('focus');\n\
      el.style.width = width;\n\
    }\n\
  }\n\
  function keyup(e) {\n\
    if (13 == e.keyCode) {\n\
      handle.classList.remove('focus');\n\
      handle.classList.add('spin');\n\
      el.style.width = width;\n\
    }\n\
  }\n\
  events.bind(el, 'focus', onfocus);\n\
  events.bind(el, 'blur', onblur);\n\
  events.bind(el, 'keyup', keyup);\n\
}\n\
\n\
//@ sourceURL=hkjels-input-search/index.js"
));
require.register("hkjels-oauthbutton/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var domify = require('domify')\n\
  , object = require('object')\n\
  , format = require('format').format\n\
  , query = require('querystring')\n\
  , templ = require('./template.html');\n\
\n\
/**\n\
 * Expose `oauthbutton`.\n\
 */\n\
\n\
module.exports = oauthbutton;\n\
\n\
/**\n\
 * oauthlink.\n\
 */\n\
\n\
function oauthbutton(authUri, opts, text) {\n\
  var defaults = { redirect_uri: location.href, response_type: 'token' }\n\
    , opts = object.merge(defaults, opts)\n\
    , params = query.stringify(opts)\n\
    , text = text || 'Log in'\n\
    , button = domify(format(templ, authUri, params, text));\n\
\n\
  return button;\n\
}\n\
\n\
//@ sourceURL=hkjels-oauthbutton/index.js"
));
require.register("hkjels-asana-oauthbutton/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var oauthbutton = require('oauthbutton');\n\
\n\
/**\n\
 * Expose `asanabutton`.\n\
 */\n\
\n\
module.exports = asanabutton;\n\
\n\
/**\n\
 * asanabutton.\n\
 */\n\
\n\
function asanabutton(id, alt) {\n\
  var uri = 'https://app.asana.com/-/oauth_authorize'\n\
    , opt = { client_id: id }\n\
    , button = oauthbutton(uri, opt, '&nbsp;');\n\
\n\
  button.setAttribute('title', 'Login with Asana');\n\
  button.classList.add('asana');\n\
  if (alt) button.classList.add('alt');\n\
\n\
  return button;\n\
}\n\
\n\
//@ sourceURL=hkjels-asana-oauthbutton/index.js"
));
require.register("asana-scrum/index.js", Function("exports, require, module",
"\n\
/**\n\
 * TODO Create a wrapper for #superagent with auth and base-url\n\
 * TODO Create a component for magnified, autocompleted input\n\
 */\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Collection = require('collection')\n\
  , StoryboardView = require('storyboard-view')\n\
  , Story = require('story-model')\n\
  , Task = require('task-model')\n\
  , asanabutton = require('asana-oauthbutton')('8061706646606')\n\
  , autocomplete = require('autocomplete')\n\
  , cookie = require('cookie')\n\
  , domify = require('domify')\n\
  , each = require('each')\n\
  , events = require('event')\n\
  , format = require('format').sprintf\n\
  , magnify = require('input-search')\n\
  , querystring = require('querystring')\n\
  , request = require('superagent');\n\
\n\
/**\n\
 * Tags cache.\n\
 */\n\
\n\
var tags = {};\n\
\n\
/**\n\
 * Base url of API.\n\
 */\n\
\n\
var base = 'https://app.asana.com/api/1.0';\n\
\n\
/**\n\
 * DOM-element cache.\n\
 */\n\
\n\
var content = document.querySelector('#content');\n\
\n\
/**\n\
 * Populate storyboard.\n\
 *\n\
 * A search for a tag has been performed and we can\n\
 * populate the Storyboard with results.\n\
 *\n\
 * TODO Translation asana <-> default should be moved\n\
 */\n\
\n\
function populateBoard(asanas) {\n\
  var stories = {};\n\
\n\
  each(asanas, function(asan) {\n\
    if (asan.parent) {\n\
      if (!stories[asan.parent.id]) stories[asan.parent.id] = {\n\
        \"id\": asan.parent.id,\n\
        \"title\": asan.parent.name,\n\
        \"tasks\": new Collection\n\
      };\n\
\n\
      if (asan.assignee) console.dir(asan.assignee.photo);\n\
      stories[asan.parent.id].tasks.push(new Task({\n\
          \"id\": asan.id,\n\
          \"title\": asan.name,\n\
          \"assignee\": asan.assignee ? asan.assignee.name : null,\n\
          \"email\": asan.assignee ? asan.assignee.email: null,\n\
          \"state\": \"todo\"\n\
        })\n\
      );\n\
    }\n\
  });\n\
\n\
  setTimeout(function() {\n\
    var view = new StoryboardView(stories);\n\
    content.appendChild(view.el);\n\
  }, 50);\n\
}\n\
\n\
/**\n\
 * Authorized.\n\
 *\n\
 * Authorized users sees a storyboard and can query for\n\
 * tags within all of their workspaces at ones.\n\
 */\n\
\n\
function authorized() {\n\
  content.classList.add('authorized');\n\
\n\
  function retrieveTasks(res) {\n\
    if (res.ok) return populateBoard(res.body.data);\n\
    content.appendChild(domify('<h1>No stories was marked with your specified tag'));\n\
  }\n\
\n\
  // Search\n\
\n\
  function keyup(e) {\n\
    var enter = 13;\n\
    if (enter == e.keyCode && e.target.value.length) {\n\
      var tag = tags[e.target.value];\n\
      var query = { opt_fields: 'assignee,completed,name,parent,assignee_status,assignee.name,assignee.email,parent.name,parent.id' };\n\
\n\
      request\n\
        .get(format('%s/tags/%d/tasks', base, tag))\n\
        .query(query)\n\
        .set({ 'Authorization': format('Bearer %s', cookie('auth')) })\n\
        .end(retrieveTasks);\n\
    }\n\
  }\n\
\n\
  var input = domify('<input type=\"search\" name=\"query\" placeholder=\"Input a tag\" />');\n\
  content.appendChild(input);\n\
  magnify(input);\n\
  events.bind(input, 'keyup', keyup);\n\
\n\
  // Add tags for autocompletion\n\
\n\
  autocomplete(input, function(str, cb) {\n\
    request\n\
      .get(format('%s/tags', base))\n\
      .set({ 'Authorization': format('Bearer %s', cookie('auth')) })\n\
      .end(function(res) {\n\
        var tagNames = [];\n\
        each(res.body.data, function(tag) {\n\
          tags[tag.name] = tag.id;\n\
          tagNames.push(tag.name);\n\
        });\n\
        cb(tagNames);\n\
      });\n\
  });\n\
}\n\
\n\
/**\n\
 * Un-authorized.\n\
 *\n\
 * Will display an Oauth login-link which redirects to and from\n\
 * the asana backend.\n\
 */\n\
\n\
function unauthorized() {\n\
  content.appendChild(domify('<i class=\"icon ion-ios7-timer\"></i>'))\n\
  content.appendChild(asanabutton);\n\
  content.classList.add('unauthorized');\n\
}\n\
\n\
/**\n\
 * Determine if the user is logged in.\n\
 */\n\
\n\
if (cookie('auth')) authorized();\n\
else {\n\
  var query = querystring.parse(location.hash.substr(1));\n\
  if (query.access_token != void 0) {\n\
    cookie('auth', query.access_token, { maxage: query.expires_in });\n\
    authorized();\n\
  } else {\n\
    unauthorized();\n\
  }\n\
}\n\
\n\
//@ sourceURL=asana-scrum/index.js"
));


























require.register("hkjels-scrumcard-view/template.html", Function("exports, require, module",
"module.exports = '<div class=\"scrumcard priority-{priority || \\'low\\'}\">\\n\
  <h4 class=\"title\" data-text=\"title\"></h4>\\n\
  <div class=\"estimate\" title=\"Estimate\" data-text=\"estimate\"></div>\\n\
  <img class=\"assignee-photo\" data-src=\"photo\" alt=\"{assignee || \\'Unassigned\\'}\" title=\"{assignee || \\'Unassigned\\'}\" />\\n\
</div>\\n\
';//@ sourceURL=hkjels-scrumcard-view/template.html"
));
require.register("hkjels-storyboard-view/board.html", Function("exports, require, module",
"module.exports = '<div class=\"storyboard\">\\n\
  <section class=\"stories\"></section>\\n\
  <section class=\"followers\" data-show=\"unassigned\"></section>\\n\
</div>\\n\
';//@ sourceURL=hkjels-storyboard-view/board.html"
));

require.register("hkjels-oauthbutton/template.html", Function("exports, require, module",
"module.exports = '<button onclick=\"location.href=\\'%s?%s\\'\">%s</button>\\n\
';//@ sourceURL=hkjels-oauthbutton/template.html"
));
require.alias("component-cookie/index.js", "asana-scrum/deps/cookie/index.js");
require.alias("component-cookie/index.js", "cookie/index.js");

require.alias("component-collection/index.js", "asana-scrum/deps/collection/index.js");
require.alias("component-collection/index.js", "collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("component-domify/index.js", "asana-scrum/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-each/index.js", "asana-scrum/deps/each/index.js");
require.alias("component-each/index.js", "each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-event/index.js", "asana-scrum/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-querystring/index.js", "asana-scrum/deps/querystring/index.js");
require.alias("component-querystring/index.js", "querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");


require.alias("stagas-autocomplete/index.js", "asana-scrum/deps/autocomplete/index.js");
require.alias("stagas-autocomplete/index.js", "autocomplete/index.js");
require.alias("stagas-dropdown/index.js", "stagas-autocomplete/deps/dropdown/index.js");
require.alias("component-jquery/index.js", "stagas-dropdown/deps/jquery/index.js");

require.alias("component-inherit/index.js", "stagas-dropdown/deps/inherit/index.js");

require.alias("stagas-viewport/index.js", "stagas-dropdown/deps/viewport/index.js");
require.alias("component-emitter/index.js", "stagas-viewport/deps/emitter/index.js");

require.alias("stagas-menu/index.js", "stagas-dropdown/deps/menu/index.js");
require.alias("component-emitter/index.js", "stagas-menu/deps/emitter/index.js");

require.alias("component-jquery/index.js", "stagas-menu/deps/jquery/index.js");

require.alias("stagas-viewport/index.js", "stagas-menu/deps/viewport/index.js");
require.alias("component-emitter/index.js", "stagas-viewport/deps/emitter/index.js");

require.alias("heavyk-format/index.js", "asana-scrum/deps/format/index.js");
require.alias("heavyk-format/index.js", "format/index.js");

require.alias("visionmedia-superagent/lib/client.js", "asana-scrum/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "asana-scrum/deps/superagent/index.js");
require.alias("visionmedia-superagent/lib/client.js", "superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("hkjels-story-model/index.js", "asana-scrum/deps/story-model/index.js");
require.alias("hkjels-story-model/index.js", "asana-scrum/deps/story-model/index.js");
require.alias("hkjels-story-model/index.js", "story-model/index.js");
require.alias("component-collection/index.js", "hkjels-story-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("component-model/lib/index.js", "hkjels-story-model/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "hkjels-story-model/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "hkjels-story-model/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "hkjels-story-model/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("hkjels-story-model/index.js", "hkjels-story-model/index.js");
require.alias("hkjels-task-model/index.js", "asana-scrum/deps/task-model/index.js");
require.alias("hkjels-task-model/index.js", "asana-scrum/deps/task-model/index.js");
require.alias("hkjels-task-model/index.js", "task-model/index.js");
require.alias("component-model/lib/index.js", "hkjels-task-model/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "hkjels-task-model/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "hkjels-task-model/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "hkjels-task-model/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("hkjels-is-fibonacci/index.js", "hkjels-task-model/deps/is-fibonacci/index.js");
require.alias("hkjels-is-fibonacci/index.js", "hkjels-task-model/deps/is-fibonacci/index.js");
require.alias("hkjels-fibonacci/index.js", "hkjels-is-fibonacci/deps/fibonacci/index.js");
require.alias("hkjels-fibonacci/index.js", "hkjels-is-fibonacci/deps/fibonacci/index.js");
require.alias("hkjels-fibonacci/index.js", "hkjels-fibonacci/index.js");
require.alias("KenanY-isInteger/index.js", "hkjels-is-fibonacci/deps/isInteger/index.js");

require.alias("hkjels-is-fibonacci/index.js", "hkjels-is-fibonacci/index.js");
require.alias("LearnBoost-gravatar-component/gravatar.js", "hkjels-task-model/deps/gravatar/gravatar.js");
require.alias("LearnBoost-gravatar-component/gravatar.js", "hkjels-task-model/deps/gravatar/index.js");
require.alias("enyo-md5/index.js", "LearnBoost-gravatar-component/deps/md5/index.js");

require.alias("learnboost-jsonp/jsonp.js", "LearnBoost-gravatar-component/deps/jsonp/jsonp.js");
require.alias("learnboost-jsonp/jsonp.js", "LearnBoost-gravatar-component/deps/jsonp/index.js");
require.alias("visionmedia-debug/index.js", "learnboost-jsonp/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "learnboost-jsonp/deps/debug/debug.js");

require.alias("learnboost-jsonp/jsonp.js", "learnboost-jsonp/index.js");
require.alias("component-querystring/index.js", "LearnBoost-gravatar-component/deps/querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("LearnBoost-gravatar-component/gravatar.js", "LearnBoost-gravatar-component/index.js");
require.alias("hkjels-task-model/index.js", "hkjels-task-model/index.js");
require.alias("hkjels-storyboard-view/index.js", "asana-scrum/deps/storyboard-view/index.js");
require.alias("hkjels-storyboard-view/index.js", "storyboard-view/index.js");
require.alias("component-domify/index.js", "hkjels-storyboard-view/deps/domify/index.js");

require.alias("component-each/index.js", "hkjels-storyboard-view/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("hkjels-story-view/index.js", "hkjels-storyboard-view/deps/story-view/index.js");
require.alias("hkjels-story-view/template.js", "hkjels-storyboard-view/deps/story-view/template.js");
require.alias("hkjels-story-view/index.js", "hkjels-storyboard-view/deps/story-view/index.js");
require.alias("component-collection/index.js", "hkjels-story-view/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("component-domify/index.js", "hkjels-story-view/deps/domify/index.js");

require.alias("component-each/index.js", "hkjels-story-view/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-view/index.js", "hkjels-story-view/deps/view/index.js");
require.alias("component-reactive/lib/index.js", "component-view/deps/reactive/lib/index.js");
require.alias("component-reactive/lib/utils.js", "component-view/deps/reactive/lib/utils.js");
require.alias("component-reactive/lib/text-binding.js", "component-view/deps/reactive/lib/text-binding.js");
require.alias("component-reactive/lib/attr-binding.js", "component-view/deps/reactive/lib/attr-binding.js");
require.alias("component-reactive/lib/binding.js", "component-view/deps/reactive/lib/binding.js");
require.alias("component-reactive/lib/bindings.js", "component-view/deps/reactive/lib/bindings.js");
require.alias("component-reactive/lib/adapter.js", "component-view/deps/reactive/lib/adapter.js");
require.alias("component-reactive/lib/index.js", "component-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "component-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "component-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "component-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "component-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "component-reactive/deps/query/index.js");

require.alias("yields-carry/index.js", "component-reactive/deps/carry/index.js");
require.alias("yields-carry/index.js", "component-reactive/deps/carry/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-merge-attrs/index.js");
require.alias("component-classes/index.js", "yields-carry/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("yields-uniq/index.js", "yields-carry/deps/uniq/index.js");
require.alias("component-indexof/index.js", "yields-uniq/deps/indexof/index.js");

require.alias("yields-carry/index.js", "yields-carry/index.js");
require.alias("component-reactive/lib/index.js", "component-reactive/index.js");
require.alias("component-delegate/index.js", "component-view/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-object/index.js", "component-view/deps/object/index.js");

require.alias("hkjels-scrumcard-view/index.js", "hkjels-story-view/deps/scrumcard/index.js");
require.alias("component-domify/index.js", "hkjels-scrumcard-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "hkjels-scrumcard-view/deps/emitter/index.js");

require.alias("component-view/index.js", "hkjels-scrumcard-view/deps/view/index.js");
require.alias("component-reactive/lib/index.js", "component-view/deps/reactive/lib/index.js");
require.alias("component-reactive/lib/utils.js", "component-view/deps/reactive/lib/utils.js");
require.alias("component-reactive/lib/text-binding.js", "component-view/deps/reactive/lib/text-binding.js");
require.alias("component-reactive/lib/attr-binding.js", "component-view/deps/reactive/lib/attr-binding.js");
require.alias("component-reactive/lib/binding.js", "component-view/deps/reactive/lib/binding.js");
require.alias("component-reactive/lib/bindings.js", "component-view/deps/reactive/lib/bindings.js");
require.alias("component-reactive/lib/adapter.js", "component-view/deps/reactive/lib/adapter.js");
require.alias("component-reactive/lib/index.js", "component-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "component-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "component-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "component-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "component-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "component-reactive/deps/query/index.js");

require.alias("yields-carry/index.js", "component-reactive/deps/carry/index.js");
require.alias("yields-carry/index.js", "component-reactive/deps/carry/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-carry/deps/merge-attrs/index.js");
require.alias("yields-merge-attrs/index.js", "yields-merge-attrs/index.js");
require.alias("component-classes/index.js", "yields-carry/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("yields-uniq/index.js", "yields-carry/deps/uniq/index.js");
require.alias("component-indexof/index.js", "yields-uniq/deps/indexof/index.js");

require.alias("yields-carry/index.js", "yields-carry/index.js");
require.alias("component-reactive/lib/index.js", "component-reactive/index.js");
require.alias("component-delegate/index.js", "component-view/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-object/index.js", "component-view/deps/object/index.js");

require.alias("hkjels-task-model/index.js", "hkjels-scrumcard-view/deps/task-model/index.js");
require.alias("hkjels-task-model/index.js", "hkjels-scrumcard-view/deps/task-model/index.js");
require.alias("component-model/lib/index.js", "hkjels-task-model/deps/model/lib/index.js");
require.alias("component-model/lib/static.js", "hkjels-task-model/deps/model/lib/static.js");
require.alias("component-model/lib/proto.js", "hkjels-task-model/deps/model/lib/proto.js");
require.alias("component-model/lib/index.js", "hkjels-task-model/deps/model/index.js");
require.alias("component-each/index.js", "component-model/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "component-model/deps/emitter/index.js");

require.alias("component-collection/index.js", "component-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "component-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("component-model/lib/index.js", "component-model/index.js");
require.alias("hkjels-is-fibonacci/index.js", "hkjels-task-model/deps/is-fibonacci/index.js");
require.alias("hkjels-is-fibonacci/index.js", "hkjels-task-model/deps/is-fibonacci/index.js");
require.alias("hkjels-fibonacci/index.js", "hkjels-is-fibonacci/deps/fibonacci/index.js");
require.alias("hkjels-fibonacci/index.js", "hkjels-is-fibonacci/deps/fibonacci/index.js");
require.alias("hkjels-fibonacci/index.js", "hkjels-fibonacci/index.js");
require.alias("KenanY-isInteger/index.js", "hkjels-is-fibonacci/deps/isInteger/index.js");

require.alias("hkjels-is-fibonacci/index.js", "hkjels-is-fibonacci/index.js");
require.alias("LearnBoost-gravatar-component/gravatar.js", "hkjels-task-model/deps/gravatar/gravatar.js");
require.alias("LearnBoost-gravatar-component/gravatar.js", "hkjels-task-model/deps/gravatar/index.js");
require.alias("enyo-md5/index.js", "LearnBoost-gravatar-component/deps/md5/index.js");

require.alias("learnboost-jsonp/jsonp.js", "LearnBoost-gravatar-component/deps/jsonp/jsonp.js");
require.alias("learnboost-jsonp/jsonp.js", "LearnBoost-gravatar-component/deps/jsonp/index.js");
require.alias("visionmedia-debug/index.js", "learnboost-jsonp/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "learnboost-jsonp/deps/debug/debug.js");

require.alias("learnboost-jsonp/jsonp.js", "learnboost-jsonp/index.js");
require.alias("component-querystring/index.js", "LearnBoost-gravatar-component/deps/querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("LearnBoost-gravatar-component/gravatar.js", "LearnBoost-gravatar-component/index.js");
require.alias("hkjels-task-model/index.js", "hkjels-task-model/index.js");
require.alias("hkjels-story-view/index.js", "hkjels-story-view/index.js");
require.alias("hkjels-input-search/index.js", "asana-scrum/deps/input-search/index.js");
require.alias("hkjels-input-search/index.js", "input-search/index.js");
require.alias("component-domify/index.js", "hkjels-input-search/deps/domify/index.js");

require.alias("component-event/index.js", "hkjels-input-search/deps/event/index.js");

require.alias("yields-wrap/index.js", "hkjels-input-search/deps/wrap/index.js");
require.alias("yields-before/index.js", "yields-wrap/deps/before/index.js");

require.alias("hkjels-asana-oauthbutton/index.js", "asana-scrum/deps/asana-oauthbutton/index.js");
require.alias("hkjels-asana-oauthbutton/index.js", "asana-oauthbutton/index.js");
require.alias("hkjels-oauthbutton/index.js", "hkjels-asana-oauthbutton/deps/oauthbutton/index.js");
require.alias("component-domify/index.js", "hkjels-oauthbutton/deps/domify/index.js");

require.alias("component-object/index.js", "hkjels-oauthbutton/deps/object/index.js");

require.alias("component-querystring/index.js", "hkjels-oauthbutton/deps/querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("heavyk-format/index.js", "hkjels-oauthbutton/deps/format/index.js");
