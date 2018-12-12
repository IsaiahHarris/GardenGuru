import { Component, OnInit, HostListener } from '@angular/core';
import { BackendService } from '../../Services/backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../Services/session.service';
import { MatSnackBar } from '@angular/material';

@Component({
  templateUrl: './stand.component.html',
  styleUrls: ['./stand.component.scss']
})
export class StandComponent implements OnInit {
  urlId;
  crops;
  user;
  standOwner: object;
  correctUser: boolean = false;
  hasStand: boolean = false;
  emptyStand: boolean = false;
  badStandName: boolean = false;
  isEdit: boolean = false;
  buildStand: boolean;
  garden;
  showingGarden: boolean = false;
  cropId: string;
  // check: boolean = true;
  openMessage: boolean = false;
  conversationId: boolean = false;
  messageSentPopUp = '';
  postingCrop: boolean = false;
  isLoggedIn: boolean = false;
  placeholderImg: string =
    'https://www.myfirestorm.com/img/placeholder_user.png';

  // delete confirmation
  confirmDelete: boolean = false;
  itemToDelete: string;

  // error checks
  postCropError: boolean = false;
  plantError: boolean = false;
  descriptionError: boolean = false;
  inventoryError: boolean = false;
  detailsError: boolean = false;

  firstCropDescription: boolean = false;
  firstCropDetails: boolean = false;
  firstCropInventory: boolean = false;
  firstCropError: boolean = false;

  //crop photo values
  cropPhotos: string[] = [];
  //holds photos to upload
  photosToStand: File[] = [];
  //holds photos to carry over to stand
  selectedForStand: string[] = [];

  standFormdata: {
    stand_name: string;
  } = {
    stand_name: ''
  };

  check: boolean = true;

  moveFormData: {
    description: string;
    details: string;
    price: string;
    inventory: number;
  } = {
    description: '',
    details: '',
    price: '',
    inventory: 0
  };

  message: {
    content: string;
  } = {
    content: ''
  };

  postFormData: {
    plant: number;
    description: string;
    price: string;
    inventory: number;
    details: string;
    photos: File[];
  } = {
    plant: 0,
    description: '',
    price: '',
    inventory: 0,
    details: '',
    photos: []
  };

  plants: any;

  showLoading: boolean = false;

  plantNames: string[] = [];

  // modal host listener function

  @HostListener('click', ['$event'])
  clickout(event) {
    if (event.target === document.getElementById('modal-container')) {
      this.showingGarden = !this.showingGarden;
    }
    if (event.target === document.getElementById('message-modal-container')) {
      this.openMessage = !this.openMessage;
    }
    if (event.target === document.getElementById('add-modal-container')) {
      this.postingCrop = !this.postingCrop;
    }
  }

  constructor(
    private backend: BackendService,
    private router: Router,
    private route: ActivatedRoute,
    private session: SessionService,
    public popUp: MatSnackBar
  ) {
    router.events.subscribe(val => {
      this.ngOnInit();
    });
    this.user = this.session.getSession();
    this.isLoggedIn = this.session.isLoggedIn();
  }

  //send a user a message

  sendMessage() {
    if (this.message.content.length > 0) {
      this.backend.sendMessage(this.message, this.urlId).then(result => {
        this.openMessage = false;
        this.popUp.open('Message Sent!', 'Dismiss', { duration: 2000 });
        this.message.content = '';
      });
    }
  }

  ngOnInit() {
    this.messageSentPopUp = '';
    this.itemToDelete = '';
    this.emptyStand = false;
    this.urlId = this.route.snapshot.paramMap.get('id');
    //checks to see if the page belongs to logged in user
    if (this.urlId === this.user.id) {
      this.correctUser = true;
    }
    if (this.isLoggedIn) {
      this.showLoading = true;
    }
    //get the stand
    return this.backend
      .getStand(this.urlId)
      .then(result => {
        //if the user's stand doesn't exist/no stand
        if (
          result['message'] === `This user doesn't have a stand` &&
          !this.user
        ) {
          this.showLoading = false;
          return (this.hasStand = true);
        } else if (
          result['message'] === `This user doesn't have a stand` &&
          this.correctUser
        ) {
          this.showLoading = false;
          return (this.hasStand = false);
        } else if (result['message'] === `No items`) {
          this.showLoading = false;
          this.emptyStand = true;
          return (this.hasStand = true);
        } else {
          this.hasStand = true;
          this.standOwner = result[0].user;
          if (!this.standOwner['avatar_link']) {
            this.standOwner['avatar_link'] = this.placeholderImg;
          }
          this.sortCrops(result);
          let resultArr = Object.values(result);
          resultArr.map(crop => {
            if (crop.photo.length > 0) {
              crop.displayPhoto = crop.photo[0].link;
            }
          });
        }
      })
      .then(() => {
        this.backend.getGarden().then(result => {
          this.garden = result;
          this.garden.map(crop => {
            if (crop.photo.length > 0) {
              crop['mainPhoto'] = crop.photo[0].link;
            }
          });
          this.showLoading = false;
        });
      })
      .catch(err => {
        this.showLoading = false;
        console.log(err);
      });
  }

