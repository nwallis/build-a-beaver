const ACCORDION_TITLE_WIDTH_PX = 29;
const ACCORDION_TITLE_HEIGHT_PX = ACCORDION_HEIGHT_PX;

var AccordionSection = function(game, sectionTitle, accordion){
    Phaser.Sprite.call(this, game);
    this.accordion = accordion;

    var backgroundColor = game.add.graphics(0,0);
    backgroundColor.beginFill(0);
    backgroundColor.drawRect(0,0,10,10);
    this.addChild(backgroundColor);
}

AccordionSection.prototype = Object.create(Phaser.Sprite.prototype);
AccordionSection.prototype.constructor = AccordionSection;

AccordionSection.prototype.update = function(){
}

AccordionSection.prototype.addSection = function (sectionName){
    this.sections.push(sectionName);    
};
