import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Familiar, Socio, SociosService } from '../services/socios.service';
import { Route, Router, RouterModule } from '@angular/router';



@Component({
  selector: 'app-ver-socios',
  imports: [CommonModule, RouterModule],
  templateUrl: './ver-socios.component.html',
  styleUrl: './ver-socios.component.css'
})
export class VerSociosComponent implements OnInit{


  socios: Socio[] = [];
  familiares: Familiar[] = [];

  constructor(private sociosService: SociosService, private router:Router) {}

  ngOnInit(): void {
    // Verificar si el token está presente
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      this.router.navigate(['/inicio']); // Redirigir al inicio si no está autenticado
    }

    // Obtener datos de socios
    this.sociosService.getSocios().subscribe((data: Socio[]) => {
      this.socios = data;
      console.log(this.socios);

      // Obtener familiares para cada socio
      // this.socios.forEach((socio) => {
      //   this.sociosService.getFamiliares(socio.idsocio).subscribe((familiares) => {
      //     // Asignar familiares al socio
      //     socio.familiares = familiares;

      //     // Calcular el número de familiares y asignarlo
      //     socio.numeroFamiliares = familiares.length;
      //   });
      // });
    });
  }
  navigateTo() {
    this.router.navigate(['inicio']);
    }

}
