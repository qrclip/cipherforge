/* eslint-disable */

import { TestBed } from '@angular/core/testing';

import { CFToastService } from './cf-toast.service';
import { CFToastModule } from './cf-toast.module';
import { MessageService } from 'primeng/api';

class MockedMessageService {
  add(tVal: any) {}
}

describe('CFToastService', () => {
  let service: CFToastService;
  let mockedMessageService: MockedMessageService;

  /////////////////////////////////////////////////////////////////
  // BEFORE EACH
  beforeEach(() => {
    mockedMessageService = new MockedMessageService();
    TestBed.configureTestingModule({
      imports: [CFToastModule],
      providers: [{ provide: MessageService, useValue: mockedMessageService }],
    });
    service = TestBed.inject(CFToastService);
  });

  /////////////////////////////////////////////////////////////////
  // CREATE
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /////////////////////////////////////////////////////////////////
  // SHOW SUCCESS
  it('showSuccess', () => {
    spyOn(mockedMessageService, 'add').and.callThrough();
    service.showSuccess('TS', 'MS', 100);
    expect(mockedMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'TS',
      detail: 'MS',
      life: 100,
      sticky: false,
    });
  });

  /////////////////////////////////////////////////////////////////
  // SHOW ERROR
  it('showError', () => {
    spyOn(mockedMessageService, 'add').and.callThrough();
    service.showError('TE', 'ME', 0);
    expect(mockedMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'TE',
      detail: 'ME',
      life: 0,
      sticky: true,
    });
  });

  /////////////////////////////////////////////////////////////////
  // SHOW INFO
  it('showInfo', () => {
    spyOn(mockedMessageService, 'add').and.callThrough();
    service.showInfo('TI', 'MI', 600);
    expect(mockedMessageService.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'TI',
      detail: 'MI',
      life: 600,
      sticky: false,
    });
  });

  /////////////////////////////////////////////////////////////////
  // SHOW INFO
  it('showWarning', () => {
    spyOn(mockedMessageService, 'add').and.callThrough();
    service.showWarning('TW', 'MW', 602);
    expect(mockedMessageService.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'TW',
      detail: 'MW',
      life: 602,
      sticky: false,
    });
  });
});
