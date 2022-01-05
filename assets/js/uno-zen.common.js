(function() {
  'use strict';
  (function() {
    var Uno, app;
    app = document.body;
    window.Uno = Uno = {
      version: '2.9.0',
      is: function(k, v) {
        if (!Array.isArray(v)) {
          return app.dataset[k] === v;
        }
        return v.some(function(v) {
          return app.dataset[k] === v;
        });
      },
      attr: function(k, v) {
        if (v != null) {
          return app.dataset[k] = v;
        } else {
          return app.dataset[k];
        }
      },
      context: function() {
        var className;
        // get the context from the first class name of body
        // https://github.com/TryGhost/Ghost/wiki/Context-aware-Filters-and-Helpers
        className = document.body.className.split(' ')[0].split('-')[0];
        if (className === '') {
          return 'error';
        } else {
          return className;
        }
      },
      linkify: function(selector) {
        return $(selector).each(function() {
          var el, id, text;
          el = $(this);
          text = el.text();
          id = el.attr('id');
          el.html('');
          el.addClass('deep-link');
          return el.append(`<a href=#${id} class=\"title-link\">${text}</a>`);
        });
      },
      search: {
        form: (function() {
          var context;
          context = $('#search-container');
          return function(action) {
            return context[action]();
          };
        })()
      },
      timeAgo: function(selector) {
        return $(selector).each(function() {
          var postDate, postDateInDays;
          postDate = $(this).html();
          postDateInDays = Math.floor((Date.now() - new Date(postDate)) / 86400000);
          if (postDateInDays === 0) {
            postDateInDays = 'today';
          } else if (postDateInDays === 1) {
            postDateInDays = 'yesterday';
          } else {
            postDateInDays = `${postDateInDays} days ago`;
          }
          $(this).html(postDateInDays);
          $(this).mouseover(function() {
            return $(this).html(postDate);
          });
          return $(this).mouseout(function() {
            return $(this).html(postDateInDays);
          });
        });
      },
      device: function() {
        var h, w;
        w = window.innerWidth;
        h = window.innerHeight;
        if (w <= 480) {
          return 'mobile';
        }
        if (w <= 1024) {
          return 'tablet';
        }
        return 'desktop';
      }
    };
    Uno.attr('page', Uno.context());
    Uno.attr('device', Uno.device());
    if (window.profile_title) {
      // window global properties
      $('#profile-title').text(window.profile_title);
    }
    if (window.profile_resume) {
      $('#profile-resume').text(window.profile_resume);
    }
    if (window.posts_headline) {
      $('#posts-headline').text(window.posts_headline);
    }
    return window.open_button = window.open_button || '.nav-posts > a';
  })();

}).call(this);

;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

(function() {
  'use strict';
  $(function() {
    InstantClick.init();
    if (Uno.is('device', 'desktop')) {
      $('a').not('[href*="mailto:"]').click(function() {
        if (this.href.indexOf(location.hostname) === -1) {
          window.open($(this).attr('href'));
          return false;
        }
      });
    } else {
      FastClick.attach(Uno.app);
    }
    if (Uno.is('page', 'home') || Uno.is('page', 'paged') || Uno.is('page', 'tag')) {
      Uno.timeAgo('#posts-list time');
    }
    if (Uno.is('page', 'post')) {
      Uno.timeAgo('.post.meta > time');
      $('main').readingTime({
        readingTimeTarget: '.post.reading-time > span'
      });
      Uno.linkify($('#post-content').children('h1, h2, h3, h4, h5, h6'));
      $('.content').fitVids();
    }
    if (Uno.is('page', 'error')) {
      $('#panic-button').click(function() {
        var s;
        s = document.createElement('script');
        s.setAttribute('src', 'https://nthitz.github.io/turndownforwhatjs/tdfw.js');
        return document.body.appendChild(s);
      });
    }
    return $('#search-input').keyup(function(e) {
      return $('#search-form').attr('action', Uno.search.url + '+' + encodeURIComponent(e.target.value));
    });
  });

}).call(this);

/* InstantClick 3.1.0 | (C) 2014 Alexandre Dieulot | http://instantclick.io/license */

