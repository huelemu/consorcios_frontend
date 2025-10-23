import { Component } from '@angular/core';
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: []
})

export class LoginComponent {
  constructor(private socialAuthService: SocialAuthService, private authService: AuthService) {}

  loginWithGoogle() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user: any) => {
      this.authService.googleLogin(user.idToken).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          window.location.href = '/dashboard';
        },
        error: (err: any) => {
          console.error('Error login:', err);
          alert('Error en el login');
        },
      });
    });
  }
}
