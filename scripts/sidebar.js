document.addEventListener('DOMContentLoaded',function(){
    const sidebarToggles = document.querySelectorAll('.js-sidebar-toggle');
    for (const sidebarToggle of sidebarToggles) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.js-sidebar').classList.toggle('u-show');
        })
    }
});