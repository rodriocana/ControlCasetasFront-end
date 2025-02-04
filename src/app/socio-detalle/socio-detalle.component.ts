import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Familiar, Movimiento, SociosService } from '../services/socios.service';
import { Socio } from '../services/socios.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-socio-detalle',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './socio-detalle.component.html',
  styleUrls: ['./socio-detalle.component.css'],
  providers: [DatePipe] // Asegúrate de añadirlo aquí
})


export class SocioDetalleComponent implements OnInit {

// Método para cerrar el modal


socio: Socio | undefined;
familiares: Familiar[] = [];
movimiento: Movimiento[] = [];
selectedFamiliarIndex: number | null = null;
editForm: FormGroup; // Formulario reactivo para editar invitado
showEditModal = false; // Controla la visibilidad del modal
isEditMode = false; // Identifica si estamos en modo de edición
showAddFamiliarModal = false;
addFamiliarForm: FormGroup;
showRegistrosModal = false; // Controla la visibilidad del modal de registros
nombreInvitado:string = '';
idSocio: string = '';
Aforo:number = 0;
esUsuario: boolean = false;
esAdmin:boolean = false;
movimientosConFechaFormateada: any[] = [];  // Guardamos los movimientos con la fecha formateada




constructor(
  private route: ActivatedRoute,
  private sociosService: SociosService,
  private fb: FormBuilder,
  private router: Router,
  private datePipe: DatePipe
) {

  // Configuración del formulario reactivo para editar invitado y familiares
  this.editForm = this.fb.group({
    idsocio: [{ value: '', disabled: true }],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apellido: ['', Validators.required],
    telefono: ['', Validators.required],
    direccion: ['', Validators.required],
    poblacion: ['', Validators.required],
    dni: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    invitaciones: ['', [Validators.required, Validators.min(0)]],
  });

  this.addFamiliarForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    invitaciones: [''],
  });
}


ngOnInit(): void {

  // Verificar si el token está presente
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');
  if (!adminToken && !userToken) {
    this.router.navigate(['/inicio']); // Redirigir al inicio si no está autenticado
  }

  if(userToken){
    this.esUsuario = true;
  }

  if(adminToken){
    this.esAdmin = true;
  }

  this.cargarInvitados();

  this.calcularInvitadosDentro().subscribe((total) => {
    console.log('🔢 Invitados dentro:', total);
    // Asignas el valor total al atributo Aforo
    this.Aforo = total;
  });


}

// Método para abrir el modal y cargar los datos del invitado
editarInvitado(): void {
  if (this.socio) {
    this.isEditMode = true;
    this.showEditModal = true;

    // Rellenar el formulario cuando abres el modal editar socios, con los datos del socio
    this.editForm.patchValue({
      idsocio: this.socio.idsocio,
      nombre: this.socio.nombre,
      apellido: this.socio.apellido,
      telefono: this.socio.telefono,
      direccion: this.socio.direccion,
      poblacion: this.socio.poblacion,
      dni:this.socio.dni,
      email: this.socio.email,
      invitaciones: this.socio.invitaciones,
    });
  }
}

// Método para guardar los cambios del invitado editado y enviarlos al backend
saveChanges(): void {
  if (this.editForm.valid) {
    const updatedSocio = this.editForm.getRawValue(); // Obtener datos del formulario
    console.log('Socio actualizado:', updatedSocio);  // esto funciona y me devuelve el socio actualizado.

    this.sociosService.updateSocio(updatedSocio).subscribe({
      next: (response) => {
        // Actualizar la tabla con los nuevos datos
        this.socio = { ...this.socio, ...updatedSocio };

        console.log("Cerrar modal");
      },
      error: (error) => {
        console.error('Error al actualizar el socio:', error);
      }
    });
  }

  this.closeModal();
  window.location.reload();
}

// Método para cerrar el modal
closeModal(): void {
  this.showEditModal = false;
}

seleccionarFamiliar(index: number): void {
  this.selectedFamiliarIndex = index === this.selectedFamiliarIndex ? null : index;
  console.log(this.selectedFamiliarIndex);
}

addFamiliar() {
  this.showAddFamiliarModal = true;
}

saveFamiliar(): void {
  if (this.addFamiliarForm.valid && this.socio) {
    const nuevoFamiliar = this.addFamiliarForm.value;
    console.log('Nuevo familiar:', nuevoFamiliar, this.socio.idsocio);



    // Ahora el objeto 'nuevoFamiliar' no tendrá el campo NumTar
    this.sociosService.addFamiliar(this.socio.idsocio, nuevoFamiliar).subscribe({
      next: (response) => {
        console.log('Familiar guardado:', response);

        // Agregar el nuevo familiar al arreglo local para reflejar los cambios en la interfaz
        this.familiares.push(response);

        // Cerrar el modal y resetear el formulario
        this.closeAddFamiliarModal();
      },
      error: (error) => {
        console.error('Error al guardar el familiar:', error);
      },
    });
  }

window.location.reload();

}
closeAddFamiliarModal() {
  this.showAddFamiliarModal = false;
  this.addFamiliarForm.reset();
}


