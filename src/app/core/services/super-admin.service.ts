import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private baseUrl = 'http://localhost:8080/api/super-admin';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

private getAuthHeadersForFile() {
  const token = localStorage.getItem('token');
  return {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // SURTOUT PAS de 'Content-Type': 'application/json' ici
    })
  };
}

  // --- STATISTIQUES ---
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`, this.getAuthHeaders());
  }

  // --- GESTION DES ADMINS ---
  getAllAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admins`, this.getAuthHeaders());
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admins/${id}`, this.getAuthHeaders());
  }

  toggleAdminStatus(id: number): Observable<any> {
    // On passe un objet vide {} car c'est un PUT
    return this.http.put(`${this.baseUrl}/admins/${id}/status`, {}, this.getAuthHeaders());
  }

  // --- GESTION DES TENANTS ---
  getTenants(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tenants`, this.getAuthHeaders());
  }


  addTenant(tenant: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tenant`,tenant, this.getAuthHeaders());
  }

  updateTenant(id: number, tenant: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/tenant/${id}`,tenant, this.getAuthHeaders());
  }

  toggleTenantStatus(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/tenant/${id}/status`, {}, this.getAuthHeaders());
  }

  deleteTenant(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tenant/${id}`, this.getAuthHeaders());
  }


  // Exemple de méthodes à ajouter dans SuperAdminService
  // --- ACTIONS GROUPÉES POUR LES TENANTS (CORRIGÉ) ---

  activateTenantsBulk(ids: number[]): Observable<any> {
    // Changé /users/ par /tenants/ + ajout des headers
    return this.http.put(`${this.baseUrl}/tenants/activate-bulk`, ids, this.getAuthHeaders());
  }

  deactivateTenantsBulk(ids: number[]): Observable<any> {
    // Changé /users/ par /tenants/ + ajout des headers
    return this.http.put(`${this.baseUrl}/tenants/deactivate-bulk`, ids, this.getAuthHeaders());
  }


  deleteTenantsBulk(ids: number[]): Observable<any> {
    // Changé /users/ par /tenants/ + ajout des headers
    return this.http.post(`${this.baseUrl}/tenants/delete-bulk`, ids, this.getAuthHeaders());
  }



// --- À AJOUTER POUR LES ADMINS TENANTS ---

  getTenantAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tenants-admins`, this.getAuthHeaders());
  }

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user`, user, this.getAuthHeaders());
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${id}`, user, this.getAuthHeaders());
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/${id}`, this.getAuthHeaders());
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${id}/status`, {}, this.getAuthHeaders());
  }


    getFilteredTenantAdminsByTenantStatus(params: any): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/tenant-admins/filter-tenant-status`, {
        headers: this.getAuthHeaders().headers,
        params: params
      });
    }

  activateUsersBulk(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/activate-bulk`, ids, this.getAuthHeaders());
  }

  deactivateUsersBulk(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/deactivate-bulk`, ids, this.getAuthHeaders());
  }

  deleteUsersBulk(ids: number[]): Observable<any> {
    // On utilise souvent POST pour envoyer un body avec un DELETE si l'API est configurée ainsi
    return this.http.post(`${this.baseUrl}/users/delete-bulk`, ids, this.getAuthHeaders());
  }




// --- GESTION DES CATEGORIES DE MODULES ---

getCategories(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/categories`, this.getAuthHeaders());
}

addCategorie(categorie: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/categories`, categorie, this.getAuthHeaders());
}

updateCategorie(id: number, categorie: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/categories/${id}`, categorie, this.getAuthHeaders());
}

deleteCategorie(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/categories/${id}`, this.getAuthHeaders());
}

// --- GESTION DES MODULES ---
getModules(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/modules`, this.getAuthHeaders());
}

addModule(module: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/modules`, module, this.getAuthHeaders());
}

updateModule(id: number, module: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/modules/${id}`, module, this.getAuthHeaders());
}

deleteModule(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/modules/${id}`, this.getAuthHeaders());
}

  toggleModuleStatus(id: number): Observable<any> {

    return this.http.put(`${this.baseUrl}/modules/${id}/toggle-status`, {}, this.getAuthHeaders());
  }

  activateModules(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/modules/activate`, ids, this.getAuthHeaders());
  }

  deactivateModules(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/modules/deactivate`, ids, this.getAuthHeaders());
  }
importModuleCSV(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);

  // On enlève responseType: 'text' car on attend du JSON maintenant
  return this.http.post(`${this.baseUrl}/modules/import`, formData, {
    headers: this.getAuthHeadersForFile().headers
  });
}
}
