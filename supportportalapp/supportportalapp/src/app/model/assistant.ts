import {User} from './user';

export class Assistant {
  id: number;
  user: User;
  experienceYears: number;
  speciality: string;
  grade: string;

  constructor() {
    this.id = 0;
    this.user = new User();
    this.experienceYears = 0;
    this.speciality = '';
    this.grade = '';
  }
}
