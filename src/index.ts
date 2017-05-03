import ready from "./components/atoms/ready";

interface IBreadcrumb {
  label: string;
  url: string;
}

interface IAddEntry {
  currentBreadcrumbs: IBreadcrumb[];
  newBreadcrumb: IBreadcrumb;
  localStorageName: string;
}

class Breadcrumbs {
  private breadcrumbElement: HTMLElement;
  private cookieName: string = "dbctracked";
  private localStorageName: string = "breadcrumbs";
  private newBreadcrumb: IBreadcrumb;
  private currentBreadcrumbs: IBreadcrumb[];

  constructor(breadcrumbElement) {
    this.breadcrumbElement = breadcrumbElement;
    this.cookieCheck(this.cookieName, this.localStorageName);
    this.currentBreadcrumbs = JSON.parse(window.localStorage.getItem(this.localStorageName));
    this.newBreadcrumb = this.createNewBreadcrumb(this.breadcrumbElement, window.location.href);
    this.currentBreadcrumbs = this.addIfUniqueEntry({
      currentBreadcrumbs: this.currentBreadcrumbs,
      localStorageName: this.localStorageName,
      newBreadcrumb: this.newBreadcrumb,
    });
    this.generateHTML(this.currentBreadcrumbs, this.breadcrumbElement);
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

  private createBreadcrumbHTML(breadcrumb: IBreadcrumb) {
    let anchor = document.createElement("a");

    anchor.href = breadcrumb.url;
    anchor.title = breadcrumb.label;
    anchor.appendChild(document.createTextNode(breadcrumb.label));

    return anchor;
  }

  private generateHTML(breadcrumbs: IBreadcrumb[], breadcrumbElement: HTMLElement) {

    let frag = document.createDocumentFragment();

    breadcrumbs.forEach((currentItem) => {
      frag.appendChild(this.createBreadcrumbHTML(currentItem));
    });

    breadcrumbElement.appendChild(frag);
  }
}

ready(() => {
  let breadcrumbs = <HTMLElement> document.querySelector(".js-breadcrumb");

  if (breadcrumbs !== null) {
    new Breadcrumbs(breadcrumbs); // tslint:disable-line
  }
});
