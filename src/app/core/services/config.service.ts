import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  private apiUrl: string = "";

  constructor() {
    // Leer de variables de ambiente del navegador
    const envApiUrl = (window as any).__APP_CONFIG__?.API_URL;
    
    // Si no hay variable de ambiente, usar valor por defecto
    this.apiUrl = envApiUrl || "http://localhost:8080/api";
    
    console.log("[ConfigService] API URL: ", this.apiUrl);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
