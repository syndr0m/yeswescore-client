  module.exports = function(grunt) {

  // External tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-template-helper');
  
  grunt.loadTasks('grunt-tasks');

  // Project configuration.
  grunt
      .initConfig({
        pkg : grunt.file.readJSON('package.json'),
        meta : {
          banner : '/*\n'
              + ' * <%= pkg.name %> v<%= pkg.version %>\n'
              + ' *\n'
              + ' * Copyright (c) <%= grunt.template.today("yyyy") %> zeNodus'
              + ' *\n'
              + ' * Date: <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>\n'
              + ' */',
		  header : '<!DOCTYPE html>\n'
					+'<html>\n'
					+'<head>\n'
					+'<title>YesWeScore</title>\n'
					+'<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no;" />\n'
					+'<meta charset="utf-8">\n'
					+'<script type="text/javascript" charset="utf-8" src="cordova.js"></script>\n'
					+'<script type="text/javascript" charset="utf-8" src="app.js"></script>\n'
					+'<link type="text/css" rel="stylesheet" href="styles.css" />\n'
					+'</head>\n'
					+'<body>\n'
					+'<div id="index" data-role="page"></div>',
		   footer : '</body>\n'
					+'</html>',
		   headerbuild : '<!DOCTYPE html>\n'
					+'<html>\n'
					+'<head>\n'
					+'<title>YesWeScore</title>\n'
					+'<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no;" />\n'
					+'<meta charset="utf-8">\n'
					+'<!-- Third party css -->\n' 
  					+'<link rel="stylesheet" href="styles/jquery.mobile-1.2.0.min.css">\n'
  					+'<!-- our css -->\n'
  					+'<link rel="stylesheet" href="styles/main.css">\n'     
  					+'<!-- Cordova is first -->\n'
  					+'<script type="text/javascript" src="js/external-libs/cordova-2.4.0.js"></script>\n' 
  					+'<!-- 3rd party libraries & configuration -->\n'
  				      +'<script type="text/javascript" src="js/external-libs/zepto.js"></script>\n'  
  				      +'<script type="text/javascript" src="js/external-libs/deferred.js"></script>\n'  
  					+'<script type="text/javascript" src="js/helpers.js"></script>\n'  
  					+'<script type="text/javascript" src="js/external-libs/lodash.min.js"></script>\n'
  					+'<script type="text/javascript" src="js/external-libs/backbone-min.js"></script>\n'
  					+'<script type="text/javascript" src="js/external-libs/backbone.offline.js"></script>\n'
  					+'<script type="text/javascript" src="js/external-libs/backbone.poller.min.js"></script>\n'
  					+'<!-- our scripts -->\n'
 					+'<script type="text/javascript" src="js/cordova.js"></script>\n'
  					+'<script type="text/javascript" src="js/cordova/connection.js"></script>\n'
  					+'<script type="text/javascript" src="js/cordova/geolocation.js"></script>\n'
  					+'<script type="text/javascript" src="js/cordova/file.js"></script>\n' 
  					+'<script type="text/javascript" src="js/y.js"></script>\n'
  					+'<script type="text/javascript" src="js/y/conf.js"></script>\n'
  					+'<script type="text/javascript" src="js/y/connection.js"></script>\n'
 					+'<script type="text/javascript" src="js/y/router.js"></script>\n'
  					+'<script type="text/javascript" src="js/y/stats.js"></script>\n'
  					+'<script type="text/javascript" src="js/y/templates.js"></script>\n'
  					+'<script type="text/javascript" src="js/y/geolocation.js"></script>\n'   
  					+'<!-- Core -->\n'
  					+'<script type="text/javascript" src="js/models/game.js"></script>\n'
  					+'<script type="text/javascript" src="js/models/stream.js"></script>\n'
  					+'<script type="text/javascript" src="js/models/player.js"></script>\n'
  					+'<script type="text/javascript" src="js/models/club.js"></script>\n'
  					+'<script type="text/javascript" src="js/collections/games.js"></script>\n'
  					+'<script type="text/javascript" src="js/collections/players.js"></script> \n'       
  					+'<script type="text/javascript" src="js/collections/clubs.js"></script>\n'          
  					+'<!-- Views -->\n'
  					+'<script type="text/javascript" src="js/views/account.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/club.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/clubadd.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/game.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/gameadd.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/gameend.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/gamefollow.js"></script>\n'   
  					+'<script type="text/javascript" src="js/views/gamelist.js"></script>\n'     
  					+'<script type="text/javascript" src="js/views/index.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/player.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/playerfollow.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/playerform.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/playerlist.js"></script>\n' 
  					+'<script type="text/javascript" src="js/views/playersignin.js"></script>\n'
 					+'<script type="text/javascript" src="js/views/playerforget.js"></script>\n'   
  					+'<script type="text/javascript" src="js/views/index.js"></script>\n'
  					+'<script type="text/javascript" src="js/views/game.js"></script>\n'					
  					+'<!-- start the app ! -->\n'
  					+'<script type="text/javascript" src="js/main.js"></script>\n'					
					+'</head>\n'
					+'<body>\n'
					+'<div id="index" data-role="page"></div>',
		   footerbuild : '</body>\n'
					+'</html>',			  
        },
        jshint: {
          all: ['Gruntfile.js'
                , 'grunt-tasks/build.js'
                , 'src/js/collections/*.js'
                ,'src/js/models/*.js'
                ,'src/js/views/*.js'
                ,'src/js/y/*.js'                
                ]
        },      
        concat : {
          dist_javascript : {
            src : [ '<%= meta.banner %>'
                 // Order is important.
                ,'src/js/helpers.js'
                ,'src/js/external-libs/zepto.js'
                ,'src/js/external-libs/deferred.js'
                ,'src/js/external-libs/lodash.min.js'
                ,'src/js/external-libs/backbone-min.js'
                ,'src/js/external-libs/backbone.offline.js'
                ,'src/js/external-libs/backbone.poller.min.js'
                ,'src/js/cordova.js'
                ,'src/js/cordova/connection.js'
                ,'src/js/cordova/geolocation.js'
                ,'src/js/cordova/file.js'  
                ,'src/js/y.js'
                ,'src/js/y/conf.js'
                ,'src/js/y/connection.js'
                ,'src/js/y/router.js'
                ,'src/js/y/stats.js'
                ,'src/js/y/templates.js'
                ,'src/js/y/geolocation.js'                   
                // Core
                ,'src/js/models/game.js'
                ,'src/js/models/stream.js'
                ,'src/js/models/player.js'
                ,'src/js/models/club.js'
                ,'src/js/collections/games.js'
                ,'src/js/collections/players.js'        
                ,'src/js/collections/clubs.js'                      
                // Views
                ,'src/js/views/account.js' 
                ,'src/js/views/club.js' 
                ,'src/js/views/clubadd.js' 
                ,'src/js/views/game.js' 
                ,'src/js/views/gameadd.js' 
                ,'src/js/views/gameend.js' 
                ,'src/js/views/gamefollow.js'   
                ,'src/js/views/gamelist.js'     
                ,'src/js/views/index.js' 
                ,'src/js/views/player.js' 
                ,'src/js/views/playerfollow.js' 
                ,'src/js/views/playerform.js' 
                ,'src/js/views/playerlist.js' 
                ,'src/js/views/playersignin.js'
                ,'src/js/views/playerforget.js'   
                ,'src/js/views/index.js'
                ,'src/js/views/game.js'
                // start
                ,'src/js/main.js'                
               
            ],
            dest : 'dist/app.js'
          },
          dist_css : {
            src : [ '<%= meta.banner %>',
                 // Order is important.
                'src/styles/jquery.mobile-1.2.0.min.css', 
                'src/styles/main.css'
            ],
            dest : 'dist/style.css'
          },  
          dist_templates : {
		    options: {
				banner: '<%= meta.header %>\n\n',
				footer: '\n\n<%= meta.footer %>'
			},
            src : [  'dist/templates.html'],
            dest : 'dist/index.html'
          }, 		  
          dist_templatesbuild : {
		    options: {
				banner: '<%= meta.headerbuild %>\n\n',
				footer: '\n\n<%= meta.footerbuild %>'
			},
            src : [  'dist/templates.html'],
            dest : 'dist/index-build.html'
          },          
        },   
        uglify : {
          build : {
            src : 'dist/app.js',
            dest : 'dist/app.min.js'
          }
        },        
        cssmin: {
          my_target: {
              src: 'dist/style.css',
              dest: 'dist/style.min.css'
          }
        },
        
        
        template: {
          dev: {
            options: {
              wrap: {
				//<script  id="accountViewTemplate" type="text/template">
                banner: '<script type="text/template" id="#{0}">',
                footer: '</script>',
				inject: [{
					prop: 'src',
					rem:  'src/templates/',
					repl: {".html": ""}
				}]
              }
			  /*,
              minify: {
                mode: 'html',
                // Note that this is redundant, mode: 'html' does the same thing.
                pretty: {
                  mode: 'minify',
                  lang: 'markup',
                  html: 'html-yes'
                }
              }*/
            },
            files: {
              'dist/templates.html': ['src/templates/*.html']
			}
          }
        },

        watch : {
          files : [ 'src/views/**/*.html'
                    ,'index.html' ],
          tasks : 'default'
        }
        
        
        
        
      });
  
  grunt.registerTask('copy-android', function() {

    grunt.file.copy('lib/cordova/cordova-2.4.0-android.js', 'android/assets/www/cordova.js');
    grunt.file.copy('dist/app.js','android/assets/www/app.js');
    grunt.file.copy('dist/app.min.js','android/assets/www/app.min.js');
    grunt.file.copy('dist/style.css','android/assets/www/styles.css');
    grunt.file.copy('dist/style.min.css','android/assets/www/styles.min.css');    
    grunt.file.copy('dist/index.html','android/assets/www/index.html');
       
  });

  grunt.registerTask('copy-wp8', function() {

    grunt.file.copy('lib/cordova/cordova-2.4.0-wp8.js', 'wp8/www/cordova.js');
    grunt.file.copy('dist/app.js','wp8/www/app.js');
    grunt.file.copy('dist/app.min.js','wp8/www/app.min.js');
    grunt.file.copy('dist/style.css','wp8/www/styles.css');
    grunt.file.copy('dist/style.min.css','wp8/www/styles.min.css');    
    grunt.file.copy('dist/index.html','wp8/www/index.html');
       
  });
  
  grunt.registerTask('copy-ios', function() {

    grunt.file.copy('lib/cordova/cordova-2.4.0-ios.js', 'ios/www/cordova.js');
    grunt.file.copy('dist/app.js','ios/www/app.js');
    grunt.file.copy('dist/app.min.js','ios/www/app.min.js');
    grunt.file.copy('dist/style.css','ios/www/styles.css');
    grunt.file.copy('dist/style.min.css','ios/www/styles.min.css');    
    grunt.file.copy('dist/index.html','ios/www/index.html');
       
  });

  grunt.registerTask('copy-web', function() {

    grunt.file.copy('lib/cordova/cordova-2.4.0-blackberry.js', 'src/build/cordova.js');
    grunt.file.copy('dist/app.js','src/build/app.js');
    grunt.file.copy('dist/style.css','src/build/styles.css');
    grunt.file.copy('dist/index.html','src/build/index.html');
       
  });

  grunt.registerTask('copy-iostest', function() {

    grunt.file.copy('dist/index-build.html','src/index.html');
       
  });
  
  // Default task(s).
  grunt.registerTask('default', [ 'clean','template','concat','uglify','cssmin','copy-android' ]);
  grunt.registerTask('nocommentdev', [ 'nocomment' ]);  
  grunt.registerTask('wp8', [ 'clean','template','concat','uglify','cssmin','copy-wp8' ]);
  grunt.registerTask('ios', [ 'clean','template','concat','uglify','cssmin','copy-ios' ]);
  grunt.registerTask('web', [ 'clean','template','concat','copy-web']);
  grunt.registerTask('iostest', [ 'clean','template','concat','copy-iostest']);

};