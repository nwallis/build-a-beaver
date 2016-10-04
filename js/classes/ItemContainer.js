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
    var gap = this.findGap(item.getSize().width);

    if (gap) {
        this.children.push(item);
        return this.moveItem(item, gap.getBounds().left);
    } else {
        throw new Error("There is no space on the wall for this item");
    }
}

ItemContainer.prototype.getChildren = function(itemType){
    var items = [];
    this.children.forEach(function(item){
        if (item.itemType == itemType) items.push(item);
    });
    return items;
}

ItemContainer.prototype.getGaps = function(itemType, itemArray) {

    var child;
    var gaps = [];
    var itemType = itemType || false;
    var childrenToIterate = (itemType) ? this.getChildren(itemType) : this.children;
    //array of passed items overrides all
    childrenToIterate = itemArray || childrenToIterate;

    if (childrenToIterate.length > 0) {

        childrenToIterate.forEach(function(item) {
            if (child) {
                var gapWidth = item.getBounds().left - child.getBounds().right
                if (gapWidth > 0) {
                    gaps.push(new ContainerGap({
                        realWidth: gapWidth,
                        realX: child.getBounds().right
                    }));
                }
            }
            child = item;
        });

        //is there a gap between left of wall and first object?
        if (childrenToIterate[0].realX > 0) gaps.push(new ContainerGap({
            realX: 0,
            realWidth: childrenToIterate[0].getBounds().left
        }));

        //is there a gap between right of wall and last object
        var lastItem = childrenToIterate[childrenToIterate.length - 1];
        if (lastItem.getBounds().right < this.realWidth) gaps.push(new ContainerGap({
            realX: lastItem.getBounds().right,
            realWidth: this.realWidth - lastItem.getBounds().right
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
            realX: 0,
            realWidth: this.realWidth
        }));
    }

    gaps.sort(function(a, b) {
        return a.getBounds().left - b.getBounds().left;
    });

    gaps.forEach(function(gap) {
        if (gap.realWidth >= desiredWidth && !foundGap) foundGap = gap;
    });

    return foundGap;
}

ItemContainer.prototype.moveItem = function(item, xPosition) {

    var moveResult = true;
    var moveTo = 0;
    var snapAmount = 0;
    var isCompatible = false;
    var compatibleChild;
    var collapse = false;

    //It may not have an x position as moveItem is also called by addItem
    var originalX = (item.realX == undefined) ? xPosition : item.realX;

    //'move' the item there to see how it will go
    item.realX = xPosition;

    if (item.getBounds().right >= this.realWidth - this.snapDistance) {
        snapAmount = this.realWidth - item.getBounds().right;
    }

    this.children.forEach(function(child) {
        if (child != item) {
            if (child.checkRightSnap(item.getBounds().left)) {
                if (item.checkCollapse(child) && child.checkCollapse(item)) {
                    snapAmount -= item.getInnerBounds().left - child.getInnerBounds().right;
                    collapse = true;
                } else {
                    snapAmount -= item.getBounds().left - child.getBounds().right;
                }
            } else if (child.checkLeftSnap(item.getBounds().right)) {
                if (item.checkCollapse(child) && child.checkCollapse(item)) {
                    snapAmount = child.getInnerBounds().left - item.getInnerBounds().right;
                    collapse = true;
                } else {
                    snapAmount = child.getBounds().left - item.getBounds().right;
                }
            }
        }
    });

    if (item.getBounds().left < this.snapDistance) {
        snapAmount = -item.getBounds().left;
    }

    item.realX = moveTo = item.getBounds().left + snapAmount;

    if (item.getBounds().left >= 0 && item.getBounds().right <= this.realWidth) {
        this.children.forEach(function(child) {
            if (child != item) {

                var intersections = item.checkIntersect(child);
                var intersectResult = false;

                if (!intersections.lookFor(ITEM_NO_INTERSECT)) {
                    if (item.compatibleItems.length) {
                        item.compatibleItems.forEach(function(itemID) {
                            if (child.id == itemID && child.id != item.id) {
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

    if (moveResult || collapse) {
        if (isCompatible) {
            moveTo = compatibleChild.getInnerBounds().left;
        }
        item.realX = moveTo;
        //not quite handly collapsing elegantly yet, make it a valid move in case collapse was triggered
        moveResult = true;
    } else {
        item.realX = originalX;
    }

    this.sortChildren();
    return {
        position: item.realX,
        valid: moveResult
    };

};
