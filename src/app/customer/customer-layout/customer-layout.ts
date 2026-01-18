import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerHeaderComponent } from '../customer-header/customer-header';
import { CustomerSidebarComponent } from '../customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerHeaderComponent, CustomerSidebarComponent],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss'
})
export class CustomerLayoutComponent implements OnInit, OnDestroy {
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
