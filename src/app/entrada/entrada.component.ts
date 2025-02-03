import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { SociosService, Socio, Movimiento, Familiar } from '../services/socios.service';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';

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
  public familiar: Familiar | null = null;
  public movimiento: Movimiento | null = null; // Datos del último movimiento
  public invitaciones: number = 0;  // Número de invitaciones que entran con el socio jefe para el label de html, empezamos en 0
  public invRestantes: number = 0; // Maximo de invitados que puede meter un socio,
  public invTotal: number = 0; // MNumero maximo de invitados que puede meter entre socios y familiares.
  public invTotalFamiliar: number = 0;  // numero maximo de invitados que puede meter el familiar.
  public invTotMov: number = 0; // Numero total de invitados existentes en la tabla movimiento (suma total del campo invitados)
  public invTotMovFam: number = 0; // numero total de invitados en la tabla de movimientos que corresponden con el familiar.
  public Aforo:number = 0;
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
    // Realizas la suscripción a calcularInvitadosDentro()
    this.calcularInvitadosDentro().subscribe((total) => {
      console.log('🔢 Invitados dentro:', total);
      // Asignas el valor total al atributo Aforo
      this.Aforo = total;
    });
  }

  ngAfterViewInit(): void {
    this.setFocusToBarcodeInput();
  }


  private setFocusToBarcodeInput(): void {
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.focus();
    }
  }

    // Función para convertir la fecha y la hora a la zona horaria local
    private convertirFechaLocal(utcFecha: string): { fecha: string, hora: string } {
      const date = new Date(utcFecha);

      // Formato de la fecha en local (por ejemplo: "2025-02-03")
      const fechaLocal = date.toLocaleDateString('es-ES');

      // Formato de la hora en local (por ejemplo: "14:00")
      const horaLocal = date.toLocaleTimeString('es-ES', { hour12: false });

      return { fecha: fechaLocal, hora: horaLocal };
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

    const { fecha, hora } = this.convertirFechaLocal(new Date().toISOString());

    // Registrar el movimiento en la base de datos
    const movimiento = {
      idsocio: this.idsocio,
      fecha_hora: `${fecha} ${hora}`, // Usamos la fecha y hora convertidas
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
          if (cardNumber.length > 4) {
            this.searchFamiliarIdSocio(cardNumber);
          }

          //  Llamamos a getMovimientos() solo una vez
          this.getMovimientos(cardNumber).subscribe(({ totalInvitaciones, totalInvitacionesFam, totalInvitacionesRestantes }) => {

            this.invTotMovFam = totalInvitacionesFam;
            this.invTotMov = totalInvitaciones;

              if(this.invTotal != this.invTotMov){

                if (this.idsocio.length <= 4) {
                  // console.log("invitaciones totales movimiento " + totalInvitaciones);
                  this.invRestantes = this.invTotal - this.invTotMov;
                } else {

                  if (this.invTotalFamiliar - this.invTotMovFam > 0) {
                    console.log('A');
                    // Calculamos el mínimo entre lo que el familiar tiene disponible y lo que realmente queda del socio,
                    // la diferencia entre 2 restas primero la resta del total del familiar menos su total de movimientos, y luego el total del socio
                    // menos el total de la suma de los movimientos
                    this.invRestantes = Math.min(this.invTotalFamiliar - this.invTotMovFam, this.invTotal - this.invTotMov);
                  } else {
                    console.log('B');
                    this.invRestantes = 0;
                  }
                }
             } else {
                 this.invRestantes = 0;
              }

            console.log('invitaciones total de cada familiar individual FINAL:', this.invTotalFamiliar);
            console.log('Invitaciones total  de la suma de los movimientos por cada familiar invtotmovfam: ' + this.invTotMovFam)
            console.log('invitaciones total en movimientos:', this.invTotMov);
            console.log('invitaciones TOTALES del socio padre ' + this.invTotal)
            console.log('Invitaciones restantes:', this.invRestantes);


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
        this.nombreInvitado = "";
        alert('El familiar no se encuentra en la base de datos.');

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
      this.getMovimientos(this.familiar.idsocio);
    }
}

getMovimientos(cardNumber: string): Observable<{ totalInvitaciones: number, totalInvitacionesFam: number, totalInvitacionesRestantes: number }> {
  // console.log("idsocio al principio de getMovimiento:", cardNumber);

  return this.sociosService.getMovimientos(cardNumber).pipe(
    map((data: any) => {
      this.movimiento = data;
      this.invTotMov = 0;  // Resetear acumulador socio
      this.invTotMovFam = 0;  // Resetear acumulador familiar

      console.log("PASO 2. Movimientos recibidos en getMovimientos, SI ENTRAMOS EN FAMILIAR SACA TODOS LOS MOV DE SOCIOS Y FAM:", this.movimiento);

      // Filtrar y procesar los movimientos
      if (this.movimiento && Object.keys(this.movimiento).length > 0) {
        Object.values(this.movimiento)
          .forEach((mov: any) => {

            // SI MOVIMIENTO ES ENTRADA Y ADEMÁS EL IDSOCIO ES MAYOR QUE 0000 Y EL IDSOCIO ES IGUAL AL IDSOCIO DEL REGISTRO, ES FAMILIAR.
            if (mov.tipomov == 'e') {
              if (mov.idsocio.length > 4 && this.idsocio == mov.idsocio) {

                this.invTotMovFam += mov.invitados;
              }
              this.invTotMov += mov.invitados
            } else {
              if (mov.idsocio.length > 4 && this.idsocio == mov.idsocio) {
                this.invTotMovFam -= mov.invitados;
              }
              this.invTotMov -= mov.invitados;
            }
          });


        console.log("PASO 3 - despues de haber accedido al array de todos los movimientos, hacemos los calculos y nos da el total de todos los mov, y el total de los mov fam")
        console.log(' PASO 3 - Total de invitaciones familiares usadas:', this.invTotMovFam);
        console.log(' PASO 3 - Total de invitaciones usadas en todos los mov:', this.invTotMov);
        console.log(' PASO 3 - Total de invitaciones restantes finales', this.invRestantes);

        return {
          totalInvitaciones: this.invTotMov,
          totalInvitacionesFam: this.invTotMovFam,
          totalInvitacionesRestantes: this.invRestantes
        };
      } else {
        console.log('No hay movimientos registrados.');
        return {
          totalInvitaciones: 0,
          totalInvitacionesFam: 0,
          totalInvitacionesRestantes: 0
        };  // Devolvemos 0 en ambos casos si no hay movimientos
      }
    }),
    catchError((err) => {
      console.error('Error al buscar los movimientos:', err);
      alert('No se pudieron obtener los movimientos.');
      return of({ totalInvitaciones: 0, totalInvitacionesFam: 0, totalInvitacionesRestantes: 0 });  // Devolvemos un objeto con 0 en ambos casos en caso de error
    })
  );
}

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


}
