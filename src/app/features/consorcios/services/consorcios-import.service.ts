// src/app/features/consorcios/services/consorcios-import.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class ConsorciosImportService {
  private baseUrl = `${environment.apiUrl}/consorcios`;

  constructor(private http: HttpClient) {}

 uploadExcel(file: File, mapping: Record<string, string | string[]>): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));

    return this.http.post<any>(`${this.baseUrl}/upload-excel`, formData);
  }
}
