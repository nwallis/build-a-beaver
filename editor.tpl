<script>
    accordionData = {include file="addons/my_changes/beaverPricing.tpl"};
</script>

<script src="js/addons/my_changes/beaver/phaser.min.js"></script>
<script src="js/addons/my_changes/beaver/classes/Item.js"></script>
<script src="js/addons/my_changes/beaver/classes/Counter.js"></script>
<script src="js/addons/my_changes/beaver/classes/ItemContainer.js"></script>
<script src="js/addons/my_changes/beaver/classes/Intersect.js"></script>
<script src="js/addons/my_changes/beaver/classes/ContainerGap.js"></script>
<script src="js/addons/my_changes/beaver/classes/ItemContainerVisual.js"></script>
<script src="js/addons/my_changes/beaver/classes/ItemVisual.js"></script>
<script src="js/addons/my_changes/beaver/classes/ProductVisual.js"></script>
<script src="js/addons/my_changes/beaver/classes/Dialog.js"></script>
<script src="js/addons/my_changes/beaver/classes/Accordion.js"></script>
<script src="js/addons/my_changes/beaver/classes/Slider.js"></script>
<script src="js/addons/my_changes/beaver/classes/AccordionSection.js"></script>
<script src="js/addons/my_changes/beaver/Beaver.js"></script>
<script src="js/addons/my_changes/beaver/Boot.js"></script>

<style type="text/css">
    #design-container {}
    
    .hide-mouse {
        cursor: none !important;
    }
</style>

<script>
    var arranger = new Beaver();

    $(function()
    {

        $("#step-two-options").hide();
        $("#step-three-options").hide();

        $("#step-one-next").click(function()
        {
            arranger.nextStep();
            $("#step-one-options").hide();
            $("#step-two-options").show();
        });

        $("#step-two-next").click(function()
        {
            arranger.nextStep();
            $("#step-two-options").hide();
            $("#step-three-options").show();
        });

        var game = new Phaser.Game(APP_WIDTH_PX, APP_HEIGHT_PX,
            Phaser.AUTO, 'design-container');

        game.state.add('Boot', Boot);
        game.state.add('Beaver', arranger);
        game.state.start('Boot');

    });
</script>
<div id="design-container">
    <form action="/" class="cm-ajax cm-ajax-full-render" method="post">
        <input type="hidden" name="dispatch" value="checkout.add"> 
        <div id="beaver-products">
        </div>
        <input type="submit" value="add to cart" style="position:absolute; left:0; top:0;">
    </form>
</div>
<div style="float:left; padding:20px; width:200px; display:none;">
    <p>Options</p>
    <div id="options">
        <p id="start-full-screen"><a href="#">Enter full screen</a></p>
    </div>
</div>
