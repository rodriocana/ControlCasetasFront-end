import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-addsocio',
  imports: [],
  templateUrl: './addsocio.component.html',
  styleUrl: './addsocio.component.css'
})
export class AddsocioComponent {


  constructor(private router: Router) { }

  navigateTo() {
  this.router.navigate(['inicio']);
  }


  agregarSocio() {
    // Lógica para agregar el socio
    console.log("Socio agregado");
  }

}
