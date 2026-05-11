import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalsService } from '../../../services/modals.service';
import { EventsService, CalendarEvent } from '../../../services/events.service';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calendar-modal.component.html',
  styleUrl: './calendar-modal.component.scss',
})
export class CalendarModalComponent implements OnInit {
  currentDate: Date = new Date();
  selectedDate: Date = new Date();

  events: CalendarEvent[] = [];
  daysInView: any[] = []; // Definida para evitar el error NG9

  showCreateEventModal = false;
  showViewEventModal = false;
  selectedEvent: CalendarEvent | null = null;

  eventForm = {
    title: '',
    date: '',
    time: '',
    participants: '',
    description: '',
  };

  constructor(
    private modalsService: ModalsService,
    private eventsService: EventsService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.eventsService.getEvents().subscribe(events => {
        this.events = events;
        this.generateCalendarDays();
        this.cdr.detectChanges();
    });
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: any[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ isEmpty: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateToCheck = new Date(year, month, day);
      
      const hasEvents = this.events.some(e => {
          const eventDate = new Date(e.date);
          return this.isSameDate(eventDate, dateToCheck);
      });

      const isToday = this.isSameDate(dateToCheck, new Date());
      const isSelected = this.isSameDate(dateToCheck, this.selectedDate);

      days.push({
        day,
        date: dateToCheck,
        hasEvents, 
        isToday,
        isSelected,
      });
    }
    
    this.daysInView = days;
  }

  get monthYear(): string {
    return `${this.currentDate.toLocaleDateString('es-ES', { month: 'long' })} ${this.currentDate.getFullYear()}`;
  }

  get agendaDate(): string {
    return this.selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  get weekDays(): string[] {
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  }

  get agendaEvents(): CalendarEvent[] {
    return this.events
      .filter((e) => this.isSameDate(new Date(e.date), this.selectedDate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.generateCalendarDays();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.generateCalendarDays();
  }

  openCreateEventModal(): void {
    const year = this.selectedDate.getFullYear();
    const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = this.selectedDate.getDate().toString().padStart(2, '0');
    this.eventForm.date = `${year}-${month}-${day}`;
    this.showCreateEventModal = true;
  }

  createEvent(): void {
    if (!this.eventForm.title || !this.eventForm.date) return;

    const [year, month, day] = this.eventForm.date.split('-').map(Number);
    let hour = 0, minute = 0;
    
    if(this.eventForm.time) {
        [hour, minute] = this.eventForm.time.split(':').map(Number);
    }

    const eventDate = new Date(year, month - 1, day, hour, minute);

    const newEvent: CalendarEvent = {
      id: Date.now(),
      date: eventDate,
      title: this.eventForm.title,
      color: 'purple',
      description: this.eventForm.description || '',
      participants: []
    };

    this.eventsService.addEvent(newEvent);
    this.closeCreateEventModal();
  }

  closeCreateEventModal(): void {
    this.showCreateEventModal = false;
    this.resetForm();
  }

  openViewEventModal(event: CalendarEvent): void {
    this.selectedEvent = event;
    this.showViewEventModal = true;
  }

  closeViewEventModal(): void {
    this.showViewEventModal = false;
    this.selectedEvent = null;
  }

  private resetForm(): void {
    this.eventForm = { title: '', date: '', time: '', participants: '', description: '' };
  }

  getDayClasses(day: any): string {
    const baseClasses = 'calendar-day bg-white/5 p-2 flex flex-col items-center justify-start cursor-pointer transition-colors duration-200 h-20 relative border border-transparent';
    const selectedClass = day.isSelected ? 'day-selected border-purple-500 bg-white/10 shadow-inner' : 'hover:bg-white/10';
    const emptyClass = day.isEmpty ? 'opacity-0 pointer-events-none' : '';
    return `${baseClasses} ${selectedClass} ${emptyClass}`;
  }

  getDayNumberClasses(day: any): string {
    const base = 'w-8 h-8 flex items-center justify-center rounded-full text-sm z-10';
    return day.isToday
      ? `${base} bg-indigo-500 font-bold text-white shadow-lg`
      : `${base} font-medium text-gray-300`;
  }

  closeCalendar(){
    this.modalsService.closeCalendar();
  }
}