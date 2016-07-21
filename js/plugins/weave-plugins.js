    // Weave product sorter / filter
    // Takes a div or ul and sorts the children, dependent on the value of an input field.
    // Additionally takes an input 'sortInput' in the options, whose value is queried to grab the sortBy
    // values for the input are expected to be e.g. 'name-asc', 'price-desc'
    // a sort event is bound up to the onchange event of the input.
    // data values for sorting the children are retrieved from either data- attributes of the children. or elems with a class equal to the sortfield name. e.g. <span class="price">£10.00</span>
    //
    // Can also take options
    //    'filterInput' : the jQuery input element for the text to filter on, a filter method is bound to the keyup of this element.
    //    'filterOn' : the field name / data attribute the filter applies to.
    //    'filterClear' : the jQuery element which when clicked will clear the filter input field.
    //
    //
    // 
    //
    //
    //
    (function( $ ) {
        
        $.fn.weaveProductSorter = function(options){
            var settings = $.extend({
                'childSelector' : false,
                'sortInput' : $(),
                'filterInput' : $(),
                'filterClear' : $(),
                'filterOn' : 'name',
                'noResultsElem' : $(),
                'bindFilterTo' : 'keyup'
                }, options);
            var sortInputElem = settings.sortInput;
            var filterInputElem = settings.filterInput;
            var filterClearElem = settings.filterClear;
            var filterOn = checkFilterInputForFilterOnAttribute(filterInputElem) || settings.filterOn;
            var noResultsElem = settings.noResultsElem;
            var container = this;
            var items = settings.childSelector ? this.find(settings.childSelector) : this.children();
            
            if(items.length > 0 && noResultsElem)  noResultsElem.hide();
            if(sortInputElem.length > 0) bindUpOnChangeEventToSortInput(sortInputElem);
            if(filterInputElem.length > 0) bindUpOnKeyUpEventToFilterInput(filterInputElem, filterOn); 
            if(filterClearElem.length > 0) bindUpOnClickEventToFilterClear(filterClearElem);
            
            function checkFilterInputForFilterOnAttribute(filterInput) {
                return  filterInput.data("filterOn");
            }
            
            function bindUpOnChangeEventToSortInput(sortInputElem) {
                sortInputElem.on("change", function(){
                   doSort();
                });
            }
            
            function doSort(){
                if (!sortInputElem.length < 0) return; // might be using the plugin just as a filter with no sort functionality.
                sortBy(sortInputElem.val()); 
            }
            
            function showNoResultsIfAllItemsHidden() {
                if (! noResultsElem) return;
                var visibleItems = settings.childSelector ? container.find(settings.childSelector + ":visible") : container.children(":visible");
                if (visibleItems.length == 0) {
                    noResultsElem.show();
                }
            }
            
            function getItemsWhereThisAttributeDoesntContainThisString(attributeName, filterString , items) {
                var nonMatchingItems = [];
                var lcaseFilterString = filterString.toLowerCase();
                var lim= items.length; //TODO only search visible items?
                for (var i = 0 ; i < lim; i++) {
                    data = getProductData(attributeName,$(items[i]));
                    if (data.indexOf(lcaseFilterString) == -1) {
                        nonMatchingItems.push(items[i]);
                    }
                }
                return nonMatchingItems;
            }
            
            function showAllItems(){
                container.empty();
                container.append(items);
                noResultsElem.hide();
            }
            
            function bindUpOnKeyUpEventToFilterInput(filterInputElem, filterOn) {
                filterInputElem.on(settings.bindFilterTo, function(){
                    var filterVal = $(this).val();
                    showAllItems(); //reset (then we'll rehide the ones we dont want)
                    var itemsToHide = getItemsWhereThisAttributeDoesntContainThisString(filterOn, filterVal, items);
                    $(itemsToHide).detach(); // We remove from DOM to hide... this preserves nth-child selector styles.
                    //re-sort the list.
                    doSort();
                    showNoResultsIfAllItemsHidden();
                });
            }
            
            function bindUpOnClickEventToFilterClear(filterClearElem) {
                filterClearElem.on("click", function(){
                    showAllItems();
                    filterInputElem.val("");
                    doSort();
                    noResultsElem.hide();
                })
            }
            
            function sortBy(nameOfDataFieldToSortByWithAscDesc) { //arg may have -asc or -desc on the end e.g. "name-asc"
                var ascending = true;
                var dataToElemMapping = {}; //maps the sort field value to dom elems for sorting e.g. {"tom" : someDomObject, "bill" : someDomObject} 
                var keys = [];              
                var nameOfDataFieldToSortBy = cleanAnyAscDescOffThisString(nameOfDataFieldToSortByWithAscDesc);
                if(nameOfDataFieldToSortByWithAscDesc.indexOf('-desc') != -1) ascending = false;
                var items = settings.childSelector ? container.find(settings.childSelector) : container.children();
                var lim = items.length;
                for (var i = 0; i < lim; i++){
                    var $theElem = $(items[i]);
                    var key = getProductData(nameOfDataFieldToSortBy, $theElem);
                    keys.push(key);
                    dataToElemMapping[key] = $theElem;
                }
                
                items.detach();
                keys.sort();
                if (!ascending) keys.reverse();
                appendElementsInOrderOfKeys(keys, dataToElemMapping, container);
            }
            
            function cleanAnyAscDescOffThisString(sortByString){ //removes a trailing -asc or -desc
                var ascLocation = sortByString.indexOf("-asc");
                if (ascLocation != -1) {
                    return sortByString.slice(0,ascLocation);
                }
                var descLocation = sortByString.indexOf("-desc");
                if (descLocation != -1) {
                    return sortByString.slice(0,descLocation);
                }
            }
            
            function getProductData(dataName, $elem){
                //first search for a data attribute on the elem.
                var data = $elem.data(dataName);    
                if ($elem.data(dataName)) return data.toLowerCase();
                
                //failing that search a little deeper for a data attribute, could be in a child of the child for instance.
                var someChild = $elem.find(["data-" + dataName]); 
                if (someChild.length) {
                    return someChild.data(dataName);
                }   
                
                //failing that, search for a class and pull out the contents e.g. <span class="name">My awesome Product</span>
                data = $elem.find("." + dataName);  
                if (data) return data.text();
            }
            
            function appendElementsInOrderOfKeys(sortedKeyList, keyToElemMapping, container){
                var lim = sortedKeyList.length;
                for(var i=0;i<lim;i++) {
                    var elem = keyToElemMapping[sortedKeyList[i]];
                    container.append(elem);
                }
            }
            
        }
        
    }(jQuery));
    
    

    
    // Weave Column Builder jQuery Plugin.
    // Takes a ul element, and clones it into multiple ul elements each containing an equal share of the contained li's.
    // This can be used to produce nice columns... e.g. for nav links.
    // Useage:
    // add a data-columns attribute to the ul, or pass an integet into the plugin, and call.
    // $("#my-ul").weaveColumnBuilder(3);
    //
    (function( $ ) {
        
        $.fn.weaveColumnBuilder = function(numColumns) {
            setUpColumns(this, numColumns);
        }
        
        
        function setUpColumns(elem, numColumns) {
            var initialContainer = elem;
            var columnItems = initialContainer.find('li'),
            column = 1; // (one column already exists so don't start from 0)
            
            
            function updateColumns(columns){
                column = 0;
                var numPerColumn = Math.ceil((columnItems.length / columns.length));
                columnItems.each(function(idx, el){
                    if (idx != 0 && (idx % numPerColumn == 0)){
                        column += 1;
                    }
                    $(columns.get(column)).append(el);
                });
            }
            
            function setupColumnsAndReturnElements(){
                var columnElements = [];
                columnElements.push(initialContainer);
                columnItems.detach();
                var newElem = initialContainer;
                var numberOfColumns = numColumns || initialContainer.data('columns');
                while (column++ < numberOfColumns ){
                    var insertAfterMe = newElem;
                    var newElem = initialContainer.clone()
                    newElem.insertAfter(insertAfterMe);
                    columnElements.push(newElem);
                }
                return $(columnElements);
            }
            
            updateColumns(setupColumnsAndReturnElements());  
        }
        
    }(jQuery));
    
    



   /*
    *  
    *  Weave ContentScroller Plugin for Jquery.
    *  Adapted from code on the shop.weaveability test site.
    *  What it does:
    *  Takes a ul element and turns it into a carousel, or slide scroller.
    *  Useful for banners, product lists etc.
    *  Changed to be made more or less responsive.. could still use some work.
    *  TODO: Needs a definite tidy up... index is weird espesh the 'inifinteScroll' if statements... looks hacky.
    *  
    *  Basic useage:
    *  
    *  HTML
    *  <div id="my-id"><ul><li>Slide 1</li><li>Slide 2</li></ul></div>
    *  
    *  JS
    *  $("#my-id").weaveCarousel();
    */
    
    (function( $ ) {
 
    $.fn.weaveContentScroller = function(options) {
        var settings = $.extend({
            // These are the defaults.
            pauseTime: 6000,
            slidingDuration: 700,
            showTabs: true,
            autoScroll: false,
            navNextId: "#carousel-next", //Id of the 'next' button if you want to add one
            navPrevId: "#carousel-previous", //Id of the 'prev' button if you want to add one
            tabHolderSelector: '.weave-content-scroller-index-markers',
            tabClass : 'index-marker',
            infiniteScroll : true,
            onChange : function() {return;},
            swipeSupport : true
        }, options );
        
        
        
        var original_slides = this.find("li");
        var container = this.find("ul");
        var numSlides = original_slides.length;
        var infiniteScroll = settings.infiniteScroll;
        //TODO: implement infiniteSCroll
        if (infiniteScroll) {
        original_slides.first().clone().appendTo(container);//adding the 1st again to the end for looping purposes
        original_slides.last().clone().prependTo(container);	
        }
        
        var slides = this.find('li'); //reselect including the ones we just added.
        var index = 0;
        if (!infiniteScroll) {
            index = -1; //quick hack, we obviously don't want to skip the first slide if it isn't a duplicate.. see the other if a few lines above this
        }
        var pauseTime = settings.pauseTime;
        var slidingDuration = settings.slidingDuration;
        var navNextId = settings.navNextId;
        var navPrevId = settings.navPrevId;
        var horizontalMovementAmount = slides.width(); //size of the image? size of the li elements ie carousel size? + extra for styling
        var negativeHorizontalMovementAmount = slides.width() * -1;
        var timeout;
        var active = false;
        var indexMarkerIndex = 0;
        var previousIndex = 0;
        var tabHolderSelector = settings.tabHolderSelector;
        var tabClass = settings.tabClass;
        var autoScroll = settings.autoScroll;
        var showTabs = settings.showTabs;
        var mainDiv = this;
        var onChange = settings.onChange;
        var swipeSupport = settings.swipeSupport;
        
        slides.css('left', negativeHorizontalMovementAmount);
        
        $(window).resize(function() {recalculateWidthsOnResize();});
        
        if (showTabs)
        {
            PopulateIndexMarkers(this);
        }
        ProcessClickBinds(this);
        ProcessHighlightedIndexMarker(index);
        AddActiveClassToActiveSlide(index);
        onChange(slides[index +1]);
        
        if (autoScroll) {
            ContinuousLoop();
        }
        recalculateWidthsOnResize();
        
        function recalculateWidthsOnResize(){
            var containerWidth = container.parent().width();         
            slides.each(function(){                         
                $(this).width(containerWidth);
            });
            horizontalMovementAmount = slides.width();
            negativeHorizontalMovementAmount = horizontalMovementAmount * -1;
            //re-scroll to the current slide to assure alignment
            slides.css("left", negativeHorizontalMovementAmount * (1 + index));
        }
        
        function PopulateIndexMarkers(that){
            var indexMarkerHolder = that.find(tabHolderSelector);
            if (!indexMarkerHolder.length && showTabs){  //create the holder if it doesnt exist.
                indexMarkerHolder = $("<div>", {'class':tabHolderSelector.slice(1,tabHolderSelector.length)});//slice to remove leading . from class.
                that.append(indexMarkerHolder);
            }
            var i = -1;
            while (++i < numSlides){
                var index_marker = $("<div>", {'class':tabClass});
                indexMarkerHolder.append(index_marker);
            }
        }
        
        function ProcessHighlightedIndexMarker(index){
            var index_markers = $(mainDiv).find(tabHolderSelector + " div");
            index_markers.removeClass('active');
            index_markers.eq(index).addClass('active');
        }
        
        function ProcessClickBinds(that){
            $('body').on("click", navNextId, function(){
                if(active) return;
                active = true;
                ChangeAllCarouselImages('forwards');
            });	
            $('body').on("click", navPrevId, function(){
                if(active) return;
                active = true;
                ChangeAllCarouselImages('backwards');
            });
            that.on("click", ('.index-marker'), function(){
                if(active) return; 
                active = true;
                indexMarkerIndex = $(this).index();
                ChangeAllCarouselImages('index-marker');
            });
            if (swipeSupport) {
                require(['plugins/jquery.touchSwipe.min'], function(jtouch) {
                   that.swipe({
                       swipeRight : function() {
                           if(active) return;
                           active=true;
                           ChangeAllCarouselImages('backwards');
                       },
                       swipeLeft : function() {
                           if(active) return;
                           active=true;
                           ChangeAllCarouselImages('forwards');
                       }
                       
                   });
                    
                });
            }
        }
            
        function ContinuousLoop(){	
            timeout = setTimeout(function() {
                ChangeAllCarouselImages('forwards');
            }, pauseTime);
        }
        
        function AddActiveClassToActiveSlide(index) {
            var activeSlide = slides[index +1]; 
            slides.each(function(el){$(this).removeClass("active")});
            $(activeSlide).addClass("active");
        }
            
            
        function ChangeAllCarouselImages(direction){
            active = true;
            if(direction == 'forwards'){
                index++;
            }
            else if(direction == 'backwards'){
                index--;
            }
            else{
                previousIndex = index;
                index = indexMarkerIndex;
            }
            
            if(index < 0){
                if (!infiniteScroll) {
                    if (index < -1) {
                        index = -1;
                        active = false;
                        return;
                    }
                } else {
                    index =  numSlides - 1;
                }
                
            }
            if(index >= numSlides){
                if (!infiniteScroll) {
                    index = numSlides -1;
                    active = false;
                    return;
                }
                index = 0;
            }
            
           
            clearTimeout(timeout);
            ProcessHighlightedIndexMarker(index);
            AddActiveClassToActiveSlide(index);
            
            if(direction == "forwards"){		
                slides.animate( { left: '-=' + horizontalMovementAmount }, slidingDuration, function(){				
                    if(index == 0){
                       slides.css('left', negativeHorizontalMovementAmount);
                    }
                    active = false;
                })
            }		
            else if(direction == "backwards"){
                slides.animate( { left: '+=' + horizontalMovementAmount }, slidingDuration, function(){				
                    if(index >= numSlides - 1){
                        slides.css('left', (negativeHorizontalMovementAmount * numSlides));
                    }
                    active = false;
                })
            }
            else{
                slides.animate( { left: '-' + (horizontalMovementAmount * (indexMarkerIndex + 1)) }, slidingDuration, function(){
                    active = false;				
                })
            }
            if (autoScroll) {
                ContinuousLoop();
            }
            onChange(slides[index +1]); //call the onchange callback, we pass in the new active Li. 
        }
        return this;
    };
 
    }( jQuery ));
    
    
    /*  Weave tabs */
    /*
        Takes a tab layout and binds up onClicks to show and hide tab content based on the tab that is clicked.
        TODO: should handle multiple instances, can only handle one at the mo.
        USEAGE:
        
        <script>
            $("#my-tabbed-thing").weaveTabs();
        </script>
        
        <div id="my-tabbed-thing" class="tabbed-browser">
            <ul class="tabs">
                <li><a href="#firstTab">First</a></li>
                <li><a href="#secondTab">Second</a></li>
            </ul>
            <div class="content">
                <div id="firstTab">Some awesome content</div>
                <div id="secondTab">Some awesome content</div>
            </div>
        </div>
        
        <style>
        .tabbed-browser ul{padding:0px;margin:0px;display:table;width:100%;}
        .tabbed-browser .tabs li {display:table-cell;padding:4px 10px 2px 10px; margin-right:2px;background-color:#ddd;margin-bottom:-1px;
                                 border-bottom:1px solid #ccc;border-right:1px solid #fff;}
        .tabbed-browser .tabs li a{color:#fff;}
        .tabbed-browser .content{border: 1px solid #ccc;padding:10px;padding:1rem;}
        .tabbed-browser .tabs li.active {z-index:10;background-color:#ccc;border-bottom:1px solid #ccc;}
        </style>
    */
    
