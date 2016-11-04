const GAME_HEIGHT_MM = 2500;
const DEBUG_WALL_WIDTH = 8000;
const APP_WIDTH_PX = 1270;
const APP_HEIGHT_PX = 630;
const DESIGN_AREA_WIDTH_PX = 1225;
const DESIGN_AREA_HEIGHT_PX = 350;
const DESIGN_AREA_X = 23;
const DESIGN_AREA_Y = 90;
const UI_CONTAINER_X = 11;
const UI_CONTAINER_Y = 480;
const GAP_Y = 10;

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

    //Put ui mockup in the background
    this.uiMockup = this.game.add.sprite(0, 0, 'ui_mockup');

    //Create mask for design area
    this.designAreaMask = this.game.add.graphics(0, 0);
    this.designAreaMask.beginFill(0);
    this.designAreaMask.drawRect(DESIGN_AREA_X, DESIGN_AREA_Y, DESIGN_AREA_WIDTH_PX, DESIGN_AREA_HEIGHT_PX);

    //Create group for all layers
    this.layerContainer = this.game.add.sprite(DESIGN_AREA_X, DESIGN_AREA_Y);

    //Background image for the wall
    this.wallOutline = this.game.add.graphics(0, 0);
    this.wallOutline.beginFill(0x444444);
    this.wallOutline.drawRect(0, 0, this.mmToPixels(DEBUG_WALL_WIDTH), DESIGN_AREA_WIDTH_PX);
    this.layerContainer.addChild(this.wallOutline);

    //Center the layer container
    this.layerContainer.x = (APP_WIDTH_PX / 2) - (this.wallOutline.width / 2);

    //Mask the layer container
    this.layerContainer.mask = this.designAreaMask;

    this.uiContainer = this.game.add.sprite(UI_CONTAINER_X, UI_CONTAINER_Y);
    this.uiContainer.addChild(new ProductVisual(this.game, this, 'cabinet', {
        realWidth: 600,
        realHeight: 1800,
        image: 'cabinet',
        compatibleItems: [5],
        id: 1
    }));

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
            id: 4,
            additionalCompatibleItems: 1,
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

    $("#start-full-screen").click(function() {
        arranger.startFullScreen();
    });
}

Beaver.prototype.startFullScreen = function() {
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.startFullScreen(false);
}

Beaver.prototype.addWallLayer = function(layerCollisions, noGoZones) {

    var newWall = new ItemContainer({
        realWidth: DEBUG_WALL_WIDTH,
        realHeight: GAME_HEIGHT_MM,
        layerCollisions: layerCollisions,
        noGoZones: noGoZones
    });

    var newLayerVisual = new ItemContainerVisual(this.game, this, newWall, this.layerContainer);
    this.wallLayers.push(newLayerVisual);

};

Beaver.prototype.addItem = function(itemModel) {
    this.currentWallLayer().addItem(itemModel);
};

Beaver.prototype.currentWallLayer = function() {
    return this.wallLayers[this.stepNumber - 1];
}

Beaver.prototype.pixelsToMM = function(distance) {
    return (GAME_HEIGHT_MM / DESIGN_AREA_HEIGHT_PX) * distance;
}

Beaver.prototype.mmToPixels = function(distance) {
    return distance / (GAME_HEIGHT_MM / DESIGN_AREA_HEIGHT_PX);
}

Beaver.prototype.update = function() {}
Beaver.prototype.render = function() {}
Beaver.prototype.init = function() {}
Beaver.prototype.preload = function() {}
