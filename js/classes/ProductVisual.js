const PRODUCT_VISUAL_WIDTH_PX = 190;
const PRODUCT_VISUAL_HEIGHT_PX = 80;
const PRODUCT_BG_WIDTH_PX = 83;
const PRODUCT_BG_HEIGHT_PX = 72;
const PRODUCT_BG_X_PX = 8;
const PRODUCT_BG_Y_PX = 5;
const PRODUCT_IMAGE_MARGIN = 5;
const PRODUCT_TEXT_COLOR_HTML = "#532913"

var ProductVisual = function(game, engine, productData) {

    Phaser.Sprite.call(this, game);

    this.engine = engine;
    this.productData = productData;
    this.container = game.add.group(this);

    this.coloredBackground = game.make.graphics(0, 0);
    this.coloredBackground.beginFill(0xf2ddcf);
    this.coloredBackground.drawRect(0, 0, PRODUCT_VISUAL_WIDTH_PX, PRODUCT_VISUAL_HEIGHT_PX);
    this.container.add(this.coloredBackground);

    this.productBackground = game.make.graphics(PRODUCT_BG_X_PX, PRODUCT_BG_Y_PX);
    this.productBackground.beginFill(0xffffff);
    this.productBackground.drawRect(0, 0, PRODUCT_BG_WIDTH_PX, PRODUCT_BG_HEIGHT_PX);
    this.coloredBackground.addChild(this.productBackground);

    this.productImage = game.make.sprite(0, 0, productData.image);
    this.productImage.anchor.setTo(.5, .5);

    var scaleFactor = Math.min((PRODUCT_BG_WIDTH_PX - PRODUCT_IMAGE_MARGIN) / this.productImage.width, (PRODUCT_BG_HEIGHT_PX - PRODUCT_IMAGE_MARGIN) / this.productImage.height);
    this.productImage.scale.setTo(scaleFactor, scaleFactor);
    this.productImage.x = PRODUCT_BG_WIDTH_PX / 2;
    this.productImage.y = PRODUCT_BG_HEIGHT_PX / 2;
    this.productBackground.addChild(this.productImage);

    this.productText = this.game.add.text(100, 15, this.productData.name + '\n' + this.productData.realWidth + ' x ' + this.productData.realHeight + 'mm' + ((this.productData.price > 0) ? '\n$' + Number(this.productData.price).toFixed(2) : ''), {
        font: "12px Lato",
        fontStyle: "",
        align: "left",
        fontWeight: "300",
        fill: PRODUCT_TEXT_COLOR_HTML,
        stroke: PRODUCT_TEXT_COLOR_HTML,
        strokeThickness: 1
    });
    this.coloredBackground.addChild(this.productText);

    this.inputEnabled = true;
    this.input.useHandCursor = true;
    this.events.onInputDown.add(this.registerMouseDown, this);
}

ProductVisual.prototype = Object.create(Phaser.Sprite.prototype);
ProductVisual.prototype.constructor = ProductVisual;

ProductVisual.prototype.registerMouseDown = function() {

    var numberWordMap = [
        'one',
        'two',
        'three'
    ];


    if (this.productData.itemType == 'cabinet') {
        var availableWallBays = this.engine.findWallBay(this.productData.realWidth, this.productData.additionalCompatibleItems);
        if (!availableWallBays) {
            if (this.productData.additionalCompatibleItems > 0) {
                this.engine.displayInfo("You need " + numberWordMap[this.productData.additionalCompatibleItems] + " vacant " + (this.productData.realWidth / (this.productData.additionalCompatibleItems + 1)) + "mm wall bays next to each other to fit this cabinet");
            } else {
                this.engine.displayInfo("There are no vacant " + this.productData.realWidth + "mm wall bays");
            }
        } else {
            this.engine.startProductPlacement(this.productData, availableWallBays);
        }
    } else {
        this.engine.startProductPlacement(this.productData);
    }
}
