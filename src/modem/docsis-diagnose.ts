import type { Diagnose, DiagnosedDocsisChannelStatus, DocsisStatus, HumanizedDocsisChannelStatus, Modulation } from "./modem";


export const enum StatusClassification{
  IMMINENT_REPAIR=-1,
}

export interface Deviation{
  modulation: Modulation;
  check(powerLevel: number):Diagnose;
}

// based on https://www.vodafonekabelforum.de/viewtopic.php?t=32353
export default class DocsisDiagnose{
  constructor(private docsisStatus:DocsisStatus) {
  
  }

  checkDownstream(): DiagnosedDocsisChannelStatus[]{
    return this.docsisStatus.downstream
      .map(channel => {
        return { ...channel, diagnose: downstreamDeviation(channel) }
      })
  }

  detectDeviations(): boolean{
    return true
  }
}

export function diagnoseDownstream(status: HumanizedDocsisChannelStatus): any{
  return 
}

export function downstreamDeviation({ modulation, powerLevel }:{modulation: Modulation, powerLevel: number}): Diagnose {
  const deviation = downstreamDeviationFactory(modulation);
  return deviation.check(powerLevel);
}

export class DownstreamDeviation64QAM implements Deviation{
  modulation = "64QAM" as const
  
  check(powerLevel: number): Diagnose {
    if (-60 <= powerLevel && powerLevel <= -14)
      return SofortigeBeseitigung
    if (-14 < powerLevel && powerLevel <= -12)
      return BeseitigungBinnenMonatsfrist;
    if (-12 < powerLevel && powerLevel <= -10)
      return TolerierteAbweichung;
    if (-10 < powerLevel && powerLevel <= 7)
      return Vorgabekonform;
    if (7 < powerLevel && powerLevel <= 12)
      return TolerierteAbweichung;
    if (12 < powerLevel && powerLevel <= 14)
      return BeseitigungBinnenMonatsfrist;
    if ( 14.1 <= powerLevel)
      return SofortigeBeseitigung
    
    throw new Error(`PowerLevel is not within supported range. PowerLevel: ${powerLevel}`);
  }
}

export class DownstreamDeviation256QAM implements Deviation {
  modulation = "256QAM" as const
  delegate = new DownstreamDeviation64QAM()
    
  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 6 <= -60 ? powerLevel : powerLevel - 6;
    return this.delegate.check(adjustedPowerLevel)
  }
}

export class DownstreamDeviation1024QAM implements Deviation {
  modulation = "1024QAM" as const
  delegate = new DownstreamDeviation64QAM()
    
  check(powerLevel: number): Diagnose {
    const adjustedPowerLevel = powerLevel - 8 <= -60 ? powerLevel : powerLevel - 8;
    return this.delegate.check(adjustedPowerLevel)
  }
}


export const SofortigeBeseitigung: Diagnose = {
  description : "SofortigeBeseitigung",
  deviation: true,
  color:"red",
}
export const Vorgabekonform: Diagnose ={
  description :"Vorgabekonform",
  deviation: false,
  color:"green"
}
export const TolerierteAbweichung: Diagnose = {
  description :"Tolerierte Abweichung",
  deviation: false,
  color:"green"
}
export const BeseitigungBinnenMonatsfrist: Diagnose = {
  description :"Beseitigung binnen Monatsfrist",
  deviation: true,
  color:"yellow"
}

export function downstreamDeviationFactory(modulation: Modulation): Deviation {
  switch (modulation) {
  case "64QAM":
    return new DownstreamDeviation64QAM();
  case "256QAM":
    return new DownstreamDeviation256QAM();
  case "1024QAM":
    return new DownstreamDeviation1024QAM();
  default:
    throw new Error(`Unsupported modulation ${modulation}`)
  }}
