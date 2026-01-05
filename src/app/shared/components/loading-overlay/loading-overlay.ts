/**
 * Loading Overlay Component
 * 
 * Full-screen loading indicator with spinner
 * Prevents user interaction during async operations
 * Controlled by parent component via @Input()
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.html',
  styleUrls: ['./loading-overlay.scss']
})
export class LoadingOverlayComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'جاري التحميل...';
}
