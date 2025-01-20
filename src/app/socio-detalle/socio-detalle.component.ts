import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SociosService } from '../socios.service';
import { Socio } from '../socios.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-socio-detalle',
  imports: [CommonModule, RouterModule],
  templateUrl: './socio-detalle.component.html',
  styleUrls: ['./socio-detalle.component.css']
})
export class SocioDetalleComponent implements OnInit {
  socio: Socio | undefined;

  constructor(
    private route: ActivatedRoute,
    private sociosService: SociosService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id)
    if (id) {
      this.sociosService.getSocioById(+id).subscribe((socio) => {
        this.socio = socio;
        console.log(this.socio);
      });
    }
  }
}
