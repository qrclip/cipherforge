/* eslint-disable */

export class MockedDynamicDialogRef {
  close = jasmine.createSpy('close');
}

export class MockedDynamicDialogConfig {
  data: any = {};
}

export class MockedCFToastService {
  showSuccess(tTitle: string, tMessage: string, tTime: number) {}

  showError(tTitle: string, tMessage: string, tTime: number) {}

  showInfo(tTitle: string, tMessage: string, tTime: number) {}

  showWarning(tTitle: string, tMessage: string, tTime: number) {}
}
