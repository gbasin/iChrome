/*
 * The Youtube widget.
 */
define(["jquery"], function($) {
	return {
		id: 29,
		size: 6,
		order: 7.5,
		name: "YouTube",
		interval: 300000,
		nicename: "youtube",
		sizes: ["variable"],
		desc: "Displays either popular videos or videos from a specified user.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "select",
				nicename: "view",
				label: "Format",
				options: {
					large: "One large",
					large_2: "One large, two small",
					large_4: "One large, four small",
					four: "Four small",
					six: "Six small"
				}
			},
			{
				type: "text",
				nicename: "user",
				label: "Show Videos From",
				help: "This must be an <b>exact</b> username as shown in the URL of the page when you're viewing their profile.<br /><br />This value never includes spaces.",
				placeholder: "Leave blank to show Top Videos"
			},
			{
				type: "radio",
				nicename: "target",
				label: "Open search results in",
				options: {
					_self: "The current tab",
					_blank: "A new tab"
				}
			}
		],
		config: {
			title: "YouTube",
			size: "variable",
			view: "large_2",
			target: "_blank",
			user: ""
		},
		data: {
			videos: [
				{
					title: "Official Extended Trailer | GOTHAM | FOX BROADCASTING",
					url: "http://www.youtube.com/watch?v=0d1zpt6k5OI&feature=youtube_gdata",
					uploader: "FOX",
					duration: "2:07",
					thumb: "http://i1.ytimg.com/vi/0d1zpt6k5OI/0.jpg",
					views: 1143620
				},
				{
					title: "Rick Grimes vs Walter White.  Epic Rap Battles of History Season 3.",
					url: "http://www.youtube.com/watch?v=krQHQvtIr6w&feature=youtube_gdata",
					views: 2980000,
					uploader: "ERB",
					duration: "2:18",
					thumb: "http://i1.ytimg.com/vi/krQHQvtIr6w/0.jpg"
				},
				{
					title: "Usher - Good Kisser",
					url: "http://www.youtube.com/watch?v=1lQtoRFaLsA&feature=youtube_gdata",
					views: 790000,
					uploader: "UsherVEVO",
					duration: "5:04",
					thumb: "http://i1.ytimg.com/vi/1lQtoRFaLsA/0.jpg"
				},
				{
					title: "Linkin Park - \"Until It's Gone\" [Official Lyric Video]",
					url: "http://www.youtube.com/watch?v=Nym1P-BO_ws&feature=youtube_gdata",
					views: 714000,
					uploader: "Linkin Park",
					duration: "3:41",
					thumb: "http://i1.ytimg.com/vi/Nym1P-BO_ws/0.jpg"
				},
				{
					title: "Internet Citizens: Defend Net Neutrality",
					url: "http://www.youtube.com/watch?v=wtt2aSV8wdw&feature=youtube_gdata",
					views: 368000,
					uploader: "CGP Grey",
					duration: "3:34",
					thumb: "http://i1.ytimg.com/vi/wtt2aSV8wdw/0.jpg"
				}
			]
		},
		refresh: function() {
			var that = this;

			if (this.config.user && this.config.user.trim() !== "") {
				var url = "https://gdata.youtube.com/feeds/api/users/" + encodeURIComponent(this.config.user) + "/uploads?alt=json&max-results=6" // &orderby=published";
			}
			else {
				var url = "http://gdata.youtube.com/feeds/api/standardfeeds/most_viewed?max-results=6&alt=json&time=today";
			}

			$.get(url, function(d) {
				if (d && d.feed && d.feed.entry) {
					var videos = [];

					d.feed.entry.forEach(function(e, i) {
						var video = {
							title: e.title && e.title.$t,
							views: parseInt((e.yt$statistics && e.yt$statistics.viewCount) || 0),
							url: e.media$group && e.media$group.media$player && e.media$group.media$player[0] && e.media$group.media$player[0].url,
							thumb: e.media$group && e.media$group.media$thumbnail && e.media$group.media$thumbnail[0] && e.media$group.media$thumbnail[0].url,
							uploader: e.media$group && e.media$group.media$credit && e.media$group.media$credit[0] && e.media$group.media$credit[0].yt$display
						};

						if (e.media$group && e.media$group.yt$duration && e.media$group.yt$duration.seconds) {
							var dur = parseInt(e.media$group.yt$duration.seconds),
								seconds = dur % 60;

							dur -= seconds;

							var minutes = (dur % 3600) / 60;

							dur -= minutes;

							var hours = Math.floor(dur / 3600);

							if (hours) {
								video.duration = hours + ":" + (minutes || 0).pad() + ":" + (seconds || 0).pad();
							}
							else {
								video.duration = (minutes || 0) + ":" + (seconds || 0).pad();
							}
						}

						videos.push(video);
					});

					that.data = {
						videos: videos
					};

					that.utils.saveData(that.data);

					that.render.call(that);
				}
			});
		},
		render: function() {
			var data = $.extend(true, {}, this.data);

			switch (this.config.view) {
				case "large":
					data.featured = data.videos.shift();

					delete data.videos;
				break;
				case "large_2":
					data.featured = data.videos.shift();

					data.videos.splice(2);
				break;
				case "large_4":
					data.featured = data.videos.shift();

					data.videos.splice(4);
				break;
				case "four":
					data.videos.splice(4);
				break;
				case "six":
					data.videos.splice(6);
				break;
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (data.featured) {
				data.featured.views = data.featured.views.toLocaleString();
			}

			if (data.videos) {
				data.videos.forEach(function(e) {
					e.views = e.views.abbr();
				});
			}

			data.newTab = this.config.target == "_blank";

			this.utils.render(data);
		}
	};
});