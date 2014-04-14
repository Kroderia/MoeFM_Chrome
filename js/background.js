$(document).ready(function() {
	updateBaseUrl();
});

var status = "stop"
var song;
var playlist;
var audioElement = document.createElement("audio");
audioElement.setAttribute("preload", "auto");
audioElement.autobuffer = true;

audioElement.addEventListener('ended', function() {
	sendStatusChanged("pause");
	playNext();
});

audioElement.addEventListener('error', function() {
	errorPopup("这首歌貌似挂了...正在为你播放下一首...");
	playNext();
});

audioElement.addEventListener('timeupdate', function(){  
	chrome.extension.sendMessage({action:	"timeupdate",
		  						  rate:		(audioElement.currentTime / audioElement.duration)});
});  

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "play") {
		playNext();
	} else 

	if (request.action == "pause") {
		sendStatusChanged("pause");
	} else 

	if (request.action == "resume") {
		sendStatusChanged("play");
	} else 

	if (request.action == "getstatus") {
		sendResponse({status: 	status,
			  		  song:		song});
	} else 

	if (request.action == "fav") {
		sendFav(request.item, request.url, request.type, request.target);
	} else 

	if (request.action == "setfav") {
		song.fav_sub = request.fav;
	}
});


function playSong() {
	song = playlist.pop();
	if (song == undefined) {
		playNext();
		return;
	}
	
	audioElement.pause();
	audioElement.src = song.url;
	sendStatusChanged("play");
	
	simpleSongNotification(song);
	chrome.extension.sendMessage({action:	"nextsong",
		  						  song:		song});
}


function playNext() {
	if (playlist != undefined && playlist.length) {
		playSong(playlist);
		return;
	}
	
	url = "http://moe.fm/listen/playlist"
	$.ajax({
		url:		apikeyUrl,
		type:		"GET",
		timeout:	ajaxTimeout,
		async:		true,
		data:		{url:		url,
					 api:		"json",
					 api_key:	apikey,
					 perpage:	playlistCount},
		dataType:	"json",
		success:	function(data, status) {
						try {
							playlist = data.response.playlist;
						} catch (e) {
							console.log(data);
							this.error();
							return;
						}
						playSong();
					},
		error:		function() {
						playNext();
					}
	});
}

function sendFav(items, url, type, target) {
	$.ajax({
		url:		oauthUrl,
		type:		"GET",
		timeout:	ajaxTimeout,
		async:		true,
		data:		{url:					url,
					 access_token:			items["access_token"],
					 access_token_secret:	items["access_token_secret"],
					 api:					"json",
					 fav_obj_type:			song.sub_type,
					 fav_obj_id:			song.sub_id,
					 fav_type:				type},
		dataType:	"json",
		error:		function() {
						sendFavResponseMessage(false, null, target);
					},
		success:	function(data, status) {
						if (checkIs401(data)) {
							sendFavResponseMessage(false, "401", target);
						}
						sendFavResponseMessage(true, data, target);
					}
	});
}

function checkIs401(data) {
	try {
		code = data.response.error.code;
	} catch (e) {
		return false;
	}
	if (data.response.error.code == 401) {
		chrome.storage.sync.remove(["access_token", "access_token_secret"]);
		errorPopup("你的授权似乎已经失效, 请尝试再次授权...")
		sendMessage({"action": 	"redirect",
					 "url": 	"login.html"});
		
		return true;
	} else {
		return false;
	}
}


function sendFavResponseMessage(status, data, target) {
	sendMessage({"action": 	"favresponse",
				 "status": 	status,
				 "data": 	data,
				 "target": 	target});
}

function sendStatusChanged(changed) {
	status = changed;
	if (status == "play") {
		audioElement.play();
	} else if (status == "pause") {
		audioElement.pause();
	}
	chrome.extension.sendMessage({action: 	"changestatus",
								  status:	status});
}