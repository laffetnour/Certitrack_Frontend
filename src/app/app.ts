/*import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('projet');
}*/

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ConfigService } from './core/services/config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {

  constructor(
      private titleService: Title,
      private configService: ConfigService
    ) {}

   ngOnInit() {
       this.configService.config$.subscribe(config => {
         if (config && config.nomPlateforme) {
           this.titleService.setTitle(config.nomPlateforme);

         } else {
           this.titleService.setTitle('CertiTrack');
         }
       });
       this.configService.getConfig().subscribe();
     }


  }
