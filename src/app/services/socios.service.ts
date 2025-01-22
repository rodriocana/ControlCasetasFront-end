import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Socio {
  id_socio: number;
  nombre: string;
  apellido: string;
  telefono: string;
  invitaciones: number;
  domicilio: string;
  NumTar: string;
  familiares: { id_familiar: number; nombre: string; apellido: string, NumTar:string }[]; // Incluir familiares
}

export interface Familiar {
  id_familiar: number;
  nombre: string;
  apellido: string;
  NumTar: string;
}

@Injectable({
  providedIn: 'root',
})
export class SociosService {
  private apiUrl = 'http://192.168.210.176:3000/api/socios'; // url de la api de casetas
  private apiEntrada = "http://192.168.210.176:3000/api/entrada";

  constructor(private http: HttpClient) {}

  agregarSocio(socio: Socio, familiares: Familiar[]): Observable<any> {
    const socioData = { ...socio, familiares }; // Combina socio con familiares
    console.log('Datos a enviar:', socioData); // Verifica en la consola los datos antes de enviarlos
    return this.http.post('http://192.168.210.176:3000/api/socios', socioData, {
      headers: { 'Content-Type': 'application/json' }, // Asegúrate de que se especifique el tipo de contenido
    });
  }

  // Obtener la lista de socios principal para mostrar
  getSocios(): Observable<Socio[]> {
    return this.http.get<Socio[]>(this.apiUrl);
  }

    // Obtener un socio por su ID
    getSocioById(id: number): Observable<Socio> {
      return this.http.get<Socio>(`${this.apiUrl}/${id}`);
    }

  // Servicio Angular para obtener un socio por su número de tarjeta
  getSocioByNumTar(cardNumber: string) {
    return this.http.get(`http://192.168.210.176:3000/api/entrada/${cardNumber}`);
  }
      // Obtener los familiares de un socio por ID
    getFamiliares(socioId: number): Observable<Familiar[]> {
    return this.http.get<Familiar[]>(`http://192.168.210.176:3000/api/familiares/${socioId}`);
    }

    eliminarFamiliar(idFamiliar: number): Observable<any> {
      const url = `http://192.168.210.176:3000/api/familiares/${idFamiliar}`;
      return this.http.delete(url);
    }

}
