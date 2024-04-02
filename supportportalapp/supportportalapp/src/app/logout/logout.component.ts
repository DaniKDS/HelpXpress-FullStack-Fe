import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    //   this.basicAuthenticationService.logout();
    //
    //   // Întârzie redirecționarea către pagina de login pentru a permite afișarea mesajului de logout
    //   setTimeout(() => {
    //     this.router.navigate(['login']);
    //   }, 3000); // 3000 ms = 3 secunde
    // }
  }
}
