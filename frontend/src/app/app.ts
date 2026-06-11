import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemaToggleComponent } from './shared/components/tema-toggle/tema-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TemaToggleComponent],
  templateUrl: './app.html'
})
export class App {
  //protected readonly title = signal('proyecto');
  titulo:string ="backend";
}

