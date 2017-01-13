const ICON_MARGIN = 5;
const GAME_HEIGHT_MM = 2500;
const APP_WIDTH_PX = 1270;
const APP_HEIGHT_PX = 630;
const DESIGN_AREA_WIDTH_PX = 1225;
const DESIGN_AREA_HEIGHT_PX = 350;
const DESIGN_AREA_X = 23;
const DESIGN_AREA_Y = 90;
const DESIGN_AREA_BG_COLOR = 0xffffff;
const DESIGN_AREA_BG_STROKE_COLOR = 0x444444;
const DESIGN_AREA_BG_STROKE_WEIGHT = 1;
const BEAVER_STEP_1 = 0;
const BEAVER_STEP_2 = 1;
const BEAVER_STEP_3 = 2;
const BEAVER_TEST_PRICE = 100.38;
const DESIGN_CONTAINER_X_PX = 11;
const DESIGN_CONTAINER_Y_PX = 44;
const DESIGN_CONTAINER_WIDTH_PX = 1250;
const DESIGN_CONTAINER_HEIGHT_PX = 426;
const MARKER_TOP_Y = -3;
const MARKER_BOTTOM_Y = 355;
const MARKER_HEIGHT = 10;
const MARKER_COLOR = 0xc27843;
const MARKER_COLOR_HTML = "#aa662e";
const MM_SUFFIX = " mm";
const MARKER_LINE_THICKNESS = 4;
const INFO_TEXT_COLOR_HTML = "#ffffff";
const INFO_TEXT_STROKE_COLOR_HTML = "#ffffff";
const INFO_TEXT_SIZE = 14;
const INFO_TEXT_DISPLAY_DURATION = 3000;
const INFO_TEXT_EASE_DURATION = 400;
const INFO_TEXT_EASE_FUNCTION = Phaser.Easing.Bounce.Out;
const FOOTER_BUTTON_Y_PX = 591;
const PRELOAD_TEXT_COLOR_HTML = "#000000";
const PRELOAD_TEXT_STROKE_COLOR_HTML = "#000000";
const POSITIONING_INCREMENT_MM = 50;
const ZONE_COLOR = 0x54b225;
const ZONE_LINE_THICKNESS = 4;

var Beaver = function() {
    this.wallLayers = [];
    this.stepNumber = -1;
    this.placingProduct = false;
    this.placementCount = [];
    this.stepMessages = [false, false, false];
}

Beaver.prototype.measureItem = function(item) {
    this.measureContainer.visible = true;
    this.itemToMeasure = item;
}

Beaver.prototype.hideMeasure = function() {
    this.itemToMeasure = null;
    this.measureContainer.visible = false;
}

Beaver.prototype.changeHeaderButtons = function(stepNumber) {

    //highlight correct header button
    this.headerStageButtons.forEach(function(stageButton) {
        stageButton.setFrames(0, 0, 0);
    });
    this.headerStageButtons[stepNumber].setFrames(1, 1, 1);

    //put padlocks on all invalid steps
    this.padlockContainer.destroy();
    this.padlockContainer = this.game.add.group();
    this.headerButtonContainer.add(this.padlockContainer);
    for (var stepCount = 0; stepCount < stepNumber; stepCount++) {
        var padlock = this.game.add.sprite(0, 0, 'padlock_icon');
        padlock.x = this.headerStageButtons[stepCount].x + 5;
        padlock.y = this.headerStageButtons[stepCount].y + ((this.headerStageButtons[stepCount].height - padlock.height) / 2);
        this.padlockContainer.add(padlock);
    }
}

Beaver.prototype.confirmNextStep = function() {
    this.confirmStepChange();
    this.addWallLayer();
}

Beaver.prototype.confirmStepChange = function() {

    this.changeHeaderButtons(this.desiredStepNumber);

    //hide the icons
    this.hideIcons();

    this.deleteWallLayersAbove(this.desiredStepNumber);
    if (this.productAccordion) this.productAccordion.openByIndex(this.desiredStepNumber);
    this.stepNumber = this.desiredStepNumber;
}

