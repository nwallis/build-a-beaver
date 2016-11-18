Counter = function(game, engine) {

    Phaser.Group.call(this, game);

    this.engine = engine;
    this.currentTotal = 0;
    this.counterText = this.game.add.bitmapText(0, 0, 'arimo_bold_16', '', 16);
    this.counterText.tint = 0xFF0000;
    this.add(this.counterText);
    this.transitionTo(0);
}

Counter.prototype = Object.create(Phaser.Group.prototype);
Counter.prototype.constructor = Counter;

Counter.prototype.transitionTo = function(number) {
    this.countObject = {
        "amount": this.currentTotal 
    };
    this.targetAmount = number;
    this.countTween = this.game.add.tween(this.countObject);
    this.countTween.to({
        amount: this.targetAmount
    }, 500, Phaser.Easing.Quadratic.InOut);
    this.countTween.onUpdateCallback(this.countUpdate, this);
    this.countTween.onComplete.add(this.moveComplete, this);
    this.countTween.start();
}

Counter.prototype.increment = function(amount){

    this.targetAmount += amount;
    this.transitionTo(this.targetAmount);
}

Counter.prototype.decrement = function(amount){

    this.targetAmount -= amount;
    this.transitionTo(this.targetAmount);
}

Counter.prototype.moveComplete = function() {}

Counter.prototype.countUpdate = function() {
    this.currentTotal = this.countObject.amount;
}

Counter.prototype.update = function() {
    this.counterText.text = parseFloat(this.countObject.amount, 2).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    Phaser.Group.prototype.update.call(this);
}
