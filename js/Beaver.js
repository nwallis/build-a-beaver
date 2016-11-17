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
const GAP_Y = -10;
const BEAVER_STEP_1 = 0;
const BEAVER_STEP_2 = 1;
const BEAVER_STEP_3 = 2;

var Beaver = function() {
    this.wallLayers = [];
    this.stepNumber = 0;
    this.placingProduct = false;
    this.placementCount = [];
}

Beaver.prototype.measureItem = function(item) {
    this.measureContainer.visible = true;
    this.itemToMeasure = item;
}

Beaver.prototype.hideMeasure = function() {
    this.itemToMeasure = null;
    this.measureContainer.visible = false;
}

Beaver.prototype.changeStep = function(stepNumber) {

    var reasons = [];
    var warnings = [];
    var validChange = true;

    if (stepNumber < this.stepNumber) {

        for (var layerCount = this.stepNumber; layerCount < this.wallLayers.length; layerCount++) {
            this.wallLayers[layerCount].clear();
        }

        //Potential warnings about what will happen
        warnings.push("Careful, you are going back a step");

        //Potential reasons for going backwards that the user needs to be aware of
        for (var reasonCount = stepNumber; reasonCount <= this.stepNumber; reasonCount++) {
            switch (reasonCount) {
                case BEAVER_STEP_1:
                    break;
                case BEAVER_STEP_2:
                    reasons.push("Any wall bays you placed will be deleted");
                    break;
                case BEAVER_STEP_3:
                    reasons.push("Any cabinets you placed will be deleted");
                    break;
            }
        }

    } else if (stepNumber > this.stepNumber) {

        if (stepNumber == 2 && this.getLayerItemCount(1) == 0) {
            validChange = false;
            reasons.push("Must have some wall bays to place any cupboards");
        }

        if (reasons.length == 0) {
            this.stepNumber = stepNumber;
            this.addWallLayer();
        }

    }

    if (validChange && reasons.length == 0) {
        this.stepNumber = stepNumber;
        if (this.productAccordion) this.productAccordion.openByIndex(this.stepNumber);
    } else if (validChange && reasons.length > 0) {
        this.desiredStepNumber = stepNumber;
        this.showDialog(reasons, warnings);
    } else if (!validChange) {
        this.showError(reasons, warnings);
    }

    return {
        valid: validChange,
        reasons: reasons,
        warnings: warnings
    };

}

Beaver.prototype.showError = function(reasons, warnings){

}

Beaver.prototype.showDialog = function (reasons, warnings){

}

Beaver.prototype.countItems = function(layerIndex) {
    var layer = (layerIndex != undefined) ? this.wallLayers[layerIndex] : this.currentWallLayer();
    return layer.model.children.length;
}

Beaver.prototype.countItemsByType = function(type, layerIndex) {
    var layer = (layerIndex != undefined) ? this.wallLayers[layerIndex] : this.currentWallLayer();
    var itemCount = 0;
    layer.model.children.forEach(function(child) {
        if (child.itemType == type) itemCount++;
    });
    return itemCount;
}

Beaver.prototype.getLayerItemCount = function(layerIndex) {
    var layer = this.wallLayers[layerIndex];
    return (layer) ? layer.model.children.length : 0;
}

Beaver.prototype.showCustomCursor = function(cursor) {
    this.cursorContainer.children.forEach(function(child) {
        child.visible = false;
        child.anchor.y = child.anchor.x = .5;
    });
    cursor.visible = true;
    this.cursorContainer.visible = true;
    this.game.world.bringToTop(this.cursorContainer);
}

