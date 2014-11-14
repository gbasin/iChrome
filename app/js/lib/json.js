/** @license
 * RequireJS plugin for loading JSON files
 * - depends on Text plugin and it was HEAVILY "inspired" by it as well.
 * Author: Miller Medeiros
 * Modified by Avi Kohn to remove unnecessary code and to fix formatting
 * Version: 0.4.1 (2014/11/11)
 * Released under the MIT license
 */
define(["text"], function(text) {
	var buildMap = {};

	return {
		load: function(name, req, onLoad, config) {
			if (config.isBuild && !config.inlineJSON) {
				onLoad();
			}
			else {
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
			}
		},

		// write method based on RequireJS official text plugin by James Burke
		// https://github.com/jrburke/requirejs/blob/master/text.js
		write: function(pluginName, moduleName, write) {
			if (moduleName in buildMap){
				var content = buildMap[moduleName];
				write('define("'+ pluginName +'!'+ moduleName +'", function(){ return '+ content +';});\n');
			}
		}
	};
});