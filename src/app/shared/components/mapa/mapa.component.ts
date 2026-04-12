import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Input,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { MapaService, GeoJsonFeature } from '../../../core/services/mapa.service';

// Fix para los iconos de Leaflet con Webpack/Angular
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-mapa',
  template: `
    <div class="mapa-container">
      <div #mapContainer id="mapa-leaflet" class="mapa-leaflet"></div>
      <div *ngIf="cargando" class="mapa-loading">
        <div class="spinner"></div>
        <p>Cargando mapa...</p>
      </div>
      <div *ngIf="error" class="mapa-error">
        <p>{{ error }}</p>
        <button (click)="cargarAlojamientos()">Reintentar</button>
      </div>
    </div>
  `,
  styles: [`
    .mapa-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .mapa-leaflet {
      width: 100%;
      height: 100%;
      min-height: 400px;
      border-radius: 12px;
      z-index: 1;
    }
    .mapa-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 10;
      background: rgba(255,255,255,0.9);
      padding: 20px;
      border-radius: 8px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 10px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .mapa-error {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 10;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .mapa-error button {
      margin-top: 8px;
      padding: 6px 16px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `],
})
export class MapaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  /** Centro inicial del mapa (Colombia por defecto) */
  @Input() lat = 4.5709;
  @Input() lng = -74.2973;
  @Input() zoom = 6;
  /** Altura del mapa en px */
  @Input() altura = 500;

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;
  cargando = false;
  error?: string;

  constructor(
    private mapaService: MapaService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => this.inicializarMapa(), 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa(): void {
    const el = this.mapContainer?.nativeElement;
    if (!el) return;

    el.style.height = `${this.altura}px`;

    this.map = L.map(el, {
      center: [this.lat, this.lng],
      zoom: this.zoom,
      zoomControl: true,
    });

    // Tiles de OpenStreetMap — completamente gratuito
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.cargarAlojamientos();
  }

  cargarAlojamientos(): void {
    this.cargando = true;
    this.error = undefined;

    this.mapaService.obtenerAlojamientosGeoJson().subscribe({
      next: (geojson) => {
        this.markersLayer.clearLayers();

        if (!geojson.features || geojson.features.length === 0) {
          this.cargando = false;
          return;
        }

        geojson.features.forEach((feature: GeoJsonFeature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const p = feature.properties;

          const marker = L.marker([lat, lng])
            .bindPopup(this.crearPopupHtml(p), {
              maxWidth: 280,
              className: 'homa-popup',
            });

          // Navegar al detalle al hacer clic en el botón del popup
          marker.on('popupopen', () => {
            setTimeout(() => {
              const btn = document.getElementById(`btn-alojamiento-${p.id}`);
              if (btn) {
                btn.addEventListener('click', () => {
                  this.ngZone.run(() => this.router.navigate(['/alojamientos', p.id]));
                });
              }
            }, 50);
          });

          this.markersLayer.addLayer(marker);
        });

        // Ajustar vista a todos los marcadores
        if (geojson.features.length > 0) {
          const bounds = this.markersLayer.getLayers()
            .filter((l): l is L.Marker => l instanceof L.Marker)
            .map((m) => m.getLatLng());
          if (bounds.length > 0) {
            this.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 13 });
          }
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando mapa:', err);
        this.error = 'No se pudo cargar el mapa. Intenta de nuevo.';
        this.cargando = false;
      },
    });
  }

  private crearPopupHtml(p: any): string {
    const precio = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(p.precioPorNoche);

    return `
      <div style="font-family: sans-serif; min-width: 200px;">
        <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #111827;">
          ${p.titulo}
        </h3>
        <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">
          📍 ${p.ciudad}
        </p>
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #4f46e5;">
          ${precio} / noche
        </p>
        <button
          id="btn-alojamiento-${p.id}"
          style="
            width: 100%;
            padding: 6px 0;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            font-weight: 500;
          "
        >
          Ver alojamiento
        </button>
      </div>
    `;
  }
}
