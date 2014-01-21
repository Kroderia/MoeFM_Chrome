// This url is differnet from MoeFM's API.
// It is a transfer layer to avoid the cross-site problem
var base_url		= "https://moefm.kroderia.im/"
var request_url		= base_url + "api/request";
var access_url		= base_url + "api/access";
var apikey_url		= base_url + "api/get"
var oauth_url		= base_url + "api/oauthget";
var apikey			= "5c3b588a4ad990ba5766d605d84b5786052a2028f";

var ajaxtimeout			= 2000
var notificationtimeout	= 4000
var playlistcount		= 10

var favStatusDelete = "song_control_button song_fav_delete";
var favStatusAdd = "song_control_button song_fav_add";