const ACCORDION_TITLE_WIDTH_PX = 29;
const ACCORDION_TITLE_HEIGHT_PX = ACCORDION_HEIGHT_PX;

var AccordionSection = function(game){
    Phaser.Sprite.call(this, game);
    this.sections = [];
}

AccordionSection.prototype = Object.create(Phaser.Sprite.prototype);
AccordionSection.prototype.constructor = AccordionSection;

AccordionSection.prototype.addSection = function (sectionName){
    this.sections.push(sectionName);    
};
