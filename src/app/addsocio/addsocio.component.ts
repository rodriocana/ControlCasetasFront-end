import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Asegúrate de importar FormsModule correctamente
import { Familiar, Socio, SociosService } from '../services/socios.service';


@Component({
  selector: 'app-addsocio',
  imports: [CommonModule, FormsModule],  // Aquí se usa FormsModule correctamente
  templateUrl: './addsocio.component.html',
  styleUrl: './addsocio.component.css'
})
export class AddsocioComponent {

  socio: Socio = {
    id_socio: 3,
    nombre: '',
    apellido: '',
    telefono: '',
    invitaciones: 0,
    domicilio: '',
    NumTar: '1111111',
    familiares: []
  };

  numeroFamiliares: number = 0;
  familiares: Familiar[] = [];

  constructor(private router: Router, private sociosService: SociosService) { }

  // Navegar a la página de inicio
  navigateTo(): void {
    this.router.navigate(['inicio']);
  }

  // Crear los campos de familiares según el número ingresado
  crearCamposFamiliares(): void {
    this.familiares = Array.from({ length: this.numeroFamiliares }, () => ({
      id_familiar: 0,
      nombre: '',
      apellido: '',
      NumTar: ''
    }));
  }

  // Manejar la sumisión del formulario
  agregarSocio(event: Event): void {

    event.preventDefault(); // Prevenir que el formulario se envíe automáticamente

    console.log('Socio agradandose:', this.socio);
    // Asignar familiares al objeto socio
    this.socio.familiares = this.familiares;

    // Enviar datos al servicio
    this.sociosService.agregarSocio(this.socio, this.familiares).subscribe({
      next: (response) => {
        alert('Socio agregado exitosamente');
        console.log('Respuesta del servidor:', response);
        this.resetFormulario();
      },
      error: (error) => {
        console.error('Error al agregar el socio:', error);
        alert('Ocurrió un error al agregar el socio.');
      }
    });
  }

  // Resetear el formulario después de agregar un socio
  resetFormulario(): void {
    this.socio = {
      id_socio: 0,
      nombre: '',
      apellido: '',
      telefono: '',
      invitaciones: 0,
      domicilio: '',
      NumTar: '',
      familiares: []
    };
    this.familiares = [];
    this.numeroFamiliares = 0;
  }
}
