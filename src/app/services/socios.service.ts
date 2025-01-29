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

// export interface Movimiento {
//   id_registro: number;          // Identificador único del registro
//   id_socio: number | null;      // ID del socio (puede ser null si es un familiar)
//   id_familiar: number | null;   // ID del familiar (puede ser null si es un socio)
//   fecha_hora: string;           // Fecha y hora del movimiento (en formato ISO o similar)
//   tipo_movimiento: 'entrada' | 'salida'; // Tipo de movimiento: entrada o salida
//   codigo_barras: string;        // Código de barras escaneado
//   invitaciones_gastadas: number; // Número de invitaciones gastadas (o devueltas, si es una salida)
//   invitacionesIniciales: number,
//   invitaciones_restantes: number; // Número de invitaciones restantes
// }
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

  // Actualizar el total de invitaciones de un socio
  // actualizarInvitaciones(idSocio: number, cambioInvitaciones: number): Observable<Socio> {
  //   return this.http.patch<Socio>(`${this.apiUrl}/socios/${idSocio}`, {
  //     total_invitaciones: cambioInvitaciones
  //   });

  // }


    // Obtener un socio por su ID
    getSocioById(id: string): Observable<Socio> {
      return this.http.get<Socio>(`${this.apiUrl}/${id}`);
    }

  // Servicio Angular para obtener un socio por su número de tarjeta
  getSocioByNumTar(idsocio: string) {
    return this.http.get(`http://192.168.210.176:3000/api/entrada/${idsocio}`);
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
  // getMovimientos(id_socio?: number, id_familiar?: number): Observable<Movimiento[]> {
  //   let url = `${this.apiUrlMovimientos}/movimientos`;

  //   // Añadir parámetros si se proporcionan
  //   const params = [];
  //   if (id_socio !== undefined) {
  //     params.push(`id_socio=${id_socio}`);
  //   }
  //   if (id_familiar !== undefined) {
  //     params.push(`id_familiar=${id_familiar}`);
  //   }

  //   if (params.length > 0) {
  //     url += `?${params.join('&')}`;
  //   }

  //   return this.http.get<Movimiento[]>(url);
  // }


}
