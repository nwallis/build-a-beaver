var Boot = function() {}

Boot.prototype.init = function() {

}

Boot.prototype.preload = function() {
    this.game.load.image('cabinet', 'images/cabinet.jpg');
    this.game.load.image('delete_icon', 'images/icons/delete_icon.png');
    this.game.load.image('small_cabinet', 'images/small_cabinet.jpg');
    this.game.load.image('large_cabinet', 'images/large_cabinet.jpg');
    this.game.load.image('small_cabinet_double_with_bench', 'images/small_cabinet_double_with_bench.jpg');
    this.game.load.image('wall_bay_600_2400', 'images/wall_bay_600_2400.jpg');
    this.game.load.image('pillar', 'images/pillar.jpg');
}

Boot.prototype.create = function() {

    this.game.state.start("Beaver");

}
