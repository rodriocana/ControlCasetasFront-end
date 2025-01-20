import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Asegúrate de importar FormsModule correctamente


@Component({
  selector: 'app-addsocio',
  imports: [CommonModule, FormsModule],  // Aquí se usa FormsModule correctamente
  templateUrl: './addsocio.component.html',
  styleUrl: './addsocio.component.css'
})
export class AddsocioComponent {

  socio = {
    nombre: '',
    numeroSocio: 0,
    apellido: '',
    telefono: '',
    domicilio: '',
    numeroFamiliares: 0,
  };

  numeroFamiliares: number = 0;
  familiares: { nombre: string; apellido: string }[] = [];

  constructor(private router: Router) { }

  navigateTo() {
  this.router.navigate(['inicio']);
  }

   // Crear los campos de familiares según el número ingresado
   crearCamposFamiliares(): void {
    const cantidadFamiliares = this.numeroFamiliares;
    this.familiares = [];
    for (let i = 0; i < cantidadFamiliares; i++) {
      this.familiares.push({ nombre: '', apellido: '' });
    }
  }

 // Función para manejar la sumisión del formulario
 agregarSocio(): void {
  // Aquí deberías enviar los datos del socio y familiares al backend
  console.log('Socio:', this.socio);
  console.log('Familiares:', this.familiares);
}

}
