'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  var modRewrite = require('connect-modrewrite');
  var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
  };

  // Define the configuration for all the tasks
  grunt.initConfig({
    cfg: {
      app: 'app',
      dist: 'dist',
      firebaseUrl: process.env.TRAVIS_BRANCH == 'master' ? 'https://planningpokerapp.firebaseio.com/' : 'https://planningpokerappdev.firebaseio.com/'
    },

    watch: {
      ts: {
        files: ['<%= cfg.app %>/scripts/{,*/}*.ts'],
        tasks: ['ts:build'],
        options: {
          livereload: true
        }
      },
      //js: {
      //  files: ['<%= cfg.app %>/compiled/{,*/}*.js'],
      //  tasks: ['newer:jshint:all'],
      //  options: {
      //    livereload: true
      //  }
      //},
      styles: {
        files: ['<%= cfg.app %>/css/{,*/}*.css'],
        tasks: ['newer:copy:styles']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= cfg.app %>/index.html',
          '<%= cfg.app %>/views/**/*.html',
          '.tmp/css/*.css',
          '<%= cfg.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost',
        livereload: 35729
      },
      dev: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= cfg.app %>'
          ],
          middleware: function (connect) {
            return [
              modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg$ /index.html [L]']),
              mountFolder(connect, 'app')
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          keepalive: true,
          livereload: false,
          base: [
            '<%= cfg.dist %>'
          ],
          middleware: function (connect) {
            return [
              modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg$ /index.html [L]']),
              mountFolder(connect, 'app')
            ];
          }
        }
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'coverage',
            '<%= cfg.dist %>',
            '<%= cfg.app %>/compiled',
            '<%= cfg.app %>/scripts/**/*.js',
            '<%= cfg.app %>/scripts/**/*.map',
            '<%= cfg.app %>/scripts/**/*.ktp.ts',
            '!<%= cfg.dist %>/.git*'
          ]
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: '<%= cfg.app %>/index.html',
        ignorePath: '<%= cfg.app %>/'
        //fileTypes: {
        //  html: {
        //    replace: {
        //      js: '<script src="/{{filePath}}"></script>',
        //      css: '<link rel="stylesheet" href="/{{filePath}}" />'
        //    }
        //  }
        //}
      }
    },

    ts: {
      build: {
        src: [
          '<%= cfg.app %>/scripts/**/*.ts'
        ],
        outDir: '<%= cfg.app %>/compiled'
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      files: {
        src: [
          '<%= cfg.dist %>/scripts/{,*/}*.js',
          '<%= cfg.dist %>/styles/{,*/}*.css',
          '<%= cfg.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= cfg.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= cfg.app %>/index.html',
      options: {
        dest: '<%= cfg.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= cfg.dist %>/{,*/}*.html'],
      css: ['<%= cfg.dist %>/styles/{,*/}*.css'],
      js: '<%= cfg.dist %>/scripts/*.js',
      options: {
        assetsDirs: ['<%= cfg.dist %>'],
        patterns: {
          // FIXME While usemin won't have full support for revved files we have to put all references manually here
          js: [
            [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= cfg.app %>',
          dest: '<%= cfg.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/*.svg',
            '*.html',
            'fonts/*',
            'app.yaml',
            'gae.go'
          ]
        }, {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= cfg.dist %>/images',
            src: ['generated/*']
          }]
      },
      styles: {
        expand: true,
        cwd: '<%= cfg.app %>/css',
        dest: '.tmp/css/',
        src: '{,*/}*.css'
      }
    },

    htmlmin: {
      distviews: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= cfg.app %>',
          src: ['views/{,*/}*.html'],
          dest: '.tmp'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    ngtemplates: {
      dist: {
        options: {
          module: 'planningpoker',
          usemin: 'scripts/scripts.js',
          prefix: '/'
        },
        cwd: '.tmp',
        src: 'views/{,*/}*.html',
        dest: '.tmp/templates.js'
      }
    },

    tsconfig: {
      make: {
        options: {
          /* The main feature is to put files in your tsconfig.json file based on this filesGlob... */
          filesGlob: [
            '<%= cfg.app %>/scripts/**/*.ts'
          ],

          /* Anything added to "additionalOptions" will also be put into the tsconfig.json file */
          additionalOptions: {
            compilerOptions: {
              'emitDecoratorMetadata': true,
              'module': 'commonjs',
              'target': 'es5',
              'removeComments': true,
              'declaration': true,
              'outDir': 'app/compiled'
            },
          }

        }
      }
    },

    replace: {
      dist: {
        src: ['<%= cfg.dist %>/scripts/*.scripts.js'],
        overwrite: true,
        replacements: [{
          // Use the correct firebase url depending on git branch
          from: 'https://planningpokerappdev.firebaseio.com',
          to: '<%= cfg.firebaseUrl %>'
        }, {
            from: '{SHA}',
            to: '<%= gitinfo.local.branch.current.SHA %>'
          }, {
            from: '{SHA-SHORT}',
            to: '<%= gitinfo.local.branch.current.shortSHA %>'
          }]
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    coveralls: {
      options: {
        debug: false,
        coverageDir: 'coverage',
        dryRun: false,
        force: false,
        recursive: true
      }
    }
  });

  grunt.registerTask('servedist', [
    'clean:dist',
    'build',
    'connect:dist'
  ]);

  grunt.registerTask('serve', [
    'connect:dev',
    'watch'
  ]);

  grunt.registerTask('build', [
    'gitinfo',
    'wiredep',
    'ts:build',
    'useminPrepare',
    'copy:styles',
    'autoprefixer',
    'htmlmin',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('test', [
    'karma:unit'
  ]);

  grunt.registerTask('travis-build', [
    'clean',
    'build',
    'replace:dist',
    'karma:unit',
    'coveralls'
  ]);

  grunt.registerTask('default', [
    'clean',
    'build'
  ]);

};
