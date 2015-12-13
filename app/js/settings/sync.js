/**
 * The Sync tab in the settings
 */
define([
	"lodash", "jquery", "backbone", "moment", "browser/api", "storage/storage", "i18n/i18n", "storage/syncapi", "modals/alert", "core/render"
], function(_, $, Backbone, moment, Browser, Storage, Translate, SyncAPI, Alert, render) {
	var Model = Backbone.Model.extend({
			save: function(d, cb) {
				if (d.user)		this.storage.user = d.user;
				if (d.tabs)		this.storage.tabs = d.tabs;
				if (d.themes)	this.storage.themes = d.themes;
				if (d.settings)	this.storage.settings = d.settings;

				this.storage.sync(true, cb);
			},
			init: function() {
				Storage.on("done updated", this.update, this);
			},
			update: function(storage) {
				storage = storage || this.storage;

				var backups = _.map(JSON.parse(Browser.storage.backups || "[]"), function(e) {
					return {
						date: e.date,
						label: e.label || moment(e.date).calendar()
					};
				});

				var profile = _.clone(SyncAPI.getInfo());

				if (profile.status && profile.status === "duplicate" && !profile.token) {
					profile.duplicate = true;
				}

				this.storage = storage;

				this.set({
					profile: profile,
					backups: backups,
					user: storage.user,
					themes: storage.themes,
					cached: storage.cached,
					tabsSync: storage.tabsSync,
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
					Alert({
						contents: [Translate("settings.sync.reset_confirm_desc"), Translate("settings.sync.reset_confirm_desc2")],
						confirm: true
					}, function() {
						e.currentTarget.classList.add("resetting");
						e.currentTarget.innerText = Translate("settings.sync.resetting");

						Storage.reset(function() {
							location.reload();
						});
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
				},
				"click .backup button.restore-file": function(e) {
					this.$(".backup input[type=file]").click();
				},

				"click .backup button.backup": "backup",
				"change .backup input[type=file]": "upload",
				"click .backup li button.restore": "restore",
				"click .backup li button.download": "download"
			},
			backup: function(backups, silent) {
				if (!Array.isArray(backups)) {
					backups = JSON.parse(Browser.storage.backups || "[]");

					silent = false;
				}

				backups.unshift({
					date: new Date().getTime(),
					data: {
						syncData: SyncAPI.getInfo(),
						user: this.model.get("user"),
						themes: this.model.get("themes"),
						settings: this.model.get("settings"),
						tabs: this.model.get("tabsSync")
					}
				});

				backups = backups.slice(0, 4);

				Browser.storage.backups = JSON.stringify(backups);
				Browser.storage.lastBackup = new Date().getTime();

				this.model.set("backups", _.map(backups, function(e) {
					return {
						date: e.date,
						label: e.label || moment(e.date).calendar()
					};
				}), {
					silent: silent
				});

				backups = null;
			},
			restore: function(e) {
				Alert({
					contents: [Translate("settings.sync.restore.confirm_desc"), Translate("settings.sync.restore.confirm_desc2")],
					confirm: true
				}, function() {
					try {
						var backups = JSON.parse(Browser.storage.backups || "[]"),
							backup;

						if (typeof e === "string") {
							backup = JSON.parse(e).data;
						}
						else {
							var date = parseInt(e.currentTarget.parentNode.parentNode.getAttribute("data-date"));

							// Pull the backup so we can insert a new one without erasing others
							backup = _.pullAt(backups, _.findIndex(backups, "date", date))[0].data;
						}

						this.backup(backups, true);

						// Make sure that this won't get overwritten by incoming sync data
						backup.modified = new Date().getTime();

						if (backup.syncData) {
							SyncAPI.saveInfo(backup.syncData);

							delete backup.syncData;
						}

						// Calling this.model.set will break the inheritance chain (a change to this.model.settings.search will instantly change all
						// other copies of settings across iChrome) so this needs to be set directly onto the storage object
						this.model.save(backup, function() {
							this.trigger("restore");
						}.bind(this));
					}
					catch(err) {
						Alert(Translate("settings.sync.restore.error"));
					}
				}.bind(this));
			},
			download: function(e) {
				try {
					var date = parseInt(e.currentTarget.parentNode.parentNode.getAttribute("data-date"));

					var backup = _.find(JSON.parse(Browser.storage.backups || "[]"), "date", date);

					var a = document.createElement("a"),
						url = URL.createObjectURL(new Blob([JSON.stringify(backup)], {
							type: "octet/stream"
						}));

					a.href = url;

					a.download = Translate("settings.sync.backup.download_name") + " " + moment(date).format("LL") + ".json";

					a.click();

					URL.revokeObjectURL(url);
				}
				catch(err) {}
			},
			upload: function(e) {
				if (e.currentTarget.files.length) {
					var fr = new FileReader();

					fr.onloadend = function() {
						if (!fr.error) {
							this.restore(fr.result);
						}
					}.bind(this);

					fr.readAsText(e.currentTarget.files[0]);
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