var InstantClick = function(document, location) {
  // Internal variables
  var $ua = navigator.userAgent,
      $isChromeForIOS = $ua.indexOf(' CriOS/') > -1,
      $hasTouch = 'createTouch' in document,
      $currentLocationWithoutHash,
      $urlToPreload,
      $preloadTimer,
      $lastTouchTimestamp,

  // Preloading-related variables
      $history = {},
      $xhr,
      $url = false,
      $title = false,
      $mustRedirect = false,
      $body = false,
      $timing = {},
      $isPreloading = false,
      $isWaitingForCompletion = false,
      $trackedAssets = [],

  // Variables defined by public functions
      $useWhitelist,
      $preloadOnMousedown,
      $delayBeforePreload,
      $eventsCallbacks = {
        fetch: [],
        receive: [],
        wait: [],
        change: []
      }


  ////////// HELPERS //////////


  function removeHash(url) {
    var index = url.indexOf('#')
    if (index < 0) {
      return url
    }
    return url.substr(0, index)
  }

  function getLinkTarget(target) {
    while (target && target.nodeName != 'A') {
      target = target.parentNode
    }
    return target
  }

  function isBlacklisted(elem) {
    do {
      if (!elem.hasAttribute) { // Parent of <html>
        break
      }
      if (elem.hasAttribute('data-instant')) {
        return false
      }
      if (elem.hasAttribute('data-no-instant')) {
        return true
      }
    }
    while (elem = elem.parentNode);
    return false
  }

  function isWhitelisted(elem) {
    do {
      if (!elem.hasAttribute) { // Parent of <html>
        break
      }
      if (elem.hasAttribute('data-no-instant')) {
        return false
      }
      if (elem.hasAttribute('data-instant')) {
        return true
      }
    }
    while (elem = elem.parentNode);
    return false
  }

  function isPreloadable(a) {
    var domain = location.protocol + '//' + location.host

    if (a.target // target="_blank" etc.
        || a.hasAttribute('download')
        || a.href.indexOf(domain + '/') != 0 // Another domain, or no href attribute
        || (a.href.indexOf('#') > -1
            && removeHash(a.href) == $currentLocationWithoutHash) // Anchor
        || ($useWhitelist
            ? !isWhitelisted(a)
            : isBlacklisted(a))
       ) {
      return false
    }
    return true
  }

  function triggerPageEvent(eventType, arg1, arg2, arg3) {
    var returnValue = false
    for (var i = 0; i < $eventsCallbacks[eventType].length; i++) {
      if (eventType == 'receive') {
        var altered = $eventsCallbacks[eventType][i](arg1, arg2, arg3)
        if (altered) {
          /* Update args for the next iteration of the loop. */
          if ('body' in altered) {
            arg2 = altered.body
          }
          if ('title' in altered) {
            arg3 = altered.title
          }

          returnValue = altered
        }
      }
      else {
        $eventsCallbacks[eventType][i](arg1, arg2, arg3)
      }
    }
    return returnValue
  }

  function changePage(title, body, newUrl, scrollY) {
    document.documentElement.replaceChild(body, document.body)
    /* We cannot just use `document.body = doc.body`, it causes Safari (tested
       5.1, 6.0 and Mobile 7.0) to execute script tags directly.
    */

    if (newUrl) {
      history.pushState(null, null, newUrl)

      var hashIndex = newUrl.indexOf('#'),
          hashElem = hashIndex > -1
                     && document.getElementById(newUrl.substr(hashIndex + 1)),
          offset = 0

      if (hashElem) {
        while (hashElem.offsetParent) {
          offset += hashElem.offsetTop

          hashElem = hashElem.offsetParent
        }
      }
      scrollTo(0, offset)

      $currentLocationWithoutHash = removeHash(newUrl)
    }
    else {
      scrollTo(0, scrollY)
    }

    if ($isChromeForIOS && document.title == title) {
      /* Chrome for iOS:
       *
       * 1. Removes title on pushState, so the title needs to be set after.
       *
       * 2. Will not set the title if it’s identical when trimmed, so
       *    appending a space won't do, but a non-breaking space works.
       */
      document.title = title + String.fromCharCode(160)
    }
    else {
      document.title = title
    }

    instantanize()
    bar.done()
    triggerPageEvent('change', false)

    // Real event, useful for combining userscripts, but only for that so it’s undocumented.
    var userscriptEvent = document.createEvent('HTMLEvents')
    userscriptEvent.initEvent('instantclick:newpage', true, true)
    dispatchEvent(userscriptEvent)
  }

  function setPreloadingAsHalted() {
    $isPreloading = false
    $isWaitingForCompletion = false
  }

  function removeNoscriptTags(html) {
    /* Must be done on text, not on a node's innerHTML, otherwise strange
     * things happen with implicitly closed elements (see the Noscript test).
     */
    return html.replace(/<noscript[\s\S]+<\/noscript>/gi, '')
  }


  ////////// EVENT HANDLERS //////////


  function mousedown(e) {
    if ($lastTouchTimestamp > (+new Date - 500)) {
      return // Otherwise, click doesn’t fire
    }

    var a = getLinkTarget(e.target)

    if (!a || !isPreloadable(a)) {
      return
    }

    preload(a.href)
  }

  function mouseover(e) {
    if ($lastTouchTimestamp > (+new Date - 500)) {
      return // Otherwise, click doesn’t fire
    }

    var a = getLinkTarget(e.target)

    if (!a || !isPreloadable(a)) {
      return
    }

    a.addEventListener('mouseout', mouseout)

    if (!$delayBeforePreload) {
      preload(a.href)
    }
    else {
      $urlToPreload = a.href
      $preloadTimer = setTimeout(preload, $delayBeforePreload)
    }
  }

  function touchstart(e) {
    $lastTouchTimestamp = +new Date

    var a = getLinkTarget(e.target)

    if (!a || !isPreloadable(a)) {
      return
    }

    if ($preloadOnMousedown) {
      a.removeEventListener('mousedown', mousedown)
    }
    else {
      a.removeEventListener('mouseover', mouseover)
    }
    preload(a.href)
  }

  function click(e) {
    var a = getLinkTarget(e.target)

    if (!a || !isPreloadable(a)) {
      return
    }

    if (e.which > 1 || e.metaKey || e.ctrlKey) { // Opening in new tab
      return
    }
    e.preventDefault()
    display(a.href)
  }

  function mouseout() {
    if ($preloadTimer) {
      clearTimeout($preloadTimer)
      $preloadTimer = false
      return
    }

    if (!$isPreloading || $isWaitingForCompletion) {
      return
    }
    $xhr.abort()
    setPreloadingAsHalted()
  }

  function readystatechange() {
    if ($xhr.readyState < 4) {
      return
    }
    if ($xhr.status == 0) {
      /* Request aborted */
      return
    }

    $timing.ready = +new Date - $timing.start

    if ($xhr.getResponseHeader('Content-Type').match(/\/(x|ht|xht)ml/)) {
      var doc = document.implementation.createHTMLDocument('')
      doc.documentElement.innerHTML = removeNoscriptTags($xhr.responseText)
      $title = doc.title
      $body = doc.body

      var alteredOnReceive = triggerPageEvent('receive', $url, $body, $title)
      if (alteredOnReceive) {
        if ('body' in alteredOnReceive) {
          $body = alteredOnReceive.body
        }
        if ('title' in alteredOnReceive) {
          $title = alteredOnReceive.title
        }
      }

      var urlWithoutHash = removeHash($url)
      $history[urlWithoutHash] = {
        body: $body,
        title: $title,
        scrollY: urlWithoutHash in $history ? $history[urlWithoutHash].scrollY : 0
      }

      var elems = doc.head.children,
          found = 0,
          elem,
          data

      for (var i = elems.length - 1; i >= 0; i--) {
        elem = elems[i]
        if (elem.hasAttribute('data-instant-track')) {
          data = elem.getAttribute('href') || elem.getAttribute('src') || elem.innerHTML
          for (var j = $trackedAssets.length - 1; j >= 0; j--) {
            if ($trackedAssets[j] == data) {
              found++
            }
          }
        }
      }
      if (found != $trackedAssets.length) {
        $mustRedirect = true // Assets have changed
      }
    }
    else {
      $mustRedirect = true // Not an HTML document
    }

    if ($isWaitingForCompletion) {
      $isWaitingForCompletion = false
      display($url)
    }
  }


  ////////// MAIN FUNCTIONS //////////


  function instantanize(isInitializing) {
    document.body.addEventListener('touchstart', touchstart, true)
    if ($preloadOnMousedown) {
      document.body.addEventListener('mousedown', mousedown, true)
    }
    else {
      document.body.addEventListener('mouseover', mouseover, true)
    }
    document.body.addEventListener('click', click, true)

    if (!isInitializing) {
      var scripts = document.body.getElementsByTagName('script'),
          script,
          copy,
          parentNode,
          nextSibling

      for (i = 0, j = scripts.length; i < j; i++) {
        script = scripts[i]
        if (script.hasAttribute('data-no-instant')) {
          continue
        }
        copy = document.createElement('script')
        if (script.src) {
          copy.src = script.src
        }
        if (script.innerHTML) {
          copy.innerHTML = script.innerHTML
        }
        parentNode = script.parentNode
        nextSibling = script.nextSibling
        parentNode.removeChild(script)
        parentNode.insertBefore(copy, nextSibling)
      }
    }
  }

  function preload(url) {
    if (!$preloadOnMousedown
        && 'display' in $timing
        && +new Date - ($timing.start + $timing.display) < 100) {
      /* After a page is displayed, if the user's cursor happens to be above
         a link a mouseover event will be in most browsers triggered
         automatically, and in other browsers it will be triggered when the
         user moves his mouse by 1px.

         Here are the behavior I noticed, all on Windows:
         - Safari 5.1: auto-triggers after 0 ms
         - IE 11: auto-triggers after 30-80 ms (depends on page's size?)
         - Firefox: auto-triggers after 10 ms
         - Opera 18: auto-triggers after 10 ms

         - Chrome: triggers when cursor moved
         - Opera 12.16: triggers when cursor moved

         To remedy to this, we do not start preloading if last display
         occurred less than 100 ms ago. If they happen to click on the link,
         they will be redirected.
      */

      return
    }
    if ($preloadTimer) {
      clearTimeout($preloadTimer)
      $preloadTimer = false
    }

    if (!url) {
      url = $urlToPreload
    }

    if ($isPreloading && (url == $url || $isWaitingForCompletion)) {
      return
    }
    $isPreloading = true
    $isWaitingForCompletion = false

    $url = url
    $body = false
    $mustRedirect = false
    $timing = {
      start: +new Date
    }
    triggerPageEvent('fetch')
    $xhr.open('GET', url)
    $xhr.send()
  }

  function display(url) {
    if (!('display' in $timing)) {
      $timing.display = +new Date - $timing.start
    }
    if ($preloadTimer || !$isPreloading) {
      /* $preloadTimer:
         Happens when there’s a delay before preloading and that delay
         hasn't expired (preloading didn't kick in).

         !$isPreloading:
         A link has been clicked, and preloading hasn’t been initiated.
         It happens with touch devices when a user taps *near* the link,
         Safari/Chrome will trigger mousedown, mouseover, click (and others),
         but when that happens we ignore mousedown/mouseover (otherwise click
         doesn’t fire). Maybe there’s a way to make the click event fire, but
         that’s not worth it as mousedown/over happen just 1ms before click
         in this situation.

         It also happens when a user uses his keyboard to navigate (with Tab
         and Return), and possibly in other non-mainstream ways to navigate
         a website.
      */

      if ($preloadTimer && $url && $url != url) {
        /* Happens when the user clicks on a link before preloading
           kicks in while another link is already preloading.
        */

        location.href = url
        return
      }

      preload(url)
      bar.start(0, true)
      triggerPageEvent('wait')
      $isWaitingForCompletion = true // Must be set *after* calling `preload`
      return
    }
    if ($isWaitingForCompletion) {
      /* The user clicked on a link while a page was preloading. Either on
         the same link or on another link. If it's the same link something
         might have gone wrong (or he could have double clicked, we don’t
         handle that case), so we send him to the page without pjax.
         If it's another link, it hasn't been preloaded, so we redirect the
         user to it.
      */
      location.href = url
      return
    }
    if ($mustRedirect) {
      location.href = $url
      return
    }
    if (!$body) {
      bar.start(0, true)
      triggerPageEvent('wait')
      $isWaitingForCompletion = true
      return
    }
    $history[$currentLocationWithoutHash].scrollY = pageYOffset
    setPreloadingAsHalted()
    changePage($title, $body, $url)
  }


  ////////// PROGRESS BAR FUNCTIONS //////////


  var bar = function() {
    var $barContainer,
        $barElement,
        $barTransformProperty,
        $barProgress,
        $barTimer

    function init() {
      $barContainer = document.createElement('div')
      $barContainer.id = 'instantclick'
      $barElement = document.createElement('div')
      $barElement.id = 'instantclick-bar'
      $barElement.className = 'instantclick-bar'
      $barContainer.appendChild($barElement)

      var vendors = ['Webkit', 'Moz', 'O']

      $barTransformProperty = 'transform'
      if (!($barTransformProperty in $barElement.style)) {
        for (var i = 0; i < 3; i++) {
          if (vendors[i] + 'Transform' in $barElement.style) {
            $barTransformProperty = vendors[i] + 'Transform'
          }
        }
      }

      var transitionProperty = 'transition'
      if (!(transitionProperty in $barElement.style)) {
        for (var i = 0; i < 3; i++) {
          if (vendors[i] + 'Transition' in $barElement.style) {
            transitionProperty = '-' + vendors[i].toLowerCase() + '-' + transitionProperty
          }
        }
      }

      var style = document.createElement('style')
      style.innerHTML = '#instantclick{position:' + ($hasTouch ? 'absolute' : 'fixed') + ';top:0;left:0;width:100%;pointer-events:none;z-index:2147483647;' + transitionProperty + ':opacity .25s .1s}'
        + '.instantclick-bar{background:#29d;width:100%;margin-left:-100%;height:2px;' + transitionProperty + ':all .25s}'
      /* We set the bar's background in `.instantclick-bar` so that it can be
         overriden in CSS with `#instantclick-bar`, as IDs have higher priority.
      */
      document.head.appendChild(style)

      if ($hasTouch) {
        updatePositionAndScale()
        addEventListener('resize', updatePositionAndScale)
        addEventListener('scroll', updatePositionAndScale)
      }

    }

    function start(at, jump) {
      $barProgress = at
      if (document.getElementById($barContainer.id)) {
        document.body.removeChild($barContainer)
      }
      $barContainer.style.opacity = '1'
      if (document.getElementById($barContainer.id)) {
        document.body.removeChild($barContainer)
        /* So there's no CSS animation if already done once and it goes from 1 to 0 */
      }
      update()
      if (jump) {
        setTimeout(jumpStart, 0)
        /* Must be done in a timer, otherwise the CSS animation doesn't happen. */
      }
      clearTimeout($barTimer)
      $barTimer = setTimeout(inc, 500)
    }

    function jumpStart() {
      $barProgress = 10
      update()
    }

    function inc() {
      $barProgress += 1 + (Math.random() * 2)
      if ($barProgress >= 98) {
        $barProgress = 98
      }
      else {
        $barTimer = setTimeout(inc, 500)
      }
      update()
    }

    function update() {
      $barElement.style[$barTransformProperty] = 'translate(' + $barProgress + '%)'
      if (!document.getElementById($barContainer.id)) {
        document.body.appendChild($barContainer)
      }
    }

    function done() {
      if (document.getElementById($barContainer.id)) {
        clearTimeout($barTimer)
        $barProgress = 100
        update()
        $barContainer.style.opacity = '0'
        /* If you're debugging, setting this to 0.5 is handy. */
        return
      }

      /* The bar container hasn't been appended: It's a new page. */
      start($barProgress == 100 ? 0 : $barProgress)
      /* $barProgress is 100 on popstate, usually. */
      setTimeout(done, 0)
      /* Must be done in a timer, otherwise the CSS animation doesn't happen. */
    }

    function updatePositionAndScale() {
      /* Adapted from code by Sam Stephenson and Mislav Marohnić
         http://signalvnoise.com/posts/2407
      */

      $barContainer.style.left = pageXOffset + 'px'
      $barContainer.style.width = innerWidth + 'px'
      $barContainer.style.top = pageYOffset + 'px'

      var landscape = 'orientation' in window && Math.abs(orientation) == 90,
          scaleY = innerWidth / screen[landscape ? 'height' : 'width'] * 2
      /* We multiply the size by 2 because the progress bar is harder
         to notice on a mobile device.
      */
      $barContainer.style[$barTransformProperty] = 'scaleY(' + scaleY  + ')'
    }

    return {
      init: init,
      start: start,
      done: done
    }
  }()


  ////////// PUBLIC VARIABLE AND FUNCTIONS //////////

  var supported = 'pushState' in history
                  && (!$ua.match('Android') || $ua.match('Chrome/'))
                  && location.protocol != "file:"

  /* The state of Android's AOSP browsers:

     2.3.7: pushState appears to work correctly, but
            `doc.documentElement.innerHTML = body` is buggy.
            See details here: http://stackoverflow.com/q/21918564
            Not an issue anymore, but it may fail where 3.0 do, this needs
            testing again.

     3.0:   pushState appears to work correctly (though the URL bar is only
            updated on focus), but
            `document.documentElement.replaceChild(doc.body, document.body)`
        throws DOMException: WRONG_DOCUMENT_ERR.

     4.0.2: Doesn't support pushState.

     4.0.4,
     4.1.1,
     4.2,
     4.3:   pushState is here, but it doesn't update the URL bar.
            (Great logic there.)

     4.4:   Works correctly. Claims to be 'Chrome/30.0.0.0'.

     All androids tested with Android SDK's Emulator.
     Version numbers are from the browser's user agent.

     Because of this mess, the only whitelisted browser on Android is Chrome.
  */

  function init() {
    if ($currentLocationWithoutHash) {
      /* Already initialized */
      return
    }
    if (!supported) {
      triggerPageEvent('change', true)
      return
    }
    for (var i = arguments.length - 1; i >= 0; i--) {
      var arg = arguments[i]
      if (arg === true) {
        $useWhitelist = true
      }
      else if (arg == 'mousedown') {
        $preloadOnMousedown = true
      }
      else if (typeof arg == 'number') {
        $delayBeforePreload = arg
      }
    }
    $currentLocationWithoutHash = removeHash(location.href)
    $history[$currentLocationWithoutHash] = {
      body: document.body,
      title: document.title,
      scrollY: pageYOffset
    }

    var elems = document.head.children,
        elem,
        data
    for (var i = elems.length - 1; i >= 0; i--) {
      elem = elems[i]
      if (elem.hasAttribute('data-instant-track')) {
        data = elem.getAttribute('href') || elem.getAttribute('src') || elem.innerHTML
        /* We can't use just `elem.href` and `elem.src` because we can't
           retrieve `href`s and `src`s from the Ajax response.
        */
        $trackedAssets.push(data)
      }
    }

    $xhr = new XMLHttpRequest()
    $xhr.addEventListener('readystatechange', readystatechange)

    instantanize(true)

    bar.init()

    triggerPageEvent('change', true)

    addEventListener('popstate', function() {
      var loc = removeHash(location.href)
      if (loc == $currentLocationWithoutHash) {
        return
      }

      if (!(loc in $history)) {
        location.href = location.href
        /* Reloads the page while using cache for scripts, styles and images,
           unlike `location.reload()` */
        return
      }

      $history[$currentLocationWithoutHash].scrollY = pageYOffset
      $currentLocationWithoutHash = loc
      changePage($history[loc].title, $history[loc].body, false, $history[loc].scrollY)
    })
  }

  function on(eventType, callback) {
    $eventsCallbacks[eventType].push(callback)
  }


  ////////////////////


  return {
    supported: supported,
    init: init,
    on: on
  }

}(document, location);

