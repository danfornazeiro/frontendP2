import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AppStateService } from '../../core/state/app-state.service';

@Component({
  selector: 'app-edit-profile-page',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.page.html',
  styleUrl: './edit-profile.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfilePage implements OnInit {
  private readonly appState = inject(AppStateService);
  private readonly router = inject(Router);

  readonly message = signal<string | null>(null);

  readonly profileForm = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    telefone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    logradouro: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly passwordForm = new FormGroup({
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.appState.restoreUserFromStorage().subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          nome: user.nome,
          email: user.email,
          telefone: user.telefone,
          logradouro: user.logradouro,
        });
      } else {
        this.message.set('Faca login para editar o perfil.');
        this.router.navigate(['/login']);
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.message.set('Preencha os dados corretamente.');
      return;
    }

    const payload = this.profileForm.getRawValue();
    this.appState.updateProfile(payload).subscribe({
      next: () => {
        this.message.set('Perfil atualizado.');
        this.router.navigate(['/profile']);
      },
      error: () => this.message.set('Nao foi possivel atualizar o perfil.'),
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.message.set('Informe uma nova senha valida.');
      return;
    }

    const clientId = this.appState.getClientId();
    if (!clientId) {
      this.message.set('Usuario nao identificado.');
      return;
    }

    this.appState.changePassword(clientId, this.passwordForm.getRawValue().senha).subscribe({
      next: () => this.message.set('Senha atualizada.'),
      error: () => this.message.set('Nao foi possivel alterar a senha.'),
    });
  }
}
