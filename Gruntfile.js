module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
          fonts: {
            files: [
              {
                  expand: true,
                  cwd: 'static/bower_components/bootstrap/dist',
                  src: 'fonts/*',
                  dest: 'static/'
              }
            ],
          },
        },
        concat: {
            css: {
               src: [
                 'static/css/bootstrap.spacelab.css',
                 'static/bower_components/bootstrap/dist/css/bootstrap.css',
                 'static/bower_components/jquery-ui/themes/base/jquery-ui.css',
                 'static/bower_components/jquery-ui/themes/base/autocomplete.css',
                 'static/css/main.css',
                ],
                dest: 'static/css/combined.css'
            },
            js : {
                src : [
                'static/bower_components/jquery/dist/jquery.js',
                'static/bower_components/jquery-ui/jquery-ui.js',
                'static/bower_components/bootstrap/dist/js/bootstrap.js',
                'static/bower_components/bootbox/bootbox.js',
                'static/bower_components/jQuery-Storage-API/jquery.storageapi.js',
                'static/bower_components/cryptojslib/components/core.js',
                'static/bower_components/cryptojslib/components/enc-base64.js',
                'static/bower_components/cryptojslib/components/md5.js',
                'static/bower_components/cryptojslib/components/evpkdf.js',
                'static/bower_components/cryptojslib/components/cipher-core.js',
                'static/bower_components/cryptojslib/components/tripledes.js',
                'static/bower_components/mustache/mustache.js',
                'static/bower_components/pagedown/Markdown.Converter.js',
                'static/js/main.js',
                ],
                dest : 'static/js/combined.js'
            }
        },
        cssmin : {
            options: {
              rebase: false
            },
            css:{
                src: 'static/css/combined.css',
                dest: 'static/css/combined.min.css'
            }
        },
        uglify : {
            js: {
                files: {
                    'static/js/combined.min.js' : [ 'static/js/combined.js' ]
                }
            }
        },
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', [ 'copy:fonts', 'concat:css', 'cssmin:css', 'concat:js', 'uglify:js' ]);
};
