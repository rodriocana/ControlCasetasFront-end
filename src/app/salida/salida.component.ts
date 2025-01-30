import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { SociosService, Socio, Movimiento } from '../services/socios.service';

@Component({
  selector: 'app-salida',
  standalone: true, // Asegúrate de que el componente sea standalone
  imports: [FormsModule, CommonModule],
  templateUrl: './salida.component.html',
  styleUrls: ['./salida.component.css']
})
export class SalidaComponent {
  private codeReader: BrowserMultiFormatReader;
  public scanResult: string = '';
  public scannedCode: string = ''; // Código escaneado
  public socio: Socio | null = null; // Datos del socio si se encuentra en la base de datos
  public movimiento: Movimiento | null = null; // Datos del último movimiento
  public nombreInvitado: string = ''; // Nombre del invitado
  public idsocio: string = ''; // Nueva variable para almacenar el socioId
  public horaSalida: string = ''; // Hora de salida
  public invitaciones: number = 0;  // Número de invitaciones que entran con el socio jefe para el label de html, empezamos en 0
  public invRestantes: number = 0; // Maximo de invitados que puede meter un socio,
  public invTotal: number = 0; // MNumero maximo de invitados que puede meter entre socios y familiares.
  public invTotMov: number = 0; // Numero total de invitados existentes en la tabla movimiento (suma total del campo invitados)




  constructor(private router: Router, private sociosService: SociosService) {
    this.codeReader = new BrowserMultiFormatReader();
  }

  // Sumar invitaciones (no se usa en la salida, pero lo dejamos por consistencia)
  sumarInvitacion() {
    this.invitaciones++;
  }

  // Restar invitaciones (no se usa en la salida, pero lo dejamos por consistencia)
  restarInvitacion() {
    if (this.invitaciones > 0) {
      this.invitaciones--;
    }
  }

  // Aceptar la salida y registrar el movimiento
  aceptarSalida() {
    const horaSalida = this.obtenerHoraYMinutos();
    console.log('Hora de salida:', horaSalida);

    if (!this.socio) {
      console.error('No se ha encontrado un socio válido.');
      return;
    }

    // Registrar el movimiento de salida en la base de datos
    const movimiento = {
      idsocio: this.socio.idsocio,
      fecha_hora: new Date().toISOString(), // Fecha y hora actual
      tipomov: 'entrada',
      invitados: this.invitaciones,  // verificar esto para ver la suma y resta de invitaciones
    };

    this.sociosService.registrarMovimiento(movimiento).subscribe({
      next: (response) => {
        console.log('Movimiento de salida registrado:', response);
        alert('Salida registrada correctamente');
        this.limpiarFormulario(); // Limpiar el formulario después de registrar la salida
      },
      error: (err) => {
        console.error('Error al registrar la salida:', err);
        alert('Error al registrar la salida');
      }
    });
  }

  // Navegar a la página de inicio
  navigateTo() {
    this.router.navigate(['inicio']);
  }

  // Buscar socio en la base de datos por número de tarjeta
  searchUserIdSocio(cardNumber: string): void {
    if (cardNumber) {
      this.sociosService.getSocioByIdSocio(cardNumber).subscribe({
        next: (data: any) => {
          this.socio = data;
          if (!this.socio) {
            console.log('Socio no encontrado');
          } else {
            console.log('Socio encontrado:', this.socio);
            this.nombreInvitado = this.socio.nombre + ' ' + this.socio.apellido;
            this.invTotal = this.socio.invitaciones;
           }
        },
        error: (err: any) => {
          alert('El socio no se encuentra en la base de datos.');
          console.error('Error al buscar el socio:', err);
        }
      });

      this.sociosService.getMovimientos(cardNumber).subscribe({
        next: (data: any) => {
          this.movimiento = data;
          if (!this.movimiento) {
            console.log('Movimiento no encontrado');
            this.invRestantes = this.invTotal;
          } else {
            console.log('Movimiento encontrado eee:', this.movimiento);

            // PARA RECORRER LOS REGISTROS DE MOVIMIENTO
            let valores = Object.values(this.movimiento);
            console.log(valores.length);
            for(let i=0; i< valores.length; i++){
              this.invTotMov = this.invTotMov + valores[i].invitados;
              console.log("valores" + valores[i]);
            }

            console.log("invitaciones total del familiar " + this.invTotal)
            console.log("invitaciones suma total de movimientos (las que ha gastado):" + this.invTotMov);
           this.invRestantes = this.invTotal - this.invTotMov;
           console.log("invitaciones recuperables " + this.invRestantes)
           }
        },
        error: (err: any) => {
          alert('El socio no se encuentra en la base de datos.');
          console.error('Error al buscar el socio:', err);
        }
      });
    } else {
      console.log('El número de tarjeta no es válido.');
    }

  }

 // Evento al escanear un código además de donde se guarda en el label de html
 onCodeScanned(event: Event): void {
  const inputElement = event.target as HTMLInputElement;
  const idsocio = inputElement.value.trim(); // Elimina espacios antes y después del valor

  if (idsocio) {
    this.idsocio = idsocio; // Actualiza el valor de la tarjeta
    this.searchUserIdSocio(idsocio); // Busca el usuario en la base de datos
  } else {
    console.log('El código escaneado es inválido.');
  }
}


  // Obtener la hora actual en formato HH:mm
  obtenerHoraYMinutos() {
    const fechaActual = new Date();
    const horas = fechaActual.getHours();
    const minutos = fechaActual.getMinutes();
    return `${horas}:${minutos < 10 ? '0' + minutos : minutos}`; // Formato HH:mm
  }

  // Limpiar el formulario después de registrar la salida
  limpiarFormulario() {
    this.socio = null;
    this.nombreInvitado = '';
    this.invitaciones = 0;
  }
}
