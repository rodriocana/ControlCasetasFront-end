import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-principal',
    imports: [FormsModule, CommonModule, RouterModule ],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuPrincipalComponent implements OnInit {


  isAdmin: boolean = false; // Indica si el usuario está autenticado como admin
  showModal: boolean = false; // Controla la visibilidad del modal
  username: string = '';
  password: string = '';

  constructor(private router: Router) { }

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



}
