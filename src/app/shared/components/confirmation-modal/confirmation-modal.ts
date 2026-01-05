/**
 * Confirmation Modal Component
 * 
 * Reusable confirmation dialog for destructive actions
 * Mobile-friendly, RTL-supported
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrls: ['./confirmation-modal.scss']
})
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'تأكيد العملية';
  @Input() message: string = 'هل أنت متأكد من إتمام هذه العملية؟';
  @Input() confirmText: string = 'تأكيد';
  @Input() cancelText: string = 'إلغاء';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(): void {
    this.onCancel();
  }
}
