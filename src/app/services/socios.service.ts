import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Socio {
  idsocio: string;
  nombre: string;
  apellido: string;
  telefono: string;
  invitaciones: number;
  direccion: string;
  poblacion: string;
  dni: string;
  email: string;
  familiares?: { idsocio: string; nombre: string; apellido: string, invitaciones:number }[]; // familiares es opcional
  numeroFamiliares?: number; // Nueva propiedad
}

export interface Familiar {
  idsocio: string;
  nombre: string;
  apellido: string;
  invitaciones: number;
}

export interface Movimiento {
  id_registro: number;
  idsocio: number | null;
  fecha: string;
  hora: string;
  tipomov: 'e' | 's';  // Ahora coincide con la base de datos
  invitados: number;
}
@Injectable({
  providedIn: 'root',
})
export class SociosService {

  private apiUrl = 'http://192.168.210.176:3000/api/socios'; // url de la api de casetas
  private apiUrlMovimientos = 'http://192.168.210.176:3000/api';

  constructor(private http: HttpClient) {}

  agregarSocio(socio: Socio): Observable<any> {
    return this.http.post('http://192.168.210.176:3000/api/socios', socio, {
      headers: { 'Content-Type': 'application/json' }, // Asegúrate de que se especifique el tipo de contenido
    });
  }

  agregarSocioBackup(socio: Socio): Observable<any> {
    return this.http.post('http://192.168.210.176:3000/api/sociosbackup', socio, {
      headers: { 'Content-Type': 'application/json' }, // Asegúrate de que se especifique el tipo de contenido
    });
  }


  // Obtener la lista de INVITADOS principal para mostrar
  getSocios(): Observable<Socio[]> {
    return this.http.get<Socio[]>(this.apiUrl);
  }


// Registrar un movimiento
  registrarMovimiento(movimiento: any): Observable<any> {
  return this.http.post(`${this.apiUrlMovimientos}/movimientos`, movimiento);
}

    // Obtener un socio por su ID
    getSocioById(id: string): Observable<Socio> {
      return this.http.get<Socio>(`${this.apiUrl}/${id}`);
    }

  // Servicio Angular para obtener un socio por su número de IDSOCIO al pasar  el lector de codigo de barras
  getSocioByIdSocio(idsocio: string) {
    return this.http.get(`http://192.168.210.176:3000/api/entrada/${idsocio}`);
  }

  getFamiliarByIdSocio(idsocio: string) {
    return this.http.get(`http://192.168.210.176:3000/api/entradaFam/${idsocio}`);
  }
      // Obtener los familiares de un socio por ID
    getFamiliares(socioId: string): Observable<Familiar[]> {
    return this.http.get<Familiar[]>(`http://192.168.210.176:3000/api/familiares/${socioId}`);
    }

    eliminarFamiliar(idFamiliar: string): Observable<any> {
      const url = `http://192.168.210.176:3000/api/familiares/${idFamiliar}`;
      return this.http.delete(url);
    }

    eliminarSocio(id_socio: string) {
      return this.http.delete<Socio>(`${this.apiUrl}/${id_socio}`);
    }

    updateSocio(socio: Socio): Observable<any> {
      return this.http.put(`${this.apiUrl}/${socio.idsocio}`, socio);
    }

    addFamiliar(socioId: string, familiar: Familiar): Observable<any> {
      const url = `http://192.168.210.176:3000/api/familiares/${socioId}`;
      console.log('Enviando familiar:', familiar); // Verifica qué estás enviando
      return this.http.post(url, familiar, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

   //Obtener movimientos
    getMovimientos(idsocio?: string): Observable<Movimiento[]> {
    let url = `${this.apiUrlMovimientos}/movimientos`;

    // Añadir parámetros si se proporcionan
    const params = [];
    if (idsocio !== undefined) {
      params.push(`idsocio=${idsocio}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<Movimiento[]>(url);
  }

  // Obtener todos los movimientos
  getTodosMovimientos(): Observable<Movimiento[]> {
  const url = `${this.apiUrlMovimientos}/movimientosTotales`; // La URL de la nueva API

  return this.http.get<Movimiento[]>(url); // Realiza la solicitud GET
}



}