(function( $ ) {
        
    $.fn.weaveTabs = function(options){
        
        var tabAnchors = this.find(".tabs > li > a");
        var container = this;
        tabAnchors.each(function(elem) {
           $(this).on("click",  getTabOnClick($(this), container));
        });
        tabAnchors.first().trigger("click");
        
        function getTabOnClick(anchor, container) {
            var targetId = anchor.attr("href");
            var targetElem = container.find(targetId);
            var onClickFunction = function(evt) {
                evt.preventDefault();
                container.find(".content > div").hide();
                targetElem.show();
                container.find(".tabs li").removeClass("active");
                $(this).parent().addClass("active");
            }
            return onClickFunction;
        }
        return this;
    }
    
}( jQuery ));

    /* Weave password strength indicator 
    *  
    *  Just adds a div after the specified input, and uses it to display the password strength of anything typed into that field.
    *
    *
    */



(function( $ ) {
        
    $.fn.weavePasswordStrengthIndicator = function(){
        var inputField = this;
        var mainDiv = $("<div class='weavePasswordStrengthIndicator'></div>");
        var innerDiv = $("<div></div>");
        var messageContainer = $("<span></span>");
        mainDiv.insertAfter(inputField);
        mainDiv.append(innerDiv);
        innerDiv.append(messageContainer);
        var maxWidth = mainDiv.width();
        innerDiv.hide();
        inputField.on("keyup", KeyupFunction);
        var passWordStrengthClassNames = ["weak", "fair", "good", "great"];
        return this;
        
        function getPasswordStrengthAsPercentage(input) {
            var LcaseRegex =  /[a-z]+/;
            var UcaseRegex = /[A-Z]+/;
            var NumbersRegex = /[0-9]+/;
            var NonAlphaNumeric = /[^A-Za-z0-9]+/;
            var hasLowerCase = LcaseRegex.test(input) ? 1 : 0;
            var hasUpperCase = UcaseRegex.test(input) ? 1 : 0;
            var hasNumbers = NumbersRegex.test(input) ? 1 : 0;
            var hasAnythingElse = NonAlphaNumeric.test(input) ? 1 : 0;
            var isOkLength = input.length >= 7 ? 1 : 0;
            var isLong = input.length >=12 ? 1 : 0;
            var isVLong = input.length >= 16 ? 1 : 0;
            var highestPossibleScore = 7;

            var strength = (hasLowerCase + hasUpperCase + hasNumbers + hasAnythingElse + isOkLength + isLong + isVLong) / highestPossibleScore;
            if (strength < 0) {
                return 0;
            }
            return strength;
         }
         
         function RemovePasswordStrengthClasses(elem) {
            var lim = passWordStrengthClassNames.length;
            for(var i =0;i< lim;i++) {
                elem.removeClass(passWordStrengthClassNames[i]);
            }
         }
        
        function KeyupFunction() {
            var password = $(this).val();
            var passStrength = getPasswordStrengthAsPercentage(password);
            innerDiv.show();
            innerDiv.width( Math.round(maxWidth * passStrength) );
            var className = "weak";
            if (passStrength < 0.25) {
                className = "weak";
            }  else if (passStrength < 0.5) {
                className = "fair";
            } else if (passStrength < 0.75) {
                className = "good";
            } else if (passStrength >= 0.75) {
                className = "great";
            }
            RemovePasswordStrengthClasses($(mainDiv));
            $(mainDiv).addClass(className);
            
        }
    }
    
}( jQuery ));





