define(function() {
	/**
	 * Converts a given string to a URL
	 *
	 * @param   {String}  str  The string to convert to a URL
	 * @return  {String}       The converted URL
	 */
	return function(str) {
		if (str.indexOf("://") === 0) {
			return "https" + str;
		}
		else if (str.indexOf("data:") === 0 || str.indexOf("filesystem:") === 0 || str.indexOf("blob:") === 0) {
			return str;
		}
		else if (str.indexOf("://") === -1) {
			return "http://" + str;
		}
		else {
			return str;
		}
	};
});