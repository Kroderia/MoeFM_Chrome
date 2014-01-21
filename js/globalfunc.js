function openUrl(url) {
	obj = new Object();
	obj.url = url;
	obj.active = true;
	chrome.tabs.create(obj);
}

function errorPopup(info) {
	opt = {
			title:		"出错了!",
			message:	info,
			iconUrl:	"../img/error.png",
	};
	showNotification(opt);
}

function showNotification(opt) {
//	chrome.notifications is not useful now.
//	chrome.notifications.create("cnc", opt, function() { });
	var notification = webkitNotifications.createNotification(opt.iconUrl,
															  opt.title,
														      opt.message)
	notification.show();
    notification.ondisplay = function() {
    	setTimeout(function() { notification.cancel(); }, notificationtimeout);
    }
}

function simpleSongNotification(song) {
	opt = {
			title:		song.sub_title,
			message:	song.wiki_title,
			iconUrl:	song.cover.small,
	};
	showNotification(opt);
}


function sendMessage() {
	if (arguments[0]) {
		action		= arguments[0];
	} else {
		return;
	}
	
	if (arguments[1]) {
		chrome.extension.sendMessage({action: action}, arguments[1]);
	} else {
		chrome.extension.sendMessage({action: action});
	}
	
}