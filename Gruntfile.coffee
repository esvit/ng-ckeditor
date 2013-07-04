path = require 'path'

# Build configurations.
module.exports = (grunt) ->
    grunt.initConfig
        # Deletes built file and temp directories.
        clean:
            working:
                src: [
                    'ng-ckeditor.*'
                    './.temp/views'
                    './.temp/'
                ]
        copy:
            styles:
                files: [
                    src: './src/styles/ng-ckeditor.css'
                    dest: './ng-ckeditor.css'
                ]

        uglify:
            # concat js files before minification
            js:
                src: ['ng-ckeditor.src.js']
                dest: 'ng-ckeditor.js'
                options:
                  sourceMap: (fileName) ->
                    fileName.replace /\.js$/, '.map'
        concat:
            # concat js files before minification
            js:
                src: ['src/scripts/directive.js', './src/plugins/*.js', './.temp/scripts/views.js']
                dest: 'ng-ckeditor.src.js'

        less:
            css:
                files:
                    'ng-ckeditor.css': 'src/styles/ng-ckeditor.less'

        cssmin:
            css:
                files:
                    'ng-ckeditor.css': 'ng-ckeditor.css'

        ngTemplateCache:
            views:
                files:
                    './.temp/scripts/views.js': './src/views/**/*.html'
                options:
                    trim: './.temp/'
                    module: 'ngCkeditor'

    # Register grunt tasks supplied by grunt-contrib-*.
    # Referenced in package.json.
    # https://github.com/gruntjs/grunt-contrib
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-less'
    grunt.loadNpmTasks 'grunt-contrib-cssmin'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-concat'


    # Register grunt tasks supplied by grunt-hustler.
    # Referenced in package.json.
    # https://github.com/CaryLandholt/grunt-hustler
    grunt.loadNpmTasks 'grunt-hustler'

    grunt.registerTask 'dev', [
        'clean'
        'ngTemplateCache'
        'concat'
        'less'
        'copy'
    ]
    grunt.registerTask 'default', [
        'dev'
        'uglify'
        'cssmin'
    ]