eliminarInvitado(): void {
  console.log("id socio", this.socio?.idsocio);

  if (this.socio) {
    if (confirm('¿Estás seguro de que deseas eliminar este socio?')) {
      this.sociosService.eliminarSocio(this.socio.idsocio).subscribe({
        next: () => {
          console.log(`Socio con ID ${this.socio?.idsocio} eliminado correctamente.`);
          this.router.navigate(['/ver-socios']); // Redirige después de la eliminación
        },
        error: (error) => {
          console.error('Error al eliminar el socio:', error);
          alert('Hubo un problema al intentar eliminar el socio. Inténtalo nuevamente.');
        },
      });
    }
  }
}

// DA FALLO DE VEZ EN CUANDO
eliminarFamiliar(): void {
  if (this.selectedFamiliarIndex !== null) {
    // Obtener el ID del socio del familiar seleccionado
    const familiarId = this.familiares[this.selectedFamiliarIndex].idsocio;

    if (confirm('¿Estás seguro de que deseas eliminar este familiar?')) {
      // Llamar al servicio para eliminar el familiar por su ID
      this.sociosService.eliminarFamiliar(familiarId).subscribe({
        next: () => {
          console.log(`Familiar con ID ${familiarId} eliminado correctamente.`);

          // Eliminar el familiar de la lista local usando el índice seleccionado
          if (this.selectedFamiliarIndex !== null) {
            this.familiares.splice(this.selectedFamiliarIndex, 1);
          }

          // Restablecer el índice seleccionado después de eliminar
          this.selectedFamiliarIndex = null;
          window.location.reload();
        },
        error: (error) => {
          console.error('Error al eliminar el familiar:', error);
          alert('Hubo un error al intentar eliminar el familiar. Inténtalo de nuevo.');
        },
      });
    }
  }
}

navigateTo() {
  this.router.navigate(['/ver-socios']);
  }


  cargarInvitados() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);

    if (id) {
      const idAsString: string = id.toString();

      // Obtener datos del socio
      this.sociosService.getSocioById(idAsString).subscribe((socio) => {
        this.socio = socio;
        console.log(this.socio);
      });

      // Obtener datos de los familiares
      this.sociosService.getFamiliares(idAsString).subscribe((familiares) => {
        this.familiares = familiares;
        console.log(this.familiares);

        // Para cada familiar, obtener el total de invitados dentro
        this.familiares.forEach((familiar) => {
          this.sociosService.getMovimientosByFamiliar(familiar.idsocio).subscribe((response: { invitadosDentro: number }) => {
            familiar.invitadosDentro = response.invitadosDentro;
            console.log("Invitados dentro: " + familiar.invitadosDentro);
          });
        });
      });


    } else {
      console.error('El ID es nulo o no válido');
    }
  }

  verRegistros(): void {
    let id = null;

    if (this.selectedFamiliarIndex !== null) {
      // Obtener el ID del socio del familiar seleccionado
      id = this.familiares[this.selectedFamiliarIndex].idsocio;
    } else if (this.socio) {
      // Si no hay familiar seleccionado, usar el ID del socio principal
      id = this.socio.idsocio;
    }

    if (id) {
      this.sociosService.getMovimientos(id).subscribe({
        next: (movimientos) => {
          this.movimiento = movimientos;
          this.showRegistrosModal = true;

           // Mapeamos los movimientos y formateamos la fecha
        this.movimientosConFechaFormateada = movimientos.map(item => {
          return {
            ...item,  // Copiamos las propiedades del objeto
            fechaFormateada: this.datePipe.transform(item.fecha, 'yyyy-MM-dd')  // Formateamos la fecha
          };
        });

          // Verificar si hay movimientos antes de acceder al primer elemento
          if (this.movimiento.length > 0) {
            console.log(this.movimiento[0].idsocio);
            this.idSocio = this.movimiento[0].idsocio?.toString() || '';
          } else {
            alert("No hay registro de movimientos");
            this.idSocio = ' '
            console.warn("No hay movimientos disponibles.");
          }
        },
        error: (error) => {
          console.error('Error al cargar los registros:', error);
        }
      });
    } else {
      console.warn("No se encontró un ID válido para obtener los movimientos.");
    }

  }

  closeRegistrosModal(): void {
    this.showRegistrosModal = false;
  }

   // Escucha clics en cualquier lugar de la pantalla
   @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent) {
     const clickedInside = (event.target as HTMLElement).closest('.contenedor-familiares');
     if (!clickedInside) {
       this.selectedFamiliarIndex = null; // Deselecciona si se hace clic fuera
     }
   }


   calcularInvitadosDentro(): Observable<number> {
     return this.sociosService.getTodosMovimientos().pipe(
       map((movimientos: Movimiento[]) => {
         let totalEntradas = 0;
         let totalSalidas = 0;

         movimientos.forEach((mov) => {
           if (mov.tipomov === 'e') {
             console.log("Total entradas", totalEntradas);
             totalEntradas += mov.invitados;
           } else if (mov.tipomov === 's') {
             totalSalidas += mov.invitados;
           }
         });

         const totalDentro = totalEntradas - totalSalidas;
         console.log('👥 Total de invitados dentro:', totalDentro);
         return totalDentro;
       }),
       catchError((err) => {
         console.error('❌ Error al calcular los invitados dentro:', err);
         return of(0); // En caso de error, devolvemos 0
       })
     );
   }

   getArray(cantidad: number): number[] {
    return cantidad > 0 ? Array(cantidad).fill(0) : [];
  }
   logout() {
    localStorage.removeItem('userToken');  // Eliminar el token
    this.esUsuario = false;  // Cambiar el estado a no autenticado
    alert('Sesión cerrada');
    this.router.navigate(['/inicio']);
  }


}
