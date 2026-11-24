import { Component, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonSegment, IonSegmentButton,
  IonContent, IonLabel, IonItem, IonNote, IonBadge, IonAccordionGroup, IonAccordion,
  IonButton, IonIcon, NavController, AlertController, ToastController,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonSegment, IonSegmentButton,
    IonContent, IonLabel, IonItem, IonNote, IonBadge, IonAccordionGroup, IonAccordion,
    IonButton, IonIcon,
  ],
})
export class HistoryPage {
  private nav = inject(NavController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private sleepService = inject(SleepService);

  view: 'overnight' | 'sleepiness' = 'overnight';

  constructor() {
    addIcons({ createOutline, trashOutline });
  }

  /* The service keeps these sorted newest-first. */
  get overnightLogs(): OvernightSleepData[] {
    return SleepService.AllOvernightData;
  }
  get sleepinessLogs(): StanfordSleepinessData[] {
    return SleepService.AllSleepinessData;
  }

  onViewChange(ev: CustomEvent) {
    this.view = ev.detail.value === 'sleepiness' ? 'sleepiness' : 'overnight';
  }

  /* ---- formatting helpers ---- */
  shortDate(d: Date): string {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  dateTime(d: Date): string {
    return d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }
  timeOnly(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  durationShort(ms: number): string {
    return `${Math.floor(ms / 3600000)}h ${Math.floor(ms / 60000) % 60}m`;
  }
  durationLong(ms: number): string {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    return `${h} hour${h === 1 ? '' : 's'}, ${m} minute${m === 1 ? '' : 's'}`;
  }
  scaleText(n: number): string {
    return StanfordSleepinessData.ScaleValues[n] ?? '';
  }

  /* ---- actions ---- */
  editOvernight(log: OvernightSleepData) {
    this.nav.navigateForward(['/log-overnight', log.id]);
  }
  editSleepiness(log: StanfordSleepinessData) {
    this.nav.navigateForward(['/log-sleepiness', log.id]);
  }
  addNew(path: string) {
    this.nav.navigateForward(path);
  }

  async confirmDelete(id: string, description: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete this log?',
      message: `${description} will be permanently removed.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.sleepService.deleteData(id);
            const toast = await this.toastCtrl.create({ message: 'Log deleted', duration: 1500 });
            toast.present();
          },
        },
      ],
    });
    await alert.present();
  }
}