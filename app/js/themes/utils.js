/**
 * The themes controller.  This manages almost everything related to theme usage
 */
define(["lodash", "backbone", "browser/api", "storage/storage", "i18n/i18n"], function(_, Backbone, Browser, Storage, Translate) {
	var Model = Backbone.Model.extend({
		initialize: function() {
			Storage.on("done updated", function(storage) {
				this.set({
					custom: storage.themes,
					cached: storage.cached,
					backgroundImage: storage.settings.backgroundImage
				});
			}, this);
		}
	});


	var themes = {
		model: new Model(),

		defaults: {
			name: Translate("themes.edit.default_name"),
			images: false,
			offline: false,
			time: false,
			rotating: false,
			resolution: false,
			color: "#EEE",
			position: "top center",
			scaling: "cover",
			repeat: "no-repeat",
			fixed: "scroll"
		},

		/**
		 * Gets a theme when given either a theme name or object
		 *
		 * @api    public
		 * @param  {String|Object} theme The theme to retrieve
		 * @return {Object}        The retrieved theme
		 */
		get: function(theme) {
			var defTheme = this.model.get("cached")[0];

			if (((typeof theme === "object" && theme.id) || theme) === "custom") {
				theme = {
					id: "custom",
					image: this.model.get("backgroundImage")
				};
			}
			else if (((typeof theme === "object" && theme.id) || theme) === "default") {
				theme = defTheme;
			}
			else if (typeof theme === "object") {
				theme = (this.model.get("cached")[theme.id] || this.model.get("custom")[(theme.id + "").replace("custom", "")] || theme);
			}
			else {
				theme = (this.model.get("cached")[theme] || this.model.get("custom")[(theme + "").replace("custom", "")] || defTheme);
			}

			return theme;
		},


		/**
		 * Provided with a theme ID or spec, returns the theme's image, which may
		 * be a video.
		 *
		 * @api    public
		 * @param  {String|Object} theme The theme to retrieve the image for
		 * @return {String|Boolean}      The retrieved image or false if it could not be determined
		 */
		getImage: function(theme) {
			var image = false,
				rand;


			if (typeof theme !== "object") {
				theme = this.get(theme);
			}


			if (theme.image || theme.video) {
				image = theme.image || theme.video;

				// When updating a dynamic theme's background image we need to
				// make sure the browser sees a change
				if (image.indexOf("filesystem") === 0) {
					image += "?nocache=" + new Date().getTime();
				}
			}
			else if (theme.images && typeof this.model.get("cached")[theme.id] !== "undefined") {
				switch (theme.type) {
					case "random_daily":
						// Because of the way this is done, all themes will show the same image on different
						// computers on the same day without any centralization!
						rand = Math.sin(new Date().setHours(0, 0, 0, 0)) * 10000;

						image = this.model.get("cached")[theme.images[Math.floor((rand - Math.floor(rand)) * theme.images.length)]].image;
					break;

					case "sunrise_sunset":
						if (!this.SunCalc) {
							/*
								(c) 2011-2014, Vladimir Agafonkin
								SunCalc is a JavaScript library for calculating sun/mooon position and light phases.
								https://github.com/mourner/suncalc

								Modified by Avi Kohn to only include necessary data and functions
							*/
							/* jshint ignore:start */
							this.SunCalc=function(){var g=Math.PI,a=Math.sin,l=Math.cos,v=Math.asin,w=Math.acos,c=g/180,q=23.4397*c,r=[[-6,"dawn","dusk"],
							[6,"gHEnd","gH"]];return function(x,y){var n=c*-y,z=c*x,s=Math.round((new Date).valueOf()/864E5-0.5+2440588-2451545-9E-4-n/(2*g)),h=9E-4
							+(0+n)/(2*g)+s,e=c*(357.5291+0.98560028*h),f;f=c*(1.9148*a(e)+0.02*a(2*e)+3E-4*a(3*e));f=e+f+102.9372*c+g;var t;t=v(a(0)*l(q)+l(0)*a(q)*
							a(f));var h=2451545+h+0.0053*a(e)-0.0069*a(2*f),p={},k,u,m,b,d;k=0;for(u=r.length;k<u;k+=1)m=r[k],b=z,d=t,b=w((a(m[0]*c)-a(b)*a(d))/(l(b)
							*l(d))),d=f,b=2451545+(9E-4+(b+n)/(2*g)+s)+0.0053*a(e)-0.0069*a(2*d),d=h-(b-h),p[m[1]]=new Date(864E5*(d+0.5-2440588)),p[m[2]]=new Date(
							864E5*(b+0.5-2440588));return p}}();
							/* jshint ignore:end */
						}

						var lat = Browser.storage.lat,
							lon = Browser.storage.lon,
							times;

						if (lat && lon) {
							times = this.SunCalc(lat, lon);
						}
						else {
							// If lat and lon aren't set, default to Chicago. This should be roughly accurate for most users.
							times = this.SunCalc(41.85, -87.65);

							// Then attempt to get a location and save, this needs to be here for synced sunrise themes.
							// It can't be in the background page since it needs permissions from the user.
							navigator.geolocation.getCurrentPosition(function(pos) {
								if (pos && pos.coords) {
									Browser.storage.lat = parseFloat(pos.coords.latitude.toFixed(2));
									Browser.storage.lon = parseFloat(pos.coords.longitude.toFixed(2));
								}
							});
						}


						times = [times.dawn.getTime() - 18E5, times.gHEnd.getTime() + 72E5, times.gH.getTime() - 36E5, times.dusk.getTime()];


						var dt = new Date().getTime();

						rand = Math.sin(new Date().setHours(0, 0, 0, 0)) * 10000;


						// If after sunrise start and before sunrise end
						if (dt >= times[0] && dt < times[1]) {
							var sunrise = theme.images.slice(0, theme.groups[0]); // Then slice images at the indicated groups

							image = this.model.get("cached")[sunrise[Math.floor((rand - Math.floor(rand)) * sunrise.length)]].image; // And pick one randomly
						}

						// If after sunrise end and before sunset start
						else if (dt >= times[1] && dt < times[2]) {
							var daytime = theme.images.slice(theme.groups[0], theme.groups[1]);

							image = this.model.get("cached")[daytime[Math.floor((rand - Math.floor(rand)) * daytime.length)]].image;
						}

						// If after sunset start and before sunset end
						else if (dt >= times[2] && dt < times[3]) {
							var sunset = theme.images.slice(theme.groups[1], theme.groups[2]);

							image = this.model.get("cached")[sunset[Math.floor((rand - Math.floor(rand)) * sunset.length)]].image;
						}

						// Otherwise, it's nighttime
						else {
							var nighttime = theme.images.slice(theme.groups[2], theme.groups[3]);

							image = this.model.get("cached")[nighttime[Math.floor((rand - Math.floor(rand)) * nighttime.length)]].image;
						}
					break;

					default:
						image = this.model.get("cached")[theme.images[Math.floor(Math.random() * theme.images.length)]].image;
					break;
				}
			}


			// If an image can't be found, this is probably a preview. Return the
			// remote URL
			if (!image) {
				if (theme.images) {
					image = "https://themes.ichro.me/images/" + theme.images[Math.floor(Math.random() * theme.images.length)] + ".jpg";
				}
				else if ((theme.oType || theme.type) === "video") {
					image = "https://themes.ichro.me/images/" + theme.id + ".mp4";
				}
				else {
					image = "https://themes.ichro.me/images/" + theme.id + ".jpg";
				}
			}

			return image;
		}
	};


	return themes;
});