import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CalendarEvent {
  id: number | string;
  date: Date;
  title: string;
  color: string;
  description: string;
  participants: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  // Datos iniciales de prueba para verificar que el sistema funciona
  private initialEvents: CalendarEvent[] = [
    {
      id: 1,
      date: new Date(), // Evento hoy para prueba inmediata
      title: 'Prueba de Sistema',
      color: 'teal',
      description: 'Verificación de calendario.',
      participants: ['System'],
    }
  ];

  private eventsSubject = new BehaviorSubject<CalendarEvent[]>(this.initialEvents);
  events$ = this.eventsSubject.asObservable();

  constructor() { }

  getEvents(): Observable<CalendarEvent[]> {
    return this.events$;
  }

  addEvent(event: CalendarEvent) {
    const currentEvents = this.eventsSubject.value;
    // Creamos un nuevo array para asegurar la inmutabilidad y disparar la detección de cambios
    this.eventsSubject.next([...currentEvents, event]);
    console.log('Evento agregado al servicio:', event);
  }

  createEventFromChat(title: string, dateStr: string, creator: string) {
    // Aseguramos que la fecha sea un objeto Date válido
    const eventDate = new Date(dateStr);
    
    const newEvent: CalendarEvent = {
        id: Date.now(),
        title: title,
        date: eventDate,
        color: 'purple',
        description: `Evento creado en el chat por ${creator}`,
        participants: [creator]
    };
    this.addEvent(newEvent);
  }
}