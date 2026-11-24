import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonFooter,
  IonList, IonListHeader, IonItem, IonLabel, IonNote, IonText, IonChip, IonTextarea,
  IonDatetime, IonDatetimeButton, IonModal, NavController, ToastController,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';


const pad = (n: number) => n.toString().padStart(2, '0');
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeKey = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function parseDateKey(v: any): Date | null {
  const m = /(\d{4})-(\d{2})-(\d{2})/.exec(String(v ?? ''));
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
function parseTimeKey(v: any): { h: number; m: number } | null {
  const m = /(\d{1,2}):(\d{2})/.exec(String(v ?? ''));
  return m ? { h: +m[1], m: +m[2] } : null;
}

@Component({
  selector: 'app-log-overnight',
  templateUrl: './log-overnight.page.html',
  styleUrls: ['./log-overnight.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonFooter,
    IonList, IonListHeader, IonItem, IonLabel, IonNote, IonText, IonChip, IonTextarea,
    IonDatetime, IonDatetimeButton, IonModal,
  ],
})
export class LogOvernightPage {
  private route = inject(ActivatedRoute);
  private nav = inject(NavController);
  private toastCtrl = inject(ToastController);
  private sleepService = inject(SleepService);

  readonly qualityOptions = [1, 2, 3, 4, 5];

  editing: OvernightSleepData | null = null; // set when opened via /log-overnight/:id
  maxDate = dateKey(new Date());

  // form 
  date = '';
  startTime = '23:00'; // 11:00 PM
  endTime = '07:00';   // 7:00 AM
  quality: number | null = null;
  notes = '';

  constructor() {
    addIcons({ arrowBack });
  }

  /* Runs every time the page is shown, so the form always starts fresh */
  async ionViewWillEnter() {
    await this.sleepService.ready;
    this.maxDate = dateKey(new Date());
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const found = SleepService.AllOvernightData.find(d => d.id === id);
      if (!found) {
        await this.nav.navigateRoot('/history');
        return;
      }
      this.editing = found;
      this.date = dateKey(found.sleepStart);
      this.startTime = timeKey(found.sleepStart);
      this.endTime = timeKey(found.sleepEnd);
      this.quality = found.quality ?? null;
      this.notes = found.notes;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      this.editing = null;
      this.date = dateKey(yesterday);
      this.startTime = '23:00';
      this.endTime = '07:00';
      this.quality = null;
      this.notes = '';
    }
  }

  onDateChange(ev: CustomEvent) {
    const d = parseDateKey(ev.detail.value);
    if (d) this.date = dateKey(d);
  }
  onStartChange(ev: CustomEvent) {
    const t = parseTimeKey(ev.detail.value);
    if (t) this.startTime = `${pad(t.h)}:${pad(t.m)}`;
  }
  onEndChange(ev: CustomEvent) {
    const t = parseTimeKey(ev.detail.value);
    if (t) this.endTime = `${pad(t.h)}:${pad(t.m)}`;
  }
  onNotes(ev: CustomEvent) {
    this.notes = ev.detail.value ?? '';
  }
  selectQuality(n: number) {
    this.quality = this.quality === n ? null : n; // tap again to clear (it's optional)
  }

  /* Bedtime = chosen date + start time. Wake = same date + end time, or the next day if that's not after bedtime. */
  get preview(): { start: Date; end: Date; durationMs: number } | null {
    const d = parseDateKey(this.date);
    const s = parseTimeKey(this.startTime);
    const e = parseTimeKey(this.endTime);
    if (!d || !s || !e) return null;
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), s.h, s.m);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), e.h, e.m);
    if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
    return { start, end, durationMs: end.getTime() - start.getTime() };
  }

  /* Error prevention: returns a message if the form shouldn't be saved. */
  get errorMessage(): string | null {
    const p = this.preview;
    if (!p) return 'Please choose a date and both times.';
    if (this.startTime === this.endTime) return "Bedtime and wake time can't be the same.";
    if (p.start.getTime() > Date.now()) return "That bedtime hasn't happened yet.";
    if (p.durationMs > 16 * 3600 * 1000) {
      return `That's ${this.durationText(p.durationMs)} of sleep. Please double-check AM/PM.`;
    }
    const duplicate = SleepService.AllOvernightData.some(
      d => d.id !== this.editing?.id && dateKey(d.sleepStart) === this.date
    );
    if (duplicate) return 'You already logged sleep for this date. Pick another date, or edit it from My Logs.';
    return null;
  }

  get canSave(): boolean {
    return !!this.preview && !this.errorMessage;
  }

  durationText(ms: number): string {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    return `${h} hr${h === 1 ? '' : 's'} ${m} min`;
  }

  /* 2 actions: save log or discard it */
  async save() {
    const p = this.preview;
    if (!p || !this.canSave) return;
    const notes = this.notes.trim();

    if (this.editing) {
      this.editing.sleepStart = p.start;
      this.editing.sleepEnd = p.end;
      this.editing.quality = this.quality ?? undefined;
      this.editing.notes = notes;
      await this.sleepService.updateData(this.editing);
    } else {
      await this.sleepService.logOvernightData(
        new OvernightSleepData(p.start, p.end, this.quality ?? undefined, notes)
      );
    }

    const toast = await this.toastCtrl.create({
      message: this.editing ? 'Changes saved' : 'Sleep logged',
      duration: 1800,
      color: 'success',
    });
    toast.present();
    await this.nav.navigateRoot(this.editing ? '/history' : '/home');
  }

  /* Throws away the form (doesn't save log), goes back to homepage. */
  async discard() {
    await this.nav.navigateRoot(this.editing ? '/history' : '/home');
  }
}