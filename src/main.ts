import Phaser from 'phaser';
import { gameConfig } from './config/GameConfig';
import { initI18n } from './i18n/i18n';

async function main() {
  await initI18n();
  new Phaser.Game(gameConfig);
}

main();
