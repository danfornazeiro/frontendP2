import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AppStateService } from '../../core/state/app-state.service';

@Component({
  selector: 'app-orders-page',
  imports: [AsyncPipe],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage {
  private readonly appState = inject(AppStateService);

  readonly orders$ = this.appState.orders$;

  cancel(orderId: number | undefined): void {
    if (!orderId) {
      return;
    }

    this.appState.cancelOrder(orderId).subscribe();
  }
}
