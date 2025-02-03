import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Movimiento, SociosService } from '../services/socios.service';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-menu-principal',
    imports: [FormsModule, CommonModule, RouterModule ],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css'],
  providers: [DatePipe] // Asegúrate de añadirlo aquí
})
export class MenuPrincipalComponent implements OnInit {


  isAdmin: boolean = false; // Indica si el usuario está autenticado como admin
  showModal: boolean = false; // Controla la visibilidad del modal
  username: string = '';
  password: string = '';
  movimiento: Movimiento[] = [];  // Para almacenar los registros
  showRegistrosModal = false;
  movimientosConFechaFormateada: any[] = [];  // Guardamos los movimientos con la fecha formateada

  constructor(private router: Router,   private sociosService: SociosService, private datePipe: DatePipe) { }



  ngOnInit() {
    // Verificar si el token está en localStorage
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      this.isAdmin = true;  // El token está presente, el usuario está autenticado
    } else {
      this.isAdmin = false; // El token no está presente, no autenticado
    }
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
    } else {
      alert('Usuario o contraseña incorrectos');
    }
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

        if (this.movimiento.length === 0) {
          alert('No hay registros disponibles');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar los registros:', error);
      }
    });
  }
}
