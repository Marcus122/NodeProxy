$(document).ready(function() {
	
	toggles();
	nav();
	sectionedContent();
	scroll();
	sliders();
	filterAndPaging();
	quickSearch();
	miniBasket();
	addToBasket();
	voucher();
	carFinder();
	swatch();
	carousel();
});

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
			
			var url = "/ajax-products?level_key=" + levelKey + "&" + formAction.split("?")[1];

			url += "&f=" + filter;
			url += "&" + minElement.attr("name") + "=" + minValue;
			url += "&" + maxElement.attr("name") + "=" + maxValue;
			
			// Set Loading
		    $(".products-list").html( "Loading..." );	
			
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
		
		// Set Loading
		$(".products-list").html( "Loading..." );			 
		
		$.ajax({
			url: url,
			success: function( data) {
			  
				filterAndPagingSuccess( data );
			  
				$target.closest("li").toggleClass("selected");
			  
		  }
		});
		
		
		
	});
	
	$("#paging-next").on("click", function() {
		
		event.preventDefault();
		
		var $that = $( this );
		
		var $target    = $( event.target );
		var link       = $target.attr("href");
		var parameters = link.split("?");
		var url        = "/ajax-products?level_key=" + levelKey;
		
		var originalParamters = parameters[1];
		
		if ( originalParamters ) {
			url += "&" + originalParamters;
		}
		
		$.ajax({
		  url: url,
		  success: function( data ) {
			 filterAndPagingSuccess( data, true );
		  }
		});
		
	});
	
	$( "#sort-select" ).on( "change", function( event ) {
     
      $this = $( this );
	  
      var selectedValue = $this.val( );	  
	  var value         = $( '#sort-path' ).val( ).split("?")[1];
      var url           = "/ajax-products?level_key=" + levelKey + "&s=" + selectedValue + "&" + value;

	  
	  $.ajax({
		  url: url,
		  success: function( data ) {
			filterAndPagingSuccess( data );
		  }
		});

    });
	
}

function filterAndPagingSuccess( data, append = false ) {
	
	// Products
	var $productsList = $(".products-list");
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
					$quickSearchResults.html( data.result );
					
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

function addToBasket() {
	
	$( document ).on( "click", "input[name='add-to-basket'], button[name='add-to-basket']", function() {
		
		event.preventDefault();
		
		var $addedToBasketWrapper = $( "#added-to-basket-wrapper" );

		if (!$addedToBasketWrapper.length) {
			$addedToBasketWrapper = $( "<div id=\"added-to-basket-wrapper\"><div id=\"added-to-basket-wrapper-inner\"></div></div>" ).appendTo( document.body ).hide( );
		}
		
		var $this           = $( this );		
		var $form           = $this.closest( "form" );
		var $productNumbers = $form.find( "input[name='product-number']" );
		var parameters      = [];
		
		$productNumbers.each( function(){
		
			var $this         = $( this );
			var productNumber = $this.val();			
			var unit          = $form.find( "input[name='unit-"     + productNumber + "']" ).val();
			var quantity      = $form.find( "input[name='quantity-" + productNumber + "']" ).val();	

			parameters.push({
				name: "product-number",
				value: productNumber
			});
			parameters.push({
				name: "unit-" + productNumber,
				value: unit
			});
			parameters.push({
				name: "quantity-" + productNumber,
				value: quantity
			});
		
		});
		
		if (parameters.length == 0) {
			return;
		}
		
		parameters.push({
			name: "action",
			value: "add-to-basket"
		});

		$.ajax({
			type: "POST",
			url: "/add-to-basket",
			data: parameters,
			dataType: "json",
			success: function( data ) {
				console.log(data);
				var $wrap = $("#added-to-basket-wrapper-inner");
				$wrap.html( data.result.html );
				$addedToBasketWrapper.show();
				
				$( ".mini-basket" ).html( data.result.miniBasket );
				
			}
		});		
		
		$( document ).on("click", "#added-to-basket .close", function(){
			$( "#added-to-basket-wrapper" ).hide();
		});
	  
	});
	
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
		$(".products-list").html( "Loading..." );			 
		
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
	
}

function carousel(){
	$(".carousel").weaveContentScroller({autoScroll:true});
}






