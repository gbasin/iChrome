/**
 * Returns the device/user ID.  This is a one-liner, but would otherwise be repeated everywhere, therefore it should be a module.
 */
define(function() {
	return localStorage.uid || (localStorage.uid = (new Date().getTime()).toString(16) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1));
});