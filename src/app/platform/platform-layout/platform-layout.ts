import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-platform-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-layout.html',
  styleUrl: './platform-layout.scss'
})
export class PlatformLayoutComponent {
  // TODO: Load from AuthService.getUser()
  userName = 'المدير العام';
}
