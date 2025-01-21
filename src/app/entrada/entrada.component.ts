import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';

@Component({
  selector: 'app-entrada',
  imports: [FormsModule, CommonModule],
  templateUrl: './entrada.component.html',
  styleUrl: './entrada.component.css'
})
export class EntradaComponent {

  private codeReader: BrowserMultiFormatReader;
  public scanResult: string = '';

  constructor(private router: Router) {
    this.codeReader = new BrowserMultiFormatReader();
  }


  invitaciones: number = 0;

sumarInvitacion() {
  this.invitaciones++;


}

restarInvitacion() {
  if (this.invitaciones > 0) {
    this.invitaciones--;
  }
}

navigateTo() {
  this.router.navigate(['inicio']);
  }

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


  stopScanning(): void {
    this.codeReader.reset(); // Detiene la cámara y limpia el escáner
  }

}
