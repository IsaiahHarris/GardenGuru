import { Component, OnInit, HostListener } from '@angular/core';
import { BackendService } from '../../Services/backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../Services/session.service';
import { AuthServiceReg } from '../../Services/auth.service';
@Component({
  templateUrl: './gardenCrop.component.html',
  styleUrls: ['./gardenCrop.component.scss']
})
export class GardenCropComponent implements OnInit {
  user: object;
  cropId: string;
  loggedIn: boolean = false;
  crop: object;
  date: any;
  movingToStand: boolean = false;
  editId;
  check: boolean = true;
  correctUser: boolean = false;

  //error checkers
  editGardenDescriptionError: boolean = false;
  moveDescriptionError: boolean = false;
  moveDetailsError: boolean = false;
  moveInventoryError: boolean = false;
  moveInventoryDataError: boolean = false;
  moveGeneralError: boolean = false;

  //view switchers
  gardenEditing: boolean = false;

  //handles water and harvesting, converted/parsed dates only
  wateringDate: string;
  harvestDate: string;
  newWaterDate: any;

  //photo view and edit
  photos: string[] = [];
  currentPhoto: string;
  hasPhoto: boolean = false;
  photosToDelete: string[] = [];

  //photo upload
  photosToUpload: File[] = [];
  acceptableExtensions: string[] = ['.jpg', '.png', '.jpeg']
  acceptableSize: number = 1000000000;
  showPhotoError: boolean = false;
  unacceptablePhoto: string = 'File format not accepted, please upload .jpg, .jpeg, or .png';
  unacceptableSize: string = 'File size exceeded, max 1GB'
  photoErrors: string[] = [];

  //photos selected to be moved to garden
  photosToStand: File[] = [];
  selectedForStand: string[] = [];

  // delete confirmation
  confirmDelete: boolean = false;

  //form data
  gardenEditFormData: {
    garden_description: string;
    watering_interval: number;
  } = {
      garden_description: '',
      watering_interval: 0
    };

  moveFormData = {
    description: '',
    details: '',
    price: '',
    inventory: 0,
    check: this.check
  };

  showLoading: boolean = false;

