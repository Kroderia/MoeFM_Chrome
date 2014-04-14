function openUrl(url) {
	obj = new Object();
	obj.url = url;
	obj.active = true;
	chrome.tabs.create(obj);
}

function errorPopup(info) {
	opt = {title:	"出错了!",
		   message:	info,
		   iconUrl:	"../img/error.png",
	};
	showNotification(opt);
}

function showNotification(opt) {
//	chrome.notifications is not useful now.
//	chrome.notifications.create("cnc", opt, function() { });
	var notification = webkitNotifications.createNotification(opt.iconUrl, opt.title, opt.message);
	notification.show();
    notification.ondisplay = function() {
    	setTimeout(function() { notification.cancel(); }, notificationtimeout);
    }
}

function simpleSongNotification(song) {
	opt = {title:	song.sub_title,
		   message:	song.wiki_title,
		   iconUrl:	song.cover.small};
	showNotification(opt);
}


function sendMessage() {
	if (arguments[0]) {
		arg = arguments[0];
		if (typeof arg == "string") {
			arg = {action: arg}
		} else if (typeof arg != "object") {
			return;
		}
	} else {
		return;
	}
	
	if (arguments[1]) {
		chrome.extension.sendMessage(arg, arguments[1]);
	} else {
		chrome.extension.sendMessage(arg);
	}
}

function updateBaseUrl() {
	now = (new Date()).valueOf();
	if (now - urlLastUpdate < 3600) {
		return;
	} 
	
	urlLastUpdate = now;
	urlChosen = false;
	
	for (var i = 0; i < optionalUrl.length; i++) {
		testUrl = optionalUrl[i];
		console.log("TEST: "+ testUrl);
		
		$.ajax({
			url:		testUrl,
			type:		"GET",
			timeout:	ajaxTimeout,
			async:		true,
			success:	function(data, status) {
							if (urlChosen) {
								return;
							}
							console.log("Transfer layer url is now set: "+this.url);
							urlChosen = true;
							baseUrl = this.url;
							resetAllUrl(baseUrl);
						},
			error:		function() {
							console.log("Warn: Connection to "+this.url+" is lost.");
						}
		});
	}
}

function resetAllUrl(base) {
	chrome.storage.sync.set({"base_url": base});
	requestUrl	= base + "api/request";
	accessUrl	= base + "api/access";
	apikeyUrl	= base + "api/get"
	oauthUrl	= base + "api/oauthget";
}







