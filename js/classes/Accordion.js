const ACCORDION_WIDTH_PX = 1250;
const ACCORDION_HEIGHT_PX = 90;
const ACCORDION_SPACING_PX = 5;
const ACCORDION_BG_COLOR = 0xC27843;
const ACCORDION_X = 10;
const ACCORDION_Y = 480;

var Accordion = function(game, engine, container) {

    Phaser.Group.call(this, game, container);

    this.sections = [];
    this.engine = engine;

    var backgroundColor = game.add.graphics(0, 0);
    backgroundColor.beginFill(ACCORDION_BG_COLOR);
    backgroundColor.drawRect(0, 0, ACCORDION_WIDTH_PX, ACCORDION_HEIGHT_PX);
    this.add(backgroundColor);

    /*this.add(new ProductVisual(game, this.engine, {
        realWidth: 300,
        realHeight: 2500,
        image: 'pillar',
        id: 6
    }));*/

    this.x = ACCORDION_X;
    this.y = ACCORDION_Y;

    this.addSection("STAGE 1");

}

Accordion.prototype = Object.create(Phaser.Group.prototype);
Accordion.prototype.constructor = Accordion;

Accordion.prototype.addSection = function(sectionTitle) {
    var section = new AccordionSection(this.game, sectionTitle, this);
    this.add(section);
    this.sections.push(section);
    return section;
};
