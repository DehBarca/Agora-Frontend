import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content glass-card" (click)="$event.stopPropagation()">
        <h3>Nuevo Evento</h3>
        
        <div class="form-group">
          <label>Título</label>
          <input type="text" [(ngModel)]="title" placeholder="Cena de equipo, Reunión..." autofocus>
        </div>

        <div class="form-group">
          <label>Fecha y Hora</label>
          <input type="datetime-local" [(ngModel)]="date">
        </div>

        <div class="actions">
          <button mat-button (click)="close()">Cancelar</button>
          <button mat-raised-button color="primary" [disabled]="!title || !date" (click)="submit()">Crear</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); z-index: 2000;
      display: flex; justify-content: center; align-items: center;
    }
    .modal-content {
      width: 90%; max-width: 400px; padding: 1.5rem;
      display: flex; flex-direction: column; gap: 1rem;
      background: #1f2937; color: white;
    }
    h3 { margin: 0; color: #a78bfa; }
    .form-group {
      display: flex; flex-direction: column; gap: 0.5rem;
      label { font-size: 0.9rem; color: #9ca3af; }
      input {
        padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);
        background: rgba(0,0,0,0.2); color: white;
        &:focus { outline: none; border-color: #a78bfa; }
      }
    }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
  `]
})
export class CreateEventModalComponent {
  @Output() onCreate = new EventEmitter<{title: string, date: string}>();
  @Output() onClose = new EventEmitter<void>();

  title = '';
  date = '';

  close() { this.onClose.emit(); }
  
  submit() {
    if(this.title && this.date) {
      this.onCreate.emit({ title: this.title, date: this.date });
      this.close();
    }
  }
}