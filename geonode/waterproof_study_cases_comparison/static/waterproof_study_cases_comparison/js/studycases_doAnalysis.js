/**
 * @file Create form validations
 * @author Luis Saltron
 * @version 1.0
 */
$(function () {
    try {
        var casesSelected = JSON.parse(localStorage.analysisCases);
    } catch (error) {
        var casesSelected = [];
    }
    //Validate if there selected cases
    if (casesSelected.length <= 0) {
        Swal.fire({
            title: "Wow!",
            text: "Message!",
            type: "success"
        }).then(function () {
            window.location = "../";
        });
    }
    else{ //there area cases selected
        console.log("hola");
    }



});