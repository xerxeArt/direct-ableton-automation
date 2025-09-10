// src/controllers/locatorManager.ts
import { ClipWithNotes, LiveTrackKind, type Section, type Track } from '../types.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';
import { TrackManager } from './trackManager.js';
import { timeBarToBeats } from '../tools/timeTools.js';

export class LocatorManager {
  private abletonWrapper: AbletonWrapper;
  private trackManager: TrackManager;

  constructor(abletonWrapper: AbletonWrapper, trackManager: TrackManager) {
    this.abletonWrapper = abletonWrapper;
    this.trackManager = trackManager;
  }

  async createLocators(sections: Section[]): Promise<void> {
    console.log(`Creating ${sections.length} locators...`);

    //Create a dummy track that will contain empty midi clips, for making sure the song length is enough
    const dummyTrack: Track = {
      name: 'Dummy Track',
      role: 'dummy',
      color: 'white',
      type: LiveTrackKind.Midi
    }
    await this.trackManager.createTracks([dummyTrack]);

    const { numerator, denominator } = await this.abletonWrapper.getTimeSignature();


    for (const section of sections) {
      const clip: ClipWithNotes = {
        startTimeBeats: await timeBarToBeats(numerator, denominator, section.start_bar - 1),
        lengthBeats: await timeBarToBeats(numerator, denominator, section.length_bars),
        color: dummyTrack.color,
        name: section.name,
        notes: []
      }
      await this.abletonWrapper.createEmptyMidiClip(dummyTrack.id ?? 0, clip);
      await this.createLocator(section);
    }
    //Create the final locator at the end of the last section
    const lastSection = sections[sections.length - 1];
    if (lastSection) {
      const endBar = lastSection.start_bar + lastSection.length_bars;
      await this.abletonWrapper.createLocator({
        time_bar: endBar - 1, // Ableton locators are 0-based
        name: 'End'
      });
    }
  }

  private async createLocator(sectionData: Section): Promise<void> {
    try {
      await this.abletonWrapper.createLocator({
        time_bar: sectionData.start_bar - 1, // Ableton locators are 0-based
        name: sectionData.name
      });

      console.log(`Locator "${sectionData.name}" created at ${sectionData.start_bar - 1}`);
    } catch (error) {
      console.error(`Error creating locator "${sectionData.name}":`, error);
      throw error;
    }
  }
}
