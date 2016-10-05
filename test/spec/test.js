(function() {

    'use strict';

    var wall, item1, item2, item1CompatibleItem, itemWithMargin;

    beforeEach(function() {

        item1 = new Item({
            realWidth: 600,
            realHeight: 900,
            id: 1,
            itemType:'cupboards',
            image:'item1'
        });

        item2 = new Item({
            realWidth: 450,
            realHeight: 900,
            id: 2,
            itemType:'cupboards',
            image:'item2'
        });

        item1CompatibleItem = new Item({
            realWidth: 600,
            realHeight: 900,
            id: 3,
            compatibleItems: [1],
            image:'item1CompatibleItem'
        });

        itemWithMargin = new Item({
            marginRight: 50,
            marginLeft: 50,
            realWidth: 100,
            realHeight: 900,
            id: 4,
            collapseTypes: [5, 6],
            image:'itemWithMargin'
        });

        wall = new ItemContainer({
            realWidth: 10000,
            realHeight: 2100,
        });

        wall.addItem(item1);
        wall.addItem(item2);
        wall.addItem(item1CompatibleItem);
        wall.addItem(itemWithMargin);

        wall.moveItem(itemWithMargin, 3000);
        wall.moveItem(item1CompatibleItem, 2200);
        wall.moveItem(item2, 1500);
        wall.moveItem(item1, 700);

    });

    describe('Collation of container children', function() {
        it('should return an array of items that represent the space occupied by particular objects', function() {
            var cupboardGaps = wall.getGaps('cupboards');
            var negativeCupboardGaps = wall.getGaps(undefined, cupboardGaps);
            expect(negativeCupboardGaps.length).toBe(2);
        });

    });

    describe('Overlapping items', function() {

        var pillarPos, newPillarPos;
        var pillar, pillarCover, pillarCoverPos;

        beforeEach(function() {

            pillarCover = new Item({
                marginRight: 15,
                marginLeft: 15,
                realWidth: 450,
                realHeight: 900,
                id: 11,
                compatibleItemOverlaps: [10],
                allowedIntersections: [ITEM_EXTREMITIES_OUTSIDE, ITEM_NO_INTERSECT]
            });

            pillar = new Item({
                marginRight: 0,
                marginLeft: 0,
                realWidth: 300,
                realHeight: 900,
                id: 10,
            });

            pillarPos = wall.addItem(pillar).position;
            newPillarPos = wall.moveItem(pillar, pillarPos + 7000).position;
            pillarCoverPos = wall.addItem(pillarCover).position;
        });

        it('should be allowed when the intersection is an allowed type and the product type is allowed', function() {
            expect(pillarPos).not.toEqual(newPillarPos);
            var desiredCoverPosition = newPillarPos - 100;
            pillarCoverPos = wall.moveItem(pillarCover, desiredCoverPosition).position;
            expect(pillarCoverPos).toEqual(desiredCoverPosition);
        });

    });

    describe('Margin collapsing', function() {

        var secondItemWithMargin, thirdItemWithMargin;

        beforeEach(function() {
            secondItemWithMargin = new Item({
                marginRight: 50,
                marginLeft: 50,
                realWidth: 100,
                realHeight: 900,
                id: 5,
                collapseTypes: [4, 5, 6]
            });
            thirdItemWithMargin = new Item({
                marginRight: 50,
                marginLeft: 50,
                realWidth: 100,
                realHeight: 900,
                id: 6,
                collapseTypes: [4, 5, 6]
            });

            wall.addItem(secondItemWithMargin);
            wall.addItem(thirdItemWithMargin);
            wall.moveItem(secondItemWithMargin, 3500);
            wall.moveItem(thirdItemWithMargin, 3900);

        });

        it('should collapse the right margin when snapped to a matching product type', function() {
            wall.moveItem(secondItemWithMargin, 3205);
            expect(secondItemWithMargin.getInnerBounds().left).toBe(3150);
        });

        it('should collapse the left margins when snapped to a matching product type', function() {
            wall.moveItem(secondItemWithMargin, 3695);
            expect(secondItemWithMargin.getInnerBounds().right).toBe(3950);
        });

        it('should not collapse the margin when product type is not supported', function() {
            var incompatibleCollapseItem = new Item({
                marginRight: 50,
                marginLeft: 50,
                realWidth: 100,
                realHeight: 900,
                id: 'incompatible_item_for_collapsing_neighbours_margin',
                collapseTypes: [444]
            });
            wall.addItem(incompatibleCollapseItem);
            wall.moveItem(incompatibleCollapseItem, 4500);
            wall.moveItem(incompatibleCollapseItem, 4100);
            expect(incompatibleCollapseItem.getSize().width).toBe(200);
        });

        it('should collapse the margins when snapped to matching product type and then expand again', function() {
            wall.moveItem(secondItemWithMargin, 3200);
            wall.moveItem(secondItemWithMargin, 3500);
            expect(secondItemWithMargin.getSize().width).toBe(200);
        });

    });

    describe('Items can have margins', function() {
        it('should apply a right margin to snapping and other functions if an item has one', function() {
            expect(wall.moveItem(item1CompatibleItem, 3205).position).toBe(3200);
        });
        it('should apply a left margin to snapping and other functions if an item has one', function() {
            expect(wall.moveItem(item1CompatibleItem, 2360).position).toBe(2400);
        });
    });

    describe('Intersection type testing', function() {

        it('should be an ITEM_LEFT_SIDE_IN_RIGHT_MARGIN when left of item is in right margin of child', function() {
            item1CompatibleItem.realX = 3155;
            expect(item1CompatibleItem.checkIntersect(itemWithMargin).lookFor(ITEM_LEFT_SIDE_IN_RIGHT_MARGIN)).toBe(true);
        });

        it('should be an ITEM_RIGHT_SIDE_IN_LEFT_MARGIN when right of item is in left margin of child', function() {
            item1CompatibleItem.realX = 2405;
            expect(item1CompatibleItem.checkIntersect(itemWithMargin).lookFor(ITEM_RIGHT_SIDE_IN_LEFT_MARGIN)).toBe(true);
        });

        it('should be an ITEM_LEFT_SIDE intersection when left of the item intersects the child', function() {
            item2.realX = 1250;
            expect(item2.checkIntersect(item1).lookFor(ITEM_LEFT_SIDE)).toBe(true);
        });

        it('should be an ITEM_RIGHT_SIDE intersection when right of the item intersects the child', function() {
            item2.realX = 305;
            expect(item2.checkIntersect(item1).lookFor(ITEM_RIGHT_SIDE)).toBe(true);
        });

        it('should be an ITEM_LEFT_SIDE_EXACT when item left is equal to child left', function() {
            item1.realX = 1500;
            expect(item1.checkIntersect(item2).lookFor(ITEM_LEFT_SIDE_EXACT)).toBe(true);
        });

        it('should be an ITEM_RIGHT_SIDE_EXACT when item right is equal to child right', function() {
            item1.realX = 1350;
            expect(item1.checkIntersect(item2).lookFor(ITEM_RIGHT_SIDE_EXACT)).toBe(true);
        });

        it('should be an ITEM_EXTREMITIES_OUTSIDE intersection when the right is more than the child right and the left is less than child left', function() {
            item1.realX = 1495;
            expect(item1.checkIntersect(item2).lookFor(ITEM_EXTREMITIES_OUTSIDE)).toBe(true);
        });

    });

    describe('Dimension testing', function() {

        it('should include margins in the width of an element', function() {
            expect(itemWithMargin.getSize().width).toBe(200);
        });

        it('should return the correct bounds of an element', function() {
            expect(itemWithMargin.getBounds().right).toBe(3200);
        });

        it('the gap between the wall left and first object should be correct', function() {
            var firstGap = wall.findGap(100);
            expect(firstGap.getBounds().left).toBe(0);
        });

        it('should use margins when next start', function() {
            var anotherItemWithMargin = new Item({
                realWidth: 100,
                marginRight: 50,
                marginLeft: 50
            });
            var addPosition = wall.addItem(anotherItemWithMargin);
            var addPosition = wall.addItem(anotherItemWithMargin);
            expect(addPosition.position).toBe(200);
        });

    });

    describe('Compatible parent container testing', function() {

        it('should return a suitable gap if one exists', function() {
            var potentialGap = wall.findGap(100);
            expect(potentialGap.getBounds().left).toBe(0);
        });

        it('should allow for item margins calculating the gap width', function() {
            var anotherItemWithMargin = new Item({
                realWidth: 100,
                marginRight: 50,
                marginLeft: 50
            });
            var addPosition = wall.addItem(anotherItemWithMargin);
            var potentialGap = wall.findGap(100);
            expect(potentialGap.getSize().width).toBe(500);
        });

        it('should allow item margins when finding a gap', function() {
            var anotherItemWithMargin = new Item({
                realWidth: 100,
                marginRight: 50,
                marginLeft: 50
            });

            var addPosition = wall.addItem(anotherItemWithMargin);
            var potentialGap = wall.findGap(100);
            expect(potentialGap.getBounds().left).toBe(200);
        });

        it('should snap compatible items inside parent container', function() {
            expect(wall.moveItem(item1CompatibleItem, item1.getBounds().left + ITEM_SNAP_DISTANCE + 10).position).toBe(700);
        });

    });

    describe('Drag testing', function() {

        it('should not allow items to be placed in the no go zones - even if they will fit', function(){
           var gaps = wall.getGaps(); 
           var smallItemThatShouldFitButWont = new Item({
                realWidth: 20
           });
           wall.addItem(smallItemThatShouldFitButWont);
           expect(wall.moveItem(smallItemThatShouldFitButWont, 1360, gaps).valid).toBe(false);
        });

        it('should snap all items together when moved away and then back', function() {
            var newWall = new ItemContainer({
                realWidth: 3000,
                realHeight: 2100
            });

            newWall.addItem(new Item({
                realWidth: 600,
                realHeight: 1800,
                image: 'cabinet'
            }));

            newWall.addItem(new Item({
                realWidth: 450,
                realHeight: 450,
                image: 'cabinet'
            }));

            var newItem = new Item({
                realWidth: 600,
                realHeight: 1800
            });

            newWall.addItem(newItem);
            newWall.moveItem(newItem, 2000);
            var moveResult = wall.moveItem(newItem, 1055);
            expect(moveResult.position).toBe(2000);

        });

        it('should re-sort the children after a successful move', function() {
            wall.moveItem(item2, 0);
            expect(wall.children[0]).toBe(item2);
        });

        it('should throw error if there is no space on wall for item', function() {
            var massiveItem = new Item({
                realWidth: 15000,
                realHeight: 600
            });
            expect(function() {
                wall.addItem(massiveItem);
            }).toThrow();
        });

        it('should return the position an item was added if there is room for the object', function() {
            var smallItemThatWillFit = new Item({
                realWidth: 100,
                realHeight: 600
            });
            expect(wall.addItem(smallItemThatWillFit).position).toBe(0);
        });

        it('should allow an object to be positioned in a space that is large enough', function() {
            expect(wall.moveItem(item2, 0).position).toBe(0);
        });

        it('should not move an Item when dragged inside other Items', function() {
            expect(wall.moveItem(item2, 500).position).toBe(1500);
        });

        it('should not move an Item when dragged outside the wall boundaries', function() {
            expect(wall.moveItem(item1, -10).position).toBe(0);
        });

        it('should snap when left hand edge of Item is close to right hand edge of other Item', function() {
            expect(wall.moveItem(item2, 1305).position).toBe(1300);
        });

        it('should snap to the right hand boundary of the wall', function() {
            expect(wall.moveItem(item2, 9545).position).toBe(9550);
        });

        it('should snap when left hand edge of Item is close to right hand edge of other Item', function() {
            expect(wall.moveItem(item2, 245).position).toBe(250);
        });

        it('should prefer to snap to the left hand wall edge when the first item on the wall rather than the object next to it', function() {

            var smallItem = new Item({
                realWidth: 20,
                realHeight: 50
            });
            var smallItem2 = new Item({
                realWidth: 35,
                realHeight: 50
            });
            smallItem.realX = 50;
            smallItem2.realX = 10;

            var smallWall = new ItemContainer({
                realWidth: 100,
                realHeight: 2100,
                children: [smallItem]
            });
            expect(wall.moveItem(smallItem2, 8).position).toBe(0);
        });


    });

})();
