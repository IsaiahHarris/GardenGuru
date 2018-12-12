import { Component } from '@angular/core';
import { AuthServiceReg } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { BackendService } from '../../Services/backend.service';
import { SessionService } from '../../Services/session.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  // error catchers
  generalRegisterError: boolean = false;
  usernameError: boolean = false;
  takenUsername: boolean = false;
  invalidUsername: boolean = false;
  passwordError: boolean = false;
  realNameError: boolean = false;
  emailError: boolean = false;
  takenEmail: boolean = false;
  locationError: boolean = false;
  error: boolean = false;

  cities: string[] = ['Aiea', 'Ewa Beach', 'Haleiwa', 'Hawaii Kai', 'Honolulu', 'Kaneohe', 'Kahala', 'Kailua', 'Kapolei', 'Manoa', 'Mililani', 'Nanakuli', 'Pearl City', 'Wahiawa', 'Waialua', 'Waimanalo', 'Waipahu']
  states: string[] = ['HI']

  registerFormData: {
    username: string;
    password: string;
    city: string;
    state: string;
    email: string;
    first_name: string;
    last_name: string;
    photo: File
  } = {
      username: '',
      password: '',
      city: '',
      state: '',
      email: '',
      first_name: '',
      last_name: '',
      photo: null
    };

  //loading stuff
  showLoading: boolean = false;
  loggingIn: boolean = false;

  constructor(
    private auth: AuthServiceReg,
    private router: Router,
    private backend: BackendService,
    private session: SessionService
  ) { }

  register() {
    this.generalRegisterError = false;
    this.usernameError = false;
    this.invalidUsername = false;
    this.passwordError = false;
    this.realNameError = false;
    this.emailError = false;

    this.locationError = false;
    this.error = false;

    if (this.registerFormData.username.length < 5) {
      this.usernameError = true;
    }
    if (this.registerFormData.username.match(/[^a-z0-9]+/gi)) {
      this.invalidUsername = true;
    }
    if (this.registerFormData.password.length < 5) {
      this.passwordError = true;
    }
    if (this.registerFormData.first_name.length < 2 || this.registerFormData.last_name.length < 2) {
      this.realNameError = true;
    }
    if (!this.registerFormData.email || !this.registerFormData.email.match(/[a-z0-9]+@[a-z0-9]+\.[a-z0-9]+/gi)) {
      this.emailError = true;
    }
    if (!this.registerFormData.city || !this.registerFormData.state) {
      this.locationError = true;
    }

    if (
      this.usernameError ||
      this.invalidUsername ||
      this.passwordError ||
      this.realNameError ||
      this.emailError ||
      this.locationError
    ) {
      return this.generalRegisterError = true;
    }

    this.registerFormData.username = this.registerFormData.username.toLowerCase();
    this.registerFormData.password = this.registerFormData.password.toLowerCase();
    this.showLoading = true;
    return this.auth.register(this.registerFormData)
      .then(result => {
        if (result['success']) {
          return result
          //error handling here for failed registration
        }
      })
      .then(() => {
        this.loggingIn = true;
        let login = {
          username: this.registerFormData.username,
          password: this.registerFormData.password
        }
        return this.backend.login(login)
      })
      .then(result => {
        this.showLoading = false;
        if (result) {
          this.session.setSession(result)
          return this.router.navigate(['/marketplace'])
        }
      })
      .catch(err => {
        this.showLoading = false;
        console.log(err)
        return this.error = true;
      })
  }

  getPhotoFile(event) {
    let file = event.target.files[0];
    this.registerFormData.photo = file;
  }
}
