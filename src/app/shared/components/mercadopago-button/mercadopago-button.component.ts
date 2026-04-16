import { Component, Input, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';

declare var MercadoPago: any;

@Component({
  selector: 'app-mercadopago-button',
  template: `
    <!-- Estado de carga -->
    <div *ngIf="loading" class="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
      <span class="text-gray-600">Preparando el pago...</span>
    </div>

    <!-- Error -->
    <div *ngIf="errorMsg && !loading" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      <p class="font-medium mb-1">No se pudo cargar el botón de pago</p>
      <p>{{ errorMsg }}</p>
      <button (click)="initPayment()" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
        Reintentar
      </button>
    </div>

    <!-- Contenedor del wallet de MercadoPago -->
    <div id="wallet_container" [class.hidden]="loading || !!errorMsg"></div>
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
  errorMsg: string = '';

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.initPayment();
  }

  ngOnDestroy(): void {
    // Limpiar el contenedor al destruir el componente
    const container = document.getElementById('wallet_container');
    if (container) container.innerHTML = '';
  }

  initPayment(): void {
    if (!this.price || this.price <= 0) {
      this.errorMsg = 'El precio de la reserva no es válido.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.paymentService.createPreference({
      title: this.title,
      price: this.price,
      quantity: this.quantity
    }).subscribe({
      next: (preference: any) => {
        this.loading = false;
        if (typeof MercadoPago === 'undefined') {
          this.errorMsg = 'El SDK de Mercado Pago no está disponible. Recarga la página.';
          return;
        }

        try {
          const mp = new MercadoPago(this.publicKey, { locale: 'es-CO' });
          const bricksBuilder = mp.bricks();

          // Limpiar contenedor antes de renderizar
          const container = document.getElementById('wallet_container');
          if (container) container.innerHTML = '';

          bricksBuilder.create('wallet', 'wallet_container', {
            initialization: {
              preferenceId: preference.id,
              redirectMode: 'modal'
            },
            customization: {
              texts: { valueProp: 'smart_option' }
            }
          });
        } catch (e: any) {
          this.errorMsg = 'Error al inicializar el botón de pago: ' + e.message;
        }
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 403) {
          this.errorMsg = 'No tienes permisos para realizar pagos. Verifica que tu cuenta esté activa.';
        } else if (err.status === 401) {
          this.errorMsg = 'Debes iniciar sesión para continuar con el pago.';
        } else {
          this.errorMsg = err.error?.message || err.error?.detalle || 'Error al crear la preferencia de pago. Intenta nuevamente.';
        }
        console.error('Error MercadoPago preference:', err);
      }
    });
  }
}