  addToStand() {
    this.plantError = false;
    this.descriptionError = false;
    this.inventoryError = false;
    this.detailsError = false;
    this.postCropError = false;

    // Replaces bad data
    if (
      !this.postFormData.inventory ||
      typeof this.postFormData.inventory !== 'number'
    ) {
      this.postFormData.inventory = 0;
    }
    if (!this.postFormData.price) {
      this.postFormData.price = 'Message me for more details!';
    }

    // Barrier check for separate errors
    if (this.postFormData.plant == 0) {
      this.plantError = true;
    }
    if (!this.postFormData.description) {
      this.descriptionError = true;
    }
    if (!this.postFormData.inventory) {
      this.inventoryError = true;
    }
    if (!this.postFormData.details) {
      this.detailsError = true;
    }

    // Barrier check against all errors
    if (
      this.plantError ||
      this.descriptionError ||
      this.inventoryError ||
      this.detailsError
    ) {
      return (this.postCropError = true);
    }
    let plantArr = Object.values(this.plants);
    plantArr.map(plant => {
      if (plant['name'] === this.postFormData.plant) {
        this.postFormData.plant = plant['id'];
      }
    });
    this.showLoading = true;
    return this.backend
      .postDirectlyToStand(this.postFormData)
      .then(result => {
        this.showLoading = false;
        this.showPostForm();
        this.ngOnInit();
      })
      .catch(err => {
        this.showLoading = false;
        console.log(err);
      });
  }

  //check on and off if a user wants to keep their crop in their garden when adding

  toggleCheck() {
    if (this.check) {
      return (this.check = false);
    }
    return (this.check = true);
  }

  //move a crop from the garden to the stand

  moveToStand() {
    this.firstCropDescription = false;
    this.firstCropDetails = false;
    this.firstCropInventory = false;

    if (
      !this.moveFormData.inventory ||
      typeof this.moveFormData.inventory !== 'number'
    ) {
      this.moveFormData.inventory = 0;
    }
    if (!this.moveFormData.price) {
      this.moveFormData.price = 'Message me for more details!';
    }

    if (!this.moveFormData.description) {
      this.firstCropDescription = true;
    }
    if (!this.moveFormData.inventory) {
      this.firstCropInventory = true;
    }
    if (!this.moveFormData.details) {
      this.firstCropDetails = true;
    }

    if (
      this.firstCropDescription ||
      this.firstCropDetails ||
      this.firstCropInventory
    ) {
      return (this.firstCropError = true);
    }

    this.moveFormData['selectedForStand'] = this.selectedForStand;
    this.moveFormData['uploadForStand'] = this.photosToStand;
    this.showLoading = true;
    this.moveFormData['check'] = this.check;
    this.backend
      .moveToStand(this.cropId, this.moveFormData)
      .then(response => {
        this.backend
          .getGarden()
          .then(result => (this.garden = result))
          .then(() => {
            this.showLoading = false;
            this.ngOnInit();
            this.showGarden();
          });
      })
      .catch(err => {
        this.showLoading = false;
        console.log(err);
      });
  }

  //turn edit on and off

  turnEditToFalse() {
    this.isEdit = false;
  }

  toggleEdit(crop) {
    if (crop) {
      this.cropId = crop.id;
    }
    if (this.isEdit) {
      this.isEdit = !this.isEdit;
    }
    this.garden.map(crop => {
      if (crop.id === this.cropId) {
        this.moveFormData = crop;
        this.cropPhotos = crop.photo;
      }
    });
    this.isEdit = !this.isEdit;
  }

  //allows user to build a stand

  buildingStand() {
    if (this.buildStand) {
      return (this.buildStand = false);
    }
    return (this.buildStand = true);
  }

  //shows user their garden where they can move to stand

  showGarden() {
    if (this.showingGarden) {
      return (this.showingGarden = false);
    }
    return (this.showingGarden = true);
  }

  sortCrops(result) {
    this.crops = result.sort(function(a, b) {
      var textA = a.description;
      var textB = b.description;
      return textA > textB;
    });
  }

  //delete crop methods

  deleteCrop() {
    this.backend.deleteCrop(this.itemToDelete).then(result => {
      this.ngOnInit();
      this.confirmDelete = false;
    });
  }

  toggleDeleteConfirmation(id) {
    if (this.confirmDelete) {
      this.itemToDelete = '';
      return (this.confirmDelete = false);
    } else {
      this.itemToDelete = id;
      return (this.confirmDelete = true);
    }
  }

  //edit a users stand name

  editUser() {
    this.badStandName = false;
    if (this.standFormdata.stand_name.length < 3) {
      return (this.badStandName = true);
    }

    this.backend.editUser(this.standFormdata).then(result => {
      this.user.stand_name = result['stand_name'];
      this.session.setSession(this.user);
      this.hasStand = false;
      this.ngOnInit();
    });
  }

  //post crop directly to stand

  showPostForm() {
    if (this.postingCrop) {
      return (this.postingCrop = false);
    }
    this.backend.getPlants().then(result => {
      let plantsArr = Object.values(result);
      plantsArr.map(plant => {
        this.plantNames.push(plant.name);
      });
      this.plantNames = this.plantNames.sort();
      this.plants = result;
      return (this.postingCrop = true);
    });
  }

  startConversation() {
    if (this.openMessage) {
      return (this.openMessage = false);
    } else {
      this.openMessage = true;
    }
  }

  //photo functions
  selectPhoto(event) {
    if (!this.selectedForStand.includes(event.target.src)) {
      this.selectedForStand.push(event.target.src);
      event.target.style.border = '3px solid #2c84fc';
    } else {
      let index = this.selectedForStand.indexOf(event.target.src);
      this.selectedForStand.splice(index, 1);
      event.target.style.border = 'none';
    }
  }

  updatePhotoList(event) {
    let file = event.target.files[0];
    if (this.postingCrop) {
      this.postFormData.photos.push(file);
    } else if (this.showingGarden) {
      return this.photosToStand.push(file);
    }
  }
}
