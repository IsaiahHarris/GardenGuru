import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  user: {
    id: number;
    loggedIn: boolean;
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    city: string;
    state: string;
    stand_name: string;
    rating: number;
  } = {
    id: 0,
    loggedIn: false,
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    state: '',
    stand_name: '',
    rating: -1
  };

  constructor() {
    let userString = window.localStorage.getItem('user');
    try {
      if (userString) {
        this.user = JSON.parse(userString);
      } else {
        console.log('');
      }
    } catch (err) {
      console.log('Could not parse user');
    }
  }

  //get logged in user

  getSession() {
    return this.user;
  }

  //set a users session on local storage

  setSession(data) {
    this.user.id = data.id;
    this.user.loggedIn = true;
    this.user.username = data.username;
    this.user.first_name = data.first_name;
    this.user.last_name = data.last_name;
    this.user.rating = data.rating;
    this.user.bio = data.bio;
    this.user.city = data.city;
    this.user.state = data.state;
    this.user.stand_name = data.stand_name;

    let userString = JSON.stringify(this.user);
    window.localStorage.setItem('user', userString);
  }

  //logout clear a users session

  clearSession() {
    this.user.loggedIn = false;
    this.user.username = '';
    this.user.first_name = '';
    this.user.last_name = '';
    this.user.rating = -1;
    this.user.bio = '';
    this.user.city = '';
    this.user.state = '';
    this.user.stand_name = '';
    window.localStorage.removeItem('user');
  }

  //check if a user is logged in

  isLoggedIn() {
    return this.user.loggedIn;
  }
}
