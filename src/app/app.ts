import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { AppStateService } from './core/state/app-state.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly appState = inject(AppStateService);

  readonly user = toSignal(this.appState.user$, { initialValue: null });
  readonly cart = toSignal(this.appState.cart$, { initialValue: null });

  readonly userName = computed(() => this.user()?.nome ?? null);
  readonly cartCount = computed(() => this.cart()?.produtoId?.length ?? 0);

  ngOnInit(): void {
    this.appState.restoreUserFromStorage().subscribe();
  }

  onLogout(): void {
    this.appState.logout();
  }
}
