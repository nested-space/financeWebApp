//Click on X to delete Todo
$("ul").on("click", ".edit", function(event){
	$(this).parent().fadeOut(500,function(){
		$(this).remove();
		//TODO: Delay activity for 5 seconds, launch prompt to cancel action, which will prevent deletion 
	});
	event.stopPropagation();
});

$("input[type='text']").keypress(function(event){
	if(event.which === 13){
		var todoText = $(this).val();
		//TODO: Add to database. On SUCCESSFULL addition, add to screen, on fail, inform user.
		$(this).val("");
		$("ul").append("<li><span class='edit'><i class='fa fa-edit'></i></span><span class='edit-on-click'> " + todoText + "</span></li>")
	}
});

$(document).ready(function() {
	$('.edit-on-click').click(function() {
	  var $text = $(this),
		$input = $('<input type="text" class="edit-existing" />');

		function confirm(){
			$input.hide();
			//TODO: Add to database. On SUCCESSFULL addition, add to screen, on fail, inform user.
			$text.html($input.val()).show();
		}
	
		function cancel() {
			$input.hide();
			$input.remove();
			$text.show();
		}
	
  
	  $text.hide()
		.after($input);
		
	  $input.val($text.html()).show().focus().focusout(function() {
		  cancel();
	  })

	  $input.on("keydown", function( e ) {
		  if (e.which == 27){	//escape key
			cancel();
		  }
		  if(e.which == 13){	//enter key
			confirm();
		  }
		});
	});

});  



$(".fa-plus").click(function(){
	$("input[class='add-new']").fadeToggle();
});