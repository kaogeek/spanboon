import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoadingService } from "./loading.service";
import { finalize } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

    private count = 0;

    constructor(private loadingService: LoadingService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.loadingService.isLoading.next(true);
        this.count++;
        return next.handle(req).pipe(
            finalize(
                () => {
                    this.count--;
                    if (this.count === 0) {
                        this.loadingService.isLoading.next(false);
                    }
                }
            )
        )
    }
}