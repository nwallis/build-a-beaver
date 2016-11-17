const ACCORDION_WIDTH_PX = 1250;
const ACCORDION_HEIGHT_PX = 89;
const ACCORDION_SPACING_PX = 5;
const ACCORDION_BG_COLOR = 0x6D361C;
const ACCORDION_SECTION_TITLE_BG_COLOR = 0xC27843;
const ACCORDION_X = 10;
const ACCORDION_Y = 480;
const ACCORDION_TITLE_WIDTH_PX = 27;
const ACCORDION_TITLE_HEIGHT_PX = ACCORDION_HEIGHT_PX;
const ACCORDION_CONTENT_BG_COLOR = 0xFFFFFF;
const ACCORDION_MOVE_DURATION = 600;
const ACCORDION_SECTION_CONTENT_MARGIN = ACCORDION_TITLE_WIDTH_PX + 20;
const ACCORDION_SECTION_CONTENT_ITEM_MARGIN = 8;

var Accordion = function(game, engine, container) {

    Phaser.Group.call(this, game, container);

    this.sections = [];
    this.engine = engine;
    this.game = game;
    this.opening = false;

    var backgroundColor = game.add.graphics(0, 0);
    backgroundColor.beginFill(ACCORDION_BG_COLOR);
    backgroundColor.drawRect(0, 0, ACCORDION_WIDTH_PX, ACCORDION_HEIGHT_PX);
    this.add(backgroundColor);

    this.x = ACCORDION_X;
    this.y = ACCORDION_Y;

}

Accordion.prototype = Object.create(Phaser.Group.prototype);
Accordion.prototype.constructor = Accordion;

Accordion.prototype.open = function(section) {
    if (!this.opening) {
        this.opening = true;
        this.moveValue = {
            "amount": 0
        };

        this.oldSection = this.currentSection;
        if (this.oldSection) this.oldSection.close();

        this.currentSection = section;

        this.moveTween = this.game.add.tween(this.moveValue);
        this.moveTween.to({
            amount: 1
        }, ACCORDION_MOVE_DURATION, Phaser.Easing.Quadratic.InOut);
        this.moveTween.onComplete.add(this.moveComplete, this);
        this.moveTween.onUpdateCallback(this.moveUpdate, this);
        this.moveTween.start();
        return true;
    } else {
        return false;
    }
}

Accordion.prototype.openByIndex = function(index) {
    return this.sections[index].open();
}

Accordion.prototype.addSection = function(closedImage, openedImage, disabledImage, stepNumber) {
    var section = new AccordionSection(this.game, closedImage, openedImage, disabledImage, this, stepNumber);
    (this.sections.length > 0) ? this.sections[this.sections.length - 1].connectSection(section): this.add(section);
    this.sections.push(section);
    return section;
};

Accordion.prototype.canvasSpace = function() {
    return ACCORDION_WIDTH_PX - (this.sections.length * ACCORDION_TITLE_WIDTH_PX) - ((this.sections.length - 1) * ACCORDION_SPACING_PX);
}

Accordion.prototype.moveComplete = function() {
    if (this.oldSection) this.oldSection.move(0);
    this.currentSection.move(1);
    this.opening = false;
}

Accordion.prototype.moveUpdate = function() {
    this.currentSection.move(this.moveValue.amount);
    if (this.oldSection) this.oldSection.move(1 - this.moveValue.amount);
}
