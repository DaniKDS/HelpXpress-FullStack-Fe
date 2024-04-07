export class User {
  public userId: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public email: string;
  public lastLoginDate: Date;
  public lastLoginDateDisplay: Date;
  public joinDate: Date;
  public profileImageUrl: string;
  public active: boolean;
  public notLocked: boolean;
  public role: string;
  public authorities: [];
  public age: number;
  public birthDate?: Date;
  public disease?: string;
  public diseaseType?: string;
  public gender?: string;
  // Relațiile complexe pot necesita modele separate sau simplificări, depinzând de cazul de utilizare
  // public organizations: Organization[];
  // public reports: Report[];
  // public reviews: Review[];
  // public appointments: Appointment[];
  // public doctorAppointments: Appointment[];


  constructor() {
    this.userId = '';
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.email = '';
    this.lastLoginDate = null;
    this.lastLoginDateDisplay = null;
    this.joinDate = null;
    this.profileImageUrl = '';
    this.active = false;
    this.notLocked = false;
    this.role = '';
    this.authorities = [];
  }

}
