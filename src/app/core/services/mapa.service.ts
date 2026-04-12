import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface GeoJsonGeometry {
  type: string;
  coordinates: number[];
}

export interface GeoJsonProperties {
  id: number;
  titulo: string;
  descripcion: string;
  precioPorNoche: number;
  ciudad: string;
  direccion: string;
  anfitrionId: number;
  anfitrionNombre: string;
}

export interface GeoJsonFeature {
  type: string;
  geometry: GeoJsonGeometry;
  properties: GeoJsonProperties;
}

export interface GeoJsonFeatureCollection {
  type: string;
  features: GeoJsonFeature[];
}

@Injectable({ providedIn: 'root' })
export class MapaService {
  private apiUrl = `${environment.apiUrl}/mapas`;

  constructor(private http: HttpClient) {}

  obtenerAlojamientosGeoJson(): Observable<GeoJsonFeatureCollection> {
    return this.http.get<GeoJsonFeatureCollection>(`${this.apiUrl}/alojamientos`);
  }
}
