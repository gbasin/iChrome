/**
 * Configure requireJS.
 */
require.config({
	// default path to load JS files.
	baseUrl: '/js',
	paths: {
		// where to load modules starting with "app/"
		'app': '/js/app',
		// where to load oauth2
		'oauth2': '/oauth2/oauth2'
	}});

/**
 * Load these modules using the paths from above.
 */
require(["plugins","oauth2","widgets","app/script"]);