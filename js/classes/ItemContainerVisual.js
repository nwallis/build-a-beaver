var ItemContainerVisual = function(game, engine, model, container) {

    Phaser.Group.call(this, game, container);

    //References to the model and engine
    this.engine = engine;
    this.model = model;

}

ItemContainerVisual.prototype = Object.create(Phaser.Group.prototype);
ItemContainerVisual.prototype.constructor = ItemContainerVisual;

ItemContainerVisual.prototype.removeItem = function(item) {
    this.model.removeItem(item);
    item.destroy();
}

ItemContainerVisual.prototype.destroy = function() {

    //reduce the price on the engine by the amount of the items
    var total = 0;

    this.model.children.forEach(function(child) {
        console.log("calling destroy on ", child);
        child.destroy();
        total += BEAVER_TEST_PRICE;
    });

    this.engine.priceCounter.decrement(total);

    Phaser.Group.prototype.destroy.call(this);
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
    return itemVisual;

}

ItemContainerVisual.prototype.moveItem = function(item, positionInMM) {
    return this.model.moveItem(item, positionInMM);
}

ItemContainerVisual.prototype.enable = function() {
    this.children.forEach(function(child) {
        child.enable();
    });
}

ItemContainerVisual.prototype.disable = function() {
    this.children.forEach(function(child) {
        child.disable();
    });
}