Beaver.prototype.hideCustomCursor = function(cursor) {
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
    accordionSection = this.productAccordion.addSection('stage_1_closed', 'stage_1_open', 'stage_1_disabled', 0);
    accordionSection.enable();
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 300,
        realHeight: 2500,
        image: 'pillar',
        id: 6
    }));

    accordionSection = this.productAccordion.addSection('stage_2_closed', 'stage_2_open', 'stage_2_disabled', 1);
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

    accordionSection = this.productAccordion.addSection('stage_3_closed', 'stage_3_open', 'stage_3_disabled', 2);
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

    //Layer for the gap graphics
    this.measureContainer = this.game.add.group();
    this.measureContainer.x = this.layerContainer.x;
    this.measureContainer.y = this.layerContainer.y;
    this.measureGraphics = this.game.make.graphics();
    this.itemWidthText = this.game.add.bitmapText(0, 0, 'arimo', '', 12);
    this.itemLeftText = this.game.add.bitmapText(0, 0, 'arimo', '', 12);
    this.measureContainer.add(this.measureGraphics);
    this.measureContainer.add(this.itemWidthText);
    this.measureContainer.add(this.itemLeftText);
    this.uiContainer.addChild(this.measureContainer);

    //Price counter
    this.priceCounter = new Counter(this.game);
    this.priceCounter.x = 1172;
    this.priceCounter.y = 17;
    this.uiContainer.addChild(this.priceCounter);

    //Create initial wall layer
    this.addWallLayer();
    this.productAccordion.openByIndex(0);

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
    this.showCustomCursor(this.positionProductCursor);
    this.placingProduct = productData;
    this.game.input.onUp.add(this.finishProductPlacement, this);
}

Beaver.prototype.moveProductPlacement = function() {
    var activePointer = this.game.input.activePointer;
    if (this.placingProduct) {
        var layerPointerX = activePointer.x - this.layerContainer.x;
        var layerPointerY = activePointer.y - this.layerContainer.y;
        if (!this.createdItem && this.layerContainer.getBounds().contains(activePointer.x, activePointer.y)) {
            this.createdItem = this.addItem(this.placingProduct, layerPointerX);
        } else if (this.createdItem) {
            var modifiedBounds = this.layerContainer.getBounds();
            modifiedBounds = new Phaser.Rectangle(modifiedBounds.x, 0, modifiedBounds.width, APP_HEIGHT_PX);
            if (modifiedBounds.contains(activePointer.x, activePointer.y)) this.placementMoveResult = this.createdItem.move(layerPointerX);
        }
    }
}

Beaver.prototype.addItem = function(itemData, startPosPx) {
    return this.currentWallLayer().addItem(itemData, this.pixelsToMM(startPosPx));
}

Beaver.prototype.finishProductPlacement = function() {

    if (!this.placementMoveResult.valid) {
        this.removeItem(this.createdItem);
    } else {
        this.priceCounter.increment(100.38);
    }

    this.hideMeasure();
    this.hideCustomCursor();
    $("#design-container canvas").removeClass('hide-mouse');
    this.createdItem = null;
    this.placingProduct = false;
    this.game.input.onUp.remove(this.finishProductPlacement, this);
}

Beaver.prototype.removeItem = function(item) {
    this.currentWallLayer().removeItem(item);
}

Beaver.prototype.deleteWallLayer = function() {
    var deletedLayer = this.wallLayers.pop();
    if (deletedLayer) deletedLayer.destroy();
}

Beaver.prototype.addWallLayer = function() {

    var layerCollisions = [];
    var noGoZones = [];

    for (var layerCount = 0; layerCount < this.stepNumber; layerCount++) {
        var layer = this.wallLayers[layerCount];
        layer.model.children.forEach(function(child) {
            layerCollisions.push(child);
        });
    }

    switch (this.stepNumber) {
        case 3:
            noGoZones = this.wallLayers[1].model.getGaps('wall-bay');
            break;
    }

    var newWall = new ItemContainer({
        realWidth: DEBUG_WALL_WIDTH,
        realHeight: GAME_HEIGHT_MM,
        layerCollisions: layerCollisions,
        noGoZones: noGoZones
    });

    var newLayerVisual = new ItemContainerVisual(this.game, this, newWall, this.layerContainer);
    this.wallLayers.push(newLayerVisual);

    return newLayerVisual;
};

Beaver.prototype.currentWallLayer = function() {
    return this.wallLayers[this.wallLayers.length - 1];
}

Beaver.prototype.pixelsToMM = function(distance) {
    return (GAME_HEIGHT_MM / DESIGN_AREA_HEIGHT_PX) * distance;
}

Beaver.prototype.mmToPixels = function(distance) {
    return distance / (GAME_HEIGHT_MM / DESIGN_AREA_HEIGHT_PX);
}

