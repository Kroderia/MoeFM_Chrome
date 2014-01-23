var song;
var progressBarTotalLength = parseInt($("#song_progress").css("width"));
var progressBar = $("#song_progress_bar");

$(document).ready(function() {
	getPlayingStatusForSetSongInfo()
});


$("#song_album").click(function() {
	href = $(this).attr("href");
	if (href != undefined && href != "") {
		openUrl(href);
	}
});


$("#song_next").click(function() {
	sendPlayMessage();
})


$("#song_play").click(function() {
	getPlayStatus(function(response) {
		status = response.status
		if (status == "play") {
			sendPauseMessage();
		} else {
			sendResumeMessage();
		}
	});
})


$("#song_fav").click(function() {
	chrome.storage.sync.get(sendFavLove);
});


$("#song_trash").click(function() {
	trashing = "song_control_button status_trashing";
	if ($(this).attr("class") == trashing) {
		return;
	}
	
	$(this).attr("class", trashing);
	chrome.storage.sync.get(sendFavTrash);
});


$("#song_image_enlarge").click(function() {
	openUrl(song.cover.large);
});


chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "timeupdate") {
		progressBar.css("width", progressBarTotalLength * request.rate);
	} else if (request.action == "changestatus") {
		$("#song_play").attr("class", "song_control_button status_"+request.status);
	} else if (request.action == "nextsong") {
		setSongInfo(request.song);
	}
});


function checkLogin(items) {
	return (items["access_token"] != undefined && items["access_token_secret"] != undefined);
}


function sendFavLove(items) {
	if (! checkLogin(items)) {
		window.location.href = "login.html";
		return;
	}
	
	favbtn = $("#song_fav");
	origin = favbtn.attr("class");
	if (origin == favStatusAdd) {
		url	= "http://api.moefou.org/fav/delete.json";
		favbtn.attr("class", favStatusDelete);
	} else {
		url	= "http://api.moefou.org/fav/add.json"
		favbtn.attr("class", favStatusAdd);
	}
	
	sendFav(items, 1, function(data) {
		favobj	= data.response.fav;
		if (typeof(favobj) == undefined) {
			favbtn.attr("class", favStatusDelete);
		} else {
			song.fav_sub 	= favobj;
			sendFavMessage(favobj);
		}
	});
}


function sendFavTrash(items) {
	if (! checkLogin(items)) {
		window.location.href = "login.html";
		return;
	}
	
	url	= "http://api.moefou.org/fav/add.json"
	sendFav(items, 2, function(data) {
		$("#song_trash").attr("class", "song_control_button status_nottrash")
		sendPlayMessage();
	});
}


function sendFav(items, type, callback, error) {
	$.ajax({
		url:		oauth_url,
		type:		"GET",
		timeout:	ajaxtimeout,
		async:		true,
		data:		{
			url:					url,
			access_token:			items["access_token"],
			access_token_secret:	items["access_token_secret"],
			api:					"json",
			fav_obj_type:			song.sub_type,
			fav_obj_id:				song.sub_id,
			fav_type:				type,
		},
		dataType:	"json",
		error:		function() {
			errorPopup("载入失败...");
		},
		success:	function(data, status) {
			callback(data);
		}
	});
}


function sendFavMessage(obj) {
	chrome.extension.sendMessage({action:	"setfav",
								  fav:		obj});
}


function setSongInfo(newsong) {
	song = newsong;
	favbtn = $("#song_fav");
	imgbtn = $("#song_image");
	abmbtn = $("#song_album");
	nmebtn = $("#song_name");
	tshbtn = $("#song_trash");
	dwnbtn = $("#song_download");
	
	if (song.fav_sub == undefined) {
		favbtn.attr("class", "song_control_button song_fav_delete");
	} else {
		favbtn.attr("class", "song_control_button song_fav_add");
	}
	imgbtn.attr("src", song.cover.small)
	nmebtn.text(song.sub_title);
	abmbtn.text(song.wiki_title);
	abmbtn.attr("href", song.wiki_url);
	tshbtn.attr("class", "song_control_button status_nottrash");
	dwnbtn.attr("href", song.url);
	dwnbtn.attr("download", song.sub_title+".mp3");
}


function getPlayingStatusForSetSongInfo() {
	getPlayStatus(function(response) {
		status = response.status
		
		if (status == "stop") {
			sendPlayMessage()
		} else {
			setSongInfo(response.song);
			$("#song_play").attr("class", "song_control_button status_"+status);
		}
	});
}


function sendPlayMessage() {
	$("#song_image").attr("src", "../img/logo.png");
	sendMessage("play");
}

function sendResumeMessage() {
	sendMessage("resume");
}

function sendPauseMessage() {
	sendMessage("pause");
}

function getPlayStatus(callback) {
	sendMessage("getstatus", callback);
}

