import { Component, OnInit, Inject, AfterViewChecked } from '@angular/core';
import { AuthServiceReg } from '../../Services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../../Services/backend.service';
import { SessionService } from '../../Services/session.service';

@Component({
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit, AfterViewChecked {
  conversationId;
  messages;
  user;
  //boolean to determine whether session user is the same as browser user
  userIsUser: boolean = false;
  deleted: boolean = true;
  convoPartner: string;

  message: {
    content: string;
  } = {
    content: ''
  };

  constructor(
    private auth: AuthServiceReg,
    private router: Router,
    private backend: BackendService,
    private route: ActivatedRoute,
    private session: SessionService
  ) {
    this.user = this.session.getSession();
  }

  //user can't send an empty message
  sendMessage() {
    if (this.message.content.length > 0) {
      this.backend
        .sendMessage(this.message, this.conversationId)
        .then(result => {
          this.messages.push(result);
          this.message.content = '';
          this.ngOnInit();
        });
    }
  }

  //life cycle method, meant to scroll to bottom of page upon load of page
  ngAfterViewChecked() {
    const messageContainer = document.getElementById('m');
    if (messageContainer) {
      messageContainer.scrollTo(0, 9999999);
    }
  }

  ngOnInit() {
    this.conversationId = this.route.snapshot.paramMap.get('id');
    if (this.conversationId === this.user.id) {
      this.userIsUser = true;
    }
    this.backend.getConversation(this.conversationId).then(result => {
      let resultArr = Object.values(result);
      resultArr.map(msg => {
        //iterates over messages between user - user, user who is not the user becomes the conversaion partner
        if (msg.from.username !== this.user.username) {
          this.convoPartner = msg.from;
        }
      });
      this.messages = result;
    });
  }
}
