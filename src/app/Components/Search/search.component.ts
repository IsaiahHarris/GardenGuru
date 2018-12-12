import { Component, HostListener } from '@angular/core';
import { SessionService } from '../../Services/session.service';
import { BackendService } from '../../Services/backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  user: object;
  categories: string[] = ['Marketplace', 'My Stand', 'My Garden'];

  cropSearchData: {
    category: string;
    searchInput: string;
  } = {
    category: 'Marketplace',
    searchInput: ''
  };

  //validation checks
  searchErrors: string[] = [];
  searchValid: boolean = false;

  //validation checks
  resultErrors: string[] = [];
  resultValid: boolean = false;

  //modal controls
  @HostListener('document:click', ['$event'])
  clickout(event) {
    let searchSidebar = document.getElementById('search-sidebar');
    let searchIcon = document.getElementById('search-icon');
    let searchImage = document.getElementById('search');
    let searchForm = document.getElementById('search-form');
    let formChildren = searchForm.childNodes;
    let formChildrenList = Object.values(formChildren);

    if (
      event.target !== searchIcon &&
      searchSidebar.className === 'active' &&
      event.target !== searchSidebar &&
      event.target !== searchImage &&
      event.target !== searchForm &&
      !formChildrenList.includes(event.target)
    ) {
      searchSidebar.classList.toggle('active');
    }
  }

  constructor(
    private session: SessionService,
    private backend: BackendService,
    private router: Router
  ) {
    this.user = session.getSession();
  }

  isLoggedIn() {
    return this.session.isLoggedIn();
  }

  toggleSearchSideBar() {
    document.getElementById('search-sidebar').classList.toggle('active');
  }

  searchCrop() {
    //reset previous errors
    this.resultErrors.length = 0;

    return this.backend
      .search(this.cropSearchData)
      .then(response => {
        if (!this.session.getSession().loggedIn) {
          //if no user is not logged in and no search results...
          if (!response) {
            //and search category was marketplace, show error
            if (this.cropSearchData.category === 'Marketplace') {
              this.resultErrors.push(
                'No crops matching the description were found!'
              );
              this.resultValid = false;
              //if search catgory was stand or garden, show error: user must be logged in to search through these categories
            } else if (
              this.cropSearchData.category === 'My Stand' ||
              this.cropSearchData.category === 'My Garden'
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
            //otherwise, if there are search results, save the results on backend.service
            return this.backend.results(response);
          }
        } else {
          if (!response) {
            //if there was no response and user is logged in...
            if (this.cropSearchData.category === 'Marketplace') {
              this.resultErrors.push(
                'No crops matching the description were found in your area!'
              );
              this.resultValid = false;
            } else if (this.cropSearchData.category === 'My Stand') {
              this.resultErrors.push(
                'No crops matching the description were found in your stand!'
              );
              this.resultValid = false;
            } else if (this.cropSearchData.category === 'My Garden') {
              this.resultErrors.push(
                'No crops matching the description were found in your garden!'
              );
              this.resultValid = false;
            }
          } else {
            //otherwise save results to backend.service
            return this.backend.results(response);
          }
        }
      })
      .then(() => {
        //close search bar, navigate user to search-results page
        let searchSidebar = document.getElementById('search-sidebar');
        searchSidebar.classList.toggle('active');
        return this.router.navigate([
          `search-results/${this.cropSearchData.searchInput}`
        ]);
      })
      .then(() => {
        //reset the params to prevent searching on search results page from not working
        return this.router.navigate(['/search-results/*']);
      })
      .catch(err => {
        this.resultErrors.push('Nothing matched the input!');
        this.resultValid = false;
        console.log('Error :', err);
      });
  }

  //validate search inputs
  validateSearch() {
    this.searchErrors.length = 0;
    if (this.cropSearchData.searchInput.length < 1) {
      this.searchErrors.push('This field is required!');
      this.searchValid = false;
    } else {
      this.searchValid = true;
    }
  }

  //functions used to display search input/output errors
  getSearchErrors() {
    return this.searchErrors.join(', ');
  }

  getResultErrors() {
    return this.resultErrors.join(', ');
  }
}
