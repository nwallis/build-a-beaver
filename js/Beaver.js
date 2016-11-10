const GAME_HEIGHT_MM = 2500;
const DEBUG_WALL_WIDTH = 8000;
const APP_WIDTH_PX = 1270;
const APP_HEIGHT_PX = 630;
const DESIGN_AREA_WIDTH_PX = 1225;
const DESIGN_AREA_HEIGHT_PX = 350;
const DESIGN_AREA_X = 23;
const DESIGN_AREA_Y = 90;
const DESIGN_AREA_BG_COLOR = 0xffffff;
const DESIGN_AREA_BG_STROKE_COLOR = 0x444444;
const DESIGN_AREA_BG_STROKE_WEIGHT = 1;
const GAP_Y = 10;

var Beaver = function() {
    this.wallLayers = [];
    this.stepNumber = 0;
    this.placingProduct = false;
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

Beaver.prototype.showCursor = function(cursor) {
    this.cursorContainer.children.forEach(function(child) {
        child.visible = false;
        child.anchor.y = child.anchor.x = .5;
    });
    cursor.visible = true;
    this.cursorContainer.visible = true;
    this.game.world.bringToTop(this.cursorContainer);
}

Beaver.prototype.hideCursor = function(cursor) {
    this.cursorContainer.visible = false;
}

Beaver.prototype.create = function() {

    //Create cursor images
    this.cursorContainer = this.game.add.group();
    this.positionProductCursor = this.game.add.sprite(0, 0, 'position_product_cursor');
    this.cursorContainer.add(this.positionProductCursor);
    this.cursorContainer.visible = false;

    //Always check mouse movement
    this.game.input.addMoveCallback(this.moveProductPlacement, this);

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
    this.layerContainer = this.game.add.group();

    //Background image for the wall
    this.wallOutline = this.game.add.graphics(0, 0);
    this.wallOutline.beginFill(DESIGN_AREA_BG_COLOR);
    this.wallOutline.lineStyle(DESIGN_AREA_BG_STROKE_WEIGHT, DESIGN_AREA_BG_STROKE_COLOR, .3);
    this.wallOutline.drawRect(0, 0, this.mmToPixels(DEBUG_WALL_WIDTH), DESIGN_AREA_HEIGHT_PX);
    this.layerContainer.add(this.wallOutline);

    //Position and center the layer container
    this.layerContainer.y = DESIGN_AREA_Y;
    this.layerContainer.x = (APP_WIDTH_PX / 2) - (this.wallOutline.width / 2);

    //Mask the layer container
    this.layerContainer.mask = this.designAreaMask;

    //create container for ui
    this.uiContainer = this.game.add.group();

    //Accordion
    var accordionSection;
    this.productAccordion = new Accordion(this.game, this, this.uiContainer);
    accordionSection = this.productAccordion.addSection('stage_1_closed', 'stage_1_open', 'stage_1_disabled');
    accordionSection.enable();
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 300,
        realHeight: 2500,
        image: 'pillar',
        id: 6
    }));

    accordionSection = this.productAccordion.addSection('stage_2_closed', 'stage_2_open', 'stage_2_disabled');
    accordionSection.enable();
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realHeight: 2400,
        realWidth: 600,
        image: 'pillar_cover_600_2400',
        marginRight: 15,
        marginLeft: 15,
        id: 10,
        collapseTypes: [5, 10, 100],
        compatibleItemOverlaps: [6],
        allowedIntersections: [
            ITEM_EXTREMITIES_OUTSIDE
        ]
    }));
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 600,
        realHeight: 2400,
        image: 'wall_bay_600_2400',
        marginRight: 15,
        marginLeft: 15,
        id: 5,
        collapseTypes: [5, 10, 100],
        itemType: "wall-bay"
    }));
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 900,
        realHeight: 2400,
        image: 'wall_bay_600_2400',
        marginRight: 15,
        marginLeft: 15,
        id: 100,
        collapseTypes: [5, 10, 100],
        itemType: "wall-bay"
    }));

    accordionSection = this.productAccordion.addSection('stage_3_closed', 'stage_3_open', 'stage_3_disabled');
    accordionSection.disable();
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 600,
        realHeight: 1800,
        image: 'cabinet',
        compatibleItems: [5],
        id: 1
    }));
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 900,
        realHeight: 1800,
        image: 'large_cabinet',
        compatibleItems: [100],
        id: 2
    }));
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 900,
        realHeight: 890,
        image: 'small_cabinet',
        compatibleItems: [100],
        id: 3
    }));
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 1800,
        realHeight: 900,
        image: 'small_cabinet_double_with_bench',
        compatibleItems: [100],
        id: 4,
        additionalCompatibleItems: 1,
    }));

    accordionSection = this.productAccordion.addSection('stage_4_closed', 'stage_4_open', 'stage_4_disabled');
    accordionSection.disable();

    //The first item is always available
    this.productAccordion.openByIndex(0);

    //Create initial wall layer
    this.nextStep();

    $("#start-full-screen").click(function() {
        arranger.startFullScreen();
    });
}

