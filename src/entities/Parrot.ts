import Phaser from 'phaser';
import type { ParrotItem } from '../config/constants';
import { t } from '../i18n/i18n';

export class Parrot extends Phaser.Physics.Arcade.Sprite {
  private target: Phaser.GameObjects.Sprite;
  private floatOffset = 0;

  constructor(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite) {
    super(scene, target.x - 20, target.y - 24, 'parrot');
    this.target = target;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // Disable gravity entirely — parrot position is driven by lerp in update()
    (this.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    this.anims.play('parrot_fly', true);
  }

  update(_: unknown, _delta: number) {
    this.floatOffset = Math.sin(Date.now() / 400) * 3;
    // Hover slightly above and left/right of target
    const targetX = this.target.x + (this.target.flipX ? 40 : -40);
    const targetY = this.target.y - 48 + this.floatOffset;
    this.x = Phaser.Math.Linear(this.x, targetX, 0.08);
    this.y = Phaser.Math.Linear(this.y, targetY, 0.08);
    this.setFlipX(this.x > this.target.x);
  }

  /** Show a comedy delivery: big oversized item drops from parrot + text popup */
  deliverItem(item: ParrotItem, onDone: () => void) {
    // Show the oversized item sprite falling from the parrot
    const itemSprite = this.scene.add.image(this.x, this.y, item)
      .setOrigin(0.5, 0)
      .setScale(2); // extra large to emphasize comedy

    // Text label
    const label = this.scene.add.text(this.x, this.y - 20, t(`parrot_items.${item}`), {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#ffdd44',
      stroke: '#000',
      strokeThickness: 2,
      align: 'center',
    }).setOrigin(0.5, 1);

    this.anims.play('parrot_deliver', true);

    // Item wobbles and fades
    this.scene.tweens.add({
      targets: itemSprite,
      y: itemSprite.y + 30,
      angle: 15,
      alpha: 0,
      duration: 2200,
      ease: 'Bounce.easeOut',
      onComplete: () => itemSprite.destroy(),
    });

    this.scene.tweens.add({
      targets: label,
      y: label.y - 24,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        label.destroy();
        onDone();
      },
    });
  }
}
