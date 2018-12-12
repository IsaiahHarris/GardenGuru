import { Component, OnInit } from '@angular/core';
import { AuthServiceReg } from '../../Services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../Services/session.service';
import { BackendService } from '../../Services/backend.service';

@Component({
  templateUrl: './sentConversations.component.html',
  styleUrls: ['./sentConversations.component.scss']
})
export class SentConversationsComponent implements OnInit {
  user;
  sentConversations;
  hasMessages: boolean = true;
  filtered;

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
    this.getSentConversations();
  }

  //get conversations where a user initiated the conversation

  getSentConversations() {
    return this.backend.getSentConversations().then(result => {
      let resultsArr = Object.values(result);
      let cache = [];
      let filteredResult = [];
      for (let i = 0; i < resultsArr.length; i++) {
        if (!cache.includes(result[i].to.id)) {
          cache.push(result[i].to.id);
          filteredResult.push(result[i]);
        }
      }
      this.sentConversations = filteredResult;
    });
  }
}