(function( $ ) {
    
    // We paramaterize the following.
    
    // imageId An image id to grab
    // addOverlay Do we want to overlay on the background.
    // a target element to fly towards.
    // a beforeStart function which can populate / show hide anything as required.
    // a onComplete function 
    // hideOnClick
    // hideOnTimeOut
    // hideTimeOut
    
    
    $.fn.weaveProductImageAnimator = function(imageSelector, modal){
       
        // button as the main element, also passes in an ID of the target image.
        // should also pass in an id of the destination div.
        var flyToTarget = $('#image-target');
        
        var finalImageHeight = flyToTarget.height();
        var additionalTopOffset = 0;
        var additionalLeftOffset = 0;
        
        var options = {};//TODO: options is passed in.
        
        var settings = $.extend({
            onComplete : function(){},
            beforeStart : function(){}
        }, options);
        
        
        var beforeStart = settings.beforeStart;
        var onComplete = settings.onComplete;
        var targetImageSelector = imageSelector;
        
        if (modal.show != undefined) {
            beforeStart = modal.show;
        }
        
        
        this.on("click", function(evt){
            evt.preventDefault();
            beforeStart();
            loadDataIntoModal(this, modal);
            animateImageFlyToTop();
        });
        
        
        function loadDataIntoModal(that, modalElem) {
            var productName = $(that).data('name');
            var productPrice = $('#main-price').html();
            
            modal.find(".product-name").html(productName);
            modal.find(".price").html(productPrice);
            
        }
        
        function animateImageFlyToTop(){
            event.stopPropagation();
            event.preventDefault();
            
            var $target = flyToTarget;
            
            //Copy the image and it's container.
            var $image = $(targetImageSelector);
            var $imageContainer = $image.closest('div');
            var $imageClone = $image.clone();
            $imageClone.attr('id','');
            $imageClone.css('width','100%'); //Fill the container with the image.
            
            // Grab the location and size of the image so we can match it.
            var $offset = $imageContainer.offset();
            var $width = $image.width( );
            
            // Create a div to hold our newly cloned stuff.
            var $divClone = $('<div/>');
            $divClone.append($imageClone);
            $divClone.css("width", $width);
            $divClone.css("position","absolute");

            $('body').append($divClone);
            $divClone.offset({ top: $offset.top, left: $offset.left});
            $divClone.addClass('animated-image');
            var $localOffset =  ( $divClone.width() - 52 ) / 2; 
            
            
            $divClone.animate({width:finalImageHeight, height:finalImageHeight, top: $offset.top + $localOffset,left: $offset.left + $localOffset} ,1000,function(){
                $divClone.animate({top: $target.offset().top + additionalTopOffset, left:$target.offset().left +additionalLeftOffset}, 1000, function() {
                    //Animation complete!
                    onComplete();
                });
            });
            
            
        }
    }
    
}( jQuery ));


    // positions a modal over its target.

(function( $ ) {
        
    $.fn.weaveModal = function(options){
        
        var settings =$.extend({
            targetToHoverOver : "body"
        }, options);
        
        
       var target = $(settings.targetToHoverOver); 
       //createOverlay
       var overlay = $("#overlay") 
        if (!overlay.length >= 1) {
            overlay = $("<div id='overlay'></div>");
        }
       $('body').append(overlay);

       var modal = this;
       var offset = target.offset();
       //appearing underneath so add height to XMLDocument
       offset.top = offset.top + target.height() + 10;
       
       modal.css('left', offset.left);
       modal.css('top', offset.top);
       modal.on("click", function(){
           $(this).fadeOut();
           $('.animated-image').fadeOut(function(){
                $(this).remove();
            });
           $(overlay).fadeOut();
       });
       
       this.show = function() {
          $(overlay).show();
            modal.fadeIn();
       }
       
       this.hide = function() {
           $(overlay).fadeOut();
           modal.fadeOut();
        }
       
       
       return this;
    }
    
}( jQuery ));