Beaver.prototype.update = function() {

    if (this.itemToMeasure) {

        var itemLeftPixels = this.mmToPixels(this.itemToMeasure.model.getBounds().left);
        var itemRightPixels = this.mmToPixels(this.itemToMeasure.model.getBounds().right);
        var itemWidthPixels = this.mmToPixels(this.itemToMeasure.model.getInnerSize().width);

        this.measureGraphics.clear();
        this.measureGraphics.lineStyle(2, 0, 1);
        this.measureGraphics.moveTo(itemLeftPixels, GAP_Y);
        this.measureGraphics.lineTo(itemRightPixels, GAP_Y);
        this.measureGraphics.lineStyle(1, 0, 1);
        this.measureGraphics.moveTo(itemLeftPixels, GAP_Y - 5);
        this.measureGraphics.lineTo(itemLeftPixels, GAP_Y + 5);
        this.measureGraphics.moveTo(itemRightPixels, GAP_Y - 5);
        this.measureGraphics.lineTo(itemRightPixels, GAP_Y + 5);

        //create text for width of item
        this.itemWidthText.text = this.itemToMeasure.model.getSize().width;
        this.itemWidthText.tint = 0xff0000;
        this.itemWidthText.x = itemLeftPixels + ((itemWidthPixels - this.itemWidthText.width) / 2);
        this.itemLeftText.y = this.itemWidthText.y = this.measureGraphics.y - 25;

        this.itemLeftText.x = this.itemWidthText.x - 200;
        this.itemLeftText.tint = 0xff0000;
        this.itemLeftText.text = Math.floor(this.itemToMeasure.model.getBounds().left) + " to left edge";
    }

    this.layerContainer.update();
    this.cursorContainer.x = this.game.input.activePointer.x;
    this.cursorContainer.y = this.game.input.activePointer.y;
    if (this.createdItem) this.cursorContainer.x += this.createdItem.itemVisual.width / 2;
}

Beaver.prototype.render = function() {}
Beaver.prototype.init = function() {}
Beaver.prototype.preload = function() {

    //accordion images
    this.game.load.image('stage_1_closed', '/images/accordion/stage_1_closed.jpg');
    this.game.load.image('stage_1_disabled', '/images/accordion/stage_1_disabled.jpg');
    this.game.load.image('stage_1_open', '/images/accordion/stage_1_open.jpg');
    this.game.load.image('stage_2_closed', '/images/accordion/stage_2_closed.jpg');
    this.game.load.image('stage_2_disabled', '/images/accordion/stage_2_disabled.jpg');
    this.game.load.image('stage_2_open', '/images/accordion/stage_2_open.jpg');
    this.game.load.image('stage_3_closed', '/images/accordion/stage_3_closed.jpg');
    this.game.load.image('stage_3_disabled', '/images/accordion/stage_3_disabled.jpg');
    this.game.load.image('stage_3_open', '/images/accordion/stage_3_open.jpg');
    this.game.load.image('stage_4_closed', '/images/accordion/stage_4_closed.jpg');
    this.game.load.image('stage_4_disabled', '/images/accordion/stage_4_disabled.jpg');
    this.game.load.image('stage_4_open', '/images/accordion/stage_4_open.jpg');

    //cursors
    this.game.load.image('position_product_cursor', '/images/ui/cursors/position_product.png');

    this.game.load.image('cabinet', '/images/cabinet.jpg');
    this.game.load.image('delete_icon', '/images/icons/delete_icon.png');
    this.game.load.image('small_cabinet', '/images/small_cabinet.jpg');
    this.game.load.image('large_cabinet', '/images/large_cabinet.jpg');
    this.game.load.image('small_cabinet_double_with_bench', '/images/small_cabinet_double_with_bench.jpg');
    this.game.load.image('wall_bay_600_2400', '/images/wall_bay_600_2400.jpg');
    this.game.load.image('pillar_cover_600_2400', '/images/pillar_cover_600_2400.jpg');
    this.game.load.image('pillar', '/images/pillar.jpg');
    this.game.load.image('ui_mockup', '/images/ui/background.jpg');
    this.game.load.bitmapFont('arimo', '/fonts/arimo.png', '/fonts/arimo.fnt');
    this.game.load.bitmapFont('arimo_bold_16', '/fonts/arimo_bold_16.png', '/fonts/arimo_bold_16.fnt');

}
