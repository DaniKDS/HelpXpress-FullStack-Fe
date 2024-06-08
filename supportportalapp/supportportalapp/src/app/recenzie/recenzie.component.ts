// recenzie.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {NotificationService} from '../service/notification.service';
import {NotificationType} from '../enum/notification-type.enum';

@Component({
  selector: 'app-recenzie',
  templateUrl: './recenzie.component.html',
  styleUrls: ['./recenzie.component.css']
})
export class RecenzieComponent {
  comment = '';
  rating = '5';
  doctor = '';
  organization = '';

  constructor(private http: HttpClient, private notificationService: NotificationService) {}

  submitReviewForm() {
    const reviewData = {
      comment: this.comment,
      rating: this.rating,
      doctor: this.doctor,
      organization: this.organization
    };

    this.http.post('http://localhost:8081/api/contact/sendReviewEmail', reviewData).subscribe(
      (response: any) => {
        this.notificationService.notify(NotificationType.SUCCESS, response.message);
        this.resetForm();
      },
      (error: any) => {
        console.error('Error:', error);
        this.notificationService.notify(NotificationType.ERROR, 'A apărut o eroare la trimiterea recenziei.');
      }
    );
  }

  resetForm() {
    this.comment = '';
    this.rating = '5';
    this.doctor = '';
    this.organization = '';
  }
}
