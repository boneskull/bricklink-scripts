'use strict';

var glob = require('glob').sync,
  extend = require('extend'),
  loadGruntConfig = require('load-grunt-config'),
  path = require('path'),
  join = path.join,
  basename = path.basename,
  dirname = path.dirname,
  slugFn = require('slug'),

  slug = function slug() {
    return slugFn.apply(null, Array.prototype.slice.call(arguments).concat('_'));
  },

  dist = join.bind(null, 'dist');


module.exports = function (grunt) {

  var readJSON = grunt.file.readJSON,
    root_opts = {
      configPath: 'tasks',
      data: {
        namespace: 'org.badwing',
        pkg: readJSON('package.json')
      },
      init: false
    },
    task_dirs = {},
    config;

  glob('./lib/**/bower.json').forEach(function (bower_path) {
    var bower = readJSON(bower_path),
      base = basename(bower.main, '.js'),
      name = slug(base),
      user_path = dist(base + '.user.js'),
      meta_path = dist(base + '.meta.js');

    root_opts.data[name] = {
      bower: bower,
      user_path: user_path,
      user: basename(user_path),
      meta_path: meta_path,
      meta: basename(meta_path),
      main_path: join(dirname(bower_path), bower.main)
    };
  });

  config = loadGruntConfig(grunt, root_opts);

  glob('./lib/**/tasks/').forEach(function (group) {
    task_dirs[group] = true;
  });

  Object.keys(task_dirs).forEach(function (group) {
    var opts = extend({}, root_opts, {
      configPath: group
    });
    extend(config, loadGruntConfig(grunt, opts));
  });


  grunt.initConfig(config);
};
