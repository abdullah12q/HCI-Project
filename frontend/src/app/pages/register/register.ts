import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  fb = inject(FormBuilder);
  auth = inject(AuthService);

  isLoading = signal(false);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.registerForm.value;

      try {
        await this.auth.register(email!, password!);
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
