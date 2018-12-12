import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  //guard routes if a user is not logged in

  canActivate() {
    if (this.session.user.loggedIn) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
