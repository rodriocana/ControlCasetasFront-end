import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { SociosService, Socio, Movimiento, Familiar } from '../services/socios.service';
import { catchError, map, Observable, of } from 'rxjs';

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
   public familiar: Familiar | null = null;
   public movimiento: Movimiento | null = null; // Datos del último movimiento
   public invitaciones: number = 0;  // Número de invitaciones que entran con el socio jefe para el label de html, empezamos en 0
   public invRestantes: number = 0; // Maximo de invitados que puede meter un socio,
   public invTotal: number = 0; // MNumero maximo de invitados que puede meter entre socios y familiares.
   public invTotalFamiliar: number = 0;  // numero maximo de invitados que puede meter el familiar.
   public invTotMov: number = 0; // Numero total de invitados existentes en la tabla movimiento (suma total del campo invitados)
   public invTotMovFam: number = 0; // numero total de invitados en la tabla de movimientos que corresponden con el familiar.
   public idsocio: string = ''; // Nueva variable para almacenar el socioId
   public nombreInvitado:string= ''; // Nombre del invitado o del familiar
   @ViewChild('barcodeInput', { static: false }) barcodeInput!: ElementRef;
   public horaEntrada:number = 0; // Hora de entrada
   mostrarAlerta: boolean = false;
   mensajeAlerta: string = '';
  invitadosInside: number = 0;



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
   aceptarSalida() {
    const horaEntrada = this.obtenerHoraYMinutos();
    console.log('Hora de entrada:', horaEntrada);

    if (!this.socio) {
        console.error('No se ha encontrado un socio válido.');
        return;
    }

    // Registrar el movimiento de salida
    const movimiento = {
        idsocio: this.idsocio,
        fecha_hora: new Date().toISOString(), // Fecha y hora actual
        tipomov: 'salida',
        invitados: this.invitaciones,  // Verificar esto para la suma y resta de invitaciones
    };

    this.sociosService.registrarMovimiento(movimiento).subscribe({
        next: (response) => {
            console.log('Movimiento registrado:', response);

            // ⚡️ Actualizar las invitaciones restantes tras la salida   // QUIZAS SIRVA O QUIZAS NO
            // this.actualizarInvitacionesRestantes();
        },
        error: (err) => {
            console.error('Error al registrar el movimiento:', err);
        }
    });

    // Mostrar alerta de salida
    this.mensajeAlerta = '✅ Salida registrada';
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
           if (cardNumber.length > 4) {
             this.searchFamiliarIdSocio(cardNumber);
           }

           // AQUI LLAMAMOS AL SERVICIO DONDE NOS DEVUELVE EL TOTAL DE LA SUMA DE MOVIMIENTOS POR CADA FAMILIAR O SOCIO, Y ESE NUMERO ES EL QUE SE DEVUELVE EN
           // ENTRADAS.  // deberia funcionar, hay que comprobarlo.
           this.sociosService.getMovimientosByFamiliar(cardNumber).subscribe(response => {
            console.log("Respuesta completa:", response);

            // Verificar si la propiedad existe antes de asignarla
            if (response && response.invitadosDentro !== undefined) {
              this.invitadosInside = response.invitadosDentro;
              console.log("Nuevo valor de invitadosInside:", this.invitadosInside);
            } else {
              console.log("La respuesta no tiene invitadosDentro, asignando 0");
              this.invitadosInside = 0;
            }
          });

         } else {
           console.log("No existe socio");
         }
       },
       error: (err: any) => {
         console.error('Error al buscar el socio:', err);
       }
     });
   }

   // Buscar en la tabla de familiares
   searchFamiliarIdSocio(cardNumber: string): void {
     this.sociosService.getFamiliarByIdSocio(cardNumber).subscribe({
       next: (data: any) => {
         if (data) {
           this.setFamiliarData(data);
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
       this.invTotal = this.socio.invitaciones;
     }
   }
   setFamiliarData(data: any): void {
     this.familiar = data;

     if (this.familiar) {
       this.nombreInvitado = this.familiar.nombre + ' ' + this.familiar.apellido;
       this.invTotalFamiliar = this.familiar.invitaciones;
       // Buscar movimientos del usuario
      //  this.getMovimientos(this.familiar.idsocio);
     }
 }


 // QUIZAS SIRVA O QUIZAS NO

//  getMovimientos(cardNumber: string): Observable<{ totalInvitaciones: number, totalInvitacionesFam: number, totalInvitacionesRestantes: number }> {
//    // console.log("idsocio al principio de getMovimiento:", cardNumber);

//    return this.sociosService.getMovimientos(cardNumber).pipe(
//      map((data: any) => {
//        this.movimiento = data;
//        this.invTotMov = 0;  // Resetear acumulador socio
//        this.invTotMovFam = 0;  // Resetear acumulador familiar

//        console.log("PASO 2. Movimientos recibidos en getMovimientos, SI ENTRAMOS EN FAMILIAR SACA TODOS LOS MOV DE SOCIOS Y FAM:", this.movimiento);

//        // Filtrar y procesar los movimientos
//        if (this.movimiento && Object.keys(this.movimiento).length > 0) {
//          Object.values(this.movimiento)
//            .forEach((mov: any) => {

//              if (mov.tipomov == 'e') {
//                if (mov.idsocio.length > 4 && this.idsocio == mov.idsocio) {

//                  this.invTotMovFam += mov.invitados;
//                }
//                this.invTotMov += mov.invitados
//              } else {
//                if (mov.idsocio.length > 4 && this.idsocio == mov.idsocio) {
//                  this.invTotMovFam -= mov.invitados;
//                }
//                this.invTotMov -= mov.invitados;
//              }
//            });


//          console.log("PASO 3 - despues de haber accedido al array de todos los movimientos, hacemos los calculos y nos da el total de todos los mov, y el total de los mov fam")
//          console.log(' PASO 3 - Total de invitaciones familiares usadas:', this.invTotMovFam);
//          console.log(' PASO 3 - Total de invitaciones usadas en todos los mov:', this.invTotMov);
//          console.log(' PASO 3 - Total de invitaciones restantes finales', this.invRestantes);

//          return {
//            totalInvitaciones: this.invTotMov,
//            totalInvitacionesFam: this.invTotMovFam,
//            totalInvitacionesRestantes: this.invRestantes
//          };
//        } else {
//          console.log('No hay movimientos registrados.');
//          return {
//            totalInvitaciones: 0,
//            totalInvitacionesFam: 0,
//            totalInvitacionesRestantes: 0
//          };  // Devolvemos 0 en ambos casos si no hay movimientos
//        }
//      }),
//      catchError((err) => {
//        console.error('Error al buscar los movimientos:', err);
//        alert('No se pudieron obtener los movimientos.');
//        return of({ totalInvitaciones: 0, totalInvitacionesFam: 0, totalInvitacionesRestantes: 0 });  // Devolvemos un objeto con 0 en ambos casos en caso de error
//      })
//    );
//  }

   // Evento al escanear un código además de donde se guarda en el label de html
   onCodeScanned(event: Event): void {
     const inputElement = event.target as HTMLInputElement;
     this.idsocio = inputElement.value.trim(); // Elimina espacios antes y después del valor

     if (this.idsocio) {
       this.idsocio = this.idsocio; // Actualiza el valor de la tarjeta
       this.searchUserIdSocio(this.idsocio); // Busca el usuario en la base de datos
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

 // QUIZAS SIRVA O QUIZAS NO

//  actualizarInvitacionesRestantes() {
//   this.getMovimientos(this.idsocio).subscribe(({ totalInvitaciones, totalInvitacionesFam, totalInvitacionesRestantes }) => {
//       this.invTotMov = totalInvitaciones;   // Total de movimientos del socio (todas las invitaciones usadas)
//       this.invTotMovFam = totalInvitacionesFam;  // Total de movimientos del familiar

//       // ⚡ FIX: Si todas las invitaciones están libres, asegurarse de que `invTotMov` sea 0
//       if (this.invTotMov >= this.invTotal) {
//           this.invTotMov = 0;
//       }

//       if (this.idsocio.length <= 4) { // Es un socio principal
//           this.invRestantes = this.invTotal - this.invTotMov;
//       } else { // Es un familiar
//           this.invRestantes = Math.min(
//               this.invTotalFamiliar - this.invTotMovFam,  // Máximo que puede usar el familiar
//               this.invTotal - this.invTotMov  // Lo que realmente queda del socio principal
//           );

//           // ⚡ FIX: Si no ha usado invitaciones antes, darle todo su límite
//           if (this.invTotMovFam === 0) {
//               this.invRestantes = Math.min(this.invTotalFamiliar, this.invTotal - this.invTotMov);
//           }
//       }

//       console.log('🔄 Invitaciones restantes actualizadas:', this.invRestantes);
//       console.log('🎯 Invitaciones usadas después de recalcular:', this.invTotMov);
//   });
// }


 }
