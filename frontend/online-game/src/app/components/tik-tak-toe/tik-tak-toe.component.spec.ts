import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TikTakToeComponent } from './tik-tak-toe.component';

describe('TikTakToeComponent', () => {
  let component: TikTakToeComponent;
  let fixture: ComponentFixture<TikTakToeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TikTakToeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TikTakToeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
