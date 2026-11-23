import { SleepData } from './sleep-data';

export class OvernightSleepData extends SleepData {
	sleepStart:Date;
	sleepEnd:Date;
	quality?:number; // optional field, scale of 1-5 

	constructor(sleepStart:Date, sleepEnd:Date, quality?:number, notes:string = '') {
		super();
		this.sleepStart = sleepStart;
		this.sleepEnd = sleepEnd;
		this.quality = quality; 
		this.notes = notes; 
	}

	get durationMs():number {
		// duration of sleep session in milliseconds 
		return this.sleepEnd.getTime() - this.sleepStart.getTime(); 
	}

	override summaryString():string {
		// returns the sleep duartion in hours 
		const sleep_duration_ms = this.durationMs;
		return Math.floor(sleep_duration_ms / (1000*60*60)) + " hours, " + Math.floor(sleep_duration_ms / (1000*60) % 60) + " minutes.";
	}

	override dateString():string {
		return "Night of " + this.sleepStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
	}
}
