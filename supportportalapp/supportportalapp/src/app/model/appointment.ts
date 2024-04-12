import {Assistant} from './assistant';
import {User} from './user';
import {Doctor} from './doctor';
import {Organization} from './organization';

export class Appointment {
  id: number;
  specialUser: {
    id: number;
    user: User;
    disease: string;
    diseaseType: string;
    assistant: Assistant;
  };
  doctor: Doctor;
  organization: Organization;
  appointmentTime: string;
  appointmentEndTime: string;
  status: string;
  notes: string;

  constructor() {
    this.id = 0;
    this.specialUser = {
      id: 0,
      user: new User(),
      disease: '',
      diseaseType: '',
      assistant: new Assistant()
    };
    this.doctor = new Doctor();
    this.organization = new Organization();
    this.appointmentTime = '';
    this.appointmentEndTime = '';
    this.status = '';
    this.notes = '';
  }
}
