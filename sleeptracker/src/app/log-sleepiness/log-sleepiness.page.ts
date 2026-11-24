import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonFooter,
  IonList, IonListHeader, IonItem, IonLabel, IonNote, IonText, IonChip, IonTextarea, IonBadge,
  IonDatetime, IonDatetimeButton, IonModal, NavController, ToastController,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

/*  date helpers (local time) ---- */
const pad = (n: number) => n.toString().padStart(2, '0');
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const whenKey = (d: Date) => `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

function parseWhen(v: any): Date | null {
  const m = /(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})/.exec(String(v ?? ''));
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null;
}

@Component({
  selector: 'app-log-sleepiness',
  templateUrl: './log-sleepiness.page.html',
  styleUrls: ['./log-sleepiness.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonFooter,
    IonList, IonListHeader, IonItem, IonLabel, IonNote, IonText, IonChip, IonTextarea, IonBadge,
    IonDatetime, IonDatetimeButton, IonModal,
  ],
})
export class LogSleepinessPage {
  private route = inject(ActivatedRoute);
  private nav = inject(NavController);
  private toastCtrl = inject(ToastController);
  private sleepService = inject(SleepService);

  readonly ratings = [1, 2, 3, 4, 5, 6, 7];

  editing: StanfordSleepinessData | null = null; // set when opened via /log-sleepiness/:id

  // form state
  when = whenKey(new Date()); // 'YYYY-MM-DDTHH:mm', defaults to right now
  maxWhen = whenKey(new Date());
  rating: number | null = null;
  notes = '';

  // view-only list of logs for the selected day
  dayEntries: StanfordSleepinessData[] = [];

  constructor() {
    addIcons({ arrowBack });
  }

  /* Form always starts fresh */
  async ionViewWillEnter() {
    await this.sleepService.ready;
    const now = new Date();
    this.maxWhen = whenKey(now);
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const found = SleepService.AllSleepinessData.find(d => d.id === id);
      if (!found) {
        await this.nav.navigateRoot('/history');
        return;
      }
      this.editing = found;
      this.when = whenKey(found.loggedAt);
      this.rating = found.loggedValue;
      this.notes = found.notes;
    } else {
      this.editing = null;
      this.when = whenKey(now);
      this.rating = null;
      this.notes = '';
    }
    this.refreshDayEntries();
  }

  onWhenChange(ev: CustomEvent) {
    const d = parseWhen(ev.detail.value);
    if (d) this.when = whenKey(d);
  }
  onNotes(ev: CustomEvent) {
    this.notes = ev.detail.value ?? '';
  }
  selectRating(n: number) {
    this.rating = n;
  }

  private refreshDayEntries() {
    const today = dateKey(new Date());
    this.dayEntries = SleepService.AllSleepinessData
      .filter(x => dateKey(x.loggedAt) === today)
      .sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime()); // earliest first
  }

  get ratingText(): string {
    if (this.rating === null) return '1 = wide awake, 7 = about to fall asleep';
    return `${this.rating}: ${this.scaleText(this.rating)}`;
  }

  scaleText(n: number): string {
    return StanfordSleepinessData.ScaleValues[n] ?? '';
  }

  formatTime(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  /* returns error message if the form shouldn't be saved. */
  get errorMessage(): string | null {
    const d = parseWhen(this.when);
    if (!d) return 'Please choose a date and time.';
    if (d.getTime() > Date.now()) return "That time hasn't happened yet.";
    return null;
  }

  get canSave(): boolean {
    return this.rating !== null && !this.errorMessage;
  }

  async save() {
    const d = parseWhen(this.when);
    if (!d || this.rating === null || !this.canSave) return;
    const notes = this.notes.trim();

    if (this.editing) {
      this.editing.loggedValue = this.rating;
      this.editing.loggedAt = d;
      this.editing.notes = notes;
      await this.sleepService.updateData(this.editing);
    } else {
      await this.sleepService.logSleepinessData(new StanfordSleepinessData(this.rating, d, notes));
    }

    const toast = await this.toastCtrl.create({
      message: this.editing ? 'Changes saved' : 'Sleepiness logged',
      duration: 1800,
      color: 'success',
    });
    toast.present();
    await this.nav.navigateRoot(this.editing ? '/history' : '/home');
  }

  /* Discards the log (doesn't save it), returns to homepage */
  async discard() {
    await this.nav.navigateRoot(this.editing ? '/history' : '/home');
  }
}