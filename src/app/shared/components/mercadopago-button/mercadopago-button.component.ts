import { Component, Input, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';

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
    <div *ngIf="error && !loading" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      <p class="font-medium mb-1">No se pudo cargar el botón de pago</p>
      <p>{{ error }}</p>
      <button (click)="initPayment()" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
        Reintentar
      </button>
    </div>
    <div id="wallet_container_mp" [class.hidden]="loading || !!error"></div>
  `,
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MercadoPagoButtonComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Reserva HOMA';
  @Input() price: number = 0;
  @Input() quantity: number = 1;
  @Input() publicKey: string = 'TEST-ce741194-c182-4504-ab65-f2d32784bb69';

  loading = false;
  error?: string;
  private brickController: any;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    if (this.price > 0) {
      this.initPayment();
    } else {
      this.error = 'El precio de la reserva no es válido.';
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
        if (err.status === 403) {
          this.error = 'No tienes permisos para realizar pagos. Verifica que tu cuenta esté activa.';
        } else if (err.status === 401) {
          this.error = 'Debes iniciar sesión para continuar con el pago.';
        } else {
          this.error = err.error?.message || err.error?.detalle || 'No se pudo inicializar el pago. Intenta de nuevo.';
        }
        console.error('Error MP preference:', err);
      }
    });
  }

  private renderWallet(preferenceId: string): void {
    if (typeof MercadoPago === 'undefined') {
      this.error = 'SDK de Mercado Pago no disponible. Recarga la página.';
      return;
    }

    try {
      const mp = new MercadoPago(this.publicKey, { locale: 'es-CO' });
      const bricksBuilder = mp.bricks();

      bricksBuilder.create('wallet', 'wallet_container_mp', {
        initialization: {
          preferenceId: preferenceId,
          redirectMode: 'modal'
        },
        customization: {
          texts: { valueProp: 'smart_option' }
        }
      }).then((controller: any) => {
        this.brickController = controller;
      }).catch((err: any) => {
        console.error('Error renderizando wallet MP:', err);
        this.error = 'Error al mostrar el botón de pago.';
      });
    } catch (e: any) {
      this.error = 'Error al inicializar Mercado Pago: ' + e.message;
    }
  }
}
