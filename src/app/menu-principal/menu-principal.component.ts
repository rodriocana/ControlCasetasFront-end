import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Movimiento, Socio, SociosService } from '../services/socios.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-menu-principal',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css'],
  providers: [DatePipe]
})
export class MenuPrincipalComponent implements OnInit {
  showModal: boolean = false;
  username: string = '';
  password: string = '';
  socios: Socio[] = [];
  movimiento: Movimiento[] = [];
  showRegistrosModal = false;
  movimientosConFechaFormateada: any[] = [];
  esUsuario: boolean = false;
  isAdmin: boolean = false;
  noHayMovimientos: boolean = false;
  movimientosPaginados: Movimiento[] = [];
  paginaActual: number = 0;
  tamanoPagina: number = 10;
  Math = Math;
  fechaFiltro: string = '';

  constructor(
    private router: Router,
    private sociosService: SociosService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');

    if (adminToken) {
      this.isAdmin = true;
    }

    if (userToken) {
      this.esUsuario = true;
    }
  }

  registrarEntrada() {
    console.log('Registrando entrada...');
  }

  registrarSalida() {
    console.log('Registrando salida...');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  filtrarPorFecha(): void {
    if (this.fechaFiltro) {
      this.sociosService.getMovimientosPorFecha(this.fechaFiltro).subscribe({
        next: (movimientos: Movimiento[]) => {
          this.movimiento = movimientos;

          if (movimientos.length === 0) {
            this.movimientosConFechaFormateada = [];
            this.movimientosPaginados = [];
            this.noHayMovimientos = true;
          } else {
            this.movimientosConFechaFormateada = movimientos.map(item => {
              return {
                ...item,
                fechaFormateada: this.datePipe.transform(item.fecha, 'yyyy-MM-dd')
              };
            });

            this.actualizarPagina();
            this.noHayMovimientos = false;
          }
        },
        error: (error) => {
          console.error('Error al filtrar los movimientos por fecha:', error);
          if (error.status === 404) {
            this.movimientosConFechaFormateada = [];
            this.movimientosPaginados = [];
            this.noHayMovimientos = true;
          }
        }
      });
    } else {
      this.sociosService.getTodosMovimientos().subscribe({
        next: (movimientos: Movimiento[]) => {
          this.movimiento = movimientos;

          this.movimientosConFechaFormateada = movimientos.map(item => {
            return {
              ...item,
              fechaFormateada: this.datePipe.transform(item.fecha, 'yyyy-MM-dd')
            };
          });

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
      this.isAdmin = true;
      localStorage.setItem('adminToken', 'true');
      alert('Bienvenido, Administrador');
      this.closeModal();
      return;
    }

    this.sociosService.getSocios().subscribe((socios: Socio[]) => {
      this.socios = socios;
      const socioEncontrado = this.socios.find(socio =>
        socio.dni === this.username && socio.email === this.password
      );

      if (socioEncontrado) {
        alert('Inicio de sesión exitoso');
        localStorage.setItem('userToken', 'true');
        this.router.navigate([`/socios/${socioEncontrado.idsocio}`]);
        this.closeModal();
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    });
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.isAdmin = false;
    alert('Sesión cerrada');
  }

  verRegistros(): void {
    this.sociosService.getTodosMovimientos().subscribe({
      next: (movimientos: Movimiento[]) => {
        this.movimiento = movimientos;
        this.movimientosConFechaFormateada = movimientos.map(item => {
          return {
            ...item,
            fechaFormateada: this.datePipe.transform(item.fecha, 'yyyy-MM-dd')
          };
        });
        this.showRegistrosModal = true;
        this.filtrarPorFecha();

        if (this.movimiento.length === 0) {
          alert('No hay registros disponibles');
        }

        this.actualizarPagina();
      },
      error: (error: any) => {
        console.error('Error al cargar los registros:', error);
      }
    });
  }


  actualizarPagina(): void {
    const inicio = this.paginaActual * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;

    this.movimientosPaginados = this.movimientosConFechaFormateada.slice(inicio, fin);
  }


  paginaSiguiente(): void {
    // Verifica si hay más elementos para mostrar
    if ((this.paginaActual + 1) * this.tamanoPagina < this.movimientosConFechaFormateada.length) {
      this.paginaActual++;
      this.actualizarPagina();
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.actualizarPagina();
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.movimientosConFechaFormateada.length / this.tamanoPagina);
  }

  get haySiguiente(): boolean {
    // Devuelve true si hay más páginas
    return (this.paginaActual + 1) * this.tamanoPagina < this.movimientosConFechaFormateada.length;
  }

  get hayAnterior(): boolean {
    // Devuelve true si hay una página anterior
    return this.paginaActual > 0;
  }
}
