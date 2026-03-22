import Phaser from 'phaser';
import { LEVELS, LEVEL_SCENE_MAP } from '../config/constants';
import type { LevelKey } from '../config/constants';

const SP = 'assets/sprites/';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload() {
    // Characters — loaded at 2× the SVG design size for crisp 960×540 rendering
    this.load.svg('player1',   SP + 'player1.svg',   { width: 32, height: 48 });
    this.load.svg('player2',   SP + 'player2.svg',   { width: 32, height: 48 });
    this.load.svg('monster',   SP + 'monster.svg',   { width: 32, height: 32 });
    this.load.svg('ghost',     SP + 'ghost.svg',     { width: 32, height: 32 });
    this.load.svg('parrot',    SP + 'parrot.svg',    { width: 24, height: 24 });

    // Props
    this.load.svg('bullet',    SP + 'bullet.svg',    { width: 16, height: 8  });
    this.load.svg('handcuffs', SP + 'handcuffs.svg', { width: 40, height: 20 });

    // Tiles (32×32 and 32×16)
    this.load.svg('ground',    SP + 'ground.svg',    { width: 32, height: 32 });
    this.load.svg('platform',  SP + 'platform.svg',  { width: 32, height: 16 });

    // Cars
    this.load.svg('car_police',  SP + 'car_police.svg',  { width: 28, height: 44 });
    this.load.svg('car_traffic', SP + 'car_traffic.svg', { width: 24, height: 40 });

    // Backgrounds at full game resolution
    this.load.svg('bg_city',   SP + 'bg_city.svg',   { width: 960, height: 540 });
    this.load.svg('bg_castle', SP + 'bg_castle.svg', { width: 960, height: 540 });

    // Parrot comedy items (doubled)
    this.load.svg('parrot_hat',    SP + 'parrot_hat.svg',    { width: 64,  height: 40 });
    this.load.svg('parrot_coat',   SP + 'parrot_coat.svg',   { width: 64,  height: 80 });
    this.load.svg('parrot_gloves', SP + 'parrot_gloves.svg', { width: 72,  height: 32 });
    this.load.svg('parrot_boots',  SP + 'parrot_boots.svg',  { width: 72,  height: 40 });
    this.load.svg('parrot_badge',  SP + 'parrot_badge.svg',  { width: 48,  height: 48 });
    this.load.svg('parrot_scarf',  SP + 'parrot_scarf.svg',  { width: 96,  height: 20 });

    // Loading bar (centered in 960×540)
    const cx = 480, cy = 270;
    const bar   = this.add.rectangle(cx, cy, 0, 12, 0x2255cc);
    const frame = this.add.rectangle(cx, cy, 320, 14, 0, 0).setStrokeStyle(2, 0x2255cc);
    this.add.text(cx, cy + 18, 'Loading...', {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaaacc',
    }).setOrigin(0.5, 0);
    this.load.on('progress', (v: number) => bar.setSize(320 * v, 12));
    void frame;
  }

  create() {
    this.createAnimations();

    // ?level=1..6  or  ?level=GhostCastle  → jump straight to that level
    const param = new URLSearchParams(window.location.search).get('level');
    if (param) {
      const idx = parseInt(param);
      const byIndex = !isNaN(idx) && idx >= 1 && idx <= LEVELS.length
        ? LEVEL_SCENE_MAP[LEVELS[idx - 1]] : null;
      const byName  = (param in LEVEL_SCENE_MAP)
        ? LEVEL_SCENE_MAP[param as LevelKey] : null;
      const target  = byIndex ?? byName;
      if (target) { this.scene.start(target); return; }
    }

    this.scene.start('TitleScene');
  }

  private createAnimations() {
    const anim = this.anims;
    const reg = (key: string, texture: string) => {
      if (!anim.exists(key))
        anim.create({ key, frames: [{ key: texture, frame: 0 }], frameRate: 1, repeat: -1 });
    };
    reg('cop_idle_p1',    'player1');
    reg('cop_walk_p1',    'player1');
    reg('cop_idle_p2',    'player2');
    reg('cop_walk_p2',    'player2');
    reg('monster_walk',   'monster');
    reg('monster_stun',   'monster');
    reg('ghost_walk',     'ghost');
    reg('ghost_stun',     'ghost');
    reg('parrot_fly',     'parrot');
    reg('parrot_deliver', 'parrot');
    reg('handcuffs_anim', 'handcuffs');
  }
}
