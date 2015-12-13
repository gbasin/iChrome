/**
 * This is the custom theme create/edit dialog
 */
define(["lodash", "jquery", "backbone", "core/analytics", "modals/modals", "themes/utils", "themes/cacher", "i18n/i18n", "core/render", "lib/jquery.spectrum"], function(_, $, Backbone, Track, Modal, Utils, Cacher, Translate, render) {
	var Model =  Backbone.Model.extend({
			defaults: function() {
				return _.clone(Utils.defaults);
			}
		}),
		View = Backbone.View.extend({
			el: function() {
				return this.modal.content;
			},


			events: {
				"click .btn.save": "save",
				"click .btn.preview": "preview",
				"change #color, #image, #upload, #position, #scaling, #repeat": "updatePreview",

				"click input:not([type=radio], [type=checkbox]), textarea, select": function(e) {
					if (e.which === 13) {
						this.save(e); // This calls preventDefault
					}
				},
				"change #upload": function() {
					this.$("#image").val("").change();
				}
			},


			/**
			 * Updates the theme preview from the form
			 *
			 * @api    private
			 */
			updatePreview: function() {
				var image = this.$("#image").val(),
					upload,
					next = function(url) {
						this.$(".preview").first().css({
							backgroundColor: this.$("#color").val(),
							backgroundSize: this.$("#scaling").val(),
							backgroundRepeat: this.$("#repeat").val(),
							backgroundAttachment: this.$("#fixed").val(),
							backgroundPosition: this.$("#position").val(),
							backgroundImage: "url(\"" + (url || "") + "\")"
						});
					}.bind(this);

				if (image) {
					next(image);
				}
				else if ((upload = this.$("#upload")[0].files).length) {
					var fr = new FileReader();

					fr.onloadend = function() {
						if (fr.error) {
							next();
						}
						else {
							next(fr.result);
						}
					};

					fr.readAsDataURL(upload[0]);
				}
				else {
					next();
				}
			},


			/**
			 * Serializes the form and triggers a preview event
			 *
			 * @api    private
			 */
			preview: function(e) {
				if (e && e.preventDefault) {
					e.preventDefault();
				}

				var next = function(theme) {
					Track.event("Themes", "Preview", "Custom");

					this.trigger("preview", theme);
				}.bind(this);

				var theme = this.serialize(),
					upload;

				if (!theme.image && (upload = this.$("#upload")[0].files).length) {
					var fr = new FileReader();

					fr.onloadend = function() {
						if (!fr.error) {
							theme.image = fr.result;
						}

						next(theme);
					};

					fr.readAsDataURL(upload[0]);
				}
				else {
					next(theme);
				}
			},


			/**
			 * Saves the theme and destroys the modal, finishing the creation process
			 *
			 * @api    public
			 * @param  {Event|Function} [e] The event to call preventDefault() on or a callback function
			 */
			save: function(e) {
				if (typeof e === "function") {
					var cb = e;
				}
				else if (e && e.preventDefault) {
					e.preventDefault();
				}


				var theme = $.unextend(Utils.defaults, this.serialize()),
					themes = Utils.model.get("custom"),
					editing = typeof this.editing !== "undefined",
					id = (editing ? this.editing : themes.length);


				var next = function(d) {
					theme = d || theme;

					if (editing && themes[this.editing]) {
						Cacher.prototype.model.storage.themes[this.editing] = theme;
					}
					else {
						Cacher.prototype.model.storage.themes.push(theme);
					}

					Cacher.prototype.model.storage.sync();

					Track.event("Themes", (editing ? "Edit" : "Create"), "custom" + id);

					this.trigger("save", theme);

					if (cb) {
						cb();
					}

					this.destroy();
				}.bind(this);


				var upload;

				if (theme.image && typeof theme.image === "string") {
					try { // This is a user-provided URL, anything could happen
						Cacher.Custom.cache(theme, id, next);
					}
					catch(err) {
						alert(Translate("themes.edit.cache_error"));
					}
				}
				else if ((upload = this.$("#upload")[0].files).length) {
					try { // Again, who knows what could go wrong
						Cacher.Custom.saveUpload(theme, upload[0], id, next);
					}
					catch(err) {
						alert(Translate("themes.edit.upload_error"));
					}
				}
				else if (editing) {
					Cacher.Custom.deleteImage(id, next);
				}
				else {
					next();
				}
			},


			/**
			 * Serializes the form into an unextended theme object
			 *
			 * @api    public
			 * @return {Object} The serialized theme
			 */
			serialize: function() {
				var theme = {};

				this.$("form").serializeArray().forEach(function(e) {
					if (e.value) {
						theme[e.name] = e.value;
					}
				});

				return theme;
			},


			/**
			 * Destroys the dialog, modal and model
			 *
			 * @api    public
			 */
			destroy: function() {
				// modal.hide() triggers a destroy which in turn calls this.remove();
				this.modal.hide();
			},


			constructor: function() {
				this.modal = new (Modal.extend({
					destroyOnHide: true,
					classes: "themes create"
				}))().on("destroy", this.remove, this);

				return Backbone.View.apply(this, arguments);
			},


			initialize: function(options) {
				if (options && typeof options.theme === "number") {
					this.model = new Model(Utils.model.get("custom")[options.theme]);

					this.editing = options.theme;
				}
				else {
					this.model = new Model();
				}

				this.render();

				this.modal.mo.appendTo(document.body);

				requestAnimationFrame(this.modal.show.bind(this.modal));
			},

			remove: function() {
				this.$("#color").spectrum("destroy");

				Backbone.View.prototype.remove.call(this);
			},

			render: function() {
				this.$("#color").spectrum("destroy");

				this.$el.html(render("themes.custom", this.model.attributes));

				var preview = this.$(".preview")[0];

				this.$("#color").spectrum({
					showInput: true,
					showAlpha: true,
					showInitial: true,
					showButtons: false,
					preferredFormat: "rgb",
					clickoutFiresChange: true,
					move: _.debounce(function(color) {
						preview.style.backgroundColor = color;
					}, 35, {
						maxWait: 35,
						leading: true,
						trailing: true
					})
				});

				this.$("#repeat").val(this.model.get("repeat"));
				this.$("#scaling").val(this.model.get("scaling"));
				this.$("#position").val(this.model.get("position"));

				this.updatePreview();
			}
		});

	return View;
});