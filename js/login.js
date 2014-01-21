$(document).ready(function() {
	chrome.storage.sync.get(checkRequestToken);
});

$("#submit_verifier").click(function() {
	chrome.storage.sync.get(loadAccessToken);
});

$("#open_verifier").click(function() {
	loadRequestToken();
});

function checkRequestToken(items) {
	if (items["request_token"] == undefined && items["request_token_secret"] == undefined) {
		return false;
	} else {
		return true;
	}
}

function loadAccessToken(items) {
	if (checkRequestToken(items) == false)
		return;
	
	verifier = $("#input_verifier").val();
	if (verifier == "") {
		errorPopup("验证码不能为空");
		return;
	}
	
	$.ajax({
		url:		access_url,
		type:		"GET",
		timeout:	ajaxtimeout,
		async:		false,
		data:		{
			request_token:			items["request_token"],
			request_token_secret:	items["request_token_secret"],
			verifier:				verifier
		},
		dataType:	"json",
		error:		function() {
			errorPopup("载入失败.");
		},
		success:	function(data, status) {
			chrome.storage.sync.remove(["request_token", "request_token_secret"]);
			if (data.status) {
				entry = data.info;
				chrome.storage.sync.set({"access_token": 			entry.access_token,
										 "access_token_secret":		entry.access_token_secret});
				window.location.href = "index.html";
			} else {
				errorPopup("载入失败.");
			}
		}
	});
}

function loadRequestToken() {
	$.ajax({
		url:		request_url,
		type:		"GET",
		timeout:	ajaxtimeout,
		async:		false,
		data:		{
		},
		dataType:	"json",
		error:		function() {
			errorPopup("载入失败.");
		},
		success:	function(data, status) {
			if (data.status == true) {
				entry = data.info;
				chrome.storage.sync.set({"request_token": 			entry.request_token,
										 "request_token_secret":	entry.request_token_secret});
				openUrl(entry.authorize_url);
			} else {
				errorPopup("载入失败.");
			}
			
		}
	});
}