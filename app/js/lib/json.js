/** @license
 * Modified RequireJS plugin for loading JSON files
 * Author: Miller Medeiros
 * Version: 0.4.1 (2014/11/11)
 * Released under the MIT license
 */
define(["text"], function(text) {
	var buildMap = {};

	return {
		load: function(name, req, onLoad, config) {
			text.get(
				req.toUrl(name),
				function(data) {
					if (config.isBuild) {
						buildMap[name] = data;

						onLoad(data);
					}
					else {
						onLoad(JSON.parse(data));
					}
				},
				onLoad.error
			);
		},

		write: function(pluginName, moduleName, write) {
			if (moduleName in buildMap) {
				write('define("'+ pluginName +'!'+ moduleName +'",' + buildMap[moduleName] + ');\n');
			}
		}
	};
});