Beaver.prototype.changeStep = function(stepNumber) {

    if (stepNumber == this.stepNumber) return;

    this.desiredStepNumber = stepNumber;

    var reasons = [];
    var warnings = [];
    var validChange = true;
    var callback = null;

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

        callback = this.confirmStepChange;

    } else if (stepNumber > this.stepNumber) {

        if (stepNumber == BEAVER_STEP_3 && this.countItems(BEAVER_STEP_2) == 0) {
            validChange = false;
            warnings.push("You haven't placed any wall bays. ");
            reasons.push("Cabinets can only connect to wall bays, they cannot be freestanding");
        } else if (stepNumber == BEAVER_STEP_2 && !this.stepMessages[BEAVER_STEP_2]) {
            if (!this.stepMessages[BEAVER_STEP_2]) {
                callback = this.confirmNextStep;
                this.stepMessages[BEAVER_STEP_2] = true;
                warnings.push("You are going to stage 2");
                reasons.push("In stage 2 you can place your wall bays.  Wall bays are the foundation for your storage system.  Remember if you placed a pillar in stage 1, you can put a pillar cover over the top of it");
            }
        } else if (stepNumber == BEAVER_STEP_3 && !this.stepMessages[BEAVER_STEP_3]) {
            if (!this.stepMessages[BEAVER_STEP_3]) {
                callback = this.confirmNextStep;
                this.stepMessages[BEAVER_STEP_3] = true;
                warnings.push("You are going to stage 3");
                reasons.push("In stage 3 you can place your cabinets. After you have placed all your cabinets, print your design before checking out.\nBefore payment you will be taken to our accessories page where you can add shelving and storage bins.");
            }
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
        this.showDialog(reasons, warnings, callback, null);
    } else if (!validChange) {
        this.showError(reasons, warnings, null, null);
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

Beaver.prototype.showDialog = function(reasons, warnings, okCallback, uiElements) {
    this.prepareDialog();
    if (this.dialogBox) this.dialogBox.show(reasons, warnings, okCallback, uiElements);
}

Beaver.prototype.showError = function(reasons, warnings, okCallback, uiElements) {
    this.prepareDialog();
    this.errorBox.show(reasons, warnings, okCallback, uiElements);
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
    this.wallWidthPixels = this.mmToPixels(this.desiredWallWidth);
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

    //Zones
    this.zoneGraphics = this.game.add.graphics();

    //Background image for the wall
    this.wallOutline = this.game.add.graphics(0, 0);
    this.layerContainer.add(this.wallOutline);

    //Mask the layer container
    this.layerContainer.mask = this.designAreaMask;


    //create container for ui
    this.uiContainer = this.game.add.group();
    this.uiContainer.add(this.zoneGraphics);

    //Header buttons
    this.headerButtonContainer = this.game.add.group();
    this.uiContainer.add(this.headerButtonContainer);
    this.headerStage1 = this.game.add.button(396, 13, 'header_stage_1', function() {
        this.changeStep(BEAVER_STEP_1);
    }, this, 1, 0, 1);
    this.headerStage2 = this.game.add.button(520, 13, 'header_stage_2', function() {
        this.changeStep(BEAVER_STEP_2);
    }, this, 1, 0, 1);
    this.headerStage3 = this.game.add.button(642, 13, 'header_stage_3', function() {
        this.changeStep(BEAVER_STEP_3);
    }, this, 1, 0, 1);
    this.padlockContainer = this.game.add.group();
    this.headerButtonContainer.add(this.headerStage1);
    this.headerButtonContainer.add(this.headerStage2);
    this.headerButtonContainer.add(this.headerStage3);
    this.headerButtonContainer.add(this.padlockContainer);

    this.headerStageButtons = [this.headerStage1, this.headerStage2, this.headerStage3];

    this.resetButton = this.game.add.button(0, 0, 'button_clear', function() {
        location.reload();
    }, this, 1, 0, 1);
    this.resetButton.y = FOOTER_BUTTON_Y_PX;
    this.resetButton.x = ACCORDION_X;

    this.checkoutButton = this.game.add.button(0, 0, 'button_checkout', function() {
        this.checkout();
    }, this, 1, 0, 1);
    this.checkoutButton.y = FOOTER_BUTTON_Y_PX;
    this.checkoutButton.x = APP_WIDTH_PX - ((ACCORDION_X + this.checkoutButton.width) * 1);

    this.printButton = this.game.add.button(0, 0, 'button_print', function() {
        window.print();
    }, this, 1, 0, 1);
    this.printButton.y = FOOTER_BUTTON_Y_PX;
    this.printButton.x = APP_WIDTH_PX - ((ACCORDION_X + this.printButton.width) * 2);


    //Info text

    this.infoTextContainer = this.game.add.group();
    this.infoTextContainer.y = 583;
    this.infoText = this.game.add.text(0, 15, '', {
        font: "14px Lato",
        fontStyle: "",
        boundsAlignH: "center",
        boundsAlignV: "middle",
        fontWeight: "300",
        fill: INFO_TEXT_COLOR_HTML,
        stroke: INFO_TEXT_STROKE_COLOR_HTML,
        strokeThickness: 1
    });
    this.infoTextContainer.add(this.infoText);
    this.infoTextBeaver = this.game.make.sprite(0, -40, 'info_text_beaver');
    this.infoTextContainer.add(this.infoTextBeaver);
    this.infoTextContainer.visible = false;


    //Accordion
    var accordionSection;

    if (accordionData.length == 0) {
        accordionData = [{
            closedImage: "stage_1_closed",
            openImage: "stage_1_open",
            disabledImage: "stage_1_disabled",
            products: [{
                name: 'BRICK PILLAR',
                price: 0,
                realWidth: 230,
                realHeight: 2500,
                image: 'pillar',
                id: -1
            }, {
                name: 'DOOR',
                price: 0,
                realWidth: 820,
                realHeight: 2040,
                image: 'door_820_2040',
                id: -2
            }]
        }, {
            closedImage: "stage_2_closed",
            openImage: "stage_2_open",
            disabledImage: "stage_2_disabled",
            products: [{
                name: 'PILLAR COVER',
                price: 95,
                realHeight: 2400,
                realWidth: 450,
                image: 'pillar_cover_450_2400',
                marginRight: 15,
                marginLeft: 15,
                id: 725,
                productName: "pillar cover product name",
                sku: "PC001",
                collapseTypes: [722, 723, 724, 725, 726],
                compatibleItemOverlaps: [-1],
                allowedIntersections: [
                    ITEM_EXTREMITIES_OUTSIDE
                ]
            }, {
                name: 'PILLAR COVER',
                price: 100.38,
                realHeight: 2400,
                realWidth: 600,
                image: 'pillar_cover_600_2400',
                marginRight: 15,
                marginLeft: 15,
                id: 726,
                collapseTypes: [722, 723, 724, 725, 726],
                compatibleItemOverlaps: [-1],
                allowedIntersections: [
                    ITEM_EXTREMITIES_OUTSIDE
                ]
            }, {
                name: 'WALL BAY',
                price: 100.38,
                realWidth: 450,
                realHeight: 2400,
                image: 'wall_bay_450_2400',
                marginRight: 15,
                marginLeft: 15,
                id: 722,
                collapseTypes: [722, 723, 724, 725, 726],
                itemType: "wall-bay"
            }, {
                name: 'WALL BAY',
                price: 95,
                realWidth: 600,
                realHeight: 2400,
                image: 'wall_bay_600_2400',
                marginRight: 15,
                marginLeft: 15,
                id: 723,
                alternatePrice: 50.00,
                alternateSku: "ALTERNATESKU",
                alternateProductName: "Alternate name",
                productName: "Original name",
                sku: "SKUME",
                collapseTypes: [722, 723, 724, 725, 726],
                itemType: "wall-bay"
            }, {
                name: 'WALL BAY',
                price: 100.38,
                realWidth: 900,
                realHeight: 2400,
                image: 'wall_bay_900_2400',
                marginRight: 15,
                marginLeft: 15,
                id: 724,
                collapseTypes: [722, 723, 724, 725, 726],
                itemType: "wall-bay"
            }]
        }, {
            closedImage: "stage_3_closed",
            openImage: "stage_3_open",
            disabledImage: "stage_3_disabled",
            products: [{
                name: 'CABINET',
                price: 100.38,
                realWidth: 600,
                realHeight: 1800,
                image: 'cabinet_600_1800',
                itemType: "cabinet",
                compatibleItems: [723],
                id: 727
            }, {
                name: 'CABINET',
                price: 100.38,
                realWidth: 900,
                realHeight: 1800,
                image: 'cabinet_900_1800',
                itemType: "cabinet",
                compatibleItems: [724],
                id: 728
            }, {
                name: 'CABINET',
                price: 100.38,
                realWidth: 900,
                realHeight: 900,
                image: 'cabinet_900_900',
                compatibleItems: [724],
                itemType: "cabinet",
                id: 729
            }, {
                name: 'CABINET',
                itemType: "cabinet",
                price: 100.38,
                realWidth: 1800,
                realHeight: 1005,
                image: 'cabinet_1800_1005',
                compatibleItems: [724],
                id: 730,
                additionalCompatibleItems: 1,
            }]
        }];
    }

    this.productAccordion = new Accordion(this.game, this, this.uiContainer);

    for (var stageCount = BEAVER_STEP_1; stageCount <= BEAVER_STEP_3; stageCount++) {
        var sectionData = accordionData[stageCount];
        accordionSection = this.productAccordion.addSection(sectionData.closedImage, sectionData.openImage, sectionData.disabledImage, stageCount);
        sectionData.products.forEach(function(product) {
            accordionSection.addContent(new ProductVisual(this.game, this, product));
        }, this);
    }

    //Icons
    this.iconContainer = this.game.add.group();
    this.deleteIcon = this.game.add.button(0, 0, 'delete_icon', this.deleteItem, this, 0, 0, 0);
    this.infoIcon = this.game.add.button(0, 0, 'info_icon', this.displayItemInfo, this, 0, 0, 0);
    this.infoIcon.scale.x = this.infoIcon.scale.y = this.deleteIcon.scale.x = this.deleteIcon.scale.y = .5;
    this.deleteIcon.visible = this.infoIcon.visible = false;
    this.icons = [this.deleteIcon]; //, this.infoIcon];
    this.iconContainer.add(this.deleteIcon);
    this.uiContainer.add(this.iconContainer);

    //Dialog boxes
    this.dialogContainer = this.game.add.group();

    //Background color behind all dialogs which blocks interaction with elements 
    this.dialogBackgroundColor = this.game.add.graphics();
    this.dialogBackgroundColor.beginFill(0x666666);
    this.dialogBackgroundColor.visible = false;
    this.dialogBackgroundColor.alpha = 0;
    this.dialogBackgroundColor.drawRect(0, 0, APP_WIDTH_PX, APP_HEIGHT_PX);
    this.dialogBackgroundColor.inputEnabled = true;
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

    //Price counter
    this.priceCounter = new Counter(this.game);
    this.priceCounter.x = 1172;
    this.priceCounter.y = 17;
    this.uiContainer.addChild(this.priceCounter);

    //Create a slider for the dialog
    this.wallWidthSlider = new Slider(this.game, this, 300, 1000, 9000, 100);

    this.wallWidthDialog = new Dialog(this.game, this, this.dialogBoxContainer, false, null, this, true, null, this);
    this.prepareDialog();
    this.wallWidthDialog.show(['Move the slider left and right to change your wall width.\nAfter you selecting OK, you can drag products onto your wall.'], ['How wide is your wall?'], this.setupWall, this.wallWidthSlider);

    $("#start-full-screen").click(function() {
        arranger.startFullScreen();
    });

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.setShowAll();
    this.game.scale.refresh();
}

Beaver.prototype.checkout = function() {
    this.showDialog(['Clicking OK will end your designing session and take you to the checkout. \n\nHave you printed your design yet?'], ['You are about to checkout!'], this.checkoutConfirmed, null);
}

Beaver.prototype.checkoutConfirmed = function() {
    $("form").submit();
}

Beaver.prototype.displayInfo = function(message) {
    this.infoText.text = message;
    this.infoTextBeaver.x = this.infoText.width + 10;
    this.infoTextContainer.y = APP_HEIGHT_PX;
    this.infoTextContainer.visible = true;
    this.infoTextContainer.x = 557 - (this.infoTextContainer.width / 2);

    var showTween = this.game.add.tween(this.infoTextContainer).to({
        y: 583
    }, INFO_TEXT_EASE_DURATION, INFO_TEXT_EASE_FUNCTION, true);

    if (this.hideInfoInterval) clearInterval(this.hideInfoInterval);
    this.hideInfoInterval = setInterval((function(self) {
        return function() {
            self.hideInfo();
        }
    })(this), INFO_TEXT_DISPLAY_DURATION, this);
}

Beaver.prototype.hideInfo = function() {
    var hideTween = this.game.add.tween(this.infoTextContainer).to({
        y: APP_HEIGHT_PX + Math.abs(this.infoTextBeaver.y)
    }, INFO_TEXT_EASE_DURATION, INFO_TEXT_EASE_FUNCTION, true);
}

Beaver.prototype.setupWall = function() {

    this.desiredWallWidth = this.wallWidthSlider.currentValue;

    //Draw wall based on input width
    this.wallOutline.beginFill(DESIGN_AREA_BG_COLOR);
    this.wallOutline.lineStyle(DESIGN_AREA_BG_STROKE_WEIGHT, DESIGN_AREA_BG_STROKE_COLOR, .3);
    this.wallOutline.drawRect(0, 0, this.mmToPixels(this.desiredWallWidth), DESIGN_AREA_HEIGHT_PX);

    //Position and center the layer container
    this.zoneGraphics.y = this.layerContainer.y = DESIGN_AREA_Y;
    this.zoneGraphics.x = this.layerContainer.x = (APP_WIDTH_PX / 2) - (this.wallOutline.width / 2);

    var measureStyling = {
        font: "12px Lato",
        fontStyle: "italic",
        align: "left",
        fontWeight: "300",
        fill: MARKER_COLOR_HTML,
        stroke: MARKER_COLOR_HTML,
        strokeThickness: 1
    };
    this.measureContainer = this.game.add.group();
    this.measureContainer.x = this.layerContainer.x;
    this.measureContainer.y = this.layerContainer.y;
    this.measureGraphics = this.game.make.graphics();
    this.itemWidthText = this.game.add.text(0, 0, '', measureStyling);
    this.itemLeftText = this.game.add.text(this.wallOutline.x + 10, 358, '', measureStyling);
    measureStyling.align = "right";
    this.itemRightText = this.game.add.text(this.wallOutline.x + this.wallOutline.width - 60, 358, '', measureStyling);
    this.measureContainer.add(this.measureGraphics);
    this.measureContainer.add(this.itemWidthText);
    this.measureContainer.add(this.itemLeftText);
    this.measureContainer.add(this.itemRightText);
    this.uiContainer.addChild(this.measureContainer);

    this.changeStep(BEAVER_STEP_1);
}

Beaver.prototype.showIcons = function(itemVisual) {
    if (itemVisual) {
        //Set icon positions based on margins
        for (var iconCount = 0; iconCount < this.icons.length; iconCount++) {
            var icon = this.icons[iconCount];
            icon.y = ICON_MARGIN + this.layerContainer.y + (iconCount * (ICON_MARGIN + icon.height)) + itemVisual.itemVisual.y;
            icon.x = (ICON_MARGIN + icon.width > itemVisual.itemVisual.width) ? this.layerContainer.x + itemVisual.x + ((itemVisual.itemVisual.width - icon.width) / 2) : this.layerContainer.x + itemVisual.x + ICON_MARGIN;
            icon.visible = true;
        }

        this.selectedItem = itemVisual;
    }
}

Beaver.prototype.hideIcons = function() {
    this.deleteIcon.visible = this.infoIcon.visible = false;
}

Beaver.prototype.deleteItem = function() {
    this.currentWallLayer().removeItem(this.selectedItem);
    this.hideIcons();
    this.buildHTML();
    this.hideMeasure();
}

Beaver.prototype.displayItemInfo = function(itemVisual) {
    this.hideIcons();
}

Beaver.prototype.startFullScreen = function() {
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.startFullScreen(false);
}

Beaver.prototype.startProductPlacement = function(productData, zones) {

    if (zones) {
        this.displayInfo("You can place this cabinet in the highlighted locations");
        zones.forEach(function(zone) {
            var firstItemMeasure = zone[0].measure();
            var lastItemMeasure = zone[zone.length - 1].measure();
            this.zoneGraphics.lineStyle(ZONE_LINE_THICKNESS, ZONE_COLOR, 1);
            this.zoneGraphics.drawRect(this.mmToPixels(firstItemMeasure.left) + (ZONE_LINE_THICKNESS / 2), DESIGN_AREA_HEIGHT_PX - (ZONE_LINE_THICKNESS / 2), this.mmToPixels(lastItemMeasure.right - firstItemMeasure.left) - (ZONE_LINE_THICKNESS / 2), -(this.mmToPixels(zone[0].realHeight) - (ZONE_LINE_THICKNESS / 2)));

        }, this);
    }

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
        var halfWidth = this.mmToPixels(this.placingProduct.realWidth / 2);
        if (!this.createdItem && this.layerContainer.getBounds().contains(activePointer.x, activePointer.y)) {
            this.createdItem = this.addItem(this.placingProduct, layerPointerX - halfWidth);
            this.createdItem.dragging = true;
        } else if (this.createdItem) {
            var modifiedBounds = this.layerContainer.getBounds();
            modifiedBounds = new Phaser.Rectangle(modifiedBounds.x, 0, modifiedBounds.width, APP_HEIGHT_PX);
            if (modifiedBounds.contains(activePointer.x, activePointer.y)) this.placementMoveResult = this.createdItem.move(layerPointerX - halfWidth);
        }

        this.showIcons(this.createdItem);
    }
}

Beaver.prototype.addItem = function(itemData, startPosPx) {
    return this.currentWallLayer().addItem(itemData, this.pixelsToMM(startPosPx));
}

Beaver.prototype.checkAlternateProduct = function(child) {
    if (child.itemType == 'wall-bay' && (child.itemSnappedToLeft && child.itemSnappedRight) || (child.itemSnappedToLeft && !child.itemSnappedRight)) {
        switch (child.id) {
            case 722:
                return 848;
                break;
            case 723:
                return 799;
                break;
            case 724:
                return 798;
                break;
        }
    }
    return false;
}

Beaver.prototype.finishProductPlacement = function() {

    //Clear any zone graphics
    this.zoneGraphics.clear();

    //Check that item was created as its possible that they may start but not create a product
    if (this.createdItem) {
        this.createdItem.dragging = false;

        if (!this.placementMoveResult.valid) {
            this.removeItem(this.createdItem);
            this.hideIcons();
        } else {
            this.buildHTML();
            this.showIcons(this.createdItem);
        }
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
    this.buildHTML();
}

Beaver.prototype.buildHTML = function() {
    var htmlItems = {};
    var totalPrice = 0;
    this.wallLayers.forEach(function(layer) {
        layer.model.children.forEach(function(child) {

            if (child.id > 0) {
                var id = child.id;
                var name = child.productName;
                var sku = child.sku;
                var price = child.price;

                var possibleAlternateId = this.checkAlternateProduct(child);
                if (possibleAlternateId) {
                    id = possibleAlternateId;
                    price = child.alternatePrice
                    sku = child.alternateSku;
                    name = child.alternateProductName;
                }

                if (!htmlItems[id]) {
                    htmlItems[id] = {
                        amount: 0,
                        name: name,
                        price: price,
                        sku: sku
                    };
                }

                htmlItems[id]['amount']++;
                if (price) totalPrice += price;
            }
        }, this);
    }, this);

    $("#beaver-products").empty();
    $("#inventory .inventory-row").remove();

    for (var productId in htmlItems) {
        //Build html to be sent to CS-CART
        $("#beaver-products").append('<input type="hidden" name="product_data[' + productId + '][product_id]" value="' + productId + '">');
        $("#beaver-products").append('<input type="hidden" name="product_data[' + productId + '][amount]" value="' + htmlItems[productId]['amount'] + '">');

        //Build HTML for printable table
        $("#inventory tbody").append('<tr class="inventory-row"> <td>' + htmlItems[productId]['name'] + '</td> <td>' + htmlItems[productId]['sku'] + '</td> <td>' + htmlItems[productId]['amount'] + '</td> <td>$' + (htmlItems[productId]['price'] * htmlItems[productId]['amount']).toFixed(2) + '</td> </tr> ');
    }

    //Transition to the correct price
    this.priceCounter.transitionTo(totalPrice);


}

Beaver.prototype.deleteWallLayer = function() {
    var deletedLayer = this.wallLayers.pop();
    if (deletedLayer) deletedLayer.destroy();
    this.buildHTML();
}

Beaver.prototype.deleteWallLayersAbove = function(index) {

    var deletedLayers = this.wallLayers.splice(index + 1);
    if (deletedLayers) {
        deletedLayers.forEach(function(layer) {
            layer.destroy();
        });
    }

    this.wallLayers[this.wallLayers.length - 1].enable();
    this.buildHTML();
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
        realWidth: this.desiredWallWidth,
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
        //horizontal line
        this.measureGraphics.lineStyle(MARKER_LINE_THICKNESS, MARKER_COLOR, 1);
        this.measureGraphics.moveTo(itemLeftPixels, MARKER_TOP_Y);
        this.measureGraphics.lineTo(itemRightPixels, MARKER_TOP_Y);
        this.measureGraphics.moveTo(0, MARKER_BOTTOM_Y);
        this.measureGraphics.lineTo(itemLeftPixels, MARKER_BOTTOM_Y);
        this.measureGraphics.moveTo(itemRightPixels, MARKER_BOTTOM_Y);
        this.measureGraphics.lineTo(this.layerContainer.width, MARKER_BOTTOM_Y);

        //vertical lines
        this.measureGraphics.lineStyle(1, MARKER_COLOR, 1);
        this.measureGraphics.moveTo(itemLeftPixels, MARKER_TOP_Y + (MARKER_LINE_THICKNESS / 2));
        this.measureGraphics.lineTo(itemLeftPixels, MARKER_TOP_Y - MARKER_HEIGHT);
        this.measureGraphics.moveTo(itemRightPixels, MARKER_TOP_Y + (MARKER_LINE_THICKNESS / 2));
        this.measureGraphics.lineTo(itemRightPixels, MARKER_TOP_Y - MARKER_HEIGHT);
        this.measureGraphics.moveTo(0, MARKER_BOTTOM_Y - (MARKER_LINE_THICKNESS / 2));
        this.measureGraphics.lineTo(0, MARKER_BOTTOM_Y + MARKER_HEIGHT);
        this.measureGraphics.moveTo(this.layerContainer.width, MARKER_BOTTOM_Y - (MARKER_LINE_THICKNESS / 2));
        this.measureGraphics.lineTo(this.layerContainer.width, MARKER_BOTTOM_Y + MARKER_HEIGHT);

        //create text for width of item
        this.itemWidthText.text = itemMeasurement.width + MM_SUFFIX;
        this.itemWidthText.x = itemLeftPixels + ((itemWidthPixels - this.itemWidthText.width) / 2);
        this.itemWidthText.y = this.measureGraphics.y - 30;

        this.itemLeftText.text = itemMeasurement.left + MM_SUFFIX;
        this.itemRightText.text = (this.desiredWallWidth - itemMeasurement.right) + MM_SUFFIX;
    }

    this.layerContainer.update();
    this.cursorContainer.x = this.game.input.activePointer.x;
    this.cursorContainer.y = this.game.input.activePointer.y;
}

WebFontConfig = {

    google: {
        families: ['Lato']
    }

};

Beaver.prototype.findWallBay = function(wallBayWidth, baysRequired) {

    baysRequired = baysRequired + 1 || 1;
    wallBayWidth /= baysRequired;

    var items = [];
    var potentialChildren = this.wallLayers[BEAVER_STEP_2].model.getChildren('wall-bay');

    for (var childCount = 0; childCount < potentialChildren.length; childCount++) {
        var potentialChild = potentialChildren[childCount];
        if (potentialChild.realWidth == wallBayWidth && !potentialChild.snappedChild) {

            var potentialItems = [potentialChild];
            var previousChild = potentialChild;
            for (var sequentialCount = 1; sequentialCount < baysRequired; sequentialCount++) {
                var sequentialChild = potentialChildren[childCount + sequentialCount];

                if (sequentialChild && sequentialChild.realWidth == wallBayWidth && sequentialChild.itemSnappedToLeft == previousChild && !sequentialChild.snappedChild) {
                    potentialItems.push(sequentialChild);
                } else {
                    potentialItems = null;
                    childCount = childCount + sequentialCount;
                    break;
                }

                previousChild = sequentialChild;

            }
        }

        if (potentialItems) {
            items.push(potentialItems);
            //childCount += potentialItems.length - 1;
        }

    }

    return (items.length > 0) ? items : false;
}

Beaver.prototype.fileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
    this.preloadText.text = progress + "%";
}

