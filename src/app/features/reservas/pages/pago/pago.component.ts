import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-paso-pago',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss']
})
export class PasoPagoComponent implements OnInit {
  titulo: string = 'Reserva HOMA';
  precio: number = 0;
  cantidad: number = 1;
  reservaId: number | null = null;
  publicKey: string = 'TEST-ce741194-c182-4504-ab65-f2d32784bb69';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['precio']) this.precio = Number(params['precio']);
      if (params['titulo']) this.titulo = params['titulo'];
      if (params['cantidad']) this.cantidad = Number(params['cantidad']);
      if (params['reservaId']) this.reservaId = Number(params['reservaId']);

      // Si no hay precio, redirigir al inicio
      if (!this.precio) {
        this.router.navigate(['/']);
      }
    });
  }
}
