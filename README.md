# Dynamic Breadcrumbs

## Intent
When it comes to navigation and user intent, letting the user know where they *have been* is almost as important as letting them know where they can go next.

We usually can't guarantee the users path through a site so while sending breadcrumb data from the server is possible, it's easier to handle on the client side.

## How it Works
This plugin is a small, dependency free plugin for generating breadcrumbs based on your users path through your site. It uses [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to store the interaction data (a page label and url) and a cookie to refresh LocalStorage. 

When a user visits your site the plugin looks for a cookie. If it does not find a cookie it removes any existing LocalStorage breadcrumb data because this can be considered a new session. It then starts the local store and sets a cookie. After that it checks to ensure that the most recent item in LocalStorage does not match the current URL - if it did we can assume this is a refresh and should not duplicate the entry.

## Usage
Instantiate the plugin by selecting your breadcrumb element Node and using the `new` keyword.
```
var breadcrumbs = document.querySelector(".js-breadcrumb");

if(breadcrumbs !== null) {
  new Breadcrumbs({
    breadcrumbElement: breadcrumbs,
    breadcrumbsHTML: "<a href='{url}'>{label}</a>",
    maxVisible: 4,
  })
}
```
There are three options available, `breadcrumbElement`, `breadcrumbsHTML`, and `maxVisible`.

Required: `breadcrumbElement: HTMLElement` - This is where the breadcrumbs will be generated and inserted in the page. This element should contain a `data-breadcrumb-label` attribute such as `data-breadcrumb-label="Contact Us"`. The data attribute is used when adding a page to LocalStorage. If no attribute exists, 'N/A' will be used in it's place.

Optional: `breadcrumbsHTML: string` - This is an optional string with two possible interpolation values, `{url}` and `{label}`. This allows you to wrap or add additional HTML to the generated list as this plugin comes with no styling. 

Optional: `maxVisible: number` - This is an optional number limiting the amount of breadcrumbs shown at any given times. The default is `3`.