Beaver.prototype.startFullScreen = function() {
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.startFullScreen(false);
}

Beaver.prototype.startProductPlacement = function(productData) {
    $("#design-container canvas").addClass('hide-mouse');
    this.showCursor(this.positionProductCursor);
    this.placingProduct = productData;
    this.game.input.onUp.add(this.finishProductPlacement, this);
}

Beaver.prototype.moveProductPlacement = function() {
    var activePointer = this.game.input.activePointer;
    if (this.placingProduct) {
        var layerPointerX = activePointer.x - this.layerContainer.x;
        var layerPointerY = activePointer.y - this.layerContainer.y;
        if (!this.createdItem && this.layerContainer.getBounds().contains(activePointer.x, activePointer.y)) {
            this.createdItem = this.currentWallLayer().addItem(this.placingProduct, this.pixelsToMM(layerPointerX));
        } else if (this.createdItem) {
            var modifiedBounds = this.layerContainer.getBounds();
            modifiedBounds = new Phaser.Rectangle(modifiedBounds.x, 0, modifiedBounds.width, APP_HEIGHT_PX);
            if (modifiedBounds.contains(activePointer.x, activePointer.y))  this.placementMoveResult = this.createdItem.move(layerPointerX); 
        }
    }
}

Beaver.prototype.finishProductPlacement = function() {
    if (!this.placementMoveResult.valid) this.removeItem(this.createdItem);
    this.hideCursor();
    $("#design-container canvas").removeClass('hide-mouse');
    this.createdItem = null;
    this.placingProduct = false;
    this.game.input.onUp.remove(this.finishProductPlacement, this);
}

Beaver.prototype.removeItem = function(item){
    this.currentWallLayer().removeItem(item);
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

Beaver.prototype.currentWallLayer = function() {
    return this.wallLayers[this.stepNumber - 1];
}

Beaver.prototype.pixelsToMM = function(distance) {
    return (GAME_HEIGHT_MM / DESIGN_AREA_HEIGHT_PX) * distance;
}

Beaver.prototype.mmToPixels = function(distance) {
    return distance / (GAME_HEIGHT_MM / DESIGN_AREA_HEIGHT_PX);
}

Beaver.prototype.update = function() {
    this.layerContainer.update();
    this.cursorContainer.x = this.game.input.activePointer.x;
    this.cursorContainer.y = this.game.input.activePointer.y;
    if (this.createdItem) this.cursorContainer.x += this.createdItem.itemVisual.width / 2;
}

Beaver.prototype.render = function() {}
Beaver.prototype.init = function() {}
Beaver.prototype.preload = function() {

    //accordion images
    this.game.load.image('stage_1_closed', 'images/accordion/stage_1_closed.jpg');
    this.game.load.image('stage_1_disabled', 'images/accordion/stage_1_disabled.jpg');
    this.game.load.image('stage_1_open', 'images/accordion/stage_1_open.jpg');
    this.game.load.image('stage_2_closed', 'images/accordion/stage_2_closed.jpg');
    this.game.load.image('stage_2_disabled', 'images/accordion/stage_2_disabled.jpg');
    this.game.load.image('stage_2_open', 'images/accordion/stage_2_open.jpg');
    this.game.load.image('stage_3_closed', 'images/accordion/stage_3_closed.jpg');
    this.game.load.image('stage_3_disabled', 'images/accordion/stage_3_disabled.jpg');
    this.game.load.image('stage_3_open', 'images/accordion/stage_3_open.jpg');
    this.game.load.image('stage_4_closed', 'images/accordion/stage_4_closed.jpg');
    this.game.load.image('stage_4_disabled', 'images/accordion/stage_4_disabled.jpg');
    this.game.load.image('stage_4_open', 'images/accordion/stage_4_open.jpg');

    //cursors
    this.game.load.image('position_product_cursor', 'images/ui/cursors/position_product.png');

    this.game.load.image('cabinet', 'images/cabinet.jpg');
    this.game.load.image('delete_icon', 'images/icons/delete_icon.png');
    this.game.load.image('small_cabinet', 'images/small_cabinet.jpg');
    this.game.load.image('large_cabinet', 'images/large_cabinet.jpg');
    this.game.load.image('small_cabinet_double_with_bench', 'images/small_cabinet_double_with_bench.jpg');
    this.game.load.image('wall_bay_600_2400', 'images/wall_bay_600_2400.jpg');
    this.game.load.image('pillar_cover_600_2400', 'images/pillar_cover_600_2400.jpg');
    this.game.load.image('pillar', 'images/pillar.jpg');
    this.game.load.image('ui_mockup', 'images/ui/background.jpg');
    this.game.load.bitmapFont('arimo', 'fonts/arimo.png', 'fonts/arimo.fnt');

}
