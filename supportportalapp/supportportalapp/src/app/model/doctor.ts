import {User} from './user';


export class Doctor {
  id: number;
  user: User;
  experienceYears: number;
  speciality: string;
  constructor() {
    this.id = 0;
    this.user = new User();
    this.experienceYears = 0;
    this.speciality = '';
  }
}