(function() {
  'use strict';
  $(function() {
    var _animate, _expand;
    _animate = function() {
      return setTimeout(function() {
        return $('.cover').addClass('animated');
      }, 1000);
    };
    _expand = function(options) {
      $('main, .cover, .links > li, html').toggleClass('expanded');
      return Uno.search.form(options.form);
    };
    $('#menu-button').click(function() {
      return $('.cover, main, #menu-button, html').toggleClass('expanded');
    });
    $(`${window.open_button}, #avatar-link`).click(function(event) {
      if (Uno.is('page', 'home')) {
        event.preventDefault();
        location.hash = location.hash === '' ? '#open' : '';
        if (!Uno.is('device', 'desktop')) {
          return $('#menu-button').trigger('click');
        }
        return _expand({
          form: 'toggle'
        });
      }
    });
    if ((Uno.is('device', 'desktop')) && (Uno.is('page', 'home'))) {
      _animate();
      if (location.hash !== '#open') {
        return _expand({
          form: 'hide'
        });
      }
    }
  });

}).call(this);

/*!
 * pace.js v1.2.4
 * https://github.com/CodeByZach/pace/
 * Licensed MIT © HubSpot, Inc.
 */
!function(){function o(t,e){return function(){return t.apply(e,arguments)}}var u,c,i,s,n,y,t,l,v,r,a,p,e,h,w,b,f,g,d,m,k,S,q,L,x,P,T,R,j,O,E,M,A,C,N,_,F,U,W,X,D,H,I,z,G,B,J=[].slice,K={}.hasOwnProperty,Q=function(t,e){for(var n in e)K.call(e,n)&&(t[n]=e[n]);function r(){this.constructor=t}return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},V=[].indexOf||function(t){for(var e=0,n=this.length;e<n;e++)if(e in this&&this[e]===t)return e;return-1};function Y(){}for(g={className:"",catchupTime:100,initialRate:.03,minTime:250,ghostTime:100,maxProgressPerFrame:20,easeFactor:1.25,startOnPageLoad:!0,restartOnPushState:!0,restartOnRequestAfter:500,target:"body",elements:{checkInterval:100,selectors:["body"]},eventLag:{minSamples:10,sampleCount:3,lagThreshold:3},ajax:{trackMethods:["GET"],trackWebSockets:!0,ignoreURLs:[]}},P=function(){var t;return null!=(t="undefined"!=typeof performance&&null!==performance&&"function"==typeof performance.now?performance.now():void 0)?t:+new Date},R=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame,f=window.cancelAnimationFrame||window.mozCancelAnimationFrame,p=function(t,e,n){if("function"==typeof t.addEventListener)return t.addEventListener(e,n,!1);var r;"function"!=typeof t["on"+e]||"object"!=typeof t["on"+e].eventListeners?(r=new s,"function"==typeof t["on"+e]&&r.on(e,t["on"+e]),t["on"+e]=function(t){return r.trigger(e,t)},t["on"+e].eventListeners=r):r=t["on"+e].eventListeners,r.on(e,n)},null==R&&(R=function(t){return setTimeout(t,50)},f=function(t){return clearTimeout(t)}),O=function(e){var n=P(),r=function(){var t=P()-n;return 33<=t?(n=P(),e(t,function(){return R(r)})):setTimeout(r,33-t)};return r()},j=function(){var t=arguments[0],e=arguments[1],n=3<=arguments.length?J.call(arguments,2):[];return"function"==typeof t[e]?t[e].apply(t,n):t[e]},d=function(){for(var t,e,n,r=arguments[0],s=2<=arguments.length?J.call(arguments,1):[],o=0,i=s.length;o<i;o++)if(e=s[o])for(t in e)K.call(e,t)&&(n=e[t],null!=r[t]&&"object"==typeof r[t]&&null!=n&&"object"==typeof n?d(r[t],n):r[t]=n);return r},h=function(t){for(var e,n,r=e=0,s=0,o=t.length;s<o;s++)n=t[s],r+=Math.abs(n),e++;return r/e},k=function(t,e){var n,r;if(null==t&&(t="options"),null==e&&(e=!0),r=document.querySelector("[data-pace-"+t+"]")){if(n=r.getAttribute("data-pace-"+t),!e)return n;try{return JSON.parse(n)}catch(t){return"undefined"!=typeof console&&null!==console?console.error("Error parsing inline pace options",t):void 0}}},Y.prototype.on=function(t,e,n,r){var s;return null==r&&(r=!1),null==this.bindings&&(this.bindings={}),null==(s=this.bindings)[t]&&(s[t]=[]),this.bindings[t].push({handler:e,ctx:n,once:r})},Y.prototype.once=function(t,e,n){return this.on(t,e,n,!0)},Y.prototype.off=function(t,e){var n,r,s;if(null!=(null!=(r=this.bindings)?r[t]:void 0)){if(null==e)return delete this.bindings[t];for(n=0,s=[];n<this.bindings[t].length;)this.bindings[t][n].handler===e?s.push(this.bindings[t].splice(n,1)):s.push(n++);return s}},Y.prototype.trigger=function(){var t,e,n,r,s,o,i=arguments[0],a=2<=arguments.length?J.call(arguments,1):[];if(null!=(r=this.bindings)&&r[i]){for(n=0,o=[];n<this.bindings[i].length;)e=(s=this.bindings[i][n]).handler,t=s.ctx,s=s.once,e.apply(null!=t?t:this,a),s?o.push(this.bindings[i].splice(n,1)):o.push(n++);return o}},B=Y,y=window.Pace||{},window.Pace=y,d(y,B.prototype),T=y.options=d({},g,window.paceOptions,k()),X=0,H=(z=["ajax","document","eventLag","elements"]).length;X<H;X++)!0===T[C=z[X]]&&(T[C]=g[C]);function Z(){return Z.__super__.constructor.apply(this,arguments)}function $(){this.progress=0}function tt(){this.bindings={}}function et(){var e,o=this;et.__super__.constructor.apply(this,arguments),e=function(r){var s=r.open;return r.open=function(t,e,n){return A(t)&&o.trigger("request",{type:t,url:e,request:r}),s.apply(r,arguments)}},window.XMLHttpRequest=function(t){t=new W(t);return e(t),t};try{m(window.XMLHttpRequest,W)}catch(t){}if(null!=U){window.XDomainRequest=function(){var t=new U;return e(t),t};try{m(window.XDomainRequest,U)}catch(t){}}if(null!=F&&T.ajax.trackWebSockets){window.WebSocket=function(t,e){var n=null!=e?new F(t,e):new F(t);return A("socket")&&o.trigger("request",{type:"socket",url:t,protocols:e,request:n}),n};try{m(window.WebSocket,F)}catch(t){}}}function nt(){this.complete=o(this.complete,this);var t=this;this.elements=[],S().on("request",function(){return t.watch.apply(t,arguments)})}function rt(t){var e,n,r,s;for(null==t&&(t={}),this.complete=o(this.complete,this),this.elements=[],null==t.selectors&&(t.selectors=[]),n=0,r=(s=t.selectors).length;n<r;n++)e=s[n],this.elements.push(new i(e,this.complete))}function st(t,e){this.selector=t,this.completeCallback=e,this.progress=0,this.check()}function ot(){var t,e,n=this;this.progress=null!=(e=this.states[document.readyState])?e:100,t=document.onreadystatechange,document.onreadystatechange=function(){return null!=n.states[document.readyState]&&(n.progress=n.states[document.readyState]),"function"==typeof t?t.apply(null,arguments):void 0}}function it(t){this.source=t,this.last=this.sinceLastUpdate=0,this.rate=T.initialRate,this.catchup=0,this.progress=this.lastProgress=0,null!=this.source&&(this.progress=j(this.source,"progress"))}B=Error,Q(Z,B),n=Z,$.prototype.getElement=function(){var t;if(null==this.el){if(!(t=document.querySelector(T.target)))throw new n;this.el=document.createElement("div"),this.el.className="pace pace-active",document.body.className=document.body.className.replace(/(pace-done )|/,"pace-running ");var e=""!==T.className?" "+T.className:"";this.el.innerHTML='<div class="pace-progress'+e+'">\n  <div class="pace-progress-inner"></div>\n</div>\n<div class="pace-activity"></div>',null!=t.firstChild?t.insertBefore(this.el,t.firstChild):t.appendChild(this.el)}return this.el},$.prototype.finish=function(){var t=this.getElement();return t.className=t.className.replace("pace-active","pace-inactive"),document.body.className=document.body.className.replace("pace-running ","pace-done ")},$.prototype.update=function(t){return this.progress=t,y.trigger("progress",t),this.render()},$.prototype.destroy=function(){try{this.getElement().parentNode.removeChild(this.getElement())}catch(t){n=t}return this.el=void 0},$.prototype.render=function(){var t,e,n,r,s,o,i;if(null==document.querySelector(T.target))return!1;for(t=this.getElement(),r="translate3d("+this.progress+"%, 0, 0)",s=0,o=(i=["webkitTransform","msTransform","transform"]).length;s<o;s++)e=i[s],t.children[0].style[e]=r;return(!this.lastRenderedProgress||this.lastRenderedProgress|0!==this.progress|0)&&(t.children[0].setAttribute("data-progress-text",(0|this.progress)+"%"),100<=this.progress?n="99":(n=this.progress<10?"0":"",n+=0|this.progress),t.children[0].setAttribute("data-progress",""+n)),y.trigger("change",this.progress),this.lastRenderedProgress=this.progress},$.prototype.done=function(){return 100<=this.progress},c=$,tt.prototype.trigger=function(t,e){var n,r,s,o,i;if(null!=this.bindings[t]){for(i=[],r=0,s=(o=this.bindings[t]).length;r<s;r++)n=o[r],i.push(n.call(this,e));return i}},tt.prototype.on=function(t,e){var n;return null==(n=this.bindings)[t]&&(n[t]=[]),this.bindings[t].push(e)},s=tt,W=window.XMLHttpRequest,U=window.XDomainRequest,F=window.WebSocket,m=function(t,e){var n,r=[];for(n in e.prototype)try{null==t[n]&&"function"!=typeof e[n]?"function"==typeof Object.defineProperty?r.push(Object.defineProperty(t,n,{get:function(t){return function(){return e.prototype[t]}}(n),configurable:!0,enumerable:!0})):r.push(t[n]=e.prototype[n]):r.push(void 0)}catch(t){0}return r},L=[],y.ignore=function(){var t=arguments[0],e=2<=arguments.length?J.call(arguments,1):[];return L.unshift("ignore"),e=t.apply(null,e),L.shift(),e},y.track=function(){var t=arguments[0],e=2<=arguments.length?J.call(arguments,1):[];return L.unshift("track"),e=t.apply(null,e),L.shift(),e},A=function(t){if(null==t&&(t="GET"),"track"===L[0])return"force";if(!L.length&&T.ajax){if("socket"===t&&T.ajax.trackWebSockets)return!0;if(t=t.toUpperCase(),0<=V.call(T.ajax.trackMethods,t))return!0}return!1},Q(et,s),t=et,D=null,M=function(t){for(var e,n=T.ajax.ignoreURLs,r=0,s=n.length;r<s;r++)if("string"==typeof(e=n[r])){if(-1!==t.indexOf(e))return!0}else if(e.test(t))return!0;return!1},(S=function(){return D=null==D?new t:D})().on("request",function(t){var o,i=t.type,a=t.request,e=t.url;if(!M(e))return y.running||!1===T.restartOnRequestAfter&&"force"!==A(i)?void 0:(o=arguments,"boolean"==typeof(e=T.restartOnRequestAfter||0)&&(e=0),setTimeout(function(){var t,e,n,r,s="socket"===i?a.readyState<1:0<(s=a.readyState)&&s<4;if(s){for(y.restart(),r=[],t=0,e=(n=y.sources).length;t<e;t++){if((C=n[t])instanceof u){C.watch.apply(C,o);break}r.push(void 0)}return r}},e))}),nt.prototype.watch=function(t){var e=t.type,n=t.request,t=t.url;if(!M(t))return n=new("socket"===e?r:a)(n,this.complete),this.elements.push(n)},nt.prototype.complete=function(e){return this.elements=this.elements.filter(function(t){return t!==e})},u=nt,a=function(e,n){var t,r,s,o,i=this;if(this.progress=0,null!=window.ProgressEvent)for(p(e,"progress",function(t){return t.lengthComputable?i.progress=100*t.loaded/t.total:i.progress=i.progress+(100-i.progress)/2}),t=0,r=(o=["load","abort","timeout","error"]).length;t<r;t++)p(e,o[t],function(){return n(i),i.progress=100});else s=e.onreadystatechange,e.onreadystatechange=function(){var t;return 0===(t=e.readyState)||4===t?(n(i),i.progress=100):3===e.readyState&&(i.progress=50),"function"==typeof s?s.apply(null,arguments):void 0}},r=function(t,e){for(var n,r=this,s=this.progress=0,o=(n=["error","open"]).length;s<o;s++)p(t,n[s],function(){return e(r),r.progress=100})},rt.prototype.complete=function(e){return this.elements=this.elements.filter(function(t){return t!==e})},k=rt,st.prototype.check=function(){var t=this;return document.querySelector(this.selector)?this.done():setTimeout(function(){return t.check()},T.elements.checkInterval)},st.prototype.done=function(){return this.completeCallback(this),this.completeCallback=null,this.progress=100},i=st,ot.prototype.states={loading:0,interactive:50,complete:100},B=ot,Q=function(){var e,n,r,s,o,i=this;this.progress=0,o=[],s=0,r=P(),n=setInterval(function(){var t=P()-r-50;return r=P(),o.push(t),o.length>T.eventLag.sampleCount&&o.shift(),e=h(o),++s>=T.eventLag.minSamples&&e<T.eventLag.lagThreshold?(i.progress=100,clearInterval(n)):i.progress=3/(e+3)*100},50)},it.prototype.tick=function(t,e){return 100<=(e=null==e?j(this.source,"progress"):e)&&(this.done=!0),e===this.last?this.sinceLastUpdate+=t:(this.sinceLastUpdate&&(this.rate=(e-this.last)/this.sinceLastUpdate),this.catchup=(e-this.progress)/T.catchupTime,this.sinceLastUpdate=0,this.last=e),e>this.progress&&(this.progress+=this.catchup*t),e=1-Math.pow(this.progress/100,T.easeFactor),this.progress+=e*this.rate*t,this.progress=Math.min(this.lastProgress+T.maxProgressPerFrame,this.progress),this.progress=Math.max(0,this.progress),this.progress=Math.min(100,this.progress),this.lastProgress=this.progress,this.progress},v=it,b=e=_=w=E=N=null,y.running=!1,q=function(){if(T.restartOnPushState)return y.restart()},null!=window.history.pushState&&(I=window.history.pushState,window.history.pushState=function(){return q(),I.apply(window.history,arguments)}),null!=window.history.replaceState&&(G=window.history.replaceState,window.history.replaceState=function(){return q(),G.apply(window.history,arguments)}),l={ajax:u,elements:k,document:B,eventLag:Q},(x=function(){var t,e,n,r,s,o,i,a;for(y.sources=N=[],e=0,r=(o=["ajax","elements","document","eventLag"]).length;e<r;e++)!1!==T[t=o[e]]&&N.push(new l[t](T[t]));for(n=0,s=(a=null!=(i=T.extraSources)?i:[]).length;n<s;n++)C=a[n],N.push(new C(T));return y.bar=w=new c,E=[],_=new v})(),y.stop=function(){return y.trigger("stop"),y.running=!1,w.destroy(),b=!0,null!=e&&("function"==typeof f&&f(e),e=null),x()},y.restart=function(){return y.trigger("restart"),y.stop(),y.start()},y.go=function(){var m;return y.running=!0,w.render(),m=P(),b=!1,e=O(function(t,e){w.progress;for(var n,r,s,o,i,a,u,c,l,p,h=a=0,f=!0,g=u=0,d=N.length;u<d;g=++u)for(C=N[g],i=null!=E[g]?E[g]:E[g]=[],s=c=0,l=(r=null!=(p=C.elements)?p:[C]).length;c<l;s=++c)o=r[s],f&=(o=null!=i[s]?i[s]:i[s]=new v(o)).done,o.done||(h++,a+=o.tick(t));return n=a/h,w.update(_.tick(t,n)),w.done()||f||b?(w.update(100),y.trigger("done"),setTimeout(function(){return w.finish(),y.running=!1,y.trigger("hide")},Math.max(T.ghostTime,Math.max(T.minTime-(P()-m),0)))):e()})},y.start=function(t){d(T,t),y.running=!0;try{w.render()}catch(t){n=t}return document.querySelector(".pace")?(y.trigger("start"),y.go()):setTimeout(y.start,50)},"function"==typeof define&&define.amd?define(function(){return y}):"object"==typeof exports?module.exports=y:T.startOnPageLoad&&y.start()}.call(this);

