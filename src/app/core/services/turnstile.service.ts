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
        // Si el script todavía no cargó, reintentar en 500ms
        if (typeof turnstile === 'undefined') {
            setTimeout(() => this.render(containerId, onToken), 500);
            return;
        }

        this.widgetId = turnstile.render(`#${containerId}`, {
            sitekey: environment.turnstileSiteKey,
            callback: (token: string) => onToken(token),
            'expired-callback': () => {
                console.warn('[Turnstile] Token expirado, se requiere interacción nueva.');
                onToken('');
            },
            'error-callback': () => {
                console.error('[Turnstile] Error en el widget de verificación.');
                onToken('');
            },
            theme: 'light',
            language: 'es',
            // "interaction-only" = solo muestra el reto si Cloudflare sospecha bot
            // Con la clave de testing siempre pasa invisible
            appearance: 'interaction-only',
        });
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
