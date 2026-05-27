import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppStateService } from '../../core/state/app-state.service';

@Component({
  selector: 'app-profile-page',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  private readonly appState = inject(AppStateService);

  readonly user$ = this.appState.user$;

  ngOnInit(): void {
    this.appState.restoreUserFromStorage().subscribe();
  }
}
