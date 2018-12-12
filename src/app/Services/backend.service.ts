import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  url: string = '/api/';
  searchResults: any;
  category: string;

  constructor(private http: HttpClient) {}

  //// HTTP BACKEND ROUTES ////

  getGarden() {
    const getUrl = this.url + 'garden';
    return this.http.get(getUrl).toPromise();
  }

  getMarketplace() {
    const getUrl = this.url + 'marketplace';
    return this.http.get(getUrl).toPromise();
  }

  getMarketplaceCrops() {
    const getUrl = this.url + 'marketplace/crops';
    return this.http.get(getUrl).toPromise();
  }

  getStand(id) {
    const getUrl = this.url + `user/${id}/stand`;
    return this.http.get(getUrl).toPromise();
  }

  getUserProfile(id) {
    const getUrl = this.url + `user/${id}`;
    return this.http.get(getUrl).toPromise();
  }

  getCrop(id) {
    const getUrl = this.url + `crops/${id}`;
    return this.http.get(getUrl).toPromise();
  }

  getMessages() {
    const getUrl = this.url + `user/messages`;
    return this.http.get(getUrl).toPromise();
  }

  getConversations() {
    const getUrl = this.url + `user/conversations`;
    return this.http.get(getUrl).toPromise();
  }

  getSentConversations() {
    const getUrl = this.url + `user/sentConversations`;
    return this.http.get(getUrl).toPromise();
  }

  getConversation(id) {
    const getUrl = this.url + `user/conversations/${id}`;
    return this.http.get(getUrl).toPromise();
  }

  sendMessage(content, id) {
    const postUrl = this.url + `user/messages/${id}`;
    return this.http.post(postUrl, content).toPromise();
  }

  getRecentCrops() {
    const getUrl = this.url + `crops`;
    return this.http.get(getUrl).toPromise();
  }

  addCrop(data) {
    //create a form to send to the backend
    const form = new FormData();
    form.append('garden_description', data.garden_description);
    form.append('watering', data.watering);
    form.append('month', data.month);
    form.append('day', data.day);
    form.append('year', data.year);
    form.append('plant', data.plant);
    data.photo.map(photo => {
      form.append('photo', photo);
    });

    const postUrl = this.url + 'crops';
    return this.http.post(postUrl, form).toPromise();
  }

  login(data) {
    const loginUrl = this.url + 'login';
    return this.http.post(loginUrl, data).toPromise();
  }

  checkValidRegistration(data) {
    const validateRegistrationUrl = this.url + 'validate';
    return this.http.post(validateRegistrationUrl, data).toPromise();
  }

  register(data) {
    //create a form for backend to handle
    const form = new FormData();
    form.append('username', data.username);
    form.append('password', data.password);
    form.append('city', data.city);
    form.append('state', data.state);
    form.append('email', data.email);
    form.append('first_name', data.first_name);
    form.append('last_name', data.last_name);
    if (data.photo) {
      form.append('photo', data.photo);
    }

    const registerUrl = this.url + 'register';
    return this.http.post(registerUrl, form).toPromise();
  }

  logout() {
    const logoutUrl = this.url + 'logout';
    return this.http.get(logoutUrl).toPromise();
  }

  deleteCrop(id) {
    const delUrl = this.url + `crops/${id}`;
    return this.http.delete(delUrl).toPromise();
  }

  getPlants() {
    const plantsUrl = this.url + 'garden/plants';
    return this.http.get(plantsUrl).toPromise();
  }

  editUser(data) {
    const userUrl = this.url + 'user/addStand';
    return this.http.put(userUrl, data).toPromise();
  }

  updateWateringDays(data) {
    const waterUrl = this.url + 'garden/water';
    return this.http.put(waterUrl, data).toPromise();
  }

  moveToStand(id, data) {
    //create a form for backend to handle registration
    const form = new FormData();
    form.append('check', data.check);
    form.append('description', data.description);
    form.append('details', data.details);
    form.append('inventory', data.inventory);
    form.append('price', data.price);
    if (data.selectedForStand) {
      data.selectedForStand.map(photo => {
        form.append('links', photo);
      });
    }
    if (data.uploadForStand) {
      data.uploadForStand.map(photo => {
        form.append('photo', photo);
      });
    }
    const moveUrl = this.url + `crops/${id}/move`;
    return this.http.put(moveUrl, form).toPromise();
  }

  editGardenCrop(data) {
    // create form to allow backend to make edits
    const form = new FormData();
    form.append('garden_description', data.garden_description);
    form.append('id', data.id);
    form.append('newWaterDate', data.newWaterDate);
    form.append('watering_interval', data.watering_interval);

    //if there are photos, append them to the form
    if (data.photos) {
      data.photos.map(photo => {
        form.append('photo', photo);
      });
    }
    if (data.photosToDelete) {
      data.photosToDelete.map(photo => {
        form.append('delete', photo);
      });
    }
    const editUrl = this.url + `garden/crop/${data.id}`;
    return this.http.put(editUrl, form).toPromise();
  }

  search(data) {
    this.category = data.category;
    const searchUrl = `${this.url}crops/search/${data.searchInput}`;
    return this.http.post(searchUrl, data).toPromise();
  }

  results(data) {
    return (this.searchResults = data);
  }

  transferResults() {
    let results = {};
    results['searchResults'] = this.searchResults;
    results['category'] = this.category;
    return results;
  }

  editStandCrop(data) {
    // create form to allow backend to make edits
    const form = new FormData();
    form.append('description', data.description);
    form.append('id', data.id);
    form.append('details', data.details);
    form.append('inventory', data.inventory);
    form.append('price', data.price);
    //if there are photos, append them to the form
    if (data.photos) {
      data.photos.map(photo => {
        form.append('photo', photo);
      });
    }
    if (data.photosToDelete) {
      data.photosToDelete.map(photo => {
        form.append('delete', photo);
      });
    }
    const editUrl = this.url + `crops/${data.id}`;
    return this.http.put(editUrl, form).toPromise();
  }

  postDirectlyToStand(data) {
    // create form to allow backend to make edits
    const form = new FormData();
    form.append('description', data.description);
    form.append('details', data.details);
    form.append('inventory', data.inventory);
    form.append('price', data.price);
    form.append('plant', data.plant);
    //if there are photos, append them to the form
    if (data.photos) {
      data.photos.map(photo => {
        form.append('photo', photo);
      });
    }

    const postUrl = this.url + 'crops/stand';
    return this.http.post(postUrl, form).toPromise();
  }

  editUserProfile(data) {
    const form = new FormData();
    form.append('id', data.id);
    //check if data has certain values
    if (data.oldPass) {
      form.append('oldPass', data.oldPass);
      form.append('newPass', data.newPass);
      form.append('valPass', data.valPass);
    } else if (data.city) {
      form.append('city', data.city);
      form.append('state', data.state);
      form.append('stand_name', data.stand_name);
    } else if (data.bio || data.photo) {
      form.append('bio', data.bio);
      form.append('photo', data.photo);
    }
    // } else if (data.photo) {
    const editUrl = this.url + `user/${data.id}`;
    return this.http.put(editUrl, form).toPromise();
  }
}
