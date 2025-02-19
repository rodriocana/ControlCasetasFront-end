import { RouterModule, Routes } from '@angular/router';
import { MenuPrincipalComponent } from './menu-principal/menu-principal.component';
import { AddsocioComponent } from './addsocio/addsocio.component';
import { NgModule } from '@angular/core';
import { VerSociosComponent } from './ver-socios/ver-socios.component';
import { SocioDetalleComponent } from './socio-detalle/socio-detalle.component';
import { EntradaComponent } from './entrada/entrada.component';
import { SalidaComponent } from './salida/salida.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

export const routes: Routes = [

  // Aquí se definen las rutas
  {path: '', redirectTo: 'inicio', pathMatch: 'full'},
  {path: 'inicio', component:MenuPrincipalComponent},
  {path: 'añadir-socio', component:AddsocioComponent},
  {path: 'ver-socios', component:VerSociosComponent},
  {path: 'entrada', component:EntradaComponent},
  {path: 'salida', component: SalidaComponent},
  { path: 'socios/:id', component: SocioDetalleComponent }, // Ruta para detalles de socio


];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], // Usa hash en las rutas
  exports: [RouterModule]
})
export class AppModule {}

