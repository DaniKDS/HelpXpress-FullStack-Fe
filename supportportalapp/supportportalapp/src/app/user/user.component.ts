import {Component, OnInit, OnDestroy, NgIterable} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { CustomHttpRespone } from '../model/custom-http-response';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import { FileUploadStatus } from '../model/file-upload.status';
import { Role } from '../enum/role.enum';
import {Appointment} from '../model/appointment';
import {Doctor} from '../model/doctor';
import {Assistant} from '../model/assistant';
import {Organization} from '../model/organization';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {SpecialUser} from '../model/specialuser';
import {Review} from '../model/review';
import {Job} from '../model/job';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-15px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class UserComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private authenticationService: AuthenticationService,
              private userService: UserService, private notificationService: NotificationService) {}

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.isManager;
  }

  public get isDoctor(): boolean {
    return this.getUserRole() === Role.DOCTOR;
  }

  public get isAssistant(): boolean {
    return this.getUserRole() === Role.ASSISTANT;
  }
  public get isSpecialuser(): boolean {
    return this.getUserRole() === Role.USER;
  }
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[];
  public user: User;
  public refreshing: boolean;
  public selectedUser: User;
  public fileName: string;
  public profileImage: File;
  private subscriptions: Subscription[] = [];
  public editUser = new User();
  private currentUsername: string;
  public fileStatus = new FileUploadStatus();
  public appointments: Appointment[];
  public doctors: Doctor[];
  public activeTab = 'profile';
  public assistant: Assistant;
  public organizations: Organization[];
  public specialUser: SpecialUser;
  public reviews: Review[] = [];
  jobs: Job[] = []; // Inițializare cu un array gol
  showMap: boolean;
  filteredJobs: Job[] = [];
  selectedDisabilityType = '';
  filterText = '';
  sortKey = 'name';

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    if (this.user && this.user.username) {
      this.loadUserAppointmentsByUsername(this.user.username);
      this.loadDoctorsForSpecialUserByUsername(this.user.username);
      this.loadAssistantForSpecialUserByUsername(this.user.username);
      this.loadOrganizations(this.user.username);
      this.getSpecialUser(this.user.username);
      this.getDoctorAppointments(this.user.username);
      console.log('Username for reviews:', this.user.username);
      this.getDoctorReviews(this.user.username);
      this.loadSpecialUserForAssistant(this.user.username);
      this.loadDoctorsForMySpecialUser(this.user.username);
      this.loadAppointmentsForMySpecialUser(this.user.username);
    }
    this.getUsers(true);

    this.userService.getJobs().subscribe(
      (jobs: Job[]) => {
        this.jobs = jobs;
        this.filteredJobs = [...this.jobs];
        // this.sortJobs(); // Temporarily disable sorting to isolate filtering issues
        this.filterJobs();
      },
      error => {
        console.error('Failed to load jobs', error);
      }
    );

  }

  filterJobs() {
    console.log('Filtering jobs with Text:', this.filterText, 'and Disability:', this.selectedDisabilityType);
    this.filteredJobs = this.jobs.filter(job => {
      const matchesText = !this.filterText || job.description.toLowerCase().includes(this.filterText.toLowerCase()) || job.name.toLowerCase().includes(this.filterText.toLowerCase());
      const matchesDisability = !this.selectedDisabilityType || job.disabilityType === this.selectedDisabilityType;
      console.log(`Job ${job.name}: Matches Text: ${matchesText}, Matches Disability: ${matchesDisability}`);
      return matchesText && matchesDisability;
    });
    console.log('Filtered Jobs:', this.filteredJobs);
  }

  sortJobs(): void {
    this.filteredJobs.sort((a, b) => {
      if (a[this.sortKey] < b[this.sortKey]) { return -1; }
      if (a[this.sortKey] > b[this.sortKey]) { return 1; }
      return 0;
    });
  }

  setSortKey(key: string) {
    // Implement sorting logic here
    this.filteredJobs.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  }

  loadAppointmentsForMySpecialUser(username: string): void {
    this.userService.getAppointmentsByAssistantUsername(username).subscribe(
      (data: Appointment[]) => {
        this.appointments = data;
        console.log('Appointments data:', data);
      },
      error => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  loadDoctorsForMySpecialUser(username: string): void {
    this.userService.getDoctorsBySpecialUserOfAssistant(username).subscribe(
      (data: Doctor[]) => {
        this.doctors = data;
        console.log('Doctors data:', data);
      },
      error => {
        console.error('Error fetching doctors:', error);
      }
    );
  }

  loadSpecialUserForAssistant(username: string): void {
    this.userService.getSpecialUserByAssistantUsername(username).subscribe(
      (data: SpecialUser) => {
        console.log('SpecialUser data:', data);
        this.specialUser = data;
      },
      error => {
        console.error('Error fetching special user data:', error);
      }
    );
  }
  getDoctorReviews(username: string): void {
    this.userService.getReviewsByDoctorUsername(username).subscribe(
      (data: Review[]) => {
        console.log('Reviews:', data); // Check the data structure
        this.reviews = data;
      },
      error => {
        console.error('Error fetching reviews:', error);
      }
    );
  }

  getDoctorAppointments(username: string): void {
    this.userService.getAppointmentsByDoctorUsername(username).subscribe(
      (data: Appointment[]) => {
        this.appointments = data;
      },
      error => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  getSpecialUser(username: string): void {
    this.userService.getSpecialUserByDoctorUsername(username).subscribe(
      (data: SpecialUser) => this.specialUser = data,
      error => console.error(error)
    );
  }

  loadOrganizations(username: string): void {
    this.userService.getOrganizationsByUsername(username).subscribe({
      next: (data) => {
        this.organizations = data;
      },
      error: (err) => {
        console.error('Error fetching organizations:', err);
      }
    });
  }

  loadAssistantForSpecialUserByUsername(username: string): void {
    this.userService.getAssistantBySpecialUserUsername(username).subscribe({
      next: (assistant) => {
        console.log('Assistant loaded:', assistant);
        this.assistant = assistant;
      },
      error: (error) => {
        console.error('Error fetching assistant:', error);
        this.sendNotification(NotificationType.ERROR, 'Could not load assistant.');
      }
    });
  }

  loadDoctorsForSpecialUserByUsername(username: string): void {
    this.userService.getDoctorsBySpecialUserUsername(username).subscribe({
      next: (doctors) => {
        console.log('Doctors loaded:', doctors);
        this.doctors = doctors;
      },
      error: (error) => {
        console.error('Error fetching doctors:', error);
        this.sendNotification(NotificationType.ERROR, 'Could not load doctors.');
      }
    });
  }

  private loadUserAppointmentsByUsername(username: string): void {
    if (this.getUserRole() === 'ROLE_USER') {
      this.subscriptions.push(
        this.userService.getAppointmentBySpecialUserUsername(username).subscribe(
          (data: Appointment[]) => {
            if (data && data.length > 0) {
              console.log(data);
              this.appointments = data;
              console.log('App loaded:', this.appointments);
            } else {
              this.sendNotification(NotificationType.INFO, 'Nu există programări.');
            }
          },
          (error: HttpErrorResponse) => {
            console.error('Error loading appointments by username', error);
            this.sendNotification(NotificationType.ERROR, error.error.message);
          }
        )
      );
    }
  }
  public changeTitle(title: string): void {
    this.activeTab = title;
    this.titleSubject.next(title);
  }

  public setActiveTab(tabName: string): void {
    this.showMap = false;
    this.activeTab = tabName;
    if (tabName === 'map-romania') {
      this.showMap = true; // Arată harta doar când acest tab este activ
    }
  }

  public getUsers(showNotification: boolean): void {
    // // Check if the user is an admin
    if (!this.isAdmin) {
      console.log('Access denied. Only admins can load user data.');
      return; // Stop execution if not admin
    }

    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalCache(response);
          this.users = response;
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully.`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );

  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton('openUserInfo');
  }

  public onProfileImageChange(fileName: string, profileImage: File): void {
    this.fileName =  fileName;
    this.profileImage = profileImage;
  }

  public saveNewUser(): void {
    this.clickButton('new-user-save');
  }

  public onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUserFormDate(null, userForm.value, this.profileImage);
    this.subscriptions.push(
      this.userService.addUser(formData).subscribe(
        (response: User) => {
          this.clickButton('new-user-close');
          this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          userForm.reset();
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} added successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.profileImage = null;
        }
      )
      );
  }

  public onUpdateUser(): void {
    const formData = this.userService.createUserFormDate(this.currentUsername, this.editUser, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.clickButton('closeEditUserModalButton');
          this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.profileImage = null;
        }
      )
      );
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    this.currentUsername = this.authenticationService.getUserFromLocalCache().username;
    const formData = this.userService.createUserFormDate(this.currentUsername, user, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.authenticationService.addUserToLocalCache(response);
          this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
          this.profileImage = null;
        }
      )
      );
  }

  public onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('profileImage', this.profileImage);
    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  private reportUploadProgress(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage = Math.round(100 * event.loaded / event.total);
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response:
        if (event.status === 200) {
          this.user.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
          this.sendNotification(NotificationType.SUCCESS, `${event.body.firstName}\'s profile image updated successfully`);
          this.fileStatus.status = 'done';
          break;
        } else {
          this.sendNotification(NotificationType.ERROR, `Unable to upload image. Please try again`);
          break;
        }
      default:
        // tslint:disable-next-line:no-unused-expression
        `Finished all processes`;
    }
  }

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, `You've been successfully logged out`);
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email'];
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpRespone) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, error.error.message);
          this.refreshing = false;
        },
        () => emailForm.reset()
      )
    );
  }

  public onDeleteUder(username: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response: CustomHttpRespone) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.getUsers(false);
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, error.error.message);
        }
      )
    );
  }

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  public searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
          results.push(user);
      }
    }
    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId).click();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  saveSpecialUser() {
    this.clickButton('save-special-user');
  }

  editSpecialUser() {
    this.clickButton('edit-special-user');
  }

  addPatientAppointment() {
    this.clickButton('add-appointment-for-special-user');
  }

  selectCounty(cluj: string) {
    // tslint:disable-line
    console.log(cluj);
  }

  prepareMap(): void {
    this.showMap = true;
    this.changeTitle('Harta Accesibilități');
    this.setActiveTab('map-romania');
  }
}
