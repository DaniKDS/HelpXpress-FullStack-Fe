import { Component, OnInit } from '@angular/core';
import {NotificationType} from "../enum/notification-type.enum";
import {NotificationService} from "../service/notification.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  public name: string;
  public email: any;
  public message: any;
  ngOnInit(): void {
  }
  constructor(private http: HttpClient, private notificationService: NotificationService) {}

  submitContactForm() {
    const contactData = {
      name: this.name,
      email: this.email,
      message: this.message
    };

    this.http.post('http://localhost:8081/api/contact/sendContactEmail', contactData, { responseType: 'text' }).subscribe(
      (response: string) => {
        this.notificationService.notify(NotificationType.SUCCESS, 'Mesajul a fost trimis cu succes.');
        this.resetForm();
      },
      error => {
        console.error('Error:', error);
        this.notificationService.notify(NotificationType.ERROR, 'A apărut o eroare la trimiterea mesajului.');
      }
    );
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.message = '';
  }
}
