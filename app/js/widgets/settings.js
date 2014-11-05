/**
 * The widget settings dialog
 */
define(
	["jquery", "lodash", "backbone", "storage/storage", "core/analytics", "core/status", "modals/modals", "widgets/widgets", "core/templates", "jquery.serializejson", "lib/jquery.spectrum"],
	function($, _, Backbone, Storage, Track, Status, Modal, Widgets, render) {
		var modal = new (Modal.extend({
				width: 400,
				height: 535,
				classes: "widget-settings"
			}));

		// The modal will be shared between all widget settings, therefore it should be
		// appended to the body now instead of each time a new settings instance is created
		modal.mo.appendTo(document.body);
		

		/**
		 * The input fields and types
		 *
		 * @type {Object}
		 */
		var inputs = {
			text: function(input, elm) {
				input.value = _.result(input, "value");

				elm.html(render("widget-settings.inputs", {
					"input-text": _.pick(input, "nicename", "label", "value", "help", "placeholder")
				}));
			},
			select: function(input, elm, widget, form) {
				var loop = function(options, level) {
					var nesting = "&nbsp;".repeat(4 * (level || 0)),
						values = (typeof input.value == "object" ? input.value : [input.value]);

					return _.map(options, function(e, key) {
						if (key == "label") {
							return {
								group: e,
								nesting: nesting
							};
						}
						else {
							return {
								label: e,
								value: key,
								nesting: nesting,
								selected: (values.indexOf(key) !== -1 ? "selected" : "")
							};
						}
					});
				};


				var data = _.pick(input, "nicename", "label", "help", "multiple");

				if (data.multiple) {
					data.multiple = "multiple";
				}


				if (typeof input.options == "string" && typeof widget[input.options] == "function") {
					// Only function values can be chained
					if (typeof input.chained == "string") {
						var cb = function(val) {
							widget[input.options].call(widget, function(options) {
								var val = elm.find("select").val();

								data.options = _.flatten(loop(options));

								elm.html(render("widget-settings.inputs", {
									"input-select": data
								}));

								if (val) {
									elm.find("select").val(val);
								}
							}, val);
						};

						if (widget.config[input.chained]) cb(widget.config[input.chained]);

						form.on("change", "#widget-" + input.chained, function() {
							cb($(this).val());
						});
					}
					else {
						widget[input.options].call(widget, function(options) {
							data.options = _.flatten(loop(options));

							elm.html(render("widget-settings.inputs", {
								"input-select": data
							}));
						});
					}
				}
				else {
					data.options = _.flatten(loop(input.options));

					elm.html(render("widget-settings.inputs", {
						"input-select": data
					}));
				}
			},
			list: function(input, elm, widget) {
				var data = _.pick(input, "nicename", "label", "help", "placeholder");

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
				})).on("keydown", "input#widget-" + input.nicename, function(e) {
					if (e.which == 13) {
						e.preventDefault();
						e.stopPropagation();


						elm.find(".items").append(render("widget-settings.inputs", {
							"input-list-item": {
								value: $(this).val(),
								nicename: input.nicename,
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
			size: function(input, elm, widget) {
				var sizes = widget.sizes,
					selected = widget.config.size || sizes[0].toLowerCase();

				if (sizes.indexOf("all") !== -1) {
					sizes = ["tiny", "small", "medium", "large"];
				}

				sizes = sizes.map(function(e) {
					return {
						size: e,
						selected: (e == selected ? "selected" : ""),
						name: e.slice(0, 1).toUpperCase() + e.slice(1).toLowerCase()
					};
				});

				elm.html(render("widget-settings.inputs", {
					"input-size": {
						sizes: sizes
					}
				}));
			},
			radio: function(input, elm) {
				var data = _.pick(input, "nicename", "label", "help");

				data.options = _.map(input.options, function(e, key) {
					return {
						label: e,
						value: key,
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
					"input-number": _.pick(input, "nicename", "label", "min", "max", "value", "help", "placeholder")
				}));
			},
			time: function(input, elm) {
				input.value = _.result(input, "value");

				elm.html(render("widget-settings.inputs", {
					"input-time": _.pick(input, "nicename", "label", "value", "help", "placeholder")
				}));
			}
		};



		/**
		 * If the control key is down, used by number inputs
		 *
		 * @type {Boolean}
		 */
		var ctrlDown = false;


		var view = Backbone.View.extend({
			el: modal.content,

			events: {
				"click .btn.save": "save",
				"keydown input, textarea, select": function(e) {
					if (e.which == 13) this.save(e);
				},

				/**
				 * Input Events
				 */
				
				// Size
				"change #widget-size": function() {
					this.trigger("sizeChange", this.$("#widget-size").val());
				},
				
				// List
				"click .list .tools span": function(e) {
					var t = $(e.currentTarget),
						p = t.parents(".item").first();

					if (t.hasClass("up")) {
						p.insertBefore(p.prev());
					}
					else if (t.hasClass("down")) {
						p.insertAfter(p.next());
					}
					else if (t.hasClass("delete")) {
						p.slideUp(function() {
							p.remove();
						});
					}
				},
				// This has to be defined inside the render function since it needs to re-rended the element
				// "keydown .list input"

				// Number
				"keydown input[type=number]": function(e) {
					if (e.keyCode == 17) {
						ctrlDown = true;
					}

					return	ctrlDown ||
							((e.keyCode > 47 && e.keyCode < 58) ||
							(e.keyCode > 36 && e.keyCode < 41) ||
							(e.keyCode > 95 && e.keyCode < 106) ||
							e.keyCode == 8 ||
							e.keyCode == 9 ||
							e.keyCode == 46 ||
							e.keyCode == 17 ||
							e.keyCode == 65);
				},
				"keyup input[type=number]": function(e) {
					if (e.keyCode == 17) {
						ctrlDown = false;
					}
				},
				"blur input[type=number]": function(e) {
					var input = e.currentTarget;

					if (input.valueAsNumber && input.valueAsNumber > input.max) {
						input.value = input.max;
					}
					else if (input.valueAsNumber && input.valueAsNumber < input.min) {
						input.value = input.min;
					}
					else if (!input.valueAsNumber && input.value != "") {
						input.value = input.min;
					}
				}
			},


			save: function(e) {
				if (e && e.preventDefault) {
					e.preventDefault();
				}

				this.off("sizeChange");

				var settings = this.$("form").serializeJSON(),
					sizes = {
						tiny: 1,
						small: 2,
						medium: 3,
						large: 4,
						variable: 5
					}, key;

				if (settings.size && this.widget.config.size && this.widget.config.size !== settings.size) {
					this.widget.elm.attr("class", "widget " + this.widget.nicename + " " + settings.size).attr("data-size", settings.size);

					this.widget.size = sizes[settings.size];
					this.widget.utils.size = settings.size;
				}


				// jQuery.serializeJSON() doesn't parse multiple selects correctly
				this.$("select[multiple]").each(function() {
					settings[this.name] = $(this).val();
				});


				// This ensures that things like now-empty lists will still be overwritten
				_.assign(settings, _(Widgets[this.widget.id].config)
					.pick(_.difference(_.keys(Widgets[this.widget.id].config), _.keys(settings), ["size"]))

					// And this makes sure that they won't be set to the default even if they aren't present, i.e.
					// a list of sample labels that's now empty
					.mapValues(function(e, key) {
						// If it's a string then it must be empty
						if (typeof e == "string") {
							return "";
						}

						// If it's boolean and not present it must have been an unchecked checkbox (not implemented yet)
						else if (typeof e == "boolean") {
							return false;
						}

						// If it was an array/list input that didn't have anything selected it wouldn't be present either
						else if (Array.isArray(e)) {
							return [];
						}

						// If it's none of the above, assume it was an object
						else {
							return {};
						}
					})
					.valueOf()
				);


				// This is assigned so custom properties that widgets add to their config are
				// preserved (such as woeid and woeloc on the Weather widget)
				_.assign(this.widget.config, settings);


				// This deletes properties that are only for other sizes, such as the team field in
				// the Sports widget which if present on a variable sized widget would cause an error
				_.each(this.widget.settings, function(e) {
					if (e.sizes && e.sizes.indexOf(this.widget.config.size || this.widget.sizes[0].toLowerCase()) == -1) {
						delete this.widget.config[e.nicename];
					}
				}, this);
				

				if (this.widget.refresh) this.widget.refresh.call(this.widget, true);
				else this.widget.render.call(this.widget);

				this.widget.utils.save();

				modal.hide();
			},

			show: function() {
				this.render();

				modal.show();
			},

			initialize: function(opts) {
				this.widget = opts.widget;
			},


			/**
			 * This converts the JSON settings specification to an HTML form, since some of
			 * the inputs might have async functions it needs to create each field and run it's
			 * handler instead of just rendering the whole thing all at once.
			 *
			 * @api    private
			 */
			createForm: function() {
				var form = this.$("form");

				if (Array.isArray(this.widget.settings)) {
					_.each(this.widget.settings, function(input, i) {
						if (inputs[input.type]) {
							// It might be faster to send a detached element to the handler, but
							// the order might get messed up if it's async
							var elm = $('<div class="form-group"></div>');

							if (input.sizes) {
								elm.toggleClass("hidden", input.sizes.indexOf(this.widget.config.size || this.widget.sizes[0].toLowerCase()) == -1);

								this.on("sizeChange", function(size) {
									elm.toggleClass("hidden", input.sizes.indexOf(size) == -1);
								}, this);
							}

							// This needs to be typeof because the value might be false
							if (typeof this.widget.config[input.nicename] !== "undefined") {
								input.value = this.widget.config[input.nicename];
							}

							try {
								inputs[input.type](input, elm, this.widget, form);

								// This being here ensures that sync code run inside the handler can execute on
								// a detached element and that the order will stay the same for async handlers
								elm.appendTo(form);
							}
							catch (e) {
								Status.error(e);
							}
						}
					}, this);
				}
			},

			render: function() {
				this.$el.html(render("widget-settings"));

				this.createForm();

				return this;
			}
		});

		return view;
	}
);