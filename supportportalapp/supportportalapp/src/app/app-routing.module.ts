import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { AuthenticationGuard } from './guard/authentication.guard';
import {AboutComponent} from './about/about.component';
import {LogoutComponent} from './logout/logout.component';
import {HomeComponent} from './home/home.component';
import {ContactComponent} from './contact/contact.component';
import {ServiciiComponent} from './servicii/servicii.component';
import {RecenzieComponent} from './recenzie/recenzie.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user/management', component: UserComponent, canActivate: [AuthenticationGuard] },
  { path: 'logout', component: LogoutComponent, canActivate: [AuthenticationGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'servicii', component: ServiciiComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'recenzie', component: RecenzieComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
