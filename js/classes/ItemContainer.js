var ItemContainer = function(params) {
    this.realWidth = params.realWidth;
    this.realHeight = params.realHeight;
    this.children = (params.children) ? params.children : [];
    this.snapDistance = ITEM_SNAP_DISTANCE;
};

ItemContainer.prototype.sortChildren = function() {
    this.children.sort(function(a, b) {
        return a.realX - b.realX;
    });
}

ItemContainer.prototype.deleteItem = function(item) {
    this.children.splice(this.children.indexOf(item), 1);
}

ItemContainer.prototype.addItem = function(item) {

    var gap = this.findGap(item.realWidth);

    if (gap) {
        this.children.push(item);
        return this.moveItem(item, gap.gapStart);
    } else {
        throw new Error("There is no space on the wall for this item");
    }
}

ItemContainer.prototype.getGaps = function() {

    var child;
    var gaps = [];

    if (this.children.length > 0) {

        this.children.forEach(function(item) {
            if (child) {
                var gapWidth = item.getBounds().left - child.getBounds().right
                if (gapWidth > 0) {
                    gaps.push(new ContainerGap({
                        gapWidth: gapWidth,
                        gapStart: child.getBounds().right
                    }));
                }
            }
            child = item;
        });

        //is there a gap between left of wall and first object?
        if (this.children[0].realX > 0) gaps.push(new ContainerGap({
            gapStart: 0,
            gapWidth: this.children[0].getBounds().left
        }));

        //is there a gap between right of wall and last object
        var lastItem = this.children[this.children.length - 1];
        if (lastItem.getBounds().right < this.realWidth) gaps.push(new ContainerGap({
            gapStart: lastItem.getBounds().right,
            gapWidth: this.realWidth - lastItem.getBounds().right
        }));

    }

    return gaps;
}

ItemContainer.prototype.findGap = function(desiredWidth) {

    var foundGap = false;
    var gaps = [];

    if (this.children.length > 0) {
        gaps = this.getGaps();
    } else {
        gaps.push(new ContainerGap({
            gapStart: 0,
            gapWidth: this.realWidth
        }));
    }

    gaps.sort(function(a, b) {
        return a.gapStart - b.gapStart;
    });

    gaps.forEach(function(gap) {
        if (gap.gapWidth >= desiredWidth && !foundGap) foundGap = gap;
    });

    return foundGap;
}

ItemContainer.prototype.moveItem = function(item, xPosition) {

    var moveResult = true;
    var moveTo = 0;
    var snapAmount = 0;
    var isCompatible = false;
    var compatibleChild;

    //It may not have an x position as moveItem is also called by addItem
    var originalX = (item.realX == undefined) ? xPosition : item.realX;

    //'move' the item there to see how it will go
    item.realX = xPosition;

    if (item.getBounds().left >= 0 && item.getBounds().right <= this.realWidth) {
        this.children.forEach(function(child) {
            if (child != item && moveResult) {

                var intersections = item.checkIntersect(child);
                var intersectResult = false;

                if (!intersections.lookFor(ITEM_NO_INTERSECT)) {
                    if (item.compatibleItems.length) {
                        item.compatibleItems.forEach(function(itemID) {
                            if (child.id == itemID) {
                                isCompatible = true;
                                compatibleChild = child;
                            }
                        });
                        intersectResult = isCompatible;
                    } else if (item.compatibleItemOverlaps.length && intersections.lookFor(item.allowedIntersections) && item.compatibleItemOverlaps.indexOf(child.id) != -1) {
                        intersectResult = true;
                    }

                    if (moveResult) moveResult = intersectResult;
                }
            }
        });

    } else {
        moveResult = false;
    }

    console.clear();
    console.log(originalX);
    console.log(moveResult);
    if (moveResult) {

        if (isCompatible) {
            moveTo = compatibleChild.getInnerBounds().left;
        } else {
            if (item.getBounds().right >= this.realWidth - this.snapDistance) snapAmount = this.realWidth - item.getBounds().right;
            this.children.forEach(function(child) {
                if (child != item) {
                    if (child.checkRightSnap(item.getBounds().left)) {
                        if (item.checkCollapse(child) && child.checkCollapse(item)) {
                            snapAmount -= item.getInnerBounds().left - child.getInnerBounds().right;
                        } else {
                            snapAmount -= item.getBounds().left - child.getBounds().right;
                        }
                    } else if (child.checkLeftSnap(item.getBounds().right)) {
                        if (item.checkCollapse(child) && child.checkCollapse(item)) {
                            snapAmount = child.getInnerBounds().left - item.getInnerBounds().right;
                        } else {
                            snapAmount = child.getBounds().left - item.getBounds().right;
                        }
                    }
                }

            });

            if (item.getBounds().left < this.snapDistance) snapAmount = -item.getBounds().left;

            moveTo = item.getBounds().left + snapAmount;
        }

        item.realX = moveTo;

    } else {
        item.realX = originalX;
    }

    this.sortChildren();

    return {
        position: item.realX,
        valid: moveResult
    };

};
