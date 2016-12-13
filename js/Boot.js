var Boot = function() {}

Boot.prototype.init = function() {

}

Boot.prototype.preload = function() {
//preload preloader graphics
}

Boot.prototype.create = function() {
    this.game.stage.backgroundColor = 0xB5A99D;
    this.game.state.start("Beaver");

}
