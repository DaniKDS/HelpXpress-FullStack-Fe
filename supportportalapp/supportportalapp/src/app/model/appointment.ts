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

  constructor(init?: Partial<Appointment>) {
    this.id = init?.id || 0;
    this.specialUser = init?.specialUser || { id: 0, user: new User(), disease: '', diseaseType: '', assistant: new Assistant() };
    this.doctor = init?.doctor || new Doctor();
    this.organization = init?.organization || new Organization();
    this.appointmentTime = init?.appointmentTime || '';
    this.appointmentEndTime = init?.appointmentEndTime || '';
    this.status = init?.status || 'programată';
    this.notes = init?.notes || '';
  }
}
