/**
 * The Sync tab in the settings
 */
define(["lodash", "jquery", "backbone", "moment", "storage/storage", "i18n/i18n", "storage/syncapi", "modals/alert", "core/render"], function(_, $, Backbone, moment, Storage, Translate, SyncAPI, Alert, render) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", this.update, this);
			},
			update: function(storage) {
				storage = storage || this.storage;

				var profile = _.clone(SyncAPI.getInfo());

				if (profile.status && profile.status === "duplicate" && !profile.token) {
					profile.duplicate = true;
				}

				this.storage = storage;

				this.set({
					profile: profile,
					themes: storage.themes,
					cached: storage.cached,
					settings: storage.settings,
					lastSync: moment(storage.modified).format("MMMM Do, YYYY h:mm A")
				});
			}
		}),
		View = Backbone.View.extend({
			tagName: "div",
			className: "tab sync",
			events: {
				"click .reset": function(e) {
					e.currentTarget.classList.add("resetting");
					e.currentTarget.innerText = Translate("settings.sync.resetting");

					if (!confirm(Translate("settings.sync.reset_confirm"))) {
						return;
					}

					Storage.reset(function() {
						location.reload();
					});	
				},
				"click .sync-now": function(e) {
					e.currentTarget.classList.add("syncing");
					e.currentTarget.innerText = Translate("settings.sync.syncing");

					this.save();

					this.model.storage.sync(true, function() {
						this.model.update();

						this.render();
					}.bind(this), {}, true);
				},
				"click #signin": function(e) {
					Alert({
						title: Translate("settings.sync.keep_data"),
						contents: [Translate("settings.sync.keep_data_desc")],
						buttons: {
							negative: Translate("settings.sync.keep_theirs"),
							positive: Translate("settings.sync.keep_local")
						}
					}, function(sendData) {
						SyncAPI.authorize(this.model.storage, sendData, function(err, res) {
							this.model.update();

							this.render();
						}.bind(this));
					}.bind(this));
				}
			},
			initialize: function() {
				this.model = new Model();

				this.model.on("change", this.render, this).init();
			},
			save: function() {
				var syncInfo = SyncAPI.getInfo();

				syncInfo.user.fname = this.$("#fname").val();
				syncInfo.user.lname = this.$("#lname").val();

				syncInfo.user.email = this.$("#email").val();

				this.model.storage.user = syncInfo.user;

				SyncAPI.saveInfo(syncInfo);
			},
			render: function() {
				this.$el.html(render("settings/sync", this.model.toJSON()));

				return this;
			}
		});

	return View;
});