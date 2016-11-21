var AccordionSection = function(game, closedImage, openedImage, disabledImage, accordion, stepNumber) {

    Phaser.Group.call(this, game, accordion);

    this.accordion = accordion;
    this.titleContainer = game.add.sprite();
    this.opened = false;
    this.stepNumber = stepNumber;

    //Title BG
    this.titleBackground = game.add.graphics();
    this.titleBackground.beginFill(ACCORDION_SECTION_TITLE_BG_COLOR);
    this.titleBackground.drawRect(0, 0, ACCORDION_TITLE_WIDTH_PX, ACCORDION_TITLE_HEIGHT_PX);
    this.titleContainer.addChild(this.titleBackground);

    this.closedImage = game.add.sprite(0, 0, closedImage);
    this.openedImage = game.add.sprite(0, 0, openedImage);
    this.disabledImage = game.add.sprite(0, 0, disabledImage);
    this.openedImage.visible = false;
    this.disabledImage.visible = false;
    this.titleContainer.addChild(this.closedImage);
    this.titleContainer.addChild(this.openedImage);
    this.titleContainer.addChild(this.disabledImage);

    this.contentContainer = game.add.sprite();
    this.contentContainerMask = game.add.graphics();
    this.itemContainer = game.add.group();
    this.contentContainerBackground = game.add.graphics();
    this.contentContainerMask.x = this.contentContainerBackground.x = ACCORDION_TITLE_WIDTH_PX;
    this.contentContainer.mask = this.contentContainerMask;

    this.contentContainer.addChild(this.contentContainerBackground);
    this.contentContainer.addChild(this.itemContainer);
    this.contentContainer.addChild(this.contentContainerMask);

    //Add title container
    this.add(this.contentContainer);
    this.add(this.titleContainer);

    //Close by default
    this.move(0);

    this.enable();
}

AccordionSection.prototype = Object.create(Phaser.Group.prototype);
AccordionSection.prototype.constructor = AccordionSection;

AccordionSection.prototype.enable = function(){
    this.disabledImage.visible = false;
    this.titleContainer.inputEnabled = true;
    this.titleContainer.input.useHandCursor = true;
    this.titleContainer.events.onInputUp.add(this.changeStep, this);
}

AccordionSection.prototype.disable = function(){
    this.disabledImage.visible = true;
    this.titleContainer.inputEnabled = false;
    this.titleContainer.events.onInputUp.remove(this.changeStep, this);
}

AccordionSection.prototype.changeStep = function(stepNumber){
    this.accordion.engine.changeStep(this.stepNumber);
}

AccordionSection.prototype.addContent = function(element) {

    element.y = (ACCORDION_HEIGHT_PX - PRODUCT_VISUAL_HEIGHT_PX) / 2;
    this.itemContainer.add(element);

    for (var itemCount = 0; itemCount < this.itemContainer.children.length; itemCount++) {
        this.itemContainer.children[itemCount].x = ACCORDION_SECTION_CONTENT_MARGIN + (itemCount * (ACCORDION_SECTION_CONTENT_ITEM_MARGIN + PRODUCT_VISUAL_WIDTH_PX));
    }
}

AccordionSection.prototype.connectSection = function(section) {
    this.connectedChild = section;
    section.connectedParent = this;
    this.add(section);
}

AccordionSection.prototype.open = function() {
    this.openedImage.visible = this.accordion.open(this);
}

AccordionSection.prototype.close = function() {
    this.openedImage.visible = false;
}

AccordionSection.prototype.move = function(amount) {
    var drawDistance = amount * this.accordion.canvasSpace();
    this.contentContainerBackground.clear();
    this.contentContainerBackground.beginFill(ACCORDION_CONTENT_BG_COLOR);
    this.contentContainerBackground.drawRect(0, 0, drawDistance, ACCORDION_TITLE_HEIGHT_PX);
    this.contentContainerMask.clear();
    this.contentContainerMask.beginFill(ACCORDION_CONTENT_BG_COLOR);
    this.contentContainerMask.drawRect(0, 0, drawDistance, ACCORDION_TITLE_HEIGHT_PX);
}

AccordionSection.prototype.update = function() {
    if (this.connectedChild) this.connectedChild.x = ACCORDION_TITLE_WIDTH_PX + ACCORDION_SPACING_PX + this.contentContainerBackground.width;
    Phaser.Group.prototype.update.call(this);
}
