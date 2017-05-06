(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * The interpolate function accepts a string as the first argument and will
 * interpolate the values found in the object argument.
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
    if (typeof interpolationString !== "string") {
        throw new Error("interpolationString argument must be of type 'string'");
    }
    if ((typeof interpolationValues === "undefined" ? "undefined" : _typeof(interpolationValues)) !== "object" || interpolationValues === null || Array.isArray(interpolationValues)) {
        throw new Error("interpolationValues argument must be of type 'object', non-null and not an Array");
    }
    return interpolationString.replace(/{([^{}]*)}/g, function (a, b) {
        var r = interpolationValues[b];
        return typeof r === "string" ? r : a;
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = interpolate;

},{}],2:[function(require,module,exports){
/**
 * This conversion function converts a NodeList (https://developer.mozilla.org/en-US/docs/Web/API/NodeList) to an Array
 * (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
 * to allow access to the native Array methods.
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
            breadcrumbsHTML: this.breadcrumbsHTML,
            breadcrumbsToInsert: this.currentBreadcrumbs,
            maxVisible: this.maxVisible
        });
    };
    return Breadcrumbs;
}();
window['Breadcrumbs'] = Breadcrumbs;

},{"./components/atoms/interpolation":1,"./components/atoms/nodelist-to-array":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy9hdG9tcy9pbnRlcnBvbGF0aW9uLnRzIiwic3JjL2NvbXBvbmVudHMvYXRvbXMvbm9kZWxpc3QtdG8tYXJyYXkudHMiLCJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxBQUtHOzs7Ozs7O0FBTUgsQUFLRzs7Ozs7Ozs7O0FBQ0gscUJBQW9DLEFBQTJCLHFCQUFFLEFBQXdDO0FBRXZHLEFBQUUsQUFBQyxRQUFDLE9BQU8sQUFBbUIsd0JBQUssQUFBUyxBQUFDLFVBQUMsQUFBQztBQUM3QyxjQUFNLElBQUksQUFBSyxNQUFDLEFBQXVELEFBQUMsQUFBQyxBQUMzRTtBQUFDO0FBRUQsQUFBRSxBQUFDLFFBQUMsUUFBTyxBQUFtQixzRkFBSyxBQUFRLFlBQUksQUFBbUIsd0JBQUssQUFBSSxRQUFJLEFBQUssTUFBQyxBQUFPLFFBQUMsQUFBbUIsQUFBQyxBQUFDLHNCQUFDLEFBQUM7QUFDbEgsY0FBTSxJQUFJLEFBQUssTUFBQyxBQUFrRixBQUFDLEFBQUMsQUFDdEc7QUFBQztBQUVELEFBQU0sK0JBQXFCLEFBQU8sUUFBQyxBQUFhLGVBQzVDLFVBQUMsQUFBQyxHQUFFLEFBQUM7QUFDSCxZQUFNLEFBQUMsSUFBRyxBQUFtQixvQkFBQyxBQUFDLEFBQUMsQUFBQztBQUNqQyxBQUFNLGVBQUMsT0FBTyxBQUFDLE1BQUssQUFBUSxXQUFHLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFDdkM7QUFBQyxBQUNKLEFBQUMsQUFDSixLQU5TLEFBQW1CO0FBTTNCOztBQWhCRCxrQkFnQkM7OztBQ2pDRCxBQVNHOzs7Ozs7Ozs7Ozs7QUFFSCxtQkFBa0MsQUFBa0I7QUFDbEQsQUFBTSxTQUFDLEFBQUUsR0FBQyxBQUFLLE1BQUMsQUFBSSxLQUFDLEFBQVEsQUFBQyxBQUFDLEFBQ2pDO0FBQUM7O0FBRkQsa0JBRUM7Ozs7O0FDYkQsOEJBQTJE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QyxBQUFJLEtBQUMsQUFBZ0IsQUFBQyxBQUFDLEFBQUM7QUFDekYsQUFBSSxhQUFDLEFBQWEsZ0JBQUcsQUFBSSxLQUFDLEFBQW1CLG9CQUFDLEFBQUksS0FBQyxBQUFpQixtQkFBRSxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQUksQUFBQyxBQUFDO0FBQzVGLEFBQUksYUFBQyxBQUFrQiwwQkFBUSxBQUFnQjtBQUM3QyxBQUFrQixnQ0FBRSxBQUFJLEtBQUMsQUFBa0I7QUFDM0MsQUFBZ0IsOEJBQUUsQUFBSSxLQUFDLEFBQWdCO0FBQ3ZDLEFBQWEsMkJBQUUsQUFBSSxLQUFDLEFBQWEsQUFDbEMsQUFBQyxBQUFDO0FBSjZDLFNBQXRCLEFBQUk7QUFLOUIsQUFBSSxhQUFDLEFBQVk7QUFDZixBQUFpQiwrQkFBRSxBQUFJLEtBQUMsQUFBaUI7QUFDekMsQUFBZSw2QkFBRSxBQUFJLEtBQUMsQUFBZTtBQUNyQyxBQUFtQixpQ0FBRSxBQUFJLEtBQUMsQUFBa0I7QUFDNUMsQUFBVSx3QkFBRSxBQUFJLEtBQUMsQUFBVSxBQUM1QixBQUFDLEFBQUMsQUFDTDtBQU5vQjtBQU1uQjtBQUNILFdBQUEsQUFBQztBQXhJRCxBQXdJQztBQUVELEFBQU0sT0FBQyxBQUFhLEFBQUMsaUJBQUcsQUFBVyxBQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogVGhlIGludGVycG9sYXRlIGZ1bmN0aW9uIGFjY2VwdHMgYSBzdHJpbmcgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGFuZCB3aWxsXG4gKiBpbnRlcnBvbGF0ZSB0aGUgdmFsdWVzIGZvdW5kIGluIHRoZSBvYmplY3QgYXJndW1lbnQuXG4gKlxuICogVXNhZ2U6IGludGVycG9sYXRlKFwiVGhpcyBpcyBhIHswfSB3aXRoIHsxfSBpbnRlcnBvbGF0aW9uc1wiLCB7XCIwXCI6IFwic3RyaW5nXCIsIFwiMVwiOiBcIjJcIn0pO1xuICovXG5cbmludGVyZmFjZSBJbnRlcnBvbGF0aW9uVmFsdWVzIHtcbiAgW3Byb3BOYW1lOiBzdHJpbmddOiBhbnk7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uU3RyaW5nOiBzdHJpbmdcbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uVmFsdWVzOiBJbnRlcnBvbGF0aW9uVmFsdWVzIGludGVyZmFjZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW50ZXJwb2xhdGUoaW50ZXJwb2xhdGlvblN0cmluZzogc3RyaW5nLCBpbnRlcnBvbGF0aW9uVmFsdWVzOiBJbnRlcnBvbGF0aW9uVmFsdWVzKTogc3RyaW5nIHtcblxuICBpZiAodHlwZW9mIGludGVycG9sYXRpb25TdHJpbmcgIT09IFwic3RyaW5nXCIgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiaW50ZXJwb2xhdGlvblN0cmluZyBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgJ3N0cmluZydcIik7XG4gIH1cblxuICBpZiAodHlwZW9mIGludGVycG9sYXRpb25WYWx1ZXMgIT09IFwib2JqZWN0XCIgfHwgaW50ZXJwb2xhdGlvblZhbHVlcyA9PT0gbnVsbCB8fCBBcnJheS5pc0FycmF5KGludGVycG9sYXRpb25WYWx1ZXMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiaW50ZXJwb2xhdGlvblZhbHVlcyBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgJ29iamVjdCcsIG5vbi1udWxsIGFuZCBub3QgYW4gQXJyYXlcIik7XG4gIH1cblxuICByZXR1cm4gaW50ZXJwb2xhdGlvblN0cmluZy5yZXBsYWNlKC97KFtee31dKil9L2csXG4gICAgICAoYSwgYikgPT4ge1xuICAgICAgICBjb25zdCByID0gaW50ZXJwb2xhdGlvblZhbHVlc1tiXTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiByID09PSBcInN0cmluZ1wiID8gciA6IGE7XG4gICAgICB9LFxuICApO1xufVxuIiwiLyoqXG4gKiBUaGlzIGNvbnZlcnNpb24gZnVuY3Rpb24gY29udmVydHMgYSBOb2RlTGlzdCAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGVMaXN0KSB0byBhbiBBcnJheVxuICogKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5KVxuICogdG8gYWxsb3cgYWNjZXNzIHRvIHRoZSBuYXRpdmUgQXJyYXkgbWV0aG9kcy5cbiAqXG4gKiBAcGFyYW0gbm9kZWxpc3Q6IEFuIEhUTUwgTm9kZUxpc3QgKGVnOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcueHl6JykpXG4gKiBAcmV0dXJucyBBcnJheTxIVE1MRWxlbWVudD46IEFuIGFycmF5IG9mIHRoZSBET00gTm9kZXMgZnJvbSB0aGUgbm9kZWxpc3RcbiAqXG4gKiBVc2FnZTogbmxUb0FycmF5KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy54eXonKSk7XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbmxUb0FycmF5KG5vZGVsaXN0OiBOb2RlTGlzdCk6IEhUTUxFbGVtZW50W10ge1xuICByZXR1cm4gW10uc2xpY2UuY2FsbChub2RlbGlzdCk7XG59XG4iLCJpbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vY29tcG9uZW50cy9hdG9tcy9pbnRlcnBvbGF0aW9uXCI7XG5pbXBvcnQgbmxUb0FycmF5IGZyb20gXCIuL2NvbXBvbmVudHMvYXRvbXMvbm9kZWxpc3QtdG8tYXJyYXlcIjtcblxuaW50ZXJmYWNlIElCcmVhZGNydW1iIHtcbiAgbGFiZWw6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJQWRkRW50cnkge1xuICBjdXJyZW50QnJlYWRjcnVtYnM6IElCcmVhZGNydW1iW107XG4gIGxvY2FsU3RvcmFnZU5hbWU6IHN0cmluZztcbiAgbmV3QnJlYWRjcnVtYjogSUJyZWFkY3J1bWI7XG59XG5cbmludGVyZmFjZSBJR2VuZXJhdGVIVE1MIHtcbiAgYnJlYWRjcnVtYkVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBicmVhZGNydW1ic1RvSW5zZXJ0OiBJQnJlYWRjcnVtYltdO1xuICBtYXhWaXNpYmxlOiBudW1iZXI7XG4gIGJyZWFkY3J1bWJzSFRNTDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSUNyZWF0ZUJyZWFkY3J1bWIge1xuICBicmVhZGNydW1iRGV0YWlsczogSUJyZWFkY3J1bWI7XG4gIGJyZWFkY3J1bWJzSFRNTDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSUJyZWFkY3J1bWJDb25zdHJ1Y3RvciB7XG4gIGJyZWFkY3J1bWJFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgbWF4VmlzaWJsZT86IG51bWJlcjtcbiAgYnJlYWRjcnVtYnNIVE1MPzogc3RyaW5nO1xufVxuXG5jbGFzcyBCcmVhZGNydW1icyB7XG4gIHByaXZhdGUgYnJlYWRjcnVtYkVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIGNvb2tpZU5hbWU6IHN0cmluZyA9IFwiZGJjdHJhY2tlZFwiO1xuICBwcml2YXRlIGxvY2FsU3RvcmFnZU5hbWU6IHN0cmluZyA9IFwiYnJlYWRjcnVtYnNcIjtcbiAgcHJpdmF0ZSBuZXdCcmVhZGNydW1iOiBJQnJlYWRjcnVtYjtcbiAgcHJpdmF0ZSBjdXJyZW50QnJlYWRjcnVtYnM6IElCcmVhZGNydW1iW107XG4gIHByaXZhdGUgbWF4VmlzaWJsZTogbnVtYmVyO1xuICBwcml2YXRlIGJyZWFkY3J1bWJzSFRNTDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9iajogSUJyZWFkY3J1bWJDb25zdHJ1Y3Rvcikge1xuICAgIHRoaXMuYnJlYWRjcnVtYkVsZW1lbnQgPSBvYmouYnJlYWRjcnVtYkVsZW1lbnQ7XG4gICAgdGhpcy5tYXhWaXNpYmxlID0gb2JqLm1heFZpc2libGUgfHwgMztcbiAgICB0aGlzLmJyZWFkY3J1bWJzSFRNTCA9IG9iai5icmVhZGNydW1ic0hUTUwgfHwgXCI8YSBocmVmPSd7dXJsfScgdGl0bGU9J3tsYWJlbH0nPntsYWJlbH08L2E+XCI7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIGNvb2tpZU5hbWVcbiAgICogQHBhcmFtIGxvY2FsU3RvcmFnZU5hbWVcbiAgICpcbiAgICogVGhpcyBtZXRob2QgbG9va3MgZm9yIGEgY29va2llIHRvIGlkZW50aWZ5IHdoZXRoZXIgdGhpcyBpcyBhIG5ldyBzZXNzaW9uIG9yIG5vdC5cbiAgICogQSBjb29raWUgaXMgdXNlZCBiZWNhdXNlIGxvY2FsU3RvcmFnZSBkb2Vzbid0IGV2ZXIgZXhwaXJlIGFuZCBzZXNzaW9uU3RvcmFnZSBkb2Vzbid0IHBlcnNpc3QgYWNyb3NzIHRhYnMuXG4gICAqXG4gICAqIFRoZSBjb29raWUgaG9sZHMgYSBib29sZWFuIHZhbHVlIGFuZCB0aGUgYWN0dWFsIGJyZWFkY3J1bWIgc3RydWN0dXJlIGlzIGhlbGQgaW4gbG9jYWxTdG9yYWdlLlxuICAgKi9cbiAgcHJpdmF0ZSBjb29raWVDaGVjayhjb29raWVOYW1lLCBsb2NhbFN0b3JhZ2VOYW1lKTogdm9pZCB7XG4gICAgLy8gTm90IGEgXCJnb29kXCIgcGFydCBvZiBKUyBidXQgbmVlZCB0byB1c2UgYSB2YXJpYWJsZSBpbiBhIHJlZ2V4LlxuICAgIGNvbnN0IGNvb2tpZVJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKFwiKD86KD86XnwuKjtcXHMqKVwiICsgY29va2llTmFtZSArIFwiXFxzKlxcPVxccyooW147XSopLiokKXxeLiokXCIpO1xuICAgIGNvbnN0IG5vQ29va2llRXhpc3RzOiBib29sZWFuID0gZG9jdW1lbnQuY29va2llLnJlcGxhY2UoY29va2llUmVnZXgsIFwiJDFcIikubGVuZ3RoID09PSAwO1xuXG4gICAgaWYgKG5vQ29va2llRXhpc3RzKSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0obG9jYWxTdG9yYWdlTmFtZSwgSlNPTi5zdHJpbmdpZnkoW10pKTtcbiAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZU5hbWUgKyBcIj10cnVlXCI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBvYmpcbiAgICogQHJldHVybnMge0lCcmVhZGNydW1iW119XG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIG9ubHkgYWRkcyBhbiBpdGVtIHRvIHRoZSBicmVhZGNydW1icyBpbiBsb2NhbFN0b3JhZ2UgaWYgdGhlIGN1cnJlbnQgdXJsIGlzIHVuaXF1ZSBmcm9tIHRoZSBtb3N0XG4gICAqIHJlY2VudCBlbnRyeSBpbiB0aGUgb2JqZWN0LiBUaGlzIHByZXZlbnRzIGV4dHJhIGJyZWFkY3J1bWJzIGZyb20gYmVpbmcgYWRkZWQgaWYgeW91IHJlZnJlc2ggdGhlIHBhZ2UuXG4gICAqL1xuICBwcml2YXRlIGFkZElmVW5pcXVlRW50cnkob2JqOiBJQWRkRW50cnkpOiBJQnJlYWRjcnVtYltdIHtcbiAgICBsZXQgbGFzdEJyZWFkY3J1bWIgPSBvYmouY3VycmVudEJyZWFkY3J1bWJzLnNsaWNlKC0xKS5wb3AoKTtcblxuICAgIGlmIChsYXN0QnJlYWRjcnVtYiAmJiBvYmoubmV3QnJlYWRjcnVtYi51cmwgPT09IGxhc3RCcmVhZGNydW1iLnVybCkge1xuICAgICAgcmV0dXJuIG9iai5jdXJyZW50QnJlYWRjcnVtYnM7XG4gICAgfVxuXG4gICAgb2JqLmN1cnJlbnRCcmVhZGNydW1icy5wdXNoKG9iai5uZXdCcmVhZGNydW1iKTtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0ob2JqLmxvY2FsU3RvcmFnZU5hbWUsIEpTT04uc3RyaW5naWZ5KG9iai5jdXJyZW50QnJlYWRjcnVtYnMpKTtcblxuICAgIHJldHVybiBvYmouY3VycmVudEJyZWFkY3J1bWJzO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVOZXdCcmVhZGNydW1iKGJyZWFkY3J1bWJFbGVtZW50OiBIVE1MRWxlbWVudCwgdXJsOiBzdHJpbmcpOiBJQnJlYWRjcnVtYiB7XG4gICAgbGV0IGxhYmVsID0gYnJlYWRjcnVtYkVsZW1lbnQuZGF0YXNldFtcImJyZWFkY3J1bWJMYWJlbFwiXSB8fCBcIk4vQVwiOyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lXG5cbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWwsXG4gICAgICB1cmwsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQnJlYWRjcnVtYkhUTUwob2JqOiBJQ3JlYXRlQnJlYWRjcnVtYikge1xuICAgIGxldCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgIHRlbXAuaW5uZXJIVE1MID0gaW50ZXJwb2xhdGUoXG4gICAgICAgIG9iai5icmVhZGNydW1ic0hUTUwsXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogb2JqLmJyZWFkY3J1bWJEZXRhaWxzLmxhYmVsLFxuICAgICAgICAgIHVybDogb2JqLmJyZWFkY3J1bWJEZXRhaWxzLnVybCxcbiAgICAgICAgfSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHRlbXAuY2hpbGROb2RlcztcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gbm9kZUxpc3RcbiAgICogQHBhcmFtIGZyYWdcbiAgICogQHJldHVybnMge0RvY3VtZW50RnJhZ21lbnR9XG4gICAqXG4gICAqIENyZWF0ZXMgYW4gYXJyYXkgZnJvbSBhIE5vZGVMaXN0IHNvIHdlIGhhdmUgbmF0aXZlIGFjY2VzcyB0byAuZm9yRWFjaCgpIGFuZCB0aGVuIGFwcGVuZHMgZWFjaCBOb2RlIHRvIHRoZSBmcmFnbWVudC5cbiAgICovXG4gIHByaXZhdGUgYWRkTmxUb0ZyYWcobm9kZUxpc3Q6IE5vZGVMaXN0LCBmcmFnOiBEb2N1bWVudEZyYWdtZW50KTogRG9jdW1lbnRGcmFnbWVudCB7XG4gICAgbGV0IG5vZGVBcnJheSA9IG5sVG9BcnJheShub2RlTGlzdCk7XG5cbiAgICBub2RlQXJyYXkuZm9yRWFjaCgoY3VycmVudEl0ZW0pID0+IHtcbiAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoY3VycmVudEl0ZW0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZyYWc7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlSFRNTChvYmo6IElHZW5lcmF0ZUhUTUwpIHtcblxuICAgIGxldCBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgIGxldCB0cnVuY2F0ZWRCcmVhZGNydW1icyA9IG9iai5icmVhZGNydW1ic1RvSW5zZXJ0LnNsaWNlKG9iai5tYXhWaXNpYmxlICogLTEpO1xuXG4gICAgdHJ1bmNhdGVkQnJlYWRjcnVtYnMuZm9yRWFjaCgoY3VycmVudEl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBsZXQgYnJlYWRjcnVtYkhUTUw6IE5vZGVMaXN0ID0gdGhpcy5jcmVhdGVCcmVhZGNydW1iSFRNTCh7XG4gICAgICAgIGJyZWFkY3J1bWJEZXRhaWxzOiBjdXJyZW50SXRlbSxcbiAgICAgICAgYnJlYWRjcnVtYnNIVE1MOiBvYmouYnJlYWRjcnVtYnNIVE1MLFxuICAgICAgfSk7XG5cbiAgICAgIGZyYWcgPSB0aGlzLmFkZE5sVG9GcmFnKGJyZWFkY3J1bWJIVE1MLCBmcmFnKTtcbiAgICB9KTtcblxuICAgIG9iai5icmVhZGNydW1iRWxlbWVudC5hcHBlbmRDaGlsZChmcmFnKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdCgpIHtcbiAgICBpZiAoIXRoaXMuYnJlYWRjcnVtYkVsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNvb2tpZUNoZWNrKHRoaXMuY29va2llTmFtZSwgdGhpcy5sb2NhbFN0b3JhZ2VOYW1lKTtcbiAgICB0aGlzLmN1cnJlbnRCcmVhZGNydW1icyA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMubG9jYWxTdG9yYWdlTmFtZSkpO1xuICAgIHRoaXMubmV3QnJlYWRjcnVtYiA9IHRoaXMuY3JlYXRlTmV3QnJlYWRjcnVtYih0aGlzLmJyZWFkY3J1bWJFbGVtZW50LCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgdGhpcy5jdXJyZW50QnJlYWRjcnVtYnMgPSB0aGlzLmFkZElmVW5pcXVlRW50cnkoe1xuICAgICAgY3VycmVudEJyZWFkY3J1bWJzOiB0aGlzLmN1cnJlbnRCcmVhZGNydW1icyxcbiAgICAgIGxvY2FsU3RvcmFnZU5hbWU6IHRoaXMubG9jYWxTdG9yYWdlTmFtZSxcbiAgICAgIG5ld0JyZWFkY3J1bWI6IHRoaXMubmV3QnJlYWRjcnVtYixcbiAgICB9KTtcbiAgICB0aGlzLmdlbmVyYXRlSFRNTCh7XG4gICAgICBicmVhZGNydW1iRWxlbWVudDogdGhpcy5icmVhZGNydW1iRWxlbWVudCxcbiAgICAgIGJyZWFkY3J1bWJzSFRNTDogdGhpcy5icmVhZGNydW1ic0hUTUwsXG4gICAgICBicmVhZGNydW1ic1RvSW5zZXJ0OiB0aGlzLmN1cnJlbnRCcmVhZGNydW1icyxcbiAgICAgIG1heFZpc2libGU6IHRoaXMubWF4VmlzaWJsZSxcbiAgICB9KTtcbiAgfVxufVxuXG53aW5kb3dbJ0JyZWFkY3J1bWJzJ10gPSBCcmVhZGNydW1icztcbiJdfQ==
