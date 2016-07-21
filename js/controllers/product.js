define([ "jquery"],function($){
	/**Compare Object**/
	var obj;
    if(!obj){
        obj = new Class();
    }
    return obj;
    
	function Class(_options){
        var $videoWrapper,data,video;
        
        function init(){
            buyingGuides();
            carousel();
            tabs();
        }
        
        function buyingGuides() {
    
            $(".buying-guides").on("click", "a[data-type='mp4']", function (){
                
                event.preventDefault();
                
                var $this = $( this );
                var video = $this.attr("href");
                
                viewVideo(video);
                
                var url       = location.href;
                location.href = "#video";
                
            });
            
        }
        
        function tabs(){
            $(".scw").on("click",".sc header",function(){
                 var $this = $(this);
                 $this.closest(".sc").toggleClass("active");
            });
        }
        
        function viewVideo(src){
            
            if(!$videoWrapper){
                $videoWrapper = $("#video-wrapper");
                
                $videoWrapper.on("click", ".close", function() {		
                
                    $videoWrapper.find("video").remove();
                    $videoWrapper.removeClass("active");
                
                });
            }
                                
             $videoWrapper.append('<video width="700" controls="controls" autoplay="autoplay"><source src="' + src + '" type="video/mp4"/></video>');
             $videoWrapper.addClass("active");

        }
        
        function carousel(){
            $(".carousel-preview-items").on("click","li",function(){
                var $this = $(this);
                if($this.hasClass("active")) return;
                var index = $this.index();
                var $activeItem = $(".carousel-items .carousel-item").eq(index);
                if(video){
                    video.pause();
                }
                if($this.hasClass("z360")){
                    $activeItem.addClass("loading");
                    getProductData(view360);
                }else if($this.hasClass("video")){
                    video = $activeItem.find("video")[0];
                    video.play();
                }
                $(".carousel-items .active").removeClass("active");
                $(".carousel-preview-items .active").removeClass("active");
                $activeItem.addClass("active");
                $this.addClass("active");
				
				if (index === 0) {
					var $configureColours = $(".configure .colour");
					if ($configureColours.length) {
						var counter = $configureColours.find("li.selected img").data("counter");
						$activeItem.find("img[data-counter='" + counter + "']").addClass("active");
					}
				}
            });
        }
        
        function view360(){
            var attr = getAttribute("Z360");
            if(!attr || !attr.value) return;
            var images = attr.value;
            images=images.map(function(Image){
                return Image.value + "?type=thumb&width=700&height=700&mode=shrink";
            }).sort(function(a,b){
                if(a > b) return -1;
                if(a < b) return 1;
                return 0;
            });
            $(".carousel-item.loading").removeClass("loading");
            var $container = $("#z360");
            if($container.hasClass("canvas360Wrapper")){
                return;
            }
            require(["plugins/rotate"],function(){
                canvas360({
                    framesCount:images.length,
                    canvasId:"#z360",
                    images:images,
                    canvasWidth:700,
                    canvasHeight:443,
                    loaderBarColor:"#000",
                    loaderFillColor:"#007da5"
                });
            });
        }
        
        function getAttribute(name){
            for(var i in data.attributes){
                if(data.attributes[i].attribute_key === name){
                    return data.attributes[i];
                }
            }
        }
        
        function getProductData(fCallback){
            if(data){
                return fCallback(data);
            }
            var productCode = $("input[name='product-number']").val();
            //productCode="HAL153";
            var params={"product-code":productCode};
            var base = globals.base || "";
            $.ajaxSettings.traditional = true;
            $.ajax({
                dataType: "json",
                url: base + "/product-information",
                data: params
            }).done(function(_data){
                data = _data.products[0];
                if(fCallback) fCallback(data);
            })
        }
        
        init();
	}
});