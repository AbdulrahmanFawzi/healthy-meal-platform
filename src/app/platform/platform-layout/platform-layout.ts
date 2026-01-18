import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-platform-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './platform-layout.html',
  styleUrl: './platform-layout.scss'
})
export class PlatformLayoutComponent {
  // TODO: Load from AuthService.getUser()
  userName = 'المدير العام';
}
