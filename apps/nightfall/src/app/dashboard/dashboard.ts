import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InvestmentsFeature } from '@nightfall/investments/feature';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, InvestmentsFeature],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
