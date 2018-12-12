import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceReg {
  constructor(
    private backend: BackendService,
    private session: SessionService
  ) {}

  //login register and logout methods that talk to backend
  register(data) {
    return this.backend.register(data);
  }

  login(data) {
    return this.backend.login(data).then(user => {
      if (user) {
        return this.session.setSession(user);
      }
    });
  }

  logout() {
    return this.backend.logout().then(response => {
      return this.session.clearSession();
    });
  }
}
