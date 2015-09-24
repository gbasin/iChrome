/**
 * Implements a cross-browser core API
 */
define(["browser/chrome"], function(Chrome) {
	// Browser API modules return false if an invalid environment is detected
	if (Chrome) {
		return Object.freeze(Chrome);
	}
	else {
		throw new Error("Unknown environment");
	}
});