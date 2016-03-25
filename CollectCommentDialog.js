function CollectCommentDialog(opts){
	action = this;
	this.dialogId = "collectCommentDialog";
	this.textareaId = "collectComments";
	this.confirmButton = "collectCommentConfirm";
	this.cancelButton = "collectCommentCancel";
	this.collectCommentForm = "collectCommentForm";
	
	this.layout = null;
	this.callback = opts.callback;
	this.template = opts.template;
	this.data = {
			commentForm:this.collectCommentForm,
			areaId:this.textareaId,
			confirmButtonId:this.confirmButton,
			cancelButtonId:this.cancelButton
	};
	if(opts.data){
		this.data = $.extend({}, opts.data,this.data);
	}
	this.renderer = this.defaultRenderer;
	if(opts.renderer!=null){
		this.renderer = opts.renderer;
	}
	
	this.postRenderer = this.defaultPostRenderer;
	if(opts.postRenderer){
		this.postRenderer = opts.postRenderer;
	}
	
	//workflow
	this.renderer();
	this.postRenderer();
	this.bindActions();

	return false;
}

CollectCommentDialog.prototype.defaultPostRenderer = function(){
	// default implementation does nothing
};

CollectCommentDialog.prototype.defaultRenderer = function(){
	this.createDialog(610, 500, true);
	$.tmpl( this.template, this.data ).appendTo("#" + this.dialogId);
	initHelperTextBehavior(this.getLayout());
	$(".ui-dialog-titlebar").hide();
};

CollectCommentDialog.prototype.bindActions = function(){
	$("#" + this.confirmButton).click(function(){
		$("#commentForm").validate({
			rules:{
				collectComments:"stillHasHelperTextComment"
			},
			errorPlacement:errorPlacement,
			onkeyup: false,
			onblur: false,
			submitHandler:function(){
				try{
					action.callback();
				}catch(e){
					console.log(e);
				}
			}
		});
	});
	
	$("#" + this.cancelButton).click(function(){
		action.closeDialog();
	});
};

CollectCommentDialog.prototype.closeDialog = function(){
	$("#" + action.dialogId).dialog("destroy").remove();
};

CollectCommentDialog.prototype.createDialog = function(width, height, isModal){
	this.layout = $('<div id="' + this.dialogId + '"></div>');
	var dwidth = (($(window).width() - width)/2)+1;
	var dheight = (($(window).height() - height)/2)+50;
	$(this.layout).dialog({
		width: width,
		dialogClass: 'executeAction',
		modal:isModal,
		position:[dwidth,dheight]
	});
};

CollectCommentDialog.prototype.createParameters = function(){
	
};

CollectCommentDialog.prototype.getLayout = function(){
	return this.layout;
};