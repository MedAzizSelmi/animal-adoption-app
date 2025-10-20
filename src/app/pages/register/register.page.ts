import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerForm: FormGroup;
  selectedRole: 'user' | 'refuge' = 'user';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: [''],
      refugeName: [''],
      refugeAddress: [''],
      refugePhone: [''],
    });
  }

  onRoleChange(role: 'user' | 'refuge') {
    this.selectedRole = role;
    this.updateValidators();
  }

  updateValidators() {
    if (this.selectedRole === 'refuge') {
      this.registerForm.get('refugeName')?.setValidators([Validators.required]);
      this.registerForm.get('displayName')?.clearValidators();
    } else {
      this.registerForm.get('displayName')?.setValidators([Validators.required]);
      this.registerForm.get('refugeName')?.clearValidators();
      this.registerForm.get('refugeAddress')?.clearValidators();
      this.registerForm.get('refugePhone')?.clearValidators();
    }
    this.registerForm.get('refugeName')?.updateValueAndValidity();
    this.registerForm.get('displayName')?.updateValueAndValidity();
    this.registerForm.get('refugeAddress')?.updateValueAndValidity();
    this.registerForm.get('refugePhone')?.updateValueAndValidity();
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Création du compte...',
    });
    await loading.present();

    try {
      const { email, password, displayName, refugeName, refugeAddress, refugePhone } =
        this.registerForm.value;

      const additionalData =
        this.selectedRole === 'refuge'
          ? { refugeName, refugeAddress, refugePhone }
          : { displayName };

      await this.authService.register(email, password, this.selectedRole, additionalData);
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Succès',
        message: 'Compte créé avec succès!',
        buttons: ['OK'],
      });
      await alert.present();

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

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé.';
      case 'auth/invalid-email':
        return 'Format d\'email invalide.';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  }
}
