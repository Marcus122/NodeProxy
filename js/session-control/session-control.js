define(["jquery","session-control/session-controller"],function($,Session){
	var instance;
	if(!instance){
		instance = new sessionControl();
	}
	
	return instance;
	
	function sessionControl(){
		var session,$start,$stop,$close,$statusInfo,$statusBox,$popup,$popupContent;
		init();
		function init(){
			session=new Session({
				addToBasket:addToBasket,
				endSession:endSession,
				url:"/session-control",
				redirect :redirect,
				sessionControlled:sessionControlled
			});
			if(session.isRunning()){
				showStatus(false);
			}/*else{
				createStartButton();
			}*/
			$("#live-help").on("click",function(ev){
				ev.preventDefault();
				if(session.isRunning()){
					showStatus(true);
				}else{
					showPopup();
				}
			});
		}
		function showStatus(expand){
			if(!$statusBox){
				$statusBox = $("<div/>").addClass("session-status");
				var $header = $("<span class='header'>Session Control</span>");
				$statusInfo = $("<div/>").addClass("status-info");
				$header.on("click",function(){
					if($statusBox.hasClass("expanded")){
						$statusBox.removeClass("expanded");
					}else{
						showStatusContent();
					}
				});
				$("body").append($statusBox.append($header).append($statusInfo));
			}else{
				$statusBox.show();
			}
			if(expand){
				showStatusContent();
			}else{
				$statusBox.removeClass("expanded");
			}
		}
		function showStatusContent(){
			if(session.isRunning()){
				showConnected();
			}else{
				showDisconnected();
			}
			$statusBox.addClass("expanded");
		}
		function showConnected(){
			$statusInfo.empty();
			$statusInfo.append("<h2>Session Connected</h2>");
			$statusInfo.append("<p>You are connected to a customer support representative to disconnect from this service, please press disconnect</p>");
			$statusInfo.append(createStopButton());
		}
		function showDisconnected(){
			$statusInfo.empty();
			$statusInfo.append("<h2>Session Disconnected</h2>");
			$statusInfo.append("<p>You have been disconnected from session control, to reconnect, go to the Live Help link at the bottom of the page.</p>");
			$statusInfo.append(createCloseButton());
		}
		function createStopButton(){
			//if(!$stop){
				$stop=$("<button class='button medium secondary'>Disconnect</button>");
				$stop.on("click",function(ev){
					ev.preventDefault();
					session.stop();
				});
			//}
			return $stop;
		}
		function createStartButton(){
			//if(!$start){
				$start=$("<button class='button medium secondary'>Session Control</button>")
				$start.on("click",function(ev){
					ev.preventDefault();
					session.start(startSessionControl);
					//$start.hide();
					//createStopButton();
				});
			//}
			return $start;
		}
		function createCloseButton(){
			//if(!$close){
				$close=$("<button class='button medium secondary'>Close</button>")
				$close.on("click",function(ev){
					ev.preventDefault();
					$statusBox.hide();
					showStatusContent();
				});
			//}
			return $close;
		}
		function startSessionControl(Id){
			$popupContent.empty();
			$popupContent.append("<h2>Session Control</h2>");
			$popupContent.append("<p>Please give the below session control code to your customer support representative</p>");
			$popupContent.append("<h1>" + Id + "</h1>");
			showStatus();
		}
		function showPopup(){
			if(!$popup){
				$popup = $("<div/>").addClass("session-control-popup");
				$contentHolder = $("<div/>").addClass("holder");
				$popupContent = $("<div/>").addClass("session-control-popup-content");
				var $popupContainer = $("<div/>").addClass("popup-container");
				$("body").append($popupContainer.append($popup.append($contentHolder.append($popupContent))));
				var $close = $("<button class='close'/>");
				$close.on("click",function(){
					$popup.addClass("disabled")
				});
				$contentHolder.append($close);
			}else{
				$popupContent.empty();
			}
			$popup.removeClass("disabled");
			$popupContent.append("<h2>How can we help?</h2>");
			$popupContent.append("<p>Speak to a representative online</p>");
			$popupContent.append("<button class='button medium'>Live Chat</button>");
			$popupContent.append("<p>Request remote help</p>");
			$popupContent.append(createStartButton());
		}
		function showSessionId(Id){
			alert("Your session ID is " + Id);
		}
		function addToBasket(Material,Qty){
			var data={
				productNumber:Material,
				unit:"EA",
				quantity:Qty
			}
			require(["controllers/add-to-basket"],function(AddToBasket){
				AddToBasket.addToBasket(data);
			});
		}
		function sessionControlled(){
			if(!$popup) return;
			$popupContent.empty();
			$popupContent.append("<h2>Session Control</h2>");
			$popupContent.append("<p>Session control has started</p>");
		}
		function redirect(url){
			window.location=url;
		}
		function endSession(){
			showStatus(true);
			//alert("Session control has ended");
			//if($stop) $stop.hide();
			//createStartButton();
		}
	}
});
