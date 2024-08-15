import {Injectable} from "@angular/core";
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from "@angular/common/http";
import {iif, mergeMap, Observable, of, throwError} from "rxjs";
import {getJwtExp} from "../functions/getJwtExp";
import {catchError, tap} from "rxjs/operators";
import {MessageService} from "primeng/api";
import {LocalStorageService} from "./local-storage.service";
import {AuthService} from "./auth.service";
import {decodeJwt} from "../../../../shared/utils/decodeJwt";


@Injectable()
export class HttpMainInterceptor implements HttpInterceptor {

    constructor(
       private messageService: MessageService,
       private authService: AuthService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const jwt = LocalStorageService.jwt;
        let expired: boolean = HttpMainInterceptor.tokenExpired(getJwtExp(jwt) || 0);
        const decodedJwt = decodeJwt(jwt);

        if (jwt) {
            request = request.clone({
                headers: request.headers.set("jwt", jwt)
            });
        }

        return iif(
            () => expired && decodedJwt.refreshToken && request.url.indexOf('3000') !== -1 && request.url.indexOf('auth') === -1,
            this.authService.updateJwtToken(decodedJwt.refreshToken).pipe(
                tap((jwt: string) => {
                    LocalStorageService.jwt = jwt;
                    request = request.clone({
                        headers: request.headers.set("jwt", jwt)
                    });
                })
            ),
            of(null)
        ).pipe(mergeMap(() => next.handle(request).pipe(
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
                            this.messageService.add({severity:'error', summary:'Error', detail: err.error})
                            break;
                    }

                }
                return throwError(err)
            })
        )));

    }

    static tokenExpired(expiresAt: number): boolean {
        return + new Date > ( expiresAt * 1000 );
    }
}
