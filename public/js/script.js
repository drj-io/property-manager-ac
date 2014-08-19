/**
 * Created by B.Vaughn on 8/14/2014.
 */
$(function() {
    $('body').addClass('loaded');
    $('.propertyListTable').on('click','.deleteList', function(event) {
        event.preventDefault();
        var url = $(this).attr('href');
        var yn = confirm("Are you sure you want to delete this property?");
        if(yn) {
            window.location.href = url;
        }
    });

    $(window).on('unload', function() {
        $('body').addClass('leaving');
    })
})