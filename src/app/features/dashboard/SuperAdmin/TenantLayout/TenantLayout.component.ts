import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContextService } from '../../../../core/services/context.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tenant-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './TenantLayout.component.html',
  styleUrls: ['./TenantLayout.component.css']
})
export class TenantLayoutComponent implements OnInit {
  idTenant: string | null = null;
  isSubNavOpen = false;


  constructor(
    private route: ActivatedRoute,
    private contextService: ContextService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // On écoute les changements de paramètres dans l'URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('idTenant'); // Récupère 'idTenant' défini dans ton routing

      if (id) {
        this.idTenant = id;
        const numericId = Number(id);

        // On met à jour le service de contexte pour que le reste de
        // l'app sache sur quel Tenant on travaille
        this.contextService.updateTenantId(numericId);
      }

      // Force la détection de changement pour garantir que les liens
      // [routerLink] dans le HTML sont mis à jour avec la nouvelle valeur
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    });
  }
}
