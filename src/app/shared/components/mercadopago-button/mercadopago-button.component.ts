import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';

declare var MercadoPago: any;

@Component({
    selector: 'app-mercadopago-button',
    template: `
    <div id="wallet_container"></div>
    <div *ngIf="loading" class="text-center p-4">
      <span class="animate-pulse">Preparando el pago...</span>
    </div>
  `,
    standalone: true,
    imports: [CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MercadoPagoButtonComponent implements OnInit {
    @Input() title: string = 'Reserva HOMA';
    @Input() price: number = 0;
    @Input() quantity: number = 1;
    @Input() publicKey: string = 'YOUR_PUBLIC_KEY';

    loading = false;

    constructor(@Inject(PaymentService) private paymentService: PaymentService) { }

    ngOnInit(): void {
        this.initPayment();
    }

    initPayment(): void {
        this.loading = true;
        this.paymentService.createPreference({
            title: this.title,
            price: this.price,
            quantity: this.quantity
        }).subscribe({
            next: (preference: any) => {
                if (typeof MercadoPago !== 'undefined') {
                    const mp = new MercadoPago(this.publicKey);
                    const bricksBuilder = mp.bricks();

                    bricksBuilder.create('wallet', 'wallet_container', {
                        initialization: {
                            preferenceId: preference.id,
                            redirectMode: 'modal'
                        },
                        customization: {
                            texts: {
                                valueProp: 'smart_option',
                            },
                        },
                    });
                }
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error creating preference:', err);
                this.loading = false;
            }
        });
    }
}
