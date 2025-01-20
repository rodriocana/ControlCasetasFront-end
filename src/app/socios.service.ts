import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Socio {
  id_socio: number;
  numero_socio: number;
  nombre: string;
  apellido: string;
  telefono: string;
  numero_familiares: number;
  domicilio: string;
  numero_tarjeta:number;
}

export interface Familiar {
  id_familiar: number;
  nombre: string;
  apellido: string;
}

@Injectable({
  providedIn: 'root',
})
export class SociosService {
  private apiUrl = 'http://localhost:3000/api/socios'; // url de la api de casetas

  constructor(private http: HttpClient) {}

  // Obtener la lista de socios
  getSocios(): Observable<Socio[]> {
    return this.http.get<Socio[]>(this.apiUrl);
  }

    // Obtener un socio por su ID
    getSocioById(id: number): Observable<Socio> {
      return this.http.get<Socio>(`${this.apiUrl}/${id}`);
    }

      // Obtener los familiares de un socio por ID
  getFamiliares(socioId: number): Observable<Familiar[]> {
    return this.http.get<Familiar[]>(`${this.apiUrl}/familiares/${socioId}`);
  }

}
