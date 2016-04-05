module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            css: {
               src: [
                 'static/css/bootstrap.css',
                 'static/css/jquery-ui.css',
                 'static/css/autocomplete.css',
                 'static/css/main.css',
                ],
                dest: 'static/css/combined.css'
            },
            js : {
                src : [
                'static/js/dropbox-datastores-1.2-latest.js',
                'static/js/jquery.js',
                'static/js/jquery-ui.js',
                'static/js/jquery.simulate.js',
                'static/js/bootstrap.js',
                'static/js/bootbox.js',
                'static/js/jquery.storageapi.js',
                'static/js/core.js',
                'static/js/enc-base64.js',
                'static/js/md5.js',
                'static/js/evpkdf.js',
                'static/js/cipher-core.js',
                'static/js/aes.js',
                'static/js/pbkdf2.js',
                'static/js/mustache.js',
                'static/js/dropboxbackend.js',
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
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', [ 'concat:css', 'cssmin:css', 'concat:js', 'uglify:js' ]);
};
