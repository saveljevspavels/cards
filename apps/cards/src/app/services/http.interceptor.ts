import {Injectable} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {getJwtExp} from "../functions/getJwtExp";
import {catchError} from "rxjs/operators";
import {MessageService} from "primeng/api";


@Injectable()
export class HttpMainInterceptor implements HttpInterceptor {

    constructor(
       private messageService: MessageService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const jwt = localStorage.getItem('jwt') || '';
        const jwtExp = getJwtExp(jwt);

        if (jwt) {
            request = request.clone({
                headers: request.headers.set("Authorization", 'Bearer '+jwt)
            })
        }

        return next.handle(request).pipe(
            catchError((err: any) => {
                if ( err instanceof HttpErrorResponse ) {
                    switch ( err.status ) {
                        case 400:
                            this.messageService.add({severity:'error', summary:'Error', detail: err.error.response})
                            break;
                    }

                }
                return throwError(err)
            })
        );

    }

}
