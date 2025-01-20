import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Socio, SociosService } from '../socios.service';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-ver-socios',
  imports: [CommonModule, RouterModule],
  templateUrl: './ver-socios.component.html',
  styleUrl: './ver-socios.component.css'
})
export class VerSociosComponent implements OnInit{

  socios: Socio[] = [];

  constructor(private sociosService: SociosService) {}

  ngOnInit(): void {
    this.sociosService.getSocios().subscribe((data) => {
      this.socios = data;
      console.log(this.socios);
    });
  }

}
