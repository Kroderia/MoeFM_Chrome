// This url is differnet from MoeFM's API.
// It is a transfer layer to avoid the cross-site problem
var apikey			= "5c3b588a4ad990ba5766d605d84b5786052a2028f";

var urlLastUpdate	= 0;
var urlChosen		= false;
var baseUrl			= "http://gae.moefm.kroderia.im/";
var optionalUrl		= ["http://moefm.kroderia.im/", "http://gae.moefm.kroderia.im/"];

var requestUrl		= baseUrl + "api/request";
var accessUrl		= baseUrl + "api/access";
var apikeyUrl		= baseUrl + "api/get";
var oauthUrl		= baseUrl + "api/oauthget";

var favAddUrl		= "http://api.moefou.org/fav/add.json";
var favDeleteUrl	= "http://api.moefou.org/fav/delete.json";

var ajaxTimeout			= 2000;
var notificationtimeout	= 4000;
var playlistCount		= 10;

var FEEDBACK_URL = "https://github.com/Kroderia/MoeFM_Chrome/issues/1";