import { Component, OnInit } from '@angular/core';
import { Socio, SociosService } from '../services/socios.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ver-socios',
  imports: [CommonModule],
  templateUrl: './ver-socios.component.html',
  styleUrl: './ver-socios.component.css'
})
export class VerSociosComponent implements OnInit {
  socios: Socio[] = [];   // Lista completa de socios
  sociosPaginados: Socio[] = []; // Lista de socios filtrados por página
  paginaActual: number = 0; // Página actual
  tamanoPagina: number = 10; // Número de socios por página
  Math = Math;  // Esto hace que Math sea accesible en la plantilla

  constructor(private sociosService: SociosService, private router: Router) {}

  ngOnInit(): void {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      this.router.navigate(['/inicio']);
    }

    this.sociosService.getSocios().subscribe((data: Socio[]) => {
      this.socios = data;
      this.actualizarPagina(); // Actualizar la tabla con la primera página de datos
    });
  }

  // Método para actualizar la vista de la tabla según la página actual
  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.sociosPaginados = this.socios.slice(inicio, fin);
  }

  // Cambiar de página hacia adelante
  paginaSiguiente(): void {
    if ((this.paginaActual + 1) * this.tamanoPagina < this.socios.length) {
      this.paginaActual++;
      this.actualizarPagina();
    }
  }

  // Cambiar de página hacia atrás
  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.actualizarPagina();
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.socios.length / this.tamanoPagina) || 1;
  }

  verDetalle(id: string) {
    this.router.navigate(['/socios', id]);
  }

  navigateTo() {
    this.router.navigate(['inicio']);
  }
}
