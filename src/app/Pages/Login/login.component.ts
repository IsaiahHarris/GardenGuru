import { Component, OnInit } from '@angular/core';
import { AuthServiceReg } from '../../Services/auth.service';
import { Router } from '@angular/router';
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginError: boolean = false;

  loginFormData: {
    username: string;
    password: string;
  } = {
    username: '',
    password: ''
  };

  constructor(private auth: AuthServiceReg, private router: Router) {}

  //logs a user in
  login() {
    return this.auth
      .login(this.loginFormData)
      .then(response => {
        return this.router.navigate(['/garden']);
      })
      .catch(err => {
        this.loginError = true;
        console.log(err);
      });
  }
}
