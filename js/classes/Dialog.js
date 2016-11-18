const DIALOG_DISPLAY_Y_PX = 79;
const DIALOG_TWEEN_TIME = 500;
const DIALOG_EASE_FUNCTION = Phaser.Easing.Quadratic.Out;

Dialog = function(game, engine, container, showCancel, cancelCallback, cancelContext, showOk, okCallback, okContext) {

    Phaser.Group.call(this, game, container);

    this.engine = engine;

    this.add(this.game.add.sprite(0, 0, 'dialog_background'));
    this.buttonsContainer = this.game.add.sprite(60, 210);
    this.cancelCallback = cancelCallback;
    this.okCallback = okCallback;
    this.cancelContext = cancelContext;
    this.okContext = okContext;

    if (showOk) {
        this.okButton = this.game.add.button(0, 0, 'button_ok', this.okClicked, this, 0, 0, 0);
        this.buttonsContainer.addChild(this.okButton);
    }

    if (showCancel) {
        this.cancelButton = this.game.add.button(200, 0, 'button_cancel', this.cancelClicked, this, 0, 0, 0);
        this.buttonsContainer.addChild(this.cancelButton);
    }

    this.warningText = this.game.add.bitmapText(40, 40, 'arimo', '', 18);
    this.add(this.warningText);
    this.add(this.buttonsContainer);
    this.x = (APP_WIDTH_PX - this.width) / 2;
}

Dialog.prototype = Object.create(Phaser.Group.prototype);
Dialog.prototype.constructor = Dialog;

Dialog.prototype.show = function(reasons, warnings) {
    this.visible = true;
    this.warningText.text = warnings[0];
    this.y = DESIGN_CONTAINER_Y_PX + DESIGN_CONTAINER_HEIGHT_PX;
    this.game.add.tween(this).to({y:DIALOG_DISPLAY_Y_PX}, DIALOG_TWEEN_TIME, DIALOG_EASE_FUNCTION, true);
}

Dialog.prototype.hide = function() {
    this.game.add.tween(this).to({y:DESIGN_CONTAINER_Y_PX + DESIGN_CONTAINER_HEIGHT_PX}, DIALOG_TWEEN_TIME, DIALOG_EASE_FUNCTION, true);
}

Dialog.prototype.cancelClicked = function() {
    this.hide();
    if (this.cancelCallback) this.cancelCallback.call(this.cancelContext);
}

Dialog.prototype.okClicked = function() {
    this.hide();
    if (this.okCallback) this.okCallback.call(this.okContext);
}
