define(["backbone"], function(Backbone) {
    var loader = {
        callbacks: [],

        load: function(callback, context) {
            if (window.gcapiloaded) {
                if (callback) {
                    callback.call(context);
                }
                return;
            }

            if (callback) {
                this.callbacks.push({
                    callback: callback,
                    context: context
                });
            }

            if (window.gcapiloading) {
                return;
            }

            window.gcapiloading = true;

            var w = window;
            var d = document;            
            var s = 'script';
            var js=d.createElement(s);
            var fs=d.getElementsByTagName(s)[0];
            js.src='https://www.gstatic.com/charts/loader.js';
            fs.parentNode.insertBefore(js,fs);
            js.onload = function() { 
                var that = this;
                //google.charts.load('current', {packages: ['corechart', 'annotationchart']});
                google.charts.load('current', {packages: ['corechart']});
                google.charts.setOnLoadCallback(function() {
                    window.gcapiloaded = true;
                    that.callbacks.forEach(function(item) {
                        item.callback.call(item.context);
                    });
                });
            }.bind(this);
        },
    
        isLoaded: function() {
            return window.gcapiloaded || false;
        }
    };

    return loader;
});