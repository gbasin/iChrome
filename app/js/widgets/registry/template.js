/**
 * This is a RequireJS plugin for widget templates
 */
define(["hogan", "text"], function(Hogan, text) {
	var buildMap = {};

	return {
		load: function(name, req, onLoad, config) {
			text.get(req.toUrl(name), function(data) {
				if (config.isBuild) {
					buildMap[name] = Hogan.compile(data, { asString: true });
				}

				onLoad(Hogan.compile(data));
			});
		},

		write: function(plugin, module, write) {
			if (module in buildMap) {
				write('define("' + plugin + '!' + module + '",["hogan"],function(h){return new h.Template(' + buildMap[module] + ')});');
			}
		}
	};
});