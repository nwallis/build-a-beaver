const ITEM_NO_INTERSECT = 0;
const ITEM_LEFT_SIDE = 1;
const ITEM_RIGHT_SIDE = 2;
const ITEM_EXTREMITIES_OUTSIDE = 3;
const ITEM_LEFT_SIDE_EXACT = 4;
const ITEM_RIGHT_SIDE_EXACT = 5;
const ITEM_LEFT_SIDE_IN_RIGHT_MARGIN = 6;
const ITEM_RIGHT_SIDE_IN_LEFT_MARGIN = 7;
const ITEM_SITTING_ON_TOP = 8;
const ITEM_SNAP_DISTANCE = 50;

var Item = function(params) {
    this.realX = params.realX;
    this.realWidth = params.realWidth;
    this.realHeight = params.realHeight;
    this.snapDistance = ITEM_SNAP_DISTANCE;
    this.image = params.image;
    this.id = params.id;
    this.marginRight = params.marginRight || 0;
    this.marginLeft = params.marginLeft || 0;
    this.compatibleItems = params.compatibleItems || [];
    this.collapseTypes = params.collapseTypes || [];
    this.allowedIntersections = params.allowedIntersections || [];
    this.compatibleItemOverlaps = params.compatibleItemOverlaps || [];
    this.itemType = params.itemType || null;
    this.additionalCompatibleItems = params.additionalCompatibleItems || 0;
};

Item.prototype.destroy = function() {
    this.previousItemSnappedToRight = undefined;
    this.previousItemSnappedToLeft = undefined;
    this.previousSnappedParent = undefined;
    this.itemSnappedToRight = undefined;
    this.itemSnappedToLeft = undefined;
    if (this.snappedParent) {
        this.snappedParent.forEach(function(parent) {
            parent.snappedChild = undefined;
        });
    }
    this.snappedParent = undefined;
}

Item.prototype.saveSnapReferences = function() {

    this.previousItemSnappedToRight = this.itemSnappedToRight;
    this.previousItemSnappedToLeft = this.itemSnappedToLeft;
    this.previousSnappedParent = this.snappedParent;

    if (this.snappedParent) {
        this.snappedParent.forEach(function(parent) {
            delete parent.snappedChild;
        });
        delete this.snappedParent;
    }
    if (this.itemSnappedToLeft) {
        delete this.itemSnappedToLeft.itemSnappedToRight;
        delete this.itemSnappedToLeft;
    }
    if (this.itemSnappedToRight) {
        delete this.itemSnappedToRight.itemSnappedToLeft;
        delete this.itemSnappedToRight;
    }
}

Item.prototype.restoreSnapReferences = function() {
    if (this.previousItemSnappedToLeft) {
        this.itemSnappedToLeft = this.previousItemSnappedToLeft;
        this.previousItemSnappedToLeft.itemSnappedToRight = this;
        delete this.previousItemSnappedToLeft;
    }
    if (this.previousItemSnappedToRight) {
        this.itemSnappedToRight = this.previousItemSnappedToRight;
        this.previousItemSnappedToRight.itemSnappedToLeft = this;
        delete this.previousItemSnappedToRight;
    }
    if (this.previousSnappedParent) {
        this.snappedParent = this.previousSnappedParent;
        this.snappedParent.forEach(function(parent) {
            parent.snappedChild = this;
        }, this);
        delete this.previousSnappedParent;
    }
}

Item.prototype.checkCollapse = function(item) {
    if (this.collapseTypes.indexOf(item.id) != -1) return true;
    return false;
}

Item.prototype.measure = function() {
    var left = this.getBounds().left + ((this.itemSnappedToLeft) ? this.marginLeft : 0);
    var right = this.getBounds().right - ((this.itemSnappedToRight) ? this.marginRight : 0);
    return {
        "left": left,
        "right": right,
        "width": right - left
    }
}

Item.prototype.getInnerBounds = function() {
    return {
        "left": this.getBounds().left + this.marginLeft,
        "right": this.getBounds().right - this.marginRight
    }
}

Item.prototype.getInnerSize = function() {
    return {
        "width": this.realWidth
    };
}

Item.prototype.getBounds = function() {
    return {
        "right": this.realX + this.getSize().width,
        "left": this.realX
    }
}

Item.prototype.getSize = function() {
    return {
        "width": this.realWidth + this.marginRight + this.marginLeft
    };
}

Item.prototype.checkIntersect = function(item) {

    var intersections = [];

    if (this.getBounds().left > item.getBounds().left && this.getBounds().left < item.getBounds().right) intersections.push(ITEM_LEFT_SIDE);
    if (this.getBounds().right < item.getBounds().right && this.getBounds().right > item.getBounds().left) intersections.push(ITEM_RIGHT_SIDE);
    if (this.getBounds().left < item.getBounds().left && this.getBounds().right > item.getBounds().right) intersections.push(ITEM_EXTREMITIES_OUTSIDE);
    if (this.getBounds().left == item.getBounds().left) intersections.push(ITEM_LEFT_SIDE_EXACT);
    if (this.getBounds().right == item.getBounds().right) intersections.push(ITEM_RIGHT_SIDE_EXACT);
    if (this.getBounds().left > item.getInnerBounds().right && this.getBounds().left < item.getBounds().right) intersections.push(ITEM_LEFT_SIDE_IN_RIGHT_MARGIN);
    if (this.getBounds().right > item.getBounds().left && this.getBounds().right < item.getInnerBounds().left) intersections.push(ITEM_RIGHT_SIDE_IN_LEFT_MARGIN);
    if (this.getBounds().right == item.getBounds().right && this.getBounds().left == item.getBounds().left) intersections.push(ITEM_SITTING_ON_TOP);
    if (!intersections.length) intersections.push(ITEM_NO_INTERSECT);

    intersections = new Intersect(intersections);
    return intersections;
}

Item.prototype.checkRightSnap = function(testPosition) {
    if (testPosition >= this.getInnerBounds().right - this.snapDistance && testPosition < this.getInnerBounds().right + this.snapDistance)
        return true;
    return false;
}

Item.prototype.checkLeftSnap = function(testPosition) {
    if (testPosition >= this.getInnerBounds().left - this.snapDistance && testPosition <= this.getInnerBounds().left + this.snapDistance)
        return true;
    return false;
}
