import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  fb = inject(FormBuilder);
  auth = inject(AuthService);

  // Loading state for the button spinner
  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.loginForm.value;

      try {
        await this.auth.login(email!, password!);
      } catch (error) {
        // Error handling is managed in AuthService (alert),
        // but we need to stop the spinner here
        console.error(error);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
