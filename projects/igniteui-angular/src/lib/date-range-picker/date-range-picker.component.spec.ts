import { IgxDateRangePickerComponent } from './date-range-picker.component';
import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, OnInit, ViewChild, DebugElement } from '@angular/core';
import { IgxInputGroupModule } from '../input-group/index';
import { InteractionMode } from '../core/enums';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { IgxCalendarComponent } from '../calendar/index';
import { IgxDateRangePickerModule } from './igx-date-range-picker.module';
import { By } from '@angular/platform-browser';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { HelperTestFunctions } from '../calendar/calendar-helper-utils';
import { IgxDateTimeEditorModule } from '../directives/date-time-editor';

// The number of milliseconds in one day
const ONE_DAY = 1000 * 60 * 60 * 24;

const CSS_CLASS_INPUT = 'igx-input-group__input';
const CSS_CLASS_TOGGLE_BUTTON = 'igx-icon';
const CSS_CLASS_CALENDAR = 'igx-calendar';
const CSS_CLASS_CALENDAR_WRAPPER = 'igx-toggle'; // TODO Implementation -> maybe add class for the div container ('igx-date-picker')
const CSS_CLASS_DATE_PICKER = 'igx-date-picker';
const CSS_CLASS_DONE_BUTTON = 'igx-button--flat';

function getDatesInView(dates: DebugElement[]): DebugElement[] {
    return dates.filter(d => {
        const date = d.childNodes[0].nativeNode.innerText;
        return date !== `${new Date().getDate()}` ? date : null;
    });
}

