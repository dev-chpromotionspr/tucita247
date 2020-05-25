import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Business } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getBusiness(businessId): Observable<Business> {
    return this.http.get<Business>(this.apiURL + '/business/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  updateBusiness(businessId, dataForm) {
    return this.http.put(this.apiURL + '/business/' + businessId, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error){
    return throwError(error || 'Server Error');
  }
}
