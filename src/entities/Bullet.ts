import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  firedBy: 1 | 2 = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(false).setVisible(false);
  }

  fire(x: number, y: number, vx: number, vy: number, playerId: 1 | 2) {
    this.setPosition(x, y);
    this.setActive(true).setVisible(true);
    this.setVelocity(vx, vy);
    this.firedBy = playerId;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    // Deactivate when off-screen
    const cam = this.scene.cameras.main;
    if (
      this.x < cam.worldView.left - 16 ||
      this.x > cam.worldView.right + 16 ||
      this.y < cam.worldView.top - 16 ||
      this.y > cam.worldView.bottom + 16
    ) {
      this.setActive(false).setVisible(false);
    }
  }
}
