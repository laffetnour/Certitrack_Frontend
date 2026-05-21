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
    this.route.paramMap.subscribe(params => {
      const id = params.get('idTenant');

      if (id) {
        this.idTenant = id;
        const numericId = Number(id);

        this.contextService.updateTenantId(numericId);
      }

      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    });
  }
}
