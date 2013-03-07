module.exports = function (grunt) {
  // cordova version (used in cordova-2.4.0.js)
  var cordovaVersion = "2.4.0";

  // External tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-template-helper');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.loadTasks('grunt-tasks');

  // reading index.html
  var fs = require('fs');
  var html = fs.readFileSync(__dirname + '/src/index.html');

  // harvesting javascripts: <script (...) src="..."></script>
  var re = /<script.*src="([^"]+)">/gi;
  var scripts = [], r;
  while ((r = re.exec(html)) !== null) {
    // excluding cordova file (to not be included twice)
    if (r[1].indexOf("vendor/cordova") == -1)
      scripts.push('src/' + r[1]); // ex: src/js/main.js
  }
  console.log(scripts);
  //
  // Project configuration
  //
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*\n'
        + ' * <%= pkg.name %> v<%= pkg.version %>\n'
        + ' *\n'
        + ' * Copyright (c) <%= grunt.template.today("yyyy") %> zeNodus'
        + ' *\n'
        + ' * Date: <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>\n'
        + ' */'
    },
    jshint: { all: [ /* FIXME */] },
    /* FIXME: wtf is this plugin ??? */
    template: {
      dev: {
        options: {
          wrap: {
            banner: '<script type="text/template" id="#{0}">',
            footer: '</script>',
            inject: [{
              prop: 'src',
              rem: 'src/templates/',
              repl: { ".html": "" }
            }]
          }
        },
        src: ['src/templates/*.html'],
        dest: 'dist/templates.html'
      }
    },
    concat: {
      dist_javascript: {
        src: scripts,
        dest: 'dist/app.js'
      },
      dist_css: {
        src: ['src/styles/main.css'],
        dest: 'dist/app.css'
      },
      dist_html: {
        src: ['src/index.html'],
        dest: 'dist/index.html'
      }
    },
    uglify: {
      build: {
        src: 'dist/app.js',
        dest: 'dist/app.min.js'
      }
    },
    cssmin: {
      my_target: {
        src: 'dist/app.css',
        dest: 'dist/app.min.css'
      }
    },
    preprocess: {
      html: {
        src: 'dist/index.html' ,
        options : { inline: true }
      }
    }
  });

  var platforms = ["android", "ios", "wp8"];

  //
  // registering grunt copy-cordova-android-to-dist, copy-cordova-ios-to-dist, ...
  //  ex: copy /platforms/ios/cordova/cordova-2.4.0.js  => /dist/cordova.js
  //
  platforms.forEach(function (platform) {
    grunt.registerTask('copy-cordova-' + platform + '-to-dist', function () {
      grunt.file.copy('platforms/' + platform + '/cordova/cordova-' + cordovaVersion + '.js', 'dist/cordova.js');
    });
  });

  //
  // registering grunt copy-dist-to-android, copy-dist-to-ios, ...
  //  ex: copy /dist/index.html  => /platforms/android/build/index.html
  //
  platforms.forEach(function (platform) {
    grunt.registerTask('to-' + platform, function () {
      grunt.file.copy('dist/index.html', 'platforms/' + platform + '/build/index.html');
    });
  });

  grunt.registerTask('copy-iostest', function () {
    grunt.file.copy('dist/index-build.html', 'src/index.html');
  });

  // Default task(s).
  grunt.registerTask('default', ['clean', 'template', 'concat', 'uglify', 'cssmin', 'copy-android']);
  grunt.registerTask('nocommentdev', ['nocomment']);
  grunt.registerTask('wp8', ['clean', 'template', 'concat', 'uglify', 'cssmin', 'copy-wp8']);
  grunt.registerTask('ios', ['clean', 'template', 'concat', 'uglify', 'cssmin', 'copy-ios']);
  grunt.registerTask('web', ['clean', 'template', 'concat', 'copy-web']);
  grunt.registerTask('iostest', ['clean', 'template', 'concat', 'copy-iostest']);
  grunt.registerTask('test', ['clean', 'template', 'concat', 'copy-cordova-wp8-to-dist', 'preprocess']);
};