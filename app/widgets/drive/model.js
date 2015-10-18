define(["lodash", "widgets/model"], function(_, WidgetModel) {
	return WidgetModel.extend({
		refreshInterval: 300000,

		defaults: {
			config: {
				title: "i18n.name",
				size: "variable",
				files: 8
			},

			data: {
				files: [
					{
						name: "Recent trips",
						icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_collection_email.png",
						link: "https://drive.google.com/",
						user: "John Doe",
						date: 1396978331809
					},
					{
						name: "Getaway camping plans",
						icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_spreadsheet_email.png",
						link: "https://drive.google.com/",
						user: "John Doe",
						date: 1396961351031
					},
					{
						name: "20120716-213442_3-urban0_high_resolution.jpg",
						icon: "https://lh4.googleusercontent.com/HG7nuq3CpdLbTRIebHh0DrW7zwNco8aY9CIOTB4SDwBjNj7mrOxU_JNEsl2rIJqc8A=s75-c",
						link: "https://drive.google.com/",
						user: "Avi Kohn",
						date: 1396912248952
					},
					{
						name: "Engagement party menu ideas",
						icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_document_email.png",
						link: "https://drive.google.com/",
						user: "John Doe",
						date: 1395760856920
					},
					{
						name: "notifiersalpha",
						icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_document_email.png",
						link: "https://drive.google.com/",
						user: "John Doe",
						date: 1395760558164
					},
					{
						name: "Catering_agreement.pdf",
						icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_pdf_email.png",
						link: "https://drive.google.com/",
						user: "John Doe",
						date: 1395760364357
					},
					{
						name: "Grocery List.xlsx",
						icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_excel_email.png",
						link: "https://drive.google.com/",
						user: "John Doe",
						date: 1394551564697
					},
					{
						name: "H20120827-185744_3-urban2_high_resolution.jpg",
						icon: "https://lh6.googleusercontent.com/HFuWO2XkEPYSXvvMRDhXA5sD8k9Gamuas2aeMz4H-YxycnzGp3d62mOWPAJ1U5zc5w=s75-c",
						link: "https://drive.google.com/",
						user: "John Doe",
						date: 1394219609054
					}
				]
			}
		},

		oAuth: {
			id: "559765430405-jtbjv5ivuc17nenpsl4dfk9r53a3q0hg.apps.googleusercontent.com",
			secret: "__API_KEY_drive__",
			scope: "https://www.googleapis.com/auth/drive.readonly"
		},

		refresh: function() {
			this.oAuth.ajax({
				type: "GET",
				data: {
					maxResults: this.config.files || 8,
					fields: "items(alternateLink,iconLink,mimeType,thumbnailLink,lastModifyingUserName,modifiedDate,title)"
				},
				url: "https://www.googleapis.com/drive/v2/files",
				success: function(d) {
					var files = [];

					if (d && d.items) {
						d.items.forEach(function(e, i) {
							var file = {
								name: e.title,
								icon: e.iconLink,
								link: e.alternateLink,
								user: e.lastModifyingUserName,
								date: new Date(e.modifiedDate).getTime()
							};

							if (e.thumbnailLink && e.mimeType && (e.mimeType.indexOf("image") === 0 || e.mimeType.indexOf("video") === 0)) {
								file.icon = e.thumbnailLink.replace(/=s220$/, "=s75-c"); // Replace the 220px picture with a 75px square one
							}
							else if (e.iconLink) {
								file.icon = e.iconLink.replace("_list.png", "_email.png").replace("icon_10", "icon_11"); // Replace the 16px icon with a 32px icon and version 10 icons with V11
							}

							files.push(file);
						});

						
						// When called with an argument, saveData sets this.data in addition to persisting
						// its value
						this.saveData({
							files: files
						});
					}
				}
			});
		}
	});
});