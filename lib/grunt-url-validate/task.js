/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
"use strict";

// Modules

const lodash = require("lodash");
const async = require("async");
const request = require("request");

// Globals

const ID = "id";
const AUTHOR = "author";
const TITLE = "title";
const DATE = "date";
const MESSAGE = "message";
const IMAGE_URL = "image_url";
const AUTHOR_IMAGE_URL = "author_image_url";
const BLOG_URL = "blog_url";

const REQUIRED_ENTRY_PROPERTIES = [
	ID,
	AUTHOR,
	AUTHOR_IMAGE_URL,
	TITLE,
	DATE,
	MESSAGE,
	IMAGE_URL,
	BLOG_URL
];

const ERROR_BODY_NOT_ARRAY = "JSON body must be a defined Array.";
const ERROR_ENTRY_NOT_OBJECT = "The entry must be a defined Object.";
const ERROR_INVALID_ID = "The 'id' property value is undefined or invalid.";
const ERROR_INVALID_GUID = "The 'id' property value is not a valid GUID.";
const ERROR_INVALID_TITLE = "The 'title' property value is undefined or invalid.";
const ERROR_INVALID_AUTHOR = "The 'author' property value is undefined or invalid.";
const ERROR_INVALID_AUTHOR_IMAGE_URL = "The 'author_image_url' property value must be a syntactically valid URL.";
const ERROR_INSECURE_AUTHOR_IMAGE_URL = "The 'author_image_url' property value must be a secure URL (i.e. HTTPS)";
const ERROR_INVALID_DATE = "The 'date' property value is undefined or invalid.";
const ERROR_INVALID_MESSAGE = "The 'message' property value must be a defined String.";
const ERROR_INVALID_URL_IMAGE = "The 'image_url' property value must be a syntactically valid URL.";
const ERROR_INVALID_URL_BLOG = "The 'blog_url' property value must be a syntactically valid URL.";
const ERROR_INSECURE_URL_IMAGE = "The 'image_url' property value must be a secure URL (i.e. HTTPS)";
const ERROR_EXTRANEOUS_PROPERTIES = "There were extraneous properties found: ";
const ERROR_MISSING_PROPERTY = "An expected property is missing: ";

const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/i;

const secureURLRegex = /^https/;

// Example guid: f81d4fae-7dec-11d0-a765-00a0c91e6bf6
// Format: 		 8-4-4-4-12 hexadecimal digits.

const guidRegEx = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

// Public Methods ------------------------------------------------------------->

module.exports.run = _runTask;

// Private Methods ------------------------------------------------------------>

function _runTask(grunt, filePath, done) {

	grunt.log.writeln(`\nFile: ${filePath}`);

	let entries;

	grunt.log.writeln("\nChecking Change Log JSON syntax...\n");

	try {
		entries = grunt.file.readJSON(filePath);
	} catch (err) {
		grunt.fail.fatal(err.message);
		return;
	}

	grunt.log.writeln("[PASS]\n");

	grunt.log.writeln("Validating Change Log JSON grammar...\n");

	var invalidBlogContent = _validateEntries(entries);
	if (invalidBlogContent) {
		grunt.fail.fatal(invalidBlogContent);
		return;
	}

	grunt.log.writeln("[PASS]\n");

	grunt.log.writeln("Validating Change Log URLs...\n");

	_validateURLs(entries, done, grunt);

}

function _validateEntries(entries) {

	if (!Array.isArray(entries)) {
		return ERROR_BODY_NOT_ARRAY;
	}

	let index = 0;

	for (const entry of entries) {

		index++;

		const invalidEntryFound = _validateEntry(entry, index);

		if (invalidEntryFound) {
			return invalidEntryFound;
		}

	}

	return null;
}

