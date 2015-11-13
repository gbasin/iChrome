/**
 * Inputs for the widget settings view
 */
define(["jquery", "lodash", "i18n/i18n", "core/render", "lib/jquery.spectrum"], function($, _, Translate, render) {
	var sizeMap = {
		tiny: Translate("widgets.sizes.tiny"),
		small: Translate("widgets.sizes.small"),
		medium: Translate("widgets.sizes.medium"),
		large: Translate("widgets.sizes.large"),
		variable: Translate("widgets.sizes.variable")
	};


	/**
	 * The input fields and types
	 *
	 * @type {Object}
	 */
	var inputs = {
		text: function(input, elm) {
			input.value = _.result(input, "value");

			elm.html(render("widget-settings.inputs", {
				"input-text": _.pick(input, "name", "label", "proHelper", "value", "help", "placeholder")
			}));
		},
		textarea: function(input, elm) {
			input.value = _.result(input, "value");

			elm.html(render("widget-settings.inputs", {
				"input-textarea": _.pick(input, "name", "label", "proHelper", "value", "help", "placeholder")
			}));
		},
		color: function(input, elm) {
			input.value = _.result(input, "value");

			elm.html(render("widget-settings.inputs", {
				"input-color": _.pick(input, "name", "label", "proHelper", "value", "help")
			})).find("input.color").spectrum({
				showInput: true,
				showAlpha: true,
				showInitial: true,
				showButtons: false,
				preferredFormat: "rgb",
				clickoutFiresChange: true
			});
		},
		select: function(input, elm, translate, settings, form) {
			var loop = function(options, level) {
				level = level || 0;
				
				var nesting = "&nbsp;".repeat(4 * level),
					values = (typeof input.value == "object" ? input.value : [input.value]) || [];

				var ret = [];

				// Labels need to be first in the list
				if (options.label) {
					ret.push({
						group: translate(options.label),
						nesting: "&nbsp;".repeat(4 * ((level || 1) - 1))
					});
				}

				return _.compact(ret.concat(_.map(options, function(e, key) {
					if (key == "label") {
						return false;
					}
					else if (typeof e == "object") {
						return loop(e, level + 1);
					}
					else {
						return {
							label: translate(e),
							value: key,
							nesting: nesting,
							selected: (values.indexOf(key) !== -1 ? "selected" : "")
						};
					}
				})));
			};


			var data = _.pick(input, "name", "label", "proHelper", "help", "multiple");

			if (data.multiple) {
				data.multiple = "multiple";
			}


			if (typeof input.options == "string" && typeof settings.fnTarget[input.options] == "function") {
				// Only function values can be chained
				if (typeof input.chained == "string") {
					var cb = function(val) {
						settings.fnTarget[input.options](function(options) {
							var val = elm.find("select").val();

							data.options = _.flatten(loop(options), true);

							elm.html(render("widget-settings.inputs", {
								"input-select": data
							}));

							if (val) {
								elm.find("select").val(val);
							}
						}, val);
					};

					if (settings.config[input.chained]) cb(settings.config[input.chained]);

					form.on("change", "#widget-" + input.chained, function() {
						cb($(this).val());
					});
				}
				else {
					settings.fnTarget[input.options](function(options) {
						data.options = _.flatten(loop(options), true);

						elm.html(render("widget-settings.inputs", {
							"input-select": data
						}));
					});
				}
			}
			else {
				data.options = _.flatten(loop(input.options), true);

				elm.html(render("widget-settings.inputs", {
					"input-select": data
				}));
			}
		},
		list: function(input, elm) {
			var data = _.pick(input, "name", "label", "proHelper", "help", "placeholder");

			data.items = _.map(input.value, function(e, key) {
				if (typeof e == "object") {
					return {
						color: (input.color ? (e.color || "#EEE") : false),
						value: e.name
					};
				}
				else {
					return {
						value: e
					};
				}
			});

			elm.addClass("list").html(render("widget-settings.inputs", {
				"input-list": data
			})).on("keydown", "input#widget-" + input.name, function(e) {
				if (e.which == 13) {
					e.preventDefault();
					e.stopPropagation();


					elm.find(".items").append(render("widget-settings.inputs", {
						"input-list-item": {
							value: $(this).val(),
							name: input.name,
							color: (input.color ? "#EEE" : false)
						}
					})).find("input.color:last").spectrum({
						showInput: true,
						showAlpha: true,
						showInitial: true,
						showButtons: false,
						preferredFormat: "rgb",
						clickoutFiresChange: true
					});


					$(this).val("");
				}
			}).find("input.color").spectrum({
				showInput: true,
				showAlpha: true,
				showInitial: true,
				showButtons: false,
				preferredFormat: "rgb",
				clickoutFiresChange: true
			});
		},
		size: function(input, elm, translate, settings) {
			var sizes = settings.widget.sizes,
				selected = settings.model.get("size") || (settings.widget.manifest && settings.widget.manifest.defaultSize) || sizes[0].toLowerCase();

			sizes = sizes.map(function(e) {
				return {
					size: e,
					selected: (e == selected ? "selected" : ""),
					name: sizeMap[e]
				};
			});

			elm.html(render("widget-settings.inputs", {
				"input-size": {
					sizes: sizes
				}
			}));
		},
		radio: function(input, elm, translate) {
			var data = _.pick(input, "name", "label", "proHelper", "help");

			data.options = _.map(input.options, function(e, key) {
				return {
					value: key,
					label: translate(e),
					checked: (key == input.value ? "checked" : "")
				};
			});

			elm.html(render("widget-settings.inputs", {
				"input-radio": data
			}));
		},
		number: function(input, elm) {
			input.value = _.result(input, "value");

			elm.html(render("widget-settings.inputs", {
				"input-number": _.pick(input, "name", "label", "proHelper", "min", "max", "value", "help", "placeholder")
			}));
		},
		time: function(input, elm) {
			input.value = _.result(input, "value");

			elm.html(render("widget-settings.inputs", {
				"input-time": _.pick(input, "name", "label", "proHelper", "value", "help", "placeholder")
			}));
		}
	};

	return inputs;
});