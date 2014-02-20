$(document).ready(function() {
	getPlayingStatusForSetSongInfo();
});

//========================
//Define varibles
var song;
var progressBarTotalLength = parseInt($("#song_progress").css("width"));
var favOrigin;
var favbtn = $("#song_fav");
var imgbtn = $("#song_image");
var abmbtn = $("#song_album");
var nmebtn = $("#song_name");
var tshbtn = $("#song_trash");
var dwnbtn = $("#song_download");

//========================
//Event listener
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
		if (response.status == "play") {
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
	if ($(this).attr("class") == trashStatusDuring) {
		return;
	}
	
	$(this).attr("class", trashStatusDuring);
	chrome.storage.sync.get(sendFavTrash);
});


$("#song_image_enlarge").click(function() {
	openUrl(song.cover.large);
});

$("#song_wiki").click(function() {
	openUrl(song.wiki_url);
})

//=======================
//Chrome message passing
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "timeupdate") {
		$("#song_progress_bar").css("width", progressBarTotalLength * request.rate);
	} else 
		
	if (request.action == "changestatus") {
		$("#song_play").attr("class", "song_control_button status_"+request.status);
	} else 
		
	if (request.action == "nextsong") {
		setSongInfo(request.song);
	} else 
		
	if (request.action == "favresponse") {
		recvFavResponse(request.status, request.target, request.data);
	}
});


//=======================
//Function
function isLogin(items) {
	return (items["access_token"] != undefined && items["access_token_secret"] != undefined);
}


function sendFavLove(items) {
	if (! isLogin(items)) {
		window.location.href = "login.html";
		return;
	}
	
	favOrigin = favbtn.attr("class");
	if (favOrigin == favStatusAdd) {
		url	= favDeleteUrl;
		favbtn.attr("class", favStatusDelete);
	} else {
		url	= favAddUrl;
		favbtn.attr("class", favStatusAdd);
	}
	
	sendFavMessage(items, url, 1, "love");
}

function recvFavResponse(status, target, data) {
	if (data == "401") {
		return;
	}
	
	if (target == "trash") {
		if (status) {
			sendPlayMessage();
		} else {
			errorPopup("载入失败...");
		}
	} else if (target == "love") {
		if (status) {
			favobj	= data.response.fav;
			if (typeof(favobj) == undefined) {
				favbtn.attr("class", favStatusDelete);
			} else {
				song.fav_sub 	= favobj;
				sendSetFavMessage(favobj);
			}
		} else {
			favBtn.attr("class", favOrigin);
			errorPopup("载入失败...");
		}
	}
}


function sendFavTrash(items) {
	if (! isLogin(items)) {
		window.location.href = "login.html";
		return;
	}
	
	sendFavMessage(items, favAddUrl, 2, "trash");
}


function sendSetFavMessage(obj) {
	chrome.extension.sendMessage({action:	"setfav",
								  fav:		obj});
}


function setSongInfo(newsong) {
	song = newsong;
	
	if (song.fav_sub == undefined) {
		favbtn.attr("class", favStatusDelete);
	} else {
		favbtn.attr("class", favStatusAdd);
	}
	
	imgbtn.attr("src", song.cover.small)
	nmebtn.text(song.sub_title);
	abmbtn.text(song.wiki_title);
	abmbtn.attr("href", song.wiki_url);
	tshbtn.attr("class", transStatusWait);
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

function sendFavMessage(item, url, type, target) {
	sendMessage({"action": "fav",
				 "url": url,
				 "item": item,
				 "type": type,
				 "target": target});
}

function sendPlayMessage() {
	imgbtn.attr("src", "../img/logo.png");
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

