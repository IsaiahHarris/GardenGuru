import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../Services/backend.service';
import { SessionService } from '../../Services/session.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './searchResults.component.html',
  styleUrls: ['./searchResults.component.scss']
})
export class SearchResultsComponent implements OnInit {
  user: object;
  loggedIn: boolean = false;
  searchResults: any;

  categories: string[] = ['Marketplace', 'My Stand', 'My Garden'];
  placeholderItemImg: string =
    'https://www.ewm.com/addons/themes/ewm_arillo/img/no-photo.png';

  searchData: {
    category: string;
    searchInput: string;
  } = {
    category: 'Marketplace',
    searchInput: ''
  };

  searchedCategory: string = '';
  gardenSearch: boolean = false;
  marketSearch: boolean = false;
  standSearch: boolean = false;

  searchErrors: string[] = [];
  searchValid: boolean = false;

  resultErrors: string[] = [];
  resultValid: boolean = false;

  showLoading: boolean = false;

  constructor(
    private backend: BackendService,
    private session: SessionService,
    private router: Router
  ) {
    this.user = this.session.getSession();
    router.events.subscribe(val => {
      this.ngOnInit();
    });
  }

  ngOnInit() {
    this.showLoading = true;
    let result = this.backend.transferResults();
    this.searchedCategory = result['category'];
    switch (this.searchedCategory) {
      case 'My Garden':
        this.gardenSearch = true;
        break;
      case 'My Stand':
        this.standSearch = true;
        break;
      case 'Marketplace':
        this.marketSearch = true;
        break;
      default:
        this.gardenSearch = false;
        this.standSearch = false;
        this.marketSearch = false;
        break;
    }
    this.showLoading = false;
    if (result['searchResults']) {
      let resultArr = Object.values(result['searchResults']);
      resultArr.map(result => {
        if (result['photo'][0]) {
          result['displayPhoto'] = result['photo'][0].link;
        } else {
          result['displayPhoto'] = this.placeholderItemImg;
        }
      });
      this.searchResults = result['searchResults'];
    }
  }

  //search crop through search result component

  searchCrop() {
    this.gardenSearch = false;
    this.standSearch = false;
    this.marketSearch = false;
    this.resultErrors.length = 0;
    this.showLoading = true;
    return this.backend
      .search(this.searchData)
      .then(response => {
        this.searchedCategory = this.searchData.category;
        if (!this.session.getSession().loggedIn) {
          this.showLoading = false;
          if (!response) {
            if (this.searchData.category === 'Marketplace') {
              this.resultErrors.push(
                'No crops matching the description were found!'
              );
              this.resultValid = false;
            } else if (
              this.searchData.category === 'My Stand' ||
              this.searchData.category === 'My Garden'
            ) {
              this.resultErrors.push(
                'Please log in to properly search through your own crops!'
              );
              this.resultValid = false;
            } else {
              this.resultErrors.push(
                'There was an error processing your request.'
              );
              this.resultValid = false;
            }
          } else {
            switch (this.searchedCategory) {
              case 'My Garden':
                this.gardenSearch = true;
                break;
              case 'My Stand':
                this.standSearch = true;
                break;
              case 'Marketplace':
                this.marketSearch = true;
                break;
              default:
                this.gardenSearch = false;
                this.standSearch = false;
                this.marketSearch = false;
                break;
            }
            let resultArr = Object.values(response);
            resultArr.map(result => {
              if (result.photo[0]) {
                result['displayPhoto'] = result.photo[0].link;
              } else {
                result['displayPhoto'] = this.placeholderItemImg;
              }
            });
            this.showLoading = false;
            this.searchResults = resultArr;
          }
        } else {
          if (!response) {
            this.showLoading = false;
            if (this.searchData.category === 'Marketplace') {
              this.resultErrors.push(
                'No crops matching the description were found in your area!'
              );
              this.resultValid = false;
            } else if (this.searchData.category === 'My Stand') {
              this.resultErrors.push(
                'No crops matching the description were found in your stand!'
              );
              this.resultValid = false;
            } else if (this.searchData.category === 'My Garden') {
              this.resultErrors.push(
                'No crops matching the description were found in your garden!'
              );
              this.resultValid = false;
            }
          } else {
            switch (this.searchedCategory) {
              case 'My Garden':
                this.gardenSearch = true;
                break;
              case 'My Stand':
                this.standSearch = true;
                break;
              case 'Marketplace':
                this.marketSearch = true;
                break;
              default:
                this.gardenSearch = false;
                this.standSearch = false;
                this.marketSearch = false;
                break;
            }
            let resultArr = Object.values(response);
            resultArr.map(result => {
              if (result.photo[0]) {
                result['displayPhoto'] = result.photo[0].link;
              } else {
                result['displayPhoto'] = this.placeholderItemImg;
              }
            });
            this.showLoading = false;
            this.searchResults = resultArr;
          }
        }
      })
      .catch(err => {
        this.showLoading = false;
        this.searchResults = [];
        this.resultErrors.push('Nothing matched the input!');
        this.resultValid = false;
        console.log('Error :', err);
      });
  }

  //search validation

  validateSearch() {
    this.searchErrors.length = 0;
    if (this.searchData.searchInput.length < 1) {
      this.searchErrors.push('This field is required!');
      this.searchValid = false;
    } else {
      this.searchValid = true;
    }
  }

  getSearchErrors() {
    return this.searchErrors.join(', ');
  }

  getResultErrors() {
    return this.resultErrors.join(', ');
  }

  getResultLength() {
    return `${this.searchResults.length} item(s) found`;
  }
}
