module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            css: {
               src: [
                    'bower_components/bootstrap/dist/css/bootstrap.css',
                    'bower_components/jquery-ui/themes/base/jquery-ui.css',
                    'bower_components/jquery-ui/themes/base/autocomplete.css',
                    'public/css/mysecrets.css',
                ],
                dest: 'public/css/combined.css'
            },
            js : {
                src : [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/jquery-ui/jquery-ui.js',
                    'bower_components/jquery-simulate/jquery.simulate.js',
                    'bower_components/bootstrap/dist/js/bootstrap.js',
                    'bower_components/bootbox/bootbox.js',
                    'bower_components/jQuery-Storage-API/jquery.storageapi.js',
                    'bower_components/cryptojslib/components/core.js',
                    'bower_components/cryptojslib/components/enc-base64.js',
                    'bower_components/cryptojslib/rollups/md5.js',
                    'bower_components/cryptojslib/components/evpkdf.js',
                    'bower_components/cryptojslib/components/cipher-core.js',
                    'bower_components/cryptojslib/rollups/aes.js',
                    'bower_components/cryptojslib/rollups/pbkdf2.js',
                    'bower_components/mustache/mustache.js',
                    'bower_components/clipboard/dist/clipboard.js',
                    'bower_components/firebase/firebase.js',
                    'public/js/firebasebackend.js',
                    'public/js/localbackend.js',
                    'public/js/mysecrets.js',
                ],
                dest : 'public/js/combined.js'
            }
        },
        cssmin : {
            options: {
              rebase: false
            },
            css:{
                src: 'public/css/combined.css',
                dest: 'public/css/combined.min.css'
            }
        },
        uglify : {
            js: {
                files: {
                    'public/js/combined.min.js' : [ 'public/js/combined.js' ]
                }
            }
        },
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', [ 'concat:css', 'cssmin:css', 'concat:js', 'uglify:js' ]);
};
