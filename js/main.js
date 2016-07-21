require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    baseUrl:'/js/c/theme/demo-b2c/',
	paths: { 
        plugins : 'plugins',
        jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min",
        jqueryUi:"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min"
     } 
});

require(["jquery","jqueryUi"], function(jQuery,jQueryUI,wp) {
	var qsCount;
    function init(){
	
        toggles();
        nav();
        sectionedContent();
        scroll();
        sliders();
        filterAndPaging();
        quickSearch();
        miniBasket();
        voucher();
        carFinder();
        swatch();
		quickView();
        carousel();
        compare();
		qandq();
	    productPage();
		addressBook();
        viewType();
		lists();
		myLists();
		reorder();
        require(["controllers/add-to-basket"]);
	    require(["session-control/session-control"]);
    }   
    
    function compare(){
        var animate,compareList;
        require(["compare/compare"]);
        $(document).on("click",".open-compare", function(event){
            event.preventDefault();
            //if(animate===true) return false;
            if(!compareList){
                require(["compare/compare-grid"],function(compareGrid){
                    animate=true;
                    var list = {};
                    list.attributes = [
                        {"name":"SHORTDESC",
                        "title":"Description"},
                        {"name":"BRAND",
                        "title":"Brand" },
                        {"name":"RATING",
                        "title":"Star Rating" },
                        {"name":"GENDER",
                        "title":"Gender"},
                        {"name":"FRAME",
                        "title":"Frame"},
                        {"name":"WHEELSIZE",
                        "title":"Wheel Size"},
                        {"name":"CASSETTE",
                        "title":"Cassette"},
                        {"name":"FROTNMECH",
                        "title":"Front Mech"},
                        {"name":"GEARS",
                        "title":"Gears"},
                        {"name":"GEARSHIFT",
                        "title":"Gear Shift"}];
                    list.prices = [{"name":"PRICE_INC_TAX","title":"Price"}];
                    compareList = compareGrid(list,function(){
                        animate=false;
                    });
                });
            }else{
                compareList.display()
            }		
        });
    }

    function toggles() {
        
        $('body').on("click", ".toggle", function(){
            var $this = $( this );
            $this.toggleClass("active");
            var elementId = $this.data( "toggle" );
            if (elementId) {
            $( "#" + elementId ).toggleClass("on");
            }
        });
    }

    function nav() {

        
        $('#pn').on( "mouseenter", ".main:not(.loaded)", function(){

            $this = $( this );
            $list  = $this.closest( "ul" );
            $list.addClass("loaded");
            
            $.ajax({
                url: globals.base + "/content-navigation",
                dataType: "json",
                success: function( data ) {		

                for ( var i = 0; i < data.result.length; i++ ) {
                    
                    var li = $("#pn .main li[data-key=" + data.result[i].key + "]");
                    li.append( data.result[i].html );
                    
                }

                }
            });		
            
        });
         $('#pn').on( "mouseenter", ".main.loaded li > a",function(){
              var $this = $(this);
              var $subNav = $this.closest("li").find(".sub-nav");
               $subNav.addClass("inactive");
               setTimeout(function(){
                   $subNav.removeClass("inactive");
               },500);
         });
        
    }

    function sectionedContent() {
        
        $('.scs').on( "click", "li:not(.active)", function(){

        
        
        // Remove active
        $this = $( this );
        $ul   = $this.closest( "ul" );
        $ul.find("li.active").click();//("active");
        var bucketKey  = $this.data( "section" );
        $container = $this.closest( ".scw");
        $container.find( ".sc.active" ).removeClass("active");
            $this = $( this );
            $ul   = $this.closest( "ul" );
            $ul.find("li.active").removeClass("active");
            $this.addClass("active");
            var bucketKey  = $this.data( "section" );
            
            $container = $this.closest( ".scw");
            
            $container.find( ".sc" ).each(function(){
                $this = $( this );
                if ($this.data("section") === bucketKey) {
                    $this.addClass("active");
                } else {
                    $this.removeClass("active");
                }
            });
            
        });	
        
    }

    function scroll() {
        
        $( window ).scroll( function() {
            if  ($(document).scrollTop() > 0) {
                $('body').addClass("down");
            } else {
                $('body').removeClass("down");
            }
        });
        
    }

    function sliders() {
        
        $( ".slider" ).each(function() {
            
            var $that = $( this );
            
            var min   = parseFloat( $that.find(".min").val() );
            var max   = parseFloat( $that.find(".max").val() );
            var smin  = parseFloat( $that.find(".smin").val() );
            var smax  = parseFloat( $that.find(".smax").val() );
            
            min.toFixed(2);
            max.toFixed(2);
            smin.toFixed(2);
            smax.toFixed(2);
            
            $that.slider({
            range: true,
            step: 1,
            min: min,
            max: max,
            values: [ smin, smax ],
            slide: function( event, ui ) {
                
                var values = $that.siblings(".slider-values");
                var minValue = values.find("span.min span.value");
                var maxValue = values.find("span.max span.value");
                minValue.text( ui.values[ 0 ].toFixed(2) );
                maxValue.text( ui.values[ 1 ].toFixed(2) );	
                
                values.find("input.range-min").val( ui.values[ 0 ].toFixed(2) );
                values.find("input.range-max").val( ui.values[ 1 ].toFixed(2) );
                
            }, stop: function( event, ui ) {
                
                var $sliderValues = $(".slider-values");
                
                var levelKey    = $( "#level-key" ).val();
                var $form       = $sliderValues.closest("form");
                var formAction  = $form.attr("action");
                var filter      = $form.find( "input[name=f]").val();
                var minElement  = $sliderValues.find("input.range-min");
                var maxElement  = $sliderValues.find("input.range-max");
                var minValue    = minElement.val();
                var maxValue    = maxElement.val();
                
                var url = formAction.split("?")[1];

                url += "&f=" + filter;
                url += "&" + minElement.attr("name") + "=" + minValue;
                url += "&" + maxElement.attr("name") + "=" + maxValue;
                
                if(window.history.pushState){
                    window.history.pushState({},"",window.location.pathname + "?" + url)
                }
                
                url = "/ajax-products?level_key=" + levelKey + "&" + url;
                
                // Set Loading
                $(".products-list").addClass("loading");//.html( "Loading..." );	
                
                $.ajax({
                url: url,
                success: function( data) {
                    filterAndPagingSuccess( data );
                }
                });
                
                
            }
            
            });
            
        });	
        
    }



    function filterAndPaging() {
        
        var levelKey = $( "#level-key" ).val();
        
        $(".filter-options").on( "click", "a", function( event ) {
            
            event.preventDefault();
            event.stopPropagation();
            var $target    = $( event.target );
            
            if ($target.nodeName != "a" ) {
                $target = $target.closest("a");
            }
            
            var link       = $target.attr("href");
            
            if (!link) {
                return;
            }
            
            var parameters = link.split("?");
            var url        = "/ajax-products?level_key=" + levelKey;
            
            var originalParamters = parameters[1];
            
            if ( originalParamters ) {
                url += "&" + originalParamters;
            }
            
            if(window.history.pushState){
                window.history.pushState({},"",link);
            }
            
            // Set Loading
            $(".products-list").addClass("loading");//.html( "Loading..." );			 
            
            $.ajax({
                url: url,
                success: function( data) {
                
                    filterAndPagingSuccess( data );
                
                    $target.closest("li").toggleClass("selected");
                
            }
            });
            
            
            
        });
        
        var $btn = $("#paging-next");
        
        if($btn.length){
            $(document).on("scroll",function(){
                var $btn = $("#paging-next");
                if($btn.hasClass("loading")) return;
                var top_of_element = $btn.offset().top;
                var bottom_of_element = $btn.offset().top + $btn.outerHeight();
                var top_of_screen = $(window).scrollTop();
                var bottom_of_screen = $(window).scrollTop() + $(window).height();
                var getting_near = 200;

                if((bottom_of_screen > bottom_of_element - getting_near) && (top_of_screen < top_of_element)){
                    $btn.trigger("click");
                }
            });
        }
        
        $("#paging-next").on("click", function() {
            
            event.preventDefault();
            
            var $that = $( this );
            
            var $target    = $( event.target );
            var link       = $that.attr("href");
            var parameters = link.split("?");
            var url        = "/ajax-products?level_key=" + levelKey;
            
            var originalParamters = parameters[1];
            
            $that.addClass("loading");
            
            if ( originalParamters ) {
                url += "&" + originalParamters;
            }
            
            $.ajax({
            url: url,
            success: function( data ) {
                $that.removeClass("loading");
                filterAndPagingSuccess( data, true );
            }
            });
            
        });
        
        $( "#sort-select" ).on( "change", function( event ) {
            
            $this = $( this );
            
            var selectedValue = $this.val( );	  
            var link          = $( '#sort-path' ).val( );
            link              = link + "&s=" + selectedValue;
            var url           = "/ajax-products?level_key=" + levelKey + "&" + link.split('?')[1];
            
            if(window.history.pushState){
                window.history.pushState({},"",link);
            }
            
            $(".products-list").addClass("loading");
            
            $.ajax({
                url: url,
                success: function( data ) {
                    filterAndPagingSuccess( data );
                }
                });

            });
        
    }

    function filterAndPagingSuccess( data, append ) {
        
        // Products
        var $productsList = $(".products-list");
        $productsList.removeClass("loading");
        if (!append) {
            $productsList.html( data.result.productsHTML );
        } else {
            $productsList.append( data.result.productsHTML );
        }
                
        // Filters
        var $filters = $( "#filters" );
        
        for ( var i = 0; i < data.result.filters.length; i++ ) {
            
            var $filter = $filters.find( "ul[data-filter=" + data.result.filters[i].name + "]" );
            var $prices = $filters.find(".price-filter[data-filter=" + data.result.filters[i].name + "]");	

            if ($filter.length > 0) {
            
                for ( var k = 0; k < data.result.filters[i].values.length; k++ ) {
                    
                    var $filterValue = $filter.find( "li[data-filter-value='" + data.result.filters[i].values[k].key + "']" );

                    if ($filterValue) {				
                    var path = data.result.filters[i].values[k].path.replace( new RegExp("&amp;", "g" ), "&" );				
                    $filterValue.find( "a" ).attr("href", path );			
                    }
                    
                }
            
            }
            if ($prices.length > 0) {
                var path = data.result.filters[i].rangePath.replace( new RegExp("&amp;", "g" ), "&" );			
                $prices.attr("action", path );
            }
            
        }
        
        // Sort Path	
        var sortPath = data.result.sortPath.replace( new RegExp("&amp;", "g" ), "&" );
        
        $("#sort-path").val( sortPath );
        
        // More	
        var $pagingNext = $("#paging-next");
        
        var found = false;
        
        for ( var i = 0; i < data.result.pages.length; i++ ) {
            
            if ( data.result.pages[i].type === "N" ) {
                
                var path = data.result.pages[i].path.replace( new RegExp("&amp;", "g" ), "&" );	

                $pagingNext.removeClass("off");
                
                $pagingNext.attr( "href" , path );
                found = true;
                break;
                
            }
            
        }
        
        if (!found) {
            $pagingNext.addClass("off");
        }
        
        // Total item count
        $("#total-item-count").text( data.result.total );
        
         $(document).trigger("categoryUpdated");
        
    }



    function quickSearch() {
        
        
        $( document ).on("click", ".search-box:not(.is-ready)", function() {
            
            var $input = $( ".search-box" );
            
            $input.addClass("is-ready");
            
            var $quickSearchResults = $( "#quick-search-results" );
            var $searchWrapper      = $( document.body );
            
            if (!$quickSearchResults.length) {
                $quickSearchResults = $( "<div id=\"quick-search-results\"></div>" ).appendTo( $searchWrapper ).hide( );
            }
            
            $input.attr( "autocomplete", "off" );
            
            $input.on( "focusin", function() {	
            
                $this = ( this );
                if ($this.value.length > 2) {
                    $( "#quick-search-results" ).show();
                }		
                
            }).on( "keyup", function() {
            
                $this     = $( this );
                var value = $this.val();
                
                if (value.length <= 2 ) {
                    return;
                }		

                $quickSearchResults.show();
            
                $.ajax({
                    url: "/quick-search?search=" + value,
                    success: function( data ) {
						if (data.term === value) {					
							$quickSearchResults.html( data.result );
						}
                        
                    },
                    dataType: "json"
                });
            
            });
            
            $( document ).on("click", "#quick-search button", function() {
                $input = $( ".search-box" ).closest("form").submit();
            });

            
        });
        
    }

    function miniBasket() {
        
        $( document ).on( "click", ".mini-basket", function() {
            
            var $this         = $( this );
            var $countElement = $this.find( ".count" );
            var count         = $countElement.data("count");
            var $emptyBasket  = $this.find(".empty-basket");
            
            
            if (!count) {
                $emptyBasket.toggleClass("show");
            } else {
                window.location.href = "/basket";
            }
            
        });
        
        /*$( document ).on( "click", ".empty-basket", function() {		
            $( this ).removeClass("show");		
        });*/
        
    }

    function carFinder() {
        
        var $wrapper = $( ".select-car" );
        
        if ( $wrapper.length == 0 ) {
            return;
        }
        
        var levelKey = $wrapper.find("input[name='level_key']").val();
        
        updateCarFinder( "level_key=" + levelKey );
        
        $wrapper.find("select[name='make']").on( "change", function(){
            
            var $this = $( this );
            var value = $this.val();
            
            updateCarFinder( "level_key=" + levelKey + "&make=" + value );
            
        });
        
        $wrapper.find("select[name='model']").on( "change", function(){
            
            var $this = $( this );
            var value = $this.val();
            var url   = "level_key=" + levelKey + "&make=";
            
            url += $this.siblings("select[name='make']").val();
            
            url += "&model=" + value;
            
            updateCarFinder( url );
            
        });	
        
        $wrapper.find("select[name='year']").on( "change", function(){
            
            var $this = $( this );
            var value = $this.val();
            var url   = "level_key=" + levelKey + "&make=";
            
            url += $this.siblings("select[name='make']").val();
            url += "&model=" + $this.siblings("select[name='model']").val();
            url += "&year="  + value;
            
            updateCarFinder( url );
            
        });

        $wrapper.find("select[name='engine'], select[name='body']").on( "change", function(){

            var url   = "level_key=" + levelKey;
            
            url += "&make="   + $wrapper.find("select[name='make']").val();
            url += "&model="  + $wrapper.find("select[name='model']").val();
            url += "&year="   + $wrapper.find("select[name='year']").val();
            url += "&engine=" + $wrapper.find("select[name='engine']").val();
            url += "&body="   + $wrapper.find("select[name='body']").val();
            
            updateCarFinder( url );
            
        });		
        
        $wrapper.on("click", "button", function() {
            
            event.preventDefault();
        
            var path = $wrapper.find("#car-finder-path").val()

            if (!path) {
                return;
            }
            
            var parameters = path.split("?");
            var url        = "/ajax-products?level_key=" + levelKey;
            
            var originalParamters = parameters[1];
            
            if ( originalParamters ) {
                url += "&" + originalParamters;
            }
            
            // Set Loading
            $(".products-list").addClass("loading");//.html( "Loading..." );			 
            
            $.ajax({
            url: url,
            success: function( data) {
                filterAndPagingSuccess( data );
            }
            });
        
        });
        
        var $regWrapper = $(".part-finder .reg");
        if ($regWrapper.length == 0) {
            return;
        }
        
        $regWrapper.on("click", "button", function() {
            
            event.preventDefault();
            var $this = $( this );		
            var val   = $this.siblings("input").val();
            
            if (!val) {
                return;
            }
            
            $.ajax({
                url: '/part-finder-reg?reg=' + val,
                success: function( data ) {
                    
                    if ( !data.result.reg ) {
                        return;
                    }
                    
                    var levelKey = $wrapper.find("input[name='level_key']").val();
                
                    var url   = "level_key=" + levelKey;
            
                    url += "&make="   + data.result.make;
                    url += "&model="  + data.result.model;
                    url += "&year="   + data.result.year;
                    url += "&engine=" + data.result.engine;
                    url += "&body="   + data.result.body;
                    
                    updateCarFinder( url );
                
                }
            });
            
        });
        
    }

    function updateCarFinder( parameters ) {
        
        var $wrapper = $( ".select-car" );
        
        parameters += "&fMake="   + $wrapper.find("input[name='make-filter']").val();
        parameters += "&fModel="  + $wrapper.find("input[name='model-filter']").val();
        parameters += "&fYear="   + $wrapper.find("input[name='year-filter']").val();
        parameters += "&fEngine=" + $wrapper.find("input[name='engine-filter']").val();
        parameters += "&fBody="   + $wrapper.find("input[name='body-filter']").val();

        $.ajax({
            url: "/part-finder?" + parameters,
            dataType: "json",
            success: function( data ) {
                
                // Make
                var $selectMake = $wrapper.find("select[name='make']");			
                $selectMake.html( data.result.make.html );
                
                // Model
                var $selectModel = $wrapper.find("select[name='model']");			
                $selectModel.html( data.result.model.html );
                if ( data.result.model.count > 0 ) {
                    $selectModel.removeAttr("disabled");
                } else {
                    $selectModel.attr("disabled","disabled");
                }
                
                // Year
                var $selectYear = $wrapper.find("select[name='year']");			
                $selectYear.html( data.result.year.html );
                if ( data.result.year.count > 0 ) {
                    $selectYear.removeAttr("disabled");
                } else {
                    $selectYear.attr("disabled","disabled");
                }	
                
                // Engine
                var $selectEngine = $wrapper.find("select[name='engine']");			
                $selectEngine.html( data.result.engine.html );
                if ( data.result.engine.count > 0 ) {
                    $selectEngine.removeAttr("disabled");
                } else {
                    $selectEngine.attr("disabled","disabled");
                }	

                // Body
                var $selectBody = $wrapper.find("select[name='body']");			
                $selectBody.html( data.result.body.html );
                if ( data.result.body.count > 0 ) {
                    $selectBody.removeAttr("disabled");
                } else {
                    $selectBody.attr("disabled","disabled");
                }			
                
                // Filter Path
                var path = data.result.filterUrl.replace( new RegExp("&amp;", "g" ), "&" );	
                            
                $wrapper.find("#car-finder-path").attr("value", path );
            }
        });	
    }

    function voucher() {
        
        $( "form.voucher" ).on( "submit", function(){
            
            event.preventDefault();
            
            var $this  = $( this );
            var action = $this.attr("action");
            var data   = $this.serialize();
            
            $.ajax({
                type: "POST",
                url: action,
                data: data
            }).done(function(){
                location.reload();
            });

        });
        
    }

    function swatch() {
        
        $( document ).on("mouseenter", ".box.product .alternatives img", function() {
            
            var $this = $( this );
            
            if ($this.hasClass("selected")) {
                return;
            }
            
            var counter = $this.data("counter");
            
            $this.closest("article").find("a img.active").toggleClass("active");
            $this.closest("article").find("a img[data-counter='" + counter + "']").toggleClass("active");
            
            $this.siblings(".selected").toggleClass("selected");
            $this.toggleClass("selected");
            
        });
		
		$( document ).on("mouseenter", ".configure .colour li", function() {
            
            var $this = $( this );
            
            if ($this.hasClass("selected")) {
                return;
            }
			
			var $img = $this.find("img");
            
            var counter = $img.data("counter");
			
			var $carouselItems = $( ".carousel-items" );
            
            $carouselItems.find("img.swatch.active").toggleClass("active");
            $carouselItems.find("img.swatch[data-counter='" + counter + "']").toggleClass("active");
            
            $this.siblings(".selected").toggleClass("selected");
            $this.toggleClass("selected");
            
        });
        
    }
	
	function quickView() {
	
		$( document ).on( "click", ".quick-view-button", function() {
			
			var $this          = $( this );
			var materialNumber = $this.data("material");
			
			$.ajax({
				type: "GET",
				url: "/quick-view?product-code=" + materialNumber,
				dataType: "json",
				success: function( data ) {
					
					var $body = $( document.body );
					
					$body.append( data.result );
					
					$( "#quick-view" ).on( "click", ".close", function() {
			
						$("#quick-view-overlay").remove();
						$("#quick-view").remove();
						
					});
					
				}
			})
			
		});
		
	}
	
	function qandq() {
		
		$(".questions").on("click", ".q", function(){
			
			var $this   = $( this );
			var $li     = $this.closest("li");
			var $detail = $li.find(".detail");
			$detail.toggleClass("active");
			
		});
		
	}
	
	function productPage() {
		
        if($(".layout-product").length){
		    require(["controllers/product"]);
        }
	}
	
	function addressBook() {
		$("#address-book").on("click", ".add-new", function() {
			event.preventDefault();
			var $this = $( this );
			var $form = $this.find("form");
			$form.submit();
		});
	}

    function carousel(){
        require(["plugins/weave-plugins"],function(){
            $(".weave-content-scroller").weaveContentScroller({autoScroll:true});
        });
    }
    
    function viewType(){
        $(".view-type").on("click",function(){
            $(".layout-products").toggleClass("list");
        });
    }
	
	function lists() {
		
		$(".toggle-lists").on("click", function() {
			$(".lists").toggleClass("active");
		});
		
		$(".lists").on("click", "li", function() {
			var $this = $( this );
			var $form = $this.closest("form");			
			var list  = $this.data("list");
			var name  = $this.data("list-name");
			var $currentList = $form.find("input[name='list']");
			if (list === $currentList.val()) {
				return;
			}
			$currentList.val(list);
			$form.find("button[type='submit']").text("Add to " + name);
			
			$(".lists").removeClass("active");
			
		});
		
		$(".add-to-list").on("click","form button[type='submit']", function(){
			event.preventDefault();
			var $this = $( this );
			var $form = $this.closest("form");
			$(".lists").removeClass("active");
			
			$.ajax({
				type: "POST",
				url: "/add-to-list",
				data: {
					"list": $form.find("input[name='list']").val(),
					"product-number": $form.find("input[name='product-number']").val(),
					"add-to-list": "add-to-list"
				},
				dataType: "json",
				success: function( data ) {
					$('#added-to-list').addClass("active");
					setTimeout(function(){
						$('#added-to-list').removeClass("active");
					}, 2000);
				}
			})
		
		
		})
		
	}
	
	function myLists() {
		$(".my-lists").on("click", "li", function() {
			
			var $this = $( this );
			if ( $this.hasClass( "active" ) ) {
				return;
			}
			var listKey = $this.data("list");
			$this.siblings(".active").removeClass("active");
			$this.addClass("active");
			
			$(".list-products.active").removeClass("active");
			$(".list-products[data-list='" + listKey + "']").addClass("active");			
			
		});
	}
	
	function reorder(){
		$(".reorder").on("submit", function(event){
            var $this = $(this);
			event.preventDefault();
            require(["controllers/add-to-basket"],function(AddToBasket){
                 var products = [];
                 $this.find(".order-items .col-select-item").each(function(){
                     var $col = $(this);
                     var productNumber = $col.find("input[name='product-number']").val();
                     var quantity = $col.find("input[name='quantity-" + productNumber + "']").val();
                     var unit = $col.find("input[name='unit-" + productNumber + "']").val();
                     products.push({
                         productNumber: productNumber,
                         quantity:quantity,
                         unit:unit || "EA"
                     });
                 });
                 AddToBasket.addToBasket(products);
            });
		});
	}
    
    init();

});

