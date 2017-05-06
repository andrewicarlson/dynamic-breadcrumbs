(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * The interpolate function accepts a string as the first argument and will interpolate the values found in the object argument.
 *
 * Usage: interpolate("This is a {0} with {1} interpolations", {"0": "string", "1": "2"});
 */
"use strict";
/**
 *
 * @param interpolationString: string
 * @param interpolationValues: InterpolationValues interface
 * @returns {string}
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function interpolate(interpolationString, interpolationValues) {
    if (typeof interpolationString !== 'string') {
        throw new Error('interpolationString argument must be of type "string"');
    }
    if ((typeof interpolationValues === 'undefined' ? 'undefined' : _typeof(interpolationValues)) !== 'object' || interpolationValues === null || Array.isArray(interpolationValues)) {
        throw new Error('interpolationValues argument must be of type "object", non-null and not an Array');
    }
    return interpolationString.replace(/{([^{}]*)}/g, function (a, b) {
        var r = interpolationValues[b];
        return typeof r === 'string' ? r : a;
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = interpolate;

},{}],2:[function(require,module,exports){
/**
 * This conversion function converts a NodeList (https://developer.mozilla.org/en-US/docs/Web/API/NodeList) to an Array
 * (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) to allow access to the native
 * Array methods.
 *
 * @param nodelist: An HTML NodeList (eg: document.querySelectorAll('.xyz'))
 * @returns Array<HTMLElement>: An array of the DOM Nodes from the nodelist
 *
 * Usage: nlToArray(document.querySelectorAll('.xyz'));
 */
"use strict";

function nlToArray(nodelist) {
  return [].slice.call(nodelist);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = nlToArray;

},{}],3:[function(require,module,exports){
"use strict";
/**
 * The ready function is a replica of $(document).ready() in jQuery.
 *
 * @param fn: Function
 * Usage: ready( () => {} ); OR ready(functionName);
 */

function ready(fn) {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", function () {
            fn();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ready;

},{}],4:[function(require,module,exports){
"use strict";

var ready_1 = require("./components/atoms/ready");
var interpolation_1 = require("./components/atoms/interpolation");
var nodelist_to_array_1 = require("./components/atoms/nodelist-to-array");
var Breadcrumbs = function () {
    function Breadcrumbs(obj) {
        this.cookieName = "dbctracked";
        this.localStorageName = "breadcrumbs";
        this.breadcrumbElement = obj.breadcrumbElement;
        this.maxVisible = obj.maxVisible || 3;
        this.breadcrumbsHTML = obj.breadcrumbsHTML || "<a href='{url}' title='{label}'>{label}</a>";
        this.init();
    }
    /**
     *
     * @param cookieName
     * @param localStorageName
     *
     * This method looks for a cookie to identify whether this is a new session or not.
     * A cookie is used because localStorage doesn't ever expire and sessionStorage doesn't persist across tabs.
     *
     * The cookie holds a boolean value and the actual breadcrumb structure is held in localStorage.
     */
    Breadcrumbs.prototype.cookieCheck = function (cookieName, localStorageName) {
        // Not a "good" part of JS but need to use a variable in a regex.
        var cookieRegex = new RegExp("(?:(?:^|.*;\s*)" + cookieName + "\s*\=\s*([^;]*).*$)|^.*$");
        var noCookieExists = document.cookie.replace(cookieRegex, "$1").length === 0;
        if (noCookieExists) {
            window.localStorage.setItem(localStorageName, JSON.stringify([]));
            document.cookie = cookieName + "=true";
        }
    };
    /**
     *
     * @param obj
     * @returns {IBreadcrumb[]}
     *
     * This method only adds an item to the breadcrumbs in localStorage if the current url is unique from the most
     * recent entry in the object. This prevents extra breadcrumbs from being added if you refresh the page.
     */
    Breadcrumbs.prototype.addIfUniqueEntry = function (obj) {
        var lastBreadcrumb = obj.currentBreadcrumbs.slice(-1).pop();
        if (lastBreadcrumb && obj.newBreadcrumb.url === lastBreadcrumb.url) {
            return obj.currentBreadcrumbs;
        }
        obj.currentBreadcrumbs.push(obj.newBreadcrumb);
        window.localStorage.setItem(obj.localStorageName, JSON.stringify(obj.currentBreadcrumbs));
        return obj.currentBreadcrumbs;
    };
    Breadcrumbs.prototype.createNewBreadcrumb = function (breadcrumbElement, url) {
        var label = breadcrumbElement.dataset["breadcrumbLabel"] || "N/A"; // tslint:disable-line
        return {
            label: label,
            url: url
        };
    };
    Breadcrumbs.prototype.createBreadcrumbHTML = function (obj) {
        var temp = document.createElement("div");
        temp.innerHTML = interpolation_1.default(obj.breadcrumbsHTML, {
            label: obj.breadcrumbDetails.label,
            url: obj.breadcrumbDetails.url
        });
        return temp.childNodes;
    };
    /**
     *
     * @param nodeList
     * @param frag
     * @returns {DocumentFragment}
     *
     * Creates an array from a NodeList so we have native access to .forEach() and then appends each Node to the fragment.
     */
    Breadcrumbs.prototype.addNlToFrag = function (nodeList, frag) {
        var nodeArray = nodelist_to_array_1.default(nodeList);
        nodeArray.forEach(function (currentItem) {
            frag.appendChild(currentItem);
        });
        return frag;
    };
    Breadcrumbs.prototype.generateHTML = function (obj) {
        var _this = this;
        var frag = document.createDocumentFragment();
        var truncatedBreadcrumbs = obj.breadcrumbsToInsert.slice(obj.maxVisible * -1);
        truncatedBreadcrumbs.forEach(function (currentItem, index) {
            var breadcrumbHTML = _this.createBreadcrumbHTML({
                breadcrumbDetails: currentItem,
                breadcrumbsHTML: obj.breadcrumbsHTML
            });
            frag = _this.addNlToFrag(breadcrumbHTML, frag);
        });
        obj.breadcrumbElement.appendChild(frag);
    };
    Breadcrumbs.prototype.init = function () {
        if (!this.breadcrumbElement) {
            return;
        }
        this.cookieCheck(this.cookieName, this.localStorageName);
        this.currentBreadcrumbs = JSON.parse(window.localStorage.getItem(this.localStorageName));
        this.newBreadcrumb = this.createNewBreadcrumb(this.breadcrumbElement, window.location.href);
        this.currentBreadcrumbs = this.addIfUniqueEntry({
            currentBreadcrumbs: this.currentBreadcrumbs,
            localStorageName: this.localStorageName,
            newBreadcrumb: this.newBreadcrumb
        });
        this.generateHTML({
            breadcrumbElement: this.breadcrumbElement,
            breadcrumbsToInsert: this.currentBreadcrumbs,
            maxVisible: this.maxVisible,
            breadcrumbsHTML: this.breadcrumbsHTML
        });
    };
    return Breadcrumbs;
}();
ready_1.default(function () {
    var breadcrumbs = document.querySelector(".js-breadcrumb");
    if (breadcrumbs !== null) {
        new Breadcrumbs({
            breadcrumbElement: breadcrumbs,
            maxVisible: 4,
            breadcrumbsHTML: "<a href='{url}'>{label}</a>"
        }); // tslint:disable-line
    }
});

},{"./components/atoms/interpolation":1,"./components/atoms/nodelist-to-array":2,"./components/atoms/ready":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9hdG9tcy9pbnRlcnBvbGF0aW9uLnRzIiwic3JjL2NvbXBvbmVudHMvYXRvbXMvbm9kZWxpc3QtdG8tYXJyYXkudHMiLCJzcmMvY29tcG9uZW50cy9hdG9tcy9yZWFkeS50cyIsInNyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLEFBSUc7Ozs7OztBQU1ILEFBS0c7Ozs7Ozs7OztBQUNILHFCQUFvQyxBQUEyQixxQkFBRSxBQUF3QztBQUV2RyxBQUFFLFFBQUMsT0FBTyxBQUFtQix3QkFBSyxBQUFTLEFBQUMsVUFBQyxBQUFDO0FBQzVDLGNBQU0sSUFBSSxBQUFLLE1BQUMsQUFBdUQsQUFBQyxBQUFDLEFBQzNFO0FBQUM7QUFFRCxBQUFFLFFBQUMsUUFBTyxBQUFtQixzRkFBSyxBQUFRLFlBQUksQUFBbUIsd0JBQUssQUFBSSxRQUFJLEFBQUssTUFBQyxBQUFPLFFBQUMsQUFBbUIsQUFBQyxBQUFDLHNCQUFDLEFBQUM7QUFDakgsY0FBTSxJQUFJLEFBQUssTUFBQyxBQUFrRixBQUFDLEFBQUMsQUFDdEc7QUFBQztBQUVELEFBQU0sK0JBQXFCLEFBQU8sUUFBQyxBQUFhLGVBQzVDLFVBQUMsQUFBQyxHQUFFLEFBQUM7QUFDSCxZQUFNLEFBQUMsSUFBRyxBQUFtQixvQkFBQyxBQUFDLEFBQUMsQUFBQztBQUNqQyxBQUFNLGVBQUMsT0FBTyxBQUFDLE1BQUssQUFBUSxXQUFHLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFDdkM7QUFBQyxBQUNKLEFBQUMsQUFDSixLQU5TLEFBQW1CO0FBTTNCOztBQWhCRCxrQkFnQkM7OztBQ2hDRCxBQVNHOzs7Ozs7Ozs7Ozs7QUFFSCxtQkFBa0MsQUFBa0I7QUFDbEQsQUFBTSxTQUFDLEFBQUUsR0FBQyxBQUFLLE1BQUMsQUFBSSxLQUFDLEFBQVEsQUFBQyxBQUFDLEFBQ2pDO0FBQUM7O0FBRkQs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UUFBQyxBQUFXLGdCQUFLLEFBQUksQUFBQztBQUN2QixZQUFJLEFBQVc7QUFDYixBQUFpQiwrQkFBRSxBQUFXO0FBQzlCLEFBQVUsd0JBQUUsQUFBQztBQUNiLEFBQWUsNkJBQUUsQUFBNkIsQUFDL0MsQUFBQyxBQUFDO0FBSmEsV0FEUSxBQUFDLENBS3JCLEFBQXNCLEFBQzVCO0FBQUMsQUFDSDtBQUFDLEFBQUMsQUFBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFRoZSBpbnRlcnBvbGF0ZSBmdW5jdGlvbiBhY2NlcHRzIGEgc3RyaW5nIGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQgd2lsbCBpbnRlcnBvbGF0ZSB0aGUgdmFsdWVzIGZvdW5kIGluIHRoZSBvYmplY3QgYXJndW1lbnQuXG4gKlxuICogVXNhZ2U6IGludGVycG9sYXRlKFwiVGhpcyBpcyBhIHswfSB3aXRoIHsxfSBpbnRlcnBvbGF0aW9uc1wiLCB7XCIwXCI6IFwic3RyaW5nXCIsIFwiMVwiOiBcIjJcIn0pO1xuICovXG5cbmludGVyZmFjZSBJbnRlcnBvbGF0aW9uVmFsdWVzIHtcbiAgW3Byb3BOYW1lOiBzdHJpbmddOiBhbnk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uU3RyaW5nOiBzdHJpbmdcbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uVmFsdWVzOiBJbnRlcnBvbGF0aW9uVmFsdWVzIGludGVyZmFjZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW50ZXJwb2xhdGUoaW50ZXJwb2xhdGlvblN0cmluZzogc3RyaW5nLCBpbnRlcnBvbGF0aW9uVmFsdWVzOiBJbnRlcnBvbGF0aW9uVmFsdWVzKTogc3RyaW5nIHtcblxuICBpZih0eXBlb2YgaW50ZXJwb2xhdGlvblN0cmluZyAhPT0gJ3N0cmluZycgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnRlcnBvbGF0aW9uU3RyaW5nIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBcInN0cmluZ1wiJyk7XG4gIH1cblxuICBpZih0eXBlb2YgaW50ZXJwb2xhdGlvblZhbHVlcyAhPT0gJ29iamVjdCcgfHwgaW50ZXJwb2xhdGlvblZhbHVlcyA9PT0gbnVsbCB8fCBBcnJheS5pc0FycmF5KGludGVycG9sYXRpb25WYWx1ZXMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnRlcnBvbGF0aW9uVmFsdWVzIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBcIm9iamVjdFwiLCBub24tbnVsbCBhbmQgbm90IGFuIEFycmF5Jyk7XG4gIH1cblxuICByZXR1cm4gaW50ZXJwb2xhdGlvblN0cmluZy5yZXBsYWNlKC97KFtee31dKil9L2csXG4gICAgICAoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCByID0gaW50ZXJwb2xhdGlvblZhbHVlc1tiXTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiByID09PSAnc3RyaW5nJyA/IHIgOiBhO1xuICAgICAgfVxuICApO1xufSIsIi8qKlxuICogVGhpcyBjb252ZXJzaW9uIGZ1bmN0aW9uIGNvbnZlcnRzIGEgTm9kZUxpc3QgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlTGlzdCkgdG8gYW4gQXJyYXlcbiAqIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheSkgdG8gYWxsb3cgYWNjZXNzIHRvIHRoZSBuYXRpdmVcbiAqIEFycmF5IG1ldGhvZHMuXG4gKlxuICogQHBhcmFtIG5vZGVsaXN0OiBBbiBIVE1MIE5vZGVMaXN0IChlZzogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnh5eicpKVxuICogQHJldHVybnMgQXJyYXk8SFRNTEVsZW1lbnQ+OiBBbiBhcnJheSBvZiB0aGUgRE9NIE5vZGVzIGZyb20gdGhlIG5vZGVsaXN0XG4gKlxuICogVXNhZ2U6IG5sVG9BcnJheShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcueHl6JykpO1xuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5sVG9BcnJheShub2RlbGlzdDogTm9kZUxpc3QpOiBBcnJheTxIVE1MRWxlbWVudD4ge1xuICByZXR1cm4gW10uc2xpY2UuY2FsbChub2RlbGlzdCk7XG59IiwiLyoqXG4gKiBUaGUgcmVhZHkgZnVuY3Rpb24gaXMgYSByZXBsaWNhIG9mICQoZG9jdW1lbnQpLnJlYWR5KCkgaW4galF1ZXJ5LlxuICpcbiAqIEBwYXJhbSBmbjogRnVuY3Rpb25cbiAqIFVzYWdlOiByZWFkeSggKCkgPT4ge30gKTsgT1IgcmVhZHkoZnVuY3Rpb25OYW1lKTtcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVhZHkoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiKSB7XG4gICAgZm4oKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7IGZuKCk7IH0pO1xuICB9XG59XG4iLCJpbXBvcnQgcmVhZHkgZnJvbSBcIi4vY29tcG9uZW50cy9hdG9tcy9yZWFkeVwiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2NvbXBvbmVudHMvYXRvbXMvaW50ZXJwb2xhdGlvblwiO1xuaW1wb3J0IG5sVG9BcnJheSBmcm9tIFwiLi9jb21wb25lbnRzL2F0b21zL25vZGVsaXN0LXRvLWFycmF5XCI7XG5cbmludGVyZmFjZSBJQnJlYWRjcnVtYiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSUFkZEVudHJ5IHtcbiAgY3VycmVudEJyZWFkY3J1bWJzOiBJQnJlYWRjcnVtYltdO1xuICBsb2NhbFN0b3JhZ2VOYW1lOiBzdHJpbmc7XG4gIG5ld0JyZWFkY3J1bWI6IElCcmVhZGNydW1iO1xufVxuXG5pbnRlcmZhY2UgSUdlbmVyYXRlSFRNTCB7XG4gIGJyZWFkY3J1bWJFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgYnJlYWRjcnVtYnNUb0luc2VydDogSUJyZWFkY3J1bWJbXTtcbiAgbWF4VmlzaWJsZTogbnVtYmVyO1xuICBicmVhZGNydW1ic0hUTUw6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElDcmVhdGVCcmVhZGNydW1iIHtcbiAgYnJlYWRjcnVtYkRldGFpbHM6IElCcmVhZGNydW1iO1xuICBicmVhZGNydW1ic0hUTUw6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElCcmVhZGNydW1iQ29uc3RydWN0b3Ige1xuICBicmVhZGNydW1iRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIG1heFZpc2libGU/OiBudW1iZXI7XG4gIGJyZWFkY3J1bWJzSFRNTD86IHN0cmluZztcbn1cblxuY2xhc3MgQnJlYWRjcnVtYnMge1xuICBwcml2YXRlIGJyZWFkY3J1bWJFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBjb29raWVOYW1lOiBzdHJpbmcgPSBcImRiY3RyYWNrZWRcIjtcbiAgcHJpdmF0ZSBsb2NhbFN0b3JhZ2VOYW1lOiBzdHJpbmcgPSBcImJyZWFkY3J1bWJzXCI7XG4gIHByaXZhdGUgbmV3QnJlYWRjcnVtYjogSUJyZWFkY3J1bWI7XG4gIHByaXZhdGUgY3VycmVudEJyZWFkY3J1bWJzOiBJQnJlYWRjcnVtYltdO1xuICBwcml2YXRlIG1heFZpc2libGU6IG51bWJlcjtcbiAgcHJpdmF0ZSBicmVhZGNydW1ic0hUTUw6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvYmo6IElCcmVhZGNydW1iQ29uc3RydWN0b3IpIHtcbiAgICB0aGlzLmJyZWFkY3J1bWJFbGVtZW50ID0gb2JqLmJyZWFkY3J1bWJFbGVtZW50O1xuICAgIHRoaXMubWF4VmlzaWJsZSA9IG9iai5tYXhWaXNpYmxlIHx8IDM7XG4gICAgdGhpcy5icmVhZGNydW1ic0hUTUwgPSBvYmouYnJlYWRjcnVtYnNIVE1MIHx8IFwiPGEgaHJlZj0ne3VybH0nIHRpdGxlPSd7bGFiZWx9Jz57bGFiZWx9PC9hPlwiO1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBjb29raWVOYW1lXG4gICAqIEBwYXJhbSBsb2NhbFN0b3JhZ2VOYW1lXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGxvb2tzIGZvciBhIGNvb2tpZSB0byBpZGVudGlmeSB3aGV0aGVyIHRoaXMgaXMgYSBuZXcgc2Vzc2lvbiBvciBub3QuXG4gICAqIEEgY29va2llIGlzIHVzZWQgYmVjYXVzZSBsb2NhbFN0b3JhZ2UgZG9lc24ndCBldmVyIGV4cGlyZSBhbmQgc2Vzc2lvblN0b3JhZ2UgZG9lc24ndCBwZXJzaXN0IGFjcm9zcyB0YWJzLlxuICAgKlxuICAgKiBUaGUgY29va2llIGhvbGRzIGEgYm9vbGVhbiB2YWx1ZSBhbmQgdGhlIGFjdHVhbCBicmVhZGNydW1iIHN0cnVjdHVyZSBpcyBoZWxkIGluIGxvY2FsU3RvcmFnZS5cbiAgICovXG4gIHByaXZhdGUgY29va2llQ2hlY2soY29va2llTmFtZSwgbG9jYWxTdG9yYWdlTmFtZSk6IHZvaWQge1xuICAgIC8vIE5vdCBhIFwiZ29vZFwiIHBhcnQgb2YgSlMgYnV0IG5lZWQgdG8gdXNlIGEgdmFyaWFibGUgaW4gYSByZWdleC5cbiAgICBjb25zdCBjb29raWVSZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cChcIig/Oig/Ol58Lio7XFxzKilcIiArIGNvb2tpZU5hbWUgKyBcIlxccypcXD1cXHMqKFteO10qKS4qJCl8Xi4qJFwiKTtcbiAgICBjb25zdCBub0Nvb2tpZUV4aXN0czogYm9vbGVhbiA9IGRvY3VtZW50LmNvb2tpZS5yZXBsYWNlKGNvb2tpZVJlZ2V4LCBcIiQxXCIpLmxlbmd0aCA9PT0gMDtcblxuICAgIGlmIChub0Nvb2tpZUV4aXN0cykge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGxvY2FsU3RvcmFnZU5hbWUsIEpTT04uc3RyaW5naWZ5KFtdKSk7XG4gICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWVOYW1lICsgXCI9dHJ1ZVwiO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gb2JqXG4gICAqIEByZXR1cm5zIHtJQnJlYWRjcnVtYltdfVxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBvbmx5IGFkZHMgYW4gaXRlbSB0byB0aGUgYnJlYWRjcnVtYnMgaW4gbG9jYWxTdG9yYWdlIGlmIHRoZSBjdXJyZW50IHVybCBpcyB1bmlxdWUgZnJvbSB0aGUgbW9zdFxuICAgKiByZWNlbnQgZW50cnkgaW4gdGhlIG9iamVjdC4gVGhpcyBwcmV2ZW50cyBleHRyYSBicmVhZGNydW1icyBmcm9tIGJlaW5nIGFkZGVkIGlmIHlvdSByZWZyZXNoIHRoZSBwYWdlLlxuICAgKi9cbiAgcHJpdmF0ZSBhZGRJZlVuaXF1ZUVudHJ5KG9iajogSUFkZEVudHJ5KTogSUJyZWFkY3J1bWJbXSB7XG4gICAgbGV0IGxhc3RCcmVhZGNydW1iID0gb2JqLmN1cnJlbnRCcmVhZGNydW1icy5zbGljZSgtMSkucG9wKCk7XG5cbiAgICBpZiAobGFzdEJyZWFkY3J1bWIgJiYgb2JqLm5ld0JyZWFkY3J1bWIudXJsID09PSBsYXN0QnJlYWRjcnVtYi51cmwpIHtcbiAgICAgIHJldHVybiBvYmouY3VycmVudEJyZWFkY3J1bWJzO1xuICAgIH1cblxuICAgIG9iai5jdXJyZW50QnJlYWRjcnVtYnMucHVzaChvYmoubmV3QnJlYWRjcnVtYik7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKG9iai5sb2NhbFN0b3JhZ2VOYW1lLCBKU09OLnN0cmluZ2lmeShvYmouY3VycmVudEJyZWFkY3J1bWJzKSk7XG5cbiAgICByZXR1cm4gb2JqLmN1cnJlbnRCcmVhZGNydW1icztcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTmV3QnJlYWRjcnVtYihicmVhZGNydW1iRWxlbWVudDogSFRNTEVsZW1lbnQsIHVybDogc3RyaW5nKTogSUJyZWFkY3J1bWIge1xuICAgIGxldCBsYWJlbCA9IGJyZWFkY3J1bWJFbGVtZW50LmRhdGFzZXRbXCJicmVhZGNydW1iTGFiZWxcIl0gfHwgXCJOL0FcIjsgLy8gdHNsaW50OmRpc2FibGUtbGluZVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsLFxuICAgICAgdXJsLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUJyZWFkY3J1bWJIVE1MKG9iajogSUNyZWF0ZUJyZWFkY3J1bWIpIHtcbiAgICBsZXQgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICB0ZW1wLmlubmVySFRNTCA9IGludGVycG9sYXRlKFxuICAgICAgICBvYmouYnJlYWRjcnVtYnNIVE1MLFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6IG9iai5icmVhZGNydW1iRGV0YWlscy5sYWJlbCxcbiAgICAgICAgICB1cmw6IG9iai5icmVhZGNydW1iRGV0YWlscy51cmxcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gdGVtcC5jaGlsZE5vZGVzO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBub2RlTGlzdFxuICAgKiBAcGFyYW0gZnJhZ1xuICAgKiBAcmV0dXJucyB7RG9jdW1lbnRGcmFnbWVudH1cbiAgICpcbiAgICogQ3JlYXRlcyBhbiBhcnJheSBmcm9tIGEgTm9kZUxpc3Qgc28gd2UgaGF2ZSBuYXRpdmUgYWNjZXNzIHRvIC5mb3JFYWNoKCkgYW5kIHRoZW4gYXBwZW5kcyBlYWNoIE5vZGUgdG8gdGhlIGZyYWdtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBhZGRObFRvRnJhZyhub2RlTGlzdDogTm9kZUxpc3QsIGZyYWc6IERvY3VtZW50RnJhZ21lbnQpOiBEb2N1bWVudEZyYWdtZW50IHtcbiAgICBsZXQgbm9kZUFycmF5ID0gbmxUb0FycmF5KG5vZGVMaXN0KTtcblxuICAgIG5vZGVBcnJheS5mb3JFYWNoKChjdXJyZW50SXRlbSkgPT4ge1xuICAgICAgZnJhZy5hcHBlbmRDaGlsZChjdXJyZW50SXRlbSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZnJhZztcbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVIVE1MKG9iajogSUdlbmVyYXRlSFRNTCkge1xuXG4gICAgbGV0IGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgbGV0IHRydW5jYXRlZEJyZWFkY3J1bWJzID0gb2JqLmJyZWFkY3J1bWJzVG9JbnNlcnQuc2xpY2Uob2JqLm1heFZpc2libGUgKiAtMSk7XG5cbiAgICB0cnVuY2F0ZWRCcmVhZGNydW1icy5mb3JFYWNoKChjdXJyZW50SXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGxldCBicmVhZGNydW1iSFRNTDogTm9kZUxpc3QgPSB0aGlzLmNyZWF0ZUJyZWFkY3J1bWJIVE1MKHtcbiAgICAgICAgYnJlYWRjcnVtYkRldGFpbHM6IGN1cnJlbnRJdGVtLFxuICAgICAgICBicmVhZGNydW1ic0hUTUw6IG9iai5icmVhZGNydW1ic0hUTUwsXG4gICAgICB9KTtcblxuICAgICAgZnJhZyA9IHRoaXMuYWRkTmxUb0ZyYWcoYnJlYWRjcnVtYkhUTUwsIGZyYWcpO1xuICAgIH0pO1xuXG4gICAgb2JqLmJyZWFkY3J1bWJFbGVtZW50LmFwcGVuZENoaWxkKGZyYWcpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0KCkge1xuICAgIGlmICghdGhpcy5icmVhZGNydW1iRWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY29va2llQ2hlY2sodGhpcy5jb29raWVOYW1lLCB0aGlzLmxvY2FsU3RvcmFnZU5hbWUpO1xuICAgIHRoaXMuY3VycmVudEJyZWFkY3J1bWJzID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5sb2NhbFN0b3JhZ2VOYW1lKSk7XG4gICAgdGhpcy5uZXdCcmVhZGNydW1iID0gdGhpcy5jcmVhdGVOZXdCcmVhZGNydW1iKHRoaXMuYnJlYWRjcnVtYkVsZW1lbnQsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICB0aGlzLmN1cnJlbnRCcmVhZGNydW1icyA9IHRoaXMuYWRkSWZVbmlxdWVFbnRyeSh7XG4gICAgICBjdXJyZW50QnJlYWRjcnVtYnM6IHRoaXMuY3VycmVudEJyZWFkY3J1bWJzLFxuICAgICAgbG9jYWxTdG9yYWdlTmFtZTogdGhpcy5sb2NhbFN0b3JhZ2VOYW1lLFxuICAgICAgbmV3QnJlYWRjcnVtYjogdGhpcy5uZXdCcmVhZGNydW1iLFxuICAgIH0pO1xuICAgIHRoaXMuZ2VuZXJhdGVIVE1MKHtcbiAgICAgIGJyZWFkY3J1bWJFbGVtZW50OiB0aGlzLmJyZWFkY3J1bWJFbGVtZW50LFxuICAgICAgYnJlYWRjcnVtYnNUb0luc2VydDogdGhpcy5jdXJyZW50QnJlYWRjcnVtYnMsXG4gICAgICBtYXhWaXNpYmxlOiB0aGlzLm1heFZpc2libGUsXG4gICAgICBicmVhZGNydW1ic0hUTUw6IHRoaXMuYnJlYWRjcnVtYnNIVE1MLFxuICAgIH0pO1xuICB9XG59XG5cbnJlYWR5KCgpID0+IHtcbiAgbGV0IGJyZWFkY3J1bWJzID0gPEhUTUxFbGVtZW50PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLWJyZWFkY3J1bWJcIik7XG5cbiAgaWYgKGJyZWFkY3J1bWJzICE9PSBudWxsKSB7XG4gICAgbmV3IEJyZWFkY3J1bWJzKHtcbiAgICAgIGJyZWFkY3J1bWJFbGVtZW50OiBicmVhZGNydW1icyxcbiAgICAgIG1heFZpc2libGU6IDQsXG4gICAgICBicmVhZGNydW1ic0hUTUw6IFwiPGEgaHJlZj0ne3VybH0nPntsYWJlbH08L2E+XCJcbiAgICB9KTsgLy8gdHNsaW50OmRpc2FibGUtbGluZVxuICB9XG59KTtcbiJdfQ==
