import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent, AdminSidebarComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;

  ngOnInit(): void {
    // Prevent body scroll when sidebar is open on mobile
    this.updateBodyScroll();
  }

  ngOnDestroy(): void {
    // Clean up: restore body scroll
    document.body.style.overflow = '';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.updateBodyScroll();
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.updateBodyScroll();
  }

  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    }
  }

  private updateBodyScroll(): void {
    // Only lock scroll on mobile when sidebar is open
    if (window.innerWidth <= 768 && this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}
