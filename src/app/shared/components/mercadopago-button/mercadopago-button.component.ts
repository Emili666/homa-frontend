import { Component, Input, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { environment } from '../../../../environments/environment';

declare var MercadoPago: any;

@Component({
    selector: 'app-mercadopago-button',
    template: `
    <div *ngIf="loading" class="text-center py-3">
      <div class="inline-flex items-center gap-2 text-gray-500 text-sm">
        <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        Preparando el pago...
      </div>
    </div>
    <div *ngIf="error" class="text-red-600 text-sm text-center py-2">{{ error }}</div>
    <div id="wallet_container_mp"></div>
    `,
    standalone: true,
    imports: [CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MercadoPagoButtonComponent implements OnInit, OnDestroy {
    @Input() title: string = 'Reserva HOMA';
    @Input() price: number = 0;
    @Input() quantity: number = 1;

    loading = false;
    error?: string;
    private brickController: any;

    constructor(private paymentService: PaymentService) {}

    ngOnInit(): void {
        if (this.price > 0) {
            this.initPayment();
        }
    }

    ngOnDestroy(): void {
        if (this.brickController) {
            try { this.brickController.unmount(); } catch (e) {}
        }
    }

    initPayment(): void {
        this.loading = true;
        this.error = undefined;

        this.paymentService.createPreference({
            title: this.title,
            price: this.price,
            quantity: this.quantity
        }).subscribe({
            next: (preference) => {
                this.loading = false;
                this.renderWallet(preference.id);
            },
            error: (err) => {
                this.loading = false;
                this.error = 'No se pudo inicializar el pago. Intenta de nuevo.';
                console.error('Error MP preference:', err);
            }
        });
    }

    private renderWallet(preferenceId: string): void {
        if (typeof MercadoPago === 'undefined') {
            this.error = 'SDK de Mercado Pago no disponible.';
            return;
        }

        const mp = new MercadoPago(environment.mercadoPagoPublicKey, { locale: 'es-CO' });
        const bricksBuilder = mp.bricks();

        bricksBuilder.create('wallet', 'wallet_container_mp', {
            initialization: {
                preferenceId: preferenceId,
                redirectMode: 'modal'
            },
            customization: {
                texts: { valueProp: 'smart_option' },
            },
        }).then((controller: any) => {
            this.brickController = controller;
        }).catch((err: any) => {
            console.error('Error renderizando wallet MP:', err);
            this.error = 'Error al mostrar el botón de pago.';
        });
    }
}
