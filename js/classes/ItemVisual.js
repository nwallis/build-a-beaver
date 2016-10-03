const ICON_MARGIN = 5;

ItemVisual = function(game, container, item, startPos) {

    Phaser.Sprite.call(this, game, container.mmToPixels(startPos), 0);

    this.itemVisual = this.game.make.sprite(0, 0, item.image);
    this.itemVisual.width = container.mmToPixels(item.getInnerSize().width);
    this.itemVisual.height = container.mmToPixels(item.realHeight);
    this.itemVisual.x = container.mmToPixels(item.marginLeft);
    this.itemVisual.y = game.stage.height - this.itemVisual.height;
    this.addChild(this.itemVisual);

    this.icons = [];
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    this.input.setDragLock(true, false);
    this.input.enableDrag(false, false);
    this.container = container;
    this.item = item;
    this.events.onDragStart.add(this.startItemDrag, this);
    this.events.onDragUpdate.add(this.itemDragUpdate, this);
    this.events.onDragStop.add(this.stopItemDrag, this);

    //debug text
    var style = {
        font: "12px Arial",
        fill: "#ff0044",
        wordWrap: true,
        wordWrapWidth: this.itemVisual.width,
        align: "center",
        backgroundColor: "#ffff00"
    };

    this.debugText = this.game.make.text(0, 20, 'testing', style);
    this.addChild(this.debugText);

    //    this.events.onInputOver.add(this.itemOver,this);
    //   this.events.onInputOut.add(this.itemOut,this);

    this.deleteIcon = this.game.make.sprite(0, 0, 'delete_icon');
    //this.addIcon(this.deleteIcon, this.deleteClicked);
}

ItemVisual.prototype = Object.create(Phaser.Sprite.prototype);
ItemVisual.prototype.constructor = ItemVisual;

ItemVisual.prototype.itemOver = function() {
    this.icons.forEach(function(icon) {
        icon.visible = true;
    });
}
ItemVisual.prototype.itemOut = function() {
    this.icons.forEach(function(icon) {
        icon.visible = false;
    });
}

ItemVisual.prototype.deleteClicked = function() {
    this.parent.removeChild(this);
    this.container.deleteItem(this.item);
}

ItemVisual.prototype.addIcon = function(icon, clickHandler) {

    //icon.visible = false;
    icon.inputEnabled = true;
    icon.input.useHandCursor = true;
    //icon.events.onInputUp.add(clickHandler, this);

    this.icons.push(icon);
    this.layoutIcons();
    this.addChild(icon);
}

ItemVisual.prototype.layoutIcons = function() {
    for (var iconCount = 0; iconCount < this.icons.length; iconCount++) {
        var icon = this.icons[iconCount];
        icon.y = ICON_MARGIN;
        icon.x = this.width - ICON_MARGIN - (iconCount * (ICON_MARGIN + icon.width));
    }
}

ItemVisual.prototype.update = function() {
    this.debugText.text = "width: " + this.item.getSize().width + "\nrealX: " + this.item.getBounds().left + "\ninner left: " + this.item.getInnerBounds().left;
    //this.itemVisual.x = this.container.mmToPixels(this.item.marginLeft);
}

ItemVisual.prototype.itemDragUpdate = function() {
    this.x = this.container.mmToPixels(this.container.wall.moveItem(this.item, this.container.pixelsToMM(this.x)).position);
    this.container.drawGaps();
}

ItemVisual.prototype.startItemDrag = function() {}
ItemVisual.prototype.stopItemDrag = function() {}
