    var arranger, item1Data, wall, item1, item2, item1CompatibleItem, itemWithMargin, accordion, game, container, accordion;


    (function() {

        arranger = new Beaver();

        game = new Phaser.Game(1270, 630, Phaser.AUTO, 'phaser-container', {
            create: function() {
                container = game.add.sprite(0, 0);
            }
        });
        game.state.add('Boot', Boot);
        game.state.add('Beaver', arranger);
        game.state.start('Boot');


        beforeEach(function() {

            item1Data = {
                realWidth: 600,
                realHeight: 900,
                id: 1,
                itemType: 'cupboards',
                image: 'pillar'
            };

            item1 = new Item(item1Data);

            item2 = new Item({
                realWidth: 450,
                realHeight: 900,
                id: 2,
                itemType: 'cupboards',
                image: 'item2'
            });

            item1CompatibleItem = new Item({
                realWidth: 600,
                realHeight: 900,
                id: 3,
                compatibleItems: [1],
                image: 'item1CompatibleItem'
            });

            itemWithMargin = new Item({
                marginRight: 50,
                marginLeft: 50,
                realWidth: 100,
                realHeight: 900,
                id: 4,
                collapseTypes: [5, 6],
                image: 'itemWithMargin'
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

        describe('Beaver', function() {

            beforeEach(function() {});

            it('should be able to add a wall layer', function() {
                arranger.addWallLayer();
                expect(arranger.wallLayers.length).toBe(1);
            });

            it('should be able to delete a wall layer', function() {
                expect(arranger.wallLayers.length).toBe(1);
                arranger.addWallLayer();
                arranger.addWallLayer();
                arranger.deleteWallLayer();
                expect(arranger.wallLayers.length).toBe(2);
                arranger.deleteWallLayer();
                expect(arranger.wallLayers.length).toBe(1);
            });

            it('should return a reference to the new wall layer when created', function() {
                var newLayer = arranger.addWallLayer();
                expect(arranger.wallLayers[arranger.wallLayers.length - 1]).toBe(newLayer);
            });

            it('should allow items to be added to the current wall layer', function() {
                arranger.deleteWallLayer();
                arranger.deleteWallLayer();
                expect(arranger.wallLayers.length).toBe(0);
                var newLayer = arranger.addWallLayer();
                arranger.addItem(item1Data, 0);
                expect(newLayer.model.children.length).toBe(1);
            });

            it('should be able to count the number of items on a wall layer', function() {
                var currentLayerItemCount = arranger.countItems(0);
                expect(currentLayerItemCount).toBe(0);
            });

            it('should be able to count the number of items of a specific type on a wall layer', function() {
                arranger.addItem(item1Data, 0);
                var itemTypeCount = arranger.countItemsByType('cupboards');
                expect(itemTypeCount).toBe(1);
            });

            it('should be able to count the number of items on the specified layer index', function() {
                var topLayer = arranger.addWallLayer();
                arranger.addItem(item1Data);
                arranger.addItem(item1Data);
                expect(arranger.countItemsByType('cupboards')).toBe(2);
            });

            it('should not allow access to stage 3 without there being some items placed in stage 2', function() {
                //delete all layers
                arranger.deleteWallLayer();
                arranger.deleteWallLayer();

                //simulate stage 2 layers
                arranger.addWallLayer();
                arranger.addWallLayer();

                expect(arranger.changeStep(BEAVER_STEP_3).valid).toBe(false);

            });

            it('should allow changing from step 1 to step 2 with no reasons', function() {
                arranger.deleteWallLayer();
                arranger.deleteWallLayer();
                arranger.addWallLayer();
                var changeResult = arranger.changeStep(BEAVER_STEP_2);
                expect(changeResult.valid).toBe(true);
                expect(changeResult.reasons.length).toBe(0);
            });

            it('should have a warning if moving back a step', function() {
                arranger.addItem(item1Data);
                var changeResult = arranger.changeStep(BEAVER_STEP_2);
                changeResult = arranger.changeStep(BEAVER_STEP_1);
                expect(changeResult.warnings.length).not.toBe(0);
            });

            it('should be a valid move if going back a step, but some reasons should be presented', function() {
                arranger.addItem(item1Data, 0);
                var changeResult = arranger.changeStep(BEAVER_STEP_3);
                arranger.addItem(item1Data, 0);
                changeResult = arranger.changeStep(BEAVER_STEP_1);
                expect(changeResult.valid).toBe(true);
                expect(changeResult.reasons.length).not.toBe(0);
            });

            it('should be able to delete all wall layers above an index', function() {
                arranger.deleteWallLayersAbove(BEAVER_STEP_1);
                expect(arranger.wallLayers.length).toBe(1);
            });

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
                    collapseTypes: [4, 5, 6],
                    image: 'secondItemWithMargin'
                });
                thirdItemWithMargin = new Item({
                    marginRight: 50,
                    marginLeft: 50,
                    realWidth: 100,
                    realHeight: 900,
                    id: 6,
                    collapseTypes: [4, 5, 6],
                    image: 'thirdItemWithMargin'
                });

                wall.addItem(secondItemWithMargin);
                wall.addItem(thirdItemWithMargin);
                wall.moveItem(secondItemWithMargin, 3500);
                wall.moveItem(thirdItemWithMargin, 3900);

            });

            it('should undefine the items snapped to left and right when the item is moved away', function() {

                //snap second item to first
                wall.moveItem(secondItemWithMargin, 3150);
                expect(itemWithMargin.itemSnappedToRight).toBe(secondItemWithMargin);
                expect(secondItemWithMargin.itemSnappedToLeft).toBe(itemWithMargin);

                //snap third item to second
                wall.moveItem(thirdItemWithMargin, 3250);
                expect(secondItemWithMargin.itemSnappedToLeft).toBe(itemWithMargin);
                expect(thirdItemWithMargin.itemSnappedToLeft).toBe(secondItemWithMargin);
                expect(secondItemWithMargin.itemSnappedToRight).toBe(thirdItemWithMargin);

                //move middle item away - should undefine the references
                wall.moveItem(secondItemWithMargin, 8000);
                expect(secondItemWithMargin.itemSnappedToLeft).toBe(undefined);
                expect(itemWithMargin.itemSnappedToRight).toBe(undefined);

                //move middle item back it - it should restore snap
                wall.moveItem(secondItemWithMargin, 3100);
                expect(secondItemWithMargin.itemSnappedToLeft).toBe(itemWithMargin);
                expect(secondItemWithMargin.itemSnappedToRight).toBe(thirdItemWithMargin);
            });

            it('should store a reference in the item for an items snapped to the left and right', function() {
                wall.moveItem(secondItemWithMargin, 3150);
                wall.moveItem(thirdItemWithMargin, 3250);
                expect(secondItemWithMargin.itemSnappedToLeft).toBe(itemWithMargin);
                expect(secondItemWithMargin.itemSnappedToRight).toBe(thirdItemWithMargin);
            });

            it('should collapse the right margin when snapped to a matching product type', function() {
                wall.moveItem(secondItemWithMargin, 3155);
                expect(secondItemWithMargin.getInnerBounds().left).toBe(3150);
            });

            it('should collapse the left margins when snapped to a matching product type', function() {
                wall.moveItem(secondItemWithMargin, 3745);
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
                expect(wall.moveItem(item1CompatibleItem, 3155).position).toBe(3200);
            });
            it('should apply a left margin to snapping and other functions if an item has one', function() {
                expect(wall.moveItem(item1CompatibleItem, 2415).position).toBe(2400);
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

            it('should store a reference of the child in the parent when an item is snapped', function() {
                wall.moveItem(item1CompatibleItem, item1.getBounds().left + ITEM_SNAP_DISTANCE + 10);
                expect(item1.snappedChild).toBe(item1CompatibleItem);
            });

            it('should store a reference in multiple parents when the child spans multiple parents', function() {
                var itemThatNeedsTwoParents

                var parent1 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent1',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var parent2 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent2',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var parent3 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent3',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var multiParentItem = new Item({
                    realWidth: 800,
                    realHeight: 900,
                    id: 300,
                    compatibleItems: [200],
                    additionalCompatibleItems: 1,
                    image: 'multiParentItem'
                });

                wall.addItem(parent1);
                wall.addItem(parent2);
                wall.addItem(parent3);

                var multiStartPos = wall.addItem(multiParentItem).position;
                wall.moveItem(parent1, 6000);
                wall.moveItem(parent2, 6400);
                wall.moveItem(parent3, 6800);

                expect(wall.moveItem(multiParentItem, 6150).position).toBe(6050);
                expect(parent1.snappedChild).toBe(multiParentItem);
                expect(parent2.snappedChild).toBe(multiParentItem);
                expect(multiParentItem.snappedParent[0]).toBe(parent1);
                expect(multiParentItem.snappedParent[1]).toBe(parent2);
            });

            it('should clear the reference in the parent when the child is move elsewhere', function() {
                var itemThatNeedsTwoParents

                var parent1 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent1',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var parent2 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent2',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var parent3 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent3',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var multiParentItem = new Item({
                    realWidth: 800,
                    realHeight: 900,
                    id: 300,
                    compatibleItems: [200],
                    additionalCompatibleItems: 1,
                    image: 'multiParentItem'
                });

                wall.addItem(parent1);
                wall.addItem(parent2);
                wall.addItem(parent3);

                var multiStartPos = wall.addItem(multiParentItem).position;
                wall.moveItem(parent1, 6000);
                wall.moveItem(parent2, 6400);
                wall.moveItem(parent3, 6800);

                expect(wall.moveItem(multiParentItem, 6150).position).toBe(6050);
                expect(parent1.snappedChild).toBe(multiParentItem);
                expect(parent2.snappedChild).toBe(multiParentItem);
                expect(multiParentItem.snappedParent[0]).toBe(parent1);
                expect(multiParentItem.snappedParent[1]).toBe(parent2);
                var moveResult = wall.moveItem(multiParentItem, 8000);
                expect(multiParentItem.snappedParent).toBe(undefined);
                expect(parent1.snappedChild).toBe(undefined);
                expect(parent2.snappedChild).toBe(undefined);
            });

            it('should not allow more than one item to snap to a parent', function() {
                var parent1 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent1',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var parent2 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent2',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var parent3 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent3',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var multiParentItem2 = new Item({
                    realWidth: 800,
                    realHeight: 900,
                    id: 300,
                    compatibleItems: [200],
                    additionalCompatibleItems: 1,
                    image: 'multiParentItem'
                });

                var multiParentItem = new Item({
                    realWidth: 800,
                    realHeight: 900,
                    id: 300,
                    compatibleItems: [200],
                    additionalCompatibleItems: 1,
                    image: 'multiParentItem'
                });

                wall.addItem(parent1);
                wall.addItem(parent2);
                wall.addItem(parent3);

                var multiStartPos = wall.addItem(multiParentItem).position;
                var multiStartPos2 = wall.addItem(multiParentItem2).position;

                wall.moveItem(parent1, 6000);
                wall.moveItem(parent2, 6400);
                wall.moveItem(parent3, 6800);

                expect(wall.moveItem(multiParentItem, 6550).position).toBe(6450);
                expect(parent2.snappedChild).toBe(multiParentItem);
                expect(parent3.snappedChild).toBe(multiParentItem);
                expect(multiParentItem.snappedParent[0]).toBe(parent2);
                expect(multiParentItem.snappedParent[1]).toBe(parent3);
                expect(wall.moveItem(multiParentItem2, 6150).position).toBe(multiStartPos2);
                expect(wall.moveItem(multiParentItem2, parent2.getInnerBounds().left).position).toBe(multiStartPos2);

            });

            it('should snap compatible items inside parent container only when there are enough compatible items', function() {

                var itemThatNeedsTwoParents

                var parent1 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent1',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var parent2 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent2',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var parent3 = new Item({
                    realWidth: 400,
                    realHeight: 900,
                    id: 200,
                    image: 'parent3',
                    marginLeft: 50,
                    marginRight: 50,
                    collapseTypes: [200]
                });

                var multiParentItem = new Item({
                    realWidth: 800,
                    realHeight: 900,
                    id: 300,
                    compatibleItems: [200],
                    additionalCompatibleItems: 1,
                    image: 'multiParentItem'
                });

                wall.addItem(parent1);
                wall.addItem(parent2);
                wall.addItem(parent3);

                var multiStartPos = wall.addItem(multiParentItem).position;
                wall.moveItem(parent1, 6000);
                wall.moveItem(parent2, 6400);
                wall.moveItem(parent3, 6800);

                expect(wall.moveItem(multiParentItem, 7100).position).toBe(multiStartPos);
                expect(wall.moveItem(multiParentItem, 6150).position).toBe(6050);

            });


        });

        describe('Drag testing', function() {

            it('should not allow items to be placed in the no go zones - even if they will fit', function() {
                wall.noGoZones = wall.getGaps();
                var smallItemThatShouldFitButWont = new Item({
                    realWidth: 20
                });
                wall.addItem(smallItemThatShouldFitButWont);
                expect(wall.moveItem(smallItemThatShouldFitButWont, 1360).valid).toBe(false);
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
