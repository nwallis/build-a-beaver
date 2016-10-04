var ItemContainerVisual = function (game, engine, model, container){

    Phaser.Group.call(this, game);

    this.engine = engine;
    this.model = model;
    
    //Create wall outline
    this.wallOutline = game.add.graphics(0, 0);
    //this.wallOutline.beginFill(0x444444);
    //this.wallOutline.drawRect(0, 0, this.engine.mmToPixels(DEBUG_WALL_WIDTH), game.stage.height);
    this.add(this.wallOutline);

    //Layer for the gap graphics
    this.gapGraphics = game.make.graphics(0, 0);
    this.add(this.gapGraphics);

    //Update the gaps
    this.drawGaps();

}

ItemContainerVisual.prototype = Object.create(Phaser.Group.prototype);
ItemContainerVisual.prototype.constructor = ItemContainerVisual;

ItemContainerVisual.prototype.addItem = function(item, startPos){
    var itemVisual = new ItemVisual(this.game, this.engine, item, startPos, this);
    this.add(itemVisual);
    this.drawGaps();
}

ItemContainerVisual.prototype.moveItem = function(item, positionInMM){
    return this.model.moveItem(item, positionInMM);
}

ItemContainerVisual.prototype.drawGaps = function() {
    this.gapGraphics.clear();
    var wallGaps = this.model.getGaps();
    wallGaps.forEach(function(gap) {
        this.gapGraphics.lineStyle(2, 0xffffff, 1);
        this.gapGraphics.moveTo(this.engine.mmToPixels(gap.getBounds().left), 150);
        this.gapGraphics.lineTo(this.engine.mmToPixels(gap.getBounds().right), 150);
    }, this);
}
