
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
 * Module dependencies.\n\
 */\n\
\n\
var Collection = require('collection')\n\
  , asanabutton = require('asana-oauthbutton')('8061706646606')\n\
  , cookie = require('cookie')\n\
  , domify = require('domify')\n\
  , events = require('event')\n\
  , format = require('format').sprintf\n\
  , magnify = require('input-search')\n\
  // , StoryboardView = require('storyboard-view')\n\
  , querystring = require('querystring')\n\
  , request = require('superagent');\n\
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
 */\n\
\n\
function populateBoard(stories) {\n\
  console.dir(stories);\n\
\n\
  // var view = StoryboardView();\n\
  // content.appendChild(view.el);\n\
\n\
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
  function checkResponse(res) {\n\
    if (res.ok) return populateBoard(res.body);\n\
    content.appendChild(domify('<h1>No stories was marked with your specified tag'));\n\
  }\n\
\n\
  // Search\n\
\n\
  function keyup(e) {\n\
    var enter = 13;\n\
    if (enter == e.keyCode && e.target.value.length) {\n\
      var tag = e.target.value;\n\
\n\
      request\n\
        .get(format('%s/tags/%s/tasks', base, tag))\n\
        .set(format('Authorization: Bearer %s', cookie('auth')))\n\
        .end(checkResponse);\n\
    }\n\
  }\n\
\n\
  var input = domify('<input type=\"search\" name=\"query\" placeholder=\"Input a tag\" />');\n\
  content.appendChild(input);\n\
  magnify(input);\n\
  events.bind(input, 'keyup', keyup);\n\
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
  var query = querystring.parse(location.href);\n\
  if (query.token != void 0) {\n\
    cookie('auth', query.token);\n\
    authorized();\n\
  } else {\n\
    unauthorized();\n\
  }\n\
}\n\
\n\
//@ sourceURL=asana-scrum/index.js"
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

require.alias("component-event/index.js", "asana-scrum/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-querystring/index.js", "asana-scrum/deps/querystring/index.js");
require.alias("component-querystring/index.js", "querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("heavyk-format/index.js", "asana-scrum/deps/format/index.js");
require.alias("heavyk-format/index.js", "format/index.js");

require.alias("visionmedia-superagent/lib/client.js", "asana-scrum/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "asana-scrum/deps/superagent/index.js");
require.alias("visionmedia-superagent/lib/client.js", "superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
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
