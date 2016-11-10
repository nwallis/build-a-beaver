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

ItemContainerVisual.prototype.removeItem = function(item){
    this.model.removeItem(item);
    item.destroy();
}

ItemContainerVisual.prototype.addItem = function(itemModel, startPos) {

    var item = new Item(itemModel);

    try {
        startPos = (startPos) ? this.model.addItemAt(item, startPos) : this.model.addItem(item);
    } catch (error) {
        alert(error);
        return false;
    }

    var itemVisual = new ItemVisual(this.game, this.engine, item, startPos.position, this);
    
    this.add(itemVisual);
    this.drawGaps();

    return itemVisual;

}

ItemContainerVisual.prototype.moveItem = function(item, positionInMM) {
    return this.model.moveItem(item, positionInMM);
}

