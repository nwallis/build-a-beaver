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
const BEAVER_TEST_PRICE = 100.38;
const DESIGN_CONTAINER_X_PX = 11;
const DESIGN_CONTAINER_Y_PX = 44;
const DESIGN_CONTAINER_WIDTH_PX = 1250;
const DESIGN_CONTAINER_HEIGHT_PX = 426;

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

Beaver.prototype.confirmStepChange = function() {
    this.deleteWallLayersAbove(this.desiredStepNumber);
    if (this.productAccordion) this.productAccordion.openByIndex(this.desiredStepNumber);
    this.stepNumber = this.desiredStepNumber;
}

Beaver.prototype.changeStep = function(stepNumber) {

    this.desiredStepNumber = stepNumber;

    var reasons = [];
    var warnings = [];
    var validChange = true;

    if (stepNumber < this.stepNumber) {

        //Potential warnings about what will happen
        warnings.push("Careful, you are going back to stage " + (parseInt(stepNumber) + 1) + ", if you click OK, the following will apply:");

        //Potential reasons for going backwards that the user needs to be aware of
        for (var reasonCount = stepNumber + 1; reasonCount <= this.stepNumber; reasonCount++) {
            switch (reasonCount) {
                case BEAVER_STEP_1:
                    break;
                case BEAVER_STEP_2:
                    if (this.countItems(BEAVER_STEP_2)) reasons.push("- Any wall bays you placed will be deleted");
                    break;
                case BEAVER_STEP_3:
                    if (this.countItems(BEAVER_STEP_3)) reasons.push("- Any cabinets you placed will be deleted");
                    break;
            }
        }

    } else if (stepNumber > this.stepNumber) {


        if (stepNumber == 2 && this.countItems(BEAVER_STEP_2) == 0) {
            validChange = false;
            warnings.push("You haven't placed any wall bays. Cabinets can only connect to wall bays, they cannot be freestanding");
        }

        if (warnings.length == 0) {
            this.stepNumber = stepNumber;
            this.addWallLayer();
        }

    }

    if (validChange && reasons.length == 0) {
        this.stepNumber = stepNumber;
        this.confirmStepChange();
    } else if (validChange && reasons.length > 0) {
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

Beaver.prototype.hideDialog = function(reasons, warnings) {
    var hideTween = this.game.add.tween(this.dialogBackgroundColor).to({
        alpha: 0
    }, DIALOG_TWEEN_TIME, DIALOG_EASE_FUNCTION, true);
    hideTween.onComplete.add(function() {
        this.dialogBackgroundColor.visible = false;
    }, this);
}

Beaver.prototype.prepareDialog = function() {
    this.dialogBackgroundColor.visible = true;
    this.game.add.tween(this.dialogBackgroundColor).to({
        alpha: .3
    }, DIALOG_TWEEN_TIME, DIALOG_EASE_FUNCTION, true);
}

Beaver.prototype.showDialog = function(reasons, warnings) {
    this.prepareDialog();
    if (this.dialogBox) this.dialogBox.show(reasons, warnings);
}

Beaver.prototype.showError = function(reasons, warnings) {
    this.prepareDialog();
    if (this.errorBox) this.errorBox.show(reasons, warnings);
}

Beaver.prototype.countItems = function(layerIndex) {
    var layer = (layerIndex != undefined) ? this.wallLayers[layerIndex] : this.currentWallLayer();
    if (!layer) return 0;
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
    accordionSection = this.productAccordion.addSection('stage_1_closed', 'stage_1_open', 'stage_1_disabled', BEAVER_STEP_1);
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 300,
        realHeight: 2500,
        image: 'pillar',
        id: 6
    }));

    accordionSection = this.productAccordion.addSection('stage_2_closed', 'stage_2_open', 'stage_2_disabled', BEAVER_STEP_2);
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realHeight: 2400,
        realWidth: 450,
        image: 'pillar_cover_450_2400',
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
        realHeight: 2400,
        realWidth: 600,
        image: 'pillar_cover_450_2400',
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
        realWidth: 450,
        realHeight: 2400,
        image: 'wall_bay_450_2400',
        marginRight: 15,
        marginLeft: 15,
        id: 5,
        collapseTypes: [5, 10, 100],
        itemType: "wall-bay"
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
        image: 'wall_bay_900_2400',
        marginRight: 15,
        marginLeft: 15,
        id: 100,
        collapseTypes: [5, 10, 100],
        itemType: "wall-bay"
    }));

    accordionSection = this.productAccordion.addSection('stage_3_closed', 'stage_3_open', 'stage_3_disabled', BEAVER_STEP_3);
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 600,
        realHeight: 1800,
        image: 'cabinet_600_1800',
        compatibleItems: [5],
        id: 1
    }));
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 900,
        realHeight: 1800,
        image: 'cabinet_900_1800',
        compatibleItems: [100],
        id: 2
    }));
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 900,
        realHeight: 900,
        image: 'cabinet_900_900',
        compatibleItems: [100],
        id: 3
    }));
    accordionSection.addContent(new ProductVisual(this.game, this, {
        realWidth: 1800,
        realHeight: 900,
        image: 'cabinet_1800_900',
        compatibleItems: [100],
        id: 4,
        additionalCompatibleItems: 1,
    }));

    //Dialog boxes
    this.dialogContainer = this.game.add.group();

    //Background color behind all dialogs which blocks interaction with elements 
    this.dialogBackgroundColor = this.game.add.graphics();
    this.dialogBackgroundColor.beginFill(0x666666);
    this.dialogBackgroundColor.visible = false;
    this.dialogBackgroundColor.alpha = 0;
    this.dialogBackgroundColor.drawRect(0, 0, APP_WIDTH_PX, APP_HEIGHT_PX);
    this.dialogBackgroundColor.inputEnabled = true;
    this.dialogBackgroundColor.input.useHandCursor = true;
    this.dialogContainer.add(this.dialogBackgroundColor);

    //Container for all dialog boxes
    this.dialogBoxContainer = this.game.add.group();
    this.dialogBox = new Dialog(this.game, this, this.dialogBoxContainer, true, null, this, true, this.confirmStepChange, this);
    this.errorBox = new Dialog(this.game, this, this.dialogBoxContainer, false, null, this, true, null, this);

    //Mask for dialog boxes
    this.dialogMask = this.game.add.graphics(0, 0);
    this.dialogMask.beginFill(0);
    this.dialogMask.drawRect(DESIGN_CONTAINER_X_PX, DESIGN_CONTAINER_Y_PX, DESIGN_CONTAINER_WIDTH_PX, DESIGN_CONTAINER_HEIGHT_PX);
    this.dialogBoxContainer.mask = this.dialogMask;
    this.dialogContainer.add(this.dialogBoxContainer);

    this.uiContainer.add(this.dialogContainer);

    //Layer for the gap graphics
    this.measureContainer = this.game.add.group();
    this.measureContainer.x = this.layerContainer.x;
    this.measureContainer.y = this.layerContainer.y;
    this.measureGraphics = this.game.make.graphics();
    this.itemWidthText = this.game.add.bitmapText(0, 0, 'arimo', '', 12);
    this.measureContainer.add(this.measureGraphics);
    this.measureContainer.add(this.itemWidthText);
    this.uiContainer.addChild(this.measureContainer);

    //Price counter
    this.priceCounter = new Counter(this.game);
    this.priceCounter.x = 1172;
    this.priceCounter.y = 17;
    this.uiContainer.addChild(this.priceCounter);

    //Create initial wall layer
    this.addWallLayer();
    this.productAccordion.openByIndex(BEAVER_STEP_1);

    $("#start-full-screen").click(function() {
        arranger.startFullScreen();
    });


    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.setShowAll();
    this.game.scale.refresh();
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
        this.priceCounter.increment(BEAVER_TEST_PRICE);
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

