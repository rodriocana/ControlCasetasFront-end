import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Movimiento, Socio, SociosService } from '../services/socios.service';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-menu-principal',
    imports: [FormsModule, CommonModule, RouterModule ],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css'],
  providers: [DatePipe] // Asegúrate de añadirlo aquí
})
export class MenuPrincipalComponent implements OnInit {






  showModal: boolean = false; // Controla la visibilidad del modal
  username: string = '';
  password: string = '';
  socios: Socio[] = [];
  movimiento: Movimiento[] = [];  // Para almacenar los registros
  showRegistrosModal = false;
  movimientosConFechaFormateada: any[] = [];  // Guardamos los movimientos con la fecha formateada
  esUsuario: boolean = false;
  isAdmin: boolean = false; // Indica si el usuario está autenticado como admin
  noHayMovimientos: boolean = false;


  movimientosPaginados: Movimiento[] = []; // Lista de movimientos filtrados por página
  paginaActual: number = 0; // Página actual
  tamanoPagina: number = 10; // Número de socios por página
  Math = Math;  // Esto hace que Math sea accesible en la plantilla
  fechaFiltro: string = '';  // Almacena la fecha seleccionada en el selector de fecha del html

  constructor(private router: Router,   private sociosService: SociosService, private datePipe: DatePipe) { }

  ngOnInit() {
    // Verificar si el token está en localStorage
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');



    if (adminToken) {
      this.isAdmin = true;  // El token está presente, el usuario está autenticado
    } else {
      this.isAdmin = false; // El token no está presente, no autenticado
    }

    if(userToken){
      this.esUsuario = true;
    }

    if(adminToken){
      this.isAdmin = true;
    }

    // this.probarHoras();
  }


  registrarEntrada() {
    console.log('Registrando entrada...');
  }

  registrarSalida() {
    console.log('Registrando salida...');
  }

  navigateTo(route:string) {
    this.router.navigate([route]);

  }

  // Método para obtener y filtrar los movimientos por fecha
  // Método para obtener y filtrar los movimientos por fecha
filtrarPorFecha(): void {
  if (this.fechaFiltro) {
    // Si hay una fecha seleccionada, obtenemos los movimientos filtrados por esa fecha
    this.sociosService.getMovimientosPorFecha(this.fechaFiltro).subscribe({
      next: (movimientos: Movimiento[]) => {
        this.movimiento = movimientos;  // Actualiza los movimientos con la respuesta del servicio

        // Si no hay movimientos, limpia la tabla
        if (movimientos.length === 0) {
          this.movimientosConFechaFormateada = [];
          this.movimientosPaginados = [];
          this.noHayMovimientos = true;
        } else {
          // Mapeamos los movimientos y formateamos la fecha
          this.movimientosConFechaFormateada = movimientos.map(item => {
            return {
              ...item,  // Copiamos las propiedades del objeto
              fechaFormateada: this.datePipe.transform(item.fecha, 'yyyy-MM-dd')  // Formateamos la fecha
            };
          });

          // Actualiza la paginación con los nuevos datos filtrados
          this.actualizarPagina();
          this.noHayMovimientos = false;
        }
      },
      error: (error) => {
        console.error('Error al filtrar los movimientos por fecha:', error);
        if (error.status === 404) {
          // Si el error es 404, no hay movimientos para esa fecha
          this.movimientosConFechaFormateada = [];
          this.movimientosPaginados = [];
          this.noHayMovimientos = true;
        }
      }
    });
  } else {
    // Si no hay fecha seleccionada (fechaFiltro está vacío), mostramos todos los movimientos
    this.sociosService.getTodosMovimientos().subscribe({
      next: (movimientos: Movimiento[]) => {
        this.movimiento = movimientos;  // Actualiza todos los movimientos

        // Mapeamos los movimientos y formateamos la fecha
        this.movimientosConFechaFormateada = movimientos.map(item => {
          return {
            ...item,  // Copiamos las propiedades del objeto
            fechaFormateada: this.datePipe.transform(item.fecha, 'yyyy-MM-dd')  // Formateamos la fecha
          };
        });

        // Actualiza la paginación con todos los movimientos
        this.actualizarPagina();
        this.noHayMovimientos = false;
      },
      error: (error) => {
        console.error('Error al cargar todos los movimientos:', error);
      }
    });
  }
}

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  closeRegistrosModal(): void {
    this.showRegistrosModal = false;
  }

  login() {
    if (this.username === 'admin' && this.password === '1234') {
      this.isAdmin = true;  // Cambiar el estado a admin
      localStorage.setItem('adminToken', 'true');  // Guardamos el token
      alert('Bienvenido, Administrador');
      this.closeModal();
      return;
    }

    this.sociosService.getSocios().subscribe((socios: Socio[]) => {
      this.socios = socios;

      // Buscar el socio con el DNI
      const socioEncontrado = this.socios.find(socio =>
        socio.dni === this.username && socio.email === this.password
      );

      if (socioEncontrado) {
        alert('Inicio de sesión exitoso');
        localStorage.setItem('userToken', 'true');

        // Redirigir a la ruta con el idsocio
        this.router.navigate([`/socios/${socioEncontrado.idsocio}`]);

        this.closeModal();
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    });
  }

  logout() {
    localStorage.removeItem('adminToken');  // Eliminar el token
    this.isAdmin = false;  // Cambiar el estado a no autenticado
    alert('Sesión cerrada');
  }

  verRegistros(): void {
    this.sociosService.getTodosMovimientos().subscribe({
      next: (movimientos: Movimiento[]) => {
        this.movimiento = movimientos;

        // Mapeamos los movimientos y formateamos la fecha
        this.movimientosConFechaFormateada = movimientos.map(item => {
          return {
            ...item,  // Copiamos las propiedades del objeto
            fechaFormateada: this.datePipe.transform(item.fecha, 'yyyy-MM-dd')  // Formateamos la fecha
          };
        });

        this.showRegistrosModal = true;  // Abre el modal
        this.filtrarPorFecha();  // Aplica el filtro cuando se cargan los registros

        if (this.movimiento.length === 0) {
          alert('No hay registros disponibles');
        }

        // Actualizar la paginación con los nuevos movimientos
        this.actualizarPagina();
      },
      error: (error: any) => {
        console.error('Error al cargar los registros:', error);
      }
    });

    console.log("hola" + this.movimiento); // Verifica los datos
  }

  // Método para actualizar la vista de la tabla según la página actual
  actualizarPagina(): void {
  const inicio = this.paginaActual * this.tamanoPagina;
  const fin = inicio + this.tamanoPagina;

  // Asegurarse de que los movimientos con fecha formateada sean los que se muestran
  this.movimientosPaginados = this.movimientosConFechaFormateada.slice(inicio, fin);
}

  // Cambiar de página hacia adelante
  // Cambiar de página hacia adelante
    paginaSiguiente(): void {
  if ((this.paginaActual + 1) * this.tamanoPagina < this.movimiento.length) {
    this.paginaActual++;
    this.actualizarPagina();  // Llamar para actualizar los movimientos visibles
  }
}

  // Cambiar de página hacia atrás
  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.actualizarPagina();
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.movimiento.length / this.tamanoPagina) || 1;
  }


}
