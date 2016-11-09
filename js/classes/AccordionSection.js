var AccordionSection = function(game, closedImage, openedImage, accordion) {

    Phaser.Group.call(this, game, accordion);

    this.accordion = accordion;
    this.titleContainer = game.add.sprite();
    this.closedImage = closedImage;
    this.openedImage = openedImage;
    this.opened = false;

    //Title BG
    this.titleBackground = game.add.graphics();
    this.titleBackground.beginFill(ACCORDION_SECTION_TITLE_BG_COLOR);
    this.titleBackground.drawRect(0, 0, ACCORDION_TITLE_WIDTH_PX, ACCORDION_TITLE_HEIGHT_PX);
    this.titleContainer.addChild(this.titleBackground);

    this.closedImage = game.add.sprite(0, 0, this.closedImage);
    this.openedImage = game.add.sprite(0, 0, this.openedImage);
    this.openedImage.visible = false;
    this.titleContainer.addChild(this.closedImage);
    this.titleContainer.addChild(this.openedImage);

    this.contentContainer = game.add.sprite();
    this.itemContainer = game.add.group();
    this.contentContainerBackground = game.add.graphics();
    this.contentContainerBackground.x = ACCORDION_TITLE_WIDTH_PX;
    this.contentContainer.addChild(this.contentContainerBackground);
    this.contentContainer.addChild(this.itemContainer);

    //Add title container
    this.add(this.contentContainer);
    this.add(this.titleContainer);

    //Enable input
    this.titleContainer.inputEnabled = true;
    this.titleContainer.input.useHandCursor = true;
    this.titleContainer.events.onInputUp.add(this.open, this);
}

AccordionSection.prototype = Object.create(Phaser.Group.prototype);
AccordionSection.prototype.constructor = AccordionSection;

AccordionSection.prototype.addContent = function(element) {
    element.y = (ACCORDION_HEIGHT_PX - PRODUCT_VISUAL_HEIGHT_PX) / 2;
    this.itemContainer.add(element);
    var remainingCanvas = this.accordion.canvasSpace() - (this.itemContainer.children.length * PRODUCT_VISUAL_WIDTH_PX);
    var itemSpacing = remainingCanvas / (this.itemContainer.length + 1);
    for (var itemCount = 0; itemCount < this.itemContainer.children.length; itemCount++) {
        this.itemContainer.children[itemCount].x = ++itemCount * itemSpacing;
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
    this.contentContainerBackground.clear();
    this.contentContainerBackground.beginFill(ACCORDION_CONTENT_BG_COLOR);
    this.contentContainerBackground.drawRect(0, 0, amount * this.accordion.canvasSpace(), ACCORDION_TITLE_HEIGHT_PX);
}

AccordionSection.prototype.update = function() {
    if (this.connectedChild) this.connectedChild.x = ACCORDION_TITLE_WIDTH_PX + ACCORDION_SPACING_PX + this.contentContainerBackground.width;
    Phaser.Group.prototype.update.call(this);
}