/*!
Name: Reading Time
Dependencies: jQuery
Author: Michael Lynch
Author URL: http://michaelynch.com
Date Created: August 14, 2013
Date Updated: February 28, 2018
Licensed under the MIT license
*/
!function(n){n.fn.readingTime=function(e){const t=n(this);let i,r,a,s,u,g,l,m,o;this.settings=n.extend({},{readingTimeTarget:".eta",readingTimeAsNumber:!1,wordCountTarget:null,wordsPerMinute:270,round:!0,lang:"en",lessThanAMinuteString:"",prependTimeString:"",prependWordString:"",remotePath:null,remoteTarget:null,success:function(){},error:function(){}},e);const d=this.settings,T=function(e){""!==e.text?(s=e.text.trim().split(/\s+/g).length,i=d.wordsPerMinute/60,u=s/i,g=Math.floor(u/60),l=Math.round(u-60*g),m=`${g}:${l}`,d.round?g>0?n(d.readingTimeTarget).text(d.prependTimeString+g+(d.readingTimeAsNumber?"":" "+a)):n(d.readingTimeTarget).text(d.readingTimeAsNumber?g:d.prependTimeString+r):n(d.readingTimeTarget).text(d.prependTimeString+m),""!==d.wordCountTarget&&void 0!==d.wordCountTarget&&n(d.wordCountTarget).text(d.prependWordString+s),o={wpm:d.wordsPerMinute,words:s,eta:{time:m,minutes:g,seconds:u}},d.success.call(this,o)):d.error.call(this,{error:"The element does not contain any text"})};return this.length?("ar"==d.lang?(r=d.lessThanAMinuteString||"أقل من دقيقة",a="دقيقة"):"cz"==d.lang?(r=d.lessThanAMinuteString||"Méně než minutu",a="min"):"da"==d.lang?(r=d.lessThanAMinuteString||"Mindre end et minut",a="min"):"de"==d.lang?(r=d.lessThanAMinuteString||"Weniger als eine Minute",a="min"):"es"==d.lang?(r=d.lessThanAMinuteString||"Menos de un minuto",a="min"):"fr"==d.lang?(r=d.lessThanAMinuteString||"Moins d'une minute",a="min"):"hu"==d.lang?(r=d.lessThanAMinuteString||"Kevesebb mint egy perc",a="perc"):"is"==d.lang?(r=d.lessThanAMinuteString||"Minna en eina mínútu",a="min"):"it"==d.lang?(r=d.lessThanAMinuteString||"Meno di un minuto",a="min"):"nl"==d.lang?(r=d.lessThanAMinuteString||"Minder dan een minuut",a="min"):"no"==d.lang?(r=d.lessThanAMinuteString||"Mindre enn ett minutt",a="min"):"pl"==d.lang?(r=d.lessThanAMinuteString||"Mniej niż minutę",a="min"):"ru"==d.lang?(r=d.lessThanAMinuteString||"Меньше минуты",a="мой"):"sk"==d.lang?(r=d.lessThanAMinuteString||"Menej než minútu",a="min"):"sv"==d.lang?(r=d.lessThanAMinuteString||"Mindre än en minut",a="min"):"tr"==d.lang?(r=d.lessThanAMinuteString||"Bir dakikadan az",a="dk"):(r=d.lessThanAMinuteString||"Less than a minute",a="min"),t.each(function(e){null!=d.remotePath&&null!=d.remoteTarget?n.get(d.remotePath,function(e){T({text:n("<div>").html(e).find(d.remoteTarget).text()})}):T({text:t.text()})}),!0):(d.error.call(this,{error:"The element could not be found"}),this)}}(jQuery);
