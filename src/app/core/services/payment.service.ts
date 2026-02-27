import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    createPreference(paymentData: { title: string, price: number, quantity: number }): Observable<{ id: string }> {
        return this.http.post<{ id: string }>(`${this.apiUrl}/create-preference`, paymentData);
    }
}
