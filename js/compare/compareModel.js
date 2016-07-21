define([ "jquery"],function($){
	/**Compare Object**/
	var obj;
    if(!obj){
        obj = new Class();
    }
    return obj;
    
	function Class(_options){
        
        var codes,params,leveldata;
        init();
		
		function init(){	
			codes = localStorage.getItem("compare-list");
			params = {product_code:[]};
			if(codes){
				var prods = codes.split(",");
				
				for(var i=0; i<prods.length; i++){
					params.product_code.push(
						prods[i]
					)
				}
            }
        }
        function getJSON(fCallback){
				//Get local storage if no new added or ajax
				var data = localStorage.getItem('compare-json');
				if(data) data = JSON.parse(data);
				if(data && data.codes === codes){
					if(fCallback) fCallback(data);
				}else{
					if(!params.product_code.length){
						if(fCallback) fCallback({products:[]});
						return;
					}
					params={"product-code":params.product_code};
					var base = globals.base || "";
					$.ajaxSettings.traditional = true;
					$.ajax({
						dataType: "json",
						url: base + "/product-information",
						data: params
					}).done(function(data){
						data.codes = codes;
						localStorage.setItem("compare-json",JSON.stringify(data));
						if(fCallback) fCallback(data);
					})
				}
        }
        function getLevelData(level_key,fCallback){
            if(leveldata){
                if(fCallback) fCallback(leveldata);
                return ;
            }
            var params={"category": level_key,"include-products":"X"}
			//params={"product-code":params.product_code};
			$.ajaxSettings.traditional = true;
			$.ajax({
			  dataType: "json",
			  url: "/category-information",
			  data: params
			}).done(function(data){
                leveldata=data.categories ? data.categories[0] : {};
				if(fCallback) fCallback(leveldata);
			});
        }
        
        function getProducts(){
            return codes ? codes.split(",") : [];
        }
		
		function add(matnr){
			if(matnr === undefined) return;
			if(codes){
				var prods = codes.split(",");
				var added = false;
				for(var i=0;i<prods.length;i++){
					if(prods[i] === matnr){
						added=true;
						break;
					}
				}
				if(added===false){
					codes=codes + ',' + matnr;
				}
			}else{
				codes=matnr;
			}
			localStorage.setItem("compare-list",codes);
		}
		
		function remove(matnr){
			if(codes){
				var prods = codes.split(",");
				for(var i=0;i<prods.length;i++){
					if(prods[i] === matnr){
						prods.splice(i,1);
						break;
					}
				}
				codes=prods.join(",");
				localStorage.setItem("compare-list",codes);
			}
		}
		return{
			add:add,
			remove:remove,
			getJSON:getJSON,
			getLevelData:getLevelData,
			getProducts:getProducts
		}
	}
});