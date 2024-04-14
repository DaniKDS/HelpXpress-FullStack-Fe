import {SpecialUser} from './specialuser';
import {Assistant} from './assistant';
import {Doctor} from './doctor';
import {Organization} from './organization';

export class Review {
  id: number;
  specialUser: SpecialUser;
  assistant: Assistant;
  doctor: Doctor;
  organization: Organization;
  comment: string;
  rating: number;
  reviewDate: Date;

  constructor() {
    this.id = 0;
    this.specialUser = new SpecialUser();
    this.assistant = new Assistant();
    this.doctor = new Doctor();
    this.organization = new Organization();
    this.comment = '';
    this.rating = 0;
    this.reviewDate = new Date();
  }
}
