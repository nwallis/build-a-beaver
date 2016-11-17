Dialog = function(game, engine, container, warnings, reasons){
    Phaser.Group.call(this, game, container);
    this.engine = engine;
}


Dialog.prototype = Object.create(Phaser.Group.prototype);
Dialog.prototype.constructor = Dialog;
