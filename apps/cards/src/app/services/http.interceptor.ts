import {Injectable} from "@angular/core";
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {getJwtExp} from "../functions/getJwtExp";
import {catchError, tap} from "rxjs/operators";
import {MessageService} from "primeng/api";
import {LocalStorageService} from "./local-storage.service";


@Injectable()
export class HttpMainInterceptor implements HttpInterceptor {

    constructor(
       private messageService: MessageService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const jwt = LocalStorageService.jwt;
        const jwtExp = getJwtExp(jwt);

        if (jwt) {
            request = request.clone({
                headers: request.headers.set("jwt", jwt)
            })
        }

        return next.handle(request).pipe(
            tap((response) => {
                const jwt: string = (response as HttpResponse<any>)?.headers?.get('Refreshed-Jwt') || '';
                if(jwt) {
                    LocalStorageService.jwt = jwt;
                }
            }),
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
