'use strict';

var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

	// Load grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// App configuration, used throughout
	var appConfig = {
		src: 'src',
		test: 'test',
		tmp: '.tmp'
	};

	grunt.initConfig({
		app: appConfig,
		watch: {
			scripts: {
				files: ['<%= app.src %>/**.js'],
				tasks: ['concurrent:scripts']
			},
			scss: {
				files: [
					'<%= app.src %>/**.scss',
					'<%= app.test %>/**.scss'
				],
				tasks: [
					'compass:dev',
					'compass:test'
				]
			},
			tests: {
				files: ['<%= app.test %>/*.html', '<%= app.test %>/**.js'],
				tasks: ['concurrent:tests']
			},
			gruntfile: {
				files: ['Gruntfile.js'],
				tasks: ['jshint:gruntfile']
			}
		},
		concurrent: {
			scripts: ['jshint:scripts', 'mocha_phantomjs'],
			tests: ['jshint:tests', 'mocha_phantomjs']
		},
		connect: {
			options: {
				hostname: 'localhost'
			},
			dev: {
				options: {
					base: '<%= app.test %>',
					port: 8000,
					middleware: function (connect, options) {
						return [
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'node_modules'),
							mountFolder(connect, options.base),
							mountFolder(connect, appConfig.src)
						];
					}
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: ['Gruntfile.js'],
			scripts: ['<%= app.src %>/**.js'],
			tests: ['<%= app.test %>/**.js']
		},
		compass: {
			dev: {
				options: {
					sassDir: '<%= app.src %>',
					cssDir: '<%= app.tmp %>',
					environment: 'development'
				}
			},
			test: {
				options: {
					sassDir: '<%= app.test %>',
					cssDir: '<%= app.tmp %>',
					environment: 'development'
				}
			}
		},
		mocha_phantomjs: {
			all: {
				options: {
					urls: [
						'http://localhost:<%= connect.dev.options.port %>/index.html'
					]
				}
			}
		}
	});

	grunt.event.on('watch', function (action, filepath) {
		// Only lint the file that actually changed
		grunt.config(['jshint', 'scripts'], filepath);
	});

	grunt.registerTask('test', [
		'connect:dev',
		'mocha_phantomjs'
	]);

	grunt.registerTask('default', [
		'connect:dev',
		'compass:dev',
		'compass:test',
		'concurrent:scripts',
		'mocha_phantomjs',
		'watch'
	]);
};
