/**
 * This creates a basic global API so all modules using the HTML5 FileSystem can have a centralized config
 */
define(function() {
	var get = function(cb, err) {
		window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) { // This can't be cached because FileSystem objects get "stale"
			cb(fs);
		}, err || function() {});
	};

	get.get = function(cb, err) { // Try to avoid circular references
		return get(cb, err);
	};

	return get;
});