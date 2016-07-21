define([ "jquery"],function($){
	/**Compare Object**/
	var obj;
    if(!obj){
        obj = new Class();
    }
    return obj;
    
	function Class(_options){
        
        var $addedToBasketWrapper;
        
        function init(){
            $( document ).on( "click", "input[name='add-to-basket'], button[name='add-to-basket']", function() {
            
                event.preventDefault();
                
                var $this           = $( this );		
                var $form           = $this.closest( "form" );
                var $productNumbers = $form.find( "input[name='product-number']" );
                var products        = [];
                
                $productNumbers.each( function(){
                
                    var $this         = $( this );
                    var productNumber = $this.val();			
                    var unit          = $form.find( "input[name='unit-"     + productNumber + "']" ).val();
                    var quantity      = $form.find( "input[name='quantity-" + productNumber + "']" ).val();	

                    products.push({
                        productNumber:productNumber,
                        unit:unit,
                        quantity:quantity
                    });
                
                });
                
                addToBasket(products);
                
            });
            
            $( document ).on("click", "#added-to-basket .close", function(){
                $addedToBasketWrapper.hide();
            });
            
            $(document).on("submit",".delete-item",function(event){
                event.preventDefault();
                var productNumber = $(this).find("input[name='product-number']").val();
                 remove([{
                    productNumber:productNumber 
                 }],function(){
                     window.location.reload();
                 });
                 
            });
            
            $(document).on("submit",".item-qty",function(event){
                event.preventDefault();
                var productNumber = $(this).find("input[name='product-number']").val();
                var unit          = $(this).find( "input[name='unit-"     + productNumber + "']" ).val();
                var quantity      = $(this).find( "input[name='qty-" + productNumber + "']" ).val();	
                changeQuantity([{
                    productNumber:productNumber,
                    quantity:quantity,
                    unit: unit
                 }],function(){
                     window.location.reload();
                 });
                 
            });

        }
        
        function addToBasket(Products){
            if(!Products) return;
            //object passed in not array
            if(Products.length === undefined){
                Products=[Products];
            }
            
            $addedToBasketWrapper = $( "#added-to-basket-wrapper" );

            if (!$addedToBasketWrapper.length) {
                $addedToBasketWrapper = $( "<div id=\"added-to-basket-wrapper\"><div id=\"added-to-basket-wrapper-inner\"></div></div>" ).appendTo( document.body ).hide( );
            }
            
            var parameters=[];
            
            for(var i in Products){
                parameters.push({
                    name: "product-number",
                    value: Products[i].productNumber
                });
                parameters.push({
                    name: "unit-" + Products[i].productNumber,
                    value: Products[i].unit
                });
                parameters.push({
                    name: "quantity-" + Products[i].productNumber,
                    value: Products[i].quantity
                });
            }
            
            if (parameters.length == 0) {
                return;
            }
            parameters.push({
                name: "action",
                value: "add-to-basket"
            });
            doRequest(parameters,basketPopup);
        }
        
        function basketPopup(data){
            var $wrap = $("#added-to-basket-wrapper-inner");
            $wrap.html( data.result.html );
            $addedToBasketWrapper.show();
            
            $( ".mini-basket" ).html( data.result.miniBasket );
        }
        function changeQuantity(Products,fCallback){
            var parameters = [];
             for(var i in Products){
                parameters.push({
                    name: "product-number",
                    value: Products[i].productNumber,
                });
                parameters.push({
                    name: "quantity-" + Products[i].productNumber,
                    value: Products[i].quantity
                });
                parameters.push({
                    name: "unit-" + Products[i].productNumber,
                    value: Products[i].unit
                });
            }
            parameters.push({
                name: "action",
                value: "update-item-quantity"
            });
            doRequest(parameters,function(data){
                updateMiniBasket(data);
                fCallback();
            });
        }
        function remove(Products,fCallback){
             var parameters = [];
             for(var i in Products){
                parameters.push({
                    name: "product-number",
                    value: Products[i].productNumber,
                });
                parameters.push({
                    name: "quantity-" + Products[i].productNumber,
                    value: 1
                });
                parameters.push({
                    name: "unit-" + Products[i].productNumber,
                    value: "EA"
                });
            }
            parameters.push({
                name: "action",
                value: "remove-basket-item"
            });
            doRequest(parameters,function(data){
                updateMiniBasket(data);
                fCallback();
            });
        }
        function updateMiniBasket(data){
            if(!data.result) return;
            $( ".mini-basket" ).html( data.result.miniBasket );
        }
        function doRequest(parameters,fCallback){
            $.ajax({
                type: "POST",
                url: "/add-to-basket",
                data: parameters,
                dataType: "json",
                success: fCallback,
                error:fCallback
            });	
        }
        
        init();
        
        return {
            addToBasket:addToBasket,
            remove:remove
        }
	}
});