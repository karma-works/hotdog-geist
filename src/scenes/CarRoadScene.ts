import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { gameState } from '../systems/GameState';

const OVERLAY_DEPTH = 200;

interface Car {
  box:      Phaser.GameObjects.Rectangle;
  img:      Phaser.GameObjects.Image;
  speed:    number;
  ticketed: boolean;
}

const SPEED_LIMIT  = 120;
const TICKET_RANGE = 80;

export class CarRoadScene extends Phaser.Scene {
  private cars: Car[] = [];
  private policeBox!: Phaser.GameObjects.Rectangle;
  private policeImg!: Phaser.GameObjects.Image;
  private policeX = GAME_WIDTH / 2;
  private ticketsIssued = 0;
  private escaped = 0;
  private readonly CARS_TO_SPAWN = 10;
  private spawned = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private bgScroll!: Phaser.GameObjects.TileSprite;
  private statusText!: Phaser.GameObjects.Text;

  // 4 lanes spread across 960px
  private readonly LANES = [120, 360, 600, 840];

  constructor() { super('CarRoadScene'); }

  create() {
    this.bgScroll = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg_road');
    // Lane dividers are baked into bg_road — no separate rectangles needed

    // Police car: invisible box (position anchor) + SVG image on top
    this.policeBox = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, 28, 44, 0x3388ff, 0);
    this.policeImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'car_police');

    this.statusText = this.add.text(16, 16, '', {
      fontFamily: 'monospace', fontSize: '18px',
      color: '#fff', stroke: '#000', strokeThickness: 3,
    });

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    this.time.addEvent({
      delay: 1200, repeat: this.CARS_TO_SPAWN - 1,
      callback: this.spawnCar, callbackScope: this,
    });
  }

  private spawnCar() {
    if (this.spawned >= this.CARS_TO_SPAWN) return;
    this.spawned++;
    const lane  = Phaser.Utils.Array.GetRandom(this.LANES) as number;
    const speed = Phaser.Math.Between(80, 240);
    const color = speed > SPEED_LIMIT ? 0xff4444 : 0x44cc44;
    const box = this.add.rectangle(lane, -40, 24, 40, color);
    const img = this.add.image(lane, -40, 'car_traffic');
    this.cars.push({ box, img, speed, ticketed: false });
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000;
    this.bgScroll.tilePositionY -= 2;

    const moveLeft  = this.cursors.left!.isDown  || this.wasd.left.isDown;
    const moveRight = this.cursors.right!.isDown || this.wasd.right.isDown;
    if (moveLeft)  this.policeX = Math.max(16, this.policeX - 240 * dt);
    if (moveRight) this.policeX = Math.min(GAME_WIDTH - 16, this.policeX + 240 * dt);
    this.policeBox.x = this.policeX;
    this.policeImg.x = this.policeX;

    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      car.box.y += car.speed * dt;
      car.img.y  = car.box.y;

      if (
        !car.ticketed && car.speed > SPEED_LIMIT &&
        Math.abs(car.box.x - this.policeX) < TICKET_RANGE &&
        Math.abs(car.box.y - this.policeBox.y) < TICKET_RANGE
      ) {
        car.ticketed = true;
        car.box.setFillStyle(0xffdd44);
        this.ticketsIssued++;
        this.showTicket(car.box.x, car.box.y);
      }

      if (car.box.y > GAME_HEIGHT + 60) {
        if (!car.ticketed && car.speed > SPEED_LIMIT) this.escaped++;
        car.box.destroy();
        car.img.destroy();
        this.cars.splice(i, 1);
      }
    }

    this.statusText.setText(`❤ ${gameState.lives}   📋 ${this.ticketsIssued}`);

    if (this.spawned >= this.CARS_TO_SPAWN && this.cars.length === 0) this.endLevel();
  }

  private showTicket(x: number, y: number) {
    const txt = this.add.text(x, y, '📋 TICKET!', {
      fontFamily: 'monospace', fontSize: '14px',
      color: '#ffdd44', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.tweens.add({ targets: txt, y: y - 40, alpha: 0, duration: 1200, onComplete: () => txt.destroy() });
  }

  private endLevel() {
    const total = Math.max(1, this.ticketsIssued + this.escaped);
    const ratio = this.ticketsIssued / total;
    const stars: 1 | 2 | 3 = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    gameState.completeLevel('CarRoad', stars);
    this.showCompleteOverlay(stars);
  }

  private showCompleteOverlay(stars: 1 | 2 | 3) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65).setDepth(OVERLAY_DEPTH);
    this.add.text(cx, cy - 50, starStr, { fontSize: '42px' })
      .setOrigin(0.5).setDepth(OVERLAY_DEPTH + 1);
    this.add.text(cx, cy + 10, 'Level Complete!', {
      fontFamily: 'monospace', fontSize: '30px',
      color: '#ffdd44', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(OVERLAY_DEPTH + 1);

    this.time.delayedCall(2500, () => this.scene.start('OverworldScene'));
  }
}
