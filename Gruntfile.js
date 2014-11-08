'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('write', 'Writes contents to a file', function () {
    var key;
    for (key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        grunt.file.write(key, this.data[key]);
        grunt.log.ok('Wrote %d bytes to %s', this.data[key].length, key);
      }
    }
  });

  require('load-grunt-config')(grunt, {
    configPath: 'tasks',
    data: {
      autoLoadImages: {
        pkg: require('./lib/wanted/auto-load-images/bower.json')
      },
      namespace: 'http://badwing.com/',
      pkg: require('./package.json')
    }
  });

};
