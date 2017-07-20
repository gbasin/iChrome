/**
 * The widget settings dialog
 */
define([
	"jquery", "lodash", "backbone", "core/auth", "storage/storage", "i18n/i18n", "core/analytics", "core/status", "modals/modals", "widgets/registry", "widgets/settings/inputs", "core/render", "jquery.serializejson", "lib/jquery.spectrum"
], function($, _, Backbone, Auth, Storage, Translate, Track, Status, Modal, Registry, inputs, render) {
	var modal = Modal.extend({
		width: 400,
		height: 535,
		destroyOnHide: true,
		classes: "widget-settings"
	});


	/**
	 * If the control key is down, used by number inputs
	 *
	 * @type {Boolean}
	 */
	var ctrlDown = false;


	var view = Backbone.View.extend({
		events: {
			"click .btn.save": "save",
			"keydown input, select": function(e) {
				if (e.which === 13) {
					this.save(e);
				}
			},
			"keydown textarea": function(e) {
				if (e.which === 13 && e.shiftKey) {
					this.save(e);
				}
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

			// Number
			"keydown input[type=number]": function(e) {
				if (e.keyCode === 17) {
					ctrlDown = true;
				}

				return	ctrlDown ||
						((e.keyCode > 47 && e.keyCode < 58) ||
						(e.keyCode > 36 && e.keyCode < 41) ||
						(e.keyCode > 95 && e.keyCode < 106) ||
						e.keyCode === 8 ||
						e.keyCode === 9 ||
						e.keyCode === 46 ||
						e.keyCode === 17 ||
						e.keyCode === 65);
			},
			"keyup input[type=number]": function(e) {
				if (e.keyCode === 17) {
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
				else if (!input.valueAsNumber && input.value !== "") {
					input.value = input.min;
				}
			}
		},

		save: function(e) {
			if (e && e.preventDefault) {
				e.preventDefault();
			}

			this.off("sizeChange");

			var set = {
					config: {}
				},
				settings = this.$("form").serializeJSON();


			// jQuery.serializeJSON() doesn't parse multiple selects correctly
			this.$("select[multiple]").each(function() {
				settings[this.name] = $(this).val();
			});


			// This is assigned so custom properties that widgets add to their config are
			// preserved (such as woeid and woeloc on the Weather widget)
			_.assign(set.config, this.config, settings);


			var defaultConfig = ((this.widget.model && this.widget.model.prototype.defaults) || this.widget.widget).config;

			// This ensures that now-empty properties are still present in the
			// settings object and override existing values
			_.assign(set.config, _(defaultConfig)
				.pick(_.difference(_.keys(defaultConfig), _.keys(set.config)))
				.mapValues(function(e) {
					// If it's a string then it must be empty
					if (typeof e === "string") {
						return "";
					}

					// If it's boolean and not present it must have been an
					// unchecked checkbox and therefore false
					else if (typeof e === "boolean") {
						return false;
					}

					// If it was an array/list input that didn't have anything
					// selected it wouldn't be present either
					else if (Array.isArray(e)) {
						return [];
					}

					// If it's none of the above, we'll assume it was an object
					else {
						return {};
					}
				})
				.valueOf()
			);


			if (set.config.size) {
				set.size = set.config.size;

				delete set.config.size;
			}


			// This deletes properties that are only applicable at other sizes,
			// such as the team field on the Sports widget.
			_.each(this.widget.settings, function(e) {
				if (e.sizes && e.sizes.indexOf(set.size || this.model.get("size")) === -1) {
					delete set.config[e.name || e.nicename];
				}
			}, this);


			this.modal.hide();

			Track.FB.logEvent("WidgetConfigure", null, { widgetId: this.widget.name });

			Track.event("Widgets", "Configure", this.widget.name);


			// We assign directly to the actual widget instance, thereby allowing
			// any default-removal code to run
			if (this.instance.widgetModel) {
				this.instance.widgetModel.set(set);
			}
			else if (this.instance.instance) {
				this.instance.instance.config = set.config;

				this.instance.instance.size = this.instance.instance.config.size = set.size;

				this.instance.updateModel();

				this.instance.instance.render();

				if (this.instance.instance.refresh) {
					this.instance.instance.refresh();
				}
			}
		},

		show: function() {
			this.modal.show();

			Track.pageview("/widget/" + this.widget.name + "/settings");
		},

		constructor: function() {
			this.modal = new modal();

			this.modal.on("destroy", function() {
				this.$("input.color").spectrum("destroy");
			}, this).on("hide", function() {
				this.trigger("hide");
			}, this);

			this.modal.mo.appendTo(document.body);

			this.el = this.modal.content;

			return Backbone.View.apply(this, arguments);
		},


		initialize: function(options) {
			_.assign(this, _.pick(options, "widget", "model", "instance", "config"));

			// This is the target that should be searched when a function is
			// used as the value for a function
			this.fnTarget = this.instance.widgetModel || this.instance.instance;

			this.render();

			requestAnimationFrame(this.show.bind(this));
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

			var translate = _.bind(function(val) {
				if (val && val.slice(0, 5) === "i18n.") {
					return this.widget.translate(val.slice(5));
				}

				return val;
			}, this);

			_.each(this.widget.settings, function(e) {
				if (!e.type || !inputs[e.type]) {
					return;
				}

				var input = _.clone(e);

				// Legacy widgets use `nicename` instead of `name`
				input.name = input.name || input.nicename;

				// Translate user-visible attributes
				input.help = translate(input.help);
				input.label = translate(input.label);
				input.placeholder = translate(input.placeholder);


				var elm = $('<div class="form-group' + (input.pro ? " pro" : "") + '"></div>');


				if (input.pro && !Auth.isPro) {
					input.proHelper = "disabled";
				}


				if (input.sizes) {
					elm.toggleClass("hidden", input.sizes.indexOf(this.model.get("size")) === -1);

					this.on("sizeChange", function(size) {
						elm.toggleClass("hidden", input.sizes.indexOf(size) === -1);
					}, this);
				}


				if (typeof this.config[input.name] !== "undefined") {
					input.value = this.config[input.name];
				}


				try {
					inputs[input.type](input, elm, translate, this, form);

					// By inserting the element now, we let the inputs work on a
					// detached element and ensure that async inputs stay in order
					elm.appendTo(form);
				}
				catch (err) {
					Track.queue("widgets", "error", this.widget.name, this.model.get("size"), "settings", err.stack);

					Status.error(err);
				}
			}, this);
		},


		render: function() {
			this.$el.html(render("widget-settings"));

			this.createForm();

			return this;
		}
	});

	return view;
});