/*
	ufd @VERSION : Unobtrusive Fast-filter Drop-down jQuery plugin.

	Authors:
		thetoolman@gmail.com 
		Kadalashvili.Vladimir@gmail.com

	Version:  @VERSION

	Website: http://code.google.com/p/ufd/
 */

(function($) {

var widgetName = "ui.ufd";	
	
$.widget(widgetName, {

		// options: provided by framework
		// element: provided by framework

	_init: function() {
		if (this.element[0].tagName.toLowerCase() != "select") {
			this.destroy();
			return false;
		}

		// console.time("init");
		
		this.options = $.extend(true, {}, this.options); //deep copy: http://dev.jqueryui.com/ticket/4366

		this.selectbox = this.element;
		this.logNode = $(this.options.logSelector);
		this.overflowCSS = this.options.allowLR ? "overflow" : "overflowY";
		var selectName = this.selectbox.attr("name");
		var suffixName = selectName + this.options.suffix;
		var inputName = this.options.submitFreeText ? selectName : suffixName;
		
		if(this.options.submitFreeText) this.selectbox.attr("name", suffixName);
		if(this.options.calculateZIndex) this.options.zIndexPopup = this._calculateZIndex();

		var css = this.options.css;
		this.css = this.options.css;
		if(this.options.useUiCss) $.extend(this.css, this.options.uiCss); 
		if(!css.skin) css.skin = this.options.skin; // use option skin if not specified in CSS 

		this.wrapper = $([
			'<span class="', css.wrapper, ' ', css.hidden, ' ', css.skin, '">',
				'<input type="text" autocomplete="off" value="" class="', css.input, '" name="', inputName, '"/>',
				'<button type="button" tabindex="-1" class="', css.button, '"><div class="', css.buttonIcon, '"/></button>',
				//   <select .../> goes here
			'</span>'
		].join(''));
		this.dropdown = $([
			'<div class="', css.skin, '">',
				'<div class="', css.listWrapper, ' ', css.hidden, '">',
					'<div class="', css.listScroll, '">',
					//  <ul/> goes here
					'</div>',
				'</div>',
			'</div>'
		].join(''));

		this.selectbox.after(this.wrapper);
		this.getDropdownContainer().append(this.dropdown);

		this.input = this.wrapper.find("input");
		this.button = this.wrapper.find("button");
		this.listWrapper = this.dropdown.children(":first").css("z-index", this.options.zIndexPopup);
		this.listScroll = this.listWrapper.children(":first");
		
		if($.fn.bgiframe) this.listWrapper.bgiframe(); //ie6 !
		this.listMaxHeight = this.getListMaxHeight(); 

		this._populateFromMaster();
		this._initEvents();

		// console.timeEnd("init");
	},


	_initEvents: function() { //initialize all event listeners
		var self = this;
		var keyCodes = $.ui.keyCode; 
		var key, isKeyDown, isKeyPress,isKeyUp;
		var css = this.options.css;
		
		//this.log("initEvents");

		this.input.bind("keydown keypress keyup", function(event) {
			// Key handling is tricky; here is great key guide: http://unixpapa.com/js/key.html
			isKeyDown = (event.type == "keydown");
			isKeyPress = (event.type == "keypress");
			isKeyUp = (event.type == "keyup");
			key = null;

			if (undefined === event.which) {
				key = event.keyCode; 
			} else if (!isKeyPress && event.which != 0) {
				key = event.keyCode;
			} else { 
				return; //special key
			}
			
			switch (key) { //stop default behivour for these events
				case keyCodes.HOME:
				case keyCodes.END:
					if(self.options.homeEndForCursor) return; //no action except default
				case keyCodes.DOWN:
				case keyCodes.PAGE_DOWN:
				case keyCodes.UP:
				case keyCodes.PAGE_UP:
				case keyCodes.ENTER:
					self.stopEvent(event);
				default:
			}
			
			// only process: keyups excluding tab/return; and only tab/return keydown 
			// Only some browsers fire keyUp on tab in, ignore if it happens 
			if(!isKeyUp == ((key != keyCodes.TAB) && (key != keyCodes.ENTER)) ) return;

			//self.log("Key: " + key + " event: " + event.type);

			self.lastKey = key;

			switch (key) {
			case keyCodes.SHIFT:
			case keyCodes.CONTROL:
				//don't refilter 
				break;

			case keyCodes.DOWN:
				self.selectNext(false);
				break;
			case keyCodes.PAGE_DOWN:
				self.selectNext(true);
				break;
			case keyCodes.END:
				self.selectLast();
				break;

			case keyCodes.UP:
				self.selectPrev(false);
				break;
			case keyCodes.PAGE_UP:
				self.selectPrev(true);
				break;
			case keyCodes.HOME:
				self.selectFirst();
				break;

			case keyCodes.ENTER:
				self.hideList();
				self.tryToSetMaster();
				self.inputFocus();
				break;
			case keyCodes.TAB: //tabout only
				self.realLooseFocusEvent();
				break;
			case keyCodes.ESCAPE:
				self.hideList();
				self.revertSelected();
				break;

			default:
				self.showList();
				self.filter(false, true); //do delay, as more keypresses may cancel
				break;
			}
		});

		this.input.bind("click", function(e) {
			if(self.isDisabled){
				self.stopEvent(e);
				return;
			}
			// self.log("input click: " + e.target);
			if (!self.listVisible()) { 
				self.filter(true); //show all 
				self.inputFocus();
				self.showList();
				self.scrollTo();
			}          
		}); 
		this.input.bind("focus", function(e) {
			if(self.isDisabled){
				self.stopEvent(e);
				return;
			}
			self.log("input focus");
			if(!self.internalFocus){
				self.realFocusEvent();
			}
		});

		this.button.bind("mouseover", function(e) { self.button.addClass(css.buttonHover); }); 
		this.button.bind("mouseout",  function(e) { self.button.removeClass(css.buttonHover); }); 
		this.button.bind("mousedown", function(e) { self.button.addClass(css.buttonMouseDown); }); 
		this.button.bind("mouseup",   function(e) { self.button.removeClass(css.buttonMouseDown); }); 
		this.button.bind("click", function(e) {
			if(self.isDisabled){
				self.stopEvent(e);
				return;
			}
			// self.log("button click: " + e.target);
			if (self.listVisible()) { 
				self.hideList();
				self.inputFocus();
				
			} else {	
				self.filter(true); //show all 
				self.inputFocus();
				self.showList();
				self.scrollTo();
			}          
		}); 

		this.listWrapper.bind("mouseover mouseout click", function(e) {
			// this.log(e.type + " : " + e.target);
			if ( "LI" == e.target.nodeName.toUpperCase() ) {
				if(self.setActiveTimeout) { //cancel pending selectLI -> active
					clearTimeout(self.setActiveTimeout);
					self.setActiveTimeout == null;
				}
				if ("mouseout" == e.type) {
					$(e.target).removeClass(css.liActive);
					self.setActiveTimeout = setTimeout(function() { 
						$(self.selectedLi).addClass(css.liActive); 
					}, self.options.delayYield);

				} else if ("mouseover" == e.type) { 
					if (self.selectedLi != e.target) { 
						$(self.selectedLi).removeClass(css.liActive);
					}
					$(e.target).addClass(css.liActive);

				} else { //click
					self.stopEvent(e); //prevent bubbling to document onclick binding etc
					var value = $.trim($(e.target).text());
					self.input.val(value);
					self.setActive(e.target);
					if(self.tryToSetMaster() ) {
						self.hideList();
						self.filter(true); //show all
					}
					self.inputFocus();
				}
			}

			return true;
		});

		this.selectbox.bind("change." + widgetName, function(e) {
			if(self.isUpdatingMaster){
				// self.log("master changed but we did the update");
				self.isUpdatingMaster = false;
				return true;
			}
			self.log("master changed; reverting");
			self.revertSelected();
		});

		// click anywhere else; keep reference for selective unbind
		this._myDocClickHandler = function(e) {
			if ((self.button.get(0) == e.target) || (self.input.get(0) == e.target)) return;
			// self.log("unfocus document click : " + e.target);
			if (self.internalFocus) self.realLooseFocusEvent();
		};
		$(document).bind("click." + widgetName, this._myDocClickHandler);

	},

	// pseudo events

	realFocusEvent: function() {
		// this.log("real input focus");
		this.internalFocus = true;
		this._triggerEventOnMaster("focus");
		this.filter(true); //show all
		this.inputFocus();
		this.showList();
		this.scrollTo();	    	
	},

	realLooseFocusEvent: function() {
		// this.log("real loose focus (blur)");
		this.internalFocus = false;
		this.hideList();  
		this.tryToSetMaster();
		this._triggerEventOnMaster("blur");
	},

	_triggerEventOnMaster: function(eventName) {
		if( document.createEvent ) { // good browsers
			var evObj = document.createEvent('HTMLEvents');
			evObj.initEvent( eventName, true, true );
			this.selectbox.get(0).dispatchEvent(evObj);

		} else if( document.createEventObject ) { // iE
			this.selectbox.get(0).fireEvent("on" + eventName);
		} 

	},

	// methods

	inputFocus: function() {
		// this.log("inputFocus: restore input component focus");
		this.input.focus();

		if (this.getCurrentTextValue().length) {
			this.selectAll();    	
		}			
	},

	inputBlur: function() {
		// this.log("inputBlur: loose input component focus");
		this.input.blur();
	},	 

	showList: function() {
		// this.log("showlist");
		if(this.listVisible()) return;
		this.listWrapper.removeClass(this.css.hidden);
		this.setListDisplay();
	},

	hideList: function() {
		// this.log("hide list");
		if(!this.listVisible()) return;
		this.listWrapper.addClass(this.css.hidden);
		this.listItems.removeClass(this.css.hidden);   
	},

	/*
	 * adds / removes items to / from the dropdown list depending on combo's current value
	 * 
	 * if doDelay, will delay execution to allow re-entry to cancel.
	 */
	filter: function(showAll, doDelay) {
		// this.log("filter: " + showAllLength);
		var self = this;

		//cancel any pending
		if(this.updateOnTimeout) clearTimeout(this.updateOnTimeout);
		if(this.filterOnTimeout) clearTimeout(this.filterOnTimeout);
		this.updateOnTimeout = null;
		this.filterOnTimeout = null;
		
		var searchText = self.getCurrentTextValue();

		var search = function() {
			//this.log("filter search");
			var mm = self.trie.findPrefixMatchesAndMisses(searchText); // search!
			self.trie.matches = mm.matches;
			self.trie.misses = mm.misses;

			//yield then screen update
			self.updateOnTimeout = setTimeout(function(){screenUpdate();}, self.options.delayYield); 

		};

		var screenUpdate = function() {
			//this.log("screen update");
			//self.log(self.getCurrentTextValue() + ": matchesLength: " + 
			//		self.trie.matches.length + " missesLength: " + self.trie.misses.length );

			//console.time("visUpdate");
			var active = self.getActive(); //get item before class-overwrite
			
			if (self.options.addEmphasis) {
				self.emphasis(self.trie.matches, true, searchText);
			}
			
			self.overwriteClass(self.trie.matches,"" );
			if(showAll || !self.trie.matches.length) {
				self.overwriteClass(self.trie.misses, "" );
				if (self.options.addEmphasis) {
					self.emphasis(self.trie.misses, false, searchText);
				}
			} else {
				self.overwriteClass(self.trie.misses, self.css.hidden);
			}
			// console.timeEnd("visUpdate");
			var oldActiveHidden =  active.hasClass(self.css.hidden) ; 

			// need to set overwritten active class  
			if(!oldActiveHidden && active.length && self.trie.matches.length){
				self.setActive(active.get(0));  

			} else if(self.trie.matches.length) {
				var firstmatch = self.trie.matches[0];
				self.setActive(firstmatch[0]); //first instance of first match

			} else { 
				self.setActive(null);
			}

			self.setListDisplay();
		};

		if(doDelay) {
			//setup new delay
			this.filterOnTimeout = setTimeout( function(){ search(); }, this.options.delayFilter );
		} else {
			search();
		}
	},
	
	emphasis: function(array, isAddEmphasis, searchText ) {
		//console.time("em");
		
		var searchTextLength = searchText.length || 0;
		var tritem, index, indexB, li, text;
		var options = this.selectbox.get(0).options;
		
		isAddEmphasis = (isAddEmphasis && searchTextLength); // don't add emphasis to 0-length  
		index = array.length;
		while(index--) {
			tritem = array[index];
			indexB = tritem.length;
			while(indexB--) { // duplicate match array
				li = tritem[indexB];
				text = $.trim(options[li.getAttribute("name")].text);
				if (isAddEmphasis) {
					li.innerHTML = '<em>' + text.slice(0, searchTextLength) + '</em>' + text.slice(searchTextLength) ;
				} else {
					li.innerHTML = text;
				}
			}
		}
		
		//console.timeEnd("em");
	},

	// attempt update of master - returns true if update good or already set correct. 
	tryToSetMaster: function() {
		// this.log("t.s.m");

		var optionIndex = null;
		var active = this.getActive();
		if (active.length) {
			optionIndex = active.attr("name"); //sBox pointer index
		}
		if (optionIndex == null || optionIndex == "" || optionIndex < 0) {
			this.log("no active, master not set.");
			if (this.options.submitFreeText) {
				return false;
				
			} else { 
				this.log("Not freetext and no active set; revert.");
				this.revertSelected();
				return false;
			}
		} // else optionIndex is set to activeIndex

		var sBox = this.selectbox.get(0);			
		var curIndex = sBox.selectedIndex;
		var option = sBox.options[optionIndex];

		if(!this.options.submitFreeText || this.input.val() == option.text){ //freetext only if exact match
			this.input.val(option.text); // input may be only partially set
			
			if(optionIndex != curIndex){
				this.isUpdatingMaster = true;
				sBox.selectedIndex = optionIndex;
				// this.log("master selectbox set to: " + option.text);
				this._triggerEventOnMaster("change");

			} // else already correctly set, no change
			return true;
			
		} // else have a non-matched freetext
		this.log("unmatched freetext, master not set.");
		
		return false;
	},

	_populateFromMaster: function() {
		// this.log("populate from master select");
		// console.time("prep");

		this.disable();
		this.setDimensions();

		this.trie = new Trie(this.options.caseSensitive);
		this.trie.matches = [];
		this.trie.misses = [];

		var self = this;
		var listBuilder = [];
		var trieObjects = [];

		// console.timeEnd("prep");
		// console.time("build");

		listBuilder.push('<ul>');
		var options = this.selectbox.get(0).options;
		var thisOpt,loopCountdown,index;

		loopCountdown = options.length;
		index = 0;
		do {
			thisOpt = options[index++];
			listBuilder.push('<li name="');
			listBuilder.push(thisOpt.index);
			//listBuilder.push('" title="');
			//listBuilder.push($.trim(thisOpt.text));
			listBuilder.push('">');
			listBuilder.push($.trim(thisOpt.text));
			listBuilder.push('</li>');
		} while(--loopCountdown); 

		listBuilder.push('</ul>');

		this.listScroll.html(listBuilder.join(''));
		this.list = this.listScroll.find("ul:first");

		// console.timeEnd("build");

		this.listItems = $("li", this.list);
		// console.time("kids");
		var theLiSet = this.list.get(0).getElementsByTagName('LI'); // much faster array then .childElements !

		loopCountdown = theLiSet.length;
		index = 0;
		do {
			thisOpt = options[index];
			self.trie.add( $.trim(thisOpt.text), theLiSet[index++]);
		} while(--loopCountdown); 

		// console.timeEnd("kids");
		// console.time("tidy");

		if(this.options.triggerSelected){
			this.setInputFromMaster();
		} else {
			this.input.val(""); 
		}

		this.enable();
		// console.timeEnd("tidy");

	},

	setDimensions: function() {
		// console.time("1");

		this.wrapper.addClass(this.css.hidden);
		if(this.selectIsWrapped) { //unwrap
			this.wrapper.before(this.selectbox);
		}

		// console.timeEnd("1");
		// console.time("2");

		//get dimensions un-wrapped, in case of % width etc.
		this.originalSelectboxWidth = this.selectbox.outerWidth(); 
		var props = this.options.mimicCSS;
		for(propPtr in props){
			var prop = props[propPtr];
			this.wrapper.css(prop, this.selectbox.css(prop)); // copy property from selectbox to wrapper
		}

		// console.timeEnd("2");
		// console.time("2.5");

		this.wrapper.get(0).appendChild(this.selectbox.get(0)); //wrap

		// console.timeEnd("2.5");
		// console.time("3");

		this.wrapper.removeClass(this.css.hidden);
		this.selectIsWrapped = true;

		//match original width
		var newSelectWidth = this.originalSelectboxWidth;
		if(this.options.manualWidth) {
			newSelectWidth = this.options.manualWidth; 
		} else if (newSelectWidth < this.options.minWidth) {
			newSelectWidth = this.options.minWidth;
		}

		var buttonWidth = this.button.outerWidth();
		var inputBP = this.input.outerWidth() - this.input.width();
		var inputWidth = newSelectWidth - buttonWidth - inputBP;
		var listWrapBP = this.listWrapper.outerWidth() - this.listWrapper.width();

		// console.timeEnd("3");
		// console.time("4");

		this.input.width(inputWidth);
		this.wrapper.width(newSelectWidth);
		this.listWrapper.width(newSelectWidth - listWrapBP);
		this.listScroll.width(newSelectWidth - listWrapBP);

		//this.log(newSelectWidth + " : " + inputWidth + " : " + 
		//		buttonWidth + " : " + (newSelectWidth - listWrapBP));
		// console.timeEnd("4");

	},

	setInputFromMaster: function() {
		var selectNode = this.selectbox.get(0);
		var val = selectNode.options[selectNode.selectedIndex].text;
		// this.log("setting input to: " + val);
		this.input.val(val);
	},

	revertSelected: function() {
		this.setInputFromMaster();
		this.filter(true); //show all
	},

	//corrects list wrapper's height depending on list items height
	setListDisplay: function() {

		var listHeight = this.list.outerHeight();
		var maxHeight = this.listMaxHeight;

		// this.log("set list height - listItemsHeight: " + listHeight + " : maxHeight: " + maxHeight );

		var height = listHeight;
		if (height > maxHeight) {
			height = maxHeight;
			this.listScroll.css(this.overflowCSS, "scroll");
		} else {
			this.listScroll.css(this.overflowCSS, "hidden");
		}

		// this.log("height set to: " + height);
		this.listScroll.height(height); 
		this.listWrapper.height(height); 

		var doDropUp = false;
		var offset = this.input.offset();
		if(this.options.allowDropUp) {
			var listSpace = height; 
			var inputHeight = this.wrapper.height();
			var bottomPos = offset.top + inputHeight + listSpace;
			var maxShown = $(window).height() + $(document).scrollTop();
			doDropUp = (bottomPos > maxShown);
		}

		var top;
		if (doDropUp) {
			this.listWrapper.addClass(this.css.listWrapperUp);
			top = (offset.top - this.listScroll.height() - 1) ;
		} else {
			this.listWrapper.removeClass(this.css.listWrapperUp);
			top = (offset.top + this.input.outerHeight() - 1);
		}
		this.listWrapper.css("left", offset.left);
		this.listWrapper.css("top", top );			

		return height;
	},

	//returns active (hovered) element of the dropdown list
	getActive: function() {
		// this.log("get active");
		if(this.selectedLi == null) return $([]);
		return $(this.selectedLi); 
	},

	//highlights the item given
	setActive: function(activeItem) {
		// this.log("setActive");
		$(this.selectedLi).removeClass(this.css.liActive);
		this.selectedLi = activeItem;
		$(this.selectedLi).addClass(this.css.liActive);
	},

	selectFirst: function() {
		// this.log("selectFirst");
		var toSelect = this.listItems.filter(":not(.invisible):first");
		this.afterSelect( toSelect );
	},

	selectLast: function() {
		// this.log("selectFirst");
		var toSelect = this.listItems.filter(":not(.invisible):last");
		this.afterSelect( toSelect );
	},


	//highlights list item before currently active item
	selectPrev: function(isPageLength) {
		// this.log("hilightprev");
		var count = isPageLength ? this.options.pageLength : 1;
		var toSelect = this.searchRelativeVisible(false, count);
		this.afterSelect( toSelect );
	},	
	
	//highlights item of the dropdown list next to the currently active item
	selectNext: function(isPageLength) {
		//this.log("hilightnext");
		var count = isPageLength? this.options.pageLength : 1;
		var toSelect = this.searchRelativeVisible(true, count);
		this.afterSelect( toSelect );
	},		

	afterSelect: function(active) {
		if(active == null) return; 
		this.setActive(active);
		this.input.val(active.text());
		this.scrollTo();
		this.tryToSetMaster();
		this.inputFocus();
	},		

	searchRelativeVisible: function(isSearchDown, count) {
		//this.log("searchRelative: " + isSearchDown + " : " + count);
		
		var active = this.getActive();
		if (!active.length) {
			this.selectFirst();
			return null;
		}
		
		var searchResult;
		
		do { // count times
			searchResult = active;
			do { //find next/prev item
				searchResult = isSearchDown ? searchResult.next() : searchResult.prev();
			} while (searchResult.length && searchResult.hasClass(this.css.hidden));
			
			if (searchResult.length) active = searchResult;
		} while(--count);
		
		return active;
	},
	
	//scrolls list wrapper to active
	scrollTo: function() {
		// this.log("scrollTo");
		if ("scroll" != this.listScroll.css(this.overflowCSS)) return;
		var active = this.getActive();
		if(!active.length) return;
		
		var activePos = Math.floor(active.position().top);
		var activeHeight = active.outerHeight(true);
		var listHeight = this.listWrapper.height();
		var scrollTop = this.listScroll.scrollTop();
		
	    /*  this.log(" AP: " + activePos + " AH: " + activeHeight + 
	    		" LH: " + listHeight + " ST: " + scrollTop); */
		    
		var top;
		var viewAheadGap = (this.options.viewAhead * activeHeight); 
		
		if (activePos < viewAheadGap) { //  off top
			top = scrollTop + activePos - viewAheadGap;
		} else if( (activePos + activeHeight) >= (listHeight - viewAheadGap) ) { // off bottom
			top = scrollTop + activePos - listHeight + activeHeight + viewAheadGap;
		}
		else return; // no need to scroll
		// this.log("top: " + top);
		this.listScroll.scrollTop(top);
	},		

	//just returns integer value of list wrapper's max-height property
	getListMaxHeight: function() {

		var result = parseInt(this.listWrapper.css("max-height"), 10);
		if (isNaN(result)) {
			this.log("no CSS max height set.");
			result = this.listMaxHeight;	
		}
		// this.log("get listmaxheight: " + result);
		return result;
	},

	getCurrentTextValue: function() {
		var input = $.trim(this.input.val()); 
		//this.log("Using input value: " + input);
		return input;
	},


	stopEvent: function(e) {
		e.cancelBubble = true;
		e.returnValue = false;
		if (e.stopPropagation) {e.stopPropagation(); }
		if( e.preventDefault ) { e.preventDefault(); }
	},

	overwriteClass: function(array,  classString ) { //fast attribute OVERWRITE
		var tritem, index, indexB;
		index = array.length
		while(index--) {
			tritem = array[index];
			indexB = tritem.length;
			while(indexB--) { // duplicate match array
				tritem[indexB].setAttribute($.ui.ufd.classAttr, classString);
			}
		}
	},

	listVisible: function() {
		var isVisible = !this.listWrapper.hasClass(this.css.hidden);
		// this.log("is list visible?: " + isVisible);
		return isVisible;
	},

	disable: function() {
		// this.log("disable");

		this.hideList();
		this.isDisabled = true;
		this.button.addClass(this.css.buttonDisabled);
		this.input.addClass(this.css.inputDisabled);
		this.input.attr("disabled", "disabled");
	},

	enable: function() {
		// this.log("enable");

		this.isDisabled = false;
		this.button.removeClass(this.css.buttonDisabled);
		this.input.removeClass(this.css.inputDisabled);
		this.input.removeAttr("disabled");
	},

	/*
		  Select input text: inspired by jCarousel src
	 */
	selection: function(field, start, end) {
		if( field.createTextRange ){
			var selRange = field.createTextRange();
			selRange.collapse(true);
			selRange.moveStart("character", start);
			selRange.moveEnd("character", end);
			selRange.select();
		} else if( field.setSelectionRange ){
			field.setSelectionRange(start, end);
		} else {
			if( field.selectionStart ){
				field.selectionStart = start;
				field.selectionEnd = end;
			}
		}
	},

	selectAll: function() {
		// this.log("Select All");
		this.input.get(0).select();
		//this.selection(this.input.get(0), 0, this.input.val().length);
	},

	getDropdownContainer: function() {
		var ddc = $("#" + this.options.dropDownID);
		if(!ddc.length) { //create
			ddc = $("<div></div>").appendTo("body").
				css("height", 0).
				attr("id", this.options.dropDownID);
		}
		return ddc;
	},

	log: function(msg) {
		if(!this.options.log) return;

		if(window.console && window.console.log) {  // firebug logger
			console.log(msg);
		}
		if(this.logNode && this.logNode.length) {
			this.logNode.prepend("<div>" + msg + "</div>");
		}
	},

	_calculateZIndex: function(msg) {
		var curZ, zIndex = this.options.zIndexPopup; // start here as a min
		
		this.selectbox.parents().each(function(){
			curZ = parseInt($(this).css("zIndex"), 10);
			if(curZ > zIndex) zIndex = curZ;
		});
		return zIndex + 1;
	},

	changeOptions: function() {
		this.log("changeOptions");
		this._populateFromMaster();
	},		

	destroy: function() {
		this.log("called destroy");
		$.widget.prototype.destroy.apply(this, arguments); // default destroy

		if(this.selectIsWrapped) { //unwrap
			this.wrapper.before(this.selectbox);
		}
		
		this.selectbox.unbind("change." + widgetName);
		$(document).unbind("click." + widgetName, this._myDocClickHandler);
		//all other handlers are in these removed nodes.
		this.wrapper.remove();
		this.listWrapper.remove();
		
		// see ticket; http://dev.jqueryui.com/ticket/5005
		// code fixes <= 1.7.2 ; expect bug will be fixed in 1.7.3
		if($.ui.version <= "1.7.2") { 
			this.element.unbind("setData." + widgetName); 
			this.element.unbind("getData." + widgetName);
			// will remove all events sorry, might have other side effects but needed
			this.element.unbind("remove"); 
		}
	},
	
	//internal state
	selectIsWrapped: false,
	internalFocus: false, 
	lastKey: null,
	selectedLi: null,
	isUpdatingMaster: false,
	isDisabled: false

});



/******************************************************
 * Trie implementation for fast prefix searching
 * 
 *		http://en.wikipedia.org/wiki/Trie
 *******************************************************/

/**
 * Constructor
 */
function Trie(isCaseSensitive) {
	this.isCaseSensitive = isCaseSensitive || false;
	this.root = [null, {}]; //masterNode
};

/**
 * Add (String, Object) to store 
 */
Trie.prototype.cleanString = function( inStr ) {
	if(!this.isCaseSensitive){
		inStr = inStr.toLowerCase();
	}
	//invalid char clean here
	return inStr;
}

/**
 * Add (String, Object) to store 
 */
Trie.prototype.add = function( key, object ) {
	key = this.cleanString(key);
	var curNode = this.root;
	var kLen = key.length; 

	for(var i = 0; i < kLen; i++) {
		var char = key.charAt(i);
		var node = curNode[1];
		if(char in node) {
			curNode = node[char];
		} else {
			curNode = node[char] = [null, {}];
		}
	}
	
	if(curNode[0]) curNode[0].push(object);//return false;
	else curNode[0] = [object];
	return true;
};

/**
 * Find object exactly matching key (String)
 */
Trie.prototype.find = function( key ) {
	key = this.cleanString(key);
	var resultNode = this.findNode(key);
	return (resultNode) ? resultNode[0] : null;
};	

/**
 * Find trieNode exactly matching (key) 
 */
Trie.prototype.findNode = function( key ) {
	var results = this.findNodePartial(key);
	var node = results[0];
	var remainder = results[1];
	return (remainder.length > 0) ? null : node;
};

/**
 * Find prefix trieNode closest to (String) 
 * returns [trieNode, remainder]
 */
Trie.prototype.findNodePartial = function(key) {
	key = this.cleanString(key);
	var curNode = this.root;
	var remainder = key;
	var kLen = key.length;

	for (var i = 0; i < kLen; i++) {
		var char = key.charAt(i);
		if (char in curNode[1]) {
			curNode = curNode[1][char];
		} else {
			return [ curNode, remainder ]; 
		}
		remainder = remainder.slice(1, remainder.length);
	}
	return [ curNode, remainder ];
};

/**
 * Get array of all objects on (trieNode) 
 */
Trie.prototype.getValues = function(trieNode) { 
	return this.getMissValues(trieNode, null); // == Don't miss any
};

/**
 * Get array of all objects on (startNode), except objects on (missNode) 
 */
Trie.prototype.getMissValues = function(startNode, missNode) { // string 
	if (startNode == null) return [];
	var stack = [ startNode ];
	var results = [];
	while (stack.length > 0) {
		var thisNode = stack.pop();
		if (thisNode == missNode) continue;
		if (thisNode[0]) results.unshift(thisNode[0]);
		for ( var char in thisNode[1]) {
			if (thisNode[1].hasOwnProperty(char)) {
				stack.push(thisNode[1][char]);
			}
		}
	}
	return results;
};

/**
 * Get array of all objects exactly matching the key (String) 
 */
Trie.prototype.findPrefixMatches = function(key) { 
	var trieNode = findNode(key);
	return this.getValues(trieNode);
}

/**
 * Get array of all objects not matching entire key (String) 
 */
Trie.prototype.findPrefixMisses = function(key) { // string 
	var trieNode = findNode(key);
	return this.getMissValues(this.root, trieNode);
};

/**
 * Get object with two properties:
 * 	matches: array of all objects not matching entire key (String) 
 * 	misses:  array of all objects exactly matching the key (String)
 * 
 * This reuses "findNode()" to make it faster then 2x method calls
 */
Trie.prototype.findPrefixMatchesAndMisses = function(key) { // string 
	var trieNode = this.findNode(key);
	var matches = this.getValues(trieNode);
	var misses = this.getMissValues(this.root, trieNode);

	return { matches : matches, misses : misses };
};

/* end Trie */	


$.extend($.ui.ufd, {
	version: "@VERSION",
	getter: "", //for methods that are getters, not chainables
	classAttr: (($.support.style) ? "class" : "className"),  // IE6/7 class property
	
	defaults: {
		skin: "plain", // skin name 
		suffix: "_ufd", // suffix for pseudo-dropdown text input name attr.  
		dropDownID: "ufd-container", // ID for a root-child node for storing dropdown lists. avoids ie6 zindex issues by being at top of tree.
		logSelector: "#log", // selector string to write log into, if present.
		mimicCSS: ["marginLeft","marginTop","marginRight","marginBottom"], //copy these properties to widget. Width auto-copied unless min/manual.

		log: false, // log to firebug console (if available) and logSelector (if it exists)
		submitFreeText: false, // re[name] original select, give text input the selects' original [name], and allow unmatched entries  
		triggerSelected: true, // selected option of the selectbox will be the initial value of the combo
		caseSensitive: false, // case sensitive search 
		allowDropUp: true, // if true, the options list will be placed above text input if flowing off bottom
		allowLR: false, // show horizontal scrollbar
		addEmphasis: false, // add <EM> tags around matches.
		calculateZIndex: false, // {max ancestor} + 1
		useUiCss: false, // use jquery UI themeroller classes. 
		homeEndForCursor: false, // should home/end affect dropdown or move cursor?

		listMaxHeight: 200, // CSS value takes precedence
		minWidth: 50, // don't autosize smaller then this.
		manualWidth: null, //override selectbox width; set explicit width
		viewAhead: 1, // items ahead to keep in view when cursor scrolling
		pageLength: 10, // number of visible items jumped on pgup/pgdown.
		delayFilter: ($.support.style) ? 1 : 150, // msec to wait before starting filter (or get cancelled); long for IE 
		delayYield: 1, // msec to yield for 2nd 1/2 of filter re-entry cancel; 1 seems adequate to achieve yield
		zIndexPopup: 101, // dropdown z-index
	
		// class sets
		css: {
			//skin: "plain", // if not set, will inherit options.skin
			input: "",
			inputDisabled: "disabled",

			button: "",
			buttonIcon: "icon",
			buttonDisabled: "disabled",
			buttonHover: "hover",
			buttonMouseDown: "mouseDown",

			li: "",
			liActive: "active",
			
			hidden: "invisible",
			
			wrapper: "ufd",
			listWrapper: "list-wrapper",
			listWrapperUp: "list-wrapper-up",
			listScroll: "list-scroll"
		},
		
		//overlaid CSS set
		uiCss: {
			skin: "uiCss", 
			input: "ui-widget-content",
			inputDisabled: "disabled",

			button: "ui-button",
			buttonIcon: "ui-icon ui-icon-triangle-1-s",
			buttonDisabled: "disabled",
			buttonHover: "ui-state-focus",
			buttonMouseDown: "ui-state-active",

			li: "ui-menu-item",
			liActive: "ui-state-hover",
			
			hidden: "invisible",
			
			wrapper: "ufd ui-widget ui-widget-content",
			listWrapper: "list-wrapper ui-widget ui-widget",
			listWrapperUp: "list-wrapper-up",			
			listScroll: "list-scroll ui-widget-content"
		}
	}
});	

})(jQuery);
/* END */