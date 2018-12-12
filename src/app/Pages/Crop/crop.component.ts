import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../Services/backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../Services/session.service';

@Component({
  templateUrl: './crop.component.html',
  styleUrls: ['./crop.component.scss']
})
export class CropComponent implements OnInit {
  userId: string;
  cropId;
  loggedIn: boolean = false;
  crop: object;
  user;
  //boolean to check session user against page user
  correctUser: boolean = false;

  //boolean to show/hide modal
  standEditing: boolean = false;

  //photo stuff
  //array of links to photos - for display
  photos: string[] = [];
  //used to allow for photo carousel to work
  currentPhoto: string;
  //boolean to check whether crop has photo or not
  hasPhoto: boolean = false;
  //holds array of links for photos to be deleted
  photosToDelete: string[] = [];
  //holds File types to be uploaded with multer on backend
  photosToUpload: File[] = [];

  standCropFormData: {
    description: string;
    price: string;
    inventory: number;
    details: string;
  } = {
    description: '',
    price: '',
    inventory: null,
    details: ''
  };

  //show/hide delete modal
  confirmDelete: boolean = false;

  //show loading animation modal
  showLoading: boolean = false;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private session: SessionService
  ) {
    this.user = session.getSession();
    this.loggedIn = this.session.isLoggedIn();
  }

  ngOnInit() {
    this.cropId = this.route.snapshot.paramMap.get('id');
    return this.backend.getCrop(this.cropId).then(result => {
      this.crop = result;
      //check if crop owner is the same as session user
      if (this.crop['owner_id'] === Number(this.user.id)) {
        this.correctUser = true;
      }
      //if crop has photos, then push the links to array for carousel functionality
      if (this.crop['photo'].length > 0) {
        this.photos.length = 0;
        this.crop['photo'].map(photo => {
          this.photos.push(photo.link);
        });
        //set the first photo displayed to be the first photo in photos array
        this.currentPhoto = this.photos[0];
        this.hasPhoto = true;
      } else {
        //otherwise don't show photo elements in HTML
        this.hasPhoto = false;
      }
    });
  }

  //crop selling status would be changed to false
  deleteCrop() {
    this.backend.deleteCrop(this.cropId).then(result => {
      return this.router.navigate([`/user/${this.crop['owner_id']}/stand`]);
    });
  }

  //show/hide delete modal
  toggleDeleteConfirmation(id) {
    if (this.confirmDelete) {
      return (this.confirmDelete = false);
    } else {
      return (this.confirmDelete = true);
    }
  }

  //edit a crop methods
  editCrop() {
    if (this.standEditing) {
      //reset values before turning off stand-editing to prevent previous edit data to mess with new edit data
      this.photosToDelete.length = 0;
      this.photosToUpload.length = 0;
      this.ngOnInit();
      return (this.standEditing = false);
    }
    this.standCropFormData.description = this.crop['description'];
    this.standCropFormData.price = this.crop['price'];
    this.standCropFormData.inventory = this.crop['inventory'];
    this.standCropFormData.details = this.crop['details'];
    return (this.standEditing = true);
  }

  submitStandCropEdit() {
    if (this.photosToDelete) {
      this.standCropFormData['photosToDelete'] = this.photosToDelete;
    }
    if (this.photosToUpload) {
      this.standCropFormData['photos'] = this.photosToUpload;
    }
    this.standCropFormData['id'] = this.cropId;
    this.showLoading = true;
    return this.backend
      .editStandCrop(this.standCropFormData)
      .then(result => {
        //resetting values
        this.showLoading = false;
        this.photos.length = 0;
        this.photosToUpload.length = 0;
        this.photosToDelete.length = 0;
        this.ngOnInit();
        this.standEditing = false;
      })
      .catch(err => {
        this.showLoading = false;
        console.log(err);
      });
  }

  //photo handlers
  //scroll photos
  previousPhoto() {
    let index = this.photos.indexOf(this.currentPhoto);
    if (index - 1 < 0) {
      return (this.currentPhoto = this.photos[this.photos.length - 1]);
    }
    return (this.currentPhoto = this.photos[index - 1]);
  }

  //scroll photos
  nextPhoto() {
    let index = this.photos.indexOf(this.currentPhoto);
    if (index + 1 === this.photos.length) {
      return (this.currentPhoto = this.photos[0]);
    }
    return (this.currentPhoto = this.photos[index + 1]);
  }

  //display current displayed photo out of total
  imageCounter() {
    let index = this.photos.indexOf(this.currentPhoto);
    return `${index + 1} of ${this.photos.length} images`;
  }

  //displayed number of photos to be deleted
  getPhotosToDelete() {
    if (
      this.photosToDelete.length !== 0 &&
      this.photosToDelete.length < this.photos.length
    ) {
      return `${this.photosToDelete.length} images selected`;
    } else if (this.photosToDelete.length >= this.photos.length) {
      this.photosToDelete = this.photos;
      return `${this.photosToDelete.length} images selected`;
    } else {
      document.getElementById('photos-marked').style.display === 'none';
    }
  }

  //saves selected photos to be deleted
  tagForRemoval() {
    if (this.photosToDelete.length < this.photos.length) {
      return this.photosToDelete.push(this.currentPhoto);
    }
  }

  //if user wants to upload photo, update selected photo
  updatePhotoList(event) {
    let file = event.target.files[0];
    if (!this.photosToUpload.includes(file)) {
      return this.photosToUpload.push(file);
    }
  }
}
