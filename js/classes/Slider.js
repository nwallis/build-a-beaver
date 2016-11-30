const BAR_HEIGHT = 10;
const HANDLE_PADDING = 5;
const HORIZONTAL_LINE_STROKE = 4;
const HORIZONTAL_LINE_COLOR = 0;
const HORIZONTAL_LINE_ALPHA = 1;
const VERTICAL_LINE_STROKE = 1;
const VERTICAL_LINE_COLOR = 0;
const VERTICAL_LINE_ALPHA = 1;
const HANDLE_WIDTH = 20;
const HANDLE_HEIGHT = 20;
const HANDLE_COLOR = 0;

var Slider = function(game, engine, sliderWidth, startVal, endVal, increment, displayValue) {

    Phaser.Group.call(this, game);

    //References to the model and engine
    this.engine = engine;
    this.sliderWidth = sliderWidth;
    this.startVal = startVal;
    this.endVal = endVal;
    this.increment = increment;
    this.displayValue = (displayValue) ? displayValue : true;

    this.sliderOutline = this.game.make.graphics(0, 0);
    this.add(this.sliderOutline);

    this.currentValue = startVal;
    this.sliderHandle = this.game.make.graphics(0, 0);
    this.sliderHandle.beginFill(HANDLE_COLOR);
    this.sliderHandle.drawRect(0, 0, HANDLE_WIDTH, HANDLE_HEIGHT);
    this.sliderHandle.inputEnabled = true;
    this.sliderHandle.input.useHandCursor = true;
    this.sliderHandle.input.enableDrag(false, false, false, 255, new Phaser.Rectangle(0, 0, this.sliderWidth, 0));
    this.sliderHandle.events.onDragUpdate.add(this.handleDragged, this);
    this.add(this.sliderHandle);

    if (this.displayValue) {
        this.valueText = this.game.add.text(100, 15, this.currentValue, {
            font: "12px Lato",
            fontStyle: "",
            align: "left",
            fontWeight: "300",
            fill: 0,
            stroke: 0,
            strokeThickness: 1
        });
        this.add(this.valueText);
    }

    this.drawOutline();
}

Slider.prototype = Object.create(Phaser.Group.prototype);
Slider.prototype.constructor = Slider;

Slider.prototype.handleDragged = function() {
   this.valueText.text = this.currentValue = Math.floor(this.startVal + (this.sliderHandle.x / (this.sliderWidth - HANDLE_WIDTH)) * (this.endVal - this.startVal));
}

Slider.prototype.drawOutline = function() {
    this.sliderOutline.clear();
    this.sliderOutline.lineStyle(VERTICAL_LINE_STROKE, VERTICAL_LINE_COLOR, VERTICAL_LINE_ALPHA);
    this.sliderOutline.moveTo(this.sliderWidth, 0);
    this.sliderOutline.lineTo(this.sliderWidth, BAR_HEIGHT);
    this.sliderOutline.moveTo(0, 0);
    this.sliderOutline.lineTo(0, BAR_HEIGHT);

    this.sliderOutline.lineStyle(HORIZONTAL_LINE_STROKE, HORIZONTAL_LINE_COLOR, HORIZONTAL_LINE_ALPHA);
    this.sliderOutline.moveTo(0, BAR_HEIGHT);
    this.sliderOutline.lineTo(this.sliderWidth, BAR_HEIGHT);

}
