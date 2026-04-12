import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const turnstile: any;

@Injectable({ providedIn: 'root' })
export class TurnstileService {

    private widgetId: string | null = null;

    /**
     * Renderiza el widget Turnstile en el contenedor indicado.
     * @param containerId  ID del div donde se renderizará (sin #)
     * @param onToken      Callback que recibe el token cuando el user pasa la verificación
     */
    render(containerId: string, onToken: (token: string) => void): void {
        // Si el script todavía no cargó, cargarlo dinámicamente
        if (typeof turnstile === 'undefined') {
            this.cargarScript(() => this.render(containerId, onToken));
            return;
        }

        // Esperar a que el div exista en el DOM
        const el = document.getElementById(containerId);
        if (!el) {
            console.warn(`[Turnstile] div #${containerId} no encontrado, reintentando...`);
            setTimeout(() => this.render(containerId, onToken), 200);
            return;
        }

        console.log(`[Turnstile] Renderizando widget en #${containerId}`);
        this.widgetId = turnstile.render(`#${containerId}`, {
            sitekey: environment.turnstileSiteKey,
            callback: (token: string) => onToken(token),
            'expired-callback': () => {
                console.warn('[Turnstile] Token expirado.');
                onToken('');
            },
            'error-callback': () => {
                console.error('[Turnstile] Error en el widget.');
                onToken('');
            },
            theme: 'light',
            language: 'es',
            appearance: 'always',
        });
    }

    private cargarScript(callback: () => void): void {
        if (document.getElementById('cf-turnstile-script')) {
            // Script ya existe, esperar a que cargue
            setTimeout(callback, 500);
            return;
        }
        const script = document.createElement('script');
        script.id = 'cf-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => setTimeout(callback, 300);
        document.head.appendChild(script);
    }

    /** Resetea el widget después de un fallo de formulario */
    reset(): void {
        if (this.widgetId !== null && typeof turnstile !== 'undefined') {
            turnstile.reset(this.widgetId);
        }
    }

    /** Elimina el widget del DOM (llamar en ngOnDestroy) */
    remove(): void {
        if (this.widgetId !== null && typeof turnstile !== 'undefined') {
            try {
                turnstile.remove(this.widgetId);
            } catch (e) {
                // Widget ya removido
            }
            this.widgetId = null;
        }
    }
}
