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

        .printable-content{
            /*display:none;*/
        }

        .pagebreak{
            page-break-before:always;
        }

        #inventory{
            border:0;
            width:100%;
            margin-top:20px;
        }

        #inventory th{
            color:white; 
            background-color:#707070;
            -webkit-print-color-adjust: exact; 
        }

        #inventory tr:nth-child(odd){
            background-color:#d8d8d8;
        }

        #inventory tr{
            background-color:white;
            color:#7D7D7D; 
            font-family:Lato;
            -webkit-print-color-adjust: exact; 
        }

        #inventory td, #inventory th{
            padding:10px 20px;
            text-align:left;
        }

        @media print{
            .printable-content{
                display:block;
            }
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
    <div class="pagebreak"></div>
    <div class="printable-content">
        <table id="inventory" >
            <tbody>
                <tr class="inventory-header">
                    <th>Item Name</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
                <tr class="inventory-row">
                    <td>Wall bay 2400x600</td>
                    <td>2</td>
                    <td>2</td>
                    <td>$500.00</td>
                </tr>
            </tbody>
        </table>   
    </div>
<div style="float:left; padding:20px; width:200px; display:none;">
    <p>Options</p>
    <div id="options">
        <p id="start-full-screen"><a href="#">Enter full screen</a></p>
    </div>
</div>
