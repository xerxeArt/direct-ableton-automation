// src/controllers/locatorManager.ts
import type { Locator } from '../types.js';
import { AbletonWrapper } from '../ableton/abletonWrapper.js';

export class LocatorManager {
  private abletonWrapper: AbletonWrapper;

  constructor(abletonWrapper: AbletonWrapper) {
    this.abletonWrapper = abletonWrapper;
  }

  async createLocators(locators: Locator[]): Promise<void> {
    console.log(`Creating ${locators.length} locators...`);
    
    for (const locator of locators) {
      await this.createLocator(locator);
    }
  }

  private async createLocator(locatorData: Locator): Promise<void> {
    try {
      await this.abletonWrapper.createLocator({
        time_bar: locatorData.bar,
        name: locatorData.name
      });

      console.log(`Locator "${locatorData.name}" created at ${locatorData.bar}`);
    } catch (error) {
      console.error(`Error creating locator "${locatorData.name}":`, error);
      throw error;
    }
  }
}
