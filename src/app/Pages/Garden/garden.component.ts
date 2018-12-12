import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../Services/backend.service';
import { SessionService } from '../../Services/session.service';
import { MatSnackBar } from '@angular/material';

@Component({
  templateUrl: './garden.component.html',
  styleUrls: ['./garden.component.scss']
})
export class GardenComponent implements OnInit {
  user: object;
  loggedIn: boolean = false;
  date: string;
  week: string;
  //for parsing date objects and dates in data
  index: number = 10;

  garden: object[] = [];
  plantsToWater: object[] = [];
  plantsToHarvest: object[] = [];

  fruitPic: string =
    'https://cdn1.iconfinder.com/data/icons/food-vol-1/48/017-512.png';
  veggiePic: string =
    'https://cdn1.iconfinder.com/data/icons/fruit-and-veg-ios/64/veg-brocolli-512.png';
  herbPic: string =
    'https://cdn0.iconfinder.com/data/icons/healthy-and-clean-food-1/64/herb-healthy-leaf-spinach-512.png';

  wateredPlants: string[] = [];
  showWaterButton: boolean = false;

  constructor(
    private backend: BackendService,
    private session: SessionService,
    public popUp: MatSnackBar
  ) {
    this.user = this.session.getSession();
    this.loggedIn = this.session.isLoggedIn();
    //for this.date
    let year = new Date().getFullYear();
    let month = ('0' + (new Date().getMonth() + 1)).slice(-2);
    let day = ('0' + new Date().getDate()).slice(-2);
    this.date = `${year}-${month}-${day}`;
    //for this.week
    let currentDate = new Date();
    let weekDate = new Date(
      currentDate.setTime(currentDate.getTime() + 7 * 86400000)
    );
    let weekYear = weekDate.getFullYear();
    let weekMonth = ('0' + (weekDate.getMonth() + 1)).slice(-2);
    let weekDay = ('0' + weekDate.getDate()).slice(-2);
    this.week = `${weekYear}-${weekMonth}-${weekDay}`;
  }

  ngOnInit() {
    if (this.loggedIn) {
      //resets garden
      this.garden.length = 0;
      return this.backend
        .getGarden()
        .then(result => {
          let resultArr = Object.values(result);
          resultArr.map(crop => {
            //show only crops that are growing
            if (crop.cropStatus['name'] === 'Growing') {
              switch (crop.plant['type_id']) {
                case 1:
                  crop.displayPhoto = this.veggiePic;
                  break;
                case 2:
                  crop.displayPhoto = this.fruitPic;
                  break;
                case 3:
                  crop.displayPhoto = this.herbPic;
                  break;
              }
              this.garden.push(crop);
            }
          });
          return resultArr;
        })
        .then(() => {
          let gardenArr = Object.values(this.garden);
          gardenArr.map(crop => {
            let subWaterDate = crop['watering_date'].substring(0, this.index);
            if (subWaterDate === this.date) {
              this.plantsToWater.push(crop);
            }
          });
        })
        .then(() => {
          let gardenArr = Object.values(this.garden);
          gardenArr.map(crop => {
            let subHarvestDate = crop['harvest_date'].substring(0, this.index);
            if (subHarvestDate >= this.date && subHarvestDate <= this.week) {
              this.plantsToHarvest.push(crop);
            }
          });
        })
        .then(() => {
          this.plantsToHarvest.map(crop => {
            switch (crop['plant']['type_id']) {
              case 1:
                crop['displayPhoto'] = this.veggiePic;
                break;
              case 2:
                crop['displayPhoto'] = this.fruitPic;
                break;
              case 3:
                crop['displayPhoto'] = this.herbPic;
                break;
            }
          });
        });
    }
  }

  selectForWatering(event) {
    this.showWaterButton = true;
    //if item is not already selected, push it into wateredPlants
    if (!this.wateredPlants.includes(event.target.id)) {
      event.target.style.fill = 'cornflowerblue';
      this.wateredPlants.push(event.target.id);
      if (this.wateredPlants.length === 0) {
        this.showWaterButton = false;
      }
    } else if (this.wateredPlants.includes(event.target.id)) {
      event.target.style.fill = 'gray';
      let index = this.wateredPlants.indexOf(event.target.id);
      this.wateredPlants.splice(index, 1);
      if (this.wateredPlants.length === 0) {
        this.showWaterButton = false;
      }
    }
  }

  waterPlants() {
    //update watering for a crop
    this.backend.updateWateringDays(this.wateredPlants).then(result => {
      this.wateredPlants.length = 0;
      if (result['success']) {
        this.popUp.open('Plant(s) watered!', 'Dismiss', { duration: 2000 });
        this.plantsToWater.length = 0;
        this.showWaterButton = false;
      }
    });
  }
}
