// src/index.ts
import { readFileSync } from "fs";
import { Ableton } from 'ableton-js';
import type { SongJSON } from './schemas/song.js';
import { SongController } from './controllers/songController.js';
import { AbletonWrapper } from './ableton/abletonWrapper.js';
import { InstrumentManager } from "./controllers/instrumentManager.js";


export async function processRequest(): Promise<void> {
  const ableton = new Ableton({ logger: console });

  try {
    await ableton.start();

    const abletonWrapper = new AbletonWrapper(ableton);

    console.log('Connected to Ableton Live');

    const argument = process.argv[2];
    if (argument?.startsWith('--')) {
      switch (argument) {
        case '--get-instrument-by-track-name':
          const trackName = process.argv[3];
          if (!trackName) {
            console.error("Please provide a track name.");
            process.exit(1);
          }
          await processGetInstrument(abletonWrapper, trackName)
          process.exit(0);
          break;
        default:
          console.error(`Unknown argument: ${argument}`);
          process.exit(1);
      }
    }
    if (!argument) {
      console.error("usage: ts-node src/index.ts <song.json>");
      process.exit(1);
    }
    await processAbletonInitialization(abletonWrapper, argument);

  } catch (error) {
    console.error('Error processing song:', error);
    throw error;
  } finally {
    await ableton.close();
  }
}

export async function processAbletonInitialization(abletonWrapper: AbletonWrapper, filePath: string): Promise<void> {
  const songController = new SongController(abletonWrapper);

  const songData = JSON.parse(readFileSync(filePath, 'utf-8')) as SongJSON;
  await songController.processSong(songData);

  console.log('Song processing completed successfully');
}

export async function processGetInstrument(abletonWrapper: AbletonWrapper, trackName: string): Promise<void> {
  const instrumentManager = new InstrumentManager(abletonWrapper);
  const instruments = await instrumentManager.getInstrumentsByTrackName(trackName);
  console.log(`Instrument on track "${trackName}": ${JSON.stringify(instruments)}`);

}

async function main() {
  await processRequest();
}
main().catch(e => { console.error(e); process.exit(1); });

// Export the main function and controllers for external use
export { SongController, AbletonWrapper };
