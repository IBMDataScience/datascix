/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

module.exports = function(grunt) {

	grunt.initConfig({
		jsonlint: {
			changelog: {
				src: [
					"public/**/*.json",
					"package.json"
				]
			}
		}
	});

	grunt.loadNpmTasks("grunt-jsonlint");

	grunt.registerTask("default", ["jsonlint"]);

};
