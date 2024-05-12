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
import {Benzinarie} from '../model/benzinarie';

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
  private map: google.maps.Map<HTMLElement>;
  private activeBenzinarie: Benzinarie;

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
  benzinarii: any[] = [];
  brandImages: { [brand: string]: string } = {
    MOL: 'assets/mol.png',
    PETROM: 'assets/petrom.png',
    ROMPETROL: 'assets/rompetrol.png',
    SOCAR: 'assets/socar.png',
    OMW: 'assets/omw.png',
    LUKOIL: 'assets/lukoil.png',
    VEGAS: 'assets/vegas.png',
    GAZPROM: 'assets/gazprom.png'
  };
  filteredBenzinarii: Benzinarie[];
  selectedBrand = '';
  brands: string[] = ['MOL', 'PETROM', 'ROMPETROL', 'SOCAR', 'OMW', 'LUKOIL', 'VEGAS', 'GAZPROM']; // Lista de branduri
  carNumber = '';
  carColor = '';
  fuelType = '';
  phoneNumber = '';
  appointmentDate = '';    // Pentru data programării
  appointmentTime = '';    // Pentru ora programării
  arriveIn30Minutes = false; // Checkbox
  selectedDoctor: string;
  selectedOrganization: any;
  appointmentDetails: string;
  filteredJobs: Job[] = [];
  selectedDisabilityType = '';
  filterText = '';
  selectedJudet = '';
  showMap = false;
  judete: string[] = [
    'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov',
    'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța',
    'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
    'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt',
    'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea',
    'Vaslui', 'Vâlcea', 'Vrancea'
  ];


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
    this.loadGoogleMapsScript();
    this.showMap = false;

    this.userService.getBenzinarii().subscribe({
      next: (benzinarii) => {
        this.benzinarii = benzinarii;
        this.filteredBenzinarii = [...this.benzinarii];
      },
      error: (e) => console.error('Failed to load benzinarii', e)
    });
  }
  filterBenzinarii(): void {
    if (!this.selectedBrand) {
      this.filteredBenzinarii = [...this.benzinarii];
    } else {
      this.filteredBenzinarii = this.benzinarii.filter(b => b.brand === this.selectedBrand);
    }
  }

  loadGoogleMapsScript() {
    if ((window as any).google && (window as any).google.maps) {
      // Dacă scriptul este deja încărcat și harta nu a fost inițializată, inițializează harta.
      this.initMap();
    } else if (!(window as any).loadingGoogleMaps) { // Verifică dacă scriptul este deja în curs de încărcare
      (window as any).loadingGoogleMaps = true; // Setează un flag pentru a preveni reîncărcarea scriptului
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDBxYGaVDm4TB1RLmKsVC-FNNddDhshutM';
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        this.initMap();
        (window as any).loadingGoogleMaps = false; // Resetează flag-ul după încărcare
      };
    }
  }
  initMap() {
    setTimeout(() => {
      const mapElement = document.getElementById('map-romania'); // Asigură-te că ID-ul este corect
      if (mapElement) {
        const map = new google.maps.Map(mapElement, {
          center: { lat: 45.9432, lng: 24.9668 }, // Coordonatele aproximative pentru centrul României
          zoom: 6.5 // Zoom suficient pentru a vedea toată țara
        });
        this.map = map; // Salvează instanța hărții dacă ai nevoie să o accesezi ulterior
      } else {
        console.error('Map container not found');
      }
    }, 300); // Așteaptă să se actualizeze DOM-ul, ajustează timpul dacă este necesar
  }

  onJudetSelected(event: any) {
    const selectedJudet = event.target.value;
    if (selectedJudet && this.map) {  // Verifică dacă un județ a fost selectat și dacă harta a fost inițializată
      this.loadMapWithLocations(selectedJudet);
    }
  }
  loadMapWithLocations(judet: string) {
    const coords = this.getCoordinatesForJudet(judet);
    if (this.map && coords) {
      this.map.setCenter(new google.maps.LatLng(coords.lat, coords.lng));
      this.map.setZoom(10); // Zoom pentru a focaliza mai aproape de județul selectat

      this.addLocations(this.map, judet);
    } else {
      console.error('Map not initialized or coordinates not found');
    }
  }
  getCoordinatesForJudet(judet: string): { lat: number, lng: number } {
    const coordinates = {
      Alba: { lat: 46.077171, lng: 23.580040 },
      Arad: { lat: 46.186560, lng: 21.312267 },
      Argeș: { lat: 45.139551, lng: 24.679379 },
      Bacău: { lat: 46.567472, lng: 26.913631 },
      Bihor: { lat: 47.046501, lng: 21.918944 },
      'Bistrița-Năsăud': { lat: 47.137142, lng: 24.513914 },
      Botoșani: { lat: 47.747981, lng: 26.666719 },
      Brașov: { lat: 45.657975, lng: 25.601198 },
      Brăila: { lat: 45.269194, lng: 27.957472 },
      București: { lat: 44.426767, lng: 26.102538 },
      Buzău: { lat: 45.148620, lng: 26.823580 },
      'Caraș-Severin': { lat: 45.333333, lng: 21.883333 },
      Călărași: { lat: 44.206939, lng: 27.325918 },
      Cluj: { lat: 46.766667, lng: 23.600000 },
      Constanța: { lat: 44.159801, lng: 28.634813 },
      Covasna: { lat: 45.851659, lng: 26.184553 },
      Dâmbovița: { lat: 44.935753, lng: 25.459707 },
      Dolj: { lat: 44.330179, lng: 23.794881 },
      Galați: { lat: 45.455441, lng: 28.045873 },
      Giurgiu: { lat: 43.903708, lng: 25.969926 },
      Gorj: { lat: 45.046925, lng: 23.274736 },
      Harghita: { lat: 46.350000, lng: 25.550000 },
      Hunedoara: { lat: 45.750000, lng: 22.900000 },
      Ialomița: { lat: 44.567020, lng: 27.382746 },
      Iași: { lat: 47.158455, lng: 27.601442 },
      Ilfov: { lat: 44.564227, lng: 26.076335 },
      Maramureș: { lat: 47.672778, lng: 23.787778 },
      Mehedinți: { lat: 44.636925, lng: 22.665887 },
      Mureș: { lat: 46.545556, lng: 24.557778 },
      Neamț: { lat: 46.975869, lng: 26.381876 },
      Olt: { lat: 44.433333, lng: 24.366667 },
      Prahova: { lat: 45.100000, lng: 26.016667 },
      'Satu Mare': { lat: 47.791923, lng: 22.885253 },
      Sălaj: { lat: 47.175671, lng: 23.063255 },
      Sibiu: { lat: 45.798327, lng: 24.125583 },
      Suceava: { lat: 47.651388, lng: 26.255556 },
      Teleorman: { lat: 44.116667, lng: 25.366667 },
      Timiș: { lat: 45.748872, lng: 21.208679 },
      Tulcea: { lat: 45.179494, lng: 28.806414 },
      Vaslui: { lat: 46.640692, lng: 27.727647 },
      Vâlcea: { lat: 45.109165, lng: 24.342619 },
      Vrancea: { lat: 45.700000, lng: 27.183333 }
    };

    return coordinates[judet] || null; // Returnează coordonatele sau null dacă nu sunt găsite
  }
  prepareMap(): void {
    this.showMap = true;  // Afișează harta
    this.loadGoogleMapsScript();  // Asigură-te că scriptul este încărcat și harta inițializată
  }

  hideMap(): void {
    this.showMap = false;  // Ascunde harta
  }

  addLocations(map: any, judet: string) {
    const locations = [
      { lat: '46.067747', lng: '23.56479', info: 'DGASPC Alba Centrul de Îngrijire și Asistență pentru Persoane Adulte cu Dizabilități Abrud, Str. Republicii, nr.2-4' },
      { lat: '46.07212', lng: '23.56600', info: 'DGASPC Alba Locuința Maxim Protejată pentru Persoane Adulte cu Dizabilități nr.14 Abrud, Str. Ion Agârbiceanu, nr. 6' },
      { lat: '46.78170', lng: '23.61103', info: 'DGASPC Cluj Centrul de Îngrijire și Asistență pentru Persoane Adulte cu Dizabilități Cluj Napoca, Cluj-Napoca, bd. 21 Decembrie 1989, nr. 138' },
      { lat: '46.76953', lng: '23.60302', info: 'DGASPC Cluj Centrul de Abilitare și Reabilitare pentru Persoane Adulte cu Dizabilități Gherla, Gherla, Str. Plugarilor nr. 24' },
      { lat: '46.77427', lng: '23.57288', info: 'DGASPC Cluj Centrul de Îngrijire și Asistență pentru Persoane Adulte cu Dizabilități Câțcău, Câțcău, str. Principală nr. 90' },
      { lat: '46.77310', lng: '23.57425', info: 'DGASPC Cluj Locuința Minim Protejată pentru Persoane Adulte cu Dizabilități Buna Vestire Câțcău, Câțcău, nr. 90A' },
      { lat: '', lng: '', info: 'DGASPC Cluj Centrul de Îngrijire și Asistență pentru Persoane Adulte cu Dizabilități Luna de Jos, Com Dăbâca, sat Luna de Jos, str. Principală, nr. 17' },
      { lat: '46.79704', lng: '24.02848', info: 'DGASPC Cluj Centrul de Îngrijire și Asistență pentru Persoane Adulte cu Dizabilități Sfântul Nicolae Mociu, Mociu, str. Principală nr. 127' },
      { lat: '46.77848', lng: '23.63163', info: 'Fundația Febe CAbRPAD, Cluj-Napoca, str. Târnavelor, nr. 1' },
      { lat: '44.40917', lng: '26.14340', info: 'DGASPC Ilfov Centrul de Îngrijire și Asistență pentru Persoane Adulte cu Dizabilități Vidra, Vidra, Str. Principală, Nr.46' },
      { lat: '44.39151', lng: '26.28954', info: 'DGASPC Ilfov Centrul de Abilitare și Reabilitare Bălaceanca, Str. Gării, Nr.58, Sat Bălăceanca, Comuna Cernica, Județul Ilfov' },
      { lat: '44.40919', lng: '16.14351', info: 'DGASPC Ilfov Centrul de Îngrijire și Asistență pentru Persoane Adulte cu Dizabilități Ciolpani, Calea București, Nr. 348, Comuna Ciolpani, Județul Ilfov' },
      { lat: '45.02951', lng: '26.26769', info: 'DGASPC Ilfov Centrul de Abilitare și Reabilitare pentru Persoane Adulte cu Dizabilități Tâncăbești, Aleea Reînvierii, Nr.260, Sat Tâncăbești, Comuna Snagov, Județul Ilfov' },
      { lat: '45.07219', lng: '26.27043', info: 'Asociația Prietenia LMPPAD Casa Livezilor, Pantelimon, str. Sf. Gheorghe, nr. 46' },
      { lat: '44.49284', lng: '26.19867', info: 'Asociația Organizația Suedeză pentru Ajutor Umanitar Individual CAbRPAD – Nils, Voluntari, str. Școlii, nr. 5' },
      { lat: '44.41272', lng: '26.14411', info: 'Asociația Pro Act Suport CPVIPAD „Tineretului”, sat Dudu, Com. Chiajna, str. Tineretului, nr. 2B' },
      { lat: '44.50357', lng: '26.13302', info: 'Asociația Sfântul Gabriel cel Viteaz CIAPAD „Sfântul Gabriel cel Viteaz”, Voluntari, str. Ștefan cel Mare, nr. 38' },
      { lat: '44.50678', lng: '26.22076', info: 'Asociația Sfântul Gabriel cel Viteaz CIAPAD „Armonia”, Afumați, șos. București-Urziceni, nr. 36A' },
      { lat: '44.43882', lng: '26.12263', info: 'Asociația Casa Toma Casa Austrului Centru Rezidențial de îngrijire și asistență persoane adulte cu dizabilități, Mogoșoaia, str. Austrului, nr. 1A' },
      { lat: '44.36574', lng: '25.96949', info: 'Fundația Motivation România Centrul de îngrijire și asistență pentru persoanele cu handicap Clinceni nr 2, Bragadiru, șos. Clinceni, nr. 36' },
      { lat: '44.36600', lng: '25.97105', info: 'Fundația Motivation România Centrul de îngrijire și asistență pentru persoanele cu handicap Clinceni 1, Bragadiru, șos. Clinceni, nr. 36' }

    ];

    locations.forEach(loc => {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(Number(loc.lat), Number(loc.lng)),
        map,
        title: loc.info
      });

      const infowindow = new google.maps.InfoWindow({
        content: loc.info
      });

      // tslint:disable-next-line:only-arrow-functions
      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });
    });
  }

  filterJobs() {
    console.log('Filtering jobs with Text:', this.filterText, 'and Disability:', this.selectedDisabilityType);
    this.filteredJobs = this.jobs.filter(job => {
      // tslint:disable-next-line:max-line-length
      const matchesText = !this.filterText || job.description.toLowerCase().includes(this.filterText.toLowerCase()) || job.name.toLowerCase().includes(this.filterText.toLowerCase());
      const matchesDisability = !this.selectedDisabilityType || job.disabilityType === this.selectedDisabilityType;
      console.log(`Job ${job.name}: Matches Text: ${matchesText}, Matches Disability: ${matchesDisability}`);
      return matchesText && matchesDisability;
    });
    console.log('Filtered Jobs:', this.filteredJobs);
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
    this.activeTab = tabName;
    this.showMap = (tabName === 'map-romania');
    if (this.showMap) {
      // Dacă este tabul de hartă, pregătește harta
      this.prepareMap();
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

  setActiveBenzinarie(benzinarie: Benzinarie): void {
    this.activeBenzinarie = benzinarie;  // Stochează benzinarie activă pentru a folosi în cererea de asistență
  }

  submitAssistanceRequest(): void {
    // Logica pentru a trimite cererea de asistență, folosind informațiile din modal
    console.log('Cerere trimisă pentru:', this.activeBenzinarie, this.carNumber, this.carColor, this.fuelType, this.phoneNumber);
    // Aici ai include apeluri de serviciu etc.
  }

  submitNewAppointment(): void {
    const newAppointment = {
      doctorId: this.selectedDoctor,
      date: this.appointmentDate,
      time: this.appointmentTime,
      details: this.appointmentDetails
    };
    console.log('New appointment:', newAppointment);
    // Aici adaugi logica pentru a trimite aceste date la backend
    // De exemplu: this.appointmentService.addAppointment(newAppointment).subscribe(...)
  }
}