Beaver.prototype.deleteWallLayersAbove = function(index) {
    var deletedLayers = this.wallLayers.splice(index + 1);
    if (deletedLayers) {
        deletedLayers.forEach(function(layer) {
            layer.destroy();
        });
    }

    this.wallLayers[this.wallLayers.length - 1].enable();
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

    //Disable all existing layers - we are about to add one on top
    this.wallLayers.forEach(function(layer) {
        layer.disable();
    });

    var newLayerVisual = new ItemContainerVisual(this.game, this, newWall, this.layerContainer);
    this.wallLayers.push(newLayerVisual);

    return newLayerVisual;
};

Beaver.prototype.currentWallLayer = function() {
    return this.wallLayers[this.wallLayers.length - 1];
}

Beaver.prototype.pixelsToMM = function(distance) {
    return Math.floor((GAME_HEIGHT_MM / DESIGN_AREA_HEIGHT_PX) * distance);
}

Beaver.prototype.mmToPixels = function(distance) {
    return distance / (GAME_HEIGHT_MM / DESIGN_AREA_HEIGHT_PX);
}

Beaver.prototype.update = function() {

    if (this.itemToMeasure) {

        var itemMeasurement = this.itemToMeasure.model.measure();
        var itemLeftPixels = this.mmToPixels(itemMeasurement.left);
        var itemRightPixels = this.mmToPixels(itemMeasurement.right);
        var itemWidthPixels = itemRightPixels - itemLeftPixels;

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
        this.itemWidthText.text = itemMeasurement.width + "mm";
        this.itemWidthText.tint = 0xff0000;
        this.itemWidthText.x = itemLeftPixels + ((itemWidthPixels - this.itemWidthText.width) / 2);
        this.itemWidthText.y = this.measureGraphics.y - 25;
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

    //dialog images
    this.game.load.image('dialog_background', '/images/ui/dialog/dialog_background.png');

    //buttons
    this.game.load.spritesheet('button_ok', '/images/ui/buttons/ok.png', 113, 31);
    this.game.load.spritesheet('button_cancel', '/images/ui/buttons/cancel.png', 113, 31);
    this.game.load.spritesheet('header_stage_1', '/images/ui/buttons/header_stage_1.png', 114, 20);

    //cursors
    this.game.load.image('position_product_cursor', '/images/ui/cursors/position_product.png');

    //icons
    this.game.load.image('delete_icon', '/images/icons/delete_icon.png');

    this.game.load.image('ui_mockup', '/images/ui/background.jpg');
    this.game.load.bitmapFont('arimo', '/fonts/arimo.png', '/fonts/arimo.fnt');
    this.game.load.bitmapFont('arimo_bold_16', '/fonts/arimo_bold_16.png', '/fonts/arimo_bold_16.fnt');

    //cabinets 
    this.game.load.image('cabinet_600_1800', '/images/products/cabinet_600_1800.jpg');
    this.game.load.image('cabinet_900_900', '/images/products/cabinet_900_900.jpg');
    this.game.load.image('cabinet_900_1800', '/images/products/cabinet_900_1800.jpg');
    this.game.load.image('cabinet_1800_900', '/images/products/cabinet_1800_900.jpg');

    //wall bays and pillars
    this.game.load.image('wall_bay_450_2400', '/images/products/wall_bay_450_2400.jpg');
    this.game.load.image('wall_bay_600_2400', '/images/products/wall_bay_600_2400.jpg');
    this.game.load.image('wall_bay_900_2400', '/images/products/wall_bay_900_2400.jpg');
    this.game.load.image('pillar_cover_450_2400', '/images/products/pillar_cover_450_2400.jpg');
    this.game.load.image('pillar', '/images/pillar.jpg');

}