describe('IgxDateRangePicker', () => {
    describe('Unit tests: ', () => {
        const elementRef = { nativeElement: null };
        const calendar = new IgxCalendarComponent();
        it('should set range dates correctly through selectRange method', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, null);
            dateRange.calendar = calendar;
            let startDate = new Date(2020, 3, 7);
            const endDate = new Date(2020, 6, 27);

            // select range
            dateRange.selectRange(startDate, endDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(endDate);

            // select startDate only
            startDate = new Date(2023, 2, 11);
            dateRange.selectRange(startDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(startDate);
        });

        it('should set range dates correctly through selectToday method', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, null);
            dateRange.calendar = calendar;
            const today = new Date();

            dateRange.selectRange(new Date());
            expect(dateRange.value.start).toEqual(today);
            expect(dateRange.value.end).toEqual(today);
        });

        it('should emit rangeSelected on selection', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, null);
            dateRange.calendar = calendar;
            spyOn(dateRange.rangeSelected, 'emit');
            let startDate = new Date(2017, 4, 5);
            const endDate = new Date(2017, 11, 22);

            // select range
            dateRange.selectRange(startDate, endDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(endDate);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledTimes(1);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledWith({ start: startDate, end: endDate });

            // select startDate only
            startDate = new Date(2024, 12, 15);
            dateRange.selectRange(startDate);
            expect(dateRange.value.start).toEqual(startDate);
            expect(dateRange.value.end).toEqual(startDate);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledTimes(2);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledWith({ start: startDate, end: startDate });
        });

        it('should emit rangeSelected on selectToday()', () => {
            const dateRange = new IgxDateRangePickerComponent(elementRef, null, null);
            dateRange.calendar = calendar;
            spyOn(dateRange.rangeSelected, 'emit');
            const today = new Date();

            dateRange.selectRange(new Date());
            expect(dateRange.value.start).toEqual(today);
            expect(dateRange.value.end).toEqual(today);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledTimes(1);
            expect(dateRange.rangeSelected.emit).toHaveBeenCalledWith({ start: today, end: today });
        });
    });

    // tslint:disable: no-use-before-declare
    describe('Integration tests', () => {
        let fixture: ComponentFixture<DateRangeTestComponent>;
        let endDate: Date;
        let startDate: Date;
        let toggleBtn: DebugElement;
        let calendarElement: DebugElement;
        let calendarWrapper: DebugElement;
        let dateRange: IgxDateRangePickerComponent;

        /**
         * Formats a date to 'MM/dd/yyyy' string
         * @param date Date to be formatted
         */
        function formatFullDate(date: Date): string {
            const year = `${date.getFullYear()}`.padStart(4, '0');
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            const fullDate = [month, day, year].join('/');
            return fullDate;
        }
        describe('Selection tests', () => {
            let calendarDays: DebugElement[];
            function selectDateRangeFromCalendar(startDateDay: number, dayRange: number) {
                const startDateDayElIndex = startDateDay - 1;
                const endDateDayElIndex = startDateDayElIndex + dayRange;
                dateRange.open();
                fixture.detectChanges();
                calendarDays[startDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                if (dayRange !== 0) {
                    calendarDays[endDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                }
                fixture.detectChanges();
                dateRange.close();
                fixture.detectChanges();
            }
            describe('Single Input', () => {
                let singleInputElement: DebugElement;
                configureTestSuite();
                beforeAll(async(() => {
                    TestBed.configureTestingModule({
                        declarations: [
                            DateRangeTestComponent,
                            DateRangeDefaultComponent
                        ],
                        imports: [IgxDateRangePickerModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                    })
                        .compileComponents();
                }));
                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(DateRangeDefaultComponent);
                    fixture.detectChanges();
                    dateRange = fixture.componentInstance.dateRange;
                    calendarDays = fixture.debugElement.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));
                    singleInputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                }));

                function verifyDateRangeInSingleInput() {
                    expect(dateRange.value.start).toEqual(startDate);
                    expect(dateRange.value.end).toEqual(endDate);
                    const inputStartDate = [startDate.getMonth() + 1, startDate.getDate(), startDate.getFullYear()].join('/');
                    const inputEndDate = endDate ? [endDate.getMonth() + 1, endDate.getDate(), endDate.getFullYear()].join('/') : '';
                    expect(singleInputElement.nativeElement.value).toEqual(`${inputStartDate} - ${inputEndDate}`);
                }

                it('should assign range dates to the input when selecting a range from the calendar', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const dayRange = 15;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRangeInSingleInput();
                });

                it('should assign range values correctly when selecting dates in reversed order', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const dayRange = -5;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 5, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    selectDateRangeFromCalendar(endDate.getDate(), dayRange);
                    verifyDateRangeInSingleInput();
                });

                it('should set start date on single date selection', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const dayRange = 0;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = null;
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRangeInSingleInput();
                });

                it('should update input correctly on first and last date selection', () => {
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
                    const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
                    const dayRange = Math.round(differenceMs / ONE_DAY);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRangeInSingleInput();
                });

                it('should assign range values correctly when selecting through API', () => {
                    startDate = new Date(2020, 10, 8, 0, 0, 0);
                    endDate = new Date(2020, 11, 8, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRangeInSingleInput();

                    startDate = new Date(2006, 5, 18, 0, 0, 0);
                    endDate = new Date(2006, 8, 18, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRangeInSingleInput();
                });

                it('should close the calendar with the "Done" button', fakeAsync(() => {
                    fixture.componentInstance.mode = InteractionMode.Dialog;
                    fixture.detectChanges();
                    const doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));

                    const dayRange = 8;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    const startDateDayElIndex = startDate.getDate() - 1;
                    const endDateDayElIndex = startDateDayElIndex + dayRange;
                    dateRange.open();
                    tick();
                    fixture.detectChanges();
                    expect(dateRange.collapsed).toBeFalsy();
                    calendarDays[startDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    calendarDays[endDateDayElIndex].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    fixture.detectChanges();
                    doneBtn.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
                    tick();
                    fixture.detectChanges();
                    verifyDateRangeInSingleInput();
                    expect(dateRange.collapsed).toBeTruthy();
                }));

                it('should show the "Done" button only in dialog mode', () => {
                    fixture.componentInstance.mode = InteractionMode.Dialog;
                    fixture.detectChanges();

                    dateRange.toggle();
                    fixture.detectChanges();
                    let doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    expect(doneBtn).not.toBe(null);
                    dateRange.toggle();
                    fixture.detectChanges();

                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    dateRange.toggle();
                    fixture.detectChanges();
                    doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    expect(doneBtn).toBe(null);
                    dateRange.toggle();
                    fixture.detectChanges();
                });

                it('should be able to change the "Done" button text', () => {
                    fixture.componentInstance.mode = InteractionMode.Dialog;
                    fixture.detectChanges();

                    let doneBtnText = 'Done';
                    dateRange.toggle();
                    fixture.detectChanges();
                    let doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    expect(doneBtn.nativeElement.textContent).toEqual(doneBtnText);
                    dateRange.toggle();
                    fixture.detectChanges();

                    doneBtnText = 'Close';
                    dateRange.doneButtonText = doneBtnText;
                    fixture.detectChanges();
                    dateRange.toggle();
                    fixture.detectChanges();
                    doneBtn = fixture.debugElement.query(By.css(`.${CSS_CLASS_DONE_BUTTON}`));
                    expect(doneBtn.nativeElement.textContent).toEqual(doneBtnText);
                    dateRange.toggle();
                    fixture.detectChanges();
                });
            });

            describe('Two Inputs', () => {
                let startInput: DebugElement;
                let endInput: DebugElement;
                configureTestSuite();
                beforeAll(async(() => {
                    TestBed.configureTestingModule({
                        declarations: [
                            DateRangeTestComponent,
                            DateRangeTwoInputsTestComponent
                        ],
                        imports: [IgxDateRangePickerModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                    })
                        .compileComponents();
                }));
                beforeEach(async () => {
                    fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                    fixture.detectChanges();
                    dateRange = fixture.componentInstance.dateRange;
                    startInput = fixture.debugElement.query(By.css('input'));
                    endInput = fixture.debugElement.queryAll(By.css('input'))[1];
                    calendarDays = fixture.debugElement.queryAll(By.css(HelperTestFunctions.DAY_CSSCLASS));
                });

                function verifyDateRange() {
                    expect(dateRange.value.start).toEqual(startDate);
                    expect(dateRange.value.end).toEqual(endDate);
                    expect(startInput.nativeElement.value).toEqual(formatFullDate(startDate));
                    const expectedEndDate = endDate ? formatFullDate(endDate) : '__/__/____';
                    expect(endInput.nativeElement.value).toEqual(expectedEndDate);
                }

                it('should assign range values correctly when selecting dates from the calendar', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    let dayRange = 15;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRange();

                    dayRange = 13;
                    startDate = new Date(today.getFullYear(), today.getMonth(), 6, 0, 0, 0);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + dayRange);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRange();
                });

                it('should assign range values correctly when selecting dates in reversed order', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const dayRange = -10;
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 10, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth(), 20, 0, 0, 0);
                    selectDateRangeFromCalendar(endDate.getDate(), dayRange);
                    verifyDateRange();
                });

                it('should apply selection to start date when single date is selected', () => {
                    fixture.componentInstance.mode = InteractionMode.DropDown;
                    fixture.detectChanges();

                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 4, 0, 0, 0);
                    endDate = null;

                    selectDateRangeFromCalendar(startDate.getDate(), 0);
                    verifyDateRange();
                });

                it('should update inputs correctly on first and last date selection', () => {
                    const today = new Date();
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 0, 0, 0);
                    const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
                    const dayRange = Math.round(differenceMs / ONE_DAY);
                    selectDateRangeFromCalendar(startDate.getDate(), dayRange);
                    verifyDateRange();
                });

                it('should assign range values correctly when selecting through API', () => {
                    startDate = new Date(2020, 10, 8, 0, 0, 0);
                    endDate = new Date(2020, 11, 8, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRange();

                    startDate = new Date(2003, 5, 18, 0, 0, 0);
                    endDate = new Date(2003, 8, 18, 0, 0, 0);
                    dateRange.selectRange(startDate, endDate);
                    fixture.detectChanges();
                    verifyDateRange();
                });
            });
        });

        describe('Templates ', () => { });

        describe('Calendar UI', () => {
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeTwoInputsTestComponent
                    ],
                    imports: [IgxDateRangePickerModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            beforeEach(async () => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.detectChanges();
                dateRange = fixture.componentInstance.dateRange;
            });

            xit('should move focus to the calendar on open in dropdown mode', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.componentInstance.mode = InteractionMode.DropDown;
                fixture.detectChanges();

                const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
                // UIInteractions.clickElement(startInput.nativeElement);
                tick(100);
                fixture.detectChanges();
                expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
            }));

            xit('should move focus to the calendar on open in dialog mode', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.componentInstance.mode = InteractionMode.Dialog;
                fixture.detectChanges();

                const startInput = fixture.debugElement.queryAll(By.css('.igx-input-group'))[1];
                // UIInteractions.clickElement(startInput.nativeElement);
                tick(100);
                fixture.detectChanges();
                expect(document.activeElement.textContent.trim()).toMatch(new Date().getDate().toString());
            }));

            xit('should move the focus to start input on close (date range with two inputs)', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                fixture.componentInstance.mode = InteractionMode.DropDown;
                fixture.detectChanges();

                fixture.componentInstance.dateRange.open();
                tick();
                fixture.detectChanges();

                const button = fixture.debugElement.query(By.css('.igx-button--flat'));
                // UIInteractions.clickElement(button);
                tick();
                fixture.detectChanges();

                fixture.componentInstance.dateRange.close();
                tick();
                fixture.detectChanges();

                expect(document.activeElement).toHaveClass('igx-input-group__input');
            }));

            xit('should move the focus to the single input on close', fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultComponent);
                fixture.componentInstance.mode = InteractionMode.DropDown;
                fixture.detectChanges();

                fixture.componentInstance.dateRange.open();
                tick();
                fixture.detectChanges();

                const button = fixture.debugElement.query(By.css('.igx-button--flat'));
                // UIInteractions.clickElement(button);
                tick();
                fixture.detectChanges();

                fixture.componentInstance.dateRange.close();
                tick();
                fixture.detectChanges();

                expect(document.activeElement).toHaveClass('igx-input-group__input');
            }));
        });

        describe('Keyboard Navigation', () => {
            const escapeKeyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            const altArrowDownKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowDown' });
            const altArrowUpKeyEvent = new KeyboardEvent('keydown', { altKey: true, key: 'ArrowUp' });

            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeDefaultComponent,
                        DateRangeTwoInputsTestComponent
                    ],
                    imports: [IgxDateRangePickerModule, IgxDateTimeEditorModule, IgxInputGroupModule, NoopAnimationsModule, FormsModule]
                })
                    .compileComponents();
            }));

            describe('Keyboard Navigation Single Input', () => {
                let input: DebugElement;
                let dateRangeSingle: IgxDateRangePickerComponent;
                let calendar: DebugElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(DateRangeDefaultComponent);
                    dateRangeSingle = fixture.componentInstance.dateRange;
                    fixture.detectChanges();
                    dateRangeSingle.mode = InteractionMode.DropDown;
                    fixture.detectChanges();
                    input = fixture.debugElement.query(By.css('input'));
                    calendar = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR));
                }));

                it('Should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                    expect(dateRangeSingle.collapsed).toBeTruthy();
                    calendar.triggerEventHandler('keydown', altArrowDownKeyEvent);
                    tick();
                    fixture.detectChanges();
                    expect(dateRangeSingle.collapsed).toBeFalsy();
                    calendar.triggerEventHandler('keydown', altArrowUpKeyEvent);
                    tick();
                    fixture.detectChanges();
                    expect(dateRangeSingle.collapsed).toBeTruthy();
                }));

                it('Should close the calendar with ESC', fakeAsync(() => {
                    expect(dateRangeSingle.collapsed).toBeTruthy();
                    dateRangeSingle.toggleDirective.toggle();
                    tick();
                    fixture.detectChanges();

                    expect(dateRangeSingle.collapsed).toBeFalsy();

                    calendar.triggerEventHandler('keydown', escapeKeyEvent);
                    tick();
                    fixture.detectChanges();

                    expect(dateRangeSingle.collapsed).toBeTruthy();
                }));
            });
            describe('Keyboard Navigation Two Inputs', () => {
                let startInput: DebugElement;
                let endInput: DebugElement;
                let dateRangeTwoInputs: IgxDateRangePickerComponent;
                let calendar: DebugElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(DateRangeTwoInputsTestComponent);
                    dateRangeTwoInputs = fixture.componentInstance.dateRange;
                    fixture.detectChanges();
                    dateRangeTwoInputs.mode = InteractionMode.DropDown;
                    startInput = fixture.debugElement.query(By.css('input'));
                    endInput = fixture.debugElement.queryAll(By.css('input'))[1];
                    calendar = fixture.debugElement.query(By.css(CSS_CLASS_CALENDAR));
                }));

                it('Should toggle the calendar with ALT + DOWN/UP ARROW key', fakeAsync(() => {
                    expect(dateRangeTwoInputs.collapsed).toBeTruthy();

                    calendar.triggerEventHandler('keydown', altArrowDownKeyEvent);
                    tick();
                    fixture.detectChanges();
                    expect(dateRangeTwoInputs.collapsed).toBeFalsy();

                    calendar.triggerEventHandler('keydown', altArrowUpKeyEvent);
                    tick();
                    fixture.detectChanges();
                    expect(dateRangeTwoInputs.collapsed).toBeTruthy();
                }));

                it('Should close the calendar with ESC', fakeAsync(() => {
                    expect(dateRangeTwoInputs.collapsed).toBeTruthy();

                    dateRangeTwoInputs.toggle();
                    tick();
                    fixture.detectChanges();

                    expect(dateRangeTwoInputs.collapsed).toBeFalsy();

                    calendar.triggerEventHandler('keydown', escapeKeyEvent);
                    tick();
                    fixture.detectChanges();

                    expect(dateRangeTwoInputs.collapsed).toBeTruthy();
                }));
            });
        });

        describe('Validation', () => {
            let dateRangePicker: IgxDateRangePickerComponent;
            fit('IgxDateRangePickerComponent ControlValueAccessor Unit', () => {
                const mockNgControl = jasmine.createSpyObj('NgControl', ['registerOnChangeCb', 'registerOnTouchedCb']);
                const range = { start: new Date(2020, 1, 18), end: new Date(2020, 1, 28)};
                const rangeUpdate = { start: new Date(2020, 2, 22), end: new Date(2020, 2, 25)};

                // init
                dateRangePicker = new IgxDateRangePickerComponent(null, 'en', null);
                dateRangePicker.registerOnChange(mockNgControl.registerOnChangeCb);
                dateRangePicker.registerOnTouched(mockNgControl.registerOnTouchedCb);
                spyOn(dateRangePicker, 'handleSelection');

                // writeValue
                expect(dateRangePicker.value).toBeUndefined();
                expect(mockNgControl.registerOnChangeCb).not.toHaveBeenCalled();
                dateRangePicker.writeValue(range);
                expect(dateRangePicker.value).toBe(range);

                // set value & handleSelection call _onChangeCallback
                dateRangePicker.value = rangeUpdate;
                expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith(rangeUpdate);

                dateRangePicker.handleSelection([range.start]);
                expect(dateRangePicker.handleSelection).toHaveBeenCalledWith([range.start]);
                expect(dateRangePicker.handleSelection).toHaveBeenCalledTimes(1);
                expect(mockNgControl.registerOnChangeCb).toHaveBeenCalledWith({start: range.start, end: range.end});

                // awaiting implementation - OnTouched callback
                // Docs: changes the value, turning the control dirty; or blurs the form control element, setting the control to touched.
                // when handleSelection fires should be touched&dirty // when input is blurred(two inputs), should be touched.
                // dateRangePicker.handleSelection([range.start]);
                // expect(mockNgControl.registerOnTouchedCb).toHaveBeenCalledTimes(1);

                // awaiting implementation - setDisabledState
                // dateRangePicker.setDisabledState(true);
                // expect(dateRangePicker.disabled).toBe(true);
                // dateRangePicker.setDisabledState(false);
                // expect(dateRangePicker.disabled).toBe(false);
            });
        });

        describe('Templating', () => {
        });

        describe('ARIA', () => {
            let singleInputElement: DebugElement;
            let dateRangeSingle: IgxDateRangePickerComponent;
            configureTestSuite();
            beforeAll(async(() => {
                TestBed.configureTestingModule({
                    declarations: [
                        DateRangeTestComponent,
                        DateRangeDefaultCustomLabelComponent
                    ],
                    imports: [IgxDateRangePickerModule, IgxDateTimeEditorModule, IgxInputGroupModule, FormsModule, NoopAnimationsModule]
                })
                    .compileComponents();
            }));
            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(DateRangeDefaultCustomLabelComponent);
                fixture.detectChanges();
            }));
            it('should render aria attributes properly', fakeAsync(() => {
                dateRangeSingle = fixture.componentInstance.dateRange;

                toggleBtn = fixture.debugElement.query(By.css('.' + CSS_CLASS_TOGGLE_BUTTON));
                calendarElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_CALENDAR));
                singleInputElement = fixture.debugElement.query(By.css('.' + CSS_CLASS_INPUT));
                startDate = new Date(2020, 1, 1);
                endDate = new Date(2020, 1, 4);
                const expectedLabelID = dateRangeSingle.label.id;
                const expectedPlaceholder = singleInputElement.nativeElement.getAttribute('placeholder');

                expect(singleInputElement.nativeElement.getAttribute('role')).toEqual('combobox');
                expect(singleInputElement.nativeElement.getAttribute('placeholder')).toEqual(expectedPlaceholder);
                expect(singleInputElement.nativeElement.getAttribute('aria-haspopup')).toEqual('grid');
                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');
                expect(calendarElement.nativeElement.getAttribute('role')).toEqual('grid');
                expect(singleInputElement.nativeElement.getAttribute('aria-labelledby')).toEqual(expectedLabelID);

                dateRangeSingle.toggle();
                tick();
                fixture.detectChanges();

                calendarWrapper = fixture.debugElement.query(By.css('.' + CSS_CLASS_CALENDAR_WRAPPER));
                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('true');
                expect(calendarWrapper.nativeElement.getAttribute('aria-hidden')).toEqual('false');

                dateRangeSingle.toggle();
                tick();
                fixture.detectChanges();

                expect(singleInputElement.nativeElement.getAttribute('aria-expanded')).toEqual('false');
                expect(toggleBtn.nativeElement.getAttribute('aria-hidden')).toEqual('true');

                dateRangeSingle.selectRange(startDate, endDate);
                fixture.detectChanges();
                expect(singleInputElement.nativeElement.getAttribute('placeholder')).toEqual('');
            }));
        });
    });
});

