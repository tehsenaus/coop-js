module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
	    dist: {
	    	files: {
	    		'dist/coop.min.js': 'dist/coop.js'
	    	}
	    }
    }
  });

  grunt.loadNpmTasks('bower-amd-dist');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['bower-amd-dist', 'uglify']);

};
