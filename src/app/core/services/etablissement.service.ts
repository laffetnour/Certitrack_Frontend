import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn:'root'
})
export class EtablissementService{

  private api="http://localhost:8080/api/etablissements";

  constructor(private http:HttpClient){}

  getEtablissements():Observable<any>{

    return this.http.get(this.api);

  }

getAll ():Observable<any>{

   return this.http.get(`${this.api}/public/all`);

 }
  getSpecialites(etabId:number):Observable<any>{
    return this.http.get(`${this.api}/${etabId}/specialites`);
  }

}
