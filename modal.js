document.addEventListener("DOMContentLoaded", function() {
    var modal = document.getElementById("modalAcercaDe");
    var btn = document.querySelector('nav ul li a[data-toggle="modal"]');
    var span = document.getElementsByClassName("close")[0];

    if (btn) {
        btn.onclick = function() {
            modal.style.display = "block";
        }
    }

    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
});
