'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  require('time-grunt')(grunt);

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    cfg: {
      app: 'app',
      dist: 'dist'
    },

    jshint: {
      options: pkg.jshintConfig,
      all: [
        'Gruntfile.js',
        'app/js/**/*.js'
      ]
    },

    watch: {
      js: {
        files: ['<%= cfg.app %>/js/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      less: {
        files: ['<%= cfg.app %>/less/*.less'],
        tasks: ['less:dist']
      },
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
          '<%= cfg.app %>/{,*/}*.html',
          '.tmp/css/{,*/}*.css',
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
          ]
        }
      },
      dist: {
        options: {
          open: true,
          keepalive: true,
          livereload: false,
          base: [
            '<%= cfg.dist %>'
          ]
        }
      }
    },

    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= cfg.app %>/css',
              '<%= cfg.dist %>/*',
              '!<%= cfg.dist %>/.git*'
            ]
          }
        ]
      }
    },

    useminPrepare: {
      html: '<%= cfg.app %>/index.html',
      options: {
        dest: '<%= cfg.dist %>'
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= cfg.app %>',
            dest: '<%= cfg.dist %>',
            src: [
              '*.{ico,png,txt}',
              '*.html',
              'bower_components/**/*'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= cfg.dist %>/images',
            src: ['generated/*']
          }
        ]
      },
      styles: {
        expand: true,
        cwd: '<%= cfg.app %>/css',
        dest: '.tmp/css/',
        src: '{,*/}*.css'
      },
      svg: {
        expand: true,
        cwd: '<%= cfg.app %>/images',
        dest: '<%= cfg.dist %>/images/',
        src: '{,*/}*.svg'
      }
    },

    htmlmin: {
      distpages: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= cfg.dist %>',
            src: ['*.html'],
            dest: '<%= cfg.dist %>'
          }
        ]
      },
      distviews: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= cfg.app %>',
            src: ['views/{,*/}*.html'],
            dest: '.tmp'
          }
        ]
      }
    },

    ngmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/js',
            src: '*.js',
            dest: '.tmp/concat/js'
          }
        ]
      }
    },

    ngtemplates: {
      dist: {
        options: {
          module: 'planningPokerApp',
          usemin: 'js/app.js'
        },
        cwd: '.tmp',
        src: 'views/*.html',
        dest: '.tmp/templates.js'
      }
    },

    less: {
      dist: {
        files: {
          '<%= cfg.app %>/css/vendor.css': '<%= cfg.app %>/less/vendor.less',
          '<%= cfg.app %>/css/app.css': '<%= cfg.app %>/less/app.less'
        }
      }
    },

    rev: {
      files: {
        src: [
          '<%= cfg.dist %>/js/{,*/}*.js',
          '<%= cfg.dist %>/css/{,*/}*.css',
          '<%= cfg.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    usemin: {
      html: ['<%= cfg.dist %>/{,*/}*.html'],
      css: ['<%= cfg.dist %>/css/{,*/}*.css'],
      options: {
        assetsDirs: [
          '<%= cfg.dist %>',
          '<%= cfg.dist %>/images'
        ]
      }
    },

    concurrent: {
      dist: [
        'copy:styles',
        'copy:svg'
      ]
    }
  });

  grunt.registerTask('servedist', [
    'clean:dist',
    'build',
    'connect:dist'
  ]);

  grunt.registerTask('serve', [
    'less',
    'connect:dev',
    'watch'
  ]);

  grunt.registerTask('build', [
    'useminPrepare',
    'less',
    'concurrent:dist',
    'htmlmin:distviews',
    'ngtemplates:dist',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'clean:dist',
    'jshint',
    'build'
  ]);
};
