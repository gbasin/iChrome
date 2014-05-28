// hack: This is just done to get the templates into script.js
global_templates = {};

/**
 * Handles the loading of the templates.
 **/
define(["plugins","widgets"],function()
	   {
		   /**
			* Non-blocking get
			*/
		   function _get(url,type)
		   {
			   var resolved = chrome.extension.getURL(url);
			   jQuery.ajaxSetup({async:false});
			   var result = false;
			   $.get(resolved, function(data) { result = data },type);
			   jQuery.ajaxSetup({async:true});
			   return result;
		   }

		   function _loadTemplates(base,url)
		   {
			   var json = _get(base+url,"json");
			   for(var i=0; i < json.length; i++)
			   {
				   var file = base+json[i]+".mustache";
				   console.log(file);
				   var html = _get(file,"html");
				   var $dom = $(html);
				   global_templates[$dom.attr('id')] = $dom.html();
			   }
		   }

		   _loadTemplates('/templates/','templates.json');
		   _loadTemplates('/templates/widgets/','widgets.json');
		   _loadTemplates('/templates/widgets/descs/','descs.json');
	   });