function _validateEntry(entry, index) {

	if (!lodash.isObject(entry)) {
		const prefixNotObj = _getEntryIDText(index, null);
		return prefixNotObj + ERROR_ENTRY_NOT_OBJECT;
	}

	const prefix = _getEntryIDText(index, entry.title);

	for (const property of REQUIRED_ENTRY_PROPERTIES) {
		if (!entry.hasOwnProperty(property)) {
			return prefix + ERROR_MISSING_PROPERTY + property;
		}
	}

	const extraneousProperties = lodash.difference(Object.keys(entry), REQUIRED_ENTRY_PROPERTIES);
	if (extraneousProperties.length > 0) {
		return prefix + ERROR_EXTRANEOUS_PROPERTIES + extraneousProperties.join(", ");
	}

	const entryId = entry[ID];
	const title = entry[TITLE];
	const author = entry[AUTHOR];
	const authorImageUrl = entry[AUTHOR_IMAGE_URL];
	const date = entry[DATE];
	const message = entry[MESSAGE];
	const imageUrl = entry[IMAGE_URL];
	const blogUrl = entry[BLOG_URL];

	if (_isEmptyString(entryId)) {
		return prefix + ERROR_INVALID_ID;
	}

	if (!_isGuidValid(entryId)) {
		return prefix + ERROR_INVALID_GUID;
	}

	if (_isEmptyString(title)) {
		return prefix + ERROR_INVALID_TITLE;
	}

	if (_isEmptyString(author)) {
		return prefix + ERROR_INVALID_AUTHOR;
	}

	if (!_isURL(authorImageUrl)) {
		return prefix + ERROR_INVALID_AUTHOR_IMAGE_URL;
	}

	if (!_isSecureURL(authorImageUrl)) {
		return prefix + ERROR_INSECURE_AUTHOR_IMAGE_URL;
	}

	if (!_isDate(date)) {
		return prefix + ERROR_INVALID_DATE;
	}

	if (_isEmptyString(message)) {
		return prefix + ERROR_INVALID_MESSAGE;
	}

	if (!_isURL(imageUrl)) {
		return prefix + ERROR_INVALID_URL_IMAGE;
	}

	if (!_isSecureURL(imageUrl)) {
		return prefix + ERROR_INSECURE_URL_IMAGE;
	}

	if (!_isURL(blogUrl)) {
		return prefix + ERROR_INVALID_URL_BLOG;
	}

	return null;
}

function _getEntryIDText(index, title) {
	if (title) {
		return `Entry ${index}: '${title}'\n`;
	}
	return `Entry ${index}:\n`;
}

function _isDate(item) {
	const isValidString = !_isEmptyString(item);
	if (!isValidString) {
		return false;
	}

	const date = Date.parse(item);
	if (lodash.isNaN(date)) {
		return false;
	}

	return true;
}

function _isURL(item) {
	const isValidString = !_isEmptyString(item);
	const isUrl = urlRegex.test(item);
	return isValidString && isUrl;
}

function _isSecureURL(url) {
	return secureURLRegex.test(url);
}

function _doesUrlExist(index, title, propertyName, url, callback, grunt) {

	grunt.log.verbose.writeln(`GET ${url}`);

	request(url, function(err, res, body) {

		if (err) {
			const prefix = _getEntryIDText(index, title);
			const message = prefix + `Failed to retrieve content for '${propertyName}' property value: ${url}`;
			callback(new Error(message), null);
			return;
		}

		const status = res.statusCode;

		if (status !== 200) {
			const prefix = _getEntryIDText(index, title);
			const message = prefix +
				`[${status}] Failed to retrieve content for '${propertyName}' property value: ${url}`;
			callback(new Error(message), null);
			return;
		}

		grunt.log.verbose.writeln(`[PASS] ${url}`);

		callback(null, body);
	});

}

function _isEmptyString(str) {
	return !lodash.isString(str) || !(lodash.trim(str).length > 0);
}

function _isGuidValid(guid) {
	return guidRegEx.test(guid);
}

function _validateURLs(entries, done, grunt) {

	const resultsCallback = function(err, results) {
		_handleResults(err, results, done, grunt);
	};

	const asyncTasks = [];
	let index = 0;

	/* eslint no-loop-func: 0 */

	for (const entry of entries) {

		index++;

		const authorImageUrl = entry[AUTHOR_IMAGE_URL];
		const imageUrl = entry[IMAGE_URL];
		const blogUrl = entry[BLOG_URL];
		const title = entry[TITLE];

		asyncTasks.push(function(callback) {
			_doesUrlExist(index, title, AUTHOR_IMAGE_URL, authorImageUrl, callback, grunt);
		});

		asyncTasks.push(function(callback) {
			_doesUrlExist(index, title, IMAGE_URL, imageUrl, callback, grunt);
		});

		asyncTasks.push(function(callback) {
			_doesUrlExist(index, title, BLOG_URL, blogUrl, callback, grunt);
		});

	}

	// TODO: Batch requests (this does not scale performance-wise)

	async.parallel(asyncTasks, resultsCallback);

}

function _handleResults(err, results, done, grunt) {

	if (err) {
		grunt.fail.fatal(err.message);
		return;
	}

	grunt.log.writeln("[PASS]\n");

	done();

}
