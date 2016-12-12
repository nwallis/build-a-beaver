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
    console.log("transitioning to ", number);
    this.countObject = {
        "amount": this.currentTotal
    };
    this.targetAmount = number;
    this.countTween = this.game.add.tween(this.countObject);
    this.countTween.to({
        amount: this.targetAmount
    }, 500, Phaser.Easing.Linear.In);
    this.countTween.onUpdateCallback(this.countUpdate, this);
    this.countTween.start();
}

Counter.prototype.increment = function(amount) {

    this.targetAmount += amount;
    this.transitionTo(this.targetAmount);
}

Counter.prototype.decrement = function(amount) {

    this.targetAmount -= amount;
    this.transitionTo(this.targetAmount);
}

Counter.prototype.countUpdate = function() {
    this.currentTotal = this.countObject.amount;
}

Counter.prototype.update = function() {
    function RoundNum(num, length) {
        var number = Math.round(num * Math.pow(10, length)) / Math.pow(10, length);
        return number;
    }

    this.counterText.text = RoundNum(this.countObject.amount,2);
    Phaser.Group.prototype.update.call(this);
}