  @HostListener('document:click', ['$event'])
  clickout(event) {
    document.getElementById('modal-content');
    document.getElementById('content-container');
    if (event.target === document.getElementById('modal-container')) {
      this.movingToStand = !this.movingToStand;
    }
  }

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private session: SessionService,
    private auth: AuthServiceReg,
    private router: Router
  ) {
    this.user = this.session.getSession();
    this.loggedIn = this.session.isLoggedIn();
    this.date = new Date();
  }

  ngOnInit() {
    this.cropId = this.route.snapshot.paramMap.get('id');
    return this.backend.getCrop(this.cropId)
      .then(result => {
        this.crop = result;
        if (this.crop['owner_id'] === Number(this.user['id'])) {
          this.correctUser = true;
        }
        //gets photo links to be displayed on page
        if (this.crop['photo'].length > 0) {
          this.crop['photo'].map(photo => {
            this.photos.push(photo.link);
          })
          this.currentPhoto = this.photos[0];
          this.hasPhoto = true;
        } else {
          this.hasPhoto = false;
        }
        //parsing date
        this.wateringDate = result['watering_date'];
        this.wateringDate = this.crop['watering_date'].slice(0, 10);
        this.harvestDate = this.crop['harvest_date'].slice(0, 10);
      });
  }

  toggleCheck() {
    this.check = !this.check
    this.moveFormData.check = !this.moveFormData.check
  }

  toggleEdit(crop) {
    if (crop) {
      this.editId = crop.id;
    }
    this.movingToStand = !this.movingToStand;
  }

  toggleDeleteConfirmation() {
    if (this.confirmDelete) {
      return this.confirmDelete = false;
    } else {
      return this.confirmDelete = true;
    }
  }

  deleteCrop() {
    this.backend.deleteCrop(this.cropId).then(result => {
      if (result['success']) {
        return this.router.navigate(['/garden']);
      }
    });
  }

  moveToStand() {
    const checked = this.moveFormData.check
    this.moveDescriptionError = false;
    this.moveDetailsError = false;
    this.moveInventoryError = false;
    this.moveInventoryDataError = false;
    this.moveGeneralError = false;
    this.moveFormData.inventory = Number(this.moveFormData.inventory);

    // Replaces bad data
    if (!this.moveFormData.inventory) {
      this.moveFormData.inventory = 0;
    }
    if (this.moveFormData.price === '') {
      this.moveFormData.price = 'Message me for more details!'
    }

    // Barrier check for separate errors
    if (this.moveFormData.details.length < 1) {
      this.moveDetailsError = true;
    }
    if (this.moveFormData.inventory < 1) {
      this.moveInventoryError = true;
    }
    if (this.moveFormData.description.length < 1) {
      this.moveDescriptionError = true;
    }

    // Barrier check against all errors
    if (this.moveDetailsError || this.moveInventoryError || this.moveDescriptionError) {
      return this.moveGeneralError = true;
    }
    
    this.moveFormData['selectedForStand'] = this.selectedForStand;
    this.moveFormData['uploadForStand'] = this.photosToStand;
    this.showLoading = true;
    this.backend.moveToStand(this.cropId, this.moveFormData)
      .then(response => {
        this.showLoading = false;
        this.router.navigate([`/user/${this.user['id']}/stand`])
      })
      .catch(err => {
        this.showLoading = false;
        console.log('Error :', err.message);
      });
  }

  editGardenCrop() {
    //need to reset photosToDelete to prevent bug from unwanted photo removals
    this.photosToDelete.length = 0;
    this.gardenEditing = true;
    this.gardenEditFormData.watering_interval = this.crop['watering_interval'];
    this.gardenEditFormData.garden_description = this.crop['garden_description'];
  }

  submitGardenEdit() {
    this.showLoading = true;
    this.editGardenDescriptionError = false;

    if (this.gardenEditFormData.garden_description.length < 1) {
      return this.editGardenDescriptionError = true;
    }
    //if watering interval was changed, then update new watering date
    if (this.newWaterDate) {
      this.gardenEditFormData['newWaterDate'] = this.newWaterDate;
    } else {
      this.gardenEditFormData['newWaterDate'] = this.wateringDate;
    }
    //if there are photos to delete, then attach to body
    if (this.photosToDelete) {
      this.gardenEditFormData['photosToDelete'] = this.photosToDelete;
    }
    if (this.photosToUpload) {
      this.gardenEditFormData['photos'] = this.photosToUpload;
    }
    this.gardenEditFormData['id'] = this.cropId;
    return this.backend.editGardenCrop(this.gardenEditFormData)
      .then(result => {
        //reset values
        this.showLoading = false;
        this.photos.length = 0;
        this.photosToUpload.length = 0;
        this.photosToDelete.length = 0;
        this.ngOnInit();
        this.gardenEditing = false;
      })
      .catch(err => {
        this.showLoading = false;
        console.log(err);
      })
  }

  cancel() {
    this.photosToDelete.length = 0;
    this.photosToUpload.length = 0;
    this.gardenEditing = false;
  }

  cancelStand() {
    this.photosToStand.length = 0;
    this.selectedForStand.length = 0;
    this.movingToStand = false;
  }

  recalculateDate(date, days) {
    let newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + Number(days)
    );
    let dateToModify = newDate.toLocaleDateString();
    let newDay = ('0' + new Date(dateToModify).getDate()).slice(-2);
    let newMonth = ('0' + (new Date(dateToModify).getMonth() + 1)).slice(-2);
    let newYear = new Date(dateToModify).getFullYear();
    let modifiedDate = `${newYear}-${newMonth}-${newDay}`;
    return (this.newWaterDate = modifiedDate);
  }

  getNewWaterDate() {
    if (this.newWaterDate) {
      return this.newWaterDate;
    }
    return this.wateringDate;
  }

  //photo carousel
  previousPhoto() {
    let index = this.photos.indexOf(this.currentPhoto);
    if ((index - 1) < 0) {
      return this.currentPhoto = this.photos[this.photos.length - 1]
    }
    return this.currentPhoto = this.photos[index - 1]
  }

  nextPhoto() {
    let index = this.photos.indexOf(this.currentPhoto);
    if ((index + 1) === this.photos.length) {
      return this.currentPhoto = this.photos[0]
    }
    return this.currentPhoto = this.photos[index + 1]
  }

  imageCounter() {
    let index = this.photos.indexOf(this.currentPhoto);
    return `${index + 1} of ${this.photos.length} images`
  }

  tagForRemoval() {
    if (this.photosToDelete.length < this.photos.length) {
      return this.photosToDelete.push(this.currentPhoto);
    }
  }

  getPhotosToDelete() {
    if (this.photosToDelete.length !== 0 && this.photosToDelete.length < this.photos.length) {
      return `${this.photosToDelete.length} images selected`;
    } else if (this.photosToDelete.length >= this.photos.length) {
      this.photosToDelete = this.photos
      return `${this.photosToDelete.length} images selected`
    } else {
      document.getElementById('photos-marked').style.display === 'none';
    }
  }

  getPhotoErrors() {
    return this.photoErrors.join(', ');
  }

  updatePhotoList(event) {
    let file = event.target.files[0];
    let fileSize = file.size
    let dot = file.name.indexOf('.');
    let extension = file.name.slice(dot, file.name.length);
    if (this.acceptableExtensions.includes(extension.toLowerCase())) {
      if (fileSize < this.acceptableSize) {
        if (!this.movingToStand) {
          return this.photosToUpload.push(file);
        } else {
          return this.photosToStand.push(file);
        }
      } else {
        return this.photoErrors.push(this.unacceptableSize);
      }
    } else {
      return this.photoErrors.push(this.unacceptablePhoto)
    }
  }

  selectPhoto(event) {
    if (!this.selectedForStand.includes(event.target.src)) {
      this.selectedForStand.push(event.target.src)
      event.target.style.border = '3px solid #2c84fc'
    } else {
      let index = this.selectedForStand.indexOf(event.target.src);
      this.selectedForStand.splice(index, 1);
      event.target.style.border = 'none';
    }
  }
}
