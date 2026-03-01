import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  totalUsuarios = 0;

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (response: any) => {
        // Handle both wrapped and unwrapped Page responses
        const data = response.data || response;
        this.usuarios = data.content || (Array.isArray(data) ? data : []);
        this.totalUsuarios = data.totalElements || this.usuarios.length;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }
}
