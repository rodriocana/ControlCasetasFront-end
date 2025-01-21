import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Familiar, SociosService } from '../services/socios.service';
import { Socio } from '../services/socios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-socio-detalle',
  imports: [CommonModule, RouterModule],
  templateUrl: './socio-detalle.component.html',
  styleUrls: ['./socio-detalle.component.css']


})


export class SocioDetalleComponent implements OnInit {


  socio: Socio | undefined;
  familiares: Familiar[] = []; // Aquí declaras los familiares como un arreglo vacío
  selectedFamiliarIndex: number | null = null; // Índice del familiar seleccionado


  constructor(
    private route: ActivatedRoute,
    private sociosService: SociosService,

  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    if (id) {
      this.sociosService.getSocioById(+id).subscribe((socio) => {
        this.socio = socio;
        console.log(this.socio);
      });

      // Aquí, asigna el resultado de la llamada a la API de familiares a 'familiares'
      this.sociosService.getFamiliares(+id).subscribe((familiares) => {
        this.familiares = familiares; // Asigna los familiares correctamente
        console.log(this.familiares);
      });
    }
  }

   // Método para seleccionar un familiar
   seleccionarFamiliar(index: number): void {
    this.selectedFamiliarIndex = index === this.selectedFamiliarIndex ? null : index;
  }

navigateTo() {
throw new Error('Method not implemented.');
}

addFamiliar() {

  console.log('Añadir familiar');
  }

   // Método para eliminar el familiar seleccionado
   eliminarFamiliar(): void {
    if (this.selectedFamiliarIndex !== null) {
      const familiarId = this.familiares[this.selectedFamiliarIndex].id_familiar;
      if (confirm('¿Estás seguro de que deseas eliminar este familiar?')) {
        this.sociosService.eliminarFamiliar(familiarId).subscribe(
          () => {
            // Eliminar el familiar de la lista localmente
            this.familiares.splice(this.selectedFamiliarIndex!, 1);
            this.selectedFamiliarIndex = null;
          },
          (error) => {
            console.error('Error al eliminar el familiar:', error);
          }
        );
      }
    }
  }
}
