import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

const OVERNIGHT_KEY = 'overnight';
const SLEEPINESS_KEY = 'sleepiness';

@Injectable({
	providedIn: 'root'
})
export class SleepService {
	public static AllSleepData:SleepData[] = [];
	public static AllOvernightData:OvernightSleepData[] = [];
	public static AllSleepinessData:StanfordSleepinessData[] = [];

	/* Pages should `await sleepService.ready` before reading the data arrays. */
	public ready:Promise<void>;

	constructor(private storage:Storage) {
		this.ready = this.init();
	}

	private async init() {
		await this.storage.create();
		const overnight:any[] = (await this.storage.get(OVERNIGHT_KEY)) ?? [];
		const sleepiness:any[] = (await this.storage.get(SLEEPINESS_KEY)) ?? [];
		SleepService.AllOvernightData = overnight.map(r => this.toOvernight(r));
		SleepService.AllSleepinessData = sleepiness.map(r => this.toSleepiness(r));
		this.refresh();
	}


	public async logOvernightData(sleepData:OvernightSleepData) {
		SleepService.AllOvernightData.push(sleepData);
		this.refresh();
		await this.save();
	}

	public async logSleepinessData(sleepData:StanfordSleepinessData) {
		SleepService.AllSleepinessData.push(sleepData);
		this.refresh();
		await this.save();
	}

	/* Replaces the stored log that has the same id as `updated` 
		(used for when user edits a log). */
	public async updateData(updated:SleepData) {
		if (updated instanceof OvernightSleepData) {
			this.replaceById(SleepService.AllOvernightData, updated);
		} else if (updated instanceof StanfordSleepinessData) {
			this.replaceById(SleepService.AllSleepinessData, updated);
		}
		this.refresh();
		await this.save();
	}

	public async deleteData(id:string) {
		SleepService.AllOvernightData = SleepService.AllOvernightData.filter(d => d.id !== id);
		SleepService.AllSleepinessData = SleepService.AllSleepinessData.filter(d => d.id !== id);
		this.refresh();
		await this.save();
	}

	private replaceById<T extends SleepData>(list:T[], item:T) {
		const i = list.findIndex(d => d.id === item.id);
		if (i >= 0) list[i] = item;
	}

	/* Keep lists sorted newest-first, rebuild the combined list. */
	private refresh() {
		SleepService.AllOvernightData.sort((a, b) => b.sleepStart.getTime() - a.sleepStart.getTime());
		SleepService.AllSleepinessData.sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
		const when = (d:SleepData) => d instanceof OvernightSleepData ? d.sleepStart.getTime() : d.loggedAt.getTime();
		SleepService.AllSleepData = [...SleepService.AllOvernightData, ...SleepService.AllSleepinessData]
			.sort((a, b) => when(b) - when(a));
	}

	/* save plain records and rebuild the classes on load. */
	private async save() {
		await this.storage.set(OVERNIGHT_KEY, SleepService.AllOvernightData.map(d => ({
			id: d.id,
			loggedAt: d.loggedAt.toISOString(),
			sleepStart: d.sleepStart.toISOString(),
			sleepEnd: d.sleepEnd.toISOString(),
			quality: d.quality ?? null,
			notes: d.notes
		})));
		await this.storage.set(SLEEPINESS_KEY, SleepService.AllSleepinessData.map(d => ({
			id: d.id,
			loggedAt: d.loggedAt.toISOString(),
			loggedValue: d.loggedValue,
			notes: d.notes
		})));
	}

	private toOvernight(r:any):OvernightSleepData {
		const d = new OvernightSleepData(new Date(r.sleepStart), new Date(r.sleepEnd), r.quality ?? undefined, r.notes ?? '');
		d.id = r.id;
		d.loggedAt = new Date(r.loggedAt);
		return d;
	}

	private toSleepiness(r:any):StanfordSleepinessData {
		const d = new StanfordSleepinessData(r.loggedValue, new Date(r.loggedAt), r.notes ?? '');
		d.id = r.id;
		return d;
	}
}