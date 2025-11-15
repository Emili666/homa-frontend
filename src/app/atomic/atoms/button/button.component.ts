import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label = 'Enviar';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() icon?: string;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) this.clicked.emit();
  }
}
