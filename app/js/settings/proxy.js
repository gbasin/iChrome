/**
 * Proxies the settings view to avoid even initializing the entire settings stack until necessary
 */
define(function() {
	var proxy = function(page) {
		if (this.Settings) {
			return this.Settings(page);
		}
		else {
			getSettings(function() {
				this.Settings(page);
			}.bind(this));
		}
	};

	var getSettings = proxy.getSettings = function(cb) {
		if (this.Settings) {
			return cb(this.Settings);
		}

		require(["settings/view"], function(View) {
			this.Settings = View;

			if (typeof cb === "function") {
				cb(this.Settings);
			}
		}.bind(this));
	};

	return proxy;
});