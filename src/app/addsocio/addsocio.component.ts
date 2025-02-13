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
    idsocio: '',
    nombre: '',
    apellido: '',
    telefono: '',
    invitaciones: 0,
    email: '',
    direccion: '',
    poblacion:'',
    dni: '',
    familiares: []
  };

  numeroFamiliares: number = 0;
  familiares: Familiar[] = [];

  constructor(private router: Router, private sociosService: SociosService) { }

  ngOnInit(): void {
    //  aqui verifico si el token está en localStorafe
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      this.router.navigate(['/inicio']); //  si no, vuelvo a la pantalla inicio
    }
  }


  navigateTo(): void {
    this.router.navigate(['inicio']);
  }

  crearCamposFamiliares(): void {
    let idCounter = 10; // Contador

    this.familiares = Array.from({ length: this.numeroFamiliares }, () => ({
      idsocio: '',
      nombre: '',
      apellido: '',
      invitaciones: 0,
      invitadosDentro:0
    }));
  }

  agregarSocio(event: Event): void {

    event.preventDefault(); // Preveo que el formulario se envíe automáticamente

    console.log('Socio agregándose:', this.socio);


    console.log('Familiares:', this.familiares);
    // Primero agregamos el socio
    this.sociosService.agregarSocio(this.socio).subscribe({
      next: (response) => {
        // alert('Socio agregado exitosamente');
        console.log('Respuesta del servidor:', response);

        // Asignamos el id del socio recién creado al objeto socio
        this.socio.idsocio = response.id;  // Response tiene el id del socio agregado
        console.log("el socio id es: ", this.socio.idsocio);
        console.log("El familiar es: ", this.familiares);

        // Aqui agregamos cada familiar asociado al socio
        this.familiares.forEach(familiar => {
          this.sociosService.addFamiliar(this.socio.idsocio, familiar).subscribe({
            next: (familiarResponse) => {
              console.log('Familiar agregado:', familiarResponse);
            },
           error: (familiarError) => {
          console.error('Error al agregar el familiar:', familiarError);
          alert(`Ocurrió un error al agregar un familiar: ${familiarError.message || familiarError}`);
              }
          });
        });


        this.resetFormulario();
      },
      error: (error) => {
        console.error('Error al agregar el socio:', error);
        alert('Ocurrió un error al agregar el socio.');
      }
    });

  }

  // Se resetea el formulario una vez agregamos un socio
  resetFormulario(): void {
    this.socio = {
      idsocio: '',
      nombre: '',
      apellido: '',
      telefono: '',
      invitaciones: 0,
      direccion: '',
      poblacion: '',
      dni: '',
      email: '',
      familiares: []
    };
    this.familiares = [];
    this.numeroFamiliares = 0;
  }
}
