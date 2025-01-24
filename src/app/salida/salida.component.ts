import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { SociosService, Socio } from '../services/socios.service';

@Component({
  selector: 'app-salida',
  imports: [FormsModule, CommonModule],
  templateUrl: './salida.component.html',
  styleUrl: './salida.component.css'
})
export class SalidaComponent {


  private codeReader: BrowserMultiFormatReader;
  public scanResult: string = '';
  public scannedCode: string = ''; // Código escaneado
  public socio: Socio | null = null; // Datos del socio si se encuentra en la base de datos
  public invitaciones: number = 0;
  public numeroTarjeta: string = ''; // Nueva variable para almacenar el número de tarjeta
  public nombreInvitado:string= ''; // Nombre del invitado
  public horaSalida:number = 0; // Hora de entrada


  constructor(private router: Router, private sociosService: SociosService) {
    this.codeReader = new BrowserMultiFormatReader();
  }

  // Sumar invitaciones
  sumarInvitacion() {
    this.invitaciones++;
  }

  // Restar invitaciones
  restarInvitacion() {
    if (this.invitaciones > 0) {
      this.invitaciones--;
    }
  }

  aceptarSalida() {
    const horaSalida = this.obtenerHoraYMinutos();
    console.log('Hora de salida:', horaSalida);
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

  // Evento al escanear un código además de donde se guarda en el label de html
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

  // Iniciar el escaneo con cámara (opcional, comentado en tu ejemplo)
  // startScanning(): void {
  //   this.codeReader
  //     .listVideoInputDevices()
  //     .then(videoInputDevices => {
  //       if (videoInputDevices.length > 0) {
  //         const selectedDeviceId = videoInputDevices[0].deviceId; // Selecciona la primera cámara disponible
  //         this.codeReader.decodeFromVideoDevice(
  //           selectedDeviceId,
  //           'video', // ID del elemento video en el HTML
  //           (result, error) => {
  //             if (result) {
  //               this.scanResult = result.getText(); // Guarda el resultado del escaneo
  //             }
  //             if (error) {
  //               console.error('Error:', error.message || error);
  //             }
  //           }
  //         );
  //       } else {
  //         console.error('No se encontraron cámaras disponibles.');
  //       }
  //     })
  //     .catch(err => {
  //       console.error('Error al listar dispositivos de entrada:', err);
  //     });
  // }

  // Detener el escaneo con cámara
  stopScanning(): void {
    this.codeReader.reset(); // Detiene la cámara y limpia el escáner
  }

  obtenerHoraYMinutos() {
    const fechaActual = new Date();
    const horas = fechaActual.getHours();
    const minutos = fechaActual.getMinutes();
    return `${horas}:${minutos < 10 ? '0' + minutos : minutos}`; // Formato HH:mm
}

}
