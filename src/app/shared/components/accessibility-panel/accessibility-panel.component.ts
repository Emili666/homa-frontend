import { Component, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-accessibility-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-panel.component.html',
  styleUrl: './accessibility-panel.component.scss'
})
export class AccessibilityPanelComponent {
  isOpen = false;
  textSize: 'small' | 'medium' | 'large' = 'medium';
  highContrast = false;
  grayScale = false;
  dyslexicFont = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  setTextSize(size: 'small' | 'medium' | 'large') {
    this.textSize = size;
    const body = this.document.body;
    this.renderer.removeClass(body, 'text-small');
    this.renderer.removeClass(body, 'text-medium');
    this.renderer.removeClass(body, 'text-large');
    this.renderer.addClass(body, `text-${size}`);
  }

  toggleContrast() {
    this.highContrast = !this.highContrast;
    if (this.highContrast) {
      this.renderer.addClass(this.document.documentElement, 'high-contrast');
    } else {
      this.renderer.removeClass(this.document.documentElement, 'high-contrast');
    }
  }

  toggleGrayScale() {
    this.grayScale = !this.grayScale;
    if (this.grayScale) {
      this.renderer.addClass(this.document.documentElement, 'grayscale-mode');
    } else {
      this.renderer.removeClass(this.document.documentElement, 'grayscale-mode');
    }
  }

  toggleDyslexicFont() {
    this.dyslexicFont = !this.dyslexicFont;
    if (this.dyslexicFont) {
      this.renderer.addClass(this.document.body, 'dyslexic-font');
    } else {
      this.renderer.removeClass(this.document.body, 'dyslexic-font');
    }
  }

  resetSettings() {
    const body = this.document.body;
    const html = this.document.documentElement;

    this.renderer.removeClass(body, 'text-small');
    this.renderer.removeClass(body, 'text-large');
    this.renderer.addClass(body, 'text-medium');
    this.renderer.removeClass(html, 'high-contrast');
    this.renderer.removeClass(html, 'grayscale-mode');
    this.renderer.removeClass(body, 'dyslexic-font');

    this.textSize = 'medium';
    this.highContrast = false;
    this.grayScale = false;
    this.dyslexicFont = false;
  }
}
