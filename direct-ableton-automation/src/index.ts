// src/index.ts
import { readFileSync } from "fs";
import { Ableton } from 'ableton-js';
import type { SongJSON } from './schemas/song.js';
import { SongController } from './controllers/songController.js';
import { AbletonWrapper } from './ableton/abletonWrapper.js';


export async function processAbletonSong(songData: SongJSON): Promise<void> {
  const ableton = new Ableton({ logger: console });
  const abletonWrapper = new AbletonWrapper(ableton);
  const songController = new SongController(abletonWrapper);
  
  try {
    await ableton.start();
    console.log('Connected to Ableton Live');
    
    await songController.processSong(songData);
    
    console.log('Song processing completed successfully');
  } catch (error) {
    console.error('Error processing song:', error);
    throw error;
  } finally {
    await ableton.close();
  }
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: ts-node src/index.ts <song.json>");
    process.exit(1);
  }
  const raw = readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  // const res = await applySong(json);
  // console.log(JSON.stringify(res, null, 2));
  await processAbletonSong(json);
}
main().catch(e => { console.error(e); process.exit(1); });

// Export the main function and controllers for external use
export { SongController, AbletonWrapper };
