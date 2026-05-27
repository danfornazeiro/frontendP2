import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AppStateService } from '../../core/state/app-state.service';

@Component({
  selector: 'app-create-profile-page',
  imports: [ReactiveFormsModule],
  templateUrl: './create-profile.page.html',
  styleUrl: './create-profile.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProfilePage {
  private readonly appState = inject(AppStateService);
  private readonly router = inject(Router);

  readonly message = signal<string | null>(null);

  readonly profileForm = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    telefone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    logradouro: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submit(): void {
    if (this.profileForm.invalid) {
      this.message.set('Preencha os dados corretamente.');
      return;
    }

    this.appState.createUser(this.profileForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: () => this.message.set('Nao foi possivel criar o perfil.'),
    });
  }
}
