import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { SociosService, Socio } from '../services/socios.service';

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
  public invitaciones: number = 0; // Número de invitaciones (no se usa en la salida, pero lo dejamos por consistencia)
  public numeroTarjeta: string = ''; // Número de tarjeta escaneado
  public nombreInvitado: string = ''; // Nombre del invitado
  public horaSalida: string = ''; // Hora de salida
  public invitacionesIniciales = this.invitaciones;




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
      id_socio: this.socio.idsocio,
      id_familiar: null, // Si es un familiar, debes obtener su ID
      fecha_hora: new Date().toISOString(), // Fecha y hora actual
      tipo_movimiento: 'salida', // Tipo de movimiento: salida
      codigo_barras: this.numeroTarjeta,
      invitaciones: this.socio.invitaciones,  // invitaciones INICIALES
      invitaciones_gastadas: this.invitaciones,
      invitaciones_restantes: this.socio.invitaciones + this.invitaciones

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
  searchUserByCardNumber(cardNumber: string): void {
    if (cardNumber) {
      this.sociosService.getSocioByNumTar(cardNumber).subscribe({
        next: (data: any) => {
          this.socio = data;
          if (!this.socio) {
            console.log('Socio no encontrado');
          } else {
            console.log('Socio encontrado:', this.socio);
            this.nombreInvitado = this.socio.nombre + ' ' + this.socio.apellido;
          }
        },
        error: (err: any) => {
          console.error('Error al buscar el socio:', err);
        }
      });
    } else {
      console.log('El número de tarjeta no es válido.');
    }
  }

  // Evento al escanear un código
  onCodeScanned(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const cardNumber = inputElement.value.trim(); // Elimina espacios antes y después del valor

    if (cardNumber) {
      this.numeroTarjeta = cardNumber; // Actualiza el valor de la tarjeta
      this.searchUserByCardNumber(cardNumber); // Busca el usuario en la base de datos
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
    this.numeroTarjeta = '';
    this.nombreInvitado = '';
    this.invitaciones = 0;
  }
}
