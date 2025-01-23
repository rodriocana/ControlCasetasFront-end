import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Asegúrate de importar FormsModule correctamente
import { Familiar, Socio, SociosService } from '../services/socios.service';

@Component({
  selector: 'app-addsocio',
  imports: [CommonModule, FormsModule],  // Aquí se usa FormsModule correctamente
  templateUrl: './addsocio.component.html',
  styleUrls: ['./addsocio.component.css']  // Corregir de 'styleUrl' a 'styleUrls'
})
export class AddsocioComponent {

  socio: Socio = {
    id_socio: 0,  // Esto se establecerá después de agregar el socio
    nombre: '',
    apellido: '',
    telefono: '',
    invitaciones: 0,
    domicilio: '',
    NumTar: '',
    familiares: []
  };

  numeroFamiliares: number = 0;
  familiares: Familiar[] = [];

  constructor(private router: Router, private sociosService: SociosService) { }

  ngOnInit(): void {
    // Verificar si el token está presente
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      this.router.navigate(['/inicio']); // Redirigir al inicio si no está autenticado
    }
  }

  // Navegar a la página de inicio
  navigateTo(): void {
    this.router.navigate(['inicio']);
  }

  // Crear los campos de familiares según el número ingresado
  crearCamposFamiliares(): void {
    let idCounter = 10; // Inicia el contador desde 10 (o el valor inicial que necesites)

    this.familiares = Array.from({ length: this.numeroFamiliares }, () => ({
      id_familiar: idCounter++,  // Asigna y luego incrementa el valor del contador
      nombre: '',
      apellido: '',
      NumTar: ''
    }));
  }

  // Manejar la sumisión del formulario
  agregarSocio(event: Event): void {

    event.preventDefault(); // Prevenir que el formulario se envíe automáticamente

    console.log('Socio agregándose:', this.socio);
    // Asignar familiares al objeto socio
    this.socio.familiares = this.familiares;

    console.log('Familiares:', this.familiares);
    // Primero, agregar el socio
    this.sociosService.agregarSocio(this.socio).subscribe({
      next: (response) => {
        alert('Socio agregado exitosamente');
        console.log('Respuesta del servidor:', response);

        // Asignar el id del socio recién creado al objeto socio
        this.socio.id_socio = response.id;  // Asumimos que la respuesta contiene el id del socio agregado
        console.log("el socio id es: ", this.socio.id_socio);
        console.log("El familiar es: ", this.familiares);

        //-------  A PARTIR DE AQUI FALLA ---------- //

        // Ahora, agregar cada familiar asociado al socio
        this.familiares.forEach(familiar => {
          this.sociosService.addFamiliar(this.socio.id_socio, familiar).subscribe({
            next: (familiarResponse) => {
              console.log('Familiar agregado:', familiarResponse);
            },
           error: (familiarError) => {
          console.error('Error al agregar el familiar:', familiarError);
          alert(`Ocurrió un error al agregar un familiar: ${familiarError.message || familiarError}`);
              }
          });
        });

        // Resetear el formulario
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
      id_socio: 0,  // Reseteamos id_socio
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