Beaver.prototype.loadComplete = function() {
    this.preloadText.destroy();
}

Beaver.prototype.render = function() {}
Beaver.prototype.init = function() {}
Beaver.prototype.preload = function() {

    this.preloadText = this.game.add.text(0, 0, '', {
        font: "24px Lato",
        fontStyle: "",
        boundsAlignH: "center",
        boundsAlignV: "middle",
        fontWeight: "700",
        fill: PRELOAD_TEXT_COLOR_HTML,
        stroke: PRELOAD_TEXT_STROKE_COLOR_HTML,
        strokeThickness: 1
    });
    this.preloadText.setTextBounds(0, 0, APP_WIDTH_PX, APP_HEIGHT_PX);

    this.game.load.onLoadComplete.add(this.loadComplete, this);
    this.game.load.onFileComplete.add(this.fileComplete, this);

    //required for google fonts
    this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

    //accordion images
    this.game.load.image('stage_1_closed', '/images/beaver/accordion/stage_1_closed.jpg');
    this.game.load.image('stage_1_disabled', '/images/beaver/accordion/stage_1_disabled.jpg');
    this.game.load.image('stage_1_open', '/images/beaver/accordion/stage_1_open.jpg');
    this.game.load.image('stage_2_closed', '/images/beaver/accordion/stage_2_closed.jpg');
    this.game.load.image('stage_2_disabled', '/images/beaver/accordion/stage_2_disabled.jpg');
    this.game.load.image('stage_2_open', '/images/beaver/accordion/stage_2_open.jpg');
    this.game.load.image('stage_3_closed', '/images/beaver/accordion/stage_3_closed.jpg');
    this.game.load.image('stage_3_disabled', '/images/beaver/accordion/stage_3_disabled.jpg');
    this.game.load.image('stage_3_open', '/images/beaver/accordion/stage_3_open.jpg');
    this.game.load.image('stage_4_closed', '/images/beaver/accordion/stage_4_closed.jpg');
    this.game.load.image('stage_4_disabled', '/images/beaver/accordion/stage_4_disabled.jpg');
    this.game.load.image('stage_4_open', '/images/beaver/accordion/stage_4_open.jpg');

    //dialog images
    this.game.load.image('dialog_background', '/images/beaver/ui/dialog/dialog_background.png');
    this.game.load.image('info_text_beaver', '/images/beaver/ui/dialog/info_text_beaver.png');

    //buttons
    this.game.load.spritesheet('button_print', '/images/beaver/ui/buttons/print.jpg', 113, 31);
    this.game.load.spritesheet('button_clear', '/images/beaver/ui/buttons/clear.jpg', 113, 31);
    this.game.load.spritesheet('button_cancel', '/images/beaver/ui/buttons/cancel.jpg', 113, 31);
    this.game.load.spritesheet('button_ok', '/images/beaver/ui/buttons/ok.jpg', 113, 31);
    this.game.load.spritesheet('button_checkout', '/images/beaver/ui/buttons/checkout.jpg', 113, 31);

    this.game.load.spritesheet('header_stage_1', '/images/beaver/ui/buttons/header_stage_1.png', 112, 20);
    this.game.load.spritesheet('header_stage_2', '/images/beaver/ui/buttons/header_stage_2.png', 112, 20);
    this.game.load.spritesheet('header_stage_3', '/images/beaver/ui/buttons/header_stage_3.png', 112, 20);
    //cursors
    this.game.load.image('position_product_cursor', '/images/beaver/ui/cursors/position_product.png');

    //icons
    this.game.load.spritesheet('delete_icon', '/images/beaver/ui/icons/delete.png', 58, 58);
    this.game.load.spritesheet('info_icon', '/images/beaver/ui/icons/info.png', 58, 58);
    this.game.load.image('padlock_icon', '/images/beaver/ui/icons/padlock.png');

    this.game.load.image('ui_mockup', '/images/beaver/ui/background.jpg');
    this.game.load.bitmapFont('arimo', '/images/beaver/fonts/arimo.png', '/images/beaver/fonts/arimo.fnt');
    this.game.load.bitmapFont('arimo_bold_16', '/images/beaver/fonts/arimo_bold_16.png', '/images/beaver/fonts/arimo_bold_16.fnt');

    //cabinets 
    this.game.load.image('cabinet_600_1800', '/images/beaver/products/cabinet_600_1800.jpg');
    this.game.load.image('cabinet_900_900', '/images/beaver/products/cabinet_900_900.jpg');
    this.game.load.image('cabinet_900_1800', '/images/beaver/products/cabinet_900_1800.jpg');
    this.game.load.image('cabinet_1800_1005', '/images/beaver/products/cabinet_1800_1005.jpg');

    //wall bays and pillars
    this.game.load.image('wall_bay_450_2400', '/images/beaver/products/wall_bay_450_2400.jpg');
    this.game.load.image('wall_bay_600_2400', '/images/beaver/products/wall_bay_600_2400.jpg');
    this.game.load.image('wall_bay_900_2400', '/images/beaver/products/wall_bay_900_2400.jpg');
    this.game.load.image('pillar_cover_450_2400', '/images/beaver/products/pillar_cover_450_2400.jpg');
    this.game.load.image('pillar_cover_600_2400', '/images/beaver/products/pillar_cover_600_2400.jpg');
    this.game.load.image('pillar', '/images/beaver/objects/pillar.jpg');
    this.game.load.image('door_820_2040', '/images/beaver/objects/door_820_2040.jpg');

}
