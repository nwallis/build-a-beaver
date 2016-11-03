const PRODUCT_VISUAL_WIDTH_PX = 176;
const PRODUCT_VISUAL_HEIGHT_PX = 80;
const PRODUCT_BG_WIDTH_PX = 83;
const PRODUCT_BG_HEIGHT_PX = 72;
const PRODUCT_BG_X_PX = 8;
const PRODUCT_BG_Y_PX = 5;
const PRODUCT_IMAGE_MARGIN = 5;

var ProductVisual = function(game, engine, image, productData){

    Phaser.Sprite.call(this,game);

    this.engine = engine;
    this.productData = productData;
    this.container = game.add.group(this);

    this.coloredBackground = game.make.graphics(0,0);
    this.coloredBackground.beginFill(0xf2ddcf);
    this.coloredBackground.drawRect(0, 0, PRODUCT_VISUAL_WIDTH_PX, PRODUCT_VISUAL_HEIGHT_PX);
    this.container.add(this.coloredBackground);

    this.productBackground = game.make.graphics(PRODUCT_BG_X_PX,PRODUCT_BG_Y_PX);
    this.productBackground.beginFill(0xffffff);
    this.productBackground.drawRect(0, 0, PRODUCT_BG_WIDTH_PX, PRODUCT_BG_HEIGHT_PX);
    this.coloredBackground.addChild(this.productBackground);

    this.productImage = game.make.sprite(0,0, image);
    this.productImage.anchor.setTo(.5,.5);

    var scaleFactor = Math.min ((PRODUCT_BG_WIDTH_PX - PRODUCT_IMAGE_MARGIN) / this.productImage.width, (PRODUCT_BG_HEIGHT_PX - PRODUCT_IMAGE_MARGIN) / this.productImage.height);
    this.productImage.scale.setTo(scaleFactor, scaleFactor);
    this.productImage.x = PRODUCT_BG_WIDTH_PX / 2;
    this.productImage.y = PRODUCT_BG_HEIGHT_PX / 2;
    this.productBackground.addChild(this.productImage);

    this.inputEnabled = true;
    this.input.useHandCursor = true;
    this.events.onInputDown.add(this.registerMouseDown, this);
    
    //this.input.enableDrag(false,false);
    //this.events.onDragUpdate.add(this.itemDragUpdate, this);
    //this.updateTransform();

}

ProductVisual.prototype = Object.create(Phaser.Sprite.prototype);
ProductVisual.prototype.constructor = ProductVisual;

ProductVisual.prototype.registerMouseDown = function(){
    this.engine.startProductPlacement(this.productData);
}

ProductVisual.prototype.onStageMove = function(){
    console.log("moving");
}

ProductVisual.prototype.onStageUp = function(){
    console.log("mouse up");
}

ProductVisual.prototype.itemDragUpdate = function() {
    var bounds = this.container.getBounds();
    var wallBounds = this.engine.getDesignBounds();

    if (Phaser.Rectangle.intersects(bounds, wallBounds)){
        console.log("adding item");
    }else{

    }

}

