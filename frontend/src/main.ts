// frontend/src/main.ts

// 1. Motor de ciclos asíncronos para la detección de cambios activa
import 'zone.js'; 

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
// CORRECCIÓN DE RUTA: Tu archivo físico en el árbol se llama 'app.ts' y exporta 'AppComponent'
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));