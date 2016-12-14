/**
 * The ads settings page
 */
define([
	"settings/page", "core/auth", "modals/alert", "i18n/i18n", "storage/storage", "storage/syncapi", "settings/checkout"
], function(Page, Auth, Alert, Translate, Storage, SyncAPI, Checkout) {
	var View = Page.extend({
		id: "ads",

		events: {
			"click button.upgrade": function() {
				if (!Auth.isSignedIn) {
					Alert({
						confirm: true,
						title: Translate("settings.ads.signin"),
						contents: [Translate("settings.ads.signin_desc")],
						buttons: {
							positive: Translate("settings.ads.signin_btn")
						}
					}, function() {
						Alert({
							title: Translate("storage.signin_confirm.title"),
							contents: [Translate("storage.signin_confirm.desc")],
							buttons: {
								negative: Translate("storage.signin_confirm.keep_account"),
								positive: Translate("storage.signin_confirm.keep_local")
							}
						}, function(sendData) {
							Storage.on("done", function(storage) {
								SyncAPI.authorize(storage, sendData, function() {
									if (Auth.isPro) {
										location.reload();
									}
									else {
										new Checkout("adfree");
									}
								});
							});
						});
					});

					return;
				}

				new Checkout("adfree");
			},
		},

		dynamicControls: {
			adPlacement: "adPlacement"
		},

		monitorProps: ["adPlacement"],

		/**
		 * General input change handler
		 *
		 * @param   {HTMLElement}  elm    The input element
		 * @param   {String}       name   The name of the input
		 * @param   {String}       value  The value of the input
		 */
		onInputChange: function(elm, name, value) {
			switch (name) {
				case "adPlacement":
					this.model.set("adPlacement", value, {
						noRender: true
					});
				break;
			}
		},

		onBeforeRender: function(data) {
			return {
				adFree: Auth.adFree,

				// Ad placement
				adPlacement: data.adPlacement
			};
		}
	});

	return View;
});