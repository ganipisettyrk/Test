import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PopupDataItem, PopupService } from '../popup/popup.service';

@Injectable()
export class CustomErrorInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.forwardRequest(next, request);
  }

  forwardRequest(next, request): Observable<any> {
    const popupService = this.injector.get(PopupService);
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          if (request.url != "generateotp"
            && event.body && event.body.code == "resource_forbidden"
            && event.body.subCode == "blocked_user") {
            let popupItem: PopupDataItem = {
              isLoggedIn: false,
              type: "blockedUser",
              popupData: null,
              heading: null,
              response: null,
              showCloseButton: false,
              historyIndex: null,
              pageName: null,
              isSetForNone: false
            };
            sessionStorage.setItem("blockedDescription", event.body.description)
            popupService.showPopup(popupItem);
          } else if (event.body && event.body.code == "contestInvalidUser") {
            let popupItem: PopupDataItem = {
              isLoggedIn: false,
              type: "contestInvalidUser",
              popupData: null,
              heading: null,
              response: null,
              showCloseButton: false,
              historyIndex: null,
              pageName: null,
              isSetForNone: false
            };
            sessionStorage.setItem("contestUserErrorDesc", event.body.description)
            popupService.showPopup(popupItem);
          }
        }
      }), catchError(error => {
        return throwError(error);
      })
    );
  }
}