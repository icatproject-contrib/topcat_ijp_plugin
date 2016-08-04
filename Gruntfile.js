
module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');

	var serveStatic = require('serve-static');

	grunt.initConfig({
		watch: {
			files: ['**/*'],
			tasks: ['server'],
		},
		connect: {
			server: {
				options: {
				    port: 8000,
				    protocol: 'https',
				    keepalive: true,
				    livereload: true,
				    middleware: function (connect) {
						var middlewares = [
							//Enable CORS
							connect().use('/', function (req, res, next) {
								res.setHeader('Access-Control-Allow-Origin', '*');
								res.setHeader('Access-Control-Allow-Methods', '*');
								next();
							}),
							serveStatic('./')
						];					
						return middlewares;
					}
				}
			}
		}
	});


};

