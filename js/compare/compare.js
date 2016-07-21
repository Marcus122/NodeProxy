define([ "jquery","compare/compareModel"],function($,Compare){
	/**Compare Object**/
	var obj;
    if(!obj){
        obj = new Class();
    }
    return obj;
    
	function Class(_options){
		var data;
        var options={
            maxDisplay: 3,
        }
        for(var i in _options){
            options[i]=_options[i];
        }
        var prevIndex = 0;
		var nextIndex = options.maxDisplay;
		
		
		var $checkBoxes = $('input[name="add-to-compare"]');
		var $compareListContainer = $('#compare-list-container');
		var $compareListSlider = $('#compare-list-slider');
		var $compareList = $('#compare-list');
		var $buttons = $compareListContainer.find('button');
		var $toolbarNav = $('#toolbar-nav');
		var $addToCompareButtons = $('.add-to-compare');
		
		initialiseList();
		
		function initialiseList(){
            
			if($checkBoxes.length){
				$.each($checkBoxes, function(i,checkbox){
					var $checkbox = $(checkbox);
					$checkbox.removeProp('disabled');
				});
			}
            Compare.getJSON(buildCompareList);
				
            function buildCompareList(_data){
				data=_data;
                for(var i=(data.products.length-1);i>=0;i--){
                    var product = data.products[i];
                    var $image = getProductAttribute(product,'MAINIMAGE');
                    var src = $image ? $image.value[0].value : '';
                    var $li = $('<li id="compare-' + product.matnr + '"><div style="width:52px;height:52px;padding:2px" class="compare compare-active compare-shrink compare-docked"><a href="' + unescape(product.path) + 
                                '"><img width="50" height="50" class="center" src="' + 
                                src + 
                                '?type=thumb&height=50&width=50"/></a></div></li>');
					
					$addToCompareButtons.filter("[data-material='"+ product.matnr +"']").addClass("selected");
                    $compareList.prepend($li);
                }
                
                if(data.products.length >= options.maxDisplay){
                    $.each($buttons, function(i,button){
                        var $button = $(button);
                        $button.addClass('active');
                    });
                }
                
                renderList();
            }
				
            function getProductAttribute(product,name){
                for(var j=0;j<product.attributes.length;j++){
                    var attr = product.attributes[j];
                    if(attr.attribute_key == name){
                        return attr;
                    }
                };
            }
		}
		

		var $buttonNext = $compareListContainer.find('button:last-of-type');
		var $buttonPrevious = $compareListContainer.find('button:first-of-type');
		$buttonNext.click(function(event){
			event.preventDefault();
			event.stopPropagation();
			var $listItems = $compareList.find('li');
			if(nextIndex < $listItems.length){
				$buttonPrevious.removeClass('disabled');
				nextIndex += 1;
				prevIndex += 1;
				var left = 70 * (nextIndex-3) * -1;
				$compareList.animate({left: left + "px"},300);
			}
			if(nextIndex == $listItems.length){
				$(this).addClass('disabled');
			}
		});
		
		
		$buttonPrevious.click(function(event){
			event.preventDefault();
			event.stopPropagation();
			var $listItems = $compareList.find('li');
			if(prevIndex > 0){
				$buttonNext.removeClass('disabled');
				prevIndex -= 1;
				nextIndex -= 1;
				var left = 70 * (nextIndex-3) * -1;
				$compareList.animate({left: left + "px"},300);
			}
			if(prevIndex == 0){
				$(this).addClass('disabled');
			}
		});
		
		$(document).on('click','.add-to-compare',function(event){
			var $this=$(this);
			var $matnr = $this.attr('data-material');
			event.stopPropagation();
			event.preventDefault();
			if($this.hasClass("selected")){
				removeFromCompareList($matnr);
				$this.removeClass("selected");
				return;
			}
			$this.addClass("selected")
			var $listItem = $('<li/>');
			prevIndex = 0
			nextIndex = options.maxDisplay;
			
			addToCompareList($matnr);
			$compareList.prepend($listItem);
			renderList();
			$compareListContainer.css({display:"flex"})
			$compareListContainer.addClass('active');
			
			
			var toolbarToggled = false;
			if(!$toolbarNav.hasClass('active')){
				$toolbarNav.addClass('active');
				toolbarToggled = true;
			}
							
			
			var $container = $(this).closest("article");
			
			var $image = $container.find(".swatch.active");
			if(!$image.length){
				$image=$container.find("img").first();
			}
			if(!$image.length){
				$image=$(".swatch.active").first();
			}
			if(!$image.length){
				$image=$(".carousel-items").find("img").first();
			}
			//var $imageContainer = $image.closest('div');
			var $imageClone = $image.clone();
			$imageClone.attr('id','');
			var $offset = $image.offset();
			//var $width = $imageContainer.width();
			var $width = $image.width( );
			var $divClone = $('<div/>');
			$divClone.append($imageClone);
			$divClone.css("width", $width);
			
			//var $lightBox = Fns.createOverlay();	
			//$lightBox.toggleClass('active');

			$('body').append($divClone);
			$divClone.addClass('product-compare');
			$divClone.offset({ top: $offset.top, left: $offset.left});
			$divClone.addClass('compare-active');
			$listItem.attr('id', 'compare-' + $matnr);
			$compareList.animate({left: "0px"},300);
			setTimeout(function() {
				  
				  var $localOffset =  ( $divClone.width() - 52 ) / 2;
				  
				  $divClone.animate({ padding:"2px", width: "52", height:"52", top: $offset.top + $localOffset, left: $offset.left + $localOffset  }, 500);
				  $imageClone.animate({ width: "50", height:"50"  }, 500);
				  
				  $offset = $listItem.offset();
				  $divClone.animate({ top: $offset.top + 2, left: $offset.left + 2}, 500);
				  
				  
				  setTimeout(function(){
					
					$listItem.append($divClone);
					$compareListContainer.toggleClass('active');
					//$lightBox.toggleClass('active');
					$divClone.addClass('compare-docked');
					if(toolbarToggled){
						$toolbarNav.removeClass('active');
					}
				  }, 1200);
			}, 500);		
		});
		
		$(document).on("categoryUpdated",categoryUpdated);

		/*$(document).on('click','.add-to-compare',function(event){
			if($(this).prop('checked')){
				var $matnr = $(this).attr('data-matnr');
				var $listItem = $('<li/>');
				prevIndex = 0
				nextIndex = options.maxDisplay;
				
				addToCompareList($matnr);
				$compareList.prepend($listItem);
				renderList();

				$compareListContainer.addClass('active');
				
				
				var toolbarToggled = false;
				if(!$toolbarNav.hasClass('active')){
					$toolbarNav.addClass('active');
					toolbarToggled = true;
				}
								
				var $width = $(this).closest('div').width();
				var $div = $(this).closest('div').prev();
				$div.css("width", $width);
				
				var $offset = $div.offset();
				//var $lightBox = Fns.createOverlay();	
				//$lightBox.toggleClass('active');
				
				var $divClone = $div.clone();
				$('body').append($divClone);
				$divClone.append($("<span class='adding-to-compare'>Adding to compare list</span>"));
				$divClone.addClass('compare');
				$divClone.offset({ top: $offset.top, left: $offset.left});
				$divClone.addClass('compare-active');
				$listItem.attr('id', 'compare-' + $matnr);
				$compareList.animate({left: "0px"},300);
				setTimeout(function() {
					  
					  var $image = $divClone.find('img.product');
					  var $localOffset =  ( $divClone.width() - 52 ) / 2;
					  
					  $divClone.addClass('compare-shrink');
					  $divClone.animate({ padding:"2px", width: "52", height:"52", top: $offset.top + $localOffset, left: $offset.left + $localOffset  }, 500);
					  $image.animate({ width: "50", height:"50"  }, 500);
					  
					  $offset = $listItem.offset();
					  $divClone.animate({ top: $offset.top + 7, left: $offset.left + 7}, 500);
					  
					  
					  setTimeout(function(){
						
						$listItem.append($divClone);
						$compareListContainer.toggleClass('active');
						//$lightBox.toggleClass('active');
						$divClone.addClass('compare-docked');
						if(toolbarToggled){
							$toolbarNav.removeClass('active');
						}
					  }, 1200);
				}, 500);				
			}
			else{
				removeFromCompareList($(this).attr('data-matnr'));
				$compareList.animate({left: "0px"},300);
				renderList();
			}
		});*/
		
		function categoryUpdated(){
			$addToCompareButtons = $('.add-to-compare');
			if(!data) return;
			for(var i=(data.products.length-1);i>=0;i--){
				var product=data.products[i];
				$addToCompareButtons.filter("[data-material='"+ product.matnr +"']").addClass("selected");
			}
		}
		
		function renderList(){
			var $listItems = $compareList.find('li');
			var count = $listItems.length;
			if(!count){
				$compareListContainer.hide();
			}else{
				//$compareListContainer.show();
			}
			/*$compareList.css({width: "70px" });*/
			$compareListSlider.css({width: "70px",height: "90px",overflow: "hidden" });
			$compareList.css({position: "relative", width: "280px" });
			$compareList.css({width: (count*70) + "px" });
			if(count > 1){
				
				var margin = 0;
				var factor = count;
				
				if(count > options.maxDisplay){
					factor = options.maxDisplay;
				}
				
				var width = factor * 70;
				
				$compareListSlider.css({width: width + "px" });
				
				var margin = 55 - ( factor *  ( 60 / 2 ) );
				$compareListContainer.css({marginLeft: margin + "px" });
				
				if(count > options.maxDisplay){
					$.each($buttons, function(i,button){
						var $button = $(button);
						if(i==0){
							$button.addClass('disabled');
						}
						else{
							$button.removeClass('disabled');
						}
						$button.addClass('active');
					});
				}
				else{
					$.each($buttons, function(i,button){
						var $button = $(button);
						$button.removeClass('active');
					});

				}
			}
		}
		
		function addToCompareList($matnr){
            Compare.add($matnr);
			var $checkBoxes = $('input[data-matnr="' + $matnr + '"]');
			$.each($checkBoxes, function(i,checkbox){
				var $checkbox = $(checkbox);
				$checkbox.prop('checked',true);
			});
		}
		
		function removeFromCompareList($matnr){
            Compare.remove($matnr);
			var $clone = $('#compare-' + $matnr);
			if($clone.length){
				$clone.remove( );
			}
			renderList();
			var $checkBoxes = $('input[data-matnr="' + $matnr + '"]');
			$.each($checkBoxes, function(i,checkbox){
				var $checkbox = $(checkbox);
				$checkbox.prop('checked',false);
			});
		}
	}
});