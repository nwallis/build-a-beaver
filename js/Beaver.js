const GAME_HEIGHT_MM = 2500;
const DEBUG_WALL_WIDTH = 10000;

var Beaver = function() {
    this.wallLayers = [];
    this.stepNumber = 0;
}

Beaver.prototype.nextStep = function() {

    this.stepNumber++;

    var layerCollisions = [];
    var noGoZones = [];

    this.wallLayers.forEach(function(layer) {
        layer.model.children.forEach(function(child) {
            layerCollisions.push(child);
        });
    });

    switch (this.stepNumber) {

        case 3:
            noGoZones = this.wallLayers[1].model.getGaps('wall-bay');
            break;

    }

    this.addWallLayer(layerCollisions, noGoZones);

}

Beaver.prototype.create = function(wallWidth) {

    //Figure out how many pixels wide the world needs to be
    this.wallWidthPixels = this.mmToPixels(DEBUG_WALL_WIDTH);
    this.wallHeightPixels = this.stage.height;
    this.game.world.setBounds(0, 0, this.wallWidthPixels, this.wallHeightPixels);

    //Background image for the wall
    this.wallOutline = this.game.add.graphics(0, 0);
    this.wallOutline.beginFill(0x444444);
    this.wallOutline.drawRect(0, 0, this.mmToPixels(DEBUG_WALL_WIDTH), this.game.stage.height);

    this.layerContainer = this.game.add.group();
    this.nextStep();

    //UI Javascript 
    $("#add-cabinet").click(function() {
        arranger.addItem({
            realWidth: 600,
            realHeight: 1800,
            image: 'cabinet',
            compatibleItems: [5],
            id: 1
        });
    });

    $("#add-large-cabinet").click(function() {
        arranger.addItem({
            realWidth: 900,
            realHeight: 1800,
            image: 'large_cabinet',
            compatibleItems: [100],
            id: 2
        });
    });

    $("#add-small-cabinet").click(function() {
        arranger.addItem({
            realWidth: 900,
            realHeight: 890,
            image: 'small_cabinet',
            compatibleItems: [100],
            id: 3
        });
    });

    $("#add-small-cabinet-with-bench").click(function() {
        arranger.addItem({
            realWidth: 1800,
            realHeight: 900,
            image: 'small_cabinet_double_with_bench',
            compatibleItems: [100],
            id: 4
        });
    });

    $("#add-pillar-cover-600-2400").click(function() {
        arranger.addItem({
            realWidth: 600,
            realHeight: 2400,
            image: 'pillar_cover_600_2400',
            marginRight: 15,
            marginLeft: 15,
            id: 10,
            collapseTypes: [5, 10, 100],
            compatibleItemOverlaps: [6],
            allowedIntersections: [
                ITEM_EXTREMITIES_OUTSIDE
            ]
        });
    });

    $("#add-wall-bay-600-2400").click(function() {
        arranger.addItem({
            realWidth: 600,
            realHeight: 2400,
            image: 'wall_bay_600_2400',
            marginRight: 15,
            marginLeft: 15,
            id: 5,
            collapseTypes: [5, 10, 100],
            itemType: "wall-bay"
        });
    });

    $("#add-wall-bay-900-2400").click(function() {
        arranger.addItem({
            realWidth: 900,
            realHeight: 2400,
            image: 'wall_bay_600_2400',
            marginRight: 15,
            marginLeft: 15,
            id: 100,
            collapseTypes: [5, 10, 100],
            itemType: "wall-bay"
        });
    });

    $("#add-pillar").click(function() {
        arranger.addItem({
            realWidth: 300,
            realHeight: 2500,
            image: 'pillar',
            id: 6
        });
    });
}

Beaver.prototype.addWallLayer = function(layerCollisions,noGoZones) {


    //Create the model
    var newWall = new ItemContainer({
        realWidth: DEBUG_WALL_WIDTH,
        realHeight: GAME_HEIGHT_MM,
        layerCollisions: layerCollisions,
        noGoZones: noGoZones
    });

    var newLayerVisual = new ItemContainerVisual(this.game, this, newWall);
    this.wallLayers.push(newLayerVisual);
}

Beaver.prototype.currentLayer = function() {
    return this.wallLayers[this.wallLayers.length - 1];
}

Beaver.prototype.deleteItem = function(item) {
    this.wall.deleteItem(item);
    this.drawGaps();
}

Beaver.prototype.addItem = function(params) {

    var startPos;
    var item = new Item(params);

    //try {
    //add the item to the model
    startPos = this.currentLayer().model.addItem(item).position;

    //add the item to the visual
    this.currentLayer().addItem(item, startPos);
    //} catch (error) {
    //   alert(error.message);
    //   return false;
    //}

}

Beaver.prototype.update = function() {}

Beaver.prototype.render = function() {}

Beaver.prototype.pixelsToMM = function(distance) {
    return (GAME_HEIGHT_MM / this.stage.height) * distance;
}

Beaver.prototype.mmToPixels = function(distance) {
    return distance / (GAME_HEIGHT_MM / this.stage.height);
}

Beaver.prototype.init = function() {}
Beaver.prototype.preload = function() {}
