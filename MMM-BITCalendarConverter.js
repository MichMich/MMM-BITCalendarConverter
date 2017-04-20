/* Magic Mirror
 * Module: MMM-FacebookCalendarConverter
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-BITCalendarConverter", {
	defaults: {
	},

	start: function() {
		this.sendSocketNotification("CONFIG", this.config);
	}

});

// All magic is done in the node helper.