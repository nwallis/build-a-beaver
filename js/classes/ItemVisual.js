ItemVisual = function(game, engine, model, startPos, container) {

    Phaser.Sprite.call(this, game, engine.mmToPixels(startPos), 0);

    this.itemVisual = this.game.make.sprite(0, 0, model.image);
    this.itemVisual.width = engine.mmToPixels(model.getInnerSize().width);
    this.itemVisual.height = engine.mmToPixels(model.realHeight);
    this.itemVisual.x = engine.mmToPixels(model.marginLeft);
    this.itemVisual.y = DESIGN_AREA_HEIGHT_PX - this.itemVisual.height;

    this.addChild(this.itemVisual);

    this.engine = engine;
    this.container = container;
    this.model = model;
    this.events.onDragStart.add(this.startItemDrag, this);
    this.events.onDragUpdate.add(this.itemDragUpdate, this);
    this.events.onDragStop.add(this.stopItemDrag, this);
    this.events.onInputOver.add(this.itemOver, this, -100);
    this.events.onInputOut.add(this.itemOut, this, -100);

    //debug text
    var style = {
        font: "30px Arimo",
        fill: "#ff0044",
        wordWrap: true,
        wordWrapWidth: this.itemVisual.width,
        align: "center",
        backgroundColor: "#ffff00"
    };

    this.debugText = this.game.make.text(20, (this.model.itemType == "wall-bay") ? 20 : 200, 'testing', style);
    //this.addChild(this.debugText);

    this.enable();
}

ItemVisual.prototype = Object.create(Phaser.Sprite.prototype);
ItemVisual.prototype.constructor = ItemVisual;

ItemVisual.prototype.update = function() {
    var snapLeftName = (this.model.itemSnappedToLeft) ? this.model.itemSnappedToLeft.image : 'none';
    var snapRightName = (this.model.itemSnappedToRight) ? this.model.itemSnappedToRight.image : 'none';
    var snapChildName = (this.model.snappedChild) ? this.model.snappedChild.image : 'none';
    var snapParentName = (this.model.snappedParent) ? this.model.snappedParent[0].image : 'none';
    this.debugText.text =
        //"width: " + this.model.getSize().width +
        //"\nrealX: " + this.model.getBounds().left +
        //"\ninner left: " + this.model.getInnerBounds().left +
        "snapped child: " + snapChildName +
        "\nsnapped parent: " + snapParentName;
}

ItemVisual.prototype.itemOver = function() {
    this.engine.measureItem(this);
}
ItemVisual.prototype.itemOut = function() {
    this.engine.hideMeasure();
}

ItemVisual.prototype.deleteClicked = function() {
    this.parent.removeChild(this);
    this.engine.deleteItem(this.model);
}

ItemVisual.prototype.itemDragUpdate = function() {
    this.move(this.x);
}

ItemVisual.prototype.move = function(xPosition) {
    this.engine.measureItem(this);
    this.moveResult = this.container.moveItem(this.model, this.engine.pixelsToMM(xPosition));
    if (this.moveResult.valid) {
        this.x = this.engine.mmToPixels(this.moveResult.position);
        this.tintValid();
    } else {
        this.x = xPosition;
        this.tintInvalid();
    }
    return this.moveResult;
}

ItemVisual.prototype.tintInvalid = function() {
    this.itemVisual.tint = 0xFF0000;
}

ItemVisual.prototype.tintValid = function() {
    this.itemVisual.tint = 0xFFFFFF;
}

ItemVisual.prototype.startItemDrag = function() {
    this.itemVisual.bringToTop();
    this.dragStartPosition = this.x;
}

ItemVisual.prototype.stopItemDrag = function() {
    this.x = (this.moveResult.valid) ? this.engine.mmToPixels(this.moveResult.position) : this.dragStartPosition;
    this.tintValid();
}

ItemVisual.prototype.enable = function() {
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    this.input.setDragLock(true, false);
    this.input.enableDrag(false, false);
    this.events.onInputUp.add(this.engine.showIcons, this.engine, this);
}

ItemVisual.prototype.disable = function() {
    this.inputEnabled = false;
}
