import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {Observable, throwError} from 'rxjs';
import { User } from '../model/user';
import { CustomHttpRespone } from '../model/custom-http-response';
import {Appointment} from '../model/appointment';
import {Doctor} from '../model/doctor';
import {catchError, tap} from 'rxjs/operators';
import {Assistant} from '../model/assistant';
import {Organization} from '../model/organization';
import {SpecialUser} from '../model/specialuser';
import {Review} from '../model/review';
import {Job} from "../model/job";

@Injectable({providedIn: 'root'})
export class UserService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  public updateUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/update`, formData);
  }

  public resetPassword(email: string): Observable<CustomHttpRespone> {
    return this.http.get<CustomHttpRespone>(`${this.host}/user/resetpassword/${email}`);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`, formData,
    {reportProgress: true,
      observe: 'events'
    });
  }

  public deleteUser(username: string): Observable<CustomHttpRespone> {
    return this.http.delete<CustomHttpRespone>(`${this.host}/user/delete/${username}`);
  }

  public addUsersToLocalCache(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] {
    if (localStorage.getItem('users')) {
        return JSON.parse(localStorage.getItem('users'));
    }
    return null;
  }

  public createUserFormDate(loggedInUsername: string, user: User, profileImage: File): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('phone', user.phone);
    formData.append('gender', user.gender);
    formData.append('role', user.role);
    formData.append('profileImage', profileImage);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    return formData;
  }

  public getAppointmentBySpecialUserUsername(username: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.host}/appointment/findBySpecialUserUsername/${username}`);
  }
  public getDoctorsBySpecialUserUsername(username: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.host}/special-users/by-username/${username}/doctors`)
      .pipe(
        tap(doctors => console.log('Doctors fetched:', doctors)),
        catchError(error => {
          console.error('Error fetching doctors:', error);
          return throwError(() => new Error('Error fetching doctors'));
        })
      );
  }

  public getAssistantBySpecialUserUsername(username: string): Observable<Assistant> {
    return this.http.get<Assistant>(`${this.host}/special-users/${username}/assistant`)
      .pipe(
        tap(assistant => console.log('Assistant fetched:', assistant)),
        catchError(this.handleError)
      );
  }

  // Method to handle errors
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Error fetching data'));
  }

  public getOrganizationsByUsername(username: string): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.host}/special-users/${username}/organizations`);
  }
  public getSpecialUserByDoctorUsername(username: string): Observable<SpecialUser> {
    return this.http.get<SpecialUser>(`${this.host}/doctors/${username}/special-user`);
  }
  public getAppointmentsByDoctorUsername(username: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.host}/doctors/${username}/appointments`);
  }

  public getReviewsByDoctorUsername(username: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.host}/review/doctor/${username}`);
  }

  // Metoda pentru a obține SpecialUser-ul după username-ul asistentului
  getSpecialUserByAssistantUsername(username: string): Observable<SpecialUser> {
    return this.http.get<SpecialUser>(`${this.host}/assistant/${username}/patient`);
  }

  getDoctorsBySpecialUserOfAssistant(assistantUsername: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.host}/assistant/${assistantUsername}/special-user/doctors`);
  }
  getAppointmentsByAssistantUsername(assistantUsername: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.host}/appointmentsByAssistant/${assistantUsername}`);
  }
  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.host}/job/all`);
  }
}
