YUI.add('toolbar',function(Y){
   var rootNode = Y.one('body'),
       toolbarTemplate = '<div id="toolbar"> <div> <button id="new" action="new">Add New</button> <button id="delete" action="delete">Delete Slide</button> <button action="edit"> Edit Slide</button> <button action="rawedit"> Raw Edit slide </button> </div> <div> <button id="showcode" action="showcode"> Show me the code</button></div> <div> <button id="dragndrop" action="dragndrop"> Drag and Drop the slides</button></div> </div>';
       slideTemplate = '<section class="present"> <h1> New slide Title</h1> <div> <p>New slide content </p> </div> </section>';
       toolbarNode = Y.Node.create(toolbarTemplate),
       editMode = 'false',
	   forceCloseToolbar = false,

       render = function(){
          rootNode.append(toolbarNode);
		  toolbarNode.plug(Y.Plugin.Drag);
          _bindUI();
       },

	   _showHideToolbar = (function() {
	      var toolbarHidden = true;
		  var retfn = function(){
		    if(forceCloseToolbar){ 
			   return;
			}
			toolbarNode.setStyle('display',toolbarHidden?'block':'none');
			toolbarHidden = !toolbarHidden;
		  };
		  return retfn;
	   })(),
       
       _bindUI = function(){
	      toolbarNode.on('click',function(ev){_actionHandler(ev,ev.target.getAttribute('action'));});
       },

	   _showCode = (function() {
            var dialog = new Y.Panel({
                   headerContent: '<div> Presentation Code Snippet </div>',
                   bodyContent: '<textarea class="snippet"></textarea>',
                   width      : 500,
                   zIndex     : 6,
                   centered   : true,
                   modal      : true, // uncomment for modal behavior
                   srcNode    : '.snippet',
                   render     : true,
                   visible    : false,
                   plugins    : [Y.Plugin.Drag],
                   buttons: [
                   	{
                   		value  : 'OK',
                   		section: Y.WidgetStdMod.FOOTER,
                   		action : function (e) {
                   			dialog.hide();
                   		}
                   	}
                   ]
             }),

			 retFn = function() {
                var snippet = Y.one('.snippet'),
                    html = rootNode.one('.slides').getHTML();

                snippet.set('value', html);
                dialog.show();
                snippet.select();
		     };

			 return retFn;
	   })(),

	   _dragSlides = function() {
           
           !Reveal.overviewIsActive() && Reveal.toggleOverview();

           Y.all('section').plug(Y.Plugin.Drag);
           var dropArr = Y.all('section').plug(Y.Plugin.Drop).get('nodes');

            for (var i in dropArr) {
               (function(){
                  var k = i;
                  dropArr[k].drop.on('drop:hit',function(e){
                     var slideDragged = e.drag.get('node');
                     dropArr[k].insert(slideDragged,'after');
					 slideDragged.setStyles({top:0, left:0});
					 Reveal.toggleOverview();
					 Reveal.toggleOverview();
                  });
               })();
            }
	   },

	   _rawEdit = (function() {
	        var rawSlideEditorNode = Y.Node.create('<div class="rawSlideEditor" style="z-index=100"> <div class="title">Slide Editor (courtesy <a href="http://codemirror.net/">CODEMIRROR </a>)  </div> <div><textarea style="display:none"> </textarea> </div> <div> <button> DONE </button></div>'),
			    editorTextArea = rawSlideEditorNode.one('textarea');

			    Y.one('.reveal').append(rawSlideEditorNode);

				rawSlideEditorNode.one('button').on('click',function(ev){
				    rawSlideEditorNode.one('.CodeMirror').remove();
					rawSlideEditorNode.setStyle('display','none');
					forceCloseToolbar = false;
				});

				rawSlideEditorNode.plug(Y.Plugin.Drag);

			var retFn = function(presentSlide){
			    var slideContent = presentSlide.getHTML();

					editorTextArea.set('value',slideContent);
				
			    Y.activateSlideEditor(editorTextArea, presentSlide, "#rawEditorNode");
				rawSlideEditorNode.setStyle('display','block');
				forceCloseToolbar = true;
		    };
			return retFn;
		})(),
	       
	   _actionHandler = function(ev,action){
	      var newSlide,
		      buttonNode = ev.target;
		      presentSlide = rootNode.one('div.slides section.present');
	      switch(action){
		    case 'new':
			   newSlide = Y.Node.create(slideTemplate);
			   presentSlide.insert(newSlide,'after');
			   presentSlide.removeClass('present');
			   presentSlide.addClass('past');
			   if(Reveal.overviewIsActive()) {
			     Reveal.toggleOverview();
			     Reveal.toggleOverview();
			   }
			   break;
			case 'edit':
			   buttonNode.setAttribute('action','done');
			   buttonNode.setHTML('Save Slide');
               editMode = true;
			   presentSlide.setAttribute('contenteditable','true');
			   break;
			case 'done':
			   buttonNode.setAttribute('action','edit');
			   buttonNode.setHTML('Edit Slide');
               editMode = false;
			   presentSlide.setAttribute('contenteditable','false');
			   break;
			case 'delete':
			   presentSlide.remove();
			   break;
			case 'showcode':
			   _showCode();
			   break;
		    case 'rawedit':
			   _showHideToolbar();
			   _rawEdit(presentSlide);
			   break;
			case 'dragndrop':
			   _dragSlides();
			   break;
	      };
	   };

	   

   // binding the listener;
   rootNode.on('keydown',function(ev){
      
      if (ev.altKey && ev.button === 84 ){
	     _showHideToolbar();
	  }
   });

   Y.namespace('toolbar').render = render;


}, '3.6.0', {requires:['node','event', 'slideEditor', 'panel', 'dd-plugin', 'dd-drop-plugin']});

YUI().use('toolbar', function(Y){Y.toolbar.render();});
