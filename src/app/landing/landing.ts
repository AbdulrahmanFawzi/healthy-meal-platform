import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent {
  features: Feature[] = [
    {
      icon: 'assets/correct.svg',
      title: 'تتبع الطلبات',
      description: 'تحديثات فورية لحالة الطلب'
    },
    {
      icon: 'assets/account.svg',
      title: 'طلب سهل',
      description: 'نظام طلبات رقمي بسيط\nومنظم'
    },
    {
      icon: 'assets/chart.svg',
      title: 'خطط الاشتراك',
      description: 'خيارات اشتراك أسبوعية\nوشهرية'
    },
    {
      icon: 'assets/fork.svg',
      title: 'وجبات صحية',
      description: 'وجبات طازجة ومغذية يتم\nتحضيرها يوميًا'
    }
  ];
}
