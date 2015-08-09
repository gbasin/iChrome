/**
 * This creates a basic global API so all modules using the HTML5 FileSystem can have a centralized config
 */
define(function() {
	/**
	 * Requests and asynchronously returns a FileSystem instance.
	 *
	 * @api     public
	 * @param   {Function}  cb
	 * @param   {Function}  err  The error callback
	 */
	var get = function(cb, err) {
		window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) { // This can't be cached because FileSystem objects get "stale"
			cb(fs);
		}, err || function() {});
	};


	/**
	 * Proxies the get method.  Returns a FileSystem instance.
	 *
	 * @api     public
	 * @param   {Function}  cb
	 * @param   {Function}  err  The error callback
	 */
	get.get = function(cb, err) { // Try to avoid circular references
		return get(cb, err);
	};


	/**
	 * Clears the FileSystem store
	 *
	 * @api     public
	 * @param   {Function}  cb    The callback
	 * @param   {Function}  oErr  The error callback
	 */
	get.clear = function(cb, oErr) {
		var err = function(err) {
			if (typeof oErr == "function") {
				oErr.apply(this, err);
			}
			else {
				cb(true, err);
			}
		};

		get(function(fs) {
			var reader = fs.root.createReader(),
				length = 0;

			(function read() { // Recursive and self executing, necessary as per the specs
				reader.readEntries(function(results) {
					if (results.length) {
						results.forEach(function(e, i) {
							length++;

							if (e.isDirectory) {
								e.removeRecursively(function() {
									length--;

									if (!length) {
										cb();
									}
								});
							}
							else {
								e.remove(function() {
									length--;

									if (!length) {
										cb();
									}
								});
							}
						});

						read();
					}
					else if (!length) {
						cb();
					}
				}, err);
			})();
		}, err);
	};

	return get;
});