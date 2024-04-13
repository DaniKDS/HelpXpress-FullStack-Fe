import { User } from './user';
import { Appointment } from './appointment';
import { Doctor } from './doctor';
import { Assistant } from './assistant';
import { Organization } from './organization';

export class SpecialUser {
  id: number;
  user: User;
  disease: string;
  diseaseType: string;
  appointments: Appointment[];
  doctors: Doctor[];
  assistant: Assistant;
  organization: Organization[];

  constructor() {
    this.id = 0;
    this.user = new User();
    this.disease = '';
    this.diseaseType = '';
    this.appointments = [];
    this.doctors = [];
    this.assistant = new Assistant();
    this.organization = [];
  }
}
