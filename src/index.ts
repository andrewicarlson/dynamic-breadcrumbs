import ready from "./components/atoms/ready";
import interpolate from "./components/atoms/interpolation";
import nlToArray from "./components/atoms/nodelist-to-array";

interface IBreadcrumb {
  label: string;
  url: string;
}

interface IAddEntry {
  currentBreadcrumbs: IBreadcrumb[];
  localStorageName: string;
  newBreadcrumb: IBreadcrumb;
}

interface IGenerateHTML {
  breadcrumbElement: HTMLElement;
  breadcrumbsToInsert: IBreadcrumb[];
  maxVisible: number;
  breadcrumbsHTML: string;
}

interface ICreateBreadcrumb {
  breadcrumbDetails: IBreadcrumb;
  breadcrumbsHTML: string;
}

interface IBreadcrumbConstructor {
  breadcrumbElement: HTMLElement;
  maxVisible?: number;
  breadcrumbsHTML?: string;
}

class Breadcrumbs {
  private breadcrumbElement: HTMLElement;
  private cookieName: string = "dbctracked";
  private localStorageName: string = "breadcrumbs";
  private newBreadcrumb: IBreadcrumb;
  private currentBreadcrumbs: IBreadcrumb[];
  private maxVisible: number;
  private breadcrumbsHTML: string;

  constructor(obj: IBreadcrumbConstructor) {
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
  private cookieCheck(cookieName, localStorageName): void {
    // Not a "good" part of JS but need to use a variable in a regex.
    const cookieRegex: RegExp = new RegExp("(?:(?:^|.*;\s*)" + cookieName + "\s*\=\s*([^;]*).*$)|^.*$");
    const noCookieExists: boolean = document.cookie.replace(cookieRegex, "$1").length === 0;

    if (noCookieExists) {
      window.localStorage.setItem(localStorageName, JSON.stringify([]));
      document.cookie = cookieName + "=true";
    }
  }

  /**
   *
   * @param obj
   * @returns {IBreadcrumb[]}
   *
   * This method only adds an item to the breadcrumbs in localStorage if the current url is unique from the most
   * recent entry in the object. This prevents extra breadcrumbs from being added if you refresh the page.
   */
  private addIfUniqueEntry(obj: IAddEntry): IBreadcrumb[] {
    let lastBreadcrumb = obj.currentBreadcrumbs.slice(-1).pop();

    if (lastBreadcrumb && obj.newBreadcrumb.url === lastBreadcrumb.url) {
      return obj.currentBreadcrumbs;
    }

    obj.currentBreadcrumbs.push(obj.newBreadcrumb);
    window.localStorage.setItem(obj.localStorageName, JSON.stringify(obj.currentBreadcrumbs));

    return obj.currentBreadcrumbs;
  }

  private createNewBreadcrumb(breadcrumbElement: HTMLElement, url: string): IBreadcrumb {
    let label = breadcrumbElement.dataset["breadcrumbLabel"] || "N/A"; // tslint:disable-line

    return {
      label,
      url,
    };
  }

  private createBreadcrumbHTML(obj: ICreateBreadcrumb) {
    let temp = document.createElement("div");

    temp.innerHTML = interpolate(
        obj.breadcrumbsHTML,
        {
          label: obj.breadcrumbDetails.label,
          url: obj.breadcrumbDetails.url
        }
    );

    return temp.childNodes;
  }

  /**
   *
   * @param nodeList
   * @param frag
   * @returns {DocumentFragment}
   *
   * Creates an array from a NodeList so we have native access to .forEach() and then appends each Node to the fragment.
   */
  private addNlToFrag(nodeList: NodeList, frag: DocumentFragment): DocumentFragment {
    let nodeArray = nlToArray(nodeList);

    nodeArray.forEach((currentItem) => {
      frag.appendChild(currentItem);
    });

    return frag;
  }

  private generateHTML(obj: IGenerateHTML) {

    let frag = document.createDocumentFragment();
    let truncatedBreadcrumbs = obj.breadcrumbsToInsert.slice(obj.maxVisible * -1);

    truncatedBreadcrumbs.forEach((currentItem, index) => {
      let breadcrumbHTML: NodeList = this.createBreadcrumbHTML({
        breadcrumbDetails: currentItem,
        breadcrumbsHTML: obj.breadcrumbsHTML,
      });

      frag = this.addNlToFrag(breadcrumbHTML, frag);
    });

    obj.breadcrumbElement.appendChild(frag);
  }

  private init() {
    if (!this.breadcrumbElement) {
      return;
    }

    this.cookieCheck(this.cookieName, this.localStorageName);
    this.currentBreadcrumbs = JSON.parse(window.localStorage.getItem(this.localStorageName));
    this.newBreadcrumb = this.createNewBreadcrumb(this.breadcrumbElement, window.location.href);
    this.currentBreadcrumbs = this.addIfUniqueEntry({
      currentBreadcrumbs: this.currentBreadcrumbs,
      localStorageName: this.localStorageName,
      newBreadcrumb: this.newBreadcrumb,
    });
    this.generateHTML({
      breadcrumbElement: this.breadcrumbElement,
      breadcrumbsToInsert: this.currentBreadcrumbs,
      maxVisible: this.maxVisible,
      breadcrumbsHTML: this.breadcrumbsHTML,
    });
  }
}

ready(() => {
  let breadcrumbs = <HTMLElement> document.querySelector(".js-breadcrumb");

  if (breadcrumbs !== null) {
    new Breadcrumbs({
      breadcrumbElement: breadcrumbs,
      maxVisible: 4,
      breadcrumbsHTML: "<a href='{url}'>{label}</a>"
    }); // tslint:disable-line
  }
});
