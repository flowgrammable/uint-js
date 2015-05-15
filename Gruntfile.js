
module.exports = function(grunt) {
     
grunt.initConfig({
  jshint: {
    all: ['Gruntfile.js', 'uint.js']
  },
  mochaTest: {
    test: {
      src: ['tests/**/*.js']
    }
  },
  watch: {
    scripts: {
      files: ['uint.js'],
      tasks: ['default'],
      options: {
        spawn: false,
      },
    },
  }
});

grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-mocha-test');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-watch');
      
grunt.registerTask('default', ['jshint', 'mochaTest']);

};
