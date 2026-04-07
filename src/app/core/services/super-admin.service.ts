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

    })
  };
}


  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`, this.getAuthHeaders());
  }


  getAllAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admins`, this.getAuthHeaders());
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admins/${id}`, this.getAuthHeaders());
  }

  toggleAdminStatus(id: number): Observable<any> {

    return this.http.put(`${this.baseUrl}/admins/${id}/status`, {}, this.getAuthHeaders());
  }


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




  activateTenantsBulk(ids: number[]): Observable<any> {

    return this.http.put(`${this.baseUrl}/tenants/activate-bulk`, ids, this.getAuthHeaders());
  }

  deactivateTenantsBulk(ids: number[]): Observable<any> {

    return this.http.put(`${this.baseUrl}/tenants/deactivate-bulk`, ids, this.getAuthHeaders());
  }


  deleteTenantsBulk(ids: number[]): Observable<any> {

    return this.http.post(`${this.baseUrl}/tenants/delete-bulk`, ids, this.getAuthHeaders());
  }





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

    return this.http.post(`${this.baseUrl}/users/delete-bulk`, ids, this.getAuthHeaders());
  }






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


  return this.http.post(`${this.baseUrl}/modules/import`, formData, {
    headers: this.getAuthHeadersForFile().headers
  });
}


  // ✅ Ajouter cette méthode
  getMotCles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/modules/mot-cles`, this.getAuthHeaders());
  }


importQuestionsCSV(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post(`${this.baseUrl}/questions/import`, formData, this.getAuthHeadersForFile());
}

getQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/questions/all`, this.getAuthHeaders());
  }


//ajouter


  addQuestion(q: any) {
    return this.http.post(`${this.baseUrl}/questions`, q, this.getAuthHeaders());
  }

  updateQuestion(id: number, q: any) {
    return this.http.put(`${this.baseUrl}/questions/${id}`, q, this.getAuthHeaders());
  }

  deleteQuestion(id: number) {
    return this.http.delete(`${this.baseUrl}/questions/${id}`, this.getAuthHeaders());
  }

  toggleQuestionStatus(id: number) {
    return this.http.put(`${this.baseUrl}/questions/${id}/toggle-status`, {}, this.getAuthHeaders());
  }

  activateQuestions(ids: number[]) {
    return this.http.put(`${this.baseUrl}/questions/activate`, ids, this.getAuthHeaders());
  }

  deactivateQuestions(ids: number[]) {
    return this.http.put(`${this.baseUrl}/questions/deactivate`, ids, this.getAuthHeaders());
  }

  deleteQuestionsBulk(ids: number[]) {
    return this.http.post(`${this.baseUrl}/questions/delete-bulk`, ids, this.getAuthHeaders());
  }



// Categorie questions

getCatQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories-questions/all`, this.getAuthHeaders());
  }
addCatQuestion(cat: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/categories-questions/add`, cat, this.getAuthHeaders());
}

updateCatQuestion(id: number, cat: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/categories-questions/update/${id}`, cat, this.getAuthHeaders());
}

deleteCatQuestion(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/categories-questions/delete/${id}`, this.getAuthHeaders());
}


}
