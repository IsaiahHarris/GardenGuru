import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//components and pages
import { AppComponent } from './app.component';
import { HeaderComponent } from './Components/Header/header.component';
import { SidebarComponent } from './Components/Sidebar/sidebar.component';
import { SearchComponent } from './Components/Search/search.component';
import { FooterComponent } from './Components/Footer/footer.component';
import { LoginComponent } from './Pages/Login/login.component';
import { RegisterComponent } from './Pages/Register/register.component';
import { GardenComponent } from './Pages/Garden/garden.component';
import { MarketplaceComponent } from './Pages/Marketplace/marketplace.component';
import { StandComponent } from './Pages/Stand/stand.component';
import { ProfileComponent } from './Pages/Profile/profile.component';
import { CropComponent } from './Pages/Crop/crop.component';
import { AddCropComponent } from './Pages/AddCrop/addcrop.component';
import { MessagesComponent } from './Pages/Messages/messages.component';
import { GardenCropComponent } from './Pages/GardenCrop/gardenCrop.component';
import { SearchResultsComponent } from './Pages/SearchResults/searchResults.component';
import { ConversationComponent } from './Pages/Conversation/conversation.component';
import { SentConversationsComponent } from './Pages/SentConversations/sentConversations.component';

//services
import { BackendService } from './Services/backend.service';
import { AuthGuard } from './Services/guard.service';
import { AuthServiceReg } from './Services/auth.service';
import { SessionService } from './Services/session.service';

//material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    SearchComponent,
    FooterComponent,
    GardenComponent,
    MarketplaceComponent,
    StandComponent,
    ProfileComponent,
    LoginComponent,
    RegisterComponent,
    SearchResultsComponent,
    CropComponent,
    AddCropComponent,
    MessagesComponent,
    GardenCropComponent,
    ConversationComponent,
    SentConversationsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { path: '', component: MarketplaceComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'marketplace', component: MarketplaceComponent },
      {
        path: 'user/:id/stand',
        component: StandComponent
      },
      { path: 'garden', component: GardenComponent },
      {
        path: 'user/:id',
        component: ProfileComponent
      },
      { path: 'crops/:id', component: CropComponent },
      {
        path: 'garden/addcrop',
        component: AddCropComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'garden/crops/:id',
        component: GardenCropComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'messages',
        component: MessagesComponent,
        canActivate: [AuthGuard]
      },
      // {
      //   path: 'sentConversations',
      //   component: SentConversationsComponent,
      //   canActivate: [AuthGuard]
      // },
      {
        path: 'conversation/:id',
        component: ConversationComponent,
        canActivate: [AuthGuard]
      },
      // {
      //   path: 'sentConversation/:id',
      //   component: ConversationComponent,
      //   canActivate: [AuthGuard]
      // },
      { path: 'search-results/:term', component: SearchResultsComponent }
    ]),
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  providers: [BackendService, SessionService, AuthServiceReg, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
