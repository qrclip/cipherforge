import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class CFToastService {
  /////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(private mMessageService: MessageService) {}

  /////////////////////////////////////////////////////
  // SHOW SUCCESS
  showSuccess(tTitle: string, tMessage: string, tTime: number) {
    this.showToast('success', tTitle, tMessage, tTime);
  }

  /////////////////////////////////////////////////////
  // SHOW ERROR
  showError(tTitle: string, tMessage: string, tTime: number) {
    this.showToast('error', tTitle, tMessage, tTime);
  }

  /////////////////////////////////////////////////////
  // SHOW INFO
  showInfo(tTitle: string, tMessage: string, tTime: number) {
    this.showToast('info', tTitle, tMessage, tTime);
  }

  /////////////////////////////////////////////////////
  // SHOW WARNING
  showWarning(tTitle: string, tMessage: string, tTime: number) {
    this.showToast('warn', tTitle, tMessage, tTime);
  }

  /////////////////////////////////////////////////////
  // SHOW TOAST
  private showToast(tSeverity: string, tTitle: string, tMessage: string, tTime: number) {
    let tSticky = false;
    if (tTime === 0) {
      tSticky = true;
    }
    this.mMessageService.add({ severity: tSeverity, summary: tTitle, detail: tMessage, life: tTime, sticky: tSticky });
  }
}
