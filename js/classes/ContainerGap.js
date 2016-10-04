var ContainerGap = function(params){
    this.realX = params.gapStart;
    this.realWidth = params.gapWidth;
}

ContainerGap.prototype = Object.create(Item.prototype);
ContainerGap.prototype.constructor = ContainerGap;
