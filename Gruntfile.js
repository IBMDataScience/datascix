/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

const urlValidate = require("./lib/grunt-url-validate/task");

module.exports = function(grunt) {

	grunt.initConfig({
		jsonlint: {
			changelog: {
				src: [
					"public/**/*.json",
					"package.json"
				]
			}
		},
		eslint: {
			node: {
				src: [
					"lib/**/*.js",
					"Gruntfile.js"
				]
			}
		},
		urlValidate: {
			dev: {
				src: [
					"public/dev/changelog/entries.json"
				]
			},
			prod: {
				src: [
					"public/prod/changelog/entries.json"
				]
			},
			qa: {
				src: [
					"public/qa/changelog/entries.json"
				]
			}
		}
	});

	grunt.loadNpmTasks("grunt-jsonlint");
	grunt.loadNpmTasks("grunt-eslint");

	grunt.registerMultiTask("urlValidate", "Change Log URL Validation", function() {

		/* eslint no-invalid-this: 0 */

		const filePath = this.filesSrc.toString();
		const done = this.async();
		urlValidate.run(grunt, filePath, done);

	});

	grunt.registerTask("default", [
		"jsonlint",
		"eslint",
		"urlValidate"
	]);

};
