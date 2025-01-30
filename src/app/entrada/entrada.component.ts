import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { SociosService, Socio, Movimiento } from '../services/socios.service';

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
  public movimiento: Movimiento | null = null; // Datos del último movimiento
  public invitaciones: number = 0;  // Número de invitaciones que entran con el socio jefe para el label de html, empezamos en 0
  public invRestantes: number = 0; // Maximo de invitados que puede meter un socio,
  public invTotal: number = 0; // MNumero maximo de invitados que puede meter entre socios y familiares.
  public invTotMov: number = 0; // Numero total de invitados existentes en la tabla movimiento (suma total del campo invitados)
  public idsocio: string = ''; // Nueva variable para almacenar el socioId
  public nombreInvitado:string= ''; // Nombre del invitado o del familiar
  @ViewChild('barcodeInput', { static: false }) barcodeInput!: ElementRef;
  public horaEntrada:number = 0; // Hora de entrada
  mostrarAlerta: boolean = false;
  mensajeAlerta: string = '';



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

    // Registrar el movimiento en la base de datos
    const movimiento = {
      idsocio: this.socio.idsocio,
      fecha_hora: new Date().toISOString(), // Fecha y hora actual
      tipomov: 'entrada',
      invitados: this.invitaciones,  // verificar esto para ver la suma y resta de invitaciones
    };

    this.sociosService.registrarMovimiento(movimiento).subscribe({
      next: (response) => {
        console.log('Movimiento registrado:', response);
      },
      error: (err) => {
        console.error('Error al registrar el movimiento:', err);
      }
    });

    this.sociosService.getMovimientos(this.socio.idsocio).subscribe({
      next: (response) => {
        console.log('Movimiento registrado:', response);
      },
      error: (err) => {
        console.error('Error al registrar el movimiento:', err);
      }
    });


     // Mostrar alerta con animación
  this.mensajeAlerta = '✅ Entrada Correcta';
  this.mostrarAlerta = true;

  // Mostrar el mensaje por 2 segundos
  this.mostrarAlerta = true;
  setTimeout(() => {
    this.mostrarAlerta = false;
    this.navigateTo();
  }, 1000);

  }

  // Navegar a la página de inicio
  navigateTo() {
    this.router.navigate(['inicio']);
  }

  searchUserIdSocio(cardNumber: string): void {
    if (!cardNumber) {
      console.log('El número de tarjeta no es válido.');
      return;
    }

    this.sociosService.getSocioByIdSocio(cardNumber).subscribe({
      next: (data: any) => {
        if (data) {
          this.setSocioData(data);
        } else {
          this.searchFamiliarIdSocio(cardNumber);  // aqui buscamos al familiar si no encontramos al socio llamando a la funcion
        }
      },
      error: (err: any) => {
        console.error('Error al buscar el socio:', err);
        this.searchFamiliarIdSocio(cardNumber);
      }
    });
  }

  // Buscar en la tabla de familiares
  searchFamiliarIdSocio(cardNumber: string): void {
    this.sociosService.getFamiliarByIdSocio(cardNumber).subscribe({
      next: (data: any) => {
        if (data) {
          this.setSocioData(data);
        } else {
          console.log('Familiar no encontrado');
          alert('El socio o familiar no se encuentra en la base de datos.');
        }
      },
      error: (err: any) => {
        console.error('Error al buscar el familiar:', err);
        alert('El socio o familiar no se encuentra en la base de datos.');
      }
    });
  }

  // Establece los datos del socio/familiar y busca movimientos
  setSocioData(data: any): void {
    this.socio = data;
    console.log('Usuario encontrado:', this.socio);

    if (this.socio) {
      this.nombreInvitado = this.socio.nombre + ' ' + this.socio.apellido;
    }
    if (this.socio) {
      this.invTotal = this.socio.invitaciones;

      // Buscar movimientos del usuario
      this.getMovimientos(this.socio.idsocio);
    }
  }

  // Obtener los movimientos y calcular invitaciones restantes
  getMovimientos(cardNumber: string): void {
    this.sociosService.getMovimientos(cardNumber).subscribe({
      next: (data: any) => {
        this.movimiento = data;
        this.invTotMov = 0; // Resetear acumulador

        if (this.movimiento && Object.keys(this.movimiento).length > 0) {
          console.log('Movimientos encontrados:', this.movimiento);

          // Recorrer los registros de movimientos y sumar invitaciones usadas
          Object.values(this.movimiento).forEach((mov: any) => {
            this.invTotMov += mov.invitados;
          });

          console.log('Total de invitaciones usadas:', this.invTotMov);
        } else {
          console.log('No hay movimientos registrados.');
        }

        // Calcular invitaciones restantes
        this.invRestantes = this.invTotal - this.invTotMov;
        console.log('Invitaciones restantes:', this.invRestantes);
      },
      error: (err: any) => {
        console.error('Error al buscar los movimientos:', err);
        alert('No se pudieron obtener los movimientos.');
      }
    });
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

iniciarVariables(){

  this.invitaciones  = 0;
  this.invTotMov = 0;
  this.invTotal = 0;
  this.invRestantes = 0;
}


}
