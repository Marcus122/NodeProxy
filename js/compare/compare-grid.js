define(["jquery","compare/compareModel"],function($,Compare){
	/**Compare Object**/
	
	return function (_attrsToShow,_cb){
		var cb=_cb;
		var $header, $list, $grid,$comparem,$container,$productList,$compare,$select,$title;
		var data={};
		var animateHead=false;
		var level_key = $('#level-key').val();
		var attrsToShow = _attrsToShow
		var $main = $('main');
		var start = 0;
		var end = 4;
		var oStart =0;
		var oEnd=4;
		var level;
		var $lightBox = $('#lightBox');
		var sort_by = 'name-asc';
		var page = 1;
		var perPage= 4;
		var show=4;
		var $compareListContainer = $('#compare-list-container');
		var $buttons = $compareListContainer.find('button');
		var $compareListSlider = $('#compare-list-slider');
		var $compareList = $('#compare-list');
		var animationTime=600;
		var maxDisplay = 4;
		var $footer = $('.usp');
		$lightBox.removeClass('active');
		
		//$link.toggleClass('active');
		
		if(!level_key) return false;
		
		buildBasicGrid();
		initialiseCompareGrid();
		events();
		
		
		function buildBasicGrid(){
			$container = $('<div id="compare-grid" class="inactive"></div>');
			$compare = $('<div class="compare-table"><h2>My Compare List</h2></div>');
			$title = $('<h3>Add to Compare</h3>')
			$select = $('<select/>');
			$select.append('<option value="name-asc">Name Ascending</option>')
				   .append('<option value="name-desc">Name Descending</option>')
				   .append('<option value="price-desc">Price - High to Low</option>')
				   .append('<option value="price-asc">Price - Low to High</option>');
			$header = $('<div class="compare-images"/>');
			$compare.append('<button class="close-grid button small secondary">Close</button>')
			$productList = $('<div class="product-list"/>');
			$container.append($productList.append($title).append($select))
					  .append($compare.append($header));
			$('body').append($container);
		}
		function initialiseCompareGrid(){
			Compare.getLevelData(level_key,function(data){
				setData(data);
				rebuild();
				animateGrid();
			});
		}
		function setData(_data){
			var prods = Compare.getProducts();
			level=_data;
			data.products = [];
			data.other = [];
			for(var i in level.products ){
				if( prods.indexOf(level.products[i].matnr) != -1 ){
					data.products.push(level.products[i]);
				}else{
					data.other.push(level.products[i]);
				}
			}
		}
		function buildProductList(){
			$productList.find('.product-list-inner').remove();
			var $productListInner=$('<div class="product-list-inner"/>');
			//$productList.find('.pages').remove();
			var $ul = $('<ul/>');
			var max = Math.ceil( data.other.length / perPage );
			if( page > max && max!=0 ){
				page = max;
			}
			oStart=page*perPage-perPage;
			oEnd=page*perPage;
			for(var i=oStart;i< data.other.length;i++ ){
				if(i===oEnd){
					break;
				}
				var $li = $('<li/>');
				$li.data('matnr', data.other[i].matnr );
				var $prod = $('<div class="prod"/>');
				//$prod.append('<h3>' + data.other[i].name + '</h3>' );
				var image = getProductAttribute(data.other[i],'MAINIMAGE');
				var src = image ? image.value[0].value + '?type=thumb&height=180&width=180' : "";
				var $img = $('<div class="image-box"><img alt="Product Image" src="'+ src + '"/></div>');
				$ul.append($li.append($prod.append($img).append('<h3>' + data.other[i].name + '</h3>' )));
				var $data = $('<div class="prod-data"/>');
				var $add = $('<form/>');
				$add.append('<input type="checkbox" name="add-to-compare"/>')
					.append('<label for="add-to-compare">Add to My Compare List</label>');
				$data.append($add);
				var rating = Math.ceil(( Math.random() * 10 ) / 2);
				$data.append('<img alt="Rating" src="/images/c/theme/demo-b2c/rating-' + rating  + '.png"/>');
				var $text = $('<p/>');
				var text = getProductAttribute(data.other[i],'Marketing Text Short');
				if( text ){
					$text.append(text.value[0].value);
				}
				$data.append($text);
				var $discount = $('<div class="discount"/>');
				var perc = getProductAttribute(data.other[i],'Percent Off');
				if( perc){
					$discount.append('<span>' + perc.value[0].value + '% OFF</span>' );
				}
				$data.append($discount);
				var $was = $('<div class="was"/>');
				var was = getProductAttribute(data.other[i],'Was Price');
				if(was){
					$was.append('<span>Was £' + was.value[0].value + '</span>');
				}
				$data.append($was);
				var $price = $('<div class="price"/>');
				var price = getProductPrice(data.other[i],'PRICE_INC_TAX','GBP');
				if(price){
					var symbol = price.symbol || "£";
					$price.append('<span>' + symbol + price.value + '</span>');
				}
				$data.append($price);
				$li.append($data);
					 
			}
			//$productList.append($ul);
			var $pages = $('<div class="pages"/>');
			$pages.append('<button class="prev paging"><</button>');
			var $ol = $('<ol/>');
			var start;
			if(max<=1){
				start=1;
			}else if(page===1){
				start=1;
			}else if(page === max){
				start=page-2;
			}else{
				start=page-1;
			}
			if( start < 1 ) start=1;
			for(var i=0;i<show;i++ ){
				if( start+i > max ){
					break;
				}
				var $li = $('<li>' + String(start+i) + '</li>' );
				if( page===start+i ){
					$li.addClass('active');
				}
				$ol.append($li);
			}
			var $span = $("<span>"+  page + "/" + max + "</span>");
			$pages.append($span).append('<button class="next paging">></button>')
			var $pagesTop = $pages.clone();
			$productListInner.append($pagesTop)
						.append($ul)
						.append($pages);
			$productList.append($productListInner);
			if( page === 1 ){
				$productList.find('button.prev').attr('disabled',true);
			}
			if( page >= max ){
				$productList.find('button.next').attr('disabled',true);
			}
		}
		function rebuild(){
			rebind();
			buildProductList();
			buildHeader();
			buildCompareGrid();
			modifyFooter();
		}
		function rebind(){
			$compare.find('.in').text(String(level.name));
			if(data.products.length){
				$compare.find('.from').text(String(start+1));
			}else{
				$compare.find('.from').text(String(0));
			}
			if(end < data.products.length ){
				$compare.find('.to').text(String(end));
			}else{
				$compare.find('.to').text(String(data.products.length));
			}
			$compare.find('.of').text(String(data.products.length));
			if(end>=data.products.length ){
				$compare.find('.right').attr('disabled',true);
			}else{
				$compare.find('.right').removeAttr('disabled');
			}
			if(start===0){
				$compare.find('.left').attr('disabled',true);
			}else{
				$compare.find('.left').removeAttr('disabled');
			}
			sort_products();
		}
		function sort_products(){
			switch(sort_by)
			{
				case 'price-asc':
					data.other.sort(function(a,b){ return parseFloat(getProductPrice(a,"PRICE_INC_TAX","GBP").value) - parseFloat(getProductPrice(b,"PRICE_INC_TAX","GBP").value) });
					break;
				case 'price-desc':
					data.other.sort(function(a,b){ return parseFloat(getProductPrice(b,"PRICE_INC_TAX","GBP").value) - parseFloat(getProductPrice(a,"PRICE_INC_TAX","GBP").value) });
					break;
				case 'name-desc':
					data.other.sort(function(a,b){ 
						if(a.name > b.name){
							return -1;
						}
						if( a.name < b.name ){
							return 1;
						}
						return 0;
					});
					break;
				case 'name-asc':
					data.other.sort(function(a,b){ 
						if(a.name < b.name){
							return -1;
						}
						if( a.name > b.name ){
							return 1;
						}
						return 0;
					});
					break;
			}
		}
		function buildHeader(){
			$header.empty();
			$header.append('<div class="total"><div>Viewing <strong class="from"/> to <strong class="to"/> of <strong class="of"/> compare products in <strong class="in"/></div></div>')
				   .append('<button class="left scroll">&lt;</button><button class="right scroll">&gt;</button>');
			if(end>data.products.length && start!=0){
				end=data.products.length;
				start--;
			}
			//Add in top row
			var $imageList = $('<div class="list"/>');
			var $ul = $('<ul/>');
			$header.append($imageList.append($ul));
			for(var i=0;i<data.products.length;i++){
				var $li = $('<li class="prod-image"/>');
				var $image = getProductAttribute(data.products[i],'MAINIMAGE');
				var src = $image ? $image.value[0].value + '?type=thumb&height=180&width=180' :'';
				var $img = $('<div class="image-box"><a href="' + unescape(data.products[i].path) + '"><img alt="Product Image" src="'+ src + '"/></a></div>');
				var $form = $('<form action="/basket" method="post"/>');
				$form.append('<input name="product-number" type="hidden" value="' + data.products[i].matnr + '"/>')
					.append('<button class="close button secondary small">X</button>')
					 .append('<input class="add-to-basket button small" name="add-to-basket" type="submit" value="Add to Basket">');
				$ul.append($li.append($img).append($form));
			}
			var left = $ul.children('li').first().outerWidth();
			if(start!=0){
				$ul.css('left',left*start*-1);
			}
		}
		function animateHeader(l){
			animateHead=true;
			$header.find('ul').animate({
				left:l
			},animationTime,function(){
				animateHead=false;
				buildCompareGrid();
			});
		}
		function events(){
			$compare.on('click','.close-grid',function(){
				hideCompareGrid();
			});
			$header.on('click','.scroll',function(){
				if(animateHead===true) return false;
				var l;
				left = $header.find('li').first().outerWidth();
				if($(this).hasClass('left')){
					l = "+=" + String(left);
					start-=1;
					end-=1;
				}else{
					l = "-=" + String(left);
					start+=1;
					end+=1;
				}
				animateHeader(l);
			});
			$header.on('click','.close',function(ev){
				ev.preventDefault();
				var matnr = $(this).closest('form').find('input[name="product-number"]').val();
				removeProduct(matnr);
				rebuild();
			});
			$productList.on('click','.prod',function(){
				var $this = $(this).closest('li');
				$productList.find('ul').css({height:$productList.find('ul').outerHeight() + 6});
				$this.addClass('animate');
				$this.css('top',$this.position().top );
				$this.css('left',$this.position().left );
				var $li = $($compare.find('ul li').get(start));
				var mLeft = $header.find('li').first().outerWidth();
				if($header.find('li').length === 1){
					mLeft=mLeft/2;
				}
				$li.animate({
					marginLeft: mLeft
				},animationTime);
				$this.animate({
					left: 412,
					top: 0
				},animationTime,function(){
					$productList.find('ul').removeAttr('style');
					addProduct($this.data('matnr'));
				});
			});
			$productList.on('click','.paging',function(){
				var $this = $(this);
				if($this.hasClass('prev')){
					page--;
					if(page<1) page=1;
					
				}else{
					page++;
					var max = Math.ceil( data.other.length / perPage );
					if( page > max ) page = max;
				}
				buildProductList();
			});
			$select.on('change',function(){
				var $this=$(this);
				if( $this.val() != sort_by ){
					sort_by = $this.val(); 
					sort_products();
					buildProductList();
				}
			});
			$productList.on("click", "ol li",function(){
				var $this=$(this);
				if(parseInt($this.text()) != page ){
					page=parseInt($this.text());
					buildProductList();
				}
			});
			$header.on("click", 'input[name="add-to-basket"]',function(){
				hideCompareGrid();
			});
		}
		function buildCompareGrid()
		{
			$compare.find('table').remove();
			$table = $('<table></table>');
			var $row = $('<tr/>');
			$row.append('<td class="image"/>');
			//Add in attributes
			$row = $('<tr/>');
			$row.append('<th class="heading">Specification</th>');
			
			var attributes=attrsToShow.attributes;
			var prices=attrsToShow.prices;
			if(end>data.products.length && start!=0){
				end=data.products.length;
				start--;
			}
			for(var i=start;i<data.products.length;i++){
				if( i === end ){
					break;
				}
				var product = data.products[i];
				$row.append('<th class="prod-cell">' + data.products[i].name + '</th>');
				
				/*for(var j in product.attributes){
					var attribute = product.attributes[j];
					if( !attributes[attribute.name] && attribute.name != 'Main Image' && attribute.type != 'HTML' ){
						attributes[attribute.name] = {};
					}
				}*/
			}
			$table.append($row);
			for( var i in prices ){
				$row = $('<tr/>').attr("data-name",prices[i].title);
				$row.append('<td class="heading">'+ prices[i].title  +'</td>');
				for(var j = start;j<data.products.length;j++ ){
					if( j === end ){
						break;
					}
					var $cell = $('<td class="prod-cell"/>');
					var price = getProductPrice(data.products[j], prices[i].name,'GBP');
					if(price){
						var symbol = price.symbol || "£";
						$cell.append( symbol + price.value );
					}
					$row.append($cell);
				}
				$table.append($row);
			}
			
			for( var i in attributes ){
				$row = $('<tr/>').attr("data-name",attributes[i].title);
				$row.append('<td class="heading">' + attributes[i].title + '</td>');
				for(var j = start;j<data.products.length;j++ ){
					if( j === end ){
						break;
					}
					var $cell = $('<td class="prod-cell"/>');
					var attr = getProductAttribute(data.products[j], attributes[i].name);
					if( attributes[i].name === "RATING" ){ //FUDGE FOR DEMO
						var rating = attr ? attr.value[0].value : Math.ceil(( Math.random() * 10 ) / 2);
						$cell.append('<img alt="Rating" src="/images/c/theme/demo-b2c/rating-' + rating  + '.png"/>');
					}
					else if(attr){
						switch(attr.type)
						{
							case 'CHAR':
								var text = $("<div/>").html( attr.value[0].value ).text();
								text = $("<div/>").html( text ).text();
								$cell.html( text );
								break;
							case 'HTML':
								//$cell.append( attr.value[0].value );
								break;
							case 'BOOL':
								$cell.append( attr.value[0].value );
								break;
							case 'IMG':
								//attributes[attribute.name].values.push(attribute.image[0].src);
								break;
							default:
								break;
						}
					}
					$row.append($cell);
				}
				$table.append($row);
			}
			$compare.append($table);
			rebind();
		}
		function animateGrid(cb){
			$(window).scrollTop(0);
			$container.removeClass("inactive");
			var $windowWidth = $(window).width();
			var $width = $main.width();
			var $offset = $main.offset();
			var leftOffset = $windowWidth;
			$container.offset({ left: leftOffset }).removeClass('inactive');
			$container.animate({ left: 0 }, animationTime,function(){
				$main.hide();
				modifyFooter();
				$('body').addClass("compare-list-active");
				if(cb) cb();
			});
			
		}
		function addProduct(matnr){
			var prod;
			for( i in data.other ){
				if( data.other[i].matnr === matnr){
					prod = data.other[i];
					data.other.splice(i,1);
					break;
				}
			}
			data.products.splice(start,0,prod);
			addToCompareList(matnr);
			rebuild();
		}
		function removeProduct(matnr){
			var prod;
			for( i in data.products ){
				if( data.products[i].matnr === matnr ){
					prod = data.products[i];
					data.products.splice(i,1);
					break;
				}
			}
			data.other.push(prod);
			removeFromCompareList(matnr);
			sort_products();
		}
		function getProductPrice(product,name,currency){
			for(var j=0;j<product.pricing.prices.length;j++){
				var price = product.pricing.prices[j];
				if(price.key == name){
					return price;
				}
			};
		}
		function getProductAttribute(product,name){
			for(var j=0;j<product.attributes.length;j++){
				var attr = product.attributes[j];
				if(attr.attribute_key == name){
					return attr;
				}
			};
		}
		//*** FUNCTIONS FOR DROPDOWN COMPARE LIST **//
		function removeFromCompareList($matnr){
			var $clone = $('#compare-' + $matnr);
			$clone.remove( );
			var $checkBoxes = $('input[data-matnr="' + $matnr + '"]');
			$checkBoxes.prop('checked',false);
			Compare.remove($matnr);
			renderList();
		}
		function addToCompareList($matnr){
			var $checkBoxes = $('input[data-matnr="' + $matnr + '"]');
			$checkBoxes.prop('checked',true);
			Compare.add($matnr);
		}
		function addToList(matnr){
			var prod;
			for( i in data.products ){
				if( data.products[i].matnr === matnr ){
					prod=data.products[i];
					break;
				}
			}
			if(!prod) return false;
			var $li = $('<li/>');
			$li.attr('id','compare-' + matnr);
			var $div = $('<div/>').css({ width: 52, height:52, padding:2});
			$div.addClass('compare')
				.addClass('compare-active')
				.addClass('compare-docked')
				.addClass('compare-shrink');//Not sure why we need so many classes - Dave?
			$div.append('<a href="' + prod.path + '"/>');
			var img = getProductAttribute(prod,'MAINIMAGE');
			var src = img ? img.value[0].value : "";
			var $img = $('<img src="' + src + '?type=thumb&height=50&width=50" height="50" width="50"/>');
			$div.find('a').append($img);
			$compareList.prepend($li.append($div));
			renderList();
		}
		function renderList(){
			var $listItems = $compareList.find('li');
			var count = $listItems.length;
			$compareListContainer.css({marginLeft: "30px" });
			$compareListSlider.css({width: "70px",height: "90px",overflow: "hidden" });
			$compareList.css({position: "relative", width: "280px" });
			$compareList.css({width: (count*70) + "px" });
			if(count > 1){
				
				var margin = 0;
				var factor = count;
				
				if(count > maxDisplay){
					factor = maxDisplay;
				}
				
				var width = factor * 70;
				
				$compareListSlider.css({width: width + "px" });
				
				var margin = 55 - ( factor *  ( 60 / 2 ) );
				$compareListContainer.css({marginLeft: margin + "px" });
				
				if(count > maxDisplay){
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
		function modifyFooter(){
			$footer.last().addClass('grid').css({ marginTop: $container.height() + 100 });
		}
		function hideCompareGrid(){
			$container.addClass('inactive');
			$main.show();
			$('body').removeClass("compare-list-active");
			$footer.removeClass('grid').removeAttr('style');
		}
		function display(){
			if($container.hasClass("inactive")){
				setData(level);
				rebuild();
				animateGrid();
			}
		}
		return{
			display:display
		}
	}
});