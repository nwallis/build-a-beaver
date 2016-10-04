const GAME_HEIGHT_MM = 2500;
const DEBUG_WALL_WIDTH = 10000;

var Beaver = function() {}

Beaver.prototype.create = function(wallWidth) {

    //Figure out how many pixels wide the world needs to be
    this.wallWidthPixels = this.mmToPixels(DEBUG_WALL_WIDTH);
    this.wallHeightPixels = this.stage.height;
    this.game.world.setBounds(150, 0, this.wallWidthPixels, this.wallHeightPixels);

    this.wall = new ItemContainer({
        realWidth: DEBUG_WALL_WIDTH,
        realHeight: GAME_HEIGHT_MM
    });

    //Parent layer for everything on the wall
    this.wallContainer = this.game.add.group();

    //Graphics layer to draw wall 
    this.wallOutline = this.game.add.graphics(0, 0);
    this.wallOutline.beginFill(0x444444);
    this.wallOutline.drawRect(0, 0, this.mmToPixels(DEBUG_WALL_WIDTH), this.stage.height);
    this.wallContainer.add(this.wallOutline);

    //Graphics layer to draw gaps
    this.gapGraphics = this.game.add.graphics(0, 0);
    this.wallContainer.add(this.gapGraphics);

    //Update the gaps
    this.drawGaps();
}

Beaver.prototype.deleteItem = function(item) {
    this.wall.deleteItem(item);
    this.drawGaps();
}

Beaver.prototype.addItem = function(params) {

    var startPos;
    var item = new Item(params);

    try {
        startPos = this.wall.addItem(item).position;
    } catch (error) {
        alert(error.message);
        return false;
    }

    //create the visual to represent the item
    var itemVisual = new ItemVisual(this.game, this, item, startPos);
    this.wallContainer.addChild(itemVisual);

    //update the gaps
    this.drawGaps();
}

Beaver.prototype.drawGaps = function() {
    this.gapGraphics.clear();
    var wallGaps = this.wall.getGaps();
    wallGaps.forEach(function(gap) {
        this.gapGraphics.lineStyle(2, 0xffffff, 1);
        this.gapGraphics.moveTo(this.mmToPixels(gap.getBounds().left), 150);
        this.gapGraphics.lineTo(this.mmToPixels(gap.getBounds().right), 150);
    }, this);
}

Beaver.prototype.update = function() {}

Beaver.prototype.render = function() {
    //this.game.debug.cameraInfo(this.game.camera, 32, 32);
}

Beaver.prototype.pixelsToMM = function(distance) {
    return (GAME_HEIGHT_MM / this.stage.height) * distance;
}

Beaver.prototype.mmToPixels = function(distance) {
    return distance / (GAME_HEIGHT_MM / this.stage.height);
}

Beaver.prototype.init = function() {}
Beaver.prototype.preload = function() {}
