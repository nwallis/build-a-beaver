var ItemContainerVisual = function(game, engine, model, container) {

    Phaser.Group.call(this, game, container);

    //References to the model and engine
    this.engine = engine;
    this.model = model;

    //Layer for the gap graphics
    this.gapGraphics = game.make.graphics(0, 0);
    this.add(this.gapGraphics);

    //Update the gaps
    this.drawGaps();

}

ItemContainerVisual.prototype = Object.create(Phaser.Group.prototype);
ItemContainerVisual.prototype.constructor = ItemContainerVisual;

ItemContainerVisual.prototype.addItem = function(itemModel) {

    var item = new Item(itemModel), startPos;

    try {
        startPos = this.model.addItem(item);
    } catch (error) {
        alert(error);
        return false;
    }

    var itemVisual = new ItemVisual(this.game, this.engine, item, startPos, this);
    this.add(itemVisual);
    this.drawGaps();

    return itemVisual;

}

ItemContainerVisual.prototype.moveItem = function(item, positionInMM) {
    return this.model.moveItem(item, positionInMM);
}

ItemContainerVisual.prototype.drawGaps = function() {
    /*this.gapGraphics.clear();
    var wallGaps = this.model.getGaps();
    wallGaps.forEach(function(gap) {
        this.gapGraphics.lineStyle(2, 0, 1);
        this.gapGraphics.moveTo(this.engine.mmToPixels(gap.getBounds().left), GAP_Y);
        this.gapGraphics.lineTo(this.engine.mmToPixels(gap.getBounds().right), GAP_Y);
    }, this);*/
}