@Component({
    selector: 'igx-date-range-test',
    template: ''
})
export class DateRangeTestComponent implements OnInit {
    public todayButtonText: string;
    public doneButtonText: string;
    public mode: InteractionMode;

    @ViewChild(IgxDateRangePickerComponent, { read: IgxDateRangePickerComponent, static: true })
    public dateRange: IgxDateRangePickerComponent;

    public ngOnInit(): void {
        this.todayButtonText = 'Today';
        this.doneButtonText = 'Done';
    }
}

@Component({
    selector: 'igx-date-range-two-inputs-test',
    template: `
    <igx-date-range-picker [mode]="mode" [(ngModel)]="range">
            <igx-date-range-start>
                <input igxInput igxDateTimeEditor type="text" required>
            </igx-date-range-start>
            <igx-date-range-end>
                <input igxInput igxDateTimeEditor type="text" required>
            </igx-date-range-end>
        </igx-date-range-picker>
`
})
export class DateRangeTwoInputsTestComponent extends DateRangeTestComponent {
    startDate = new Date(2020, 1, 1);
    endDate = new Date(2020, 1, 4);
}

@Component({
    selector: 'igx-date-range-single-input-label-test',
    template: `
    <igx-date-range-picker [mode]="'dropdown'">
        <label igxLabel>Select Date</label>
    </igx-date-range-picker>
    `
})
export class DateRangeDefaultCustomLabelComponent extends DateRangeTestComponent {
}

@Component({
    selector: 'igx-date-range-single-input-test',
    template: `
    <igx-date-range-picker [mode]="mode">
    </igx-date-range-picker>
    `
})
export class DateRangeDefaultComponent extends DateRangeTestComponent { }
