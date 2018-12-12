import { Component, OnInit } from '@angular/core';
import { AuthServiceReg } from '../../Services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../Services/session.service';
import { BackendService } from '../../Services/backend.service';
@Component({
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  user;
  messages;
  hasMessages: boolean = true;
  conversations;
  searchTerm;
  filtered: any;
  deleted: boolean = false;
  constructor(
    private auth: AuthServiceReg,
    private router: Router,
    private session: SessionService,
    private route: ActivatedRoute,
    private backend: BackendService
  ) {
    this.user = session.getSession();
  }

  ngOnInit() {
    this.getConversations();
  }

  // get user conversations
  getConversations() {
    return this.backend
      .getConversations()
      .then(result => {
        this.conversations = result;
        return this.conversations;
      })
      .then(result => {
        let cache = [];
        let filteredResult = [];
        let resultsArr = Object.values(result);
        for (let i = resultsArr.length - 1; i >= 0; i--) {
          if (!cache.includes(result[i].to.id)) {
            cache.push(result[i].to.id);
            filteredResult.push(result[i]);
          }
        }
        if (!filteredResult || !result.length) {
          this.hasMessages = false;
        } else {
          this.hasMessages = true;
        }
        this.filtered = filteredResult;
      });
  }

  deleteThread() {
    this.deleted = true;
  }

  //get all users messages

  getMessages() {
    this.backend
      .getMessages()
      .then(result => {
        this.messages = result;
        if (!this.messages.length) {
          this.hasMessages = false;
        }
      })
      .catch(err => {
        console.log(err.message);
      });
  }
}
