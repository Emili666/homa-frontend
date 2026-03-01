import { Component } from "@angular/core"

@Component({
  selector: "app-root",
  template: `
    <router-outlet></router-outlet>
    <app-accessibility-panel></app-accessibility-panel>
  `,
  styles: [],
})
export class AppComponent {
  title = "HOMA - Gestión de Alojamientos"
}
