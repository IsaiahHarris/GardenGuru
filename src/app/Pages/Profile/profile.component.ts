import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../Services/backend.service';
import { SessionService } from '../../Services/session.service';
import { ActivatedRoute } from '@angular/router';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  urlId: string;
  user: any;
  profile: any;
  correctUser: boolean = false;
  showingSettings: boolean = false;
  changingPass: boolean = false;
  changingLocation: boolean = false;
  changingStandName: boolean = false;
  changingProfilePic: boolean = false;
  isLoggedIn: boolean = false;
  cities: string[] = [
    'Aiea',
    'Ewa Beach',
    'Haleiwa',
    'Hawaii Kai',
    'Honolulu',
    'Kaneohe',
    'Kahala',
    'Kailua',
    'Kapolei',
    'Manoa',
    'Mililani',
    'Nanakuli',
    'Pearl City',
    'Wahiawa',
    'Waialua',
    'Waimanalo',
    'Waipahu'
  ];
  states: string[] = ['HI'];

  //errors
  userStandError: boolean = false;

  generalSettingsError: boolean = false;

  oldPasswordError: boolean = false;
  newPasswordError: boolean = false;
  confirmNewPasswordError: boolean = false;
  matchingPasswordError: boolean = false;
  sameOldNewPasswordError: boolean = false;

  locationError: boolean = false;
  standError: boolean = false;
  profileError: boolean = false;

  placeholderImg: string =
    'https://www.myfirestorm.com/img/placeholder_user.png';

  passwordFormData: {
    oldPass: string;
    newPass: string;
    valPass: string;
  } = {
    oldPass: '',
    newPass: '',
    valPass: ''
  };

  locationFormData: {
    city: string;
    state: string;
  } = {
    city: '',
    state: ''
  };

  standFormData: {
    stand_name: string;
  } = {
    stand_name: ''
  };

  profileFormData: {
    bio: string;
    photo: File;
  } = {
    bio: '',
    photo: null
  };

  showLoading: boolean = false;

  constructor(
    private backend: BackendService,
    private session: SessionService,
    private route: ActivatedRoute
  ) {
    this.user = this.session.getSession();
    this.locationFormData = this.user;
    this.standFormData = this.user;
    this.isLoggedIn = this.session.isLoggedIn();
  }

  ngOnInit() {
    // resets errors and forms
    this.userStandError = false;
    this.generalSettingsError = false;
    this.oldPasswordError = false;
    this.newPasswordError = false;
    this.confirmNewPasswordError = false;
    this.matchingPasswordError = false;
    this.sameOldNewPasswordError = false;
    this.locationError = false;
    this.standError = false;
    this.profileError = false;
    this.passwordFormData.oldPass = '';
    this.passwordFormData.newPass = '';
    this.passwordFormData.valPass = '';
    this.locationFormData.city = this.user.city;
    this.locationFormData.state = this.user.state;
    this.profileFormData.photo = null;
    this.urlId = this.route.snapshot.paramMap.get('id');

    //check to see if user owns that profile
    if (this.urlId === `${this.user.id}`) {
      this.correctUser = true;
    }
    if (!this.user.stand_name) {
      this.userStandError = true;
    }
    return this.backend.getUserProfile(this.urlId).then(user => {
      if (!user['avatar_link']) {
        user['avatar_link'] = this.placeholderImg;
      }
      this.profile = user;
      if (!this.profile.bio || this.profile.bio === 'null') {
        this.profile.bio = '';
      } else {
        this.profileFormData.bio = this.profile.bio;
      }
      this.standFormData.stand_name = this.profile.stand_name;
    });
  }

  submitChanges() {
    // Edit Password
    if (this.changingPass) {
      this.oldPasswordError = false;
      this.newPasswordError = false;
      this.confirmNewPasswordError = false;
      this.matchingPasswordError = false;
      this.sameOldNewPasswordError = false;
      this.generalSettingsError = false;

      if (this.passwordFormData.oldPass.length < 5) {
        this.oldPasswordError = true;
      }
      if (this.passwordFormData.newPass.length < 5) {
        this.newPasswordError = true;
      }
      if (this.passwordFormData.valPass.length < 5) {
        this.confirmNewPasswordError = true;
      }
      if (this.passwordFormData.newPass !== this.passwordFormData.valPass) {
        this.matchingPasswordError = true;
      }
      if (
        this.passwordFormData.oldPass === this.passwordFormData.newPass &&
        this.passwordFormData.oldPass === this.passwordFormData.valPass
      ) {
        this.sameOldNewPasswordError = true;
      }

      if (
        this.oldPasswordError ||
        this.newPasswordError ||
        this.confirmNewPasswordError ||
        this.matchingPasswordError ||
        this.sameOldNewPasswordError
      ) {
        return (this.generalSettingsError = true);
      }

      this.showLoading = true;
      this.passwordFormData['id'] = this.user.id;
      return this.backend
        .editUserProfile(this.passwordFormData)
        .then(result => {
          this.showLoading = false;
          if ((result['success'] = false)) {
            this.oldPasswordError = false;
            this.newPasswordError = false;
            this.confirmNewPasswordError = false;
            this.matchingPasswordError = false;
            this.sameOldNewPasswordError = false;
            this.generalSettingsError = false;
            return (this.changingPass = true);
          } else {
            this.ngOnInit();
            this.changingPass = false;
            this.showingSettings = false;
          }
        })
        .catch(err => {
          this.showLoading = false;
          console.log(err);
        });
      // Edit Location
    } else if (this.changingLocation) {
      this.locationError = false;

      if (!this.locationFormData.city || !this.locationFormData.state) {
        return (this.locationError = true);
      }

      this.showLoading = true;
      this.locationFormData['id'] = this.user.id;
      return this.backend
        .editUserProfile(this.locationFormData)
        .then(result => {
          this.showLoading = false;
          if ((result['success'] = false)) {
            this.changingLocation = false;
          } else {
            this.ngOnInit();
            this.changingLocation = false;
            this.showingSettings = false;
          }
        })
        .catch(err => {
          this.showLoading = false;
          console.log(err);
        });
      // Edit Stand Name
    } else if (this.changingStandName) {
      this.standError = false;
      if (!this.standFormData.stand_name) {
        this.standFormData.stand_name = `${this.user.first_name}'s Stand`;
      }
      if (
        this.standFormData.stand_name.length < 5 &&
        this.standFormData.stand_name
      ) {
        return (this.standError = true);
      }
      this.showLoading = true;
      this.standFormData['id'] = this.user.id;
      return this.backend
        .editUserProfile(this.standFormData)
        .then(result => {
          this.showLoading = false;
          if ((result['success'] = false)) {
            this.changingStandName = false;
          } else {
            this.ngOnInit();
            this.changingStandName = false;
            this.showingSettings = false;
          }
        })
        .catch(err => {
          this.showLoading = false;
          console.log(err);
        });
      //Edit Profile Picture
    } else if (this.changingProfilePic) {
      this.profileError = false;

      if (!this.profileFormData.bio) {
        this.profileFormData.bio = this.user.bio;
      }
      this.showLoading = true;
      this.profileFormData['id'] = this.user.id;
      return this.backend
        .editUserProfile(this.profileFormData)
        .then(result => {
          this.showLoading = false;
          if ((result['success'] = false)) {
            this.changingProfilePic = false;
          } else {
            this.ngOnInit();
            this.changingProfilePic = false;
            this.showingSettings = false;
          }
        })
        .catch(err => {
          this.showLoading = false;
          console.log(err);
        });
    }
  }

  //show a users settings

  showSettings() {
    this.ngOnInit();
    if (this.showingSettings && this.changingLocation) {
      return (this.changingLocation = false);
    } else if (this.showingSettings && this.changingPass) {
      return (this.changingPass = false);
    } else if (this.showingSettings && this.changingProfilePic) {
      return (this.changingProfilePic = false);
    } else if (this.showingSettings && this.changingStandName) {
      return (this.changingStandName = false);
    } else if (
      this.showingSettings &&
      (!this.changingPass &&
        !this.changingLocation &&
        !this.changingProfilePic &&
        !this.changingStandName)
    ) {
      return (this.showingSettings = false);
    } else {
      return (this.showingSettings = true);
    }
  }

  handleSettings(event) {
    switch (event.target.innerHTML) {
      case 'Change Password':
        this.changingPass = true;
        break;
      case 'Change Location':
        this.changingLocation = true;
        break;
      case 'Change Stand Name':
        this.changingStandName = true;
        break;
      case 'Change Profile Picture':
        this.changingProfilePic = true;
        break;
      default:
        this.changingLocation = false;
        this.changingPass = false;
        this.changingProfilePic = false;
        this.changingStandName = false;
        break;
    }
  }

  //cancel changes

  cancel() {
    this.showingSettings = false;
    this.changingLocation = false;
    this.changingPass = false;
    this.changingProfilePic = false;
    this.changingStandName = false;
  }

  saveNewPhoto(event) {
    this.profileFormData.photo = event.target.files[0];
  }
}
