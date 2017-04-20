/* MMM-FacebookCalendarConverter
 * Node Helper
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var moment = require("moment");
var request = require("request");

module.exports = NodeHelper.create({
	config: {},

	start: function() {
		console.log(this.name + " is started!");
		var _this = this;
		_this.expressApp.get("/bit-calendar/:page", function (req, res) {
			var url = "https://api.bandsintown.com/artists/" + req.params.page + "/events.json?api_version=2.0&app_id=MagicMirror"
			_this.fetchEventsFromApiURL(url, function(events) {
				res.send(_this.convertToCalendar(events));
			})
		});
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "CONFIG") {
			this.config = payload;

			console.log(this.config);
		}
	},

	fetchEventsFromApiURL: function(url, callback) {

		request(url, function (error, response, body) {
			if (error) {
				console.error("MMM-BITCalendarConverter: An error occured when trying to fetch data:");
				console.error(error);
				return;
			}

			if (!response) {
				console.error("MMM-BITCalendarConverter: Did not receive a response from Bands in Town.");
				return;
			}

			if (response.statusCode !== 200) {
				console.error("MMM-BITCalendarConverter: Received an incorrect response code from Bands in Town: " + response.statusCode);
				return;
			}

			var data = JSON.parse(body);

			if (!data) {
				console.error("MMM-BITCalendarConverter: Could not decode the received json. I received the following data:");
				console.log(body);
				return;
			}

			callback(data);
		});
	},

	convertToCalendar: function(events) {
		var calendarData;

		// Create header;
		calendarData = "BEGIN:VCALENDAR\n";
		calendarData += "VERSION:2.0\n";
		calendarData += "PRODID:-//magicmirror.builders/calendar//NONSGML v1.0//EN\n";
		calendarData += "X-PUBLISHED-TTL:PT12H\n";
		calendarData += "CALSCALE:GREGORIAN\n";
		calendarData += "METHOD:PUBLISH\n\n";


		events.forEach(function(event) {
			calendarData += "BEGIN:VEVENT\n";
			calendarData += "UID:" + event.id + "@facebook.com\n";

			calendarData += "DTSTAMP:" + moment(event.datetime).format("YYYYMMDDThhmmss") + "\n";
			calendarData += "DTSTART:" + moment(event.datetime).format("YYYYMMDDThhmmss") + "\n";

			calendarData += "SUMMARY:" + event.title.replace(/,/g, "\\,") + "\n";
			calendarData += "URL:" + event.facebook_rsvp_url + "\n";
			if (event.venue) {
				calendarData += "LOCATION:" + event.venue.name.replace(/,/g, "\\,") + "\n";
				if(event.venue.latitude && event.venue.longitude) {
					calendarData += "GEO:" + event.venue.latitude + ";" + event.venue.longitude + "\n";
				}
			}

			calendarData += "END:VEVENT\n";
			calendarData += "\n";
		});

		return calendarData;
	}

});