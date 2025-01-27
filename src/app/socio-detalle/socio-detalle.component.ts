import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Familiar, SociosService } from '../services/socios.service';
import { Socio } from '../services/socios.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-socio-detalle',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './socio-detalle.component.html',
  styleUrls: ['./socio-detalle.component.css']


})


export class SocioDetalleComponent implements OnInit {
// Método para cerrar el modal


socio: Socio | undefined;
familiares: Familiar[] = [];
selectedFamiliarIndex: number | null = null;
editForm: FormGroup; // Formulario reactivo para editar invitado
showEditModal = false; // Controla la visibilidad del modal
isEditMode = false; // Identifica si estamos en modo de edición
showAddFamiliarModal = false;
addFamiliarForm: FormGroup;


constructor(
  private route: ActivatedRoute,
  private sociosService: SociosService,
  private fb: FormBuilder,
  private router: Router
) {

  // Configuración del formulario reactivo para editar invitado y familiares
  this.editForm = this.fb.group({
    id_socio: [{ value: '', disabled: true }],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apellido: ['', Validators.required],
    telefono: ['', Validators.required],
    domicilio: ['', Validators.required],
    invitaciones: ['', [Validators.required, Validators.min(0)]],
    NumTar: ['', Validators.required],
  });

  this.addFamiliarForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
  });
}


ngOnInit(): void {

  // Verificar si el token está presente
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    this.router.navigate(['/inicio']); // Redirigir al inicio si no está autenticado
  }

  this.cargarInvitados();

}

// Método para abrir el modal y cargar los datos del invitado
editarInvitado(): void {
  if (this.socio) {
    this.isEditMode = true;
    this.showEditModal = true;

    // Rellenar el formulario con los datos del socio
    this.editForm.patchValue({
      id_socio: this.socio.id_socio,
      nombre: this.socio.nombre,
      apellido: this.socio.apellido,
      telefono: this.socio.telefono,
      domicilio: this.socio.domicilio,
      invitaciones: this.socio.invitaciones,
      NumTar: this.socio.NumTar,
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
}

addFamiliar() {
  this.showAddFamiliarModal = true;
}

saveFamiliar(): void {
  if (this.addFamiliarForm.valid && this.socio) {
    const nuevoFamiliar = this.addFamiliarForm.value;
    console.log('Nuevo familiar:', nuevoFamiliar, this.socio.id_socio);

    // Asegúrate de que no se envíe el campo NumTar si está presente
    delete nuevoFamiliar.NumTar;

    // Ahora el objeto 'nuevoFamiliar' no tendrá el campo NumTar
    this.sociosService.addFamiliar(this.socio.id_socio, nuevoFamiliar).subscribe({
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
  console.log("id socio", this.socio?.id_socio);

  if (this.socio) {
    if (confirm('¿Estás seguro de que deseas eliminar este socio?')) {
      this.sociosService.eliminarSocio(this.socio.id_socio).subscribe({
        next: () => {
          console.log(`Socio con ID ${this.socio?.id_socio} eliminado correctamente.`);
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


eliminarFamiliar(): void {
  if (this.selectedFamiliarIndex !== null) {
    const familiarId = this.familiares[this.selectedFamiliarIndex].id_familiar;

    if (confirm('¿Estás seguro de que deseas eliminar este familiar?')) {
      this.sociosService.eliminarFamiliar(familiarId).subscribe({
        next: () => {
          console.log(`Familiar con ID ${familiarId} eliminado correctamente.`);

          // Remover el familiar de la lista local
          this.familiares.splice(this.selectedFamiliarIndex!, 1);
          this.selectedFamiliarIndex = null;
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

  cargarInvitados(){
    const id = this.route.snapshot.paramMap.get('id');  // aqui recojo el id de la ruta de la api
    console.log(id);

    if (id) {
      // Obtener datos del socio
      this.sociosService.getSocioById(+id).subscribe((socio) => {
        this.socio = socio;
        console.log(this.socio);
      });

      // Obtener datos de los familiares
      this.sociosService.getFamiliares(+id).subscribe((familiares) => {
        this.familiares = familiares;
        console.log(this.familiares);
      });
    }

  }

   // Escucha clics en cualquier lugar de la pantalla
   @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent) {
     const clickedInside = (event.target as HTMLElement).closest('.contenedor-familiares');
     if (!clickedInside) {
       this.selectedFamiliarIndex = null; // Deselecciona si se hace clic fuera
     }
   }
}
