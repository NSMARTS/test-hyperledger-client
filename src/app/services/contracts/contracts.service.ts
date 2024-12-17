import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContractsService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  constructor() {}

  getPdf(url: string): Observable<ArrayBuffer> {
    // url 한글깨짐 방지용
    const encodedUrl = encodeURIComponent(url);
    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf',
      Accept: 'application/pdf',
    });
    return this.http.get(this.baseUrl + `/contracts/pdf/${encodedUrl}`, {
      headers: headers,
      responseType: 'arraybuffer',
    });
  }

  getContractById(id: any) {
    return this.http.get(this.baseUrl + '/contracts/' + id);
  }

  getContracts(
    active: string,
    direction: string,
    pageIndex: number,
    pageSize: number
  ) {
    return this.http.get(this.baseUrl + '/contracts', {
      params: { active, direction, pageIndex, pageSize },
    });
  }

  createContract({ file, title, company, writer, receiverA, receiverB }: any) {
    const formData: FormData = new FormData();
    formData.append('file', file, file?.name);
    formData.append('title', title);
    formData.append('company', company);
    formData.append('writer', writer);
    formData.append('receiverA', receiverA);
    formData.append('receiverB', receiverB);
    return this.http.post(this.baseUrl + '/contracts', formData);
  }

  verifyContract(id: string, receiver: string, file: File) {
    const formData: FormData = new FormData();
    formData.append('receiver', receiver);

    formData.append('file', file, file?.name);

    return this.http.post(
      this.baseUrl + '/contracts/verify' + `/${id}`,
      formData
    );
  }

  updateContract(id: string | null, body: any) {
    return this.http.patch(this.baseUrl + '/contracts' + `/${id}`, body);
  }

  deleteContract(id: string) {
    return this.http.delete(this.baseUrl + '/contracts' + `/${id}`);
  }

  signContract(id: string | null, body: any) {
    return this.http.patch(this.baseUrl + '/contracts' + `/sign/${id}`, body);
  }
}
