/**
 * Displays a notice to users during the V2 -> V3 upgrade process telling them they need to sign in
 */
define([
	"jquery", "backbone", "browser/api", "modals/alert", "core/auth", "i18n/i18n", "storage/storage", "storage/syncapi"
], function($, Backbone, Browser, Alert, Auth, Translate, Storage, SyncAPI) {
	var View = Backbone.View.extend({
		tagName: "div",
		className: "snackbar sync-signin",

		events: {
			"click button.dismiss": function() {
				delete Browser.storage.showSignInNotice;

				this.remove();
			},

			"click button.signin": function() {
				Alert({
					title: Translate("storage.signin_confirm.title"),
					contents: [Translate("storage.signin_confirm.desc")],
					buttons: {
						negative: Translate("storage.signin_confirm.keep_account"),
						positive: Translate("storage.signin_confirm.keep_local")
					}
				}, function(sendData) {
					SyncAPI.authorize(this._storage, sendData, function() {
						// If the user is Pro, we need to reload so the app initializes properly
						if (Auth.isPro) {
							location.reload();
						}
					}.bind(this));
				}.bind(this));

				delete Browser.storage.showSignInNotice;

				this.remove();
			}
		},

		initialize: function() {
			Storage.on("done", function(storage) {
				this._storage = storage;

				this.$el.html(
					'<span class="text">' + Translate("storage.signin") + '</span>' +
					'<button type="button" class="material flat dismiss">' + Translate("storage.signin_dismiss") + '</button>' +
					'<button type="button" class="material flat green signin">' + Translate("storage.signin_btn") + '</button>'
				).appendTo(document.body);
			}, this);
		}
	});

	return new View();
});