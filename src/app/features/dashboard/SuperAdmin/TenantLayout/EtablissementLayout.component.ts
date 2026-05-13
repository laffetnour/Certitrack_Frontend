import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContextService } from '../../../../core/services/context.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-etablissement-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './EtablissementLayout.component.html',
  styleUrls: ['./EtablissementLayout.component.css']
})
export class EtablissementTenantLayoutComponent implements OnInit {
  idEtab: string | null = null;
  idTenant!: string;
   isParcoursOpen: boolean = false;

  constructor(private route: ActivatedRoute,
    private contextService: ContextService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('idEtab');
      if (id) {
        const numericId = Number(id);
        this.idEtab = id;
        // On met à jour le service de contexte
        this.contextService.updateEtablissementId(numericId);
      }
      setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
    });
  this.route.parent?.paramMap.subscribe(params => {
      this.idTenant = params.get('idTenant')!;
    });

  }
closeParcours() {
  this.isParcoursOpen = false;
}
}
