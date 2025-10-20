import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Connexion en cours...',
    });
    await loading.present();

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.login(email, password);
      await loading.dismiss();
      this.router.navigate(['/tabs']);
    } catch (error: any) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: this.getErrorMessage(error.code),
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Email ou mot de passe incorrect.';
      case 'auth/invalid-email':
        return 'Format d\'email invalide.';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  }
}
