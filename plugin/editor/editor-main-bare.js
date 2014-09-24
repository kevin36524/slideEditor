//Creating a Sandbox;
// The whole toolbar is in full sandbox and not at all exposed globally
// Moreover this is the only file needed
(function(){
var rootNode = document.body, //todo use Query selector
    toolbarTemplate = '<div> <button action="new">Add New</button> <button action="delete">Delete Slide</button> <button action="edit"> Edit Slide</button> <button action="rawedit"> Raw Edit slide </button> </div> <div> <button action="getsourcecode"> Get Source code</button></div> <div> <button id="dragndrop" action="dragndrop"> Drag and Drop the slides</button></div> ', 
    toolbarNode,
    editMode = false,
    forceCloseToolbar = false,

	_renderToolbar = function(){
       toolbarNode = document.createElement('div'),
       toolbarNode.innerHTML = toolbarTemplate;
       toolbarNode.setAttribute('id','toolbar');
       dragDrop.initElement(toolbarNode);
       rootNode.appendChild(toolbarNode);
	   //todo : use attachEvent or addListener here and function 
       toolbarNode.onclick = function(ev){_actionHandler(ev,ev.target.getAttribute('action'));};
    },

    _showHideToolbar = (function() {
       var toolbarHidden = true;
       var retfn = function(){
         if(forceCloseToolbar){
            return;
         }
		 //need to check if cssText or just css
         toolbarNode.style.cssText = 'display: ' + (toolbarHidden?'block;':'none;');
         toolbarHidden = !toolbarHidden;
       };
       return retfn;
    })(),

    _actionHandler = function(ev,action){
      var newSlide,
          buttonNode = ev.target;
          presentSlide = rootNode.querySelector('.present');
          futureSlide = rootNode.querySelector('.future');
      switch(action){
        case 'new':
           newSlide = presentSlide.cloneNode();
           newSlide.innerHTML = '<h1> New slide Title</h1> <div> <p>New slide content </p> </div>',
           presentSlide.parentNode.insertBefore(newSlide,futureSlide); 
           presentSlide.className = presentSlide.className.replace(/present/,'past');
           if(Reveal.overviewIsActive()) {
             Reveal.toggleOverview();
             Reveal.toggleOverview();
           }
           break;
        case 'edit':
		   _editSlide(buttonNode,presentSlide);
           break;
        case 'delete':
           presentSlide.parentNode.removeChild(presentSlide);
		   futureSlide.className = futureSlide.className.replace(/future/,'present');
           break;
        case 'getsourcecode':
           _getSourceCode();
           break;
        case 'rawedit':
           _rawEdit(presentSlide);
           break;
        case 'dragndrop':
           _dragSlides(buttonNode);
           break;
      };

    },

	_editSlide = (function() {
	   var editMode = false;

	   var retFn = function(buttonNode,presentSlide) {
	      buttonNode.innerHTML = editMode?'Edit Slide':'Save Slide';
		  editMode = !editMode;
		  presentSlide.setAttribute('contenteditable',editMode.toString());
	   }

	   return retFn;
	})(),

    _getSourceCode = (function() {

	     var codeNode,taNode;

         var retFn = function() {
            var html = rootNode.querySelector('.slides').innerHTML;

			if (!codeNode) {
			  codeNode = _createCodeNode('fullCode','Code Snippet');
			  taNode = codeNode.querySelector('textarea');
			}

			taNode.value = html;
			codeNode.style.display = 'block';
			_showHideToolbar();
			forceCloseToolbar = true;
         };

         return retFn;
    })(),

    _rawEdit = (function() {

	     var slideEditorNode,taNode;

         var retFn = function(presentSlide) {
            var html = presentSlide.innerHTML;

			if (!slideEditorNode) {
			   slideEditorNode = _createCodeNode('slideEditor','HTML Slide Editor');
			   taNode = slideEditorNode.querySelector('textarea');
			}

			taNode.onkeyup = function(e) {
			   presentSlide.innerHTML = taNode.value;
			}

			taNode.value = html;
			slideEditorNode.style.display = 'block';
			_showHideToolbar();
			forceCloseToolbar = true;
         };

         return retFn;
    })(),


    _dragSlides = (function() {
        var draggedNode,dragMode = false,
        retFn = function(buttonNode) {

		    buttonNode.innerHTML = dragMode ? 'Drag and Drop Slides': 'Done Rearranging' ;
            !dragMode && !Reveal.overviewIsActive() && Reveal.toggleOverview();
            slideNodesArr =  document.getElementsByTagName('section');
            for (i=0; i<slideNodesArr.length; i++){
			  if (!dragMode){ 
                slideNodesArr[i].setAttribute('draggable','true');
                slideNodesArr[i].ondragstart = function(evt) {draggedNode = evt.target;} 
                slideNodesArr[i].ondragover = function(evt) {evt.preventDefault();}
                slideNodesArr[i].ondrop = function(e){
                      e.target.parentNode.insertBefore(draggedNode,e.target); 
                      Reveal.toggleOverview();
                      Reveal.toggleOverview();}
              } else {
                slideNodesArr[i].setAttribute('draggable','false');
                slideNodesArr[i].ondragstart = null; 
                slideNodesArr[i].ondragover = null; 
                slideNodesArr[i].ondrop = null;
		      }
            }

			dragMode = !dragMode;
        }
        return retFn;
    })(),

	_createCodeNode = function(id,header) {
        var codeNode = document.createElement('div'),
		    taNode;
		    codeNode.innerHTML = '<div class="header"> '+header+
			        ' </div><textarea style="height:100px; width:300px; overflow:auto;"></textarea>' + 
					'<button style="display:block;">OK</button>';
			dragDrop.initElement(codeNode);

			taNode = codeNode.querySelector('textarea');

			taNode.onkeydown = function(e) { e.cancelBubble=true; };
			taNode.onmousedown = function(e) { e.cancelBubble=true; };

			codeNode.setAttribute('id',id);
			rootNode.appendChild(codeNode);
			codeNode.className = 'codeDialog';
			codeNode.querySelector('button').onclick = function(e){
			   codeNode.style.display = 'none';
			   forceCloseToolbar = false;
			}
	    return codeNode;
	},

    dragDrop = {
    	initialMouseX: undefined,
    	initialMouseY: undefined,
    	startX: undefined,
    	startY: undefined,
    	draggedObject: undefined,
    	initElement: function (element) {
    		if (typeof element == 'string')
    			element = document.getElementById(element);
    		element.onmousedown = dragDrop.startDragMouse;
    	},
    	startDragMouse: function (e) {
    		dragDrop.startDrag(this);
    		var evt = e || window.event;
    		dragDrop.initialMouseX = evt.clientX;
    		dragDrop.initialMouseY = evt.clientY;
    		document.addEventListener('mousemove',dragDrop.dragMouse,false);
    		document.addEventListener('mouseup',dragDrop.releaseElement,false);
    		return false;
    	},
    	startDrag: function (obj) {
    		if (dragDrop.draggedObject)
    			dragDrop.releaseElement();
    		dragDrop.startX = obj.offsetLeft;
    		dragDrop.startY = obj.offsetTop;
    		dragDrop.draggedObject = obj;
    		obj.className += ' dragged';
    	},
    	dragMouse: function (e) {
    		var evt = e || window.event;
    		var dX = evt.clientX - dragDrop.initialMouseX;
    		var dY = evt.clientY - dragDrop.initialMouseY;
    		dragDrop.setPosition(dX,dY);
    		return false;
    	},
    	setPosition: function (dx,dy) {
    		dragDrop.draggedObject.style.left = dragDrop.startX + dx + 'px';
    		dragDrop.draggedObject.style.top = dragDrop.startY + dy + 'px';
    	},
    	releaseElement: function() {
    		document.removeEventListener('mousemove',dragDrop.dragMouse);
    		document.removeEventListener('mouseup',dragDrop.releaseElement);
    		dragDrop.draggedObject.className = dragDrop.draggedObject.className.replace(/dragged/,'');
    		dragDrop.draggedObject = null;
    	}
    };

       
    rootNode.onkeydown = function(ev){

      if (ev.altKey && ev.which === 84 ){
         _showHideToolbar();
      }
    };
    
    _renderToolbar();
})();
