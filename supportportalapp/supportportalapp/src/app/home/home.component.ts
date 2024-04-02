import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../service/authentication.service';
import {Router} from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(2000)),
    ]),
  ]
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    if (!this.authenticationService.isUserLoggedIn()) {
      // utilizatorul nu este autentificat, redirecționăm către pagina 'About'
      this.router.navigate(['/home']);
    }
  }
}
