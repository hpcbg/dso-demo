import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const config = {
  "keyrockBaseAuth": "ZmU2ZWMzOWItZmVmMy00ZDY1LThkZmQtYzYyNTVjOWEwN2JjOjUyNTVmNTJlLWYxNWQtNDljMi1iOTNkLTg0YjMzNzJjZTQxMA==",
  "serviceStoreUser": "set@hpc.bg",
  "serviceStorePass": "asdfiuY12#",
  "knowledgeBaseId": "https://ke.interconnectproject.eu/rest/adapter/HPC-Answer"
}

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  keyrockAccessToken: any;
  keyrockBaseAuthentication = config.keyrockBaseAuth;//'';
  serviceStoreAccessToken: any;
  knowledgeInteractionId: any;

  constructor(private http: HttpClient) { }

  isLoggedIn() {
    if (!!localStorage.getItem('keyrock_access_token')) {
      this.keyrockAccessToken = localStorage.getItem('keyrock_access_token');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('keyrock_access_token');
    window.location.reload();
  }

  keyrockLogin(username: string, password: string, callback: Function) {
    this.http.post<any>('/oauth2/token', `grant_type=password&username=${encodeURIComponent(username)}&password=${password}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + this.keyrockBaseAuthentication
      }
    }).subscribe(data => {
      if (!!data.access_token) {
        this.keyrockAccessToken = data.access_token;
        localStorage.setItem('keyrock_access_token', this.keyrockAccessToken);
      }
      callback(this.keyrockAccessToken != null);
    });
  }

  serviceStoreLogin(callback: Function) {
    this.http.post<any>('/servicestore/login', `{"email":"${config.serviceStoreUser}","password":"${config.serviceStorePass}"}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).subscribe(r => {
      callback();
    });
  }

  smartConnectorCreate(callback: Function) {
    let data = {
      "knowledgeBaseId": config.knowledgeBaseId,
      "knowledgeBaseName": "Test KB Answer",
      "knowledgeBaseDescription": "This is a detailed description",
      "reasonerEnabled": true
    }
    this.http.post<any>('/smartconnector/create', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).subscribe(r => {
      callback();
    });
  }

  smartConnectorRegisterInteraction(graphPattern: string, callback: Function) {
    let data = {
      "knowledgeInteractionType": "AnswerKnowledgeInteraction",
      "knowledgeInteractionName": "test-answer",
      "graphPattern": graphPattern
    };
    this.http.post<any>('/smartconnector/ki/register-ask-answer', data, {
      headers: {
        'Content-Type': 'application/json',
        'KnowledgeBaseId': config.knowledgeBaseId
      }
    }).subscribe(r => {
      if (!!r.knowledgeInteractionId) {
        this.knowledgeInteractionId = r.knowledgeInteractionId;
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  smartConnectorHandleStart(callback: Function) {
    this.http.get<any>('/smartconnector/handle/start', {
      headers: {
        'Content-Type': 'application/json',
        'KnowledgeBaseId': config.knowledgeBaseId
      }
    }).subscribe((r) => {
      callback(r);
    });
  }

  smartConnectorHandleSend(handleRequestId: number, bindingSet: any, callback: Function) {

    let data: any = {
      "handleRequestId": handleRequestId,
      "bindingSet": bindingSet
    };
    
    this.http.post<any>('/smartconnector/handle/send', JSON.stringify(data), {
      headers: {
        "KnowledgeBaseId": config.knowledgeBaseId,
        "KnowledgeInteractionId": this.knowledgeInteractionId,
        'Content-Type': 'application/json'
      }
    }).subscribe(r => {
      callback(r);
    });
  }

  serviceStoreListServices(callback: Function) {
    if (!this.serviceStoreAccessToken) {
      this.serviceStoreLogin(() => {
        this.http.get<any>('servicestore/service-list').subscribe(r => {
          callback(r);
        });
      });
    } else {
      this.http.get<any>('servicestore/service-list').subscribe(r => {
        callback(r);
      });
    }
  }
}
