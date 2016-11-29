var ItemContainer = function(params) {
    Item.call(this, params);
    this.children = (params.children) ? params.children : [];
    this.layerCollisions = params.layerCollisions || [];
    this.noGoZones = params.noGoZones || [];
};

ItemContainer.prototype = Object.create(Item.prototype);
ItemContainer.prototype.constructor = ItemContainer;

ItemContainer.prototype.sortChildren = function() {
    this.children.sort(function(a, b) {
        return a.realX - b.realX;
    });
}

ItemContainer.prototype.removeItem = function(item) {
    this.children.splice(this.children.indexOf(item.model), 1);
    item.model.destroy();
}

ItemContainer.prototype.addItemAt = function(item, startPos) {
    this.children.push(item);
    return this.moveItem(item, startPos);
}

ItemContainer.prototype.addItem = function(item) {

    var combinedCollisions = this.layerCollisions.concat(this.children);
    var gap = this.findGap(item.getSize().width, this.children); //combinedCollisions);

    if (gap) {
        this.children.push(item);
        return this.moveItem(item, gap.getBounds().left);
    } else {
        throw new Error("There is no space for this item");
    }
}

ItemContainer.prototype.getChildren = function(itemType) {
    var items = [];
    this.children.forEach(function(item) {
        if (item.itemType == itemType) items.push(item);
    });
    return items;
}

ItemContainer.prototype.getGaps = function(itemType, itemArray) {

    var child;
    var gaps = [];
    var itemType = itemType || false;
    var childrenToIterate = (itemType) ? this.getChildren(itemType) : this.children;
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

ItemContainer.prototype.findGap = function(desiredWidth, itemArray) {

    var foundGap = false;
    var gaps = [];
    var childrenToIterate = (itemArray) ? itemArray : this.children;

    //As items are from a variety of layers, they need to be re-sorted
    childrenToIterate.sort(function(a, b) {
        return a.getBounds().left - b.getBounds().left;
    });

    if (childrenToIterate.length > 0) {
        gaps = this.getGaps(false, childrenToIterate);
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
    //var compatibleChild;
    var collapsedItems = [];

    //It may not have an x position as moveItem is also called by addItem
    var originalX = (item.realX == undefined) ? xPosition : item.realX;

    //'move' the item there to see how it will go
    item.realX = xPosition;

    //save any snap references on item and left and right of item
    item.saveSnapReferences();

    //check snapping
    if (item.getBounds().right >= this.realWidth - this.snapDistance) {
        snapAmount = this.realWidth - item.getBounds().right;
    }

    this.children.forEach(function(child) {
        if (child != item) {
            if (child.checkRightSnap(item.getBounds().left)) {
                if (item.checkCollapse(child) && child.checkCollapse(item)) {
                    snapAmount = -(item.getInnerBounds().left - child.getInnerBounds().right);
                    collapsedItems.push(child);
                } else {
                    snapAmount = -(item.getBounds().left - child.getBounds().right);
                }
                item.itemSnappedToLeft = child;
                child.itemSnappedToRight = item;
            }

            if (child.checkLeftSnap(item.getBounds().right)) {
                if (item.checkCollapse(child) && child.checkCollapse(item)) {
                    snapAmount = child.getInnerBounds().left - item.getInnerBounds().right;
                    collapsedItems.push(child);
                } else {
                    snapAmount = child.getBounds().left - item.getBounds().right;
                }
                item.itemSnappedToRight = child;
                child.itemSnappedToLeft = item;
            }
        }
    });

    if (item.getBounds().left < this.snapDistance) {
        snapAmount = -item.getBounds().left;
    }

    //Move the item based on the snap amount
    item.realX = moveTo = item.getBounds().left + snapAmount;
    snapAmount = 0;

    //Now check if its a valid move
    if (item.getBounds().left >= 0 && item.getBounds().right <= this.realWidth) {

        var combinedCollisions = this.layerCollisions.concat(this.children);
        combinedCollisions.forEach(function(child) {
            if (child != item) {

                var intersections = item.checkIntersect(child);
                var intersectResult = false;

                if (!intersections.lookFor(ITEM_NO_INTERSECT)) {
                    if (collapsedItems.length == 0 || collapsedItems.indexOf(child) == -1) {

                        if (item.compatibleItems.length) {

                            item.compatibleItems.forEach(function(itemID) {
                                if (child.id == itemID && child.id != item.id && intersections.lookFor(ITEM_LEFT_SIDE)) {

                                    isCompatible = true;

                                    if (!child.snappedChild) {
                                        var nextChild = child;
                                        var compatibleParents = [child];
                                        for (var additionalCount = 0; additionalCount < item.additionalCompatibleItems; additionalCount++) {
                                            if (nextChild) {
                                                nextChild = nextChild.itemSnappedToRight;
                                                compatibleParents.push(nextChild);
                                            }

                                            if (!nextChild || nextChild.id != itemID || nextChild.snappedChild) isCompatible = false;
                                        }
                                    } else if (child.snappedChild != item) {
                                        isCompatible = false;
                                    }

                                    if (isCompatible) {
                                        snapAmount = -(item.getBounds().left - child.getInnerBounds().left);
                                        //Delete snap references
                                        if (item.snappedParent) {
                                            item.snappedParent.forEach(function(parent) {
                                                delete parent.snappedChild;
                                            });
                                        }
                                        //Setup new references
                                        item.snappedParent = compatibleParents;
                                        compatibleParents.forEach(function(parent) {
                                            parent.snappedChild = item;
                                        });
                                    } else {
                                        //Delete snap references
                                        if (item.snappedParent) {
                                            item.snappedParent.forEach(function(parent) {
                                                delete parent.snappedChild;
                                            });
                                        }
                                    }
                                }
                            });

                            intersectResult = isCompatible;

                        } else if (item.compatibleItemOverlaps.length && intersections.lookFor(item.allowedIntersections) && item.compatibleItemOverlaps.indexOf(child.id) != -1) {
                            intersectResult = true;
                        }

                        if (moveResult) moveResult = intersectResult;
                    }

                }
            }
        });

    } else {
        moveResult = false;
    }

    //Move the item based on the snap amount - more snapping may have been applied (snapping into parents etc...)
    item.realX = item.getBounds().left + snapAmount;

    //there are some places a cupboard just shouldn't go - used for cross layer comparison
    if (this.noGoZones) {
        this.noGoZones.forEach(function(zone) {
            var zoneIntersect = item.checkIntersect(zone);
            if (moveResult && !zoneIntersect.lookFor(ITEM_NO_INTERSECT)) moveResult = false;
        });
    }

    if (!moveResult) {

        //Put item back where it was
        item.realX = originalX;

        //put all snap references back if move is not valid
        item.restoreSnapReferences();
    }

    this.sortChildren();

    return {
        position: item.realX,
        valid: moveResult
    };

};
