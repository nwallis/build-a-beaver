const DIALOG_DISPLAY_Y_PX = 79;
const DIALOG_TWEEN_TIME = 500;
const DIALOG_EASE_FUNCTION = Phaser.Easing.Quadratic.Out;
const DIALOG_TEXT_MAX_WIDTH_PX = 370;
const BUTTON_MARGIN = 20;

Dialog = function(game, engine, container, showCancel, cancelCallback, cancelContext, showOk, okCallback, okContext) {

    Phaser.Group.call(this, game, container);

    this.visible = false;
    this.engine = engine;

    this.dialogBackground = this.game.add.sprite(0,0,'dialog_background');
    this.add(this.dialogBackground);
    this.buttonsContainer = this.game.add.group();
    this.cancelCallback = cancelCallback;
    this.okCallback = okCallback;
    this.cancelContext = cancelContext;
    this.okContext = okContext;

    if (showOk) {
        this.okButton = this.game.add.button(0, 0, 'button_ok', this.okClicked, this, 1, 0, 1);
        this.buttonsContainer.addChild(this.okButton);
    }

    if (showCancel) {
        this.cancelButton = this.game.add.button(200, 0, 'button_cancel', this.cancelClicked, this, 1, 0, 1);
        this.cancelButton.input.useHandCursor = true;
        this.buttonsContainer.addChild(this.cancelButton);
    }

    var position = 0;
    this.buttonsContainer.children.forEach(function(child){
        child.x = position;
        position += child.width + BUTTON_MARGIN; 
    });
    this.buttonsContainer.x = (440 - this.buttonsContainer.width) / 2;
    this.buttonsContainer.y = 220;

    this.warningText = this.game.add.bitmapText(40, 40, 'arimo', '', 18);
    this.warningText.maxWidth = DIALOG_TEXT_MAX_WIDTH_PX;
    this.reasonsText = this.game.add.bitmapText(40, 60, 'arimo', '', 14);
    this.reasonsText.maxWidth = DIALOG_TEXT_MAX_WIDTH_PX;
    this.add(this.warningText);
    this.add(this.reasonsText);
    this.add(this.buttonsContainer);
    this.x = (APP_WIDTH_PX - this.width) / 2;
}

Dialog.prototype = Object.create(Phaser.Group.prototype);
Dialog.prototype.constructor = Dialog;

Dialog.prototype.show = function(reasons, warnings, okCallback, uiElements) {
    if (okCallback) this.okCallback = okCallback;
    this.visible = true;
    this.warningText.text = warnings[0];
    this.reasonsText.text = reasons.join('\n');
    this.reasonsText.y = this.warningText.y + this.warningText.height + 20;
    this.y = DESIGN_CONTAINER_Y_PX + DESIGN_CONTAINER_HEIGHT_PX;
    if (uiElements) {
        this.add(uiElements);
        uiElements.y = this.reasonsText.y + this.reasonsText.height + 40;
        uiElements.x = (450 - uiElements.width) / 2;
    }
    this.game.add.tween(this).to({y:DIALOG_DISPLAY_Y_PX}, DIALOG_TWEEN_TIME, DIALOG_EASE_FUNCTION, true);
}

Dialog.prototype.hide = function() {
    this.engine.hideDialog();
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
