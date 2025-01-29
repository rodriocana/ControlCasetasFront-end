import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { SociosService, Socio } from '../services/socios.service';

@Component({
  selector: 'app-entrada',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css']
})
export class EntradaComponent implements OnInit {


  private codeReader: BrowserMultiFormatReader;
  public scanResult: string = '';
  public scannedCode: string = ''; // Código escaneado
  public socio: Socio | null = null; // Datos del socio si se encuentra en la base de datos
  // public movimiento: Movimiento | null = null; // Datos del último movimiento
  public invitaciones: number = 0;  // Número de invitaciones para el label de html, empezamos en 0
  public idsocio: string = ''; // Nueva variable para almacenar el número de tarjeta
  public nombreInvitado:string= ''; // Nombre del invitado o del familiar
  public invitacionesIniciales = this.invitaciones;
  @ViewChild('barcodeInput', { static: false }) barcodeInput!: ElementRef;
  public horaEntrada:number = 0; // Hora de entrada


  constructor(private router: Router, private sociosService: SociosService) {
    this.codeReader = new BrowserMultiFormatReader();
  }
  ngOnInit(): void {

  }


  ngAfterViewInit(): void {
    this.setFocusToBarcodeInput();
  }


  private setFocusToBarcodeInput(): void {
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.focus();
    }
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

  // aqui es cuando se acepta el tick verde
  aceptarEntrada() {
    const horaEntrada = this.obtenerHoraYMinutos();
    console.log('Hora de entrada:', horaEntrada);

    if (!this.socio) {
      console.error('No se ha encontrado un socio válido.');
      return;
    }

    // Verificar que el socio tenga suficientes invitaciones
    if (this.socio.invitaciones < this.invitaciones) {
      alert('No tienes suficientes invitaciones disponibles.');
      return;
    }

    // Registrar el movimiento en la base de datos
    const movimiento = {
      id_socio: this.socio.idsocio,
      id_familiar: null, // Si es un familiar, debes obtener su ID
      fecha_hora: new Date().toISOString(), // Fecha y hora actual
      tipo_movimiento: 'entrada',
      codigo_barras: this.idsocio,
      invitaciones: this.socio.invitaciones,
      invitaciones_gastadas: this.invitaciones,
      invitaciones_restantes: this.socio.invitaciones - this.invitaciones
    };

    this.sociosService.registrarMovimiento(movimiento).subscribe({
      next: (response) => {
        console.log('Movimiento registrado:', response);
      },
      error: (err) => {
        console.error('Error al registrar el movimiento:', err);
      }
    });

    // this.sociosService.getMovimientos(this.socio.idsocio).subscribe({
    //   next: (response) => {
    //     console.log('Movimiento registrado:', response);
    //   },
    //   error: (err) => {
    //     console.error('Error al registrar el movimiento:', err);
    //   }
    // });



    // AQUI SE MUESTRAN LOS DATOS DEL ULTIMO MOVIMIENTO COGIENDOLOS DE LA BASE DE DATOS.
    this.socio.invitaciones = movimiento.invitaciones_restantes
    this.invitaciones = 0;
    this.horaEntrada = new Date(movimiento.fecha_hora).getTime();
    console.log("las invitaciones que hay son " + this.invitaciones)

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
    const idsocio = inputElement.value.trim(); // Elimina espacios antes y después del valor

    if (idsocio) {
      this.idsocio = idsocio; // Actualiza el valor de la tarjeta
      this.searchUserByCardNumber(idsocio); // Busca el usuario en la base de datos
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
