import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AppStateService } from '../../../core/state/app-state.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly appState = inject(AppStateService);
  private readonly router = inject(Router);

  readonly message = signal<string | null>(null);
  readonly loading = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.message.set('Preencha os campos corretamente.');
      return;
    }

    const { email, senha } = this.form.getRawValue();
    this.loading.set(true);
    this.appState.login(email, senha).subscribe({
      next: (user) => {
        this.loading.set(false);
        if (!user) {
          this.message.set('Usuario nao encontrado.');
          return;
        }
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loading.set(false);
        this.message.set('Nao foi possivel acessar a loja agora.');
      },
    });
  }
}
