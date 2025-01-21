import { Component } from '@angular/core';

@Component({
  selector: 'app-entrada',
  imports: [],
  templateUrl: './entrada.component.html',
  styleUrl: './entrada.component.css'
})
export class EntradaComponent {

  invitaciones: number = 0;

sumarInvitacion() {
  this.invitaciones++;
}

restarInvitacion() {
  if (this.invitaciones > 0) {
    this.invitaciones--;
  }
}

}
