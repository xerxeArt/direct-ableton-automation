// src/controllers/locatorManager.ts
import type { SectionSpec } from '../types.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';

export class LocatorManager {
  private abletonWrapper: AbletonWrapper;

  constructor(abletonWrapper: AbletonWrapper) {
    this.abletonWrapper = abletonWrapper;
  }

  async createLocators(sections: SectionSpec[]): Promise<void> {
    console.log(`Creating ${sections.length} locators...`);

    for (const section of sections) {
      await this.createLocator(section);
    }
  }

  private async createLocator(sectionData: SectionSpec): Promise<void> {
    try {
      await this.abletonWrapper.createLocator({
        time_bar: sectionData.start_bar,
        name: sectionData.name
      });

      console.log(`Locator "${sectionData.name}" created at ${sectionData.start_bar}`);
    } catch (error) {
      console.error(`Error creating locator "${sectionData.name}":`, error);
      throw error;
    }
  }
}
