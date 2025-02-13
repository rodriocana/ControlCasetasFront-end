import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Movimiento, Socio, SociosService } from '../services/socios.service';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css'],
  providers: [DatePipe]
})
export class MenuPrincipalComponent implements OnInit {

  @ViewChild('userInput', { static: false }) usernameInput!: ElementRef;


  // Estado del modal
  showModal = false;
  showRegistrosModal = false;

  // Variables de autenticación
  username = '';
  password = '';
  isAdmin = false;
  esUsuario = false;

  // Datos de socios y movimientos
  socios: Socio[] = [];
  movimientos: Movimiento[] = [];
  movimientosPaginados: Movimiento[] = [];
  movimientosConFechaFormateada: any[] = [];
  noHayMovimientos = false;

  // Variables de paginación
  paginaActual = 0;
  tamanoPagina = 10;
  fechaFiltro = '';

  constructor(
    private router: Router,
    private sociosService: SociosService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.isAdmin = !!localStorage.getItem('adminToken');
    this.esUsuario = !!localStorage.getItem('userToken');
  }



  ngAfterViewInit() {
    setTimeout(() => {
      if (this.usernameInput && this.usernameInput.nativeElement) {
        this.usernameInput.nativeElement.focus();
      } else {
        console.error('El input no está disponible en ngAfterViewInit');
      }
    });
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
      this.obtenerMovimientosFiltrados(this.fechaFiltro);
    } else {
      this.obtenerTodosLosMovimientos();
    }
  }

  private obtenerMovimientosFiltrados(fecha: string) {
    this.sociosService.getMovimientosPorFecha(fecha).subscribe({
      next: this.procesarMovimientos.bind(this),
      error: this.manejarErrorFiltro.bind(this)
    });
  }

  private obtenerTodosLosMovimientos() {
    this.sociosService.getTodosMovimientos().subscribe({
      next: this.procesarMovimientos.bind(this),
      error: error => console.error('Error al cargar todos los movimientos:', error)
    });
  }

  private procesarMovimientos(movimientos: Movimiento[]) {
    this.movimientos = movimientos;
    this.movimientosConFechaFormateada = movimientos.map(mov => ({
      ...mov,
      fechaFormateada: this.datePipe.transform(mov.fecha, 'yyyy-MM-dd')
    }));
    this.actualizarPagina();
    this.noHayMovimientos = movimientos.length === 0;
  }

  private manejarErrorFiltro(error: any) {
    console.error('Error al filtrar los movimientos por fecha:', error);
    if (error.status === 404) {
      this.movimientosConFechaFormateada = [];
      this.movimientosPaginados = [];
      this.noHayMovimientos = true;
    }
  }

  openModal() {
    this.showModal = true;
    // Dar el foco al campo de username cuando se abra el modal
    setTimeout(() => {
      this.usernameInput.nativeElement.focus();
    }, 0);
  }


  closeModal() { this.showModal = false; }
  closeRegistrosModal() { this.showRegistrosModal = false; }

  login() {
    if (this.username === 'Manuelo' && this.password === 'Manuelo') {
      this.isAdmin = true;
      localStorage.setItem('adminToken', 'true');
      // alert('Bienvenido, Administrador');
      this.closeModal();
      return;
    }
    this.autenticarUsuario();
  }

  private autenticarUsuario() {
    this.sociosService.getSocios().subscribe((socios: Socio[]) => {
      const socioEncontrado = socios.find(socio => socio.dni === this.username && socio.email === this.password);
      if (socioEncontrado) {
        localStorage.setItem('userToken', 'true');
        // alert('Inicio de sesión exitoso');
        this.router.navigate([`/socios/${socioEncontrado.idsocio}`]);
        this.closeModal();
      } else {
        // alert('Usuario o contraseña incorrectos');
      }
    });
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.isAdmin = false;
    // alert('Sesión cerrada');
  }

  verRegistros() {
    this.sociosService.getTodosMovimientos().subscribe({
      next: this.procesarVerRegistros.bind(this),
      error: error => console.error('Error al cargar los registros:', error)
    });
  }

  private procesarVerRegistros(movimientos: Movimiento[]) {
    this.movimientos = movimientos;
    this.movimientosConFechaFormateada = movimientos.map(mov => ({
      ...mov,
      fechaFormateada: this.datePipe.transform(mov.fecha, 'yyyy-MM-dd')
    }));
    this.showRegistrosModal = true;
    this.filtrarPorFecha();
    if (this.movimientos.length === 0) alert('No hay registros disponibles');
    this.actualizarPagina();
  }

  actualizarPagina() {
    const inicio = this.paginaActual * this.tamanoPagina;
    this.movimientosPaginados = this.movimientosConFechaFormateada.slice(inicio, inicio + this.tamanoPagina);
  }

  paginaSiguiente() {
    if (this.haySiguiente) {
      this.paginaActual++;
      this.actualizarPagina();
    }
  }

  paginaAnterior() {
    if (this.hayAnterior) {
      this.paginaActual--;
      this.actualizarPagina();
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.movimientosConFechaFormateada.length / this.tamanoPagina);
  }

  get haySiguiente(): boolean {
    return (this.paginaActual + 1) * this.tamanoPagina < this.movimientosConFechaFormateada.length;
  }

  get hayAnterior(): boolean {
    return this.paginaActual > 0;
  }
}
