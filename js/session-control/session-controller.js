define(["jquery"],function($){
	return function Session(_config){
		var interval;
		var session={};
		var currentUser="";
		var config={
			polling:3000,
			url:"/session-control",
			method:"post",
			addedToBasket:function(){},
			endSession:function(){},
			sessionControlled:function(){},
			expires:null,
			cookie:"session"
		}
		load(_config);
		
		function load(_config){
			_config=_config || {};
			//load config
			for(var i in _config){
				config[i]=_config[i];
			}
			//has it started?
			var cookie = getCookie(config.cookie);
			if(cookie){
				session=JSON.parse(cookie);
				poll();
			}
		}
		function start(cb){
			currentUser="";
			$.ajax({
				url:config.url,
				method:config.method,
				data:{"start-control-session":"true"},
				dataType:"json"
			}).done(function(response){
				handleStart(response.control_session,cb);
			}).error(function(){
				alert("error");
			});
		}
		function handleStart(controlSession,cb){
			session.access_code=controlSession.access_code;
			logSession();
			poll();
			if(cb) cb(session.access_code);
		}
		function stop(){
			$.ajax({
				url:config.url,
				method:config.method,
				data:{"end-control-session":"true"},
				dataType:"json"
			});
			end();
		}
		function isRunning(){
			return session && session.access_code ? true : false;
		}
		function end(){
			clearInterval(interval);
			deleteCookie(config.cookie);
			session={};
			if(config.endSession){
				config.endSession();
			}
		}
		function poll(){
			interval = setInterval(doRequest,config.polling);
		}
		function doRequest(){
			$.ajax({
				url:config.url,
				method:config.method,
				dataType:"json",
				data:{"get-new-actions":"true"}
			}).done(handleResponse);
		}
		function handleResponse(response){
			var controlSession = response.control_session || {};
			if(!controlSession.access_code){
				return end();
			}
			if(controlSession.control_user != currentUser){
				if(config.sessionControlled) config.sessionControlled();
				currentUser=controlSession.control_user;
			}
			for(var i in controlSession.actions){
				var Action = controlSession.actions[i];
				switch(Action.action_type){
					case "addToBasket":
						if(config.addToBasket){
							var material,quantity,unit;
							for(var i in Action.parameters){
								var param = Action.parameters[i];
								if(param.name==="materialNum"){
									material=param.value;
								}else if(param.name==="quantity"){
									quantity=param.value;
								}else if(param.name==="unit"){
									unit=param.value;
								}
							}
							config.addToBasket(material,quantity,unit);
						}
						break;
					case "endSession":
						end();
						break;
					case "redirect":
						if(config.redirect){
							var url;
							for(var i in Action.parameters){
								var param = Action.parameters[i];
								if(param.name==="url"){
									url=param.value;
								}
							}
							config.redirect(url);
						}
						break;
				}
			}
		}
		function logSession(){
			var cookie = JSON.stringify(session);
			setCookie(config.cookie,cookie,config.expires);
		}
		function getCookie(name) {
			var value = "; " + document.cookie;
			var parts = value.split("; " + name + "=");
			if (parts.length == 2) return parts.pop().split(";").shift();
		}
		function setCookie(name,value,days) {
			if (days) {
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";
			document.cookie = name+"="+value+expires+"; path=/";
		}
		function deleteCookie( name ) {
			setCookie(name,"",-100);
		}
		return{
			start:start,
			stop:stop,
			isRunning:isRunning
		}
	}
});
