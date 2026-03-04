import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { InvestmentsService } from '@nightfall/investments/data-access';
import { InvestmentsTable } from '@nightfall/investments/ui';

@Component({
  selector: 'lib-investments-feature',
  imports: [InvestmentsTable],
  templateUrl: './investments-feature.html',
  styleUrl: './investments-feature.scss',
})
export class InvestmentsFeature {
  private readonly investmentsService = inject(InvestmentsService);
  investments = toSignal(this.investmentsService.getAll(), {
    initialValue: [],
  });
}
