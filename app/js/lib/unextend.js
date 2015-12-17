define(function() {
	/**
	 * Given the same input as $.extend, undoes the $.extend operation
	 *
	 * @param   {Object}  obj1
	 * @param   {Object}  obj2
	 * @return  {Object}        The unextended object
	 */
	var unextend = function(obj1, obj2) {
		var newObj = {};

		for (var k in obj2) {
			var e = obj2[k],
				c = obj1[k];

			if (typeof e === "undefined") {
				continue;
			}
			else if (typeof c === "undefined") {
				newObj[k] = e;
			}
			else if (e === null) {
				newObj[k] = e;
			}
			else if (typeof e === "object" && typeof e.length === "number" && JSON.stringify(e) !== JSON.stringify(c)) {
				newObj[k] = e;
			}
			else if (typeof e === "object" && typeof e.length === "undefined" && JSON.stringify(e) !== JSON.stringify(c)) {
				newObj[k] = unextend(c, e);
			}
			else if (e.toString() !== c.toString()) {
				newObj[k] = e;
			}
		}

		return newObj;
	};

	return unextend;
});