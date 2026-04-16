import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  private apiUrl: string = "";

  constructor() {
    // En producción lee la variable inyectada por el servidor (Docker/Azure)
    // En local usa el environment que apunta al proxy
    const envApiUrl = (window as any).__APP_CONFIG__?.API_URL;
    this.apiUrl = envApiUrl || environment.apiUrl;

    console.log("[ConfigService] API URL: ", this.apiUrl);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
