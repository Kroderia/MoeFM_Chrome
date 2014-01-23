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
	} else if (request.action == "pause") {
		sendStatusChanged("pause");
	} else if (request.action == "resume") {
		sendStatusChanged("play");
	} else if (request.action == "getstatus") {
		sendResponse({status: 	status,
			  		  song:		song});
	} else if (request.action == "setfav") {
		song.fav_sub = request.fav;
	}
});


function playSong() {
	song = playlist.pop();
	
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
		url:		apikey_url,
		type:		"GET",
		timeout:	ajaxtimeout,
		async:		false,
		data:		{
			url:		url,
			api:		"json",
			api_key:	apikey,
			perpage:	playlistcount
		},
		dataType:	"json",
		success:	function(data, status) {
			playlist = data.response.playlist;
			playSong();
		}
